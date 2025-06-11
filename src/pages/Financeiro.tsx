
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabase, type Transacao } from '@/hooks/useSupabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const Financeiro = () => {
  const { getTransacoes, loading } = useSupabase();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  
  // Carregar transações do Supabase
  useEffect(() => {
    loadTransacoes();
  }, []);

  const loadTransacoes = async () => {
    const transacoesData = await getTransacoes();
    setTransacoes(transacoesData);
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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
            <p className="text-gray-600 mt-1">Controle financeiro e relatórios do seu negócio</p>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
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
              <div className="text-2xl font-bold text-green-600">
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
              <div className="text-2xl font-bold text-red-600">
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
              <div className="text-center py-12">
                <p className="text-gray-600">Carregando transações...</p>
              </div>
            ) : transacoes.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">💰</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma transação registrada
                </h3>
                <p className="text-gray-600 mb-6">
                  As transações aparecerão automaticamente quando você criar agendamentos com valores.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transacao) => (
                  <div key={transacao.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        transacao.tipo === 'receita' ? "bg-green-500" : "bg-red-500"
                      )} />
                      <div>
                        <p className="font-medium text-gray-900">{transacao.descricao}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={cn(
                        "font-bold text-lg",
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
                  <p className="text-2xl font-bold text-green-800">
                    R$ {receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-red-700">Total de Despesas</p>
                  <p className="text-2xl font-bold text-red-800">
                    R$ {despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
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
                    "text-2xl font-bold",
                    faturamentoMes >= 0 ? "text-blue-800" : "text-orange-800"
                  )}>
                    R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {faturamentoMes >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-orange-600" />
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
