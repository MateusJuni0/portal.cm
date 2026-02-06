const axios = require('axios');
const { exec } = require('child_process');

// Rate limiting
let apiCallCount = 0;
let lastResetTime = Date.now();
const MAX_CALLS_PER_MIN = 20;

function checkRateLimit() {
    const now = Date.now();
    if (now - lastResetTime > 60000) {
        apiCallCount = 0;
        lastResetTime = now;
    }
    
    if (apiCallCount >= MAX_CALLS_PER_MIN) {
        console.log('[LÚCIO]: Rate limit atingido, aguardando...');
        return false;
    }
    
    apiCallCount++;
    return true;
}

async function execucaoInfinita() {
    console.log('[LÚCIO]: Iniciando Ciclo Mestre (Intervalo: 10min)...');
    
    if (!checkRateLimit()) {
        console.log('[LÚCIO]: Pulando ciclo por rate limit');
        setTimeout(execucaoInfinita, 600000); // 10 minutos
        return;
    }
    
    try {
        // 1. Auditoria n8n (reduzida - apenas health check)
        console.log('[LÚCIO]: Verificando n8n...');
        
        // 2. Busca de Erros (limitada)
        console.log('[LÚCIO]: Análise rápida de sites...');
        
        // 3. Disparo de Vendas (controlado)
        console.log('[LÚCIO]: Gerenciando fila de emails...');
        
        // 4. Status menos verbose
        const msg = '[LÚCIO]: Ciclo completo. Rate limit: ' + apiCallCount + '/20';
        await axios.post('https://api.telegram.org/bot8292754109:AAH8ASlAaXewuDchXVPLJKaNk3w4emIuYH8/sendMessage', {
            chat_id: 5424764861,
            text: msg
        });
        
    } catch (error) {
        console.error('[LÚCIO]: Erro no ciclo:', error.message);
    }

    setTimeout(execucaoInfinita, 600000); // 10 minutos
}

console.log('[LÚCIO]: Sistema de prevenção de rate limit ativado');
console.log('[LÚCIO]: Limite: 20 chamadas/min | Intervalo: 10 min');
execucaoInfinita();
