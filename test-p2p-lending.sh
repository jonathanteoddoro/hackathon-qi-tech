#!/bin/bash

echo "🧪 Testando Sistema P2P Lending"
echo "================================"

# 1. Verificar se o backend está ativo
echo "1️⃣ Verificando backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/marketplace/loans)
if [ "$BACKEND_STATUS" == "200" ]; then
    echo "✅ Backend ativo"
else
    echo "❌ Backend não responde (HTTP $BACKEND_STATUS)"
    exit 1
fi

# 2. Registrar usuário de teste
echo ""
echo "2️⃣ Registrando usuário de teste..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste.final@example.com",
    "password": "123456",
    "userType": "investor",
    "profile": {
      "name": "Teste Final Investidor",
      "location": "São Paulo, SP"
    }
  }')

echo "📝 Resposta do registro:"
echo "$REGISTER_RESPONSE" | jq '.'

# 3. Extrair token
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Falha ao obter token"
    exit 1
fi

echo ""
echo "🔑 Token obtido: ${TOKEN:0:50}..."
echo "👤 User ID: $USER_ID"

# 4. Testar investimento imediatamente
echo ""
echo "3️⃣ Testando investimento P2P..."
INVEST_RESPONSE=$(curl -s -X POST http://localhost:3001/api/marketplace/invest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "loanId": "loan_001",
    "investmentAmount": 5000
  }')

echo "💰 Resposta do investimento:"
echo "$INVEST_RESPONSE" | jq '.'

# 5. Verificar se foi bem-sucedido
SUCCESS=$(echo "$INVEST_RESPONSE" | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
    echo ""
    echo "🎉 SUCESSO! Sistema P2P Lending funcionando!"
    TX_HASH=$(echo "$INVEST_RESPONSE" | jq -r '.transactionHash')
    echo "📋 Transaction Hash: $TX_HASH"
    echo "🔗 Etherscan: https://sepolia.etherscan.io/tx/$TX_HASH"
else
    echo ""
    echo "❌ FALHA no investimento P2P"
    ERROR_MSG=$(echo "$INVEST_RESPONSE" | jq -r '.message')
    echo "💔 Erro: $ERROR_MSG"
fi