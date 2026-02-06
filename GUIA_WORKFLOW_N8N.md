# GUIA DE IMPLEMENTAÇÃO: N8N WORKFLOW (VISÃO DE DEUS)

Este é o mapa para montar o cérebro no seu n8n.

## 1. O Gatilho (Trigger)
- **Node:** `Webhook`
- **Method:** POST
- **Path:** `/visao-de-deus/upload`
- **Input:** Recebe a imagem (Base64 ou URL) enviada pelo App/WhatsApp.

## 2. O Olho (Vision AI)
- **Node:** `OpenAI` (Chat Model) ou `Google Vertex AI`
- **Model:** `gpt-4o` ou `gemini-1.5-pro` (Essencial ser Vision)
- **Prompt:** Copie o conteúdo de `PROMPT_VISION_N8N.md`.
- **User Message:** [Image Data] + "Analise esta imagem."

## 3. A Lógica (Parser)
- **Node:** `Code` (JavaScript)
- **Code:** Copie o conteúdo de `LOGICA_PARSER_N8N.js`.
- **Função:** Transforma o texto da IA em listas de compras e alertas reais.

## 4. As Ramificações (Router)

### Caminho A: Banco de Dados (Supabase/Postgres)
- **Node:** `Postgres`
- **Operation:** `Upsert` (Inserir ou Atualizar)
- **Table:** `inventory`
- **Data:** Mapeie os dados de `inventory_update` para colunas (name, brand, qty, expiry).

### Caminho B: Pesquisa de Preço (Se `has_shopping` = true)
- **Node:** `HTTP Request` (Brave Search / Google Shopping Custom Search)
- **Query:** Usa o campo `shopping_triggers.search_query`.
- **Output:** Pega o menor preço e link.

### Caminho C: Comunicação (WhatsApp)
- **Node:** `HTTP Request` (Evolution API)
- **Endpoint:** `/message/sendText`
- **Payload:**
  ```json
  {
    "number": "SEU_NUMERO",
    "text": "{{ $json.whatsapp_message }}"
  }
  ```

## 5. Dica de Ouro (Lúcio)
Para testar rápido:
1. Crie o workflow só com Webhook -> OpenAI -> Code -> Telegram/WhatsApp.
2. Tire uma foto da sua geladeira.
3. Veja o agente "acordar" e te dizer o que tem lá dentro.
