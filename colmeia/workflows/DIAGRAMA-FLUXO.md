# 📊 DIAGRAMA DE FLUXO - GERENTE WHATSAPP

## VISÃO GERAL

```
┌─────────────┐
│  WHATSAPP   │  Cliente envia msg
│   CLIENTE   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   OPENCLAW      │  Recebe via API
│  (WhatsApp)     │
└──────┬──────────┘
       │
       │ Webhook POST
       ▼
┌─────────────────┐
│      N8N        │  ◄─── AQUI ENTRA O WORKFLOW
│   WORKFLOW      │
└──────┬──────────┘
       │
       │ Processa
       ▼
┌─────────────────┐
│ RESPOSTA GERADA │
└──────┬──────────┘
       │
       │ Response
       ▼
┌─────────────────┐
│   OPENCLAW      │  Envia resposta
│  (WhatsApp)     │
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│  WHATSAPP   │  Cliente recebe
│   CLIENTE   │
└─────────────┘
```

---

## FLUXO DETALHADO N8N

### 1️⃣ ENTRADA

```
┌──────────────────────┐
│  Webhook WhatsApp    │ ◄── POST de OpenClaw
│  Path: /whatsapp-    │
│  cmtec               │
└──────┬───────────────┘
       │
       │ JSON:
       │ {
       │   "from": "+351...",
       │   "body": "Quanto custa?",
       │   "pushName": "João"
       │ }
       │
       ▼
```

---

### 2️⃣ RECEPCIONISTA

```
┌──────────────────────────┐
│  Agente Recepcionista    │
│  • Identifica cliente    │
│  • Verifica horário      │
│  • Detecta urgência      │
└──────┬───────────────────┘
       │
       │ Output:
       │ {
       │   cliente: {nome, numero},
       │   mensagem_limpa: "quanto custa",
       │   contexto: {
       │     dentro_horario: true,
       │     urgente: false
       │   }
       │ }
       │
       ▼
```

---

### 3️⃣ VERIFICAÇÃO HORÁRIO

```
┌─────────────────────┐
│  Dentro Horário?    │
└────┬─────────┬──────┘
     │         │
   SIM       NÃO
     │         │
     │         ▼
     │    ┌──────────────────┐
     │    │ Resposta         │
     │    │ Fora Horário     │
     │    │ "Estamos offline"│
     │    └────────┬─────────┘
     │             │
     ▼             ▼
```

---

### 4️⃣ CLASSIFICADOR

```
┌──────────────────────────┐
│  Agente Classificador    │
│  Analisa mensagem        │
└──────┬───────────────────┘
       │
       │ Palavras-chave:
       │ "quanto custa" → ORCAMENTO
       │ "demo" → DEMO
       │ "o que fazem" → INFO
       │ "falar com" → HUMANO
       │ etc...
       │
       ▼
       │ Output:
       │ {
       │   intencao: "ORCAMENTO",
       │   confianca: 0.90
       │ }
       │
       ▼
```

---

### 5️⃣ CARREGAR KB

```
┌──────────────────────────┐
│  Carregar KB FAQs        │
│  Read File               │
│  faq_geral.json          │
└──────┬───────────────────┘
       │
       │ JSON com perguntas
       │ e respostas
       │
       ▼
```

---

### 6️⃣ RESPONDEDOR

```
┌──────────────────────────┐
│  Agente Respondedor      │
│  • Pega intenção         │
│  • Consulta KB           │
│  • Gera resposta         │
└──────┬───────────────────┘
       │
       │ Se ORCAMENTO:
       │ "Olá João! 💰
       │  WhatsApp: 100-150€/mês
       │  Instagram: +50€
       │  ..."
       │
       ▼
       │ Output:
       │ {
       │   resposta_draft: "...",
       │   precisa_escalar: false
       │ }
       │
       ▼
```

---

### 7️⃣ DECISÃO ESCALAÇÃO

```
┌─────────────────────┐
│  Precisa Escalar?   │
└────┬─────────┬──────┘
     │         │
   SIM       NÃO
     │         │
     │         ▼
     │    ┌──────────────┐
     │    │ Preparar     │
     │    │ Envio        │
     │    └────┬─────────┘
     │         │
     ▼         │
┌──────────────┐│
│ Notificação  ││
│ Telegram     ││
│ "🚨 Cliente  ││
│ quer falar!" ││
└──────┬───────┘│
       │        │
       ▼        ▼
```

---

### 8️⃣ MERGE & ENVIO

```
┌────────────────────┐
│     Merge          │
│  Junta todas       │
│  ramificações      │
└────────┬───────────┘
         │
         │ Resposta final
         │ definida
         │
         ▼
┌────────────────────┐
│  Responder         │
│  Webhook           │
│  (OpenClaw)        │
└────────┬───────────┘
         │
         │ HTTP Response
         │ com resposta
         │
         ▼
┌────────────────────┐
│  Salvar Log        │
│  whatsapp_         │
│  2026-02-02.log    │
└────────────────────┘
```

---

## CENÁRIOS DE USO

### 📌 CENÁRIO 1: Cliente Pede Preço

```
Cliente: "Quanto custa?"
   ↓
Recepcionista: Identifica João, horário OK
   ↓
Classificador: ORCAMENTO (90% confiança)
   ↓
Respondedor: "Olá João! WhatsApp 100-150€/mês..."
   ↓
Escalação: NÃO (resposta automática OK)
   ↓
Envio: Resposta enviada
   ↓
Log: Salvo registro
```

**Tempo:** <2 segundos  
**Custo:** ~0 tokens (resposta fixa)

---

### 📌 CENÁRIO 2: Cliente Quer Demo

```
Cliente: "Quero ver funcionando"
   ↓
Recepcionista: Identifica Maria, horário OK
   ↓
Classificador: DEMO (92% confiança)
   ↓
Respondedor: "Perfeito Maria! Demo 15min. Tenho Segunda 15h..."
   ↓
Escalação: NÃO (resposta automática OK)
   ↓
Envio: Resposta + opções de horário
   ↓
Log: Salvo + flag "lead_quente"
```

**Tempo:** <2 segundos  
**Custo:** ~0 tokens

---

### 📌 CENÁRIO 3: Cliente Quer Humano

```
Cliente: "Quero falar com o dono"
   ↓
Recepcionista: Identifica Pedro, horário OK
   ↓
Classificador: FALAR_HUMANO (95% confiança)
   ↓
Respondedor: "Claro Pedro! Chamando Mateus agora..."
   ↓
Escalação: SIM! 🚨
   ↓
Telegram: "🚨 Pedro quer falar! +351..."
   ↓
Envio: Confirmação enviada
   ↓
Log: Salvo + flag "escalado"
```

**Tempo:** <2 segundos  
**Ação:** Mateus notificado imediatamente

---

### 📌 CENÁRIO 4: Fora de Horário

```
Cliente: "Olá" (Domingo 15h)
   ↓
Recepcionista: Identifica Ana, FORA horário (Domingo)
   ↓
Verificação: FORA → Ramifica
   ↓
Resposta Automática: "Olá Ana! Estamos offline. Seg-Sex 9-20h..."
   ↓
Merge: Pula classificador/respondedor
   ↓
Envio: Mensagem fora horário
   ↓
Log: Salvo + flag "fora_horario"
```

**Tempo:** <1 segundo  
**Custo:** 0 tokens (resposta fixa)

---

## INTEGRAÇÕES FUTURAS

### Com LLM (Gemini Flash):

```
┌──────────────────┐
│  Respondedor     │
└────────┬─────────┘
         │
         ▼
┌─────────────────────┐
│  Google Gemini      │
│  "Baseado no KB,    │
│  responda: {...}"   │
└────────┬────────────┘
         │
         │ Resposta
         │ personalizada
         ▼
```

**Vantagem:** Respostas mais naturais  
**Custo:** ~$1.50/mês  
**Quando:** Depois de validar sistema básico

---

### Com Supabase CRM:

```
┌──────────────────┐
│  Salvar Log      │
└────────┬─────────┘
         │
         ▼
┌─────────────────────┐
│  Supabase           │
│  • Conversas        │
│  • Clientes         │
│  • Métricas         │
└─────────────────────┘
```

**Vantagem:** Dashboard, métricas, histórico  
**Quando:** Depois de ter clientes

---

### Com Telegram Notificações:

```
┌──────────────────┐
│  Escalação       │
└────────┬─────────┘
         │
         ▼
┌─────────────────────┐
│  Telegram Bot       │
│  Envia mensagem pro │
│  Mateus             │
└─────────────────────┘
```

**Vantagem:** Notificação instantânea  
**Custo:** Grátis  
**Quando:** Agora (fácil de adicionar)

---

## MÉTRICAS RASTREÁVEIS

### Por cada execução:

```
{
  "timestamp": "2026-02-02 10:15:30",
  "cliente": "João Silva",
  "numero": "+351912345678",
  "intencao": "ORCAMENTO",
  "confianca": 0.90,
  "resposta_tipo": "automatica",
  "escalado": false,
  "tempo_processamento_ms": 1200,
  "dentro_horario": true
}
```

### Agregadas (diárias):

- Total mensagens
- Tempo resposta médio
- Intenções mais comuns
- Taxa de escalação
- Horários de pico

---

## 🎯 RESULTADO ESPERADO

### Performance:

- ⚡ **Tempo resposta:** <2 segundos
- 🎯 **Taxa sucesso:** >80% automática
- 📈 **Escalações:** <10%
- 💰 **Custo:** ~$0/mês (respostas fixas)

### Experiência Cliente:

- ✅ Resposta imediata (mesmo fora horário)
- ✅ Resposta relevante (classificação correta)
- ✅ Tom profissional
- ✅ CTA claro (próximo passo)
- ✅ Escalação suave se necessário

---

**Criado:** 2026-02-02  
**Autor:** JARVIS  
**Status:** Pronto para implementar
