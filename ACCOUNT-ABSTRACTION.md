# 🔐 Sistema de Account Abstraction com Login Diferenciado

## 🎯 **Visão Geral**

Sistema completo de autenticação que diferencia **Investidores** e **Produtores**, cada um com suas Smart Accounts próprias e perfis personalizados.

## ✅ **Funcionalidades Implementadas**

### 🏦 **Account Abstraction**
- ✅ Smart Accounts individuais para cada usuário
- ✅ Carteiras geradas automaticamente  
- ✅ Integração com Base Sepolia
- ✅ Gerenciamento de saldos e transações

### 👥 **Sistema de Login Diferenciado**
- ✅ **Investidores**: Perfil focado em estratégias de investimento
- ✅ **Produtores**: Perfil agrícola com dados da fazenda
- ✅ JWT tokens personalizados por tipo de usuário
- ✅ Validação de credenciais por tipo

### 🔒 **Segurança**
- ✅ Senhas criptografadas com bcrypt
- ✅ JWT tokens com expiração de 24h
- ✅ Verificação de tipo de usuário no login
- ✅ Middleware de autenticação

## 🚀 **Endpoints Disponíveis**

### 📝 **1. Registro de Usuário**
```bash
POST /api/auth/register
```

**Exemplo - Registrar Produtor:**
```bash
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fazendeiro@exemplo.com",
    "password": "minhasenha123",
    "userType": "producer",
    "name": "João Fazendeiro",
    "profile": {
      "farmName": "Fazenda São João",
      "location": "Sorriso, MT",
      "cropTypes": ["soja", "milho"],
      "farmSize": 500
    }
  }'
```

**Exemplo - Registrar Investidor:**
```bash
curl -X POST "http://localhost:3001/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investidor@exemplo.com",
    "password": "minhasenha123",
    "userType": "investor",
    "name": "Maria Investidora",
    "profile": {
      "investmentStrategy": "Conservador",
      "riskTolerance": "low",
      "totalInvested": 100000
    }
  }'
```

### 🔐 **2. Login**
```bash
POST /api/auth/login
```

**Exemplo:**
```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "fazendeiro@exemplo.com",
    "password": "minhasenha123",
    "userType": "producer"
  }'
```

### 👤 **3. Obter Perfil**
```bash
GET /api/auth/profile
Authorization: Bearer {JWT_TOKEN}
```

### 🏦 **4. Detalhes da Smart Account**
```bash
GET /api/auth/smart-account
Authorization: Bearer {JWT_TOKEN}
```

### 👥 **5. Listar Usuários por Tipo**
```bash
GET /api/auth/users/investor    # Lista investidores
GET /api/auth/users/producer    # Lista produtores
```

### 🧪 **6. Login de Teste Rápido**
```bash
GET /api/auth/test-login/investor    # Login: investor@agrofi.com
GET /api/auth/test-login/producer    # Login: producer@agrofi.com
# Senha: 123456
```

## 📊 **Diferenças entre Perfis**

### 💰 **Perfil do Investidor**
```json
{
  "userType": "investor",
  "profile": {
    "name": "Nome do Investidor",
    "investmentStrategy": "Conservador|Moderado|Agressivo",
    "riskTolerance": "low|medium|high",
    "totalInvested": 50000,
    "avatar": "url_opcional"
  }
}
```

### 🌱 **Perfil do Produtor**
```json
{
  "userType": "producer",
  "profile": {
    "name": "Nome do Produtor",
    "farmName": "Nome da Fazenda",
    "location": "Cidade, Estado",
    "cropTypes": ["soja", "milho", "algodão"],
    "farmSize": 500,
    "avatar": "url_opcional"
  }
}
```

## 🔐 **Estrutura do JWT Token**

```json
{
  "userId": "producer_1759588308140",
  "email": "fazendeiro@teste.com",
  "userType": "producer",
  "smartAccountAddress": "0xeb04f8f4154906a446037582cfdb647823DDcD5e",
  "iat": 1759588308,
  "exp": 1759674708
}
```

## 🏦 **Smart Account Details**

Cada usuário recebe:
- **Smart Account Address**: Endereço da conta inteligente
- **EOA Address**: Endereço da carteira externa
- **Private Key**: Chave privada (apenas desenvolvimento)
- **Balance**: Saldo atual em ETH
- **Network**: Base Sepolia

## 🧪 **Contas de Teste Pré-criadas**

### 💰 **Investidor de Teste**
- **Email**: `investor@agrofi.com`
- **Senha**: `123456`
- **Tipo**: `investor`
- **Nome**: João Silva

### 🌱 **Produtor de Teste**
- **Email**: `producer@agrofi.com`
- **Senha**: `123456`
- **Tipo**: `producer`
- **Nome**: Maria Santos

## 🔄 **Fluxo de Autenticação Completo**

### 1. **Registro**
```bash
# Criar conta nova
curl -X POST "http://localhost:3001/api/auth/register" ...
# Retorna: { user, smartAccount, token }
```

### 2. **Login**
```bash
# Fazer login
curl -X POST "http://localhost:3001/api/auth/login" ...
# Retorna: { user, smartAccount, token }
```

### 3. **Usar Token**
```bash
# Acessar recursos protegidos
curl -H "Authorization: Bearer {token}" "http://localhost:3001/api/auth/profile"
```

### 4. **Integração com Transações**
```bash
# Usar Smart Account para empréstimos
curl -X POST "http://localhost:3001/api/morpho-onchain/create-loan" \
  -d '{
    "userAddress": "{smartAccountAddress}",
    "userPrivateKey": "{privateKey}",
    ...
  }'
```

## 🎯 **Próximos Passos**

1. **✅ Sistema Funcionando**: Login diferenciado implementado
2. **🎨 Frontend**: Conectar com interface do marketplace
3. **🔗 Integração**: Usar tokens JWT nas transações Morpho
4. **📱 Wallet Connect**: Adicionar conexão com carteiras externas
5. **🛡 Segurança**: Implementar middleware de autorização avançado

## 💡 **Como Usar no Frontend**

```javascript
// 1. Login do usuário
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@email.com',
    password: 'senha123',
    userType: 'investor' // ou 'producer'
  })
});

const { data } = await loginResponse.json();
const { token, user, smartAccount } = data;

// 2. Salvar token no localStorage
localStorage.setItem('agrofi_token', token);
localStorage.setItem('agrofi_user', JSON.stringify(user));

// 3. Usar token em requisições
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// 4. Fazer transações com Smart Account
const loanResponse = await fetch('/api/morpho-onchain/create-loan', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    userAddress: smartAccount.smartAccountAddress,
    userPrivateKey: smartAccount.privateKey,
    collateralAmount: "1000",
    borrowAmount: "700"
  })
});
```

🚀 **O sistema está 100% funcional e pronto para integração com o frontend!**