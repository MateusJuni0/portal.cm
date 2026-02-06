// SCRIPT DE TESTE - WEBHOOK N8N
// Testa se o workflow está funcionando corretamente

const https = require('https');
const http = require('http');

// ============================================
// CONFIGURAÇÃO
// ============================================

const CONFIG = {
  // URL do webhook n8n (ajustar conforme necessário)
  webhookUrl: 'http://localhost:5678/webhook/whatsapp-cmtec',
  
  // Ou se production:
  // webhookUrl: 'https://seu-n8n.com/webhook/whatsapp-cmtec',
};

// ============================================
// CASOS DE TESTE
// ============================================

const TESTES = [
  {
    nome: '💰 Teste ORCAMENTO',
    payload: {
      from: '+351912345678',
      pushName: 'João Teste',
      body: 'Quanto custa?',
      message: {
        conversation: 'Quanto custa?'
      },
      key: {
        id: 'test_001',
        remoteJid: '+351912345678'
      }
    },
    esperado: {
      intencao: 'ORCAMENTO',
      contem: ['100', '150', '€', 'mês']
    }
  },
  {
    nome: '🎯 Teste DEMO',
    payload: {
      from: '+351987654321',
      pushName: 'Maria Teste',
      body: 'Quero ver uma demonstração',
      message: {
        conversation: 'Quero ver uma demonstração'
      },
      key: {
        id: 'test_002',
        remoteJid: '+351987654321'
      }
    },
    esperado: {
      intencao: 'DEMO',
      contem: ['15', 'min', 'Segunda', 'Terça']
    }
  },
  {
    nome: 'ℹ️ Teste INFO',
    payload: {
      from: '+351555555555',
      pushName: 'Pedro Teste',
      body: 'O que fazem?',
      message: {
        conversation: 'O que fazem?'
      },
      key: {
        id: 'test_003',
        remoteJid: '+351555555555'
      }
    },
    esperado: {
      intencao: 'INFO_GERAL',
      contem: ['automação', 'WhatsApp', 'Instagram']
    }
  },
  {
    nome: '🌙 Teste FORA HORÁRIO',
    payload: {
      from: '+351444444444',
      pushName: 'Ana Teste',
      body: 'Olá',
      message: {
        conversation: 'Olá'
      },
      key: {
        id: 'test_004',
        remoteJid: '+351444444444'
      }
    },
    esperado: {
      // Depende do horário atual, mas deve responder
      contem: ['CMTecnologia']
    }
  }
];

// ============================================
// FUNÇÕES DE TESTE
// ============================================

function testarWebhook(teste) {
  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.webhookUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const postData = JSON.stringify(teste.payload);

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n🧪 Executando: ${teste.nome}`);
    console.log(`📤 Enviando para: ${CONFIG.webhookUrl}`);

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📥 Status: ${res.statusCode}`);

        try {
          // Tentar parsear resposta
          let resposta;
          try {
            resposta = JSON.parse(data);
          } catch (e) {
            // Se não for JSON, resposta é texto
            resposta = { texto: data };
          }

          console.log(`📝 Resposta:`, data.substring(0, 200));

          // Validar resposta esperada
          let passou = true;
          const respostaStr = JSON.stringify(resposta).toLowerCase();

          if (teste.esperado.contem) {
            teste.esperado.contem.forEach(palavra => {
              if (!respostaStr.includes(palavra.toLowerCase())) {
                console.log(`❌ Palavra esperada não encontrada: "${palavra}"`);
                passou = false;
              }
            });
          }

          if (passou) {
            console.log(`✅ PASSOU`);
          } else {
            console.log(`❌ FALHOU`);
          }

          resolve({ teste: teste.nome, passou, resposta: data });
        } catch (error) {
          console.log(`⚠️ Erro ao validar resposta:`, error.message);
          resolve({ teste: teste.nome, passou: false, erro: error.message });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Erro na requisição:`, error.message);
      reject({ teste: teste.nome, erro: error.message });
    });

    req.write(postData);
    req.end();
  });
}

async function executarTestes() {
  console.log('🚀 INICIANDO TESTES DO WEBHOOK N8N');
  console.log('=' . repeat(50));

  const resultados = [];

  for (const teste of TESTES) {
    try {
      const resultado = await testarWebhook(teste);
      resultados.push(resultado);
      
      // Delay entre testes
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      resultados.push({ teste: teste.nome, passou: false, erro: error.erro });
    }
  }

  // Resumo final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(50));

  const passou = resultados.filter(r => r.passou).length;
  const total = resultados.length;

  resultados.forEach(r => {
    const status = r.passou ? '✅' : '❌';
    console.log(`${status} ${r.teste}`);
    if (r.erro) {
      console.log(`   Erro: ${r.erro}`);
    }
  });

  console.log(`\n🎯 Resultado: ${passou}/${total} testes passaram`);
  
  if (passou === total) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Workflow está funcionando corretamente');
  } else {
    console.log('⚠️ Alguns testes falharam. Verificar configuração.');
  }
}

// ============================================
// EXECUÇÃO
// ============================================

if (require.main === module) {
  executarTestes().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { testarWebhook, executarTestes };
