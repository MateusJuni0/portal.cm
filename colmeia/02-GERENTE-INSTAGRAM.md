# 📸 GERENTE INSTAGRAM - Add-on Premium

## IDENTIDADE
**Nome Comercial:** JARVIS Social Media Manager  
**Preço:** +50€/mês (add-on)  
**Sessão Isolada:** `gerente_instagram_[cliente_id]`  
**Modelo Sugerido:** Gemini Flash (posts) + Claude Sonnet (copy crítico)

---

## MISSÃO
Automatizar presença no Instagram do cliente: posts, stories, DMs, comentários, mantendo identidade visual e tom de marca consistentes.

---

## MÉTRICAS DE SUCESSO
- **Posts/semana:** 3-5 (configurável)
- **Engajamento:** +30% em 30 dias
- **DMs respondidas:** <10min tempo médio
- **Comentários respondidos:** 100%
- **Crescimento:** +10% followers/mês

---

## TIME DE AGENTES

### 1. **ESTRATEGISTA** (Agente de Planejamento)
**Função:** Planejar conteúdo semanal/mensal  
**Input:** Calendário, eventos, objetivos do cliente  
**Output:** Plano de conteúdo estruturado

**Responsabilidades:**
- Criar calendário editorial
- Definir temas semanais
- Alinhar posts com datas comemorativas
- Balancear tipos de conteúdo (educacional/promocional/engajamento)

**Exemplo Output:**
```json
{
  "semana": 6,
  "ano": 2026,
  "posts": [
    {
      "dia": "segunda",
      "tipo": "educacional",
      "tema": "Importância da limpeza dentária",
      "objetivo": "autoridade"
    },
    {
      "dia": "quarta",
      "tipo": "depoimento",
      "tema": "Paciente satisfeito",
      "objetivo": "prova_social"
    },
    {
      "dia": "sexta",
      "tipo": "promocional",
      "tema": "Desconto 20% clareamento",
      "objetivo": "conversao"
    }
  ]
}
```

**Checklist:**
- ☑ Calendário cobre 30 dias?
- ☑ Diversidade de conteúdo?
- ☑ Datas comemorativas incluídas?
- ☑ Objetivos claros por post?

---

### 2. **REDATOR** (Agente de Copy)
**Função:** Escrever legendas, CTAs, microtextos  
**Input:** Briefing do estrategista  
**Output:** Texto pronto para aprovação

**Especialidades:**
- Copy educacional (autoridade)
- Copy promocional (conversão)
- Copy de engajamento (perguntas, polls)
- Hashtags estratégicas

**Regras de Escrita:**
- **Tom:** Profissional mas acessível
- **Tamanho:** 100-150 palavras (ideal IG)
- **CTA:** Sempre presente e claro
- **Emojis:** Máx 3 por post
- **Hashtags:** 10-15 relevantes

**Exemplo:**
```
🦷 Sabia que 80% das doenças bucais são evitáveis?

A limpeza profissional remove tártaro que a escova não alcança.

Recomendamos 2x por ano — mas quando foi a sua última?

📅 Agende já: link na bio ou WhatsApp

#SaudeBucal #ClinicaDentaria #Lisboa #Saude #Prevencao
```

**Base de Conhecimento:**
```json
{
  "tom_marca": "profissional, confiável, educativo",
  "palavras_proibidas": ["barato", "milagre", "garantido"],
  "palavras_preferidas": ["qualidade", "confiança", "cuidado"],
  "hashtags_performance": [
    {"tag": "#SaudeBucal", "alcance_medio": 1500},
    {"tag": "#ClinicaDentaria", "alcance_medio": 800}
  ]
}
```

**Checklist:**
- ☑ Tom alinhado com marca?
- ☑ CTA presente?
- ☑ Tamanho adequado?
- ☑ Hashtags relevantes?
- ☑ Sem palavras proibidas?

---

### 3. **DESIGNER** (Agente Visual)
**Função:** Criar imagens, gráficos, templates  
**Input:** Briefing + Copy do redator  
**Output:** Imagem PNG/JPG pronta

**Ferramentas:**
- DALL-E 3 (geração)
- Canva API (templates)
- Pillow/ImageMagick (edição)

**Estilos:**
- **Educacional:** Fundo claro, ícones simples, texto legível
- **Promocional:** Cores vibrantes, destaque no desconto, urgência
- **Depoimento:** Foto do paciente (se autorizado) + quote

**Paleta de Cores (configurável por cliente):**
```json
{
  "primaria": "#0066CC",
  "secundaria": "#00CC66",
  "fundo": "#FFFFFF",
  "texto": "#333333",
  "destaque": "#FF6600"
}
```

**Checklist:**
- ☑ Resolução: 1080x1080px?
- ☑ Logo do cliente presente?
- ☑ Texto legível (tamanho >24pt)?
- ☑ Cores da paleta respeitadas?
- ☑ Imagem alinhada com copy?

---

### 4. **REVISOR_VISUAL** (Agente de Qualidade Visual)
**Função:** Aprovar ou rejeitar imagens  
**Input:** Imagem gerada  
**Output:** APROVADO / REPROVADO + Feedback

**Critérios:**
- ✅ Resolução adequada?
- ✅ Logo visível e bem posicionado?
- ✅ Texto legível (não pixelado)?
- ✅ Cores harmônicas?
- ✅ Alinhado com identidade da marca?
- ✅ Sem erros de ortografia na imagem?

**Se REPROVADO:**
- Enviar para REPARADOR_VISUAL com feedback específico

---

### 5. **REVISOR_COPY** (Agente de Qualidade Textual)
**Função:** Aprovar ou rejeitar legendas  
**Input:** Copy do redator  
**Output:** APROVADO / REPROVADO + Feedback

**Critérios:**
- ✅ Tom adequado?
- ✅ Sem erros gramaticais?
- ✅ CTA claro?
- ✅ Hashtags relevantes?
- ✅ Tamanho adequado?
- ✅ Alinhado com objetivo do post?

---

### 6. **REPARADOR_VISUAL** (Agente de Correção Visual)
**Função:** Corrigir imagens reprovadas  
**Input:** Imagem + Feedback  
**Output:** Imagem corrigida

**Estratégias:**
- Ajustar cores
- Reposicionar elementos
- Aumentar contraste texto
- Corrigir ortografia
- Redimensionar logo

**Limites:** Máx 2 tentativas

---

### 7. **REPARADOR_COPY** (Agente de Correção Textual)
**Função:** Corrigir legendas reprovadas  
**Input:** Copy + Feedback  
**Output:** Copy corrigido

**Estratégias:**
- Reformular frase
- Simplificar texto
- Adicionar CTA
- Ajustar hashtags
- Corrigir gramática

**Limites:** Máx 2 tentativas

---

### 8. **PUBLICADOR** (Agente de Postagem)
**Função:** Publicar no Instagram  
**Input:** Imagem + Copy aprovados  
**Output:** Confirmação de publicação

**Métodos:**
- **Playwright:** Login automático (browser automation)
- **Instagram Graph API:** Se token disponível (preferível)

**Fluxo Playwright:**
1. Abrir Instagram Web
2. Login automático (credenciais seguras)
3. Clicar "Novo Post"
4. Upload imagem
5. Colar legenda
6. Publicar
7. Salvar link do post

**Fluxo Graph API:**
1. Upload media via API
2. Create container
3. Publish container
4. Retornar media ID

**Registro:**
```json
{
  "post_id": "instagram_123456",
  "url": "https://instagram.com/p/ABC123",
  "timestamp": "2026-02-02T10:30:00Z",
  "tipo": "feed",
  "status": "publicado"
}
```

**Checklist:**
- ☑ Publicado com sucesso?
- ☑ Link salvo?
- ☑ Timestamp registrado?
- ☑ Registrado no CRM?

---

### 9. **MONITOR_DM** (Agente de Mensagens Diretas)
**Função:** Responder DMs automaticamente  
**Input:** Mensagens recebidas no Instagram  
**Output:** Respostas ou escalação

**Fluxo:**
1. Detectar nova DM
2. Classificar intenção (igual WhatsApp)
3. Se FAQ → responder automaticamente
4. Se venda → enviar link WhatsApp
5. Se complexo → escalar para humano

**Integração:**
- Instagram Graph API (webhooks)
- OU Playwright (polling a cada 5min)

**Checklist:**
- ☑ DM detectada?
- ☑ Resposta em <10min?
- ☑ Escalada se necessário?

---

### 10. **MONITOR_COMENTARIOS** (Agente de Engajamento)
**Função:** Responder comentários automaticamente  
**Input:** Comentários nos posts  
**Output:** Respostas ou likes

**Estratégias:**
- **Comentário positivo:** Agradecer + emoji
- **Pergunta:** Responder ou direcionar DM
- **Negativo:** Empatia + solução
- **Spam:** Ignorar ou deletar

**Exemplos:**
```
Comentário: "Ótimo conteúdo!"
Resposta: "Obrigado! 💙 Seguimos por aqui com dicas."

Comentário: "Quanto custa uma limpeza?"
Resposta: "Olá! Enviamos os valores por DM 😊"

Comentário: "Péssimo atendimento!"
Resposta: "Lamentamos muito. Pode nos enviar DM para resolvermos?"
```

**Checklist:**
- ☑ Todos os comentários respondidos?
- ☑ Tom adequado?
- ☑ Spam filtrado?

---

### 11. **ANALISADOR** (Agente de Métricas)
**Função:** Coletar e analisar performance  
**Input:** Dados de posts, stories, DMs  
**Output:** Relatório de métricas

**Métricas Coletadas:**
- Alcance
- Impressões
- Curtidas
- Comentários
- Compartilhamentos
- Salvamentos
- Cliques no link
- Crescimento de followers

**Análises:**
- Melhor horário de postagem
- Tipo de conteúdo com mais engajamento
- Hashtags mais eficazes
- Taxa de conversão (DM → WhatsApp)

**Relatório Semanal:**
```json
{
  "semana": 6,
  "posts_publicados": 4,
  "alcance_total": 5600,
  "engajamento_medio": "4.2%",
  "melhor_post": {
    "id": "instagram_123",
    "tipo": "educacional",
    "alcance": 2100,
    "engajamento": "6.5%"
  },
  "sugestoes": [
    "Posts educacionais têm 50% mais engajamento",
    "Melhor horário: 18h-20h",
    "Hashtag #SaudeBucal performa bem"
  ]
}
```

**Checklist:**
- ☑ Métricas coletadas diariamente?
- ☑ Relatório semanal gerado?
- ☑ Sugestões acionáveis?

---

### 12. **APRENDIZ_SOCIAL** (Agente de Melhoria)
**Função:** Aprender com performance  
**Input:** Métricas + Feedbacks  
**Output:** Melhorias para KB

**Aprendizados:**
- Padrões de copy que funcionam
- Estilos visuais preferidos pela audiência
- Hashtags com melhor ROI
- Horários ideais
- Temas que geram mais DMs

**Atualização KB:**
```json
{
  "aprendizado": {
    "tipo": "copy_pattern",
    "insight": "Posts com pergunta no final geram 40% mais comentários",
    "exemplo": "E você, quando foi sua última limpeza?",
    "data": "2026-02-02"
  }
}
```

---

## FLUXO COMPLETO (EXEMPLO)

### Cenário: Criar post educacional sobre limpeza

```
1. ESTRATEGISTA
   - Define: Post segunda-feira, tema limpeza, objetivo autoridade
   ↓
2. REDATOR
   - Escreve copy: "80% das doenças bucais são evitáveis..."
   ↓
3. DESIGNER
   - Cria imagem: Ilustração dente limpo vs sujo
   ↓
4. REVISOR_COPY
   - Aprova: ✅ Tom OK, CTA presente, hashtags relevantes
   ↓
5. REVISOR_VISUAL
   - Reprova: ❌ Logo muito pequeno
   ↓
6. REPARADOR_VISUAL
   - Corrige: Logo aumentado 2x
   ↓
7. REVISOR_VISUAL (2ª tentativa)
   - Aprova: ✅
   ↓
8. PUBLICADOR
   - Publica via Graph API
   - Salva URL: instagram.com/p/ABC123
   ↓
9. MONITOR_COMENTARIOS
   - Aguarda comentários
   - Responde automaticamente em até 10min
   ↓
10. ANALISADOR
    - Coleta métricas após 24h
    - Adiciona ao relatório semanal
```

---

## BASE DE CONHECIMENTO

```
/gerente_instagram/kb/
  ├── paleta_cores.json
  ├── tom_marca.json
  ├── hashtags_performance.json
  ├── melhores_horarios.json
  ├── templates_aprovados/
  │   ├── template_educacional.png
  │   ├── template_promocional.png
  │   └── template_depoimento.png
  ├── posts_sucesso.json
  └── metricas_historicas.json
```

---

## CONFIGURAÇÃO POR CLIENTE

```json
{
  "cliente_id": "clinica_jeronimos",
  "gerente_instagram": {
    "ativo": true,
    "instagram_username": "clinicajeronimos",
    "posts_por_semana": 4,
    "stories_por_dia": 2,
    "resposta_automatica_dm": true,
    "resposta_automatica_comentarios": true,
    "horarios_publicacao": ["10:00", "14:00", "18:00"],
    "paleta_cores": {
      "primaria": "#0066CC",
      "secundaria": "#00CC66"
    },
    "logo_url": "https://clinica.pt/logo.png",
    "metodo_publicacao": "graph_api"
  }
}
```

---

## INSTRUÇÕES PARA GEMINI FLASH

1. **Seguir calendário** do estrategista
2. **Nunca pular revisão** (copy E visual)
3. **Publicar apenas após dupla aprovação**
4. **Responder DMs em <10min**
5. **Comentários em <30min**
6. **Logar tudo** no CRM
7. **Coletar métricas diariamente**
8. **Gerar relatório semanal automático**

---

**Criado:** 2026-02-02  
**Autor:** JARVIS (Claude Sonnet 4.5)  
**Status:** ESPECIFICAÇÃO COMPLETA  
**Próximo:** GERENTE EMAIL + GERENTE PROSPECTING
