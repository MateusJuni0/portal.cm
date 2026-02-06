
import { spawn } from 'child_process';

const openclaw = spawn('openclaw', ['channels', 'login'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';

openclaw.stdout.on('data', (data) => {
  const str = data.toString();
  output += str;
  console.log(str);
  
  // Se o OpenClaw pedir alguma entrada ou mostrar o QR, tentamos forçar o modo telefone
  // Dependendo da versão, carregar 'p' ou '2' pode mudar para Pairing Code
  if (str.includes('QR') || str.includes('connection')) {
    openclaw.stdin.write('p\n'); // Tenta 'p' de pairing
    openclaw.stdin.write('351964977047\n'); // Envia o número caso peça
  }
});

setTimeout(() => {
  console.log('--- FIM DO TESTE ---');
  openclaw.kill();
  process.exit();
}, 15000);
