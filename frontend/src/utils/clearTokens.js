// Script para limpar tokens corrompidos
console.log('🧹 Limpando tokens inválidos...');

// Limpar localStorage
localStorage.removeItem('agrofi_token');

// Limpar sessionStorage se houver
sessionStorage.removeItem('agrofi_token');

console.log('✅ Tokens limpos! Recarregue a página para fazer login novamente.');

// Opcional: recarregar automaticamente
// window.location.reload();