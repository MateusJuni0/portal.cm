# Blueprint de Automação n8n — Cozinha Grande

**Versão:** 1.0 (para Geração de Workflows por LLM)
**Autor:** Manus AI
**Data:** 05 de Fevereiro de 2026

## 0. Instruções Gerais para a LLM Geradora de Workflows

Este documento serve como um **Blueprint técnico detalhado** para a criação automatizada de workflows no n8n. A LLM deve interpretar cada seção e construir os workflows nó a nó, garantindo a fidelidade às especificações. É crucial que a LLM:

1.  **Crie Workflows Separados**: Cada `WF-XX` descrito abaixo corresponde a um workflow n8n independente.
2.  **Nomeie os Workflows e Nós**: Utilize os nomes fornecidos para os workflows e para cada nó dentro deles. Isso é vital para a clareza e manutenção.
3.  **Configure Gatilhos (Triggers)**: Configure o nó de gatilho conforme especificado (Webhook, Cron, Internal Webhook).
4.  **Implemente a Lógica de Negócio**: Transcreva a lógica descrita em cada nó para as configurações apropriadas (expressões, código JavaScript em nós Function, queries SQL em nós PostgreSQL).
5.  **Gerencie Credenciais**: Assuma que as credenciais para PostgreSQL, APIs externas (WhatsApp, Sendgrid, Twilio, OpenAI/Gemini, OCR) e PrintNode serão configuradas separadamente no n8n. Use placeholders como `{{ $connections.postgresql.database }}` ou `{{ $connections.openAiApi.apiKey }}`.
6.  **Tratamento de Erros**: Implemente o tratamento de erros conforme descrito, utilizando nós `Try/Catch` e roteamento para o `WF-10 Reprocessador de DLQ` quando aplicável.
7.  **Idempotência**: Garanta que a lógica de idempotência seja estritamente seguida, especialmente no `WF-01 Gateway de Pedidos`.
8.  **Variáveis de Ambiente**: Utilize variáveis de ambiente do n8n (`{{ $env.VAR_NAME }}`) para configurações como `N8N_ENCRYPTION_KEY`, `WEBHOOK_URL`, etc.
9.  **Comentários**: Adicione comentários descritivos aos nós complexos ou a trechos de código para explicar a lógica.
10. **Conexões**: Certifique-se de que as conexões entre os nós estejam corretas, seguindo o fluxo lógico.

---

## 1. Workflows Detalhados

### 1.1 WF-01 Gateway de Pedidos

*   **Objetivo**: Receber pedidos de diversas fontes, normalizar o payload e garantir a idempotência para evitar duplicidade.
*   **Gatilho**: `Webhook`
    *   **Método**: `POST`
    *   **Path**: `/webhook/order-gateway`
    *   **Response Mode**: `Respond to Webhook`
    *   **HTTP Response Code**: `200` (padrão para sucesso)
    *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'success', orderId: $json.orderId || 'processing' }) }}`
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` (já configurado acima)
        *   **Saída**: Payload bruto do pedido.

    2.  **Nó**: `Function`
        *   **Nome**: `Normalizar Payload`
        *   **Código JavaScript**: (A LLM deve gerar o código para normalizar diferentes estruturas de payload de entrada para um formato unificado. Exemplo de estrutura unificada esperada: `{ externalOrderId: '...', sourceChannel: '...', rawPayload: {...}, items: [...] }`. Deve incluir a geração de `idempotency_key` (ex: hash do `externalOrderId` + `sourceChannel`) e `request_hash` (hash do `rawPayload` completo)).
        *   **Exemplo de Lógica**: `const normalizedPayload = { externalOrderId: $json.body.id, sourceChannel: 'ecommerce', rawPayload: $json.body, idempotency_key: crypto.createHash('sha256').update($json.body.id + 'ecommerce').digest('hex'), request_hash: crypto.createHash('sha256').update(JSON.stringify($json.body)).digest('hex') }; return [{ json: normalizedPayload }];` (A LLM deve usar a biblioteca `crypto` ou similar para hashing).

    3.  **Nó**: `PostgreSQL`
        *   **Nome**: `Verificar Idempotência`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `SELECT order_id, status FROM idempotency_keys WHERE idempotency_key = $1;`
        *   **Parâmetros**: `{{ $json.idempotency_key }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    4.  **Nó**: `IF`
        *   **Nome**: `Pedido Já Processado?`
        *   **Condição**: `{{ $json.query.length > 0 }}` (Verifica se a query de idempotência retornou algum resultado)
        *   **Branch TRUE (Pedido Existente)**:
            *   **Nó**: `Set`
                *   **Nome**: `Definir Ordem Existente`
                *   **Modo**: `Merge`
                *   **Campos**: `orderId: {{ $json.query[0].order_id }}`, `status: {{ $json.query[0].status }}`
            *   **Nó**: `Respond to Webhook` (finaliza o workflow, retornando o ID do pedido existente)
                *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'already_processed', orderId: $json.orderId, currentStatus: $json.status }) }}`
        *   **Branch FALSE (Novo Pedido)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Idempotency Key`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO idempotency_keys (idempotency_key, request_hash, status) VALUES ($1, $2, 'CREATED') RETURNING id;`
                *   **Parâmetros**: `{{ $json.idempotency_key }}`, `{{ $json.request_hash }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `Webhook`
                *   **Nome**: `Chamar WF-02 Core Create Order`
                *   **Operação**: `Call Webhook`
                *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/core-create-order` (A LLM deve construir esta URL usando variáveis de ambiente ou uma URL interna do n8n)
                *   **Método**: `POST`
                *   **Body**: `{{ JSON.stringify($json) }}` (Passa o payload normalizado e a idempotency key)
                *   **Wait for Response**: `true`
            *   **Nó**: `Respond to Webhook` (finaliza o workflow, retornando o ID do novo pedido)
                *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'processing', orderId: $json.orderId }) }}`

### 1.2 WF-02 Criação de Ordem Core

*   **Objetivo**: Persistir o pedido e seus itens no banco de dados, aplicar regras de negócio e disparar eventos para workflows subsequentes.
*   **Gatilho**: `Webhook`
    *   **Método**: `POST`
    *   **Path**: `/webhook/core-create-order`
    *   **Response Mode**: `Respond to Webhook`
    *   **HTTP Response Code**: `200`
    *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'order_created', orderId: $json.orderId }) }}`
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` (já configurado acima)
        *   **Saída**: Payload normalizado do pedido (incluindo `idempotency_key`, `request_hash`, `rawPayload`, `items`).

    2.  **Nó**: `Function`
        *   **Nome**: `Aplicar Regras de Negócio e Prioridade`
        *   **Código JavaScript**: (A LLM deve gerar código para:
            *   Extrair dados do payload para campos da tabela `production_orders`.
            *   Consultar `automation_policies` (via nó PostgreSQL anterior ou dentro da Function se a política for simples) para definir `priority` e `sla_minutes`.
            *   Gerar um `orderId` (UUID) se ainda não existir.
            *   Preparar o objeto para inserção na tabela `production_orders` e uma lista de objetos para `production_order_items`.
        *   **Exemplo de Lógica**: `const orderData = { id: $json.orderId || uuidv4(), external_order_id: $json.externalOrderId, source_channel: $json.sourceChannel, idempotency_key: $json.idempotency_key, status: 'RECEIVED', priority: 'NORMAL', sla_minutes: 45, raw_payload: $json.rawPayload, customer_name: $json.customer.name, ... }; const itemsData = $json.items.map(item => ({ order_id: orderData.id, ...item })); return [{ json: { order: orderData, items: itemsData } }];` (A LLM deve usar `uuidv4()` ou similar).

    3.  **Nó**: `PostgreSQL`
        *   **Nome**: `Inserir Ordem Principal`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO production_orders (id, external_order_id, source_channel, idempotency_key, status, priority, sla_minutes, raw_payload, customer_name, customer_phone, delivery_type, delivery_address, notes, scheduled_for, production_window, total_items, total_amount, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id;`
        *   **Parâmetros**: `{{ $json.order.id }}`, `{{ $json.order.external_order_id }}`, ... (mapear todos os campos)
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    4.  **Nó**: `PostgreSQL`
        *   **Nome**: `Inserir Itens do Pedido`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO production_order_items (id, order_id, sku, product_name, category, sector, quantity, unit, unit_price, cost_price, notes, modifiers, meta) VALUES {{ $json.items.map(item => `(uuid_generate_v4(), '${item.order_id}', '${item.sku}', '${item.product_name}', '${item.category}', '${item.sector}', ${item.quantity}, '${item.unit}', ${item.unit_price}, ${item.cost_price || 0}, '${item.notes || ''}', '${JSON.stringify(item.modifiers || [])}', '${JSON.stringify(item.meta || {})}')`).join(',') }};` (A LLM deve gerar a query de inserção em massa ou usar um nó de inserção em lote se disponível no n8n).
        *   **Parâmetros**: (mapear todos os campos dos itens)
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    5.  **Nó**: `PostgreSQL`
        *   **Nome**: `Registrar Evento CREATED`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'CREATED', $2, 'system');`
        *   **Parâmetros**: `{{ $json.order.id }}`, `{{ JSON.stringify($json.order) }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    6.  **Nó**: `PostgreSQL`
        *   **Nome**: `Atualizar Idempotency Key com Order ID`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `UPDATE idempotency_keys SET order_id = $1, status = 'PROCESSED' WHERE idempotency_key = $2;`
        *   **Parâmetros**: `{{ $json.order.id }}`, `{{ $json.idempotency_key }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    7.  **Nó**: `Webhook`
        *   **Nome**: `Chamar WF-03 Construtor de Tickets`
        *   **Operação**: `Call Webhook`
        *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/ticket-builder`
        *   **Método**: `POST`
        *   **Body**: `{{ JSON.stringify({ orderId: $json.order.id }) }}`
        *   **Wait for Response**: `false` (pode ser assíncrono)

    8.  **Nó**: `Webhook`
        *   **Nome**: `Chamar WF-05 Notificações (Pedido Recebido)`
        *   **Operação**: `Call Webhook`
        *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/notifications`
        *   **Método**: `POST`
        *   **Body**: `{{ JSON.stringify({ orderId: $json.order.id, notificationType: 'ORDER_RECEIVED' }) }}`
        *   **Wait for Response**: `false`

    9.  **Nó**: `Webhook`
        *   **Nome**: `Chamar WF-08 Sincronização de Inventário (Dedução)`
        *   **Operação**: `Call Webhook`
        *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/inventory-sync`
        *   **Método**: `POST`
        *   **Body**: `{{ JSON.stringify({ orderId: $json.order.id, action: 'DEDUCT' }) }}`
        *   **Wait for Response**: `false`

### 1.3 WF-03 Construtor de Tickets

*   **Objetivo**: Agrupar itens do pedido por setor e gerar o conteúdo formatado dos tickets de impressão.
*   **Gatilho**: `Webhook`
    *   **Método**: `POST`
    *   **Path**: `/webhook/ticket-builder`
    *   **Response Mode**: `Respond to Webhook`
    *   **HTTP Response Code**: `200`
    *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'tickets_generated', orderId: $json.orderId }) }}`
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` (já configurado acima)
        *   **Saída**: `{ orderId: '...' }`

    2.  **Nó**: `PostgreSQL`
        *   **Nome**: `Obter Itens do Pedido por Setor`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `SELECT sector, product_name, quantity, unit, notes FROM production_order_items WHERE order_id = $1 ORDER BY sector;`
        *   **Parâmetros**: `{{ $json.orderId }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    3.  **Nó**: `Function`
        *   **Nome**: `Agrupar Itens e Formatar Tickets`
        *   **Código JavaScript**: (A LLM deve gerar código para:
            *   Agrupar os itens retornados pela query SQL por `sector`.
            *   Para cada setor, formatar o conteúdo do ticket usando um template (pode ser um template hardcoded ou buscar de `message_templates` via outro nó PostgreSQL).
            *   O output deve ser uma lista de objetos, cada um representando um ticket a ser impresso, contendo `orderId`, `sector`, `content` (o texto formatado do ticket), `copies` (padrão 1).
        *   **Exemplo de Lógica**: `const itemsBySector = {}; for (const item of $json.query) { if (!itemsBySector[item.sector]) itemsBySector[item.sector] = []; itemsBySector[item.sector].push(item); } const tickets = []; for (const sector in itemsBySector) { let content = 
### Ticket para ${sector}

Pedido ID: ${$json.orderId}

`; for (const item of itemsBySector[sector]) { content += `- ${item.quantity} ${item.unit} ${item.product_name} (${item.notes || ''})
`; } tickets.push({ orderId: $json.orderId, sector: sector, content: content, copies: 1 }); } return [{ json: { tickets: tickets } }];`

    4.  **Nó**: `Split In Batches`
        *   **Nome**: `Dividir Tickets por Setor`
        *   **Batch Size**: `1` (processar um ticket por vez)
        *   **Field to Split On**: `tickets`

    5.  **Nó**: `PostgreSQL`
        *   **Nome**: `Inserir Print Ticket`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO print_tickets (order_id, sector, content, copies, status) VALUES ($1, $2, $3, $4, 'CREATED') RETURNING id;`
        *   **Parâmetros**: `{{ $json.orderId }}`, `{{ $json.sector }}`, `{{ $json.content }}`, `{{ $json.copies }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    6.  **Nó**: `Webhook`
        *   **Nome**: `Chamar WF-04 Despachante de Impressão`
        *   **Operação**: `Call Webhook`
        *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/print-dispatcher`
        *   **Método**: `POST`
        *   **Body**: `{{ JSON.stringify({ printTicketId: $json.id }) }}`
        *   **Wait for Response**: `false`

### 1.4 WF-04 Despachante de Impressão

*   **Objetivo**: Enviar tickets de impressão para as impressoras corretas, com tratamento de falhas e fallback.
*   **Gatilho**: `Webhook`
    *   **Método**: `POST`
    *   **Path**: `/webhook/print-dispatcher`
    *   **Response Mode**: `Respond to Webhook`
    *   **HTTP Response Code**: `200`
    *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'print_job_dispatched', printTicketId: $json.printTicketId }) }}`
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` (já configurado acima)
        *   **Saída**: `{ printTicketId: '...' }`

    2.  **Nó**: `PostgreSQL`
        *   **Nome**: `Obter Detalhes do Print Ticket e Impressora`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `SELECT pt.id, pt.order_id, pt.sector, pt.content, pt.copies, sp.printer_id, p.provider, p.provider_config FROM print_tickets pt JOIN sector_printers sp ON pt.sector = sp.sector_code JOIN printers p ON sp.printer_id = p.id WHERE pt.id = $1 AND sp.is_active = TRUE AND p.is_active = TRUE;`
        *   **Parâmetros**: `{{ $json.printTicketId }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    3.  **Nó**: `IF`
        *   **Nome**: `Impressora Encontrada?`
        *   **Condição**: `{{ $json.query.length > 0 }}`
        *   **Branch TRUE (Impressora Encontrada)**:
            *   **Nó**: `Switch`
                *   **Nome**: `Escolher Provedor de Impressão`
                *   **Expression**: `{{ $json.query[0].provider }}`
                *   **Case 1**: `PRINTNODE`
                    *   **Nó**: `HTTP Request`
                        *   **Nome**: `Enviar para PrintNode`
                        *   **Método**: `POST`
                        *   **URL**: `https://api.printnode.com/printjobs`
                        *   **Headers**: `Authorization: Basic {{ $connections.printNodeApi.apiKey }}` (Base64 encoded)
                        *   **Body**: `{{ JSON.stringify({ printerId: $json.query[0].printer_id, title: 'Ticket Pedido ' + $json.query[0].order_id, contentType: 'raw_base64', content: Buffer.from($json.query[0].content).toString('base64'), qty: $json.query[0].copies }) }}`
                        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Registrar Falha de Impressão` e `Chamar WF-10 DLQ`.
                    *   **Nó**: `PostgreSQL`
                        *   **Nome**: `Atualizar Status Ticket (PRINTED)`
                        *   **Operação**: `Execute SQL`
                        *   **Query SQL**: `UPDATE print_tickets SET status = 'PRINTED', updated_at = now() WHERE id = $1;`
                        *   **Parâmetros**: `{{ $json.query[0].id }}`
                        *   **Credenciais**: `{{ $connections.postgresql.database }}`
                    *   **Nó**: `PostgreSQL`
                        *   **Nome**: `Registrar Evento TICKET_PRINTED`
                        *   **Operação**: `Execute SQL`
                        *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'TICKET_PRINTED', $2, 'system');`
                        *   **Parâmetros**: `{{ $json.query[0].order_id }}`, `{{ JSON.stringify({ printTicketId: $json.query[0].id, sector: $json.query[0].sector }) }}`
                        *   **Credenciais**: `{{ $connections.postgresql.database }}`
                *   **Case 2**: `CUPS` (ou App Local)
                    *   **Nó**: `HTTP Request`
                        *   **Nome**: `Enviar para CUPS/App Local`
                        *   **Método**: `POST`
                        *   **URL**: `{{ $json.query[0].provider_config.url }}` (URL do CUPS ou App Local)
                        *   **Body**: `{{ JSON.stringify({ content: $json.query[0].content, copies: $json.query[0].copies, printerId: $json.query[0].printer_id }) }}`
                        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Registrar Falha de Impressão` e `Chamar WF-10 DLQ`.
                    *   **Nó**: `PostgreSQL`
                        *   **Nome**: `Atualizar Status Ticket (PRINTED)`
                        *   **Operação**: `Execute SQL`
                        *   **Query SQL**: `UPDATE print_tickets SET status = 'PRINTED', updated_at = now() WHERE id = $1;`
                        *   **Parâmetros**: `{{ $json.query[0].id }}`
                        *   **Credenciais**: `{{ $connections.postgresql.database }}`
                    *   **Nó**: `PostgreSQL`
                        *   **Nome**: `Registrar Evento TICKET_PRINTED`
                        *   **Operação**: `Execute SQL`
                        *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'TICKET_PRINTED', $2, 'system');`
                        *   **Parâmetros**: `{{ $json.query[0].order_id }}`, `{{ JSON.stringify({ printTicketId: $json.query[0].id, sector: $json.query[0].sector }) }}`
                        *   **Credenciais**: `{{ $connections.postgresql.database }}`
        *   **Branch FALSE (Impressora Não Encontrada)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Falha Impressora Não Encontrada`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `UPDATE print_tickets SET status = 'FAILED', error_message = 'Impressora não encontrada ou inativa para o setor ' || $2 || '.', updated_at = now() WHERE id = $1;`
                *   **Parâmetros**: `{{ $json.printTicketId }}`, `{{ $json.query[0].sector }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Evento PRINT_FAILED (Impressora)`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'PRINT_FAILED', $2, 'system');`
                *   **Parâmetros**: `{{ $json.query[0].order_id }}`, `{{ JSON.stringify({ printTicketId: $json.printTicketId, error: 'Impressora não encontrada ou inativa' }) }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `Webhook`
                *   **Nome**: `Chamar WF-05 Notificações (Alerta Falha Impressão)`
                *   **Operação**: `Call Webhook`
                *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/notifications`
                *   **Método**: `POST`
                *   **Body**: `{{ JSON.stringify({ orderId: $json.query[0].order_id, notificationType: 'PRINT_FAILED', details: 'Impressora não encontrada ou inativa para o setor ' + $json.query[0].sector }) }}`
                *   **Wait for Response**: `false`

    4.  **Nó**: `Try/Catch` (para tratamento de erros de impressão)
        *   **Nome**: `Tratamento de Erro de Impressão`
        *   **Branch Catch (Erro)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Falha de Impressão`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `UPDATE print_tickets SET status = 'FAILED', error_message = $2, updated_at = now() WHERE id = $1;`
                *   **Parâmetros**: `{{ $json.query[0].id }}`, `{{ $error.message }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Evento PRINT_FAILED`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'PRINT_FAILED', $2, 'system');`
                *   **Parâmetros**: `{{ $json.query[0].order_id }}`, `{{ JSON.stringify({ printTicketId: $json.query[0].id, error: $error.message }) }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `Webhook`
                *   **Nome**: `Chamar WF-10 DLQ (Falha Impressão)`
                *   **Operação**: `Call Webhook`
                *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/dlq-processor`
                *   **Método**: `POST`
                *   **Body**: `{{ JSON.stringify({ workflowName: 'WF-04 Despachante de Impressão', stepName: 'Enviar para Provedor', payload: $json, errorMessage: $error.message }) }}`
                *   **Wait for Response**: `false`

### 1.5 WF-05 Notificações

*   **Objetivo**: Enviar notificações internas e externas via múltiplos canais (WhatsApp, Email, SMS).
*   **Gatilho**: `Webhook`
    *   **Método**: `POST`
    *   **Path**: `/webhook/notifications`
    *   **Response Mode**: `Respond to Webhook`
    *   **HTTP Response Code**: `200`
    *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'notification_dispatched', orderId: $json.orderId, notificationType: $json.notificationType }) }}`
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` (já configurado acima)
        *   **Saída**: `{ orderId: '...', notificationType: '...', details: '...' }`

    2.  **Nó**: `PostgreSQL`
        *   **Nome**: `Obter Dados do Pedido e Template`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `SELECT po.customer_phone, po.customer_name, po.status, po.total_amount, mt.template, mt.type as channel_type FROM production_orders po JOIN message_templates mt ON mt.code = $2 WHERE po.id = $1 AND mt.is_active = TRUE;`
        *   **Parâmetros**: `{{ $json.orderId }}`, `{{ $json.notificationType }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    3.  **Nó**: `IF`
        *   **Nome**: `Template e Dados Encontrados?`
        *   **Condição**: `{{ $json.query.length > 0 }}`
        *   **Branch TRUE (Dados Encontrados)**:
            *   **Nó**: `Function`
                *   **Nome**: `Personalizar Mensagem`
                *   **Código JavaScript**: (A LLM deve gerar código para preencher o `template` com os dados do pedido. Ex: `const message = $json.query[0].template.replace('{{customer_name}}', $json.query[0].customer_name).replace('{{order_id}}', $json.orderId).replace('{{status}}', $json.query[0].status); return [{ json: { ...$json.query[0], message: message } }];`)
            *   **Nó**: `Switch`
                *   **Nome**: `Escolher Canal de Notificação`
                *   **Expression**: `{{ $json.channel_type }}`
                *   **Case 1**: `WHATSAPP`
                    *   **Nó**: `HTTP Request`
                        *   **Nome**: `Enviar WhatsApp (Meta API)`
                        *   **Método**: `POST`
                        *   **URL**: `https://graph.facebook.com/v18.0/{{ $connections.whatsappApi.phoneNumberId }}/messages`
                        *   **Headers**: `Authorization: Bearer {{ $connections.whatsappApi.accessToken }}`
                        *   **Body**: `{{ JSON.stringify({ messaging_product: 'whatsapp', to: $json.customer_phone, type: 'text', text: { body: $json.message } }) }}`
                        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Registrar Falha Notificação` e `Chamar WF-10 DLQ`.
                    *   **Nó**: `PostgreSQL`
                        *   **Nome**: `Registrar Notificação Enviada (WhatsApp)`
                        *   **Operação**: `Execute SQL`
                        *   **Query SQL**: `INSERT INTO sent_notifications (order_id, channel, recipient, template_code, payload, status) VALUES ($1, 'WHATSAPP', $2, $3, $4, 'SENT');`
                        *   **Parâmetros**: `{{ $json.orderId }}`, `{{ $json.customer_phone }}`, `{{ $json.notificationType }}`, `{{ JSON.stringify({ message: $json.message }) }}`
                        *   **Credenciais**: `{{ $connections.postgresql.database }}`
                *   **Case 2**: `EMAIL`
                    *   **Nó**: `SendGrid` (ou nó de Email genérico)
                        *   **Nome**: `Enviar Email (Sendgrid)`
                        *   **Operação**: `Send Email`
                        *   **To**: `{{ $json.customer_email }}` (Assumir que o email do cliente está disponível no payload ou pode ser obtido)
                        *   **From**: `no-reply@cozinhagrande.com`
                        *   **Subject**: `Atualização do seu Pedido #{{ $json.orderId }}`
                        *   **HTML Body**: `{{ $json.message }}`
                        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Registrar Falha Notificação` e `Chamar WF-10 DLQ`.
                    *   **Nó**: `PostgreSQL`
                        *   **Nome**: `Registrar Notificação Enviada (Email)`
                        *   **Operação**: `Execute SQL`
                        *   **Query SQL**: `INSERT INTO sent_notifications (order_id, channel, recipient, template_code, payload, status) VALUES ($1, 'EMAIL', $2, $3, $4, 'SENT');`
                        *   **Parâmetros**: `{{ $json.orderId }}`, `{{ $json.customer_email }}`, `{{ $json.notificationType }}`, `{{ JSON.stringify({ message: $json.message }) }}`
                        *   **Credenciais**: `{{ $connections.postgresql.database }}`
                *   **Case 3**: `SMS`
                    *   **Nó**: `Twilio` (ou nó de SMS genérico)
                        *   **Nome**: `Enviar SMS (Twilio)`
                        *   **Operação**: `Send SMS`
                        *   **To**: `{{ $json.customer_phone }}`
                        *   **From**: `{{ $connections.twilio.phoneNumber }}`
                        *   **Body**: `{{ $json.message }}`
                        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Registrar Falha Notificação` e `Chamar WF-10 DLQ`.
                    *   **Nó**: `PostgreSQL`
                        *   **Nome**: `Registrar Notificação Enviada (SMS)`
                        *   **Operação**: `Execute SQL`
                        *   **Query SQL**: `INSERT INTO sent_notifications (order_id, channel, recipient, template_code, payload, status) VALUES ($1, 'SMS', $2, $3, $4, 'SENT');`
                        *   **Parâmetros**: `{{ $json.orderId }}`, `{{ $json.customer_phone }}`, `{{ $json.notificationType }}`, `{{ JSON.stringify({ message: $json.message }) }}`
                        *   **Credenciais**: `{{ $connections.postgresql.database }}`
        *   **Branch FALSE (Template/Dados Não Encontrados)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Falha Template Não Encontrado`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO workflow_failures (workflow_name, step_name, payload, error_message, status) VALUES ('WF-05 Notificações', 'Obter Dados do Pedido e Template', $1, 'Template ou dados do pedido não encontrados para notificação ' || $2 || '.', 'PENDING');`
                *   **Parâmetros**: `{{ JSON.stringify($json) }}`, `{{ $json.notificationType }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`

    4.  **Nó**: `Try/Catch` (para tratamento de erros de envio de notificação)
        *   **Nome**: `Tratamento de Erro de Notificação`
        *   **Branch Catch (Erro)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Falha Notificação`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO workflow_failures (workflow_name, step_name, payload, error_message, status) VALUES ('WF-05 Notificações', 'Enviar Notificação', $1, $2, 'PENDING');`
                *   **Parâmetros**: `{{ JSON.stringify($json) }}`, `{{ $error.message }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Evento NOTIFICATION_FAILED`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'NOTIFICATION_FAILED', $2, 'system');`
                *   **Parâmetros**: `{{ $json.orderId }}`, `{{ JSON.stringify({ notificationType: $json.notificationType, error: $error.message }) }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `Webhook`
                *   **Nome**: `Chamar WF-10 DLQ (Falha Notificação)`
                *   **Operação**: `Call Webhook`
                *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/dlq-processor`
                *   **Método**: `POST`
                *   **Body**: `{{ JSON.stringify({ workflowName: 'WF-05 Notificações', stepName: 'Enviar Notificação', payload: $json, errorMessage: $error.message }) }}`
                *   **Wait for Response**: `false`

### 1.6 WF-06 API de Atualização de Status

*   **Objetivo**: Receber atualizações de status do painel frontend e persistir no banco de dados, registrando eventos de auditoria.
*   **Gatilho**: `Webhook`
    *   **Método**: `POST`
    *   **Path**: `/webhook/update-order-status`
    *   **Response Mode**: `Respond to Webhook`
    *   **HTTP Response Code**: `200`
    *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'status_updated', orderId: $json.body.orderId, newStatus: $json.body.newStatus }) }}`
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` (já configurado acima)
        *   **Saída**: `{ body: { orderId: '...', newStatus: '...', updatedBy: '...' } }`

    2.  **Nó**: `PostgreSQL`
        *   **Nome**: `Atualizar Status do Pedido`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `UPDATE production_orders SET status = $2, last_status_change_at = now(), updated_at = now() WHERE id = $1;`
        *   **Parâmetros**: `{{ $json.body.orderId }}`, `{{ $json.body.newStatus }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    3.  **Nó**: `PostgreSQL`
        *   **Nome**: `Registrar Evento STATUS_CHANGED`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'STATUS_CHANGED', $2, $3);`
        *   **Parâmetros**: `{{ $json.body.orderId }}`, `{{ JSON.stringify({ oldStatus: $json.oldStatus, newStatus: $json.body.newStatus }) }}`, `{{ $json.body.updatedBy || 'frontend_user' }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    4.  **Nó**: `IF`
        *   **Nome**: `Notificar Cliente sobre Status?`
        *   **Condição**: `{{ ['READY', 'IN_EXPEDITION', 'DELIVERED'].includes($json.body.newStatus) }}` (Exemplo: notificar apenas para status relevantes para o cliente)
        *   **Branch TRUE (Notificar)**:
            *   **Nó**: `Webhook`
                *   **Nome**: `Chamar WF-05 Notificações (Status)`
                *   **Operação**: `Call Webhook`
                *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/notifications`
                *   **Método**: `POST`
                *   **Body**: `{{ JSON.stringify({ orderId: $json.body.orderId, notificationType: 'STATUS_CHANGED', details: 'Novo status: ' + $json.body.newStatus }) }}`
                *   **Wait for Response**: `false`

### 1.7 WF-07 Alterações e Cancelamentos de Pedidos

*   **Objetivo**: Processar alterações e cancelamentos de pedidos, ajustando estoque e registrando eventos.
*   **Gatilho**: `Webhook`
    *   **Método**: `POST`
    *   **Path**: `/webhook/amend-cancel-order`
    *   **Response Mode**: `Respond to Webhook`
    *   **HTTP Response Code**: `200`
    *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'order_amended', orderId: $json.body.orderId, action: $json.body.action }) }}`
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` (já configurado acima)
        *   **Saída**: `{ body: { orderId: '...', action: 'AMEND'/'CANCEL', changes: {...}, updatedBy: '...' } }`

    2.  **Nó**: `IF`
        *   **Nome**: `Ação: Alterar ou Cancelar?`
        *   **Condição**: `{{ $json.body.action === 'CANCEL' }}`
        *   **Branch TRUE (Cancelar)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Atualizar Status para CANCELED`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `UPDATE production_orders SET status = 'CANCELED', last_status_change_at = now(), updated_at = now() WHERE id = $1;`
                *   **Parâmetros**: `{{ $json.body.orderId }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Evento CANCELED`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'CANCELED', $2, $3);`
                *   **Parâmetros**: `{{ $json.body.orderId }}`, `{{ JSON.stringify($json.body) }}`, `{{ $json.body.updatedBy || 'frontend_user' }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `Webhook`
                *   **Nome**: `Chamar WF-08 Sincronização de Inventário (Reverter)`
                *   **Operação**: `Call Webhook`
                *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/inventory-sync`
                *   **Método**: `POST`
                *   **Body**: `{{ JSON.stringify({ orderId: $json.body.orderId, action: 'REVERT_CANCEL' }) }}`
                *   **Wait for Response**: `false`
            *   **Nó**: `Webhook`
                *   **Nome**: `Chamar WF-05 Notificações (Cancelamento)`
                *   **Operação**: `Call Webhook`
                *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/notifications`
                *   **Método**: `POST`
                *   **Body**: `{{ JSON.stringify({ orderId: $json.body.orderId, notificationType: 'CANCELED' }) }}`
                *   **Wait for Response**: `false`
        *   **Branch FALSE (Alterar)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Atualizar Pedido (Alteração)`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `UPDATE production_orders SET notes = $2, updated_at = now() WHERE id = $1;` (Exemplo: atualizar notas. A LLM deve expandir para atualizar outros campos conforme `changes` no payload).
                *   **Parâmetros**: `{{ $json.body.orderId }}`, `{{ $json.body.changes.notes }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Evento UPDATED`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'UPDATED', $2, $3);`
                *   **Parâmetros**: `{{ $json.body.orderId }}`, `{{ JSON.stringify($json.body.changes) }}`, `{{ $json.body.updatedBy || 'frontend_user' }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `Webhook`
                *   **Nome**: `Chamar WF-08 Sincronização de Inventário (Ajuste)`
                *   **Operação**: `Call Webhook`
                *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/inventory-sync`
                *   **Método**: `POST`
                *   **Body**: `{{ JSON.stringify({ orderId: $json.body.orderId, action: 'ADJUST', changes: $json.body.changes }) }}`
                *   **Wait for Response**: `false`

### 1.8 WF-08 Sincronização de Inventário

*   **Objetivo**: Gerenciar a dedução, adição e ajuste de estoque com base em pedidos e outras ações.
*   **Gatilho**: `Webhook`
    *   **Método**: `POST`
    *   **Path**: `/webhook/inventory-sync`
    *   **Response Mode**: `Respond to Webhook`
    *   **HTTP Response Code**: `200`
    *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'inventory_synced', orderId: $json.orderId, action: $json.action }) }}`
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` (já configurado acima)
        *   **Saída**: `{ orderId: '...', action: 'DEDUCT'/'REVERT_CANCEL'/'ADJUST', changes: {...} }`

    2.  **Nó**: `IF`
        *   **Nome**: `Ação de Inventário?`
        *   **Condição**: `{{ $json.action === 'DEDUCT' }}`
        *   **Branch TRUE (DEDUCT)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Obter Itens do Pedido e Receitas`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `SELECT poi.sku as product_sku, poi.quantity as product_quantity, ri.inventory_item_id, ri.quantity as ingredient_quantity, ri.unit FROM production_order_items poi JOIN recipes r ON poi.sku = r.product_sku JOIN recipe_ingredients ri ON r.id = ri.recipe_id WHERE poi.order_id = $1;`
                *   **Parâmetros**: `{{ $json.orderId }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `Function`
                *   **Nome**: `Calcular Deduções de Estoque`
                *   **Código JavaScript**: (A LLM deve gerar código para calcular a quantidade total de cada ingrediente a ser deduzida, considerando a quantidade do produto final e a receita. O output deve ser uma lista de `{ inventoryItemId: '...', quantityToDeduct: '...' }`)
            *   **Nó**: `Split In Batches`
                *   **Nome**: `Dividir Deduções`
                *   **Batch Size**: `1`
                *   **Field to Split On**: (o campo gerado pela Function anterior)
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Atualizar Estoque (Dedução)`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `UPDATE inventory_items SET current_stock = current_stock - $2, updated_at = now() WHERE id = $1 RETURNING current_stock, min_stock, par_level;`
                *   **Parâmetros**: `{{ $json.inventoryItemId }}`, `{{ $json.quantityToDeduct }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Movimento INVENTORY_DEDUCTED`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO inventory_movements (inventory_item_id, movement_type, quantity, unit, source_document, created_by) VALUES ($1, 'OUT', $2, $3, $4, 'system');`
                *   **Parâmetros**: `{{ $json.inventoryItemId }}`, `{{ $json.quantityToDeduct }}`, `{{ $json.unit }}`, `{{ $json.orderId }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `IF`
                *   **Nome**: `Estoque Abaixo do Mínimo/Par?`
                *   **Condição**: `{{ $json.current_stock <= $json.min_stock || $json.current_stock <= $json.par_level }}`
                *   **Branch TRUE (Alerta/PO)**:
                    *   **Nó**: `Webhook`
                        *   **Nome**: `Chamar WF-14 Automação de Compras (Alerta/PO)`
                        *   **Operação**: `Call Webhook`
                        *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/purchase-automation`
                        *   **Método**: `POST`
                        *   **Body**: `{{ JSON.stringify({ inventoryItemId: $json.inventoryItemId, currentStock: $json.current_stock, minStock: $json.min_stock, parLevel: $json.par_level }) }}`
                        *   **Wait for Response**: `false`
        *   **Branch FALSE (REVERT_CANCEL)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Obter Itens do Pedido e Receitas (Cancelamento)`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `SELECT poi.sku as product_sku, poi.quantity as product_quantity, ri.inventory_item_id, ri.quantity as ingredient_quantity, ri.unit FROM production_order_items poi JOIN recipes r ON poi.sku = r.product_sku JOIN recipe_ingredients ri ON r.id = ri.recipe_id WHERE poi.order_id = $1;`
                *   **Parâmetros**: `{{ $json.orderId }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `Function`
                *   **Nome**: `Calcular Reversões de Estoque`
                *   **Código JavaScript**: (Similar à dedução, mas para adicionar de volta ao estoque. Output: `{ inventoryItemId: '...', quantityToAdd: '...' }`)
            *   **Nó**: `Split In Batches`
                *   **Nome**: `Dividir Reversões`
                *   **Batch Size**: `1`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Atualizar Estoque (Reversão)`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `UPDATE inventory_items SET current_stock = current_stock + $2, updated_at = now() WHERE id = $1;`
                *   **Parâmetros**: `{{ $json.inventoryItemId }}`, `{{ $json.quantityToAdd }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Movimento INVENTORY_ADJUSTED (Cancelamento)`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO inventory_movements (inventory_item_id, movement_type, quantity, unit, source_document, created_by) VALUES ($1, 'IN', $2, $3, $4, 'system');`
                *   **Parâmetros**: `{{ $json.inventoryItemId }}`, `{{ $json.quantityToAdd }}`, `{{ $json.unit }}`, `{{ $json.orderId }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
        *   **Branch ELSE (ADJUST)**:
            *   **Nó**: `Function`
                *   **Nome**: `Processar Ajuste Manual`
                *   **Código JavaScript**: (A LLM deve gerar código para processar ajustes arbitrários passados no `changes` payload. Output: `{ inventoryItemId: '...', quantityChange: '...', movementType: '...' }`)
            *   **Nó**: `Split In Batches`
                *   **Nome**: `Dividir Ajustes`
                *   **Batch Size**: `1`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Atualizar Estoque (Ajuste)`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `UPDATE inventory_items SET current_stock = current_stock + $2, updated_at = now() WHERE id = $1;`
                *   **Parâmetros**: `{{ $json.inventoryItemId }}`, `{{ $json.quantityChange }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Movimento INVENTORY_ADJUSTED (Manual)`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO inventory_movements (inventory_item_id, movement_type, quantity, unit, source_document, created_by) VALUES ($1, $2, $3, $4, $5, 'system');`
                *   **Parâmetros**: `{{ $json.inventoryItemId }}`, `{{ $json.movementType }}`, `{{ $json.quantityChange }}`, `{{ $json.unit }}`, `{{ $json.orderId || 'manual_adjustment' }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`

### 1.9 WF-09 Monitor de SLA e Pedidos Parados

*   **Objetivo**: Monitorar pedidos que se aproximam ou excedem o SLA e identificar pedidos parados.
*   **Gatilho**: `Cron`
    *   **Intervalo**: `Every 5 minutes`
*   **Nós e Configuração**:

    1.  **Nó**: `Cron` (já configurado acima)

    2.  **Nó**: `PostgreSQL`
        *   **Nome**: `Obter Pedidos para Monitorar SLA`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `SELECT id, status, created_at, last_status_change_at, sla_minutes, customer_phone, customer_name FROM production_orders WHERE status IN ('RECEIVED', 'PENDING_APPROVAL', 'APPROVED', 'IN_PRODUCTION') AND (EXTRACT(EPOCH FROM (now() - last_status_change_at)) / 60) > (sla_minutes * 0.8) AND (EXTRACT(EPOCH FROM (now() - last_status_change_at)) / 60) < sla_minutes;` (Pedidos próximos do SLA - 80% do tempo)
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    3.  **Nó**: `Split In Batches`
        *   **Nome**: `Dividir Pedidos Próximos SLA`
        *   **Batch Size**: `1`

    4.  **Nó**: `Webhook`
        *   **Nome**: `Chamar WF-05 Notificações (Alerta SLA Próximo)`
        *   **Operação**: `Call Webhook`
        *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/notifications`
        *   **Método**: `POST`
        *   **Body**: `{{ JSON.stringify({ orderId: $json.id, notificationType: 'SLA_BREACH_WARNING', details: 'Pedido próximo do SLA. Status atual: ' + $json.status }) }}`
        *   **Wait for Response**: `false`

    5.  **Nó**: `PostgreSQL`
        *   **Nome**: `Obter Pedidos com SLA Excedido`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `SELECT id, status, created_at, last_status_change_at, sla_minutes, customer_phone, customer_name FROM production_orders WHERE status IN ('RECEIVED', 'PENDING_APPROVAL', 'APPROVED', 'IN_PRODUCTION') AND (EXTRACT(EPOCH FROM (now() - last_status_change_at)) / 60) >= sla_minutes;`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    6.  **Nó**: `Split In Batches`
        *   **Nome**: `Dividir Pedidos SLA Excedido`
        *   **Batch Size**: `1`

    7.  **Nó**: `PostgreSQL`
        *   **Nome**: `Registrar Evento SLA_BREACH`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'SLA_BREACH', $2, 'system');`
        *   **Parâmetros**: `{{ $json.id }}`, `{{ JSON.stringify({ status: $json.status, slaMinutes: $json.sla_minutes }) }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    8.  **Nó**: `Webhook`
        *   **Nome**: `Chamar WF-05 Notificações (Alerta SLA Excedido)`
        *   **Operação**: `Call Webhook`
        *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/notifications`
        *   **Método**: `POST`
        *   **Body**: `{{ JSON.stringify({ orderId: $json.id, notificationType: 'SLA_BREACH', details: 'Pedido excedeu o SLA. Status atual: ' + $json.status }) }}`
        *   **Wait for Response**: `false`

    9.  **Nó**: `PostgreSQL`
        *   **Nome**: `Obter Pedidos Parados`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `SELECT id, status, created_at, last_status_change_at FROM production_orders WHERE status IN ('RECEIVED', 'PENDING_APPROVAL', 'APPROVED') AND (EXTRACT(EPOCH FROM (now() - last_status_change_at)) / 60) > 60;` (Exemplo: pedidos parados por mais de 60 minutos em status iniciais)
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    10. **Nó**: `Split In Batches`
        *   **Nome**: `Dividir Pedidos Parados`
        *   **Batch Size**: `1`

    11. **Nó**: `Webhook`
        *   **Nome**: `Chamar WF-05 Notificações (Alerta Pedido Parado)`
        *   **Operação**: `Call Webhook`
        *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/notifications`
        *   **Método**: `POST`
        *   **Body**: `{{ JSON.stringify({ orderId: $json.id, notificationType: 'STUCK_ORDER', details: 'Pedido parado no status ' + $json.status + ' por mais de 60 minutos.' }) }}`
        *   **Wait for Response**: `false`

### 1.10 WF-10 Reprocessador de DLQ

*   **Objetivo**: Monitorar a Dead Letter Queue (DLQ) e tentar reprocessar falhas ou notificar a equipe.
*   **Gatilho**: `Cron`
    *   **Intervalo**: `Every 15 minutes`
*   **Nós e Configuração**:

    1.  **Nó**: `Cron` (já configurado acima)

    2.  **Nó**: `PostgreSQL`
        *   **Nome**: `Obter Falhas PENDENTES/RETRYING`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `SELECT id, workflow_name, step_name, payload, error_message, retry_count, next_retry_at FROM workflow_failures WHERE status IN ('PENDING', 'RETRYING') AND (next_retry_at IS NULL OR next_retry_at <= now()) ORDER BY created_at ASC;`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    3.  **Nó**: `Split In Batches`
        *   **Nome**: `Dividir Falhas`
        *   **Batch Size**: `1`

    4.  **Nó**: `Function`
        *   **Nome**: `Calcular Próximo Retry`
        *   **Código JavaScript**: (A LLM deve gerar código para calcular o `next_retry_at` usando um backoff exponencial. Ex: `const retryCount = $json.retry_count + 1; const delaySeconds = Math.pow(2, retryCount) * 60; // 2, 4, 8, 16 minutos... const nextRetryAt = new Date(Date.now() + delaySeconds * 1000); return [{ json: { ...$json, retryCount: retryCount, nextRetryAt: nextRetryAt.toISOString() } }];`)

    5.  **Nó**: `PostgreSQL`
        *   **Nome**: `Atualizar Status para RETRYING`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `UPDATE workflow_failures SET status = 'RETRYING', retry_count = $2, next_retry_at = $3, updated_at = now() WHERE id = $1;`
        *   **Parâmetros**: `{{ $json.id }}`, `{{ $json.retryCount }}`, `{{ $json.nextRetryAt }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    6.  **Nó**: `Try/Catch`
        *   **Nome**: `Tentar Reprocessar Workflow`
        *   **Branch Try (Sucesso)**:
            *   **Nó**: `Webhook`
                *   **Nome**: `Chamar Workflow Original`
                *   **Operação**: `Call Webhook`
                *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/{{ $json.workflow_name.split(' ')[0].toLowerCase().replace('wf-', '') }}` (A LLM deve inferir a URL do webhook do workflow original com base no `workflow_name`)
                *   **Método**: `POST`
                *   **Body**: `{{ $json.payload }}`
                *   **Wait for Response**: `true`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Atualizar Status para RESOLVED`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `UPDATE workflow_failures SET status = 'RESOLVED', updated_at = now() WHERE id = $1;`
                *   **Parâmetros**: `{{ $json.id }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
        *   **Branch Catch (Falha no Reprocessamento)**:
            *   **Nó**: `IF`
                *   **Nome**: `Atingiu Limite de Retries?`
                *   **Condição**: `{{ $json.retryCount >= 5 }}` (Exemplo: 5 tentativas)
                *   **Branch TRUE (DEAD)**:
                    *   **Nó**: `PostgreSQL`
                        *   **Nome**: `Atualizar Status para DEAD`
                        *   **Operação**: `Execute SQL`
                        *   **Query SQL**: `UPDATE workflow_failures SET status = 'DEAD', updated_at = now() WHERE id = $1;`
                        *   **Parâmetros**: `{{ $json.id }}`
                        *   **Credenciais**: `{{ $connections.postgresql.database }}`
                    *   **Nó**: `Webhook`
                        *   **Nome**: `Chamar WF-05 Notificações (Alerta Falha DEAD)`
                        *   **Operação**: `Call Webhook`
                        *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/notifications`
                        *   **Método**: `POST`
                        *   **Body**: `{{ JSON.stringify({ notificationType: 'WORKFLOW_FAILURE_DEAD', details: 'Falha crítica no workflow ' + $json.workflow_name + '. Necessita intervenção manual. Erro: ' + $error.message, payload: $json.payload }) }}`
                        *   **Wait for Response**: `false`
                *   **Branch FALSE (Continuar Retrying)**:
                    *   **Nó**: `PostgreSQL`
                        *   **Nome**: `Registrar Nova Falha no Reprocessamento`
                        *   **Operação**: `Execute SQL`
                        *   **Query SQL**: `UPDATE workflow_failures SET error_message = $2, updated_at = now() WHERE id = $1;`
                        *   **Parâmetros**: `{{ $json.id }}`, `{{ $error.message }}`
                        *   **Credenciais**: `{{ $connections.postgresql.database }}`

### 1.11 WF-11 Relatórios Diários/Semanais/Mensais

*   **Objetivo**: Gerar e distribuir relatórios de performance, vendas e estoque.
*   **Gatilho**: `Cron`
    *   **Diário**: `0 0 2 * * *` (Todo dia às 2h da manhã)
    *   **Semanal**: `0 0 3 * * 1` (Toda segunda-feira às 3h da manhã)
    *   **Mensal**: `0 0 4 1 * *` (Todo dia 1 do mês às 4h da manhã)
*   **Nós e Configuração**:

    1.  **Nó**: `Cron` (configurar 3 nós Cron separados para cada frequência)

    2.  **Nó**: `PostgreSQL`
        *   **Nome**: `Gerar Relatório de Vendas`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: (A LLM deve gerar queries SQL complexas para cada tipo de relatório, filtrando por período (diário, semanal, mensal) e agregando dados de `production_orders` e `production_order_items`. Ex: `SELECT DATE(created_at) as date, SUM(total_amount) as total_sales, COUNT(id) as total_orders FROM production_orders WHERE created_at >= NOW() - INTERVAL '1 day' GROUP BY DATE(created_at);`)
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    3.  **Nó**: `Function`
        *   **Nome**: `Formatar Relatório (CSV/HTML)`
        *   **Código JavaScript**: (A LLM deve gerar código para formatar os resultados da query SQL em um formato legível, como CSV ou HTML. Pode usar bibliotecas JS para CSV ou construir HTML diretamente).

    4.  **Nó**: `SendGrid` (ou nó de Email genérico)
        *   **Nome**: `Enviar Relatório por Email`
        *   **Operação**: `Send Email`
        *   **To**: `relatorios@cozinhagrande.com` (ou lista de stakeholders)
        *   **From**: `no-reply@cozinhagrande.com`
        *   **Subject**: `Relatório Diário/Semanal/Mensal de Vendas - {{ $now.toFormat('yyyy-MM-dd') }}`
        *   **HTML Body**: `{{ $json.formattedReport }}`
        *   **Attachments**: (Se o relatório for CSV, anexar o arquivo)
        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Chamar WF-10 DLQ`.

### 1.12 WF-12 Retenção de Dados e Backups

*   **Objetivo**: Gerenciar a política de retenção de dados e realizar backups regulares do banco de dados.
*   **Gatilho**: `Cron`
    *   **Diário**: `0 0 1 * * *` (Todo dia às 1h da manhã)
*   **Nós e Configuração**:

    1.  **Nó**: `Cron` (já configurado acima)

    2.  **Nó**: `Shell Command`
        *   **Nome**: `Executar Backup PostgreSQL`
        *   **Comando**: `pg_dump -h postgres -U kitchen_user -d kitchen > /var/lib/postgresql/backups/kitchen_backup_$(date +%Y%m%d%H%M%S).sql` (Assumir que o diretório `/var/lib/postgresql/backups` existe e tem permissões. A LLM deve garantir que o comando seja executado no container do PostgreSQL ou que o n8n tenha acesso ao host do DB).
        *   **Credenciais**: (Não aplicável diretamente, mas o comando usa credenciais do DB)
        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Chamar WF-10 DLQ`.

    3.  **Nó**: `Shell Command`
        *   **Nome**: `Limpar Backups Antigos`
        *   **Comando**: `find /var/lib/postgresql/backups -type f -name 'kitchen_backup_*.sql' -mtime +7 -delete` (Exclui backups com mais de 7 dias).
        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Chamar WF-10 DLQ`.

    4.  **Nó**: `PostgreSQL`
        *   **Nome**: `Limpar Dados Antigos (order_events)`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `DELETE FROM order_events WHERE created_at < NOW() - INTERVAL '1 year';` (Exemplo: reter eventos por 1 ano).
        *   **Credenciais**: `{{ $connections.postgresql.database }}`
        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Chamar WF-10 DLQ`.

### 1.13 WF-13 Previsão de Demanda (IA)

*   **Objetivo**: Utilizar IA para prever a demanda futura de pedidos.
*   **Gatilho**: `Cron`
    *   **Diário**: `0 0 0 * * *` (Todo dia à meia-noite)
*   **Nós e Configuração**:

    1.  **Nó**: `Cron` (já configurado acima)

    2.  **Nó**: `PostgreSQL`
        *   **Nome**: `Obter Dados Históricos de Pedidos`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `SELECT created_at, total_items, total_amount FROM production_orders WHERE created_at >= NOW() - INTERVAL '90 days' ORDER BY created_at ASC;` (Obter dados dos últimos 90 dias).
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    3.  **Nó**: `Function`
        *   **Nome**: `Preparar Dados para IA`
        *   **Código JavaScript**: (A LLM deve gerar código para formatar os dados históricos em um formato adequado para a API de IA, possivelmente incluindo informações adicionais como dia da semana, feriados, etc.).

    4.  **Nó**: `HTTP Request` (para OpenAI/Gemini API)
        *   **Nome**: `Chamar API de IA (Previsão)`
        *   **Método**: `POST`
        *   **URL**: `https://api.openai.com/v1/chat/completions` (ou Gemini API endpoint)
        *   **Headers**: `Authorization: Bearer {{ $connections.openAiApi.apiKey }}`
        *   **Body**: `{{ JSON.stringify({ model: 'gpt-4.1-mini', messages: [{ role: 'system', content: 'Você é um assistente de previsão de demanda para restaurantes. Dada uma série temporal de pedidos, preveja o número de pedidos para os próximos 7 dias.' }, { role: 'user', content: 'Dados históricos: ' + JSON.stringify($json.preparedData) }], temperature: 0.7 }) }}` (A LLM deve ajustar o modelo e o prompt conforme necessário).
        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Chamar WF-10 DLQ`.

    5.  **Nó**: `Function`
        *   **Nome**: `Processar Resposta da IA`
        *   **Código JavaScript**: (A LLM deve gerar código para extrair a previsão da resposta da API de IA e formatá-la para inserção em `demand_forecasts`. Output: uma lista de `{ forecastDate: '...', predictedQuantity: '...' }`)

    6.  **Nó**: `Split In Batches`
        *   **Nome**: `Dividir Previsões`
        *   **Batch Size**: `1`

    7.  **Nó**: `PostgreSQL`
        *   **Nome**: `Inserir Previsão de Demanda`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO demand_forecasts (forecast_date, predicted_quantity, factors_used) VALUES ($1, $2, $3) ON CONFLICT (forecast_date, product_sku) DO UPDATE SET predicted_quantity = EXCLUDED.predicted_quantity, factors_used = EXCLUDED.factors_used, created_at = now();` (A LLM deve incluir `product_sku` se a previsão for por produto).
        *   **Parâmetros**: `{{ $json.forecastDate }}`, `{{ $json.predictedQuantity }}`, `{{ JSON.stringify($json.factorsUsed) }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    8.  **Nó**: `PostgreSQL`
        *   **Nome**: `Registrar Evento DEMAND_FORECASTED`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO order_events (event_type, payload, created_by) VALUES ('DEMAND_FORECASTED', $1, 'system');`
        *   **Parâmetros**: `{{ JSON.stringify($json) }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

### 1.14 WF-14 Automação de Compras (PO)

*   **Objetivo**: Gerar ordens de compra automaticamente com base em alertas de baixo estoque ou previsão de demanda.
*   **Gatilho**: `Webhook`
    *   **Método**: `POST`
    *   **Path**: `/webhook/purchase-automation`
    *   **Response Mode**: `Respond to Webhook`
    *   **HTTP Response Code**: `200`
    *   **HTTP Response Body**: `{{ JSON.stringify({ status: 'purchase_order_processed', inventoryItemId: $json.inventoryItemId }) }}`
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` (já configurado acima)
        *   **Saída**: `{ inventoryItemId: '...', currentStock: '...', minStock: '...', parLevel: '...' }`

    2.  **Nó**: `PostgreSQL`
        *   **Nome**: `Obter Detalhes do Item e Fornecedor`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `SELECT ii.id, ii.name, ii.sku, ii.unit, ii.current_stock, ii.min_stock, ii.par_level, ii.cost_price, s.id as supplier_id, s.name as supplier_name, s.email as supplier_email FROM inventory_items ii JOIN suppliers s ON ii.supplier_id = s.id WHERE ii.id = $1;`
        *   **Parâmetros**: `{{ $json.inventoryItemId }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    3.  **Nó**: `IF`
        *   **Nome**: `Necessita Ordem de Compra?`
        *   **Condição**: `{{ $json.query[0].current_stock <= $json.query[0].par_level }}`
        *   **Branch TRUE (Gerar PO)**:
            *   **Nó**: `Function`
                *   **Nome**: `Calcular Quantidade de Compra`
                *   **Código JavaScript**: (A LLM deve gerar código para calcular a quantidade a ser comprada, considerando `par_level`, `current_stock` e um fator de segurança. Output: `{ quantityToOrder: '...' }`)
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Criar Ordem de Compra (DRAFT)`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO purchase_orders (supplier_id, po_number, status, total_amount, created_by) VALUES ($1, 'PO-' || EXTRACT(EPOCH FROM NOW())::text, 'DRAFT', 0, 'system') RETURNING id;`
                *   **Parâmetros**: `{{ $json.query[0].supplier_id }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Adicionar Item à Ordem de Compra`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO purchase_order_items (po_id, inventory_item_id, quantity, unit_price) VALUES ($1, $2, $3, $4);`
                *   **Parâmetros**: `{{ $json.query[0].po_id }}`, `{{ $json.query[0].id }}`, `{{ $json.quantityToOrder }}`, `{{ $json.query[0].cost_price }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Atualizar Total PO e Status para PENDING`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `UPDATE purchase_orders SET total_amount = (SELECT SUM(quantity * unit_price) FROM purchase_order_items WHERE po_id = $1), status = 'PENDING', updated_at = now() WHERE id = $1;`
                *   **Parâmetros**: `{{ $json.query[0].po_id }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `SendGrid` (ou nó de Email genérico)
                *   **Nome**: `Enviar PO para Fornecedor`
                *   **Operação**: `Send Email`
                *   **To**: `{{ $json.query[0].supplier_email }}`
                *   **From**: `compras@cozinhagrande.com`
                *   **Subject**: `Ordem de Compra #{{ $json.query[0].po_number }}`
                *   **HTML Body**: (A LLM deve gerar um corpo de e-mail formatado com os detalhes da PO)
                *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Chamar WF-10 DLQ`.
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Registrar Evento PURCHASE_ORDER_GENERATED`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO order_events (event_type, payload, created_by) VALUES ('PURCHASE_ORDER_GENERATED', $1, 'system');`
                *   **Parâmetros**: `{{ JSON.stringify({ poId: $json.query[0].po_id, supplierId: $json.query[0].supplier_id, inventoryItemId: $json.query[0].id }) }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`

### 1.15 WF-15 Processamento de Contas a Pagar (OCR)

*   **Objetivo**: Automatizar o processamento de notas fiscais via OCR.
*   **Gatilho**: `Email Read` (monitorar caixa de entrada para anexos de NF) ou `Webhook` (para upload manual).
    *   **Email Read**: Configurar para monitorar `faturas@cozinhagrande.com` para anexos PDF/JPG.
    *   **Webhook**: `POST /webhook/invoice-upload`
*   **Nós e Configuração**:

    1.  **Nó**: `Email Read` ou `Webhook` (configurar um ou outro, ou ambos com lógica de roteamento)

    2.  **Nó**: `HTTP Request` (para serviço de OCR)
        *   **Nome**: `Enviar para Serviço OCR`
        *   **Método**: `POST`
        *   **URL**: `{{ $connections.ocrApi.endpoint }}`
        *   **Headers**: `Authorization: Bearer {{ $connections.ocrApi.apiKey }}`
        *   **Body**: (Anexo da nota fiscal em base64 ou URL do arquivo)
        *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Chamar WF-10 DLQ`.

    3.  **Nó**: `Function`
        *   **Nome**: `Processar Dados OCR`
        *   **Código JavaScript**: (A LLM deve gerar código para extrair os campos relevantes da resposta do OCR (número da fatura, valor, data, fornecedor) e formatá-los para inserção em `invoices`.)

    4.  **Nó**: `PostgreSQL`
        *   **Nome**: `Inserir Fatura (RECEIVED)`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO invoices (supplier_id, invoice_number, issue_date, total_amount, status, raw_ocr_data, processed_data, attachment_url) VALUES ($1, $2, $3, $4, 'RECEIVED', $5, $6, $7) RETURNING id;`
        *   **Parâmetros**: `{{ $json.supplierId }}`, `{{ $json.invoiceNumber }}`, `{{ $json.issueDate }}`, `{{ $json.totalAmount }}`, `{{ JSON.stringify($json.rawOcrData) }}`, `{{ JSON.stringify($json.processedData) }}`, `{{ $json.attachmentUrl }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    5.  **Nó**: `PostgreSQL`
        *   **Nome**: `Registrar Evento INVOICE_RECEIVED`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO order_events (event_type, payload, created_by) VALUES ('INVOICE_RECEIVED', $1, 'system');`
        *   **Parâmetros**: `{{ JSON.stringify({ invoiceId: $json.id, invoiceNumber: $json.invoiceNumber }) }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    6.  **Nó**: `Webhook`
        *   **Nome**: `Chamar Workflow de Aprovação (Opcional)`
        *   **Operação**: `Call Webhook`
        *   **URL**: `{{ $env.N8N_INTERNAL_WEBHOOK_URL }}/webhook/invoice-approval` (Se houver um workflow de aprovação manual)
        *   **Método**: `POST`
        *   **Body**: `{{ JSON.stringify({ invoiceId: $json.id }) }}`
        *   **Wait for Response**: `false`

### 1.16 WF-16 Gestão de Promoções

*   **Objetivo**: Criar, agendar e aplicar promoções dinâmicas.
*   **Gatilho**: `Webhook` (para criação/atualização via painel) ou `Cron` (para ativar/desativar promoções agendadas).
    *   **Webhook**: `POST /webhook/manage-promotion`
    *   **Cron**: `0 * * * * *` (A cada minuto para verificar promoções ativas/inativas)
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` ou `Cron`

    2.  **Nó**: `IF` (se o gatilho for Cron)
        *   **Nome**: `Verificar Promoções Ativas/Inativas`
        *   **Condição**: `{{ $json.trigger === 'cron' }}`
        *   **Branch TRUE (Cron)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Obter Promoções para Atualizar Status`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `SELECT id, code, name, start_date, end_date, is_active FROM promotions WHERE (is_active = TRUE AND end_date < NOW()) OR (is_active = FALSE AND start_date <= NOW() AND end_date >= NOW());`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
            *   **Nó**: `Split In Batches`
                *   **Nome**: `Dividir Promoções`
                *   **Batch Size**: `1`
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Atualizar Status da Promoção`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `UPDATE promotions SET is_active = CASE WHEN end_date < NOW() THEN FALSE ELSE TRUE END, updated_at = now() WHERE id = $1;`
                *   **Parâmetros**: `{{ $json.id }}`
                *   **Credenciais**: `{{ $connections.postgresql.database }}`
        *   **Branch FALSE (Webhook - Gerenciar Promoção)**:
            *   **Nó**: `PostgreSQL`
                *   **Nome**: `Inserir/Atualizar Promoção`
                *   **Operação**: `Execute SQL`
                *   **Query SQL**: `INSERT INTO promotions (code, name, description, type, value, start_date, end_date, is_active, target_channels, min_order_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, type = EXCLUDED.type, value = EXCLUDED.value, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, is_active = EXCLUDED.is_active, target_channels = EXCLUDED.target_channels, min_order_amount = EXCLUDED.min_order_amount, updated_at = now();`
                *   **Parâmetros**: `{{ $json.body.code }}`, `{{ $json.body.name }}`, ... (mapear todos os campos)
                *   **Credenciais**: `{{ $connections.postgresql.database }}`

    3.  **Nó**: `PostgreSQL`
        *   **Nome**: `Registrar Evento PROMOTION_APPLIED` (Este nó seria chamado de WF-02, por exemplo, após a criação do pedido, para aplicar a promoção)
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'PROMOTION_APPLIED', $2, 'system');`
        *   **Parâmetros**: `{{ $json.orderId }}`, `{{ JSON.stringify({ promotionCode: $json.promotionCode, discountApplied: $json.discount }) }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

### 1.17 WF-17 Feedback do Cliente (NPS)

*   **Objetivo**: Coletar feedback de clientes e analisar sentimento.
*   **Gatilho**: `Webhook` (para receber respostas de formulário) ou `Webhook` (chamado por WF-06 após entrega).
    *   **Webhook**: `POST /webhook/customer-feedback`
*   **Nós e Configuração**:

    1.  **Nó**: `Webhook` (já configurado acima)
        *   **Saída**: `{ orderId: '...', rating: '...', comments: '...', customerId: '...', feedbackChannel: '...' }`

    2.  **Nó**: `IF`
        *   **Nome**: `Comentários Existem?`
        *   **Condição**: `{{ $json.comments && $json.comments.length > 0 }}`
        *   **Branch TRUE (Analisar Sentimento)**:
            *   **Nó**: `HTTP Request` (para OpenAI/Gemini API)
                *   **Nome**: `Analisar Sentimento (IA)`
                *   **Método**: `POST`
                *   **URL**: `https://api.openai.com/v1/chat/completions` (ou Gemini API endpoint)
                *   **Headers**: `Authorization: Bearer {{ $connections.openAiApi.apiKey }}`
                *   **Body**: `{{ JSON.stringify({ model: 'gpt-4.1-mini', messages: [{ role: 'system', content: 'Analise o sentimento do seguinte comentário de cliente e retorne POSITIVE, NEGATIVE ou NEUTRAL.' }, { role: 'user', content: $json.comments }], temperature: 0.0 }) }}`
                *   **Tratamento de Erro**: Conectar a um nó `Try/Catch` que, em caso de falha, roteia para `Chamar WF-10 DLQ`.
            *   **Nó**: `Function`
                *   **Nome**: `Extrair Sentimento`
                *   **Código JavaScript**: (A LLM deve gerar código para extrair o sentimento da resposta da IA. Ex: `const sentiment = $json.choices[0].message.content.trim(); return [{ json: { ...$json, processedSentiment: sentiment } }];`)
        *   **Branch FALSE (Sem Comentários)**:
            *   **Nó**: `Set`
                *   **Nome**: `Definir Sentimento NEUTRAL`
                *   **Modo**: `Merge`
                *   **Campos**: `processedSentiment: 'NEUTRAL'`

    3.  **Nó**: `PostgreSQL`
        *   **Nome**: `Inserir Feedback do Cliente`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO customer_feedback (order_id, customer_id, rating, comments, feedback_channel, processed_sentiment) VALUES ($1, $2, $3, $4, $5, $6);`
        *   **Parâmetros**: `{{ $json.orderId }}`, `{{ $json.customerId }}`, `{{ $json.rating }}`, `{{ $json.comments }}`, `{{ $json.feedbackChannel }}`, `{{ $json.processedSentiment }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

    4.  **Nó**: `PostgreSQL`
        *   **Nome**: `Registrar Evento FEEDBACK_RECEIVED`
        *   **Operação**: `Execute SQL`
        *   **Query SQL**: `INSERT INTO order_events (order_id, event_type, payload, created_by) VALUES ($1, 'FEEDBACK_RECEIVED', $2, 'system');`
        *   **Parâmetros**: `{{ $json.orderId }}`, `{{ JSON.stringify({ rating: $json.rating, sentiment: $json.processedSentiment }) }}`
        *   **Credenciais**: `{{ $connections.postgresql.database }}`

---

## 2. Credenciais e Variáveis de Ambiente (Configuração n8n)

Para que os workflows funcionem corretamente, as seguintes credenciais e variáveis de ambiente devem ser configuradas no n8n:

### 2.1 Credenciais

*   **PostgreSQL**: Conexão com o banco de dados `kitchen`.
    *   `Host`: `postgres` (se rodando em Docker Compose)
    *   `Port`: `5432`
    *   `Database`: `kitchen`
    *   `User`: `kitchen_user`
    *   `Password`: `kitchen_pass`
*   **PrintNode API**: Chave de API para autenticação.
    *   `API Key`: `YOUR_PRINTNODE_API_KEY`
*   **WhatsApp Cloud API (Meta)**: Token de acesso e ID do número de telefone.
    *   `Access Token`: `YOUR_WHATSAPP_ACCESS_TOKEN`
    *   `Phone Number ID`: `YOUR_WHATSAPP_PHONE_NUMBER_ID`
*   **SendGrid API**: Chave de API para envio de e-mails.
    *   `API Key`: `YOUR_SENDGRID_API_KEY`
*   **Twilio API**: Account SID e Auth Token para envio de SMS.
    *   `Account SID`: `YOUR_TWILIO_ACCOUNT_SID`
    *   `Auth Token`: `YOUR_TWILIO_AUTH_TOKEN`
    *   `Phone Number`: `YOUR_TWILIO_PHONE_NUMBER`
*   **OpenAI/Gemini API**: Chave de API para serviços de IA.
    *   `API Key`: `YOUR_OPENAI_GEMINI_API_KEY`
*   **OCR API**: Endpoint e chave de API para serviço de OCR.
    *   `Endpoint`: `YOUR_OCR_SERVICE_ENDPOINT`
    *   `API Key`: `YOUR_OCR_SERVICE_API_KEY`

### 2.2 Variáveis de Ambiente (n8n)

*   `N8N_INTERNAL_WEBHOOK_URL`: URL base para chamadas internas entre workflows (ex: `http://n8n:5678`).
*   `N8N_ENCRYPTION_KEY`: Chave de criptografia para o n8n (MUDAR EM PRODUÇÃO).
*   `WEBHOOK_URL`: URL pública do n8n para webhooks externos (MUDAR PARA URL PÚBLICA EM PRODUÇÃO).
*   `N8N_BASIC_AUTH_USER`: Usuário para autenticação básica do n8n (MUDAR EM PRODUÇÃO).
*   `N8N_BASIC_AUTH_PASSWORD`: Senha para autenticação básica do n8n (MUDAR EM PRODUÇÃO).

---

## 3. Considerações de Deploy e Escalabilidade

*   **Docker Compose**: O `docker-compose.yml` fornecido no `cozinhagrande_v4.md` é um bom ponto de partida. Garanta que o n8n esteja configurado para usar o Redis para filas (`EXECUTIONS_MODE=queue`, `N8N_REDIS_URL=redis://redis:6379`) para melhor performance e resiliência.
*   **Monitoramento**: Configure ferramentas de monitoramento (Prometheus/Grafana) para acompanhar a saúde dos serviços, o uso de recursos e a execução dos workflows do n8n.
*   **Logs**: Centralize os logs de todos os serviços para facilitar a depuração e auditoria.
*   **Segurança**: Revise todas as chaves de API e senhas, utilizando segredos do Docker ou um sistema de gerenciamento de segredos em produção.
*   **Testes**: Realize testes de carga e de ponta a ponta para validar a funcionalidade e a performance de todos os workflows.

---

## 4. Próximos Passos para a LLM

1.  **Gerar Workflows n8n**: Para cada `WF-XX` detalhado na Seção 1, crie um arquivo `.json` ou `.n8n` contendo a definição completa do workflow, incluindo todos os nós, suas configurações e conexões.
2.  **Scripts de Inicialização**: Se necessário, crie scripts para popular as tabelas de configuração (`kitchen_sectors`, `message_templates`, `automation_policies`, `suppliers`, `recipes`, `recipe_ingredients`) com dados iniciais ou de exemplo.
3.  **Documentação Adicional**: Gere documentação específica para cada workflow, explicando seu propósito, gatilhos, entradas, saídas e dependências.

Este blueprint é o guia definitivo para a construção automatizada do seu sistema de automação de cozinha. Siga-o rigorosamente para garantir um sistema robusto e funcional.
