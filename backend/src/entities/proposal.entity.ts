export interface Proposal {
  id: string;
  producerName: string;
  producerLocation: string;
  requestedAmount: number; // em BRL
  term: number; // meses
  maxInterestRate: number; // % anual
  sojaQuantity: number; // sacas
  sojaPrice: number; // preço por saca em BRL
  ltv: number; // loan-to-value ratio
  riskScore: 'A' | 'B' | 'C';
  status: 'PENDING' | 'FUNDED' | 'ACTIVE' | 'REPAID' | 'LIQUIDATED';
  createdAt: Date;
  fundedAmount: number; // quanto já foi financiado
  investments: Investment[];
}

export interface Investment {
  id: string;
  investorName: string;
  proposalId: string;
  amount: number; // em BRL
  expectedReturn: number; // % anual
  investedAt: Date;
}

export interface SojaPrice {
  price: number; // BRL por saca
  timestamp: Date;
  source: string;
}