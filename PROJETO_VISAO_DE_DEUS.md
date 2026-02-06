# PROJETO: VISÃO DE DEUS (GOD'S VIEW)
**Status:** Planejamento Avançado
**Dono:** Dante (Estratégia) & Lúcio (Técnico)

## 1. O CONCEITO
Uma central de comando onisciente para o estoque (doméstico ou comercial). Não é apenas uma lista, é um **Gestor Ativo de Recursos**.

## 2. INTERFACE (UI/UX) - "Apple Quality"
- **Estilo Visual:** Neomorfismo sutil ou Glassmorphism (vidro fosco).
- **Ícones:** SF Symbols (Apple) ou packs 3D minimalistas. Cantos arredondados (border-radius: 24px+).
- **Animações:** Transições fluidas (60fps), haptic feedback ao confirmar ações.
- **Input:**
  1. Upload manual (item a item) com UI gamificada.
  2. **"Snap & Solve":** Tira foto da despensa cheia ou de um item isolado.

## 3. TECNOLOGIA & INOVAÇÃO (O Cérebro)

### A. Reconhecimento Visual Avançado (Vision AI)
- **Cenário:** Usuário tira foto da despensa aberta ou de um item.
- **Capacidade de Leitura (OCR + Contexto):**
  - **Identificação de Produto:** "Arroz Tio João".
  - **Identificação de Volume/Peso:** A IA deve ler o rótulo ("5kg") ou estimar baseado no tamanho padrão.
  - **Contagem de Estoque:** "Vejo 3 pacotes de Arroz de 5kg e 1 aberto pela metade".
- **Fluxo de Confirmação:** A IA sugere ("Li 5kg, correto?") e o usuário confirma com um tap (Haptic Feedback).
- **IA Pesquisa (Web Search):**
  - Onde vende perto?
  - Qual o preço médio?
  - Rating (Vivino/Google).
- **Output:** Card flutuante sobre a imagem com essas infos.

### B. O Agente Gestor ("Alfred Digital")
- Um chat persistente dentro da tela.
- **Personalidade:** Proativo. "Notei que seu azeite está acabando e está em promoção no mercado X. Quer que eu peça?"
- **Comando de Voz:** "Lúcio, adiciona 3 caixas de leite na lista de compra mensal".

### C. Integração de Abastecimento (Checkout)
- **Nível 1 (B2C):** Integração via API (ou scraping estruturado) com iFood Mercado, Bolt Food, Rappi.
  - Botão "Comprar o que falta" -> Monta carrinho no app parceiro.
- **Nível 2 (B2B/Fornecedor):**
  - Cadastro de Fornecedor Direto (WhatsApp/Email).
  - **Modo Autônomo:** O Robô manda mensagem para o Fornecedor: "Preciso de 5 fardos, tem estoque? Qual preço?".
  - **Aprovação:** Usuário recebe notificação push só para dar "OK" no pagamento.
  - *Toggle de Segurança:* Opção para desabilitar compra automática.

## 4. VIABILIDADE TÉCNICA (Análise do Lúcio)
- **Vision:** Usar GPT-4o ou Gemini Pro Vision (multimodal).
- **Busca Preço:** APIs de Scraping ou Google Shopping API customizada.
- **Delivery:** iFood não tem API pública de escrita de carrinho fácil, teremos que usar deeplinks ou automação via navegador (Puppeteer/Playwright) no backend.
- **WhatsApp Fornecedor:** Usar a nossa infra de Evolution API já existente.

## 5. BACKLOG DE IDEIAS
- Sugestão de receita baseada no que ESTÁ VENCENDO (redução de desperdício = dinheiro).
- Alerta de variação de preço (inflação do item).
