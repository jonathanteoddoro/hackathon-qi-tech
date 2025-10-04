#!/usr/bin/env node
const https = require('https');

// Configuração do teste
const BASE_URL = 'http://localhost:3001';
const timestamp = Date.now();
const config = {
  producer: {
    email: `produtor${timestamp}@teste.com`,
    password: 'senha123',
    userType: 'producer',
    profile: {
      name: 'João Silva',
      farmName: 'Fazenda São João',
      location: 'Sorriso, MT',
      cropTypes: ['soja', 'milho'],
      farmSize: 1000
    }
  },
  investor: {
    email: `investidor${timestamp}@teste.com`,
    password: 'senha123',
    userType: 'investor',
    profile: {
      name: 'Maria Santos',
      location: 'São Paulo, SP',
      riskTolerance: 'medium',
      investmentGoals: 'diversification'
    }
  },
  loan: {
    requestedAmount: 100000,
    termMonths: 6,
    maxInterestRate: 8.5,
    collateralAmount: 300,
    collateralType: 'soja',
    warehouseLocation: 'Armazém Teste - Sorriso/MT',
    warehouseCertificate: 'CDA-TEST001'
  },
  investment: {
    investmentAmount: 25000
  }
};

// Função para fazer requisições HTTP
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

    const req = require(url.protocol === 'https:' ? 'https' : 'http').request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Função para log colorido
function log(step, message, data = null) {
  const colors = {
    info: '\x1b[36m',    // cyan
    success: '\x1b[32m', // green
    error: '\x1b[31m',   // red
    warn: '\x1b[33m',    // yellow
    reset: '\x1b[0m'
  };

  const type = step.includes('✅') ? 'success' :
               step.includes('❌') ? 'error' :
               step.includes('⚠️') ? 'warn' : 'info';

  console.log(`${colors[type]}${step} ${message}${colors.reset}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Função principal do teste
async function runDemoFlow() {
  try {
    console.log('\n🚀 INICIANDO TESTE DE FLUXO COMPLETO DA DEMO\n');

    let producerToken, investorToken, loanId;

    // 1. REGISTRO DO PRODUTOR
    log('📝 PASSO 1:', 'Registrando produtor...');
    const producerReg = await makeRequest('POST', '/api/auth-v2/register', config.producer);

    if (producerReg.status === 201 || producerReg.status === 200) {
      producerToken = producerReg.data.data.token;
      log('✅ SUCESSO:', 'Produtor registrado', {
        email: config.producer.email,
        smartAccount: producerReg.data.data.smartAccount.smartAccountAddress
      });
    } else {
      log('❌ ERRO:', 'Falha no registro do produtor', producerReg.data);
      return;
    }

    // 2. REGISTRO DO INVESTIDOR
    log('\n📝 PASSO 2:', 'Registrando investidor...');
    const investorReg = await makeRequest('POST', '/api/auth-v2/register', config.investor);

    if (investorReg.status === 201 || investorReg.status === 200) {
      investorToken = investorReg.data.data.token;
      log('✅ SUCESSO:', 'Investidor registrado', {
        email: config.investor.email,
        smartAccount: investorReg.data.data.smartAccount.smartAccountAddress
      });
    } else {
      log('❌ ERRO:', 'Falha no registro do investidor', investorReg.data);
      return;
    }

    // 3. LOGIN DO PRODUTOR (teste de autenticação)
    log('\n🔐 PASSO 3:', 'Fazendo login do produtor...');
    const producerLogin = await makeRequest('POST', '/api/auth-v2/login', {
      email: config.producer.email,
      password: config.producer.password
    });

    if (producerLogin.status === 200 && producerLogin.data.success) {
      log('✅ SUCESSO:', 'Login do produtor realizado');
    } else {
      log('❌ ERRO:', 'Falha no login do produtor', producerLogin.data);
      return;
    }

    // 4. CRIAÇÃO DE EMPRÉSTIMO
    log('\n💰 PASSO 4:', 'Criando solicitação de empréstimo...');
    const loanData = { ...config.loan, producerToken };
    const loanCreate = await makeRequest('POST', '/marketplace/loans', loanData);

    if (loanCreate.status === 201 || loanCreate.status === 200) {
      loanId = loanCreate.data.data.id;
      log('✅ SUCESSO:', 'Empréstimo criado', {
        id: loanId,
        amount: config.loan.requestedAmount,
        status: loanCreate.data.data.status
      });
    } else {
      log('❌ ERRO:', 'Falha na criação do empréstimo', loanCreate.data);
      return;
    }

    // 5. LISTAGEM DE EMPRÉSTIMOS
    log('\n📋 PASSO 5:', 'Listando empréstimos disponíveis...');
    const loansList = await makeRequest('GET', '/marketplace/loans');

    if (loansList.status === 200) {
      log('✅ SUCESSO:', `${loansList.data.data.length} empréstimos encontrados`);
    } else {
      log('❌ ERRO:', 'Falha na listagem de empréstimos', loansList.data);
    }

    // 6. INVESTIMENTO
    log('\n💼 PASSO 6:', 'Realizando investimento...');
    const investment = await makeRequest(
      'POST',
      `/marketplace/loans/${loanId}/invest`,
      config.investment,
      investorToken
    );

    if (investment.status === 200 && investment.data.success) {
      log('✅ SUCESSO:', 'Investimento realizado', {
        amount: config.investment.investmentAmount,
        txHash: investment.data.data.transactionHash,
        loanStatus: investment.data.data.updatedLoan.status
      });
    } else {
      log('❌ ERRO:', 'Falha no investimento', investment.data);
    }

    // 7. VERIFICAÇÃO DE POSIÇÃO P2P
    log('\n🔍 PASSO 7:', 'Verificando posição P2P do investidor...');
    const position = await makeRequest(
      'GET',
      `/marketplace/loans/${loanId}/position`,
      null,
      investorToken
    );

    if (position.status === 200) {
      log('✅ SUCESSO:', 'Posição P2P verificada', position.data.data);
    } else {
      log('❌ ERRO:', 'Falha na verificação de posição', position.data);
    }

    // 8. VERIFICAÇÃO DOS INVESTIMENTOS DO USUÁRIO
    log('\n💼 PASSO 8:', 'Verificando investimentos do usuário...');
    const myInvestments = await makeRequest(
      'GET',
      '/marketplace/my-investments',
      null,
      investorToken
    );

    if (myInvestments.status === 200) {
      log('✅ SUCESSO:', `${myInvestments.data.data.length} investimentos encontrados`);
    } else {
      log('❌ ERRO:', 'Falha na verificação de investimentos', myInvestments.data);
    }

    // 9. VERIFICAÇÃO DOS EMPRÉSTIMOS DO PRODUTOR
    log('\n📋 PASSO 9:', 'Verificando empréstimos do produtor...');
    const myLoans = await makeRequest(
      'GET',
      '/marketplace/my-loans',
      null,
      producerToken
    );

    if (myLoans.status === 200) {
      log('✅ SUCESSO:', `${myLoans.data.data.length} empréstimos do produtor encontrados`);
    } else {
      log('❌ ERRO:', 'Falha na verificação de empréstimos do produtor', myLoans.data);
    }

    // 10. ESTATÍSTICAS DO MARKETPLACE
    log('\n📊 PASSO 10:', 'Buscando estatísticas do marketplace...');
    const stats = await makeRequest('GET', '/marketplace/stats');

    if (stats.status === 200) {
      log('✅ SUCESSO:', 'Estatísticas obtidas', stats.data.data);
    } else {
      log('❌ ERRO:', 'Falha na obtenção de estatísticas', stats.data);
    }

    // 11. CONFIGURAÇÕES DO MORPHO
    log('\n⚙️ PASSO 11:', 'Verificando configurações do Morpho...');
    const morphoConfig = await makeRequest('GET', '/marketplace/config');

    if (morphoConfig.status === 200) {
      log('✅ SUCESSO:', 'Configurações do Morpho obtidas', {
        markets: morphoConfig.data.data.markets.length,
        collaterals: morphoConfig.data.data.supportedCollaterals
      });
    } else {
      log('❌ ERRO:', 'Falha na obtenção das configurações', morphoConfig.data);
    }

    console.log('\n🎉 TESTE DE FLUXO COMPLETO FINALIZADO COM SUCESSO! 🎉\n');

    // Resumo final
    console.log('📊 RESUMO DO TESTE:');
    console.log(`- Produtor registrado: ${config.producer.email}`);
    console.log(`- Investidor registrado: ${config.investor.email}`);
    console.log(`- Empréstimo criado: ${loanId}`);
    console.log(`- Valor do empréstimo: R$ ${config.loan.requestedAmount.toLocaleString()}`);
    console.log(`- Investimento realizado: R$ ${config.investment.investmentAmount.toLocaleString()}`);
    console.log(`- Taxa de juros: ${config.loan.maxInterestRate}%`);
    console.log(`- Prazo: ${config.loan.termMonths} meses`);
    console.log(`- Colateral: ${config.loan.collateralAmount} ton de ${config.loan.collateralType}`);

  } catch (error) {
    log('❌ ERRO FATAL:', error.message);
    console.error(error);
  }
}

// Executar o teste
if (require.main === module) {
  console.log('🔧 Aguarde o servidor estar rodando em', BASE_URL);
  console.log('💡 Execute: npm run start:dev\n');

  setTimeout(() => {
    runDemoFlow().catch(console.error);
  }, 2000);
}

module.exports = { runDemoFlow, makeRequest, config };