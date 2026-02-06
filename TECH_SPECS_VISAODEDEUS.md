# ESPECIFICAÇÃO TÉCNICA: MÓDULO VISÃO (LÚCIO)

## Arquitetura de Processamento de Imagem

### 1. Entrada (Input)
- **Origem:** Câmera do App (iOS/Android) ou Upload de Galeria.
- **Formato:** Base64 ou URL temporária.

### 2. Pipeline de Processamento (O "Cérebro")
Para atingir o nível de detalhe de "ver 5kg de arroz", usaremos um pipeline de 2 estágios:

**Estágio A: Detecção de Objetos (Object Detection)**
- Identificar contornos e separar itens na prateleira.
- *Exemplo:* Separar "Saco de Arroz" de "Garrafa de Azeite".

**Estágio B: OCR Semântico + VLM (Vision Language Model)**
- Ler textos pequenos nos rótulos: "Peso Liq. 5kg", "Contém 6 unidades".
- **Prompt do Sistema (System Prompt):**
  > "Analise esta imagem de despensa. Liste cada item encontrado em formato JSON. Para cada item, extraia: Nome da Marca, Tipo de Produto, Peso/Volume escrito na embalagem e Quantidade visível. Se o pacote estiver aberto/consumido, estime a porcentagem restante (ex: 50%)."

### 3. Exemplo de Retorno JSON (Estrutura de Dados)
```json
{
  "inventory_scan": [
    {
      "item": "Arroz Branco",
      "brand": "Cigano",
      "package_size": "5kg",
      "detected_units": 2,
      "status": "sealed",
      "confidence": 0.98
    },
    {
      "item": "Azeite de Oliva",
      "brand": "Gallo",
      "package_size": "500ml",
      "detected_units": 1,
      "status": "open_approx_30_percent_left",
      "confidence": 0.85
    }
  ]
}
```

### 4. Integração com Web Search
- Se `detected_units` < `min_stock` (definido pelo usuário):
  - Trigger automático: `web_search(query: "preço arroz cigano 5kg supermercado portugal")`.
  - Retorna cards de oferta para o usuário.

### 5. Desafios Técnicos & Soluções
- **Oclusão (Itens escondidos):** A IA não tem Raio-X.
  - *Solução:* UX sugere "Mova os itens da frente para uma leitura completa" se detectar bagunça.
- **Embalagem Genérica (Pote de vidro sem rótulo):**
  - *Solução:* A IA pergunta "O que tem neste pote de vidro? Arroz ou Açúcar?" e aprende para a próxima vez.
