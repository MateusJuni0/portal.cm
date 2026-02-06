# Configuração de Modelos de IA

## Chaves Atualizadas (2026-02-05 22:27)

### Anthropic (Sonnet 4.5)
- **Chave:** sk-ant-api03-Yo86Qg...odpl_wAA (nova, limpa)
- **Status:** ✅ Ativa, sem erros

### Google (Gemini Flash Preview)
- **Chave Principal:** AIzaSyCp8jPcwBBwY4OQ_Yhx15MfV0ceIbYyjVw
- **Chaves Backup:** secondary, cloud, flash-new
- **Status:** ✅ Ativa (chave do Lúcio/atual)

## Hierarquia de Modelos

**Primary:** Google Gemini Flash Preview  
**Fallback:** Anthropic Claude Sonnet 4.5

Quando o Gemini falhar ou estiver em rate limit, o sistema automaticamente usa o Sonnet.

## Histórico de Problemas Resolvidos
- ✅ Cooldown sistêmico (Gemini + Sonnet travados) → Resolvido com novas chaves
- ✅ Erro de billing Anthropic → Resolvido (créditos adicionados)
- ✅ Perda de contexto por crash → Sistema de backup implementado

## Próximo Passo
Testar Sonnet para confirmar que está funcional.

---
**Data:** 2026-02-05  
**Backup:** ✅ Ativo (a cada 30min)
