# APRENDIZADOS — ESTRUTURA SISTEMA RESTAURANTES

## O QUE COPIAMOS E POR QUÊ

### ✅ SISTEMA DE ESTADOS (SESSION MANAGEMENT)
**Copiado integral.**

**Motivo:**
- Evita pular etapas
- Evita re-perguntar dados já coletados
- Mantém consistência
- Facilita debug

**Aplicação nossa:**
- Clínica: confirmacao → reagendamento → cancelamento
- Restaurante: reserva → alteração → cancelamento

---

### ✅ PRINCÍPIOS FUNDAMENTAIS (8 REGRAS)
**Copiado integral.**

**Motivo:**
- Evita IA inventar dados
- Evita confirmar sem validação
- Protege negócio cliente
- Reduz erros críticos

**Aplicação nossa:**
Mesmas regras aplicam:
- Nunca inventar horário disponível
- Nunca confirmar consulta sem validação
- Nunca ignorar pedido de falar com humano

---

### ✅ CLASSIFICAÇÃO DE INTENÇÃO
**Copiado e adaptado.**

**Motivo:**
- Primeira coisa que IA precisa fazer
- Se errar intenção, resto falha

**Diferença nossa:**
- Clínica: foco em CONFIRMAR / REAGENDAR / CANCELAR
- Restaurante: foco em RESERVA / TAKEAWAY / CARDAPIO

---

### ✅ FLUXOS PASSO A PASSO
**Copiado lógica.**

**Motivo:**
- Reduz ambiguidade
- Aumenta taxa conversão
- Cliente sabe onde está no processo

**Exemplo clínica:**
1. Lembrete 24h → "Confirma consulta dia X às Y?"
2. Cliente: "Não posso"
3. IA: "Quer remarcar?" (não assume)
4. Cliente: "Sim"
5. IA: "Que dia prefere?"
6. ...

---

### ✅ ESCALONAMENTO PRA HUMANO
**Copiado integral.**

**Motivo:**
- Nem tudo IA resolve
- Cliente irritado = humano
- Erro técnico = humano
- Dúvida alta = humano

**Gatilhos nossos:**
- "Quero falar com alguém"
- 3+ mensagens sem resolução
- Sentimento negativo detectado
- Sistema falhou

---

### ✅ TOM DE COMUNICAÇÃO
**Copiado princípios.**

**Motivo:**
- Cliente não quer robô fake
- Cliente não quer robô muito formal
- Equilíbrio = conversão

**Adaptação nossa:**
- Clínica: tom médico-profissional (mais sério)
- Restaurante: tom hospitaleiro (mais casual)

---

### ✅ TRATAMENTO DE ERROS
**Copiado integral.**

**Motivo:**
- Cliente não precisa saber que "Postgres deu timeout"
- Resposta genérica + log interno

**Resposta padrão:**
"Desculpe, tive um problema técnico. Vou acionar nossa equipe. Alguém responde em breve."

---

### ✅ SAÍDA ESTRUTURADA
**Copiado conceito.**

**Motivo:**
- IA pode responder texto natural OU JSON
- Nunca misturar os dois

**Uso nosso:**
- Cliente → texto natural
- Sistema interno → JSON estruturado

---

## O QUE ADAPTAMOS

### 🔧 MULTI-NEGÓCIO
**Original:** Só restaurante  
**Nossa versão:** Suporta clínica + restaurante + salão

**Motivo:**
Queremos vender mesmo sistema pra nichos diferentes.

**Solução:**
Configuração por cliente define:
- Tipo de negócio
- Estados possíveis
- Intenções válidas
- Tom de comunicação

---

### 🔧 MÉTRICAS POR SETOR
**Original:** Foco em ocupação de mesas  
**Nossa versão:** Foco em redução no-show (clínica)

**Motivo:**
Dor de clínica ≠ dor de restaurante.

**Adaptação:**
- Clínica: métrica = % no-show reduzido
- Restaurante: métrica = % ocupação aumentada

---

### 🔧 TAKEAWAY (OPCIONAL)
**Original:** Feature obrigatória  
**Nossa versão:** Só restaurante precisa

**Motivo:**
Clínica não faz pedidos takeaway.

**Solução:**
Módulo opcional ativado por config.

---

## O QUE ADICIONAMOS

### ➕ SUPORTE REAGENDAMENTO DIRETO
**Não tinha no original.**

**Motivo:**
Clínica precisa reagendar rápido.

**Como:**
Cliente responde lembrete: "Não posso"  
IA: "Quer remarcar? Que dia prefere?"

---

### ➕ LEMBRETE 12H ANTES (FALLBACK)
**Não tinha no original.**

**Motivo:**
Se cliente não responde 24h antes, tentar de novo.

**Como:**
- Lembrete 1: 24-48h antes
- Lembrete 2: 12h antes (se sem resposta)
- Alerta clínica: 2h antes (se sem resposta)

---

### ➕ DASHBOARD NO-SHOW
**Não tinha no original.**

**Motivo:**
Cliente (clínica) precisa ver ROI.

**Dados:**
- No-show antes do sistema
- No-show depois do sistema
- Diferença €€€ economizado

---

## O QUE IGNORAMOS

### ❌ UPSELL AUTOMÁTICO
**Original tinha:** "Quer adicionar sobremesa?"

**Motivo ignorar:**
Não faz sentido pra clínica.

**Possível depois:**
Reativar pra restaurante.

---

### ❌ CARDÁPIO DIGITAL
**Original tinha.**

**Motivo ignorar:**
Clínica não tem cardápio.

**Possível depois:**
Reativar pra restaurante.

---

## CONCLUSÃO

**O que o prompt de restaurantes nos ensinou:**

✅ Estrutura de estados é obrigatória  
✅ Princípios fundamentais evitam 90% dos erros  
✅ Fluxos passo a passo aumentam conversão  
✅ Escalonamento pra humano protege marca  
✅ Tratamento de erros mantém profissionalismo  

**Nossa adaptação:**
- Mesmo core sólido
- Configurável por tipo de negócio
- Métricas específicas por setor
- Base replicável pra vários nichos

---

**PRÓXIMO PASSO:**
Implementar sistema base seguindo estrutura aprendida.

---

Criado: 2026-02-01 07:25 GMT  
Baseado em: Prompt Mestre Restaurantes  
Autor: JARVIS
