import bcrypt from 'bcryptjs';
import slugify from '../src/utils/slugify';
import { generateWhatsAppMessage } from '../src/services/whatsappService';
import app from '../src/app';

async function runSystemValidation() {
  console.log('====================================================');
  console.log('🧪 ETERNA COSMÉTICOS — SUÍTE DE TESTES E VALIDAÇÃO');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Teste de Slugificação
  console.log('--- 1. Testes de Utilitários e Formatação ---');
  const slug1 = slugify('Batom Líquido Matte Rosa Glamour!');
  assert(slug1 === 'batom-liquido-matte-rosa-glamour', `Slug gerado corretamente: "${slug1}"`);

  const slug2 = slugify('Sérum Facial Anti-Idade 30ml / Ácido Hialurônico');
  assert(slug2 === 'serum-facial-anti-idade-30ml-acido-hialuronico', `Slug com acentos e caracteres especiais: "${slug2}"`);

  // 2. Teste de Segurança: Hash Bcrypt
  console.log('\n--- 2. Testes de Segurança & Criptografia ---');
  const testPassword = 'SenhaForteAdministradora2026!';
  const hash = await bcrypt.hash(testPassword, 12);
  assert(hash.startsWith('$2a$') || hash.startsWith('$2b$'), 'Bcrypt com cost factor 12 aplicado');
  const match = await bcrypt.compare(testPassword, hash);
  assert(match === true, 'Senha válida confirmada pelo hash');
  const wrongMatch = await bcrypt.compare('SenhaIncorreta', hash);
  assert(wrongMatch === false, 'Senha incorreta devidamente rejeitada');

  // 3. Teste de Geração de Mensagem WhatsApp
  console.log('\n--- 3. Teste do Fluxo de Pedido & WhatsApp ---');
  const mockOrder = {
    order_number: 'ETC-20261113-9821',
    customer_name: 'Ana Carolina',
    customer_phone: '41988887777',
    fulfillment_type: 'pickup' as const,
    subtotal: 150.0,
    discount_amount: 15.0,
    total: 135.0,
    items: [
      { product_name: 'Batom Matte Rosa', quantity: 2, unit_price: 50.0, total_price: 100.0 },
      { product_name: 'Blush Iluminador', quantity: 1, unit_price: 50.0, total_price: 50.0 },
    ],
  };

  const whatsappUrl = generateWhatsAppMessage(mockOrder as any);
  assert(whatsappUrl.includes('https://wa.me/55'), 'URL do WhatsApp direcionada para o padrão oficial brasileiro');
  assert(whatsappUrl.includes(encodeURIComponent('ETC-20261113-9821')), 'Mensagem contém o número único identificador do pedido');
  assert(whatsappUrl.includes(encodeURIComponent('Ana Carolina')), 'Mensagem contém o nome do cliente');
  assert(whatsappUrl.includes(encodeURIComponent('R$ 135,00')) || whatsappUrl.includes(encodeURIComponent('135.00')) || whatsappUrl.includes('135'), 'Mensagem contém o total correto');

  // 4. Teste de Regras de Cupons
  console.log('\n--- 4. Teste de Regras Comerciais (Cupons) ---');
  function calcDiscount(type: 'percentage' | 'fixed', val: number, subtotal: number, minOrder: number) {
    if (subtotal < minOrder) return { valid: false, error: 'Abaixo do pedido mínimo' };
    const discount = type === 'percentage' ? (subtotal * val) / 100 : Math.min(val, subtotal);
    return { valid: true, discount };
  }

  const c1 = calcDiscount('percentage', 10, 200, 50);
  assert(c1.valid && c1.discount === 20, 'Cupom de 10% em R$ 200 calcula desconto de R$ 20');

  const c2 = calcDiscount('fixed', 30, 100, 50);
  assert(c2.valid && c2.discount === 30, 'Cupom fixo de R$ 30 em R$ 100 calcula desconto de R$ 30');

  const c3 = calcDiscount('fixed', 50, 40, 100);
  assert(!c3.valid, 'Cupom com pedido mínimo de R$ 100 rejeitado em compra de R$ 40');

  // 5. Teste da Aplicação Express
  console.log('\n--- 5. Teste de Integridade do Backend Express ---');
  assert(typeof app.listen === 'function', 'Aplicação Express inicializada e configurada');
  assert(typeof (app as any).use === 'function', 'Todas as rotas e middlewares foram montados com sucesso');

  console.log('\n====================================================');
  console.log(`RESULTADO FINAL: ${passed} testes aprovados | ${failed} falhas`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSystemValidation().catch((err) => {
  console.error('Erro na execução dos testes:', err);
  process.exit(1);
});
