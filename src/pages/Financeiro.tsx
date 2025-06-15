
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { ProfessionalFilter } from '@/components/financeiro/ProfessionalFilter';
import { ServiceFilter } from '@/components/financeiro/ServiceFilter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Financeiro = () => {
  const { 
    transacoes, 
    profissionais,
    selectedProfessionalId,
    setSelectedProfessionalId,
    serviceFilter,
    setServiceFilter,
    loading 
  } = useFinanceiro();

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);

  const saldoTotal = totalReceitas - totalDespesas;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceitas.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalDespesas.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldoTotal.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Use os filtros abaixo para refinar sua análise financeira
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfessionalFilter
              value={selectedProfessionalId}
              onChange={setSelectedProfessionalId}
              profissionais={profissionais}
            />
            <ServiceFilter
              value={serviceFilter}
              onChange={setServiceFilter}
            />
          </div>
          {(selectedProfessionalId !== 'all' || serviceFilter) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtros ativos:</span>
              {selectedProfessionalId !== 'all' && (
                <Badge variant="secondary">
                  Profissional: {profissionais.find(p => p.id === selectedProfessionalId)?.name || 'N/A'}
                </Badge>
              )}
              {serviceFilter && (
                <Badge variant="secondary">
                  Serviço: "{serviceFilter}"
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>
            {transacoes.length > 0 
              ? `${transacoes.length} transação(ões) encontrada(s)`
              : 'Nenhuma transação encontrada com os filtros aplicados'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transacoes.map((transacao) => (
              <div key={transacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={transacao.tipo === 'receita' ? 'default' : 'destructive'}>
                      {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </Badge>
                    <span className="font-medium">{transacao.descricao}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className={`text-lg font-bold ${
                  transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;
