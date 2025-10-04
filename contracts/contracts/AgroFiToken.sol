// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AgroFi Investment Token (AFI)
 * @dev Token ERC-20 que representa investimentos no marketplace AgroFi
 * 
 * Funcionalidades:
 * - 1 Real fictício = 1 Token AFI real na blockchain
 * - Mint quando usuário investe
 * - Burn quando usuário resgata
 * - Transferível entre carteiras
 * - Pausável para emergências
 */
contract AgroFiToken is ERC20, Ownable, Pausable {
    
    // ========== EVENTOS ==========
    event TokensMintedFromReais(address indexed to, uint256 realAmount, uint256 tokenAmount);
    event TokensBurnedForRedemption(address indexed from, uint256 tokenAmount, uint256 realAmount);
    event InvestmentRecorded(address indexed investor, string loanId, uint256 realAmount, uint256 tokenAmount);
    
    // ========== ESTRUTURAS ==========
    struct Investment {
        string loanId;
        uint256 realAmount;      // Valor em reais fictícios
        uint256 tokenAmount;     // Tokens AFI criados
        uint256 timestamp;
        bool redeemed;
    }
    
    // ========== ESTADO ==========
    mapping(address => Investment[]) public userInvestments;
    mapping(string => uint256) public loanTotalFunding;
    mapping(string => address[]) public loanInvestors;
    
    uint256 public constant REAL_TO_TOKEN_RATE = 1e18; // 1 real = 1 token (18 decimals)
    uint256 public totalReaisInvested;
    
    // ========== CONSTRUCTOR ==========
    constructor() ERC20("AgroFi Investment Token", "AFI") {
        // Owner será o backend (master wallet)
    }
    
    // ========== FUNÇÕES PRINCIPAIS ==========
    
    /**
     * @dev Cria tokens AFI baseado em valor fictício em reais
     * @param to Endereço do investidor
     * @param realAmount Valor em reais fictícios (ex: 1000 = R$ 1.000)
     * @param loanId ID do empréstimo
     */
    function mintFromReais(
        address to, 
        uint256 realAmount, 
        string memory loanId
    ) external onlyOwner whenNotPaused {
        require(to != address(0), "AFI: Endereco invalido");
        require(realAmount > 0, "AFI: Valor deve ser maior que zero");
        require(bytes(loanId).length > 0, "AFI: LoanId nao pode ser vazio");
        
        // Calcula tokens a serem criados (1:1 ratio)
        uint256 tokenAmount = realAmount * REAL_TO_TOKEN_RATE;
        
        // Cria os tokens
        _mint(to, tokenAmount);
        
        // Registra o investimento
        userInvestments[to].push(Investment({
            loanId: loanId,
            realAmount: realAmount,
            tokenAmount: tokenAmount,
            timestamp: block.timestamp,
            redeemed: false
        }));
        
        // Atualiza dados do empréstimo
        loanTotalFunding[loanId] += realAmount;
        if (!_isInvestorInLoan(to, loanId)) {
            loanInvestors[loanId].push(to);
        }
        
        // Atualiza total geral
        totalReaisInvested += realAmount;
        
        emit TokensMintedFromReais(to, realAmount, tokenAmount);
        emit InvestmentRecorded(to, loanId, realAmount, tokenAmount);
    }
    
    /**
     * @dev Queima tokens para resgate (quando empréstimo é pago)
     * @param from Endereço do investidor
     * @param tokenAmount Quantidade de tokens a queimar
     */
    function burnForRedemption(
        address from, 
        uint256 tokenAmount
    ) external onlyOwner whenNotPaused {
        require(from != address(0), "AFI: Endereco invalido");
        require(tokenAmount > 0, "AFI: Quantidade deve ser maior que zero");
        require(balanceOf(from) >= tokenAmount, "AFI: Saldo insuficiente");
        
        // Calcula valor em reais
        uint256 realAmount = tokenAmount / REAL_TO_TOKEN_RATE;
        
        // Queima os tokens
        _burn(from, tokenAmount);
        
        emit TokensBurnedForRedemption(from, tokenAmount, realAmount);
    }
    
    // ========== FUNÇÕES DE CONSULTA ==========
    
    /**
     * @dev Retorna investimentos de um usuário
     */
    function getUserInvestments(address user) external view returns (Investment[] memory) {
        return userInvestments[user];
    }
    
    /**
     * @dev Retorna total investido em um empréstimo
     */
    function getLoanTotalFunding(string memory loanId) external view returns (uint256) {
        return loanTotalFunding[loanId];
    }
    
    /**
     * @dev Retorna investidores de um empréstimo
     */
    function getLoanInvestors(string memory loanId) external view returns (address[] memory) {
        return loanInvestors[loanId];
    }
    
    /**
     * @dev Converte reais para tokens
     */
    function reaisToTokens(uint256 realAmount) external pure returns (uint256) {
        return realAmount * REAL_TO_TOKEN_RATE;
    }
    
    /**
     * @dev Converte tokens para reais
     */
    function tokensToReais(uint256 tokenAmount) external pure returns (uint256) {
        return tokenAmount / REAL_TO_TOKEN_RATE;
    }
    
    // ========== FUNÇÕES ADMINISTRATIVAS ==========
    
    /**
     * @dev Pausa o contrato em emergências
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Despausa o contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ========== FUNÇÕES INTERNAS ==========
    
    /**
     * @dev Verifica se usuário já investiu no empréstimo
     */
    function _isInvestorInLoan(address investor, string memory loanId) internal view returns (bool) {
        address[] memory investors = loanInvestors[loanId];
        for (uint i = 0; i < investors.length; i++) {
            if (investors[i] == investor) {
                return true;
            }
        }
        return false;
    }
    
    // ========== OVERRIDE FUNÇÕES ERC20 ==========
    
    /**
     * @dev Override transfer para adicionar pausa
     */
    function transfer(address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom para adicionar pausa
     */
    function transferFrom(address from, address to, uint256 amount) public virtual override whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
}