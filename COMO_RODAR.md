# 🚀 Guia de Execução - Backend + Frontend

## ⚡ Quick Start (Sem Docker)

### Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL instalado e rodando localmente
- Porta 3001 livre (backend)
- Porta 5173 livre (frontend)

---

## 1️⃣ Backend (NestJS)

### Passo 1: Configurar Banco de Dados

#### Opção A: PostgreSQL Local (Recomendado - Mais Rápido)

```bash
# Instalar PostgreSQL (se não tiver)
# Ubuntu/Debian:
sudo apt install postgresql postgresql-contrib

# Iniciar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar database e usuário
sudo -u postgres psql
```

No console do PostgreSQL:
```sql
CREATE DATABASE agrofi_db;
CREATE USER agrofi_user WITH PASSWORD 'agrofi_pass';
GRANT ALL PRIVILEGES ON DATABASE agrofi_db TO agrofi_user;
\q
```

#### Opção B: Apenas PostgreSQL no Docker

```bash
# Rodar apenas o PostgreSQL
docker run -d \
  --name agrofi-postgres \
  -e POSTGRES_DB=agrofi_db \
  -e POSTGRES_USER=agrofi_user \
  -e POSTGRES_PASSWORD=agrofi_pass \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -p 5432:5432 \
  postgres:15
```

---

### Passo 2: Configurar Backend

```bash
cd backend

# Copiar .env
cp .env.example .env

# Editar .env com suas credenciais
nano .env
```

**Conteúdo do `.env`:**
```bash
# Wallet do contrato deployado
MASTER_WALLET_ADDRESS=0x0c94fea9DfcD8826E33bbf2AdcF3A07412529C86
MASTER_WALLET_PRIVATE_KEY=920e20fb44f58eb7db3d27ab2bd61e67c1e573bcbe5337f83f93a95441474605

# RPC Sepolia (ou Base Sepolia)
RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# JWT para autenticação
JWT_SECRET=hackathon_qi_tech_secret_2025

# Database local
DATABASE_URL=postgresql://agrofi_user:agrofi_pass@localhost:5432/agrofi_db
```

---

### Passo 3: Instalar e Inicializar

```bash
# Instalar dependências
npm install

# Executar migrations (criar tabelas)
# O init.sql será executado automaticamente na primeira conexão
psql -U agrofi_user -d agrofi_db -f init.sql

# Iniciar backend em modo desenvolvimento
npm run start:dev
```

**Saída esperada:**
```
🚀 Backend rodando na porta 3001
📁 Uploads aceitos até 50MB para AFI tokens
```

---

### Passo 4: Testar Backend

```bash
# Em outro terminal, teste se está funcionando:
curl http://localhost:3001

# Ou abra no navegador:
# http://localhost:3001
```

---

## 2️⃣ Frontend (React + Vite)

### Passo 1: Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install
```

### Passo 2: Verificar Configuração

Verifique se o frontend está apontando para o backend correto:

```bash
# Verificar arquivos de serviço
grep -r "localhost:3001" src/services/ || \
grep -r "3001" src/services/
```

---

### Passo 3: Iniciar Frontend

```bash
# Modo desenvolvimento
npm run dev
```

**Saída esperada:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### Passo 4: Acessar Aplicação

Abra no navegador:
```
http://localhost:5173
```

---

## 🔥 Scripts Úteis

### Backend:
```bash
cd backend

# Desenvolvimento (com hot-reload)
npm run start:dev

# Produção
npm run build
npm run start:prod

# Testes
npm test

# Logs detalhados
npm run start:debug
```

### Frontend:
```bash
cd frontend

# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linter
npm run lint
```

---

## 🐛 Troubleshooting

### Backend não inicia:

**Erro: "Cannot connect to database"**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Ou se for Docker:
docker ps | grep postgres

# Testar conexão manual
psql -U agrofi_user -d agrofi_db -h localhost
```

**Erro: "Port 3001 is already in use"**
```bash
# Matar processo na porta 3001
lsof -ti:3001 | xargs kill -9

# Ou mudar porta no .env
PORT=3002
```

---

### Frontend não conecta ao backend:

**Erro: "Network Error" ou "CORS"**
```bash
# Verificar se backend está rodando:
curl http://localhost:3001

# Verificar CORS no backend (main.ts):
# Deve incluir: http://localhost:5173
```

**Erro: "Cannot find module"**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Verificação Completa

### 1. Backend Health Check:
```bash
curl http://localhost:3001/api/health
# ou
curl http://localhost:3001
```

### 2. Frontend Load:
```bash
# Deve abrir navegador e mostrar a aplicação
open http://localhost:5173
```

### 3. Database Connection:
```bash
# Testar conexão SQL
psql -U agrofi_user -d agrofi_db -c "\dt"
```

---

## 🎯 Estrutura de Portas

| Serviço | Porta | URL |
|---------|-------|-----|
| **Backend** | 3001 | http://localhost:3001 |
| **Frontend** | 5173 | http://localhost:5173 |
| **PostgreSQL** | 5432 | localhost:5432 |
| **PgAdmin** (opcional) | 5050 | http://localhost:5050 |

---

## 🔐 Credenciais

### Database:
- **Host:** localhost
- **Port:** 5432
- **Database:** agrofi_db
- **User:** agrofi_user
- **Password:** agrofi_pass

### Contrato (já deployado):
- **AgroFiToken:** `0xD5188F0A05719Ee91f25d02F6252461cBC216E61`
- **Network:** Sepolia Testnet
- **Owner:** `0x0c94fea9DfcD8826E33bbf2AdcF3A07412529C86`

---

## ✅ Checklist Rápido

- [ ] PostgreSQL instalado e rodando
- [ ] Database `agrofi_db` criada
- [ ] Backend `.env` configurado
- [ ] Backend rodando em `localhost:3001`
- [ ] Frontend rodando em `localhost:5173`
- [ ] Consegue acessar aplicação no navegador

---

## 🚨 Atalho Super Rápido

```bash
# Terminal 1 - Backend
cd backend && npm install && npm run start:dev

# Terminal 2 - Frontend  
cd frontend && npm install && npm run dev

# Pronto! Acesse: http://localhost:5173
```

---

**Aplicação rodando sem Docker! 🎉**
