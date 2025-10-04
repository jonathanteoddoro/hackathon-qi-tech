import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Wallet, User, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserHeader() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatAddress = (address: string) => {
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
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
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
                <span>{user.email}</span>
                <div className="flex items-center gap-1">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono">{formatAddress(user.smartAccountAddress)}</span>
                </div>
              </div>
              
              {user.userType === 'producer' && 'farmName' in user.profile && (
                <p className="text-sm text-gray-500 mt-1">
                  {user.profile.farmName} • {user.profile.location}
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