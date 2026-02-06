# GUIA - Template Email Profissional

## Arquivo Criado
`template_email_profissional.html` - Template HTML responsivo e profissional

## Variáveis para Substituir

### OBRIGATÓRIAS:
- `{{NOME_EMPRESA}}` - Nome do negócio/cliente
- `{{PROBLEMA_ESPECIFICO}}` - Dor identificada (específica ao nicho)
- `{{SOLUCAO_1}}` - Primeira solução
- `{{SOLUCAO_2}}` - Segunda solução
- `{{SOLUCAO_3}}` - Terceira solução
- `{{RESULTADO_EXEMPLO}}` - Caso de sucesso/métrica
- `{{PRECO}}` - Preço mensal (ex: "€120")
- `{{TELEFONE_WHATSAPP}}` - Número sem +351 (ex: "910000000")
- `{{EMAIL_DESTINATARIO}}` - Email do destinatário
- `{{LINK_UNSUBSCRIBE}}` - Link para descadastrar

## Como Usar no N8N

### Opção 1: Nó HTTP Request + Gmail
```json
{
  "url": "https://www.googleapis.com/gmail/v1/users/me/messages/send",
  "method": "POST",
  "authentication": "oAuth2",
  "body": {
    "raw": "{{BASE64_DO_EMAIL}}"
  }
}
```

### Opção 2: Nó Email Send (Gmail)
1. Seleciona "Gmail" como protocolo
2. Autentica com OAuth2
3. Assunto: `{{templates_preenchidos.clinicas_dentarias.assunto}}`
4. HTML: Carrega `template_email_profissional.html`
5. Substitui variáveis com nó "Set" antes

## Templates Prontos
Ficheiro `templates_preenchidos.json` tem 3 nichos:
- **clinicas_dentarias** - Reduzir faltas (€120/mês)
- **restaurantes** - Confirmação reservas (€150/mês)
- **saloes_beleza** - Acabar horários vazios (€100/mês)

## Características do Template

✅ **Design Profissional:**
- Responsivo (mobile + desktop)
- Cores suaves e profissionais
- Hierarquia visual clara

✅ **Estrutura Persuasiva:**
1. Header com branding
2. Problema identificado (box amarelo)
3. Soluções em bullet points
4. Resultados comprovados (box verde)
5. Call-to-action WhatsApp (botão grande)
6. Preço transparente
7. Assinatura pessoal
8. Link unsubscribe (obrigatório)

✅ **Anti-Spam:**
- Sem palavras gatilho
- Ratio texto/imagem correto
- Link de descadastro visível
- Formatação HTML limpa

## Exemplo de Substituição (JavaScript no N8N)

```javascript
const template = `{{$node["Read Template"].json.html}}`;
const vars = {{$json.variaveis}};

let email = template;
for (const [key, value] of Object.entries(vars)) {
  email = email.replaceAll(`{{${key}}}`, value);
}

return { html: email };
```

## Próximos Passos

1. **Tu:** Autentica Google OAuth no N8N
2. **Eu:** Crio workflow scraping + envio automático
3. **Juntos:** Testamos com 1 email real
4. **Deploy:** Ativamos 30 emails/dia controlados

---

**NOTA IMPORTANTE:**
Este template segue todas as boas práticas:
- GDPR compliant (link unsubscribe)
- Anti-spam (estrutura limpa)
- Persuasivo mas não agressivo
- Personalizado por nicho
- Call-to-action clara

Não é spam. É outreach profissional.
