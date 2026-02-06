// CONFIGURAÇÃO DE CREDENCIAIS N8N (LÚCIO)
// Instruções para ativação das credenciais já inseridas pelo usuário

/*
  STATUS DAS CREDENCIAIS:
  -----------------------
  1. OpenAI (GPT-4o / Vision)   -> AGUARDANDO VINCULAÇÃO NO NÓ
  2. Google Sheets (Database)   -> PRONTO (OAuth)
  3. Evolution API (WhatsApp)   -> PRONTO (API Key)
  4. Supabase (Memória Vetorial)-> AGUARDANDO VINCULAÇÃO
  5. Gmail / SMTP               -> PENDENTE (OAuth Google)
*/

// AÇÃO NECESSÁRIA NO EDITOR N8N:
// O usuário já cadastrou. Agora precisamos atualizar os nós dos workflows
// para "apontar" para essas credenciais novas.

// 1. WORKFLOW "MASTER ROUTER"
//    - Nó "OpenAI Chat Model": Selecionar credencial "OpenAI Production"
//    - Nó "Evolution API": Selecionar credencial "Evolution Auth"

// 2. WORKFLOW "MEMÓRIA INFINITA"
//    - Nó "Supabase Vector Store": Selecionar credencial "Supabase Main"

// NOTA PARA DANTE:
// Avise o usuário que os workflows atualizados já estão configurados para 
// puxar essas credenciais automaticamente se os nomes baterem.
// Caso contrário, ele precisará abrir o nó e selecionar a credencial na lista.
