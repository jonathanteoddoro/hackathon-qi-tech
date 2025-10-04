# 🏦 Sistema P2P Lending com Morpho Blue

## 🎯 **Como funciona o empréstimo P2P real:**

### **Fluxo Completo do Empréstimo:**

```
1. 👨‍🌾 PRODUTOR: Solicita R$ 10.000 para plantar soja
   └─ Oferece colateral: 15.000 AFI tokens (150% do valor)

2. 👤 INVESTIDOR: "Vou emprestar R$ 10.000"
   └─ Sistema cria empréstimo P2P via Morpho Blue

3. 🔗 BLOCKCHAIN: Transação real executada
   ├─ Colateral: 15.000 AFI tokens bloqueados
   ├─ Principal: 10.000 USDC transferidos
   └─ Contrato: Morpho Blue gerencia a posição

4. 🌾 PRODUTOR: Recebe 10.000 USDC fictícios
   └─ Pode "usar" para plantar (simulado)

5. ⏰ CRONOGRAMA: 6 meses, 8.5% ao ano
   └─ Sistema monitora health factor e vencimento

6. 💸 LIQUIDAÇÃO: Automática via Morpho
   ├─ Se health factor < 1: Liquidação automática
   └─ Se pago: Colateral liberado
```

---

## 🔧 **Componentes Técnicos:**

### **1. Smart Contracts Envolvidos:**

- **AgroFi Token (AFI)**: `0xD5188F0A05719Ee91f25d02F6252461cBC216E61`
  - Tokens ERC-20 reais representando valor agrícola
  - Usado como colateral nos empréstimos

- **Morpho Blue**: `0x0000000000000000000000000000000000000001`
  - Protocol de lending descentralizado
  - Gerencia posições de empréstimo/colateral

- **USDC Sepolia**: `0xA0b86a33E6441b8BF6d6F8c5E64b3B4Ac4C1c8D4`
  - Stablecoin usado como moeda de empréstimo

### **2. Market ID AFI/USDC:**
```
0x3a85e619751152991742810df6ec69ce473daef99e28a64ab2340d7b7ccfee49
```

---

## 🚀 **APIs Disponíveis:**

### **Criar Empréstimo P2P:**
```bash
POST /api/marketplace/invest
{
  "loanId": "loan_001",
  "investmentAmount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "updatedLoan": {...}
}
```

### **Ver Posição P2P:**
```bash
GET /api/marketplace/p2p-position/loan_001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "loanId": "loan_001",
    "borrower": "0x...",
    "lender": "0x...",
    "principal": "10000.00",
    "collateral": "15000.00",
    "healthFactor": "1.38",
    "status": "ACTIVE",
    "maturityDate": "2025-04-04"
  }
}
```

---

## 💡 **Vantagens do Sistema P2P:**

### **Para Investidores:**
- ✅ **Empréstimo real na blockchain** (não só database)
- ✅ **Colateral garantido** (150% em AFI tokens)
- ✅ **Liquidação automática** via Morpho
- ✅ **Transparência total** (tudo auditável)
- ✅ **Juros reais** calculados automaticamente

### **Para Produtores:**
- ✅ **Acesso real a capital** (USDC fictício)
- ✅ **Usa tokens AFI como colateral**
- ✅ **Taxa de juros competitiva**
- ✅ **Cronograma flexível**

### **Para o Sistema:**
- ✅ **Descentralizado** (via Morpho)
- ✅ **Auditável** (blockchain pública)
- ✅ **Automatizado** (smart contracts)
- ✅ **Escalável** (protocol padrão)

---

## 🔍 **Como Verificar na Blockchain:**

### **1. Etherscan Sepolia:**
- Contrato AFI: https://sepolia.etherscan.io/address/0xD5188F0A05719Ee91f25d02F6252461cBC216E61
- Transações P2P: Buscar por hash retornado da API

### **2. Logs de Transação:**
```bash
# Backend logs mostram:
✅ Empréstimo P2P realizado via Morpho:
  - p2pTransactionHash: 0x...
  - lender: João Investidor
  - borrower: Carlos Fazendeiro  
  - principal: 10000
  - collateral: 15000
  - loanDetails: {...}
```

---

## 🎮 **Como Testar:**

1. **Abrir** http://localhost:5173
2. **Login** como investidor
3. **Escolher empréstimo** disponível
4. **Investir** (ex: R$ 5.000)
5. **Verificar transação** no Etherscan
6. **Conferir posição** via API

**O sistema agora cria empréstimos P2P REAIS usando Morpho Blue! 🎉**