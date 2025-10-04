# 🚀 GUIA DE TESTE - FLUXO COMPLETO FRONTEND

## 📋 **PRÉ-REQUISITOS**

### ✅ Serviços Rodando:
- **Backend:** http://localhost:3001 ✅
- **Frontend:** http://localhost:5173 ✅
- **PostgreSQL:** Ativo ✅
- **Blockchain:** Sepolia Testnet ✅

### 👥 Usuários de Teste Disponíveis:
```json
{
  "investor": {
    "email": "investor@agrofi.com",
    "password": "senha123",
    "smartAccount": "0xc00f1F2C43D33e1FAe65d7A0D121366A8AA26D54"
  },
  "producer": {
    "email": "producer@agrofi.com", 
    "password": "senha123",
    "smartAccount": "0x5c4474fBF009239D52C8423Df96054edC2d73cBC"
  }
}
```

---

## 🌐 **PASSO 1: ACESSO AO FRONTEND**

1. Abra o navegador em: **http://localhost:5173**
2. Você verá a tela de login/registro da AgroFi

---

## 🔐 **PASSO 2: LOGIN COMO INVESTIDOR**

1. Na aba **"Login"**:
   - **Email:** `investor@agrofi.com`
   - **Senha:** `senha123`
2. Clique em **"Entrar"**
3. ✅ Você deve ser logado e ver o dashboard de investidor

### 📊 **O que você verá:**
- **Marketplace** com empréstimos disponíveis
- **4 empréstimos ativos** (incluindo 1 já financiado)
- Informações dos produtores (nome, localização, risk score)
- Valores, taxas e prazos

---

## 💰 **PASSO 3: REALIZAR INVESTIMENTO**

1. **Escolha um empréstimo** com status "Aberto" ou "Em financiamento"
2. Clique em **"Investir"**
3. **Digite o valor** (ex: R$ 10.000)
4. Clique em **"Confirmar Investimento"**

### 🔄 **O que acontece nos bastidores:**
```
🔐 Validação do investidor
🌾 Preparação do colateral (AFI tokens)
💰 Obtenção de USDC (faucets)
🏦 P2P Lending via Morpho Blue
📊 Atualização do empréstimo
💸 Transferência para produtor (se totalmente financiado)
```

### ✅ **Resultado esperado:**
- ✨ **Hash de transação REAL** da blockchain
- 📈 **Status atualizado** do empréstimo
- 🎉 **Confirmação visual** do investimento

---

## 🌾 **PASSO 4: LOGIN COMO PRODUTOR**

1. **Logout** da conta de investidor
2. **Login** com:
   - **Email:** `producer@agrofi.com`
   - **Senha:** `senha123`
3. ✅ Você verá o dashboard de produtor

### 📋 **O que você verá:**
- **Meus Empréstimos** (já criados)
- Opção para **Criar Nova Solicitação**
- Status dos financiamentos

---

## 📝 **PASSO 5: CRIAR NOVO EMPRÉSTIMO**

1. Vá para aba **"Criar Empréstimo"**
2. Preencha os campos:
   ```
   Valor Solicitado: R$ 50.000
   Prazo: 6 meses
   Taxa Máxima: 9%
   Garantia: 600 sacas de soja
   Local: Armazém Rural - MT
   Certificado: CDA-TEST001
   ```
3. Clique em **"Solicitar Empréstimo"**

### ✅ **Resultado esperado:**
- 📋 **Empréstimo criado** com sucesso
- 🆔 **ID único** gerado
- 📍 **Market ID** do Morpho Blue
- ⏰ **Status:** "Aberto"

---

## 🔄 **PASSO 6: FLUXO COMPLETO DE TESTE**

### **Cenário: Investimento → Financiamento → Transferência**

1. **Como Produtor:**
   - Criar empréstimo de R$ 20.000
   
2. **Como Investidor:**
   - Investir R$ 20.000 (100% do valor)
   
3. **Resultado Automático:**
   - ✅ Status muda para "Financiado"
   - 💸 USDC transferido para produtor
   - 🔗 Hash de transação real gerado
   - 📊 Empréstimo aparece como ativo

---

## 🧪 **TESTES DE API DIRETA**

### **Verificar empréstimos disponíveis:**
```bash
curl -s http://localhost:3001/marketplace/loans | jq '.'
```

### **Fazer investimento direto:**
```bash
curl -X POST http://localhost:3001/marketplace/loans/loan_001/invest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{"investmentAmount": 10000}'
```

### **Verificar usuários:**
```bash
curl -s http://localhost:3001/api/debug/users | jq '.'
```

---

## 🎯 **PONTOS DE VALIDAÇÃO**

### ✅ **Frontend:**
- [x] Login/logout funcionando
- [x] Marketplace carregando empréstimos
- [x] Modal de investimento funcional
- [x] Formulário de criação de empréstimo
- [x] Feedback visual (loading, erros, sucessos)

### ✅ **Backend:**
- [x] Autenticação JWT
- [x] CRUD de empréstimos
- [x] P2P Lending real via Morpho Blue
- [x] Smart Accounts funcionando
- [x] Tokens AFI/USDC integrados

### ✅ **Blockchain:**
- [x] Transações reais na Sepolia
- [x] Smart contracts deployados
- [x] Account Abstraction ativo
- [x] Faucets de USDC funcionando

---

## 🚨 **PROBLEMAS CONHECIDOS & SOLUÇÕES**

### **Problema:** "Empréstimo não encontrado"
- **Causa:** IDs inconsistentes entre marketplace service e database
- **Solução:** Usar empréstimos existentes no marketplace

### **Problema:** "Token inválido"
- **Causa:** JWT expirado ou malformado
- **Solução:** Fazer logout/login novamente

### **Problema:** "Erro de CORS"
- **Causa:** Frontend e backend em portas diferentes
- **Solução:** Já configurado (localhost:5173 → localhost:3001)

---

## 🎉 **SUCESSO COMPLETO!**

**Se todos os passos funcionaram, você tem:**
- ✅ **Sistema P2P funcionando end-to-end**
- ✅ **Transações reais na blockchain**
- ✅ **Interface completa e funcional**
- ✅ **Integração perfeita frontend ↔ backend ↔ blockchain**

**O sistema AgroFi está 100% operacional! 🚀**

---

## 📞 **SUPORTE**

**URLs importantes:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Swagger API: http://localhost:3001/api (se disponível)
- Blockchain Explorer: https://sepolia.etherscan.io/

**Logs importantes:**
- Backend: `tail -f backend/server.log`
- Frontend: Console do navegador (F12)