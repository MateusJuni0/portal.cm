# Sistema de Backup Automático

## O que faz
- Backup incremental a cada execução
- Salva com timestamp (YYYY-MM-DD_HH-mm)
- Mantém apenas os últimos 10 backups (auto-limpeza)
- Backups salvos em: `C:\Users\mjnol\.openclaw\backups\`

## O que é salvo
- MEMORY.md e pasta memory/
- Todos os projetos (pasta projetos/)
- Arquivos de identidade (SOUL.md, USER.md, IDENTITY.md, TOOLS.md)
- Chaves de API (auth-profiles.json)
- Configuração OpenClaw (openclaw.json)
- Credenciais (pasta credentials/)
- Histórico de sessões (sessions.json)

## Como usar

### Backup Manual (executar agora)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\mjnol\.openclaw\workspace\backup_system.ps1"
```

### Backup Automático (a cada 30 min via Cron)
O Dante pode agendar via cron do OpenClaw:
- Intervalo: a cada 30 minutos
- Comando: executar o script PowerShell

### Recuperar de um Backup
1. Listar backups disponíveis: `ls C:\Users\mjnol\.openclaw\backups`
2. Escolher a data/hora desejada
3. Copiar os arquivos de volta para suas pastas originais

## Status
- ✅ Script criado
- ⏳ Aguardando primeiro backup
- ⏳ Aguardando agendamento via cron

---
**Última atualização:** 2026-02-05 22:23
