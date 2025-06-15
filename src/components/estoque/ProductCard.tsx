
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import { type Produto } from '@/hooks/useSupabase';

interface ProductCardProps {
  produto: Produto;
  inventario: any[];
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
}

export const ProductCard = ({ produto, inventario, onEdit, onDelete }: ProductCardProps) => {
  const inventarioProduto = inventario.find(inv => inv.product_id === produto.id);
  const quantidadeEstoque = inventarioProduto?.quantity || 0;
  const estoqueMinimo = produto.min_stock_level || 0;
  const isLowStock = quantidadeEstoque <= estoqueMinimo;

  return (
    <Card className={`${isLowStock ? 'border-orange-300' : 'border-gray-200'} relative`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base sm:text-lg truncate flex-1">{produto.name}</CardTitle>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(produto)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(produto.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {produto.description && (
          <CardDescription className="text-xs sm:text-sm line-clamp-2">
            {produto.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Preço:</span>
          <span className="font-medium">
            R$ {produto.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Estoque:</span>
          <span className={`font-medium ${isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
            {quantidadeEstoque}{produto.unit ? ` ${produto.unit}` : ''}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Mínimo:</span>
          <span className="font-medium text-gray-900">
            {estoqueMinimo}{produto.unit ? ` ${produto.unit}` : ''}
          </span>
        </div>
        
        {produto.category && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Categoria:</span>
            <span className="font-medium text-gray-900 truncate ml-2">{produto.category}</span>
          </div>
        )}
        
        {isLowStock && (
          <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
            <AlertTriangle className="h-3 w-3" />
            <span>Estoque baixo</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
