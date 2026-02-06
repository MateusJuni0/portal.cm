# 📥 COMO IMPORTAR WORKFLOWS NO N8N

## WORKFLOW PRINCIPAL CRIADO

✅ **01_GERENTE_WHATSAPP_COMPLETO.json**
- Recepcionista (identifica cliente, horário)
- Classificador (6 intenções)
- Respondedor (respostas inteligentes)
- Escalação automática
- Logs em arquivo
- Pronto pra conectar com OpenClaw

---

## PASSO A PASSO

### 1. ABRIR N8N

**Local:**
```
http://localhost:5678
```

**VPS Hostinger:**
```
http://72.62.179.56:5678
```

Ou EasyPanel se tiver instalado lá.

---

### 2. IMPORTAR WORKFLOW

1. **Clicar em:** Workflows → "+" (New Workflow)
2. **Clicar em:** Menu (3 pontos) → "Import from File"
3. **Selecionar:** `colmeia/workflows/01_GERENTE_WHATSAPP_COMPLETO.json`
4. **Confirmar:** Import
5. ✅ Workflow carregado com todos os nós!

---

### 3. CONFIGURAR WEBHOOK

O workflow já tem um nó **"Webhook WhatsApp"** configurado.

**Pegar a URL do webhook:**

1. Clicar no nó **"Webhook WhatsApp"**
2. Copiar a **Production URL**
3. Exemplo: `https://seu-n8n.com/webhook/whatsapp-cmtec`

Ou se local:
```
http://localhost:5678/webhook-test/whatsapp-cmtec
```

---

### 4. CONECTAR OPENCLAW → N8N

**OPÇÃO A: Via Configuração OpenClaw (Recomendado)**

Editar `C:\Users\mjnol\.openclaw\openclaw.json`:

```json
"channels": {
  "whatsapp": {
    "enabled": true,
    "dmPolicy": "pairing",
    "groupPolicy": "off",
    "webhook": {
      "url": "http://localhost:5678/webhook/whatsapp-cmtec",
      "events": ["message"],
      "method": "POST"
    }
  }
}
```

Reiniciar gateway:
```bash
openclaw gateway restart
```

**OPÇÃO B: Manualmente via Tool**

Se não quiser webhook automático, pode chamar manualmente quando receber mensagem.

---

### 5. ATIVAR WORKFLOW

1. Clicar no **toggle "Active"** (canto superior direito)
2. Workflow fica verde/ativo
3. ✅ Pronto pra receber mensagens!

---

### 6. TESTAR

**Teste 1: Webhook Manual**

No n8n, clicar em **"Execute Workflow"** e testar com:

```json
{
  "from": "+351912345678",
  "pushName": "João",
  "body": "Quanto custa?",
  "message": {
    "conversation": "Quanto custa?"
  }
}
```

Deve processar e retornar resposta sobre preços.

**Teste 2: WhatsApp Real**

- Enviar mensagem pro número conectado
- N8N deve receber automaticamente
- Verificar execuções no n8n (lista à esquerda)
- Ver resposta no WhatsApp

---

## 🔍 ESTRUTURA DO WORKFLOW

### Fluxo Principal:

```
1. Webhook WhatsApp (recebe msg)
   ↓
2. Agente Recepcionista (identifica cliente + horário)
   ↓
3. Verifica Horário
   ├→ Dentro? → Classificador
   └→ Fora? → Resposta Automática
   ↓
4. Agente Classificador (identifica intenção)
   ↓
5. Carregar KB (faq_geral.json)
   ↓
6. Agente Respondedor (gera resposta)
   ↓
7. Precisa Escalar?
   ├→ Sim → Notificação Telegram
   └→ Não → Preparar Envio
   ↓
8. Merge (junta respostas)
   ↓
9. Enviar WhatsApp (responde webhook)
   ↓
10. Salvar Log (arquivo)
```

---

## ⚙️ NÓS IMPORTANTES

### **Webhook WhatsApp**
- Tipo: Webhook
- Path: `whatsapp-cmtec`
- Method: POST
- **Não precisa mudar nada**

### **Agente Recepcionista**
- Tipo: Code (JavaScript)
- Identifica cliente
- Verifica horário (9-20h seg-sex, 10-14h sáb)
- Detecta urgência

### **Agente Classificador**
- Tipo: Code (JavaScript)
- 6 intenções: ORCAMENTO, DEMO, INFO, HUMANO, SUPORTE, RECLAMACAO
- Usa palavras-chave (rápido, barato)

### **Carregar KB FAQs**
- Tipo: Read/Write Files
- Caminho: `C:/Users/mjnol/.openclaw/workspace/colmeia/kb/whatsapp/faq_geral.json`
- **AJUSTAR CAMINHO** se n8n estiver em outro lugar

### **Agente Respondedor**
- Tipo: Code (JavaScript)
- Gera resposta baseada em intenção
- Personaliza com nome do cliente
- Decide se precisa escalar

### **Enviar Resposta WhatsApp**
- Tipo: Respond to Webhook
- Responde ao OpenClaw
- OpenClaw envia pro cliente

### **Salvar Log Arquivo**
- Tipo: Write File
- Salva em: `colmeia/logs/whatsapp_YYYY-MM-DD.log`
- Formato: `timestamp | cliente | intenção | resposta`

---

## 🐛 TROUBLESHOOTING

### Erro: "File not found" no nó KB

**Problema:** Caminho do arquivo KB errado

**Solução:**
1. Clicar no nó **"Carregar KB FAQs"**
2. Ajustar caminho:
   - **Windows:** `C:/Users/mjnol/.openclaw/workspace/colmeia/kb/whatsapp/faq_geral.json`
   - **Linux/Mac:** `/home/user/.openclaw/workspace/colmeia/kb/whatsapp/faq_geral.json`
3. Ou usar caminho relativo se n8n rodar de lá

---

### Erro: "Cannot write to file" no log

**Problema:** Pasta `colmeia/logs/` não existe ou sem permissão

**Solução:**
```bash
mkdir -p C:/Users/mjnol/.openclaw/workspace/colmeia/logs
```

Ou criar manualmente.

---

### Webhook não recebe mensagens

**Problema:** OpenClaw não está enviando pro n8n

**Soluções:**

1. **Verificar URL webhook:**
   - Copiar URL do nó Webhook no n8n
   - Colar exata no openclaw.json
   - Reiniciar gateway

2. **Verificar n8n acessível:**
   ```bash
   curl http://localhost:5678/webhook/whatsapp-cmtec
   ```
   Deve responder (mesmo que erro, mas não "connection refused")

3. **Testar manualmente:**
   - No n8n, clicar "Execute Workflow"
   - Colar JSON teste (acima)
   - Deve funcionar

---

### Resposta não chega no WhatsApp

**Problema:** N8N processa mas OpenClaw não envia

**Solução:**

1. **Verificar nó "Respond to Webhook":**
   - Deve estar conectado
   - Deve ter campo `content` com `={{$json.resposta_final}}`

2. **Verificar logs OpenClaw:**
   ```bash
   openclaw logs
   ```
   Ver se recebeu resposta do n8n

---

## 📊 MONITORAMENTO

### Ver Execuções:

1. N8N → Sidebar esquerda → "Executions"
2. Ver histórico de todas execuções
3. Clicar em qualquer uma pra debug

### Ver Logs:

```bash
cat C:/Users/mjnol/.openclaw/workspace/colmeia/logs/whatsapp_2026-02-02.log
```

Ou abrir no editor.

### Métricas:

Depois de alguns dias, pode adicionar nó pra calcular:
- Tempo resposta médio
- Intenções mais comuns
- Taxa de escalação

---

## 🚀 PRÓXIMOS UPGRADES (Opcional)

### Adicionar LLM Real (Gemini Flash):

1. Adicionar nó **"Google Gemini"** entre Classificador e Respondedor
2. Usar KB como contexto
3. Gerar resposta dinâmica (mais natural)
4. **Custo:** ~$1.50/mês

### Adicionar Supabase CRM:

1. Adicionar nó **"Supabase"**
2. Salvar todas conversas em banco
3. Dashboard de métricas

### Adicionar Telegram Notificações:

1. Adicionar nó **"Telegram"** após escalação
2. Enviar mensagem pro Mateus
3. Com link direto pra conversa

---

## ✅ CHECKLIST FINAL

Antes de considerar pronto:

- [ ] Workflow importado no n8n
- [ ] Webhook URL copiada
- [ ] OpenClaw configurado com webhook
- [ ] Gateway reiniciado
- [ ] Workflow ativado (toggle verde)
- [ ] Teste manual funcionou
- [ ] Teste WhatsApp real funcionou
- [ ] Logs sendo salvos
- [ ] Resposta chegando no WhatsApp

Se todos ✅ → **SISTEMA FUNCIONANDO!** 🎉

---

**Tempo estimado:** 10-15 minutos

**Dificuldade:** Baixa

**Resultado:** WhatsApp totalmente automatizado
