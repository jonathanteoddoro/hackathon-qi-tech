# Hackathon

## QI Tech + Polí Junior

## Jonathan Teodoro

## Yanomã Fernandes


**Sumário**

3 - Contextualização

4 - Personas

6 - Proposta

7 - Escopo MVP

8 - Fluxos Operacionais

10 - Stack Tecnológico

11 - Diagrama de Arquitetura

12 - Plano de Execução

16 - Prótipo


**Contextualização**
O agronegócio brasileiro é um dos pilares da economia nacional, representando 24,8% do PIB em 2023 e
movimentando aproximadamente R$ 364,8 bilhões em crédito rural na safra 2023/2024. Apesar desses
números expressivos, pequenos e médios produtores rurais - que representam 77% dos
estabelecimentos agropecuários segundo o Censo Agropecuário 2017 do IBGE - enfrentam barreiras
significativas no acesso ao crédito.
As taxas de juros praticadas pelo sistema bancário tradicional para crédito rural livre (não subsidiado)
variam entre 12% e 18% ao ano, segundo dados do Banco Central. Além disso, o processo de concessão
é marcado por exigências burocráticas extensas, incluindo garantias reais, seguros obrigatórios e
análises que podem levar de 45 a 90 dias para aprovação. Essa complexidade cria um gargalo que limita
a capacidade de expansão dos pequenos produtores, especialmente considerando o descasamento
temporal entre investimentos no plantio e receitas da comercialização, que pode durar 6 a 12 meses
dependendo da cultura.

**A Oportunidade Tecnológica e de Mercado**
Paralelamente, o mercado brasileiro tem testemunhado transformações significativas. O número de
investidores pessoa física na B3 ultrapassou 5 milhões em 2023, e uma parcela crescente busca
diversificação além da renda fixa tradicional. Plataformas de empréstimos peer-to-peer (P2P) têm
ganhado tração globalmente - o mercado global de P2P lending foi avaliado em US$ 85,4 bilhões em
2022 e deve crescer a uma taxa anual composta de 24,9% até 2030, segundo a Grand View Research.
A convergência de tecnologias blockchain, contratos inteligentes e inteligência artificial cria uma
oportunidade única para redesenhar o acesso ao crédito agrícola. Blockchain oferece transparência e
imutabilidade de registros, reduzindo custos de intermediação e aumentando confiança. Smart
contracts automatizam execução de acordos financeiros sem intermediários, reduzindo custos
operacionais em até 30-40% segundo estudos do World Economic Forum. Machine learning permite
análise de risco mais sofisticada e validação automatizada de documentos, acelerando processos que
tradicionalmente levavam semanas.


**Dificuldades:**
João vive o desafio de levantar capital de forma rápida, sem enfrentar custos
imprevisíveis ou burocracias intermináveis. Para isso, precisa que seus documentos e
recibos de armazenagem sejam facilmente aceitos como garantia, mas nem sempre
encontra essa clareza no processo. Enquanto isso, a volatilidade no preço da soja
atrapalha ainda mais: ao longo do ciclo produtivo, o valor de sua garantia cai e o LTV
diminui, deixando-o em uma posição frágil. Mesmo quando decide transformar a soja
em liquidez, esbarra na logística complicada e no tempo necessário para que a
garantia física se converta em dinheiro — seja por meio de leilões ou retiradas.

**Objetivos**
Financiar insumos para a safra com menor custo.
Receber BRL em tempo hábil.
Manter controle sobre a produção.
**Valores**
Previsibilidade financeira
Simplicidade operacional
Transparência nas taxas de empréstimo
**Interesses**
Melhorar produtividade
Otimizar logística de armazenagem
Construir reputação para obter melhores condições de crédito

Personas
Personas são uma representação semifictícia de um grupo de usuários, clientes ou
públicos-alvo construída a partir da coleta e análise de dados qualitativos e
quantitativos. As personas sintetizam características sociodemográficas,
comportamentais, necessidades, objetivos, expectativas e dificuldades comuns a um
determinado segmento, funcionando como arquétipos que orientam processos de
design, marketing, comunicação e desenvolvimento de produtos ou serviços.

```
Nome: João Pereira
Idade: 42
Gênero: Masculino
Localização: Sorriso, MT
```

**Dificuldades:**
Marina está sempre em busca de oportunidades que tragam rentabilidade real e
ajudem a diversificar sua carteira, mas esse caminho raramente é simples. Quando
tenta comparar alternativas de investimento, se perde em custos pouco claros, prazos
de liquidação incertos e contrapartes que nem sempre inspiram confiança. Ao mesmo
tempo, sente falta de transparência e de informações organizadas que mostrem com
clareza o que está em jogo, permitindo avaliar riscos e retornos de forma segura. Sem
esses elementos, cada decisão consome um tempo precioso, exige esforço adicional e
deixa Marina insegura sobre a melhor forma de entrar ou sair de uma posição.
**Objetivos**
Diversificar a carteira com crédito agrícola de baixo custo operacional.
Obter retornos superiores à renda fixa.
Monitorar risco por coorte.
**Valores**
Transparência
Dados verificáveis
Controle sobre exposição e liquidez
**Interesses**
Monitoramento de risco (LTV, PD)
Informação detalhada sobre o ativo (commodity, histórico)
Comparação de taxas e oportunidades de mercado
Segurança e auditabilidade das aplicações

```
Nome: Marina Oliveira
Idade: 35
Gênero: Feminino
Localização: Campinas, SP
```

**A Proposta: Democratização via Tecnologia**

O projeto propõe um marketplace P2P que conecta produtores rurais diretamente a
investidores, utilizando tecnologia blockchain de forma completamente invisível ao
usuário. A solução aborda pontos críticos do sistema tradicional:

```
Redução de custos: Eliminação de intermediários bancários pode reduzir taxas em
30-50%, beneficiando tanto produtores (juros menores) quanto investidores
(retornos maiores).
Acesso simplificado: Account Abstraction (ERC-4337) permite que usuários
operem com login social (email/Google), sem necessidade de gerenciar carteiras
ou chaves privadas - removendo a principal barreira de adoção de soluções
blockchain.
Transparência e segurança: Tokenização de garantias (certificados de depósito
agrícola) via NFTs e monitoramento contínuo de preços via oráculos
descentralizados (Chainlink) oferecem visibilidade em tempo real do health factor
dos empréstimos.
Automação inteligente: ML valida documentos automaticamente, reduzindo
tempo de aprovação de dias para minutos. Smart contracts executam liquidações
automaticamente quando necessário, protegendo investidores.
Inclusão financeira: Pequenos investidores podem participar do agronegócio com
tickets mínimos acessíveis, enquanto pequenos produtores acessam capital sem
as barreiras do sistema bancário tradicional.
```
O MVP focado em soja no Mato Grosso (responsável por 32% da produção nacional de
soja segundo a Conab) permite validação técnica e de mercado em um ambiente
controlado, com infraestrutura de armazenagem estabelecida e commodity de alta
liquidez. A escolha de USDC como stablecoin - que possui mais de US$ 25 bilhões em
circulação e opera na rede Base (L2 da Coinbase) - garante liquidez e custos de
transação baixos (menos de US$ 0,01 por transação).
Essa abordagem representa uma convergência entre DeFi (finanças
descentralizadas), AgTech e tradicionais princípios de marketplace, potencialmente
desbloqueando bilhões em crédito para o setor agrícola brasileiro enquanto oferece
nova classe de ativos para investidores.


**Escopo do MVP**

Para validar a viabilidade técnica e de mercado, o MVP opera com:

- **1 commodity** : Soja (maior liquidez e padronização no mercado)
- **1 região** : Mato Grosso (infraestrutura de armazéns estabelecida)
- **Volume controlado** : Máximo 10 empréstimos simultâneos

Na solução proposta, os produtores rurais podem tokenizar sua produção futura,
utilizando recibos de armazenagem digitalizados. Esses ativos funcionam como
garantias dentro do protocolo, permitindo que empréstimos sejam concedidos de
forma mais ágil e com custos reduzidos.

Do outro lado, investidores acessam uma oportunidade de aplicação atrelada ao
agronegócio, com métricas claras de risco e retorno. A plataforma oferece indicadores
como Loan-to-Value (LTV) baseado em oráculos de preço da soja, além de
informações sobre histórico e reputação do produtor.

O resultado é um sistema em que o crédito deixa de depender de instituições
financeiras tradicionais e passa a operar em um modelo peer-to-peer, sustentado por
contratos inteligentes auditáveis que funcionam de forma transparente nos
bastidores. Essa abordagem aumenta a previsibilidade para o produtor, gera novas
oportunidades de investimento e promove maior inclusão financeira no campo.


**Fluxos Operacionais**

A plataforma contempla três fluxos principais: solicitação de empréstimo pelo produtor, fornecimento
de capital pelo investidor e liquidação/repagamento dos empréstimos. Cada fluxo abstrai a
complexidade blockchain, oferecendo experiência intuitiva equivalente a aplicações web tradicionais.

**1. Fluxo do Produtor: Solicitação de Empréstimo**
O produtor inicia o processo com cadastro simplificado. Ele acessa a plataforma via web/mobile e faz
login com email/telefone ou Google/Apple ID. No primeiro acesso, uma smart contract wallet é criada
automaticamente nos bastidores via Account Abstraction - o produtor não percebe isso e não precisa
gerenciar chaves ou extensões.

Ele preenche um formulário com documentos básicos: CPF, CNH, comprovante de propriedade rural.
Sistema de ML valida automaticamente os documentos via OCR e computer vision, verificando
autenticidade e extraindo dados. O processo leva minutos, não dias. Um perfil de risco inicial é
calculado baseado nos dados fornecidos.

Em seguida, a produção é tokenizada de forma transparente. O produtor deposita a soja em um dos
armazéns parceiros integrados no Mato Grosso. O armazém emite CDA/WA digital e notifica a
plataforma via API. O sistema:
Valida automaticamente a assinatura digital e certificação do armazém
Cria NFT de colateral nos bastidores (apresentado ao usuário como "Certificado Digital de
Garantia")
Disponibiliza visualização dos metadados em linguagem simples: "Você tem 1.000 sacas de soja
depositadas no Armazém XYZ, avaliadas em R$ XXX"

O produtor então cria a proposta de empréstimo com interface intuitiva, definindo:
Valor desejado (apresentado sempre em BRL, conversão USDC é transparente)
Prazo (3-6 meses)
Taxa máxima aceitável (ou aceita sugestão do sistema)

O sistema calcula e exibe automaticamente:
LTV baseado no preço da soja (explicado como "% do valor da garantia")
Classificação de risco (A, B, C com explicação visual)
Taxa de juros sugerida baseada no perfil
Simulações: quanto vai pagar no total, parcelas, etc

Quando investidores fornecem liquidez suficiente (fundado 100%), o produtor é notificado. O dinheiro é
depositado via Pix diretamente na conta bancária dele em minutos - toda a conversão USDC e
transações blockchain acontecem automaticamente nos bastidores.

**2. Fluxo do Investidor: Fornecimento de Capital**
O investidor realiza onboarding similar: login via email/telefone, smart contract wallet criada
automaticamente, KYC simplificado com validação ML de documentos.
Para adicionar capital, duas opções simples:
    Pix direto: Investidor transfere via Pix, sistema converte para USDC automaticamente e credita
    na conta dele (apresentado sempre em BRL)
    Crypto direto: Para investidores avançados, possibilidade de depositar USDC de outras wallets
O investidor navega pelas oportunidades com filtros intuitivos:
    Ordenar por: maior retorno, menor risco, prazo
    Filtrar por: classificação de risco (A/B/C), retorno anual, prazo
    Visualizar detalhes de cada empréstimo.


O investidor seleciona quanto quer investir e confirma. Transação blockchain acontece nos bastidores -
investidor só vê "Investimento confirmado" e seu saldo sendo atualizado instantaneamente.
Dashboard mostra:
Investimentos ativos
Juros acumulados (atualizados diariamente, não por bloco)
Status de cada empréstimo
Alertas em linguagem simples: "Atenção: Preço da soja caiu, margem de segurança reduzida
para 30%"

**3. Fluxo de Repagamento e Liquidação**
No cenário positivo de repagamento, o produtor:
    Acessa dashboard e vê valor total devido (principal + juros)
    Clica em "Pagar via Pix"
    Faz transferência Pix para conta da plataforma
    Sistema converte para USDC automaticamente e executa repagamento via smart contract
    Investidores recebem via Pix automaticamente na conta cadastrada ou saldo fica disponível
    para reinvestir

Todo o fluxo blockchain (distribuição proporcional aos investidores, burn do NFT, atualização de
contratos) acontece de forma transparente. O produtor vê: "Empréstimo quitado ✓" e pode retirar a
soja do armazém.
No cenário de inadimplência/liquidação:
Monitoramento e alertas em linguagem simples:
Sistema monitora "Margem de Segurança" (health factor) continuamente
Alertas progressivos:
"Atenção: Margem caiu para 20%, considere adicionar mais garantia"
"Urgente: Você tem 48h para regularizar ou a garantia será vendida"
Liquidação automatizada (nos bastidores):
Se margem chega a zero, smart contract aciona liquidação automaticamente
Sistema busca compradores para a garantia (via leilão on-chain)
Para o investidor: Notificação simples "Empréstimo liquidado, você recebeu R$ XXX via Pix
(perda de Y%)"
Para o produtor: "Sua garantia foi vendida para cobrir a dívida"
Limites e Salvaguardas:
Circuit breaker automático se muitas liquidações simultâneas
Multi-sig para emergências (apresentado como "Comitê de Segurança")
Fundo de reserva para cobrir gaps
Esses fluxos abstraem completamente a complexidade blockchain, oferecendo experiência
equivalente a fintechs como Nubank ou PicPay, enquanto mantêm todos os benefícios de
transparência, auditabilidade e descentralização nos bastidores.


**Stack Tecnológico**

A plataforma é organizada em camadas bem definidas, cada uma responsável por uma função crítica no
ecossistema de crédito agrícola.

**Camada Blockchain** : A infraestrutura base utiliza Base (L2 da Coinbase), permitindo transações
rápidas e econômicas, com boa liquidez USDC e suporte robusto. Essa camada opera de forma
transparente, com usuários nunca precisando interagir diretamente com a blockchain.

**Protocolo de Empréstimo:** No núcleo da plataforma, o Morpho Blue gerencia 1-2 mercados de
empréstimos isolados para soja, com regras de LTV e taxas específicas, otimizando segurança e
eficiência.

**Stablecoin:** Para liquidez e estabilidade financeira, a plataforma opera exclusivamente com USDC no
MVP, porém apresentado ao usuário sempre em valores BRL equivalentes para familiaridade.

**Oráculos:** A precificação das garantias é feita por Chainlink, que fornece preços da soja atualizados.
Como fallback, admins podem atualizar preços manualmente via multi-sig em casos emergenciais.

**Colateral:** NFTs ERC-721 simplificados representam lotes de soja depositados em armazéns
certificados, contendo metadados essenciais (quantidade, localização, data de depósito, hash do
certificado CDA/WA). Para o usuário, isso é apresentado como "Certificado Digital de Garantia".

**Frontend:** A interface do usuário é construída em Next.js com TypeScript, oferecendo experiência web
tradicional sem referências explícitas a blockchain. Sistema exibe dashboards intuitivos: propostas de
empréstimo, investimentos disponíveis, monitoramento de posições e indicadores de risco em
linguagem acessível.

**Account Abstraction (ERC-4337):** Cada usuário recebe uma smart contract wallet criada
automaticamente no primeiro acesso, sem necessidade de instalar extensões ou gerenciar chaves
privadas. Essa abordagem possibilita a abstração da blockchain, possibilitando que o usuário utilize a
plataforma sem saber de sua utilização.

**Backend e Infraestrutura:** Um backend em Node.js + Express gerencia lógica off-chain, autenticação
de usuários, validação automatizada de documentos, scoring e histórico de transações, com dados
armazenados em PostgreSQL.

**Validação Automatizada & ML:**
OCR + Computer Vision: Extração automática de dados de documentos (CPF, CNH, CDA/WA)
Validação de documentos: Modelos ML verificam autenticidade de certificados e assinaturas
Scoring básico: Análise de histórico de transações na plataforma e dados fornecidos
Anti-fraude: Detecção de padrões suspeitos e documentos alterados

**Conversão Fiat-Crypto:** Integração com on/off-ramp partners (MoonPay, Ramp Network, Transak)
permite que usuários depositem/retirem via Pix sem interagir diretamente com crypto. O fluxo é: Pix →
USDC (invisível) → Empréstimo, e na volta: Repagamento → USDC (invisível) → Pix.


**Diagrama de Arquitetura**

O diagrama ilustra a arquitetura em camadas do marketplace P2P de crédito agrícola. No topo,
produtores e investidores interagem com uma interface Next.js tradicional, que utiliza Account
Abstraction para criar wallets automáticas sem complexidade técnica. O Backend API atua como
orquestrador central, validando documentos via ML, convertendo Pix em USDC através do Fiat
Gateway, tokenizando colaterais em NFTs e executando empréstimos via protocolo Morpho Blue. A
camada blockchain opera de forma invisível: NFTs representam garantias (soja armazenada), o Morpho
gerencia os empréstimos com parâmetros de LTV atualizados por oráculos Chainlink, e toda a
infraestrutura (IPFS para metadados, Ramp para conversões fiat, APIs de armazéns certificados)
sustenta as operações sem que o usuário final precise entender ou interagir diretamente com
blockchain. O fluxo vertical mostra como a complexidade é progressivamente abstraída em cada
camada.


**Plano de Execução**

**1.** Modelagem de Dados
A modelagem de dados off-chain suporta o frontend, backend e as operações de abstração da
blockchain. As entidades principais são Produtores, Investidores, Propostas de Empréstimo,
Empréstimos, Garantias (NFTs), Transações Fiat-Crypto e Pontuações de Risco.

erDiagram
PRODUTORES {
UUID produtor_id PK
VARCHAR nome
VARCHAR cpf_cnpj
VARCHAR endereco_wallet
VARCHAR regiao
TIMESTAMP criado_em
TIMESTAMP atualizado_em
}
INVESTIDORES {
UUID investidor_id PK
VARCHAR nome
VARCHAR email
VARCHAR endereco_wallet
TIMESTAMP criado_em
TIMESTAMP atualizado_em
}
PROPOSTAS {
UUID proposta_id PK
UUID produtor_id FK
DECIMAL valor_solicitado
VARCHAR moeda
DATE data_vencimento
VARCHAR commodity
VARCHAR status
TEXT termos_ipfs_hash
TIMESTAMP criado_em
TIMESTAMP atualizado_em
}
EMPRESTIMOS {
UUID emprestimo_id PK
UUID proposta_id FK
UUID investidor_id FK
DECIMAL valor_financiado
DECIMAL valor_outstanding
VARCHAR status
TIMESTAMP financiado_em
TIMESTAMP atualizado_em
}

12


### GARANTIAS_TOKEN {

UUID garantia_id PK
UUID proposta_id FK
UUID produtor_id FK
VARCHAR token_uri
VARCHAR tipo_token
DECIMAL quantidade
VARCHAR unidade
VARCHAR informacao_armazenagem
TIMESTAMP criado_em
TIMESTAMP atualizado_em
}
REEMBOLSOS {
UUID reembolso_id PK
UUID emprestimo_id FK
DECIMAL valor
TIMESTAMP pago_em
VARCHAR metodo
VARCHAR tx_hash
}
PONTUACOES {
UUID pontuacao_id PK
UUID produtor_id FK
INT valor_pontuacao
DECIMAL pd
VARCHAR versao_modelo
TEXT snapshot_features_ipfs
TIMESTAMP calculado_em
}
TRANSACOES {
UUID transacao_id PK
UUID emprestimo_id FK
VARCHAR from_wallet
VARCHAR to_wallet
DECIMAL valor
VARCHAR moeda
VARCHAR status
VARCHAR tipo
TIMESTAMP criado_em
}


2. Design de API (Backend Node.js + Express)
A API RESTful servirá como o principal ponto de comunicação entre o frontend, serviços internos (ML,
oráculos) e a camada blockchain.

3.1 Endpoints Chave

**Auth**
POST /auth/login: Login de usuário (email/password, social login).
POST /auth/register: Registro de novo usuário (cria Smart Contract Wallet automaticamente).
POST /auth/recover: Recuperação de conta (social recovery).
POST /auth/refresh-token: Atualiza JWT.

**Usuários (Produtores/Investidores)**
GET /users/me: Retorna perfil do usuário logado.
PUT /users/me: Atualiza informações do perfil (ex: dados KYC).
POST /users/kyc/submit: Envia documentos para validação KYC.
GET /users/wallet: Retorna endereço da SC Wallet e saldo USDC (convertido para BRL).

**Propostas de Empréstimo (Produtor)**
POST /proposals: Cria uma nova proposta de empréstimo.
Body: { valor_solicitado_brl, prazo_meses, taxa_juros_max_anual, garantia_id }
Ações Backend: Valida entrada, calcula LTV inicial, interage com oráculo, salva em PROPOSTAS.
GET /proposals/me: Lista propostas do produtor logado.
GET /proposals/:id: Detalhes de uma proposta.
PUT /proposals/:id/cancel: Cancela uma proposta (se não estiver fundado).

**Oportunidades de Investimento (Investidor)**
GET /investments/opportunities: Lista propostas disponíveis para investimento.
Query Params: status=PENDENTE_FUNDING, min_taxa_juros, max_risco, etc.
Response: Dados enriquecidos com LTV, classificação de risco, etc.
GET /investments/opportunities/:id: Detalhes de uma oportunidade.
POST /investments/:proposalId/fund: Investe em uma proposta.
Body: { valor_investido_brl }
Ações Backend: Converte BRL para USDC, interage com SC Wallet para enviar USDC para o
mercado Morpho Blue via batch operations (se necessário), atualiza EMPRESTIMOS e
TRANSACOES.

**Garantias (Tokenização)**
POST /guarantees/tokenize: Inicia processo de tokenização de soja.
Body: { hash_cda_wa, quantidade_sacos, local_armazem, data_deposito }
Ações Backend: Valida CDA/WA via ML, cria NFT ERC-721 na blockchain via SC Wallet do produtor
(meta-transação), registra em GARANTIAS_TOKEN.
GET /guarantees/me: Lista garantias do produtor logado.


**Empréstimos**
GET /loans/me: Lista empréstimos do usuário (produtor ou investidor).
GET /loans/:id: Detalhes de um empréstimo (incluindo health factor, status).
POST /loans/:id/repay: Inicia processo de repagamento.
Body: { valor_brl_pago }
Ações Backend: Processa Pix (via on/off-ramp), converte para USDC, interage com SC Wallet
para executar repagamento no Morpho Blue, registra em REEMBOLSOS.

**Transações (Fiat-Crypto)**
POST /transactions/deposit/pix: Inicia depósito via Pix.
Body: { valor_brl }
Ações Backend: Gera QR Code/código Pix via parceiro on-ramp, monitora pagamento, credita
USDC na SC Wallet do usuário, registra em TRANSACOES.
POST /transactions/withdraw/pix: Inicia retirada via Pix.
Body: { valor_brl, conta_bancaria }
Ações Backend: Debita USDC da SC Wallet do usuário, envia para parceiro off-ramp, inicia
transferência Pix, registra em TRANSACOES.
GET /transactions/history: Histórico de transações do usuário.

3. Smart Contracts e Interação Blockchain

3 .1 Contratos Chave

**Smart Contract Wallets (ERC-4337 - Account Abstraction):**
Cada usuário terá uma ERC-4337 Wallet (ex: Safe ou Pimlico/Biconomy SDKs).
Recursos: Social login, gasless transactions (pagas pelo backend via paymaster)
Gateway: O backend atuará como o bundler e paymaster para as user operations.
**Contrato ERC-721 para Garantias (Tokenização da Soja):**
Um contrato único para representar todos os lotes de soja tokenizados.
mint(to, metadataURI): Cria um novo NFT. metadataURI aponta para um JSON no IPFS contendo
dados do CDA/WA.
burn(tokenId): Queima o NFT quando a garantia é liberada ou liquidada.
transferFrom(from, to, tokenId): Possibilita a transferência (ex: para o liquidador em caso de
inadimplência).
**Morpho Blue (Protocolo de Empréstimo):**
Utilizará Morpho Blue para os mercados de empréstimo.
Mercados Isolados: Para o MVP, um mercado isolado para SOJA.
supply(asset, amount): Investidores fornecem USDC para o mercado.
borrow(asset, amount, collateral, collateralAmount): Produtor solicita empréstimo usando NFT
de soja como colateral.
repay(asset, amount): Produtor repaga o empréstimo.
liquidate(borrower, market, amount, liquidator): Liquidação de empréstimo inadimplente
(automatizado pelo backend).


**Protótipo**

Tela de acesso
Com o objetivo de garantir segurança aos usuários, desenvolvemos esta primeira tela de
cadastro. Nela, o usuário deve se identificar como investidor ou agricultor, já que cada perfil
terá um fluxo específico após o acesso. Dessa forma, foi criada a seguinte página:

Dashboard investidor
Com a finalidade de apresentar os dados referentes à carteira do investidor, como saldo,
investimentos, retornos, riscos e detalhes de cada aplicação, foi criada a seguinte tela:


Produtos de investimento
Com o intuito de apresentar as oportunidades de investimento aos investidores, foi criada
uma tela que reúne todas as propostas de empréstimo, juntamente com informações sobre
riscos, retornos e prazos. Dessa forma, foi desenvolvida a seguinte tela:

Dashboard Agricultor
Com a finalidade de apresentar os dados referentes à carteira do agricultor, como o total
financiado, propostas ativas, score e o andamento de suas solicitações, foi criada a seguinte
tela:


Criação de proposta
Com o objetivo de oferecer um fluxo simples e ágil para a criação de uma proposta de crédito
(solicitação de financiamento), foram desenvolvidas três telas que representam, de forma
sequencial, os passos necessários para esse processo. Sendo assim, foram criadas as
seguintes telas:

Passo 1

Passo 2


- Passo


