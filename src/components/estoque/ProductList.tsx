
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { type Produto } from '@/hooks/useSupabase';

interface ProductListProps {
  produtos: Produto[];
  inventario: any[];
  onEdit: (produto: Produto) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const ProductList = ({ produtos, inventario, onEdit, onDelete, onAddNew }: ProductListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Package className="h-5 w-5" />
          Produtos Cadastrados
        </CardTitle>
        <CardDescription className="text-sm">
          {produtos.length} produto(s) no seu estoque
        </CardDescription>
      </CardHeader>
      <CardContent>
        {produtos.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
              Comece adicionando produtos ao seu estoque para controlar o inventário.
            </p>
            <Button 
              onClick={onAddNew}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Produto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {produtos.map((produto) => (
              <ProductCard
                key={produto.id}
                produto={produto}
                inventario={inventario}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
