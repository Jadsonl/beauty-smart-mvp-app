
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { type Produto } from '@/hooks/useSupabase';

interface LowStockAlertProps {
  produtos: Produto[];
  inventario: any[];
}

export const LowStockAlert = ({ produtos, inventario }: LowStockAlertProps) => {
  const produtosComBaixoEstoque = produtos.filter(produto => {
    const inventarioProduto = inventario.find(inv => inv.product_id === produto.id);
    return inventarioProduto && inventarioProduto.quantity <= (produto.min_stock_level || 0);
  });

  if (produtosComBaixoEstoque.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 text-lg sm:text-xl">
          <AlertTriangle className="h-5 w-5" />
          Alertas de Estoque
        </CardTitle>
        <CardDescription className="text-orange-700 text-sm">
          {produtosComBaixoEstoque.length} produto(s) com estoque baixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {produtosComBaixoEstoque.map((produto) => {
            const inventarioProduto = inventario.find(inv => inv.product_id === produto.id);
            return (
              <div key={produto.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-lg border border-orange-200 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-orange-800 text-sm sm:text-base truncate">{produto.name}</p>
                  <p className="text-xs sm:text-sm text-orange-600">
                    Estoque atual: {inventarioProduto?.quantity || 0} {produto.unit || ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-orange-600">
                    Mínimo: {produto.min_stock_level || 0} {produto.unit || ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
