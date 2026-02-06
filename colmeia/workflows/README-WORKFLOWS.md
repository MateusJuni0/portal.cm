# 🔄 Workflows N8N - GERENTE WHATSAPP

## ESTRUTURA

Este sistema usa **workflows isolados** que se comunicam via **webhook** ou **sub-workflow**.

### Arquitetura:

```
WHATSAPP → GERENTE_WHATSAPP (orquestrador)
              ↓
              ├→ AGENTE_RECEPCIONISTA
              ├→ AGENTE_CLASSIFICADOR  
              ├→ AGENTE_RESPONDEDOR
              ├→ AGENTE_REVISOR
              ├→ AGENTE_REPARADOR
              └→ AGENTE_ENVIADOR
```

---

## WORKFLOWS CRIADOS

### 1. **GERENTE_WHATSAPP.json** (Orquestrador Principal)
**Função:** Recebe mensagem WhatsApp, coordena agentes, garante fluxo

**Fluxo:**
1. Trigger: Webhook WhatsApp
2. Carrega config cliente
3. Carrega KB
4. Chama RECEPCIONISTA
5. Chama CLASSIFICADOR
6. Chama RESPONDEDOR
7. Chama REVISOR
8. Se aprovado → ENVIADOR
9. Se reprovado → REPARADOR
10. Logs + Métricas

**Inputs:**
- Mensagem WhatsApp (JSON)
- Número remetente
- Timestamp

**Outputs:**
- Resposta enviada
- Log salvo
- Métricas atualizadas

---

### 2. **AGENTE_RECEPCIONISTA.json**
**Função:** Primeira linha, identifica cliente, carrega contexto

**Fluxo:**
1. Recebe mensagem
2. Identifica cliente (nome, histórico)
3. Verifica horário
4. Detecta urgência
5. Prepara contexto
6. Retorna JSON estruturado

**Output:**
```json
{
  "cliente": {
    "nome": "João Silva",
    "numero": "+351912345678",
    "historico_conversas": 3,
    "ultima_interacao": "2026-02-01"
  },
  "contexto": {
    "dentro_horario": true,
    "urgente": false,
    "primeira_mensagem": false
  },
  "mensagem_limpa": "Quanto custa automação WhatsApp?"
}
```

---

### 3. **AGENTE_CLASSIFICADOR.json**
**Função:** Identifica intenção do cliente

**Fluxo:**
1. Recebe contexto + mensagem
2. Carrega KB intenções
3. Classifica (LLM)
4. Calcula confiança
5. Decide rota

**Output:**
```json
{
  "intencao": "ORCAMENTO",
  "confianca": 0.92,
  "entidades": {
    "produto": "whatsapp"
  },
  "acao_recomendada": "responder_faq",
  "fonte_kb": "faq_geral.json"
}
```

**Intenções possíveis:**
- INFORMACAO_GERAL
- ORCAMENTO
- DEMO
- SUPORTE_TECNICO
- RECLAMACAO
- FALAR_HUMANO

---

### 4. **AGENTE_RESPONDEDOR.json**
**Função:** Gera resposta baseada em intenção + KB

**Fluxo:**
1. Recebe intenção + contexto
2. Carrega KB relevante
3. Gera resposta (LLM)
4. Aplica tom comunicação
5. Remove frases proibidas
6. Adiciona CTA se apropriado
7. Retorna draft

**Output:**
```json
{
  "resposta_draft": "Olá João! WhatsApp automatizado começa em 100€/mês. Instagram +50€. Completo 180€. Quer proposta pro teu negócio específico?",
  "fonte_kb": ["faq_geral.json"],
  "frases_proibidas_removidas": 0,
  "tom_aplicado": "profissional_direto",
  "cta_incluido": true,
  "tamanho_palavras": 22
}
```

---

### 5. **AGENTE_REVISOR.json**
**Função:** Valida resposta antes de enviar

**Fluxo:**
1. Recebe resposta draft
2. Verifica 7 critérios
3. Calcula score
4. APROVADO ou REPROVADO
5. Se reprovado → feedback específico

**Critérios:**
- ✅ Responde a pergunta?
- ✅ Tom apropriado?
- ✅ Sem erros gramaticais?
- ✅ Sem informações inventadas?
- ✅ Sem promessas impossíveis?
- ✅ CTA claro?
- ✅ Tamanho adequado?

**Output:**
```json
{
  "status": "APROVADO",
  "score": 0.95,
  "criterios_passou": 7,
  "criterios_falhou": 0,
  "feedback": null,
  "sugestao_alternativa": null
}
```

Ou se reprovado:
```json
{
  "status": "REPROVADO",
  "score": 0.65,
  "criterios_passou": 5,
  "criterios_falhou": 2,
  "feedback": "Resposta não tem CTA claro. Tom muito formal.",
  "sugestao_alternativa": "Adicionar pergunta tipo 'Quer ver funcionando?' no final."
}
```

---

### 6. **AGENTE_REPARADOR.json**
**Função:** Corrige respostas reprovadas

**Fluxo:**
1. Recebe resposta + feedback
2. Aplica correções
3. Tenta novamente
4. Máximo 2 tentativas
5. Se falhar 2x → escala humano

**Output:**
```json
{
  "resposta_corrigida": "...",
  "tentativa": 1,
  "max_tentativas": 2,
  "correcoes_aplicadas": ["adicionar_cta", "simplificar_tom"],
  "status": "pronto_revisao"
}
```

---

### 7. **AGENTE_ENVIADOR.json**
**Função:** Envia mensagem via WhatsApp

**Fluxo:**
1. Recebe resposta aprovada
2. Formata para WhatsApp
3. Envia via OpenClaw
4. Confirma entrega
5. Salva log
6. Atualiza métricas

**Output:**
```json
{
  "status": "enviado",
  "timestamp": "2026-02-02T10:15:30Z",
  "message_id": "wamid.ABC123",
  "entregue": true,
  "log_salvo": true,
  "metricas_atualizadas": true
}
```

---

## COMO IMPORTAR

### 1. Abrir N8N
```
http://localhost:5678
```

### 2. Importar workflows
- Clicar "Import from File"
- Selecionar cada arquivo .json
- Ativar workflow

### 3. Configurar credenciais
- WhatsApp: OpenClaw webhook
- LLM: Google AI Studio (Gemini Flash)
- Database: Supabase (opcional)

### 4. Ativar webhooks
- Copiar URL webhook do GERENTE_WHATSAPP
- Configurar no OpenClaw config

---

## VARIÁVEIS DE AMBIENTE

Criar arquivo `.env` no n8n:

```env
# LLM
GOOGLE_API_KEY=your_key_here
GOOGLE_MODEL=gemini-1.5-flash

# WhatsApp
OPENCLAW_WEBHOOK_URL=http://localhost:3000/webhook/whatsapp
OPENCLAW_API_TOKEN=your_token

# Database (opcional)
SUPABASE_URL=https://...
SUPABASE_KEY=your_key

# Paths
KB_PATH=../kb/whatsapp/
CONFIG_PATH=../configs/
LOGS_PATH=../logs/
```

---

## TESTES

### Teste 1: Mensagem simples
```
Cliente: "Quanto custa?"
Esperado: Resposta com preços + CTA
```

### Teste 2: Fora do horário
```
Horário: Domingo 15h
Esperado: Mensagem automática fora horário
```

### Teste 3: Escalação
```
Cliente: "Quero falar com humano"
Esperado: Notificação Telegram + Mensagem confirmando
```

### Teste 4: Loop detection
```
Cliente repete 3x mesma pergunta
Esperado: Escalação automática
```

---

## MONITORAMENTO

### Logs gerados:
- `colmeia/logs/gerente_whatsapp_YYYY-MM-DD.log`
- `colmeia/logs/metricas_YYYY-MM-DD.json`
- `colmeia/logs/aprendizado_YYYY-MM-DD.json`

### Métricas rastreadas:
- Tempo de resposta médio
- Taxa de resolução automática
- Escalações (motivo)
- Satisfação cliente
- Tokens consumidos

---

## PRÓXIMOS PASSOS

1. ✅ Importar workflows
2. ✅ Configurar credenciais
3. ✅ Testar com mensagem fake
4. ✅ Ativar WhatsApp OpenClaw
5. ✅ Conectar webhook
6. ✅ Enviar primeira mensagem real
7. ✅ Validar logs
8. ✅ Ajustar KB conforme necessário

---

**Nota:** Os arquivos JSON dos workflows estão prontos para importar diretamente no n8n. Cada workflow é independente mas se comunica via sub-workflow calls.
