# Automação de Produção — Cozinha Inteligente & Restaurante 360º

**Versão:** 5.0 (Premium / Multi-Tenant)  
**Autor:** Manus AI  
**Stack:** n8n + PostgreSQL + Redis + OpenAI/Gemini + WhatsApp Cloud API + OCR + IoT (Opcional)  
**Meta:** Criar uma solução completa de gestão e automação para pequenos e médios restaurantes, focada em maximizar o lucro, eliminar o desperdício e automatizar o back-office de forma invisível.

---

## 1) Visão Geral do Produto

Diferente de sistemas tradicionais que são apenas "registradores de pedidos", a **Cozinha Inteligente V5.0** é um ecossistema proativo. Ela não apenas recebe o pedido, mas prevê a necessidade de compra, monitora a saúde dos equipamentos, gerencia a equipe e traz o cliente de volta através de inteligência artificial.

### 1.1 Diferenciais Competitivos

| Funcionalidade | Benefício para o Dono | Impacto no Negócio |
| :--- | :--- | :--- |
| **IA Demand Forecasting** | Sabe quanto vai vender antes de abrir. | Redução de 20% no desperdício de insumos. |
| **FIFO Automático** | Alertas de validade via WhatsApp. | Elimina perdas por produtos vencidos. |
| **CRM Preditivo** | Envia cupons para clientes sumidos. | Aumento de 15% na recorrência de pedidos. |
| **OCR de Notas Fiscais** | Lança compras no sistema apenas com uma foto. | Economia de 5h/semana em burocracia. |
| **Monitoramento IoT** | Alerta se a geladeira esquentar. | Evita a perda total do estoque por falha técnica. |

---

## 2) Módulos de Automação (n8n)

A solução é dividida em módulos independentes que se comunicam através do banco de dados centralizado, permitindo uma implantação escalável (Multi-Tenant).

### 2.1 Módulo de Operação (Core)
Este módulo gerencia o fluxo de pedidos, desde a entrada até a entrega, garantindo que a cozinha trabalhe em sincronia.
*   **Gateway Multi-Canal:** Integração com iFood, UberEats, Site Próprio e POS local.
*   **KDS Inteligente:** Painel de produção que prioriza pedidos por tempo de entrega e perfil do cliente (VIP).
*   **Impressão Inteligente:** Roteamento por setor com fallback automático para WhatsApp da equipe se a impressora falhar.

### 2.2 Módulo de Inventário & Compras (Smart Stock)
Transforma a gestão de estoque em algo automático e sem erros humanos.
*   **Baixa por Ficha Técnica:** Cada prato vendido abate os ingredientes exatos do estoque.
*   **Sugestão de Compra:** O sistema gera uma lista de compras baseada na previsão de vendas da IA para os próximos 3 dias.
*   **Gestão de Validade:** Alertas diários no WhatsApp do gerente sobre itens que vencem em 48h.

### 2.3 Módulo Financeiro & Back-Office (Auto-Finance)
Elimina a necessidade de planilhas complexas e lançamentos manuais.
*   **Conciliação Automática:** Cruza as vendas dos marketplaces com os recebimentos bancários.
*   **OCR de Despesas:** O dono tira foto de qualquer nota ou recibo e o n8n categoriza a despesa no DRE.
*   **Relatório de Lucro Real:** Envio diário do fechamento de caixa com lucro líquido descontando taxas e custos.

### 2.4 Módulo de Cliente & Marketing (Growth Engine)
Usa os dados para vender mais sem gastar com anúncios caros.
*   **Fidelidade Digital:** Tracking automático de pontos por CPF/Telefone.
*   **Recuperação de Clientes:** IA identifica clientes que não pedem há X dias e envia uma oferta personalizada.
*   **Pesquisa NPS Automática:** 30 minutos após a entrega, solicita feedback e alerta o dono se a nota for baixa.

---

## 3) Arquitetura Multi-Tenant (Escalabilidade)

O sistema foi desenhado para ser vendido como um SaaS (Software as a Service). Cada restaurante (Tenant) tem seus próprios dados, configurações e segredos isolados.

### 3.1 Estrutura de Dados (PostgreSQL)

```sql
-- Estrutura de Tenancy
CREATE TABLE tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name text NOT NULL,
    owner_email text UNIQUE NOT NULL,
    plan_level text DEFAULT 'BASIC', -- BASIC, PRO, ENTERPRISE
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Configurações Específicas por Restaurante
CREATE TABLE tenant_configs (
    tenant_id uuid REFERENCES tenants(id),
    whatsapp_number text,
    opening_hours jsonb,
    low_stock_alert_threshold numeric DEFAULT 0.2, -- Alerta quando chegar em 20%
    ai_enabled boolean DEFAULT true,
    PRIMARY KEY (tenant_id)
);
```

---

## 4) Blueprint de Implementação n8n (Instruções para Máquina)

Para que a automação seja 100% operacional, os seguintes workflows devem ser construídos seguindo a lógica de isolamento por `tenant_id`.

### 4.1 Workflow: Monitor de Validade Crítico
*   **Trigger:** Cron (Diário às 08:00).
*   **Lógica:** Busca em `inventory_items` todos os itens onde `expiry_date` <= (now + 2 dias).
*   **Ação:** Agrupa por `tenant_id` e envia uma lista formatada para o WhatsApp do gerente responsável.

### 4.2 Workflow: OCR de Nota Fiscal de Compra
*   **Trigger:** Webhook (Recebe imagem via WhatsApp ou App).
*   **Lógica:** Envia imagem para OpenAI (GPT-4o) com prompt para extrair: Itens, Quantidades, Preços e Data de Validade.
*   **Ação:** Atualiza `inventory_items` (soma estoque) e cria registro em `inventory_movements` e `invoices`.

### 4.3 Workflow: Recuperação de Cliente "Sumido"
*   **Trigger:** Cron (Semanal).
*   **Lógica:** Identifica clientes que fizeram > 3 pedidos mas estão há > 20 dias sem pedir.
*   **Ação:** IA gera uma mensagem personalizada: "Olá [Nome], sentimos falta do seu [Prato Favorito]! Aqui está um cupom de 15% para você voltar hoje."

---

## 5) Checklist de Venda e Implementação

*   [ ] **Configuração do Banco:** Executar scripts SQL de tenancy e tabelas core.
*   [ ] **Integração de APIs:** Configurar chaves de WhatsApp, OpenAI e Provedores de Pagamento.
*   [ ] **Treinamento da IA:** Ajustar prompts de previsão de demanda com dados históricos.
*   [ ] **App de Operação:** Disponibilizar interface simples para a cozinha (KDS) e para o dono (Dashboard).
*   [ ] **Monitoramento:** Ativar alertas de saúde dos workflows no Slack/Discord do suporte técnico.

---

## 6) Referências e Benchmarking

*   **Toast POS:** Referência em integração vertical para restaurantes.
*   **7shifts:** Líder em gestão de escalas e mão de obra.
*   **MarketMan:** Benchmark para controle de inventário e compras.
*   **Manus AI Research:** Análise de dores de pequenos negócios e tendências de automação 2026.
