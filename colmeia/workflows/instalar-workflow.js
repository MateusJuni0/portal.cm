#!/usr/bin/env node

/**
 * SCRIPT DE INSTALAÇÃO AUTOMÁTICA - WORKFLOW N8N
 * 
 * Este script:
 * 1. Conecta no N8N via API
 * 2. Cria o workflow automaticamente
 * 3. Ativa o workflow
 * 4. Retorna a URL do webhook
 * 
 * USO:
 * node instalar-workflow.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURAÇÃO
// ============================================

const CONFIG = {
  // URL do N8N (ajustar se necessário)
  n8nUrl: 'http://localhost:5678',
  
  // Ou se no VPS:
  // n8nUrl: 'http://72.62.179.56:5678',
  
  // Credenciais N8N (se tiver autenticação)
  email: 'cmtecnologia12@gmail.com',
  password: '8zSz57JMBncnptX',
  
  // Caminho do workflow
  workflowFile: path.join(__dirname, '01_GERENTE_WHATSAPP_COMPLETO.json')
};

// ============================================
// FUNÇÕES
// ============================================

/**
 * Fazer requisição HTTP/HTTPS
 */
function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(reqOptions, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Login no N8N (se tiver autenticação)
 */
async function loginN8N() {
  console.log('🔐 Fazendo login no N8N...');
  
  try {
    const response = await request({
      url: `${CONFIG.n8nUrl}/rest/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: CONFIG.email,
      password: CONFIG.password
    });

    if (response.status === 200 && response.data.token) {
      console.log('✅ Login bem-sucedido!');
      return response.data.token;
    } else {
      console.log('⚠️ N8N sem autenticação ou login falhou');
      return null;
    }
  } catch (error) {
    console.log('⚠️ Erro no login (N8N pode estar sem auth):', error.message);
    return null;
  }
}

/**
 * Criar workflow no N8N
 */
async function criarWorkflow(token) {
  console.log('📦 Carregando workflow do arquivo...');
  
  const workflowData = JSON.parse(fs.readFileSync(CONFIG.workflowFile, 'utf8'));
  
  console.log(`📝 Workflow: ${workflowData.name}`);
  console.log(`🔢 Nós: ${workflowData.nodes.length}`);
  
  console.log('\n🚀 Criando workflow no N8N...');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await request({
      url: `${CONFIG.n8nUrl}/rest/workflows`,
      method: 'POST',
      headers
    }, workflowData);

    if (response.status === 200 || response.status === 201) {
      console.log('✅ Workflow criado com sucesso!');
      console.log(`📋 ID: ${response.data.id}`);
      return response.data;
    } else {
      console.log('❌ Erro ao criar workflow:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Erro ao criar workflow:', error.message);
    return null;
  }
}

/**
 * Ativar workflow
 */
async function ativarWorkflow(workflowId, token) {
  console.log('\n⚡ Ativando workflow...');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await request({
      url: `${CONFIG.n8nUrl}/rest/workflows/${workflowId}`,
      method: 'PATCH',
      headers
    }, {
      active: true
    });

    if (response.status === 200) {
      console.log('✅ Workflow ativado!');
      return true;
    } else {
      console.log('⚠️ Erro ao ativar workflow:', response.data);
      return false;
    }
  } catch (error) {
    console.log('⚠️ Erro ao ativar workflow:', error.message);
    return false;
  }
}

/**
 * Obter URL do webhook
 */
function obterUrlWebhook(workflow) {
  const webhookNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
  
  if (webhookNode) {
    const path = webhookNode.parameters.path || 'whatsapp-cmtec';
    const webhookUrl = `${CONFIG.n8nUrl}/webhook/${path}`;
    return webhookUrl;
  }
  
  return null;
}

/**
 * Exibir instruções finais
 */
function exibirInstrucoes(workflow, webhookUrl) {
  console.log('\n' + '='.repeat(60));
  console.log('🎉 INSTALAÇÃO CONCLUÍDA!');
  console.log('='.repeat(60));
  
  console.log('\n📊 Workflow criado:');
  console.log(`   Nome: ${workflow.name}`);
  console.log(`   ID: ${workflow.id}`);
  console.log(`   Status: ${workflow.active ? '✅ Ativo' : '⚠️ Inativo'}`);
  
  if (webhookUrl) {
    console.log('\n🔗 URL do Webhook:');
    console.log(`   ${webhookUrl}`);
    console.log('\n📝 Próximo passo:');
    console.log('   1. Copie a URL acima');
    console.log('   2. Configure no OpenClaw (openclaw.json):');
    console.log(`\n   "webhook": {`);
    console.log(`     "url": "${webhookUrl}",`);
    console.log(`     "events": ["message"]`);
    console.log(`   }`);
    console.log('\n   3. Reinicie: openclaw gateway restart');
  }
  
  console.log('\n🧪 Testar:');
  console.log('   node test-webhook.js');
  
  console.log('\n✅ Workflow pronto para receber mensagens!');
  console.log('='.repeat(60) + '\n');
}

// ============================================
// EXECUÇÃO PRINCIPAL
// ============================================

async function main() {
  console.log('🚀 INSTALAÇÃO AUTOMÁTICA - WORKFLOW N8N');
  console.log('='.repeat(60));
  console.log(`📍 N8N URL: ${CONFIG.n8nUrl}`);
  console.log('='.repeat(60) + '\n');
  
  try {
    // 1. Login (se necessário)
    const token = await loginN8N();
    
    // 2. Criar workflow
    const workflow = await criarWorkflow(token);
    
    if (!workflow) {
      console.log('\n❌ Falha ao criar workflow.');
      console.log('💡 Possíveis soluções:');
      console.log('   - Verifique se N8N está rodando');
      console.log('   - Verifique a URL do N8N no CONFIG');
      console.log('   - Tente importar manualmente no N8N UI');
      process.exit(1);
    }
    
    // 3. Ativar workflow
    await ativarWorkflow(workflow.id, token);
    
    // 4. Obter URL webhook
    const webhookUrl = obterUrlWebhook(workflow);
    
    // 5. Exibir instruções
    exibirInstrucoes(workflow, webhookUrl);
    
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    console.log('\n💡 Tente importar manualmente:');
    console.log('   1. Abra o N8N');
    console.log('   2. Workflows → Import from File');
    console.log('   3. Selecione: 01_GERENTE_WHATSAPP_COMPLETO.json');
    process.exit(1);
  }
}

// Executar se for o script principal
if (require.main === module) {
  main();
}

module.exports = { criarWorkflow, ativarWorkflow };
