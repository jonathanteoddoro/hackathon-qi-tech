# 🧪 Guia de Testes - Sistema DeFi com Carteiras Reais

## 🎯 **O que vamos testar:**
- ✅ Carteiras reais na Base Sepolia Testnet
- ✅ Transações ETH e USDC
- ✅ Integração Morpho on-chain (simulada)
- ✅ Fluxo completo de empréstimo agrícola

---

## 📋 **Pré-requisitos**

### 1. **Obter ETH de Teste**
```bash
# Base Sepolia Faucet
https://portal.cdp.coinbase.com/products/faucet

# Ou Alchemy Faucet
https://sepoliafaucet.com/
```

### 2. **Obter USDC de Teste**
```bash
# USDC na Base Sepolia: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
# Use bridge ou faucet específico
```

### 3. **Configurar MetaMask (opcional)**
```
Network: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency: ETH
Block Explorer: https://sepolia.basescan.org
```

---

## 🚀 **Testes Passo a Passo**

### **TESTE 1: Gerar Carteira Nova**

```bash
curl -X POST "http://localhost:3001/api/wallet/generate" | jq
```

**Resultado esperado:**
```json
{
  "address": "0x...",
  "privateKey": "0x...",
  "balance": "0",
  "chainId": 84532
}
```

**⚠️ IMPORTANTE**: Salve a privateKey para os próximos testes!

---

### **TESTE 2: Verificar Saldo**

```bash
# Substitua pelo endereço gerado
curl -X GET "http://localhost:3001/api/wallet/balance/0xSEU_ENDERECO" | jq
```

**Resultado esperado:**
```json
{
  "address": "0x...",
  "ethBalance": "0.1",
  "usdcBalance": "100.0",
  "chainId": 84532,
  "network": "Base Sepolia"
}
```

---

### **TESTE 3: Transferir ETH**

```bash
curl -X POST "http://localhost:3001/api/wallet/transfer/eth" \
  -H "Content-Type: application/json" \
  -d '{
    "fromPrivateKey": "0xSUA_PRIVATE_KEY",
    "toAddress": "0xENDERECO_DESTINO",
    "amount": "0.01"
  }' | jq
```

**Resultado esperado:**
```json
{
  "hash": "0x...",
  "success": true,
  "gasUsed": "21000"
}
```

---

### **TESTE 4: Simular Empréstimo de Soja**

```bash
curl -X POST "http://localhost:3001/api/morpho-onchain/simulate-loan" \
  -H "Content-Type: application/json" \
  -d '{
    "collateralAmount": "50000",
    "targetLtv": 0.7
  }' | jq
```

**Resultado esperado:**
```json
{
  "collateralAmount": "50000",
  "maxBorrowAmount": "35000.00",
  "recommendedBorrowAmount": "29750.00",
  "estimatedApy": 5.2,
  "monthlyInterest": "151.67",
  "liquidationPrice": "40000.00",
  "healthFactor": "1.43"
}
```

---

### **TESTE 5: Fluxo Completo - Empréstimo Soja**

```bash
curl -X POST "http://localhost:3001/api/morpho-onchain/soja-loan-complete" \
  -H "Content-Type: application/json" \
  -d '{
    "userPrivateKey": "0xSUA_PRIVATE_KEY",
    "sojaAmount": 100,
    "sojaPrice": 500,
    "ltvRatio": 0.7
  }' | jq
```

**Resultado esperado:**
```json 
{
  "simulation": {
    "collateralAmount": "50000",
    "maxBorrowAmount": "35000.00",
    "recommendedBorrowAmount": "29750.00"
  },
  "walletInfo": {
    "address": "0x...",
    "ethBalance": "0.1",
    "usdcBalance": "100.0"
  },
  "loanParams": {
    "collateralAmount": "50000",
    "borrowAmount": "35000.00",
    "userAddress": "0x..."
  },
  "nextSteps": [
    "1. Obter USDC de teste no faucet",
    "2. Executar createLoan com os parâmetros acima",
    "3. Verificar transação no Base Sepolia Explorer"
  ]
}
```

---

### **TESTE 6: Verificar Informações da Rede**

```bash
curl -X GET "http://localhost:3001/api/morpho-onchain/network-config" | jq
```

**Resultado esperado:**
```json
{
  "chainId": 84532,
  "name": "Base Sepolia",
  "rpcUrl": "https://sepolia.base.org",
  "morphoAddress": "0x64c7044050Ba0431252df24fEd4d9635a275CB41",
  "usdcAddress": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "explorer": "https://sepolia.basescan.org"
}
```

---

### **TESTE 7: Criar Empréstimo Real (se tiver USDC)**

```bash
curl -X POST "http://localhost:3001/api/morpho-onchain/create-loan" \
  -H "Content-Type: application/json" \
  -d '{
    "collateralAmount": "1000",
    "borrowAmount": "700",
    "userAddress": "0xSEU_ENDERECO",
    "userPrivateKey": "0xSUA_PRIVATE_KEY",
    "marketId": "USDC-TEST-MARKET"
  }' | jq
```

**⚠️ Nota**: Este teste requer USDC real na carteira!

---

## 🔍 **Verificação de Transações**

### **Explorer Base Sepolia**
```
https://sepolia.basescan.org/tx/0xSEU_HASH
```

### **Verificar via API**
```bash
curl -X GET "http://localhost:3001/api/morpho-onchain/explorer/0xSEU_HASH" | jq
```

---

## 🏃‍♂️ **Script de Teste Automático**

```bash
#!/bin/bash

echo "🧪 Iniciando testes automatizados..."

# 1. Gerar carteira
echo "1️⃣ Gerando carteira..."
WALLET=$(curl -s -X POST "http://localhost:3001/api/wallet/generate")
ADDRESS=$(echo $WALLET | jq -r '.address')
PRIVATE_KEY=$(echo $WALLET | jq -r '.privateKey')

echo "✅ Carteira criada: $ADDRESS"

# 2. Verificar saldo
echo "2️⃣ Verificando saldo..."
curl -s -X GET "http://localhost:3001/api/wallet/balance/$ADDRESS" | jq

# 3. Simular empréstimo
echo "3️⃣ Simulando empréstimo de soja..."
curl -s -X POST "http://localhost:3001/api/morpho-onchain/simulate-loan" \
  -H "Content-Type: application/json" \
  -d '{"collateralAmount": "50000", "targetLtv": 0.7}' | jq

# 4. Fluxo completo
echo "4️⃣ Testando fluxo completo..."
curl -s -X POST "http://localhost:3001/api/morpho-onchain/soja-loan-complete" \
  -H "Content-Type: application/json" \
  -d "{
    \"userPrivateKey\": \"$PRIVATE_KEY\",
    \"sojaAmount\": 100,
    \"sojaPrice\": 500,
    \"ltvRatio\": 0.7
  }" | jq

echo "🎉 Testes concluídos!"
```

---

## 📊 **Cenários de Teste**

### **Cenário 1: Pequeno Produtor**
- 50 toneladas de soja
- Preço: $400/tonelada
- Valor total: $20,000
- Empréstimo: $14,000 (70% LTV)

### **Cenário 2: Médio Produtor**
- 200 toneladas de soja
- Preço: $500/tonelada
- Valor total: $100,000
- Empréstimo: $70,000 (70% LTV)

### **Cenário 3: Grande Produtor**
- 1000 toneladas de soja
- Preço: $450/tonelada
- Valor total: $450,000
- Empréstimo: $315,000 (70% LTV)

---

## 🚨 **Troubleshooting**

### **Erro: "Failed to connect"**
```bash
# Verificar se o servidor está rodando
curl -X GET "http://localhost:3001/" 
```

### **Erro: "Insufficient funds"**
- Obter ETH no faucet da Base Sepolia
- Verificar se o endereço está correto

### **Erro: "Invalid private key"**
- Verificar formato da chave (deve começar com 0x)
- Gerar nova carteira se necessário

### **Transação pendente/falhou**
- Verificar no explorer: https://sepolia.basescan.org
- Aguardar 1-2 minutos para confirmação
- Verificar se há ETH suficiente para gas

---

## ✅ **Checklist de Sucesso**

- [ ] Carteira criada com sucesso
- [ ] Saldo verificado (ETH e USDC)
- [ ] Transferência ETH executada
- [ ] Simulação de empréstimo funcionando
- [ ] Fluxo completo retorna dados corretos
- [ ] URLs do explorer geradas
- [ ] Configurações de rede corretas
- [ ] (Opcional) Transação real no Morpho

---

## 🎯 **Próximos Passos**

1. **✅ Testes básicos funcionando** → Frontend
2. **✅ Carteiras reais integradas** → Smart contracts personalizados
3. **✅ Morpho simulado** → Morpho real com contratos
4. **✅ Base Sepolia** → Base Mainnet (produção)

**🚀 Sistema está pronto para demonstração no hackathon!**