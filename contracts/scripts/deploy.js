const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy do AgroFi Token...");
  
  // Pega o deployer (master wallet)
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying com a conta:", deployer.address);
  
  // Verifica saldo
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Saldo da conta:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  ATENÇÃO: Saldo baixo de ETH. Pode não ter gas suficiente.");
  }
  
  // Deploy do contrato
  console.log("\n📝 Compilando contrato...");
  const AgroFiToken = await ethers.getContractFactory("AgroFiToken");
  
  console.log("🚀 Fazendo deploy...");
  const agroFiToken = await AgroFiToken.deploy();
  
  console.log("⏳ Aguardando confirmação...");
  await agroFiToken.waitForDeployment();
  
  const contractAddress = await agroFiToken.getAddress();
  console.log("\n✅ AgroFi Token deployed!");
  console.log("📍 Endereço do contrato:", contractAddress);
  console.log("👤 Owner do contrato:", await agroFiToken.owner());
  console.log("🏷️  Nome do token:", await agroFiToken.name());
  console.log("🔤 Símbolo do token:", await agroFiToken.symbol());
  console.log("🔢 Decimais:", await agroFiToken.decimals());
  
  // Salva endereço em arquivo para o backend usar
  const fs = require('fs');
  const deployInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    network: "sepolia",
    deployedAt: new Date().toISOString(),
    txHash: agroFiToken.deploymentTransaction()?.hash
  };
  
  fs.writeFileSync('../backend/contract-addresses.json', JSON.stringify(deployInfo, null, 2));
  console.log("💾 Endereço salvo em backend/contract-addresses.json");
  
  console.log("\n🎯 Próximos passos:");
  console.log("1. Verificar contrato no Etherscan");
  console.log("2. Atualizar backend com o endereço do contrato");
  console.log("3. Testar mint de tokens");
  
  console.log("\n🔗 Links úteis:");
  console.log(`📊 Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log(`🦊 Adicionar à MetaMask:`);
  console.log(`   - Endereço: ${contractAddress}`);
  console.log(`   - Símbolo: AFI`);
  console.log(`   - Decimais: 18`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });