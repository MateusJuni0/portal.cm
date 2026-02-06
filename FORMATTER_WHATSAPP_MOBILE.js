// N8N CODE NODE - FORMATADOR WHATSAPP MOBILE
// Função: Transformar listas chatas em interfaces nativas do WhatsApp (Botões e Listas)
// Otimizado para: Evolution API / WppConnect

const input = $input.all()[0].json; // Dados vindos do Gestor ou Visão
const type = input.message_type || 'text'; // 'list', 'buttons', 'text'

let evolutionPayload = {};

// 1. FORMATAÇÃO DE LISTA (Menu de Opções)
// Ideal para: Resultados de busca, categorias, listas de compras longas (>3 itens)
if (type === 'list' && input.items.length > 0) {
  const sections = [{
    title: "Resultados",
    rows: input.items.slice(0, 10).map(item => ({
      title: item.name.substring(0, 24), // Limite do WhatsApp
      description: `${item.price} | ${item.store}`,
      rowId: `BUY_${item.id}`
    }))
  }];

  evolutionPayload = {
    number: input.user_phone,
    title: input.header_text || "Visão de Deus",
    description: input.body_text,
    buttonText: "Ver Opções",
    sections: sections
  };
  
  return { json: { endpoint: '/message/sendList', payload: evolutionPayload } };
}

// 2. FORMATAÇÃO DE BOTÕES (Ação Rápida)
// Ideal para: Sim/Não, Confirmar Compra, Ignorar
if (type === 'buttons') {
  const buttons = input.actions.slice(0, 3).map((act, index) => ({
    id: `BTN_${index}`,
    displayText: act.label
  }));

  evolutionPayload = {
    number: input.user_phone,
    text: input.body_text,
    buttons: buttons
  };

  return { json: { endpoint: '/message/sendButtons', payload: evolutionPayload } };
}

// 3. TEXTO PADRÃO (Fallback)
return { 
  json: { 
    endpoint: '/message/sendText', 
    payload: { number: input.user_phone, text: input.body_text } 
  } 
};
