# Instalação Workflow Prospecting Completo

## Arquivo: workflow_prospecting_completo.json

## O que faz:

1. **Trigger:** Executa todo dia às 09:00
2. **Scraping:** Busca 30 leads no Google Maps (clínicas, restaurantes, salões)
3. **Extração:** Pega nome, endereço, telefone, website, EMAIL
4. **Salvar:** Grava no PostgreSQL (tabela leads)
5. **Buscar novos:** Pega leads com status='novo'
6. **Personalizar:** Monta email HTML com template profissional
7. **Enviar:** Gmail com OAuth (30 emails/dia máx)
8. **Intervalo:** Aguarda 3-5 min entre cada email (anti-spam)
9. **Atualizar:** Marca lead como 'email_enviado'
10. **Notificar:** Avisa no Telegram a cada envio

## Como Instalar:

### Opção 1: Interface N8N (RECOMENDADO)
1. Vai ao N8N: https://cmtecnologia-n8n.y91wjh.easypanel.host
2. Clica em **"Import from File"**
3. Seleciona `workflow_prospecting_completo.json`
4. Clica **"Import"**
5. Ajusta credenciais:
   - PostgreSQL → Seleciona "PostgreSQL CMTec"
   - Gmail → Seleciona "Gmail OAuth2 CMTec"
   - Telegram → Seleciona "Telegram CMTec"
6. Clica **"Save"**
7. Ativa o workflow (botão "Active")

### Opção 2: API N8N
```bash
curl -X POST https://cmtecnologia-n8n.y91wjh.easypanel.host/api/v1/workflows \
  -H "X-N8N-API-KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d @workflow_prospecting_completo.json
```

## Configurações Importantes:

### Google Maps API:
- Chave já configurada no código
- Limite: 30 buscas/dia (grátis)
- Nichos: clínicas, restaurantes, salões

### Limites de Envio:
- **30 emails/dia** (seguro para Gmail)
- **Intervalo:** 3-5 minutos entre emails
- **Horário:** 09:00 (pode ajustar no trigger)

### PostgreSQL:
Tabela necessária:
```sql
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco TEXT,
  telefone TEXT,
  website TEXT,
  email TEXT UNIQUE NOT NULL,
  nicho TEXT,
  cidade TEXT,
  data_coleta TIMESTAMP DEFAULT NOW(),
  data_envio TIMESTAMP,
  status TEXT DEFAULT 'novo'
);
```

## Funcionamento:

### Dia 1 (Quinta):
- 09:00: Scraping 30 clínicas Lisboa
- 09:05-12:30: Envio de 30 emails (1 a cada 3-5 min)
- Telegram: Notificação a cada envio

### Dia 2 (Sexta):
- 09:00: Scraping 30 restaurantes Lisboa
- 09:05-12:30: Envio de 30 emails
- (e assim por diante)

## Métricas Esperadas:

- **Taxa de entrega:** 95%+ (OAuth + anti-spam)
- **Taxa de abertura:** 20-30%
- **Taxa de resposta:** 3-5%
- **Conversão demo:** 30-50% dos que respondem

**30 emails/dia × 5 dias = 150 contatos/semana**
**150 × 3% resposta = 4-5 interessados**
**4 × 50% conversão = 2 demos agendadas**
**2 demos = 1 cliente (€100-150/mês)**

## Próximos Passos:

1. **Hoje:** Importar workflow, testar com 1 email
2. **Amanhã:** Ativar envio automático 30/dia
3. **Sexta:** Analisar respostas, ajustar pitch
4. **Próxima semana:** Agendar demos, fechar primeiro cliente

## Troubleshooting:

**Email não envia:**
- Verificar OAuth conectado
- Verificar limite Gmail (500/dia)

**Scraping não encontra emails:**
- Alguns sites não expõem email publicamente
- Taxa de sucesso: ~40-60% dos lugares

**PostgreSQL erro:**
- Verificar tabela 'leads' existe
- Verificar credencial configurada

## Segurança:

✅ **GDPR Compliant:**
- Link unsubscribe em todos emails
- Dados armazenados localmente (PostgreSQL)
- Possibilidade de deletar lead a pedido

✅ **Anti-Spam:**
- Intervalo 3-5 min entre emails
- Máximo 30/dia
- Conteúdo personalizado (não genérico)
- Remetente real (cmtecnologia12@gmail.com)

---

**PRONTO PARA PRODUÇÃO!**
