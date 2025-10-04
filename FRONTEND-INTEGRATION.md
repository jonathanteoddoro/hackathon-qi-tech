# Integração Frontend com Sistema de Autenticação

## 🎯 Sistema Completo Implementado

O frontend do AgroFi foi totalmente integrado com o sistema de Account Abstraction do backend, criando um fluxo completo de autenticação e marketplace P2P para empréstimos agrícolas.

## 🚀 Funcionalidades Implementadas

### 1. Sistema de Autenticação
- **Página de Login/Registro** (`AuthPage.tsx`)
  - Formulário de login para usuários existentes
  - Formulário de registro com diferenciação entre investidor e produtor
  - Validação de tipos de usuário específicos
  - Integração com Smart Accounts automática

### 2. Diferenciação de Usuários

#### **Investidores**
- Perfil com tolerância ao risco (baixo, médio, alto)
- Interesses de investimento (soja, milho, algodão, café, cana)
- Prazos preferidos para investimentos
- Visão de marketplace para descobrir oportunidades
- Dashboard de portfólio

#### **Produtores Rurais**
- Dados da propriedade (nome da fazenda, localização)
- Tamanho da propriedade em hectares
- Tipos de culturas produzidas
- Aba exclusiva para solicitar empréstimos
- Dashboard de empréstimos ativos

### 3. Interface Responsiva
- **Header do usuário** com informações de perfil
- **Smart Account** address visível e formatado
- **Logout** com limpeza de token
- **Abas dinâmicas** baseadas no tipo de usuário

## 🔧 Arquitetura Técnica

### Componentes Principais

```
src/
├── components/
│   ├── AgroFiMarketplace.tsx    # Marketplace principal
│   ├── AuthPage.tsx             # Página de autenticação
│   └── UserHeader.tsx           # Header com dados do usuário
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticação global
├── services/
│   └── auth-api.ts              # Serviços de API para autenticação
└── App.tsx                      # Componente principal com roteamento
```

### Estado de Autenticação
- **AuthContext**: Gerencia estado global do usuário
- **JWT Token**: Armazenado no localStorage para persistência
- **Auto-reload**: Carrega perfil automaticamente ao iniciar
- **Proteção de rotas**: Mostra AuthPage se não autenticado

### Integração com Backend
- **Base URL**: `http://localhost:3001/api`
- **Endpoints utilizados**:
  - `POST /auth/register` - Registro de novos usuários
  - `POST /auth/login` - Login com email/senha
  - `GET /auth/profile` - Carrega dados do usuário
  - `GET /auth/smart-account` - Detalhes da Smart Account

## 📋 Como Usar

### 1. Registro de Novo Usuário

#### Para Investidores:
1. Acesse `http://localhost:5173`
2. Clique na aba "Cadastrar"
3. Selecione "Investidor"
4. Preencha dados pessoais (nome, email, senha)
5. Configure perfil de investimento:
   - Tolerância ao risco
   - Interesses (culturas)
   - Prazos preferidos
6. Clique "Criar conta"

#### Para Produtores:
1. Acesse `http://localhost:5173`
2. Clique na aba "Cadastrar"
3. Selecione "Produtor"
4. Preencha dados pessoais (nome, email, senha)
5. Configure dados da propriedade:
   - Nome da fazenda
   - Localização
   - Tamanho em hectares
   - Culturas produzidas
6. Clique "Criar conta"

### 2. Login de Usuário Existente
1. Acesse `http://localhost:5173`
2. Na aba "Entrar", digite email e senha
3. Clique "Entrar"

### 3. Usuários de Teste
O sistema já possui usuários pré-criados para teste:

#### Investidor:
- **Email**: `investidor@teste.com`
- **Senha**: `123456`
- **Smart Account**: Auto-gerada

#### Produtor:
- **Email**: `fazendeiro@teste.com`
- **Senha**: `123456`
- **Fazenda**: Fazenda Santa Clara
- **Localização**: Primavera do Leste, MT

## 🎨 Interface do Usuário

### Marketplace (Todos os usuários)
- Lista de solicitações de empréstimo disponíveis
- Informações detalhadas dos produtores
- Ratings de risco e reputação
- Progresso de financiamento
- Detalhes de garantias (CDAs)

### Dashboard
- **Investidores**: Portfólio de investimentos
- **Produtores**: Empréstimos ativos e histórico

### Solicitação de Empréstimo (Só produtores)
- Formulário para nova solicitação
- Campos para valor, prazo, garantias
- Documentos necessários listados
- Integração com Smart Contract (em desenvolvimento)

## 🔒 Segurança

### Autenticação
- **JWT Tokens** com expiração de 24 horas
- **bcrypt** para hash de senhas
- **Validação de tipos** TypeScript
- **Headers Authorization** Bearer token

### Smart Accounts
- **Account Abstraction** automática no registro
- **Endereços únicos** para cada usuário
- **Integração com Base Sepolia** testnet
- **Saldo consultável** via API

## 🚀 Próximos Passos

### Melhorias Pendentes
1. **Wallet Connect**: Integração com wallets externos
2. **Transações reais**: Conectar formulários com smart contracts
3. **Upload de documentos**: Sistema de arquivos para CDAs
4. **Notificações**: Sistema de alertas em tempo real
5. **KYC/KYB**: Verificação de identidade avançada

### Funcionalidades Avançadas
1. **Análise de risco**: Scoring automático
2. **Marketplace secundário**: Negociação de posições
3. **DeFi integrations**: Yield farming, staking
4. **Mobile app**: React Native
5. **Analytics**: Dashboard de métricas detalhadas

## 📊 Status de Desenvolvimento

✅ **Completo**: Sistema de autenticação completo  
✅ **Completo**: Interface diferenciada por tipo de usuário  
✅ **Completo**: Integração frontend-backend  
✅ **Completo**: Smart Account generation  
🔄 **Em desenvolvimento**: Transações blockchain reais  
⏳ **Planejado**: Wallet Connect integration  
⏳ **Planejado**: Sistema de arquivos  

## 🎉 Resultado Final

O sistema agora oferece uma experiência completa de marketplace P2P para empréstimos agrícolas, com:
- Autenticação segura e diferenciada
- Interface responsiva e intuitiva
- Integração blockchain com Account Abstraction
- Fluxo completo investidor ↔ produtor
- Base sólida para expansão DeFi

**Teste agora em**: `http://localhost:5173`