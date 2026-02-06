# ⚡ INSTALAÇÃO SUPER SIMPLES - 2 MINUTOS

Mateus, escolha **UMA** das 3 opções abaixo:

---

## 🎯 OPÇÃO 1: AUTOMÁTICA (Recomendado)

**Se N8N já estiver rodando:**

```bash
cd colmeia/workflows
node instalar-workflow.js
```

✅ **Pronto!** Script faz tudo automaticamente:
- Cria workflow no N8N
- Ativa workflow
- Mostra URL do webhook
- Dá instruções finais

---

## 🖱️ OPÇÃO 2: MANUAL (5 cliques)

**Se preferir fazer na interface:**

1. Abrir N8N: `http://localhost:5678` ou `http://72.62.179.56:5678`
2. Clicar: **Workflows** → **"+"** (novo)
3. Clicar: **Menu (...)** → **"Import from File"**
4. Selecionar: `01_GERENTE_WHATSAPP_COMPLETO.json`
5. Clicar: **Toggle "Active"** (ativar)

✅ **Pronto!** Copiar URL do webhook e configurar no OpenClaw.

---

## 🐳 OPÇÃO 3: INSTALAR N8N PRIMEIRO (Se não tiver)

**Se N8N não estiver instalado:**

### No VPS (Docker):
```bash
ssh root@72.62.179.56

docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Aguardar 10 segundos
sleep 10

# Verificar
curl http://localhost:5678
```

### Ou no EasyPanel:
1. Abrir: `http://72.62.179.56:3000`
2. Login: ID `WDzpfg2cCqidGyG`, senha `nanobananaapi`
3. **"+ Add Service"**
4. Procurar: **"N8N"**
5. Criar
6. Aguardar deploy

Depois disso, usar **OPÇÃO 1** ou **OPÇÃO 2**.

---

## 🔗 DEPOIS DE INSTALAR

### Configurar OpenClaw:

Editar `C:\Users\mjnol\.openclaw\openclaw.json`:

```json
"channels": {
  "whatsapp": {
    "enabled": true,
    "dmPolicy": "pairing",
    "groupPolicy": "off",
    "webhook": {
      "url": "http://localhost:5678/webhook/whatsapp-cmtec",
      "events": ["message"]
    }
  }
}
```

Reiniciar:
```bash
openclaw gateway restart
```

---

## 🧪 TESTAR

```bash
cd colmeia/workflows
node test-webhook.js
```

Ou enviar mensagem real no WhatsApp!

---

## ❓ QUAL USAR?

- **N8N já rodando?** → OPÇÃO 1 (automática)
- **Prefere cliques?** → OPÇÃO 2 (manual)
- **N8N não instalado?** → OPÇÃO 3 → depois OPÇÃO 1

---

## 🆘 PROBLEMAS?

**"N8N não está rodando"**
```bash
# Verificar se está rodando:
curl http://localhost:5678

# Ou no VPS:
curl http://72.62.179.56:5678

# Se não responder: OPÇÃO 3
```

**"Erro ao criar workflow"**
```
- Use OPÇÃO 2 (manual)
- Importar o JSON direto na interface
- Mais fácil e visual
```

**"Não sei onde está o N8N"**
```bash
# Verificar localmente:
curl http://localhost:5678

# Verificar no VPS:
ssh root@72.62.179.56 "docker ps | grep n8n"

# Verificar EasyPanel:
# Abrir http://72.62.179.56:3000 e ver apps
```

---

## ✅ RESUMO

1. **Instalar workflow** (OPÇÃO 1, 2 ou 3)
2. **Copiar URL webhook**
3. **Configurar OpenClaw**
4. **Testar**

**Tempo:** 2-5 minutos

**Resultado:** WhatsApp automatizado funcionando! 🎉
