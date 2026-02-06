# BACKUP CONSOLIDADO - PROJETO VISÃO DE DEUS
# Data: 2026-02-06
# Status: Planejamento Avançado + Código Inicial

---

## 1. DOCUMENTAÇÃO ESTRATÉGICA

### O CONCEITO (VISÃO DE DEUS)
Uma central de comando onisciente para o estoque (doméstico ou comercial).
- **Interface:** Glassmorphism, ícones Apple Style, animações fluidas.
- **Input:** Foto da despensa (Snap & Solve) ou Upload Gamificado.
- **Output:** Inventário automático + Sugestão de Compras.

### FUNCIONALIDADES CHAVE
1. **Reconhecimento Visual (Vision AI):**
   - Lê rótulos, pesos (5kg) e conta itens (3 pacotes).
   - Estima itens abertos ("Azeite pela metade").
   - Web Search automático para comparar preços locais.
2. **O Agente Gestor ("Alfred"):**
   - Personalidade carismática, humor sutil, proativo.
   - Pergunta para aprender ("Esse pote é sal ou açúcar?").
   - Memória Infinita: Guarda faturas e busca documentos antigos.
3. **Logística (Do Virtual ao Real):**
   - B2C: Integração iFood/Bolt Food (Carrinho Automático).
   - B2B: Mensagem direta para Fornecedor via WhatsApp.

---

## 2. DOCUMENTAÇÃO TÉCNICA

### ARQUITETURA DE MEMÓRIA (RAG)
- **Ingestão:** OCR lê faturas -> Extrai Metadados -> Salva Blob (S3) + Vetor (Supabase).
- **Busca:** Usuário pede -> Query no DB -> Retorna Link do Arquivo.

### PIPELINE DE VISÃO
- **Estágio A:** Detecção de Objetos (Separar garrafa de pote).
- **Estágio B:** OCR Semântico (Ler "5kg" e "Vencimento").

---

## 3. CÓDIGOS E PROMPTS (COPY & PASTE)

### PROMPT PARA A IA (VISÃO)
Use este prompt no nó de AI (GPT-4o/Gemini) para ler as imagens:

```text
ROLE: Você é o "Olho de Deus" (God's View Vision System).
INPUT: Imagem de despensa ou produto.
OUTPUT FORMAT: JSON puro.
ESTRUTURA:
{
  "items": [{ "name": "Arroz", "qty": 3, "status": "fechado", "weight": "5kg" }],
  "anomalies": ["Pote sem rótulo"],
  "action_needed": true
}
REGRAS: Estime volumes, conte itens agrupados, liste anomalias para perguntas.
```

### PROMPT PARA O AGENTE (PERSONALIDADE)
Use este prompt no Chatbot que fala com o usuário:

```text
Role: Gestor Inteligente do Ecossistema.
Vibe: Otimista, Leve, Perspicaz (Humor Sutil).
Goal: Manter a casa abastecida gastando o mínimo.
Behavior:
- Viu algo novo? Pergunte ("Isso é pimenta?").
- Viu preço alto? Avise ("Azeite tá caro, espera?").
- Pediu documento? Busque no Cofre ("Tá na mão a fatura de Jan").
```

### CÓDIGO DO PARSER (JAVASCRIPT / N8N)
Lógica para transformar o JSON da IA em Alertas no WhatsApp:

```javascript
// Excerpt from LOGICA_PARSER_N8N.js
const items = JSON.parse($input.all()[0].json.ai_response).items;
const alerts = [];
for (const item of items) {
  if (item.status === 'aberto_final') alerts.push(`⚠️ ${item.name} acabando!`);
  if (isExpiring(item.date)) alerts.push(`⏳ ${item.name} vence logo!`);
}
return { whatsapp_message: `👁️ Vi ${items.length} itens.\n` + alerts.join('\n') };
```

---

## 4. PRÓXIMOS PASSOS
1. **Landing Page:** Criar copy de alta conversão ("O Fim da Lista de Compras").
2. **Protótipo:** Rodar o workflow no n8n com uma foto real.
3. **Vendas:** Iniciar pré-venda com o conceito visual.
