# Blueprint Técnico n8n — Cozinha Inteligente V5.0 (SaaS Ready)

**Objetivo:** Este documento é uma especificação técnica para que uma LLM gere automaticamente os workflows do n8n para um sistema de gestão de restaurantes Multi-Tenant, focado em pequenas cozinhas.

---

## 1. Instruções de Arquitetura para a LLM

1.  **Contexto Multi-Tenant:** Todos os nós de banco de dados DEVEM incluir a cláusula `WHERE tenant_id = $tenant_id`.
2.  **Tratamento de Erros Global:** Todo workflow deve ter um nó `Error Trigger` que envia falhas para o `WF-10 (DLQ)`.
3.  **Uso de IA:** Utilize o nó `OpenAI` ou `Gemini` para tarefas de extração de dados (OCR) e geração de mensagens personalizadas.
4.  **Comunicação via WhatsApp:** Utilize a `WhatsApp Cloud API` como canal principal de interação com o dono e a equipe.

---

## 2. Workflows Prioritários (Nó a Nó)

### 2.1 WF-SMART-STOCK: Gestão de Validade e FIFO
*   **Trigger:** `Cron` (08:00 AM daily).
*   **Nó 1 (PostgreSQL):** `SELECT * FROM inventory_items WHERE expiry_date <= NOW() + INTERVAL '2 days' AND tenant_id = $1`.
*   **Nó 2 (IF):** Verifica se há itens vencendo.
*   **Nó 3 (OpenAI):** Gera uma mensagem de alerta criativa: "Chef, temos ingredientes em perigo! 🚨 [Lista de Itens] vencem logo. Que tal um prato do dia especial para usá-los?".
*   **Nó 4 (WhatsApp):** Envia para o número cadastrado em `tenant_configs`.

### 2.2 WF-AUTO-PURCHASE: Sugestão de Compra via IA
*   **Trigger:** `Cron` (Segunda-feira 07:00 AM).
*   **Nó 1 (PostgreSQL):** Busca histórico de vendas dos últimos 30 dias + estoque atual.
*   **Nó 2 (OpenAI):** "Com base nestas vendas e no estoque atual, gere uma lista de compras para os próximos 7 dias, considerando um crescimento de 10% para o fim de semana."
*   **Nó 3 (WhatsApp):** Envia a lista para o dono com botões de "Aprovar" ou "Editar".

### 2.3 WF-OCR-INVOICE: Lançamento de Compras via Foto
*   **Trigger:** `WhatsApp Trigger` (Recebimento de imagem com legenda "Compra").
*   **Nó 1 (OpenAI - Vision):** Extrai: Nome do Fornecedor, Data, Itens, Quantidade, Preço Unitário e Data de Validade.
*   **Nó 2 (PostgreSQL):** `INSERT INTO inventory_movements` e `UPDATE inventory_items`.
*   **Nó 3 (WhatsApp):** Confirmação: "✅ Compra de [Fornecedor] lançada! [Total] adicionado ao estoque."

### 2.4 WF-CRM-RECOVERY: Recuperação de Clientes Sumidos
*   **Trigger:** `Cron` (Domingo 18:00).
*   **Nó 1 (PostgreSQL):** `SELECT customer_name, customer_phone, last_order_date FROM customers WHERE last_order_date < NOW() - INTERVAL '15 days'`.
*   **Nó 2 (OpenAI):** Gera mensagem personalizada baseada no último pedido do cliente.
*   **Nó 3 (WhatsApp):** Envia cupom de desconto gerado dinamicamente.

### 2.5 WF-GELADEIRA-ALERTA: Monitoramento IoT (Opcional/Simulado)
*   **Trigger:** `Webhook` (Recebe dados de sensor de temperatura).
*   **Nó 1 (IF):** `temp > 8°C` por mais de 10 minutos.
*   **Nó 2 (WhatsApp):** Alerta CRÍTICO: "🚨 ATENÇÃO: Temperatura da Geladeira 1 está em [X]°C! Risco de perda de estoque!"

---

## 3. Modelo de Dados Adicional (SQL)

```sql
-- Tabela de Clientes para CRM
CREATE TABLE customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES tenants(id),
    name text,
    phone text,
    last_order_date timestamptz,
    total_spent numeric DEFAULT 0,
    preferences jsonb -- Ex: { "favorite_dish": "Pizza Margherita" }
);

-- Tabela de Manutenção de Equipamentos
CREATE TABLE equipment_maintenance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES tenants(id),
    equipment_name text,
    last_maintenance date,
    next_maintenance date,
    status text -- OK, WARNING, URGENT
);
```

---

## 4. Instruções de Venda (Pitch para o Cliente)

"Sua cozinha é pequena, mas sua inteligência deve ser grande. Com nossa automação, você para de perder dinheiro com comida vencida, para de gastar horas em planilhas e começa a vender para quem já é seu cliente de forma automática. É como ter um gerente 24h por dia que não dorme e custa menos que um café por dia."

---

**Assinado:** Manus AI - O Futuro da Automação Gastronômica.
