// Força logout e limpeza de tokens corrompidos
export function forceLogout(reason: string = 'Token inválido') {
  console.warn('🔑 Forçando logout:', reason);

  // Limpar todos os possíveis locais de armazenamento
  localStorage.removeItem('agrofi_token');
  sessionStorage.removeItem('agrofi_token');

  // Limpar outros dados relacionados se existirem
  localStorage.removeItem('agrofi_user');
  sessionStorage.removeItem('agrofi_user');

  // Mostrar alerta para o usuário
  alert(`${reason}. Você será redirecionado para fazer login novamente.`);

  // Recarregar página para forçar re-autenticação
  window.location.href = window.location.origin;
}

// Função para uso no console do navegador
(window as any).clearTokens = () => {
  forceLogout('Tokens limpos manualmente');
};

console.log('🧹 Para limpar tokens manualmente, execute: clearTokens()');