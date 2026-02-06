# MEMORY.md - Memória de Longo Prazo

## Estratégia de IA e Modelos
- **Modelo Dante:** Prioridade `google/gemini-3-flash-preview`. 
- **Hierarquia de Fallback:** Gemini 3 Pro > Gemini 2.5 Flash > Sonnet 4.5. 
- **Regra:** Sempre notificar o humano quando houver troca de modelo (fallback).
- **Consumo:** Monitorizar TPM/RPM no Google AI Studio (projeto gen-lang-client-0616971507).

## Projetos Ativos
- **n8n Prospecting:** 
  - Problema no nó Function (antigo) resolvido via orientação para troca manual por nó HTTP Request.
  - Objetivo: Scrapear Google Maps > PostgreSQL > Enviar Email Automático.

## Configurações de Servidor
- VPS Hostinger (72.62.179.56)
- n8n via Docker (Easypanel)
- Evolution API ativa para WhatsApp.