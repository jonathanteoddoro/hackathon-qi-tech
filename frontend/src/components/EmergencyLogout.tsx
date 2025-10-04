import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function EmergencyLogout() {
  const handleEmergencyLogout = () => {
    console.warn('🚨 EMERGÊNCIA: Limpando todos os tokens...');

    // Limpar TUDO relacionado à autenticação
    localStorage.clear();
    sessionStorage.clear();

    // Mostrar alerta
    alert('🚨 LIMPEZA DE EMERGÊNCIA: Todos os dados foram limpos. Redirecionando...');

    // Recarregar página
    window.location.href = window.location.origin;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        onClick={handleEmergencyLogout}
        variant="destructive"
        size="sm"
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
      >
        <AlertTriangle className="h-4 w-4" />
        🚨 Limpeza de Emergência
      </Button>
    </div>
  );
}

// Também disponibilizar via console
(window as any).emergencyLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  alert('🚨 Limpeza de emergência executada!');
  window.location.href = window.location.origin;
};

console.log('🚨 Para limpeza de emergência, execute: emergencyLogout()');