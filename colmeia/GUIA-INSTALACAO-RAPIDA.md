# ⚡ GUIA INSTALAÇÃO RÁPIDA - 15 MINUTOS

## OBJETIVO
Sistema WhatsApp automatizado funcionando em 15 minutos.

---

## PRÉ-REQUISITOS
- ✅ OpenClaw instalado e rodando
- ✅ N8N instalado (ou acesso web)
- ✅ WhatsApp Business ou pessoal disponível

---

## PASSO 1: ATIVAR WHATSAPP NO OPENCLAW (5 min)

### 1.1 Editar configuração

Abrir: `C:\Users\mjnol\.openclaw\openclaw.json`

Adicionar na seção `channels`:

```json
"channels": {
  "telegram": { 
    ... mantém o que já existe ...
  },
  "whatsapp": {
    "enabled": true,
    "dmPolicy": "pairing",
    "groupPolicy": "off",
    "capabilities": {
      "inlineButtons": false
    },
    "streamMode": "final"
  }
}
```

### 1.2 Reiniciar gateway

```bash
openclaw gateway restart
```

### 1.3 Parear WhatsApp

OpenClaw vai mostrar QR Code no terminal ou web.

- Abrir WhatsApp no celular
- Ir em Configurações → Aparelhos conectados
- Escanear QR Code
- ✅ Conectado!

---

## PASSO 2: IMPORTAR WORKFLOW N8N (5 min)

### 2.1 Abrir N8N

```bash
# Se local:
http://localhost:5678

# Se VPS:
http://72.62.179.56:5678
```

### 2.2 Importar workflow

1. Clicar: **"Import from File"**
2. Selecionar: `colmeia/workflows/GERENTE_WHATSAPP_BASICO.json`
3. Clicar: **"Import"**
4. ✅ Workflow carregado!

### 2.3 Ativar workflow

1. Clicar no toggle **"Active"** (canto superior direito)
2. ✅ Workflow ativo!

### 2.4 Copiar URL do Webhook

1. Clicar no nó **"Webhook WhatsApp"**
2. Copiar a URL (algo como: `http://localhost:5678/webhook/whatsapp-inbound`)
3. Guardar para próximo passo

---

## PASSO 3: CONECTAR OPENCLAW → N8N (2 min)

**OPÇÃO A: Se n8n recebe mensagens diretamente via OpenClaw**

Adicionar no `openclaw.json`:

```json
"channels": {
  "whatsapp": {
    "enabled": true,
    "dmPolicy": "pairing",
    "groupPolicy": "off",
    "webhook": {
      "url": "http://localhost:5678/webhook/whatsapp-inbound",
      "events": ["message"]
    }
  }
}
```

**OPÇÃO B: Se OpenClaw processa e depois chama n8n (recomendado inicialmente)**

Não precisa webhook. OpenClaw processa direto e você chama n8n manualmente quando quiser.

Reiniciar gateway:
```bash
openclaw gateway restart
```

---

## PASSO 4: TESTAR (3 min)

### 4.1 Enviar mensagem teste

- Pegar outro celular ou WhatsApp Web
- Enviar mensagem pro número conectado: **"Quanto custa?"**

### 4.2 Verificar resposta

Deve responder:
> "Olá! WhatsApp automatizado começa em 100€/mês. Instagram +50€. Completo 180€. Quer proposta pro teu negócio específico?"

### 4.3 Verificar logs

```bash
cat colmeia/logs/whatsapp_2026-02-02.log
```

Deve ter registrado:
```
2026-02-02 10:15:30 | Cliente: +351... | Intenção: ORCAMENTO | Resposta: Olá! WhatsApp...
```

---

## ✅ FUNCIONANDO!

Se os 3 pontos acima funcionaram:
- ✅ WhatsApp conectado
- ✅ N8N processando
- ✅ Logs salvando

**Sistema está ONLINE!**

---

## PRÓXIMOS PASSOS

### MELHORAR KB (Opcional, mas recomendado)

1. Editar: `colmeia/kb/whatsapp/faq_geral.json`
2. Adicionar perguntas específicas do seu negócio
3. Reiniciar workflow n8n (desativar e ativar)
4. Testar novas perguntas

### ADICIONAR LLM REAL (Upgrade)

Workflow atual usa respostas fixas (rápido, barato).

Para respostas dinâmicas:

1. No n8n, adicionar nó **"Google Gemini"** ou **"OpenAI"**
2. Conectar após o classificador
3. Usar KB como contexto
4. Gerar resposta personalizada

### ATIVAR PROSPECTING

Quando quiser buscar clientes:

```bash
# Ler arquivo:
cat colmeia/04-GERENTE-PROSPECTING.md

# Criar workflow separado para scraping
```

---

## TROUBLESHOOTING

### WhatsApp não conecta
- Verificar se `openclaw.json` está correto
- Reiniciar gateway: `openclaw gateway restart`
- Tentar QR Code novamente

### N8N não recebe mensagens
- Verificar se workflow está **ATIVO**
- Verificar URL webhook no OpenClaw
- Testar webhook manualmente com curl

### Resposta não chega
- Verificar logs n8n (execuções)
- Verificar logs OpenClaw
- Verificar console do n8n por erros

### Resposta errada
- Verificar classificador (intenção correta?)
- Editar respostas no nó **Respondedor**
- Reativar workflow

---

## CUSTOS ESTIMADOS

### Setup Atual (Respostas Fixas):
- Tokens: ~0 (sem LLM)
- Infraestrutura: R$0 (local)
- **TOTAL: R$0/mês** ✅

### Com LLM (Gemini Flash):
- Tokens: ~500/mensagem
- 100 mensagens/dia = 50k tokens/dia
- 1.5M tokens/mês = ~$1.50/mês
- **TOTAL: $1.50/mês** ✅

---

## SUPORTE

**Problemas?**
1. Verificar logs: `colmeia/logs/`
2. Consultar: `colmeia/README.md`
3. Testar passo a passo este guia novamente

**Dúvidas técnicas?**
- Ler: `01-GERENTE-WHATSAPP.md` (especificação completa)
- Ler: `workflows/README-WORKFLOWS.md` (detalhes workflows)

---

**Tempo total:** 15 minutos  
**Complexidade:** Baixa  
**Resultado:** Sistema automatizado funcional

🎉 **PRONTO PARA USAR!**
