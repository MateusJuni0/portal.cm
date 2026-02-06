# 📥 COMO IMPORTAR OS WORKFLOWS

Criei 3 workflows prontos para importar no N8N:

---

## 📁 ARQUIVOS CRIADOS

### 1. **02_GERENTE_PROSPECTING.json** ⭐ PRIORIDADE
**Função:** Buscar clientes automaticamente

**O que faz:**
- Roda todo dia às 8h (seg-sex)
- Busca leads de clínicas no Google Maps
- Filtra os melhores (score >30)
- Personaliza email para cada um
- Envia email automático
- Delay de 60s entre cada email
- Registra tudo

**Nós:** 9 agentes

---

### 2. **03_SISTEMA_METRICAS.json**
**Função:** Relatório diário automático

**O que faz:**
- Roda todo dia às 23h
- Coleta métricas de todos sistemas
- Calcula KPIs importantes
- Gera relatório formatado
- Envia pro Telegram
- Salva histórico

**Nós:** 6 agentes

---

### 3. **04_INTEGRADOR_SISTEMAS.json** 🔗
**Função:** Hub central de eventos

**O que faz:**
- Recebe eventos de todos workflows
- Classifica tipo (lead, demo, cliente, escalação)
- Processa cada um diferente
- Notifica Telegram formatado
- Registra tudo

**Eventos:**
- 🎯 Lead qualificado
- 📅 Demo agendada
- 🎉 Cliente fechado
- 🚨 Escalação urgente

**Nós:** 10 agentes

**Webhook:** `https://n8n.obraoliveira.pt/webhook/eventos-internos`

---

## 🚀 IMPORTAR NO N8N (cada um):

1. **Abrir:** https://n8n.obraoliveira.pt/
2. **Login:** cmtecnologia12@gmail.com / 8zSz57JMBncnptX
3. **Workflows** → **"+"** (novo)
4. **Menu (...)** → **"Import from File"**
5. **Selecionar arquivo:**
   - `02_GERENTE_PROSPECTING.json` (prioridade)
   - `03_SISTEMA_METRICAS.json`
6. **Confirmar import**
7. **Ativar** (toggle verde)

---

## ⚙️ CONFIGURAR DEPOIS DE IMPORTAR

### PROSPECTING:

**Configurar credenciais Gmail:**
1. Clicar no nó **"Enviar Email"**
2. Clicar em **"Credentials"**
3. Criar credencial **"Gmail CMTec"**:
   - Email: cmtecnologia12@gmail.com
   - Senha app: (precisa criar em myaccount.google.com/apppasswords)
4. Salvar

**Ajustar horário (opcional):**
1. Clicar no nó **"Agendar Diário"**
2. Mudar cron: `0 8 * * 1-5` (8h seg-sex)
3. Exemplo 10h: `0 10 * * 1-5`

---

### MÉTRICAS:

**Configurar Telegram:**
1. Clicar no nó **"Enviar p/ Telegram"**
2. Criar credencial **"JARVIS CMTec Bot"**:
   - Bot Token: 8597883976:AAGehBq2UsDdFzFDMd-GGFENPZ6fjzCpxqE
3. Chat ID já está: 5424764861 (seu ID)
4. Salvar

---

## 🧪 TESTAR

### Prospecting:
1. Abrir workflow **GERENTE_PROSPECTING_CMTec**
2. Clicar **"Execute Workflow"** (testar manualmente)
3. Ver execuções (sidebar esquerda)
4. Verificar se emails foram enviados
5. ✅ Se funcionou: deixar ativo pra rodar diariamente

### Métricas:
1. Abrir workflow **SISTEMA_METRICAS_CMTec**
2. Clicar **"Execute Workflow"**
3. Verificar Telegram (deve receber relatório)
4. ✅ Se funcionou: deixar ativo

---

## 🔗 CONECTAR COM WHATSAPP (já feito)

O workflow WhatsApp já está criado e funcionando:
- **Nome:** GERENTE_WHATSAPP_CMTec
- **Webhook:** https://n8n.obraoliveira.pt/webhook/whatsapp-cmtec
- **Status:** ✅ Ativo

Só precisa configurar no OpenClaw (`openclaw.json`):

```json
"webhook": {
  "url": "https://n8n.obraoliveira.pt/webhook/whatsapp-cmtec",
  "events": ["message"]
}
```

---

## 📊 SISTEMA COMPLETO QUANDO TUDO ESTIVER ATIVO:

```
WhatsApp (ativo) ────┐
                     │
Prospecting (ativo) ─┼──→ Métricas (23h)
                     │        │
Instagram (futuro) ──┘        └──→ Telegram
```

**WhatsApp:** Responde clientes 24/7  
**Prospecting:** Busca 30 leads/dia às 8h  
**Métricas:** Relatório diário às 23h  

---

## ⚠️ IMPORTANTE

### Prospecting - Leads Reais:

Por enquanto o workflow usa **leads de exemplo** para testar.

Para buscar leads reais de Google Maps, você precisa:
1. Criar conta Google Cloud Platform
2. Ativar Places API
3. Pegar API Key
4. Substituir o nó "Buscar Leads" por chamada API real

**OU** usar scraping alternativo (Apify, Bright Data, etc)

Por enquanto, **teste com os leads de exemplo** para validar que email funciona.

---

## 🎯 ORDEM DE PRIORIDADE:

1. ✅ **WhatsApp** (já ativo!)
2. ⭐ **Prospecting** (importar AGORA)
3. 📊 **Métricas** (importar depois)
4. 📸 **Instagram** (futuro)

---

## 🆘 PROBLEMAS?

**"Missing credentials"**
→ Configurar Gmail e Telegram conforme acima

**"Cron expression invalid"**
→ Usar: `0 8 * * 1-5` (certo)

**"Email not sent"**
→ Criar senha app Gmail: https://myaccount.google.com/apppasswords

**"Telegram error"**
→ Verificar bot token correto

---

## ✅ CHECKLIST:

- [ ] Importar GERENTE_PROSPECTING
- [ ] Configurar credencial Gmail
- [ ] Testar envio de email
- [ ] Ativar workflow
- [ ] Importar SISTEMA_METRICAS
- [ ] Configurar credencial Telegram
- [ ] Testar relatório
- [ ] Ativar workflow
- [ ] Verificar no dia seguinte se rodou

---

**Tempo total:** 10-15 minutos  
**Resultado:** Sistema completo automatizado! 🚀
