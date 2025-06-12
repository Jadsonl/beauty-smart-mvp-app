
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabase, type Transacao } from '@/hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Calendar, Plus, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Financeiro = () => {
  const { getTransacoes, addTransacao, loading } = useSupabase();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    descricao: '',
    valor: 0,
    data: format(new Date(), 'yyyy-MM-dd')
  });
  
  useEffect(() => {
    loadTransacoes();
  }, []);

  const loadTransacoes = async () => {
    try {
      const transacoesData = await getTransacoes();
      setTransacoes(transacoesData);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast.error('Erro ao carregar transações');
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.descricao.trim() || newTransaction.valor <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      console.log('Financeiro: Adicionando transação:', newTransaction);
      const success = await addTransacao(newTransaction);
      if (success) {
        toast.success('Transação adicionada com sucesso!');
        setIsDialogOpen(false);
        setNewTransaction({
          tipo: 'receita',
          descricao: '',
          valor: 0,
          data: format(new Date(), 'yyyy-MM-dd')
        });
        await loadTransacoes(); // Recarregar transações
      } else {
        toast.error('Erro ao adicionar transação');
      }
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      toast.error('Erro ao adicionar transação');
    }
  };

  const today = new Date();
  const thisMonth = format(today, 'yyyy-MM');
  
  // Calculate financial metrics
  const receitasMes = transacoes
    .filter(t => t.tipo === 'receita' && t.data.startsWith(thisMonth))
    .reduce((sum, t) => sum + t.valor, 0);
    
  const despesasMes = transacoes
    .filter(t => t.tipo === 'despesa' && t.data.startsWith(thisMonth))
    .reduce((sum, t) => sum + t.valor, 0);
    
  const faturamentoMes = receitasMes - despesasMes;
  
  // Get recent transactions (last 10)
  const recentTransactions = [...transacoes]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 10);

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Controle financeiro e relatórios do seu negócio</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Transação</DialogTitle>
                <DialogDescription>
                  Registre uma nova receita ou despesa.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={newTransaction.tipo} onValueChange={(value: 'receita' | 'despesa') => 
                    setNewTransaction({...newTransaction, tipo: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={newTransaction.descricao}
                    onChange={(e) => setNewTransaction({...newTransaction, descricao: e.target.value})}
                    placeholder="Ex: Corte de cabelo - Cliente João"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valor">Valor (R$) *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newTransaction.valor}
                      onChange={(e) => setNewTransaction({...newTransaction, valor: parseFloat(e.target.value) || 0})}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data">Data *</Label>
                    <Input
                      id="data"
                      type="date"
                      value={newTransaction.data}
                      onChange={(e) => setNewTransaction({...newTransaction, data: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    onClick={handleAddTransaction} 
                    className="bg-green-600 hover:bg-green-700 flex-1"
                  >
                    Adicionar Transação
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento do Mês</CardTitle>
              <DollarSign className={cn(
                "h-4 w-4",
                faturamentoMes >= 0 ? "text-green-600" : "text-red-600"
              )} />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-xl sm:text-2xl font-bold",
                faturamentoMes >= 0 ? "text-green-600" : "text-red-600"
              )}>
                R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(today, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                R$ {receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(today, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                R$ {despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(today, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Últimas Transações
            </CardTitle>
            <CardDescription>
              {loading ? 'Carregando transações...' : (
                transacoes.length === 0 
                  ? 'Nenhuma transação registrada ainda.' 
                  : `${transacoes.length} transação${transacoes.length > 1 ? 'ões' : ''} registrada${transacoes.length > 1 ? 's' : ''}`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-600">Carregando transações...</p>
              </div>
            ) : transacoes.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <span className="text-4xl sm:text-6xl mb-4 block">💰</span>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  Nenhuma transação registrada
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Comece registrando suas receitas e despesas para controlar seu financeiro.
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Transação
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transacao) => (
                  <div key={transacao.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow gap-2 sm:gap-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={cn(
                        "w-3 h-3 rounded-full flex-shrink-0",
                        transacao.tipo === 'receita' ? "bg-green-500" : "bg-red-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{transacao.descricao}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        "font-bold text-base sm:text-lg",
                        transacao.tipo === 'receita' ? "text-green-600" : "text-red-600"
                      )}>
                        {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {transacao.tipo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Mensal</CardTitle>
            <CardDescription>
              Análise financeira de {format(today, 'MMMM/yyyy', { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-700">Total de Receitas</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-800">
                    R$ {receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-red-700">Total de Despesas</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-800">
                    R$ {despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
              
              <div className={cn(
                "flex justify-between items-center p-4 rounded-lg",
                faturamentoMes >= 0 ? "bg-blue-50" : "bg-orange-50"
              )}>
                <div>
                  <p className={cn(
                    "text-sm",
                    faturamentoMes >= 0 ? "text-blue-700" : "text-orange-700"
                  )}>
                    Resultado Final
                  </p>
                  <p className={cn(
                    "text-xl sm:text-2xl font-bold",
                    faturamentoMes >= 0 ? "text-blue-800" : "text-orange-800"
                  )}>
                    R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {faturamentoMes >= 0 ? (
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Financeiro;
