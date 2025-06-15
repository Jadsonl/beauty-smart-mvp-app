
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface PersonalInfoSectionProps {
  profile: {
    full_name: string;
    phone: string;
    address: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  profile,
  onInputChange
}) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <User className="h-5 w-5" />
          Informações Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name" className="dark:text-gray-200">Nome Completo *</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => onInputChange('full_name', e.target.value)}
              placeholder="Seu nome completo"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone" className="dark:text-gray-200">Telefone</Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
        
        {/* Temporariamente removendo o campo de endereço para teste
        <div>
          <Label htmlFor="address" className="dark:text-gray-200">Endereço</Label>
          <Input
            id="address"
            value={profile.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="Endereço completo do estabelecimento"
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        */}
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;
