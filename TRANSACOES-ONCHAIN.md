# 🚀 Transações Onchain Reais - Base Sepolia

## 📊 Status Atual do Backend

✅ **Rede Configurada**: Base Sepolia (Testnet)  
✅ **Contratos Integrados**: Morpho Blue + USDC  
✅ **Endpoints Funcionais**: Simulação, criação de empréstimos, verificação de posições  

## 🌐 Informações da Rede

- **Network**: Base Sepolia
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Morpho Blue**: `0x64c7044050Ba0431252df24fEd4d9635a275CB41`
- **USDC**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Explorer**: https://sepolia.basescan.org

## 💰 Como Obter Fundos de Teste

1. **Faucet da Coinbase**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
2. **Bridge Base Sepolia**: https://sepolia.base.org/bridge
3. **ETH Sepolia**: Depois converter para Base Sepolia

## 🛠 Endpoints Disponíveis

### 1. 📋 Informações da Rede
```bash
curl "http://localhost:3001/api/morpho-onchain/network-info"
```

### 2. 🎮 Simular Empréstimo
```bash
curl -X POST "http://localhost:3001/api/morpho-onchain/simulate-loan" \
  -H "Content-Type: application/json" \
  -d '{
    "collateralAmount": "1000",
    "targetLtv": 0.7
  }'
```

### 3. 🏦 Criar Empréstimo Real na Blockchain
```bash
curl -X POST "http://localhost:3001/api/morpho-onchain/create-loan" \
  -H "Content-Type: application/json" \
  -d '{
    "collateralAmount": "1000",
    "borrowAmount": "700",
    "userAddress": "0xSUA_CARTEIRA",
    "userPrivateKey": "0xSUA_CHAVE_PRIVADA",
    "marketId": "USDC/ETH"
  }'
```

### 4. 👤 Verificar Posição do Usuário
```bash
curl -X POST "http://localhost:3001/api/morpho-onchain/user-position" \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": "USDC/ETH",
    "userAddress": "0xSUA_CARTEIRA"
  }'
```

## 🔄 Fluxo Completo de Transação

### Passo 1: Preparar Carteira
1. Criar carteira ou usar existente
2. Obter ETH na Base Sepolia para gas
3. Obter USDC de teste (ou fazer swap)

### Passo 2: Simular Empréstimo
```bash
# Exemplo: Simular com $1000 USDC
curl -X POST "http://localhost:3001/api/morpho-onchain/simulate-loan" \
  -H "Content-Type: application/json" \
  -d '{"collateralAmount": "1000", "targetLtv": 0.7}'
```

### Passo 3: Executar Transação Real
```bash
# ⚠️  ATENÇÃO: Use apenas em testnet!
curl -X POST "http://localhost:3001/api/morpho-onchain/create-loan" \
  -H "Content-Type: application/json" \
  -d '{
    "collateralAmount": "1000",
    "borrowAmount": "700",
    "userAddress": "0x...",
    "userPrivateKey": "0x...",
    "marketId": "USDC/ETH"
  }'
```

### Passo 4: Verificar Resultado
1. Copie o hash da transação retornado
2. Verifique no explorer: https://sepolia.basescan.org/tx/HASH
3. Confirme sua posição no Morpho

## 🔍 Verificação da Posição

```bash
curl -X POST "http://localhost:3001/api/morpho-onchain/user-position" \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": "USDC/ETH",
    "userAddress": "0xSUA_CARTEIRA"
  }'
```

## 📈 Próximos Passos

1. **✅ Testnet Funcionando**: Base Sepolia configurada
2. **🎯 Próximo**: Conectar com frontend para UX completa
3. **🚀 Depois**: Implementar repagamento e liquidação
4. **📊 Final**: Dashboard em tempo real das posições

## ⚠️ Importante

- **APENAS TESTNET**: Nunca use chaves privadas reais em desenvolvimento
- **GAS FEES**: Certifique-se de ter ETH suficiente na Base Sepolia
- **USDC TESTNET**: Use apenas USDC de teste da Base Sepolia
- **VERIFICAÇÃO**: Sempre verifique transações no explorer

## 🎯 Exemplo de Resposta Bem-Sucedida

```json
{
  "success": true,
  "transactionHash": "0x1234567890abcdef...",
  "loanDetails": {
    "collateralDeposited": "1000",
    "amountBorrowed": "700",
    "interestRate": "5.2%",
    "liquidationThreshold": "80%"
  },
  "network": "Base Sepolia",
  "timestamp": "2025-10-04T14:21:39.789Z"
}
```