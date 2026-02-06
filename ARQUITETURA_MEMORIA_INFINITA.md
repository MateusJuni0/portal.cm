# ARQUITETURA TÉCNICA: MEMÓRIA INFINITA (RAG + STORAGE)
**Responsável:** Lúcio (Engenharia de Dados)

Para que o Agente tenha "memória infinita" e acesse faturas de 6 meses atrás sem alucinar, não podemos depender apenas do contexto da LLM. Precisamos de uma **Arquitetura de Recuperação (RAG - Retrieval-Augmented Generation)**.

## 1. O Fluxo de Entrada (Ingestão)
Quando o usuário manda uma foto/PDF de uma fatura:
1.  **OCR Inteligente:** O sistema lê o documento.
2.  **Extração de Metadados:**
    - Tipo: `Fatura de Energia`
    - Valor: `€120,50`
    - Data: `2026-01-15`
    - Fornecedor: `EDP`
3.  **Armazenamento Duplo:**
    - **Arquivo Bruto (Blob):** Vai para um S3/Google Drive (Custo baixo).
    - **Índice (Cérebro):** Os dados vão para um Banco Vetorial (Supabase/Pinecone) com tags.

## 2. O Fluxo de Busca (Recall)
Cenário: Usuário diz *"Esqueci a fatura do mês passado"*.

1.  **Interpretação:** O Agente entende a intenção `buscar_documento`.
2.  **Consulta (Query):** O sistema busca no Banco de Dados: `WHERE type='fatura' AND date='2026-01'`.
3.  **Resposta:** O Agente recebe o link do arquivo e diz: *"Tá na mão! Aqui a fatura de Janeiro."*

## 3. Privacidade e Segurança
- Tudo é criptografado.
- O Agente sabe *onde* está o arquivo, mas só acessa quando solicitado.

## 4. Stack Sugerida
- **Banco de Dados:** Supabase (PostgreSQL + Vector).
- **Storage:** AWS S3 ou R2 (Cloudflare) para arquivos baratos.
- **LLM:** Gemini Pro 1.5 (Contexto longo para análise) + GPT-4o Mini (Rápido para chat).
