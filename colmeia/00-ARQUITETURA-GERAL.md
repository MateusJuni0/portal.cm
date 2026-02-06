# 🏗️ ARQUITETURA COLMEIA - CMTecnologia

## FILOSOFIA
Sistema modular de automação baseado em **agentes especializados** trabalhando em **times isolados**.

Cada **GERENTE** é um **produto vendável** com seu próprio time de agentes.

---

## HIERARQUIA

```
┌──────────────────────────────────────────┐
│           CEO (Humano + JARVIS)          │
│   Estratégia, Aprovações, Vendas         │
└────────────────┬─────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌─────────────┐         ┌─────────────┐
│  GERENTES   │         │  GERENTES   │
│  (PRODUTOS) │         │  (PRODUTOS) │
└─────────────┘         └─────────────┘
```

---

## PRODUTOS (GERENTES)

Cada GERENTE é um **módulo comercial independente**:

### 1. **GERENTE WHATSAPP** (Produto Principal)
**Preço:** 100-150€/mês  
**Função:** Automação completa de atendimento, confirmações, agendamentos  
**Time Próprio:** Recepcionista, Classificador, Respondedor, Agendador, Revisor  

### 2. **GERENTE INSTAGRAM** (Add-on)
**Preço:** +50€/mês  
**Função:** Gestão de posts, stories, DMs, comentários  
**Time Próprio:** Redator, Designer, Publicador, Monitor, Engajador  

### 3. **GERENTE EMAIL** (Add-on)
**Preço:** +30€/mês  
**Função:** Emails automáticos, follow-ups, newsletters  
**Time Próprio:** Copywriter, Enviador, Tracker, Otimizador  

### 4. **GERENTE PROSPECTING** (Uso Interno CMTec)
**Preço:** N/A (ferramenta interna)  
**Função:** Buscar leads, qualificar, fazer abordagens  
**Time Próprio:** Scraper, Qualificador, Abordador, Tracker  

### 5. **GERENTE CRM** (Backbone)
**Preço:** Incluído no pacote base  
**Função:** Centralizar dados, métricas, histórico  
**Time Próprio:** Coletor, Organizador, Analisador, Reportador  

---

## PRINCÍPIOS DE DESIGN

### 1. **Isolamento Total**
- Cada gerente opera em **sessão própria** isolada
- Erro no Instagram **NÃO afeta** WhatsApp
- Debugging é **específico por gerente**

### 2. **Times Especializados**
- Agentes dentro de um time **só fazem aquela função**
- Redator do Instagram **não escreve** emails
- Designer do Instagram **não cria** PDFs

### 3. **Camadas de Verificação**
```
Executor → Revisor → Reparador → Gerente → CEO
```

### 4. **Aprendizado Contínuo**
- Cada gerente tem **base de conhecimento própria**
- Erros são capturados e viram **casos de treino**
- Perguntas repetidas viram **FAQ automática**

### 5. **Templates Configuráveis**
- Cada cliente tem **config.json específico**
- Ativar/desativar gerentes por cliente
- Customizar tom, horários, regras

---

## FLUXO DE COMUNICAÇÃO

### Entre Gerentes:
```
GERENTE_WHATSAPP → GERENTE_CRM (salvar dados)
GERENTE_INSTAGRAM → GERENTE_CRM (métricas)
GERENTE_PROSPECTING → GERENTE_CRM (leads)
```

### Dentro de um Time:
```
RECEPCIONISTA → CLASSIFICADOR → RESPONDEDOR → REVISOR → ENVIADOR
                                      ↓
                                 REPARADOR (se erro)
```

### Escalação para Humano:
```
Qualquer Agente → Gerente → JARVIS → Humano
```

---

## SISTEMA DE APRENDIZADO

### Base de Conhecimento por Gerente:
```
/colmeia/
  ├── gerente_whatsapp/
  │   ├── kb_perguntas_frequentes.json
  │   ├── kb_erros_corrigidos.json
  │   ├── kb_casos_sucesso.json
  │   └── kb_frases_proibidas.json
  │
  ├── gerente_instagram/
  │   ├── kb_posts_aprovados.json
  │   ├── kb_hashtags_performance.json
  │   └── kb_comentarios_comuns.json
```

### Agentes Reparadores:
- **REPARADOR_WHATSAPP:** Corrige respostas mal formuladas
- **REPARADOR_INSTAGRAM:** Ajusta textos/imagens rejeitadas
- **REPARADOR_EMAIL:** Corrige subject lines, CTAs

### Agentes Aprendizes:
- **APRENDIZ_WHATSAPP:** Analisa conversas bem-sucedidas, extrai padrões
- **APRENDIZ_INSTAGRAM:** Analisa posts com melhor engajamento
- **APRENDIZ_EMAIL:** Analisa emails com melhor taxa de abertura

---

## DEBUGGING E MONITORAMENTO

### Logs Isolados:
```
/logs/
  ├── gerente_whatsapp_2026-02-02.log
  ├── gerente_instagram_2026-02-02.log
  └── gerente_email_2026-02-02.log
```

### Métricas por Gerente:
- Taxa de sucesso
- Tempo médio de resposta
- Erros/dia
- Escalações para humano
- Tokens consumidos

### Guardian (Agente de Segurança):
- Monitora custos
- Alerta sobre erros repetidos
- Bloqueia ações arriscadas
- Propõe otimizações

---

## VENDABILIDADE

### Pacotes:
1. **BÁSICO** (100€/mês): GERENTE_WHATSAPP
2. **PROFISSIONAL** (180€/mês): WHATSAPP + INSTAGRAM
3. **PREMIUM** (250€/mês): WHATSAPP + INSTAGRAM + EMAIL + Dashboard

### Demonstração:
- Cliente vê **organograma do time dele**
- Cliente vê **logs de ações em tempo real**
- Cliente vê **dashboard com métricas**

### White-Label:
- Logo do cliente no dashboard
- Nome da empresa no sistema
- Domínio customizado (opcional)

---

## PRÓXIMOS ARQUIVOS

Vou detalhar:
1. Cada GERENTE individualmente (missão, time, fluxos)
2. Cada AGENTE individualmente (input, output, checklist)
3. Sistema de aprendizado (como funciona)
4. Templates de configuração por cliente
5. Instruções para Gemini Flash executar sem erros

---

**Criado:** 2026-02-02  
**Autor:** JARVIS (Claude Sonnet 4.5)  
**Status:** ARQUITETURA BASE  
**Próximo:** Detalhamento de Gerentes
