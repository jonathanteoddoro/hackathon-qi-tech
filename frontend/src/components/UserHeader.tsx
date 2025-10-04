import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Wallet, User, Building2, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { afiAPI } from '../services/afi-api';

export default function UserHeader() {
  const { user, logout } = useAuth();
  const [afiBalance, setAFIBalance] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.userType === 'producer') {
      loadAFIBalance();
    }
  }, [user]);

  const loadAFIBalance = async () => {
    try {
      const token = localStorage.getItem('agrofi_token');
      if (!token) return;

      const balance = await afiAPI.getAFIBalance(token);
      setAFIBalance(balance.balance);
    } catch (error) {
      console.error('Erro ao carregar saldo AFI:', error);
    }
  };

  if (!user) return null;

  const getUserInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return 'U';

    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const formatAddress = (address?: string) => {
    if (!address || typeof address !== 'string' || address.length < 10) {
      return '0x0000...0000';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{user.name || 'Usuário'}</h3>
                <Badge variant={user.userType === 'investor' ? 'default' : 'secondary'}>
                  {user.userType === 'investor' ? (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      Investidor
                    </>
                  ) : (
                    <>
                      <Building2 className="h-3 w-3 mr-1" />
                      Produtor
                    </>
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{user.email || 'email@exemplo.com'}</span>
                <div className="flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono">{formatAddress(user.smartAccountAddress)}</span>
                </div>
                {user.userType === 'producer' && afiBalance !== null && (
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                    <Coins className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-700">
                      {afiBalance.toLocaleString()} AFI
                    </span>
                  </div>
                )}
              </div>

              {user.userType === 'producer' && user.profile && 'farmName' in user.profile && (
                <p className="text-sm text-gray-500 mt-1">
                  {user.profile.farmName || 'Fazenda'} • {user.profile.location || 'Local não informado'}
                </p>
              )}
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}