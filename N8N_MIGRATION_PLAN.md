# PLANO DE MIGRAÇÃO & REESTRUTURAÇÃO (LÚCIO)
# Data: 2026-02-06
# Status: Em execução

O objetivo é unificar os fluxos antigos ("cozinha grande", "media", "fatura") na nova arquitetura **Visão de Deus**.

---

## 1. ANÁLISE DOS WORKFLOWS LEGADOS

| Workflow Antigo | Função Original | Novo Destino (Arquitetura V2) | Ação Necessária |
| :--- | :--- | :--- | :--- |
| **Cozinha Grande** | Gestão de estoque pesado (Restaurante?) | **Módulo B2B / Visão de Deus** | Integrar com Evolution API para pedidos diretos ao fornecedor. |
| **Cozinha Média** | Gestão doméstica/pequena | **Módulo B2C / Visão de Deus** | Implementar "Snap & Solve" (IA Vision) + Busca de Preço. |
| **Fatura** | Leitura de gastos | **O Cofre (Memória Infinita)** | Migrar OCR simples para RAG (Vector DB) para busca histórica. |
| **Cozinha WPP** | Chatbot simples | **Agente Gestor (Persona)** | Injetar Prompt de Personalidade ("Dante/Alfred") + Memória de Contexto. |

---

## 2. NOVA ESTRUTURA UNIFICADA (N8N)

Não teremos 4 workflows soltos. Teremos um **ROTEADOR CENTRAL**.

### O Super-Workflow (Router):
1. **Entrada Única:** Webhook do WhatsApp (Evolution API).
2. **Classificador de Intenção (AI Agent):**
   - É foto de comida? -> Envia para **Sub-fluxo Visão**.
   - É foto de conta? -> Envia para **Sub-fluxo Fatura**.
   - É texto? -> Envia para **Agente Gestor**.

### Otimização Mobile (WhatsApp First):
- **Respostas Curtas:** O Gestor não manda "textão". Manda listas com bullets.
- **Botões:** Usar `List Messages` e `Buttons` do WhatsApp Business API (via Evolution) para o usuário clicar em vez de digitar.
  - *Ex:* [ Sim, comprar ] [ Lembrar depois ] [ Ignorar ]

---

## 3. AÇÕES TÉCNICAS IMEDIATAS (LÚCIO)
1. [ ] Criar nó "Switch" para separar Imagem de Texto.
2. [ ] Atualizar o prompt do OCR de Faturas para extrair JSON compatível com o "Cofre".
3. [ ] Configurar conexão com Banco Vetorial (Supabase) para o Agente ter memória longa.

---

**Status:** Aguardando prints do Dante (User) para finalizar o Front-end Web. Focando 100% no Backend N8N agora.
