# 🎯 GERENTE PROSPECTING - Ferramenta Interna CMTec

## IDENTIDADE
**Nome Comercial:** N/A (uso interno)  
**Preço:** N/A  
**Sessão Isolada:** `gerente_prospecting_cmtec`  
**Modelo:** Gemini Flash (scraping) + Sonnet (qualificação)

---

## MISSÃO
Encontrar leads qualificados, fazer abordagens personalizadas, fechar contratos para CMTecnologia.

---

## TIME DE AGENTES

### 1. **SCRAPER** (Agente de Coleta)
**Função:** Extrair dados de leads  
**Fontes:**
- Google Maps API
- Instagram (Playwright)
- Sites (web scraping)
- LinkedIn (se disponível)

**Output:**
```json
{
  "nome": "Clínica dos Jerónimos",
  "endereco": "Belém, Lisboa",
  "telefone": "+351912345678",
  "email": "contato@clinica.pt",
  "site": "https://clinica.pt",
  "instagram": "@clinicajeronimos",
  "numero_avaliacoes": 45,
  "nota_media": 4.5
}
```

**Filtros:**
- Tem telefone WhatsApp
- Tem site OU Instagram
- Avaliações >4.0
- Localização: Lisboa (configurável)

---

### 2. **VALIDADOR** (Agente de Verificação)
**Função:** Confirmar dados e qualidade do lead  
**Ações:**
- Testar site (funciona?)
- Verificar Instagram (ativo?)
- Validar telefone (formato correto?)
- Cross-check com múltiplas fontes

**Qualificação:**
```json
{
  "lead_score": 8.5,
  "motivos": [
    "Site profissional",
    "Instagram ativo (postou há 2 dias)",
    "43 avaliações Google (4.6 estrelas)",
    "WhatsApp confirmado"
  ],
  "dores_identificadas": [
    "Sem sistema de confirmação automática",
    "Comentários mencionam 'esquecimentos'"
  ]
}
```

---

### 3. **QUALIFICADOR** (Agente de Análise)
**Função:** Identificar dor e fit do produto  
**Análises:**
- Avaliações Google (reclamações de no-show?)
- Posts Instagram (mencionam falta de pacientes?)
- Site (tem agendamento online?)

**Exemplo:**
```
Lead: Clínica XYZ
Dor Identificada: 3 reviews mencionam "esperei 1h, paciente não veio"
Fit do Produto: Alto (JARVIS WhatsApp resolve isso)
Abordagem Sugerida: "Vimos que pacientes faltam sem avisar. Resolvemos isso."
```

---

### 4. **ABORDADOR** (Agente de Outreach)
**Função:** Criar mensagens personalizadas  
**Canais:**
- Email
- WhatsApp (Evolution API)
- Instagram DM (Playwright)

**Template Email:**
```
Assunto: [Nome Clínica] - Perdendo 80€ por no-show?

Olá [Nome],

Vi a [Nome Clínica] no Google Maps.

Notei alguns comentários sobre pacientes que faltam.

Cada consulta perdida = -80€ mínimo.

Criamos automação WhatsApp que reduz no-show em 50%+.

Quer ver funcionar? 15min, sem compromisso.

[Link calendário]

Abraço,
JARVIS - CMTecnologia
```

**Personalização:**
- Nome da clínica
- Dor específica identificada
- Prova social relevante

---

### 5. **TRACKER_PROSPECTING** (Agente de Follow-up)
**Função:** Acompanhar respostas e fazer follow-ups  
**Fluxo:**
- D+0: Email inicial
- D+2: Follow-up 1 (se não abriu)
- D+5: Follow-up 2 (se abriu mas não respondeu)
- D+7: Follow-up 3 (última tentativa)
- D+8: Marcar como "não interessado"

**Métricas:**
- Taxa de abertura
- Taxa de resposta
- Demos agendadas
- Conversões

---

### 6. **CLOSER** (Agente de Fechamento)
**Função:** Conduzir demo e fechar contrato  
**Fluxo Demo:**
1. Apresentar sistema funcionando
2. Mostrar ROI claro
3. Responder objeções
4. Oferecer trial gratuito (7 dias)
5. Fechar contrato

**Objeções Comuns:**
```
"Muito caro" → "Quantos pacientes faltam por mês? Se 3, já paga o sistema."
"Preciso pensar" → "Trial grátis 7 dias, sem compromisso. Quer testar?"
"Já tenho sistema" → "Ele envia lembretes automáticos? Reduz no-show?"
```

---

## FLUXO COMPLETO

```
1. SCRAPER
   - Coleta 30 leads/dia (Google Maps: "clínica dentária Lisboa")
   ↓
2. VALIDADOR
   - Valida dados, testa sites, confirma WhatsApp
   - 30 leads → 20 válidos
   ↓
3. QUALIFICADOR
   - Analisa fit, identifica dores
   - 20 válidos → 15 qualificados (score >7)
   ↓
4. ABORDADOR
   - Envia email personalizado
   - 15 enviados
   ↓
5. TRACKER
   - 3 abriram (20%)
   - 1 respondeu (33% dos abertos)
   ↓
6. CLOSER
   - 1 demo agendada
   - 1 trial ativado
   - 1 contrato fechado (meta: 100% conversão demo→contrato)
```

---

## BASE DE CONHECIMENTO

```
/gerente_prospecting/kb/
  ├── nichos_target.json
  ├── dores_identificadas.json
  ├── objecoes_respostas.json
  ├── templates_abordagem/
  │   ├── email_inicial.md
  │   ├── email_followup1.md
  │   ├── email_followup2.md
  │   └── whatsapp_intro.md
  ├── casos_sucesso.json
  └── metricas_conversao.json
```

---

## CONFIGURAÇÃO

```json
{
  "prospecting": {
    "nicho_atual": "clinicas_dentarias",
    "localizacao": "Lisboa, Portugal",
    "leads_por_dia": 30,
    "max_followups": 3,
    "canais": ["email", "whatsapp"],
    "lead_score_minimo": 7.0,
    "filtros": {
      "avaliacoes_min": 4.0,
      "tem_whatsapp": true,
      "tem_presenca_online": true
    }
  }
}
```

---

## INSTRUÇÕES PARA GEMINI FLASH

1. **Scraping diário:** 30 leads novos
2. **Validação rigorosa:** Testar TODOS os dados
3. **Personalização obrigatória:** Nunca enviar template genérico
4. **Follow-up disciplinado:** D+2, D+5, D+7 exatos
5. **Logar tudo:** Cada lead, cada interação
6. **Métricas diárias:** Taxa de abertura, resposta, conversão
7. **Aprender com "não":** Por que rejeitaram? Atualizar KB

---

**Criado:** 2026-02-02  
**Autor:** JARVIS (Claude Sonnet 4.5)  
**Status:** ESPECIFICAÇÃO COMPLETA  
**Uso:** Interno CMTec (não vendável)
