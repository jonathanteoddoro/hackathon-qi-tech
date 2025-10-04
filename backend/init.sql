-- Criação das tabelas para o sistema de empréstimos agrícolas

-- Tabela de usuários (produtores e investidores)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('PRODUCER', 'INVESTOR')),
    location VARCHAR(255),
    wallet_address VARCHAR(42),
    cpf_cnpj VARCHAR(18),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de propostas
CREATE TABLE proposals (
    id VARCHAR(50) PRIMARY KEY,
    producer_id UUID REFERENCES users(id),
    producer_name VARCHAR(255) NOT NULL,
    producer_location VARCHAR(255),
    requested_amount DECIMAL(15,2) NOT NULL,
    funded_amount DECIMAL(15,2) DEFAULT 0,
    term INTEGER NOT NULL, -- meses
    max_interest_rate DECIMAL(5,2),
    soja_quantity INTEGER NOT NULL, -- sacas
    soja_price DECIMAL(10,2) NOT NULL, -- BRL por saca
    ltv DECIMAL(5,2) NOT NULL, -- loan-to-value ratio
    risk_score VARCHAR(1) CHECK (risk_score IN ('A', 'B', 'C')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FUNDED', 'ACTIVE', 'REPAID', 'LIQUIDATED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de investimentos
CREATE TABLE investments (
    id VARCHAR(50) PRIMARY KEY,
    proposal_id VARCHAR(50) REFERENCES proposals(id),
    investor_id UUID REFERENCES users(id),
    investor_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    expected_return DECIMAL(5,2) NOT NULL, -- % anual
    invested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de garantias tokenizadas
CREATE TABLE guarantees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id VARCHAR(50) REFERENCES proposals(id),
    producer_id UUID REFERENCES users(id),
    token_uri TEXT,
    token_id VARCHAR(100),
    token_type VARCHAR(20) DEFAULT 'ERC721',
    quantity INTEGER NOT NULL,
    unit VARCHAR(20) DEFAULT 'SACAS',
    storage_info JSONB, -- informações do armazém
    cda_wa_hash VARCHAR(128), -- hash do CDA/WA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cronogramas de repagamento
CREATE TABLE repayment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id VARCHAR(50) REFERENCES proposals(id) UNIQUE,
    total_amount DECIMAL(15,2) NOT NULL,
    principal DECIMAL(15,2) NOT NULL,
    interest DECIMAL(15,2) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de parcelas
CREATE TABLE repayment_installments (
    id VARCHAR(100) PRIMARY KEY,
    schedule_id UUID REFERENCES repayment_schedules(id),
    proposal_id VARCHAR(50) REFERENCES proposals(id),
    installment_number INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    principal DECIMAL(15,2) NOT NULL,
    interest DECIMAL(15,2) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    paid_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de transações de repagamento
CREATE TABLE repayment_transactions (
    id VARCHAR(50) PRIMARY KEY,
    proposal_id VARCHAR(50) REFERENCES proposals(id),
    amount DECIMAL(15,2) NOT NULL,
    method VARCHAR(20) CHECK (method IN ('PIX', 'BANK_TRANSFER', 'CRYPTO')),
    tx_hash VARCHAR(128),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de alertas de risco
CREATE TABLE risk_alerts (
    id VARCHAR(50) PRIMARY KEY,
    proposal_id VARCHAR(50) REFERENCES proposals(id),
    alert_type VARCHAR(30) CHECK (alert_type IN ('LTV_HIGH', 'PRICE_DROP', 'LIQUIDATION_WARNING')),
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Tabela de preços históricos da soja
CREATE TABLE soja_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price DECIMAL(10,2) NOT NULL, -- BRL por saca
    source VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_producer ON proposals(producer_name);
CREATE INDEX idx_investments_investor ON investments(investor_name);
CREATE INDEX idx_investments_proposal ON investments(proposal_id);
CREATE INDEX idx_installments_status ON repayment_installments(status);
CREATE INDEX idx_installments_due_date ON repayment_installments(due_date);
CREATE INDEX idx_alerts_resolved ON risk_alerts(resolved);
CREATE INDEX idx_soja_prices_timestamp ON soja_prices(timestamp);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guarantees_updated_at BEFORE UPDATE ON guarantees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns dados de exemplo
INSERT INTO users (name, email, user_type, location, cpf_cnpj) VALUES
('João Silva', 'joao.silva@email.com', 'PRODUCER', 'Sorriso, MT', '123.456.789-00'),
('Maria Santos', 'maria.santos@email.com', 'PRODUCER', 'Campos de Júlio, MT', '987.654.321-00'),
('Marina Oliveira', 'marina.oliveira@email.com', 'INVESTOR', 'Campinas, SP', '456.789.123-00'),
('Pedro Costa', 'pedro.costa@email.com', 'INVESTOR', 'São Paulo, SP', '789.123.456-00');

-- Inserir preço inicial da soja
INSERT INTO soja_prices (price, source) VALUES (180.00, 'CBOT_MOCK');