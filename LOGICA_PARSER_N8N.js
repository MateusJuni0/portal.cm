// N8N CODE NODE - PARSER & LOGIC
// Este script recebe o JSON da IA e decide as ações (Alertas, Compras, Perguntas)

const aiOutput = $input.all()[0].json.ai_response; // Assume que o nó anterior chama 'ai_response'
let parsedData;

// 1. Limpeza e Parse Seguro
try {
  // Remove markdown code blocks se a IA desobedecer
  const cleanJson = aiOutput.replace(/```json/g, '').replace(/```/g, '').trim();
  parsedData = JSON.parse(cleanJson);
} catch (e) {
  return [{ json: { error: "Falha no parse do JSON", raw: aiOutput } }];
}

const items = parsedData.items || [];
const anomalies = parsedData.anomalies || [];
const alerts = [];
const shoppingList = [];

// 2. Lógica de Negócio (O "Cérebro" do Agente)
for (const item of items) {
  
  // Regra: Estoque Crítico
  if (item.status === 'aberto_final' || item.quantity_detected <= 1) {
    alerts.push(`⚠️ ${item.name} (${item.brand}) está no fim!`);
    shoppingList.push({ product: item.name, search_query: `${item.name} ${item.brand} ${item.weight_volume} preço` });
  }

  // Regra: Validade (Simulação, já que a IA pode retornar null)
  if (item.expiry_date) {
    const today = new Date();
    const expiry = new Date(item.expiry_date);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays < 7 && diffDays > 0) {
      alerts.push(`⏳ ${item.name} vence em ${diffDays} dias. Use logo!`);
    } else if (diffDays <= 0) {
      alerts.push(`☣️ ${item.name} VENCEU! Descarte.`);
    }
  }
}

// 3. Preparar mensagem pro Agente (WhatsApp)
let messageToUser = "";

if (items.length > 0) {
  messageToUser += `👁️ *Visão de Deus:* Identifiquei ${items.length} itens.\n`;
}

if (alerts.length > 0) {
  messageToUser += `\n🚨 *Atenção:*\n${alerts.map(a => `- ${a}`).join('\n')}\n`;
}

if (anomalies.length > 0) {
  messageToUser += `\n🤔 *Dúvida:*\n${anomalies.map(a => `- ${a}`).join('\n')}\n`;
  messageToUser += `_O que são esses itens? Me ajuda a catalogar?_`;
}

if (shoppingList.length > 0) {
    // Flag para ativar o nó de Web Search depois
    messageToUser += `\n🛒 *Sugestão de Compra:* Adicionei ${shoppingList.length} itens na lista de pesquisa.`;
}

// Retorno estruturado para os próximos nós (Switch / HTTP Request)
return [{
  json: {
    inventory_update: items,
    shopping_triggers: shoppingList,
    whatsapp_message: messageToUser,
    has_anomalies: anomalies.length > 0,
    has_shopping: shoppingList.length > 0
  }
}];
