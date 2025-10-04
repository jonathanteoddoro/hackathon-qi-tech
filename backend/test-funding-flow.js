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

async function testFundingFlow() {
  console.log('🔍 TESTANDO FLUXO DE FINANCIAMENTO COMPLETO\n');

  try {
    // 1. Registrar Produtor
    console.log('1️⃣ Registrando produtor...');
    const producer = await makeRequest('POST', '/api/auth-v2/register', {
      email: `producer${timestamp}@funding.com`,
      password: 'senha123',
      userType: 'producer',
      profile: { name: 'João Silva', farmName: 'Fazenda Funding', location: 'MT' }
    });
    const producerToken = producer.data.data.token;
    const producerAccount = producer.data.data.user.smartAccountAddress;
    console.log('✅ Produtor registrado:', producer.data.data.user.email);
    console.log('📍 Smart Account:', producerAccount);

    // 2. Registrar múltiplos investidores
    const investors = [];
    for (let i = 1; i <= 3; i++) {
      console.log(`\n2️⃣.${i} Registrando investidor ${i}...`);
      const investor = await makeRequest('POST', '/api/auth-v2/register', {
        email: `investor${i}_${timestamp}@funding.com`,
        password: 'senha123',
        userType: 'investor',
        profile: { name: `Investidor ${i}`, location: 'SP' }
      });
      investors.push({
        token: investor.data.data.token,
        email: investor.data.data.user.email,
        account: investor.data.data.user.smartAccountAddress
      });
      console.log('✅ Investidor registrado:', investor.data.data.user.email);
    }

    // 3. Criar empréstimo de R$ 30.000
    console.log('\n3️⃣ Criando empréstimo de R$ 30.000...');
    const loan = await makeRequest('POST', '/marketplace/loans', {
      requestedAmount: 30000,
      termMonths: 6,
      maxInterestRate: 8.5,
      collateralAmount: 100,
      collateralType: 'soja',
      warehouseLocation: 'Armazém Funding - MT',
      warehouseCertificate: 'CDA-FUNDING001',
      producerToken
    });

    const loanId = loan.data.data.id;
    console.log('✅ Empréstimo criado:', loanId);
    console.log('💰 Valor solicitado: R$ 30.000');
    console.log('📊 Status inicial:', loan.data.data.status);

    // 4. Investimentos parciais
    console.log('\n4️⃣ Fazendo investimentos parciais...');

    // Investidor 1: R$ 10.000
    console.log('\n4️⃣.1 Investidor 1 investindo R$ 10.000...');
    const investment1 = await makeRequest('POST', `/marketplace/loans/${loanId}/invest`, {
      investmentAmount: 10000
    }, investors[0].token);

    console.log('✅ Investimento 1 realizado');
    console.log('📊 Status após investimento 1:', investment1.data.data.updatedLoan.status);
    console.log('💰 Funding atual:', `R$ ${investment1.data.data.updatedLoan.currentFunding.toLocaleString()}`);

    // Investidor 2: R$ 15.000
    console.log('\n4️⃣.2 Investidor 2 investindo R$ 15.000...');
    const investment2 = await makeRequest('POST', `/marketplace/loans/${loanId}/invest`, {
      investmentAmount: 15000
    }, investors[1].token);

    console.log('✅ Investimento 2 realizado');
    console.log('📊 Status após investimento 2:', investment2.data.data.updatedLoan.status);
    console.log('💰 Funding atual:', `R$ ${investment2.data.data.updatedLoan.currentFunding.toLocaleString()}`);

    // Investidor 3: R$ 5.000 (completa o financiamento)
    console.log('\n4️⃣.3 Investidor 3 investindo R$ 5.000 (finalizando)...');
    const investment3 = await makeRequest('POST', `/marketplace/loans/${loanId}/invest`, {
      investmentAmount: 5000
    }, investors[2].token);

    console.log('✅ Investimento 3 realizado - EMPRÉSTIMO TOTALMENTE FINANCIADO!');
    console.log('📊 Status final:', investment3.data.data.updatedLoan.status);
    console.log('💰 Funding final:', `R$ ${investment3.data.data.updatedLoan.currentFunding.toLocaleString()}`);
    console.log('🎯 Meta atingida:', investment3.data.data.updatedLoan.currentFunding >= investment3.data.data.updatedLoan.requestedAmount ? 'SIM' : 'NÃO');

    // 5. Verificar o que aconteceu com o produtor
    console.log('\n5️⃣ Verificando situação do produtor...');
    const finalLoan = await makeRequest('GET', `/marketplace/loans/${loanId}`);
    console.log('📊 Empréstimo final:', {
      status: finalLoan.data.data.status,
      currentFunding: finalLoan.data.data.currentFunding,
      requestedAmount: finalLoan.data.data.requestedAmount,
      investorsCount: finalLoan.data.data.investors.length
    });

    // 6. Verificar saldos dos smart accounts (se disponível)
    console.log('\n6️⃣ Análise da transferência de fundos...');
    console.log('🤔 PERGUNTA: O PRODUTOR RECEBE OS FUNDOS AUTOMATICAMENTE?');
    console.log('📋 Análise do código:');
    console.log('   - ✅ Tokens AFI são mintados para o investidor');
    console.log('   - ✅ Status muda para "funded" quando 100% financiado');
    console.log('   - ❓ Não há transferência automática para o produtor no código atual');
    console.log('   - ❓ Os fundos ficam "presos" nos tokens AFI até o resgate manual');

    console.log('\n🚨 CONCLUSÃO ATUAL:');
    console.log('❌ NÃO - O produtor NÃO recebe automaticamente quando financiado');
    console.log('💡 O sistema atual apenas:');
    console.log('   1. Minta tokens AFI para investidores');
    console.log('   2. Atualiza status para "funded"');
    console.log('   3. Registra os investimentos');
    console.log('\n💭 SUGESTÃO: Implementar transferência automática ou manual para o produtor');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
  }
}

if (require.main === module) {
  setTimeout(testFundingFlow, 1000);
}