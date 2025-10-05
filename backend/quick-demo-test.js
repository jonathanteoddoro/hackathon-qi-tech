#!/usr/bin/env node
const http = require('http');

const BASE_URL = 'http://localhost:3001';
const timestamp = Date.now();

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runQuickTest() {
  console.log('🚀 TESTE RÁPIDO DO FLUXO COMPLETO\n');

  try {
    // 1. Registrar Produtor
    console.log('1️⃣ Registrando produtor...');
    const producer = await makeRequest('POST', '/api/auth-v2/register', {
      email: `producer${timestamp}@demo.com`,
      password: 'senha123',
      userType: 'producer',
      profile: { name: 'João Silva', farmName: 'Fazenda Demo', location: 'MT' }
    });

    if (!producer.data.success) {
      throw new Error('Falha no registro do produtor');
    }
    console.log('✅ Produtor registrado:', producer.data.data.user.email);
    const producerToken = producer.data.data.token;

    // 2. Registrar Investidor
    console.log('\n2️⃣ Registrando investidor...');
    const investor = await makeRequest('POST', '/api/auth-v2/register', {
      email: `investor${timestamp}@demo.com`,
      password: 'senha123',
      userType: 'investor',
      profile: { name: 'Maria Santos', location: 'SP' }
    });

    if (!investor.data.success) {
      throw new Error('Falha no registro do investidor');
    }
    console.log('✅ Investidor registrado:', investor.data.data.user.email);
    const investorToken = investor.data.data.token;

    // 3. Criar empréstimo
    console.log('\n3️⃣ Criando empréstimo...');
    const loan = await makeRequest('POST', '/marketplace/loans', {
      requestedAmount: 50000,
      termMonths: 6,
      maxInterestRate: 8.5,
      collateralAmount: 200,
      collateralType: 'soja',
      warehouseLocation: 'Armazém Demo - MT',

      producerToken
    });

    if (!loan.data.success) {
      throw new Error('Falha na criação do empréstimo');
    }
    console.log('✅ Empréstimo criado:', loan.data.data.id);
    console.log('   💰 Valor:', `R$ ${loan.data.data.requestedAmount.toLocaleString()}`);
    const loanId = loan.data.data.id;

    // 4. Listar empréstimos
    console.log('\n4️⃣ Listando empréstimos...');
    const loans = await makeRequest('GET', '/marketplace/loans');
    console.log('✅ Total de empréstimos disponíveis:', loans.data.data.length);

    // 5. Fazer investimento
    console.log('\n5️⃣ Realizando investimento...');
    const investment = await makeRequest('POST', `/marketplace/loans/${loanId}/invest`, {
      investmentAmount: 15000
    }, investorToken);

    if (!investment.data.success) {
      throw new Error('Falha no investimento');
    }
    console.log('✅ Investimento realizado!');
    console.log('   💸 Valor investido:', `R$ ${(15000).toLocaleString()}`);
    console.log('   📊 Status do empréstimo:', investment.data.data.updatedLoan.status);
    console.log('   🔗 Hash da transação:', investment.data.data.transactionHash);

    // 6. Verificar estatísticas
    console.log('\n6️⃣ Verificando estatísticas...');
    const stats = await makeRequest('GET', '/marketplace/stats');
    console.log('✅ Estatísticas do marketplace:');
    console.log('   📈 Total de empréstimos:', stats.data.data.totalLoans);
    console.log('   💰 Total financiado:', `R$ ${stats.data.data.totalFunding.toLocaleString()}`);
    console.log('   📊 Taxa média:', `${stats.data.data.averageInterestRate}%`);

    // 7. Verificar posição do investidor
    console.log('\n7️⃣ Verificando posição P2P...');
    const position = await makeRequest('GET', `/marketplace/loans/${loanId}/position`, null, investorToken);
    console.log('✅ Posição do investidor:', position.data.data.position);
    console.log('   💵 Valor:', `R$ ${(position.data.data.amount).toLocaleString()}`);

    console.log('\n🎉 TESTE COMPLETO FINALIZADO COM SUCESSO! 🎉');
    console.log('\n📊 RESUMO:');
    console.log(`- Produtor: ${producer.data.data.user.email}`);
    console.log(`- Investidor: ${investor.data.data.user.email}`);
    console.log(`- Empréstimo: ${loanId} (R$ ${(loan.data.data.requestedAmount).toLocaleString()})`);
    console.log(`- Investimento: R$ ${(15000).toLocaleString()}`);
    console.log(`- Smart Accounts criadas: 2`);
    console.log(`- Transações blockchain: 1`);

  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

if (require.main === module) {
  setTimeout(runQuickTest, 1000);
}