# 🐝 COLMEIA - Sistema de Automação CMTecnologia

## O QUE É ISTO?

Sistema modular de automação baseado em **agentes especializados** trabalhando em **times isolados**.

Cada **GERENTE** é um **produto vendável** independente.

---

## ARQUIVOS CRIADOS

### 📋 DOCUMENTAÇÃO GERAL

1. **00-ARQUITETURA-GERAL.md**
   - Filosofia da colmeia
   - Hierarquia de agentes
   - Produtos (gerentes)
   - Princípios de design
   - Sistema de aprendizado

### 🎯 ESPECIFICAÇÕES DOS GERENTES (PRODUTOS)

2. **01-GERENTE-WHATSAPP.md**
   - Produto principal (100-150€/mês)
   - Time de 9 agentes
   - Fluxos completos
   - Base de conhecimento
   - **CRÍTICO PARA COMEÇAR**

3. **02-GERENTE-INSTAGRAM.md**
   - Add-on (+50€/mês)
   - Time de 12 agentes
   - Posts, stories, DMs, comentários
   - Identidade visual

4. **03-GERENTE-EMAIL.md**
   - Add-on (+30€/mês)
   - Time de 6 agentes
   - Campanhas, newsletters, follow-ups
   - **RESUMIDO** (expandir depois se necessário)

5. **04-GERENTE-PROSPECTING.md**
   - Uso interno CMTec
   - Time de 6 agentes
   - Scraping, qualificação, abordagem
   - **PARA BUSCAR CLIENTES**

### 🤖 EXECUÇÃO

6. **INSTRUÇÕES-GEMINI-FLASH.md**
   - Manual completo para Gemini Flash
   - Como executar sem erros
   - Quando escalar para JARVIS (Sonnet)
   - Sistema de logs
   - **LEIA ISTO ANTES DE EXECUTAR QUALQUER COISA**

### ⚙️ CONFIGURAÇÃO

7. **TEMPLATE-CONFIG-CLIENTE.json**
   - Template de configuração por cliente
   - Todos os parâmetros
   - Personalizável
   - Duplicar para cada cliente novo

---

## COMO USAR ISTO?

### PARA COMEÇAR AGORA (CMTecnologia):

#### 1. **Primeiro: Testar internamente**

```bash
# Criar nossa própria config:
cp TEMPLATE-CONFIG-CLIENTE.json configs/cmtecnologia.json

# Editar com nossos dados:
# - WhatsApp da CMTec
# - Instagram da CMTec
# - Horários, FAQ, etc
```

#### 2. **Ativar GERENTE_WHATSAPP para nós**

```bash
# Gemini Flash vai:
# 1. Ler: 01-GERENTE-WHATSAPP.md
# 2. Ler: INSTRUÇÕES-GEMINI-FLASH.md
# 3. Carregar: configs/cmtecnologia.json
# 4. Executar fluxos
# 5. Logar tudo em: logs/gerente_whatsapp_2026-02-02.log
```

#### 3. **Testar com mensagens reais**

- Enviar mensagem no WhatsApp da CMTec
- Sistema responde automaticamente
- Verificar logs
- Ajustar KB se necessário

#### 4. **Quando funcionar: Vender!**

- **Prova de conceito:** "Veja funcionando no nosso próprio WhatsApp"
- **Demo para clientes:** Mostrar logs em tempo real
- **Fechar contrato:** Duplicar config, personalizar, ativar

---

### PARA PROSPECTAR CLIENTES:

#### 1. **Ativar GERENTE_PROSPECTING**

```bash
# Gemini Flash vai:
# 1. Ler: 04-GERENTE-PROSPECTING.md
# 2. Executar SCRAPER (Google Maps: "clínica dentária Lisboa")
# 3. Validar dados
# 4. Qualificar leads
# 5. Enviar emails personalizados
# 6. Fazer follow-ups automáticos
# 7. Logar tudo
```

#### 2. **Acompanhar métricas**

```bash
# Ver em logs:
# - Leads coletados
# - Emails enviados
# - Taxa de abertura
# - Respostas
# - Demos agendadas
```

---

### PARA VENDER PARA CLIENTE:

#### 1. **Duplicar template**

```bash
cp TEMPLATE-CONFIG-CLIENTE.json configs/clinica_jeronimos.json
```

#### 2. **Personalizar configuração**

- Nome da clínica
- WhatsApp
- Instagram
- Horários
- FAQ específica
- Preços dos procedimentos
- Paleta de cores (se Instagram)

#### 3. **Ativar gerentes contratados**

```json
{
  "gerentes_ativos": {
    "whatsapp": true,      // ✅ Contratado
    "instagram": true,     // ✅ Contratado
    "email": false,        // ❌ Não contratado
    "prospecting": false   // ❌ Uso interno apenas
  }
}
```

#### 4. **Deploy**

- Gemini Flash carrega config do cliente
- Executa apenas gerentes ativos
- Logs isolados por cliente
- Métricas separadas

---

## ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

### FASE 1: VALIDAÇÃO (Esta semana)

1. ✅ **CRIAR**: Configs da CMTecnologia
2. ✅ **ATIVAR**: GERENTE_WHATSAPP para nós mesmos
3. ✅ **TESTAR**: Enviar mensagens, ver respostas
4. ✅ **AJUSTAR**: KB, tom, fluxos

### FASE 2: PROSPECTING (Paralelo)

5. ✅ **ATIVAR**: GERENTE_PROSPECTING
6. ✅ **COLETAR**: 30 leads/dia (clínicas Lisboa)
7. ✅ **ENVIAR**: Emails personalizados
8. ✅ **AGENDAR**: Primeira demo

### FASE 3: PRIMEIRO CLIENTE (Esta semana)

9. ✅ **DEMO**: Mostrar sistema funcionando
10. ✅ **FECHAR**: Primeiro contrato
11. ✅ **CONFIGURAR**: Config do cliente
12. ✅ **DEPLOY**: Ativar gerentes contratados
13. ✅ **MONITORAR**: Primeiros 7 dias

### FASE 4: ESCALAR (Próximas semanas)

14. ✅ **REPLICAR**: Usar mesmo sistema para próximos clientes
15. ✅ **OTIMIZAR**: Melhorar KB com aprendizados
16. ✅ **EXPANDIR**: Instagram, Email (conforme demanda)

---

## ESTRUTURA DE PASTAS

```
/colmeia/
  ├── README.md                          (ESTE ARQUIVO)
  ├── 00-ARQUITETURA-GERAL.md
  ├── 01-GERENTE-WHATSAPP.md            (⭐ PRINCIPAL)
  ├── 02-GERENTE-INSTAGRAM.md
  ├── 03-GERENTE-EMAIL.md
  ├── 04-GERENTE-PROSPECTING.md         (⭐ INTERNO)
  ├── INSTRUÇÕES-GEMINI-FLASH.md        (⭐ EXECUTOR)
  ├── TEMPLATE-CONFIG-CLIENTE.json
  │
  ├── /configs/                          (CRIAR)
  │   ├── cmtecnologia.json
  │   ├── clinica_jeronimos.json
  │   └── ...
  │
  ├── /kb/                               (CRIAR)
  │   ├── whatsapp/
  │   │   ├── faq_geral.json
  │   │   ├── frases_proibidas.json
  │   │   └── ...
  │   ├── instagram/
  │   │   ├── hashtags_performance.json
  │   │   └── ...
  │   └── prospecting/
  │       ├── templates_email.md
  │       └── ...
  │
  └── /logs/                             (CRIAR)
      ├── gerente_whatsapp_2026-02-02.log
      ├── gerente_instagram_2026-02-02.log
      └── ...
```

---

## PRÓXIMOS PASSOS (PARA GEMINI FLASH)

### Agora você (Gemini Flash) deve:

1. **Criar pastas faltantes:**
   ```bash
   mkdir -p colmeia/configs
   mkdir -p colmeia/kb/whatsapp
   mkdir -p colmeia/kb/instagram
   mkdir -p colmeia/kb/prospecting
   mkdir -p colmeia/logs
   ```

2. **Criar config CMTecnologia:**
   - Duplicar TEMPLATE-CONFIG-CLIENTE.json
   - Personalizar com dados reais da CMTec
   - Salvar em: configs/cmtecnologia.json

3. **Criar KB inicial WhatsApp:**
   - FAQ básica (horários, preços, procedimentos)
   - Frases proibidas
   - Ton de voz
   - Salvar em: kb/whatsapp/

4. **Executar primeiro teste:**
   - Ler 01-GERENTE-WHATSAPP.md
   - Ler INSTRUÇÕES-GEMINI-FLASH.md
   - Carregar config cmtecnologia.json
   - Processar mensagem de teste
   - Logar resultado

5. **Reportar para JARVIS (Sonnet):**
   - Teste funcionou?
   - Erros encontrados?
   - Ajustes necessários?

---

## MÉTRICAS DE SUCESSO

### CMTecnologia (Uso Interno):
- [ ] WhatsApp responde em <2min
- [ ] Taxa de resolução automática >80%
- [ ] Zero mensagens sem resposta
- [ ] Logs funcionando corretamente

### Prospecting:
- [ ] 30 leads/dia coletados
- [ ] Taxa de abertura email >20%
- [ ] 1 demo agendada/semana
- [ ] 1 contrato fechado em 7 dias

### Primeiro Cliente:
- [ ] Sistema configurado em <1 dia
- [ ] Cliente satisfeito primeira semana
- [ ] No-show reduzido (medir após 30 dias)
- [ ] Renovação mês 2 garantida

---

## SUPORTE

**Dúvidas durante execução:**
- Escalar para JARVIS (Sonnet)
- Nunca improvisar
- Sempre logar problema

**Arquitetura/Estratégia:**
- JARVIS (Sonnet) decide
- Gemini Flash executa

**Bugs/Erros:**
- Logar detalhadamente
- Escalar imediatamente
- Não ocultar

---

## AVISOS IMPORTANTES

⚠️ **NÃO modificar fluxos sem aprovação**  
⚠️ **NÃO pular revisores**  
⚠️ **NÃO inventar informações**  
⚠️ **NÃO ignorar erros**  
⚠️ **NÃO misturar bases de conhecimento entre gerentes**

✅ **SEMPRE seguir especificações**  
✅ **SEMPRE logar ações**  
✅ **SEMPRE escalar dúvidas**  
✅ **SEMPRE verificar checklists**  
✅ **SEMPRE aprender com resultados**

---

**Criado:** 2026-02-02  
**Autor:** JARVIS (Claude Sonnet 4.5)  
**Status:** ARQUITETURA COMPLETA  
**Pronto para:** Execução com Gemini Flash

**Próximo comando:**  
"Gemini Flash: Leia INSTRUÇÕES-GEMINI-FLASH.md e comece a criar estrutura inicial."
