
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building } from 'lucide-react';

interface BusinessInfoSectionProps {
  profile: {
    business_name: string;
    business_type: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = ({
  profile,
  onInputChange
}) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <Building className="h-5 w-5" />
          Informações do Negócio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business_name" className="dark:text-gray-200">Nome do Negócio</Label>
            <Input
              id="business_name"
              value={profile.business_name}
              onChange={(e) => onInputChange('business_name', e.target.value)}
              placeholder="Nome do seu salão/estabelecimento"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="business_type" className="dark:text-gray-200">Tipo de Negócio</Label>
            <Select
              value={profile.business_type}
              onValueChange={(value) => onInputChange('business_type', value)}
            >
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                <SelectItem value="salao" className="dark:text-white dark:hover:bg-gray-600">Salão de Beleza</SelectItem>
                <SelectItem value="barbearia" className="dark:text-white dark:hover:bg-gray-600">Barbearia</SelectItem>
                <SelectItem value="estetica" className="dark:text-white dark:hover:bg-gray-600">Clínica de Estética</SelectItem>
                <SelectItem value="spa" className="dark:text-white dark:hover:bg-gray-600">Spa</SelectItem>
                <SelectItem value="manicure" className="dark:text-white dark:hover:bg-gray-600">Manicure/Pedicure</SelectItem>
                <SelectItem value="massagem" className="dark:text-white dark:hover:bg-gray-600">Massoterapia</SelectItem>
                <SelectItem value="outro" className="dark:text-white dark:hover:bg-gray-600">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessInfoSection;
