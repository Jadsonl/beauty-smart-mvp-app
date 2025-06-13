
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabase, type Transacao } from '@/hooks/useSupabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Calendar, Plus, DollarSign, Edit3, ChevronLeft, ChevronRight, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Financeiro = () => {
  const { getTransacoes, addTransacao, updateTransacao, loading } = useSupabase();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [filteredTransacoes, setFilteredTransacoes] = useState<Transacao[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTransaction, setNewTransaction] = useState({
    tipo: 'receita' as 'receita' | 'despesa',
    descricao: '',
    valor: 0,
    data: format(new Date(), 'yyyy-MM-dd')
  });
  
  useEffect(() => {
    loadTransacoes();
  }, []);

  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    const filtered = transacoes.filter(transacao => {
      const transacaoDate = new Date(transacao.data);
      return transacaoDate >= monthStart && transacaoDate <= monthEnd;
    });
    
    setFilteredTransacoes(filtered);
  }, [transacoes, currentDate]);

  const loadTransacoes = async () => {
    try {
      const transacoesData = await getTransacoes();
      setTransacoes(transacoesData);
    } catch (error) {
      toast.error('Erro ao carregar transações');
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.descricao.trim() || newTransaction.valor <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
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
        await loadTransacoes();
      } else {
        toast.error('Erro ao adicionar transação');
      }
    } catch (error) {
      toast.error('Erro ao adicionar transação');
    }
  };

  const handleEditTransaction = async () => {
    if (!editingTransaction || !editingTransaction.descricao.trim() || editingTransaction.valor <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const success = await updateTransacao(editingTransaction.id, {
        tipo: editingTransaction.tipo,
        descricao: editingTransaction.descricao,
        valor: editingTransaction.valor,
        data: editingTransaction.data
      });
      
      if (success) {
        toast.success('Transação atualizada com sucesso!');
        setIsEditDialogOpen(false);
        setEditingTransaction(null);
        await loadTransacoes();
      } else {
        toast.error('Erro ao atualizar transação');
      }
    } catch (error) {
      toast.error('Erro ao atualizar transação');
    }
  };

  const openEditDialog = (transacao: Transacao) => {
    setEditingTransaction({ ...transacao });
    setIsEditDialogOpen(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const exportToCSV = () => {
    const csv = [
      ['Data', 'Tipo', 'Descrição', 'Valor'],
      ...filteredTransacoes.map(t => [
        format(new Date(t.data), 'dd/MM/yyyy'),
        t.tipo,
        t.descricao,
        t.valor.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_financeiro_${format(currentDate, 'MMMM_yyyy', { locale: ptBR })}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Relatório CSV exportado com sucesso!');
  };

  const exportToPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      doc.text('Relatório Financeiro', 20, 20);
      doc.text(`Período: ${format(currentDate, 'MMMM yyyy', { locale: ptBR })}`, 20, 30);
      
      let y = 50;
      filteredTransacoes.forEach(t => {
        doc.text(`${format(new Date(t.data), 'dd/MM/yyyy')} - ${t.tipo} - ${t.descricao} - R$ ${t.valor.toFixed(2)}`, 20, y);
        y += 10;
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });

      doc.save(`relatorio_financeiro_${format(currentDate, 'MMMM_yyyy', { locale: ptBR })}.pdf`);
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
    }
  };

  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(
        filteredTransacoes.map(t => ({
          Data: format(new Date(t.data), 'dd/MM/yyyy'),
          Tipo: t.tipo,
          Descrição: t.descricao,
          Valor: t.valor
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transações');
      XLSX.writeFile(wb, `relatorio_financeiro_${format(currentDate, 'MMMM_yyyy', { locale: ptBR })}.xlsx`);
      toast.success('Relatório Excel exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar Excel');
    }
  };

  // Calculate financial metrics para o mês atual
  const receitasMes = filteredTransacoes
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);
    
  const despesasMes = filteredTransacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);
    
  const faturamentoMes = receitasMes - despesasMes;
  
  // Get recent transactions (ordenadas por data)
  const recentTransactions = [...filteredTransacoes]
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
          
          <div className="flex flex-col sm:flex-row gap-2">
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
            
            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="flex-1 sm:flex-none"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className="flex-1 sm:flex-none"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Período Selecionado
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-[120px] text-center">
                  {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

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
                {format(currentDate, 'MMMM/yyyy', { locale: ptBR })}
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
                {format(currentDate, 'MMMM/yyyy', { locale: ptBR })}
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
                {format(currentDate, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Transações do Período
            </CardTitle>
            <CardDescription>
              {loading ? 'Carregando transações...' : (
                filteredTransacoes.length === 0 
                  ? 'Nenhuma transação registrada neste período.' 
                  : `${filteredTransacoes.length} transação${filteredTransacoes.length > 1 ? 'ões' : ''} encontrada${filteredTransacoes.length > 1 ? 's' : ''}`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-600">Carregando transações...</p>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <span className="text-4xl sm:text-6xl mb-4 block">💰</span>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                  Nenhuma transação neste período
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
                    
                    <div className="flex items-center gap-2">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(transacao)}
                        className="flex-shrink-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Transaction Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md mx-4 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Transação</DialogTitle>
              <DialogDescription>
                Modifique os dados da transação selecionada.
              </DialogDescription>
            </DialogHeader>
            {editingTransaction && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-tipo">Tipo *</Label>
                  <Select 
                    value={editingTransaction.tipo} 
                    onValueChange={(value: 'receita' | 'despesa') => 
                      setEditingTransaction({...editingTransaction, tipo: value})
                    }
                  >
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
                  <Label htmlFor="edit-descricao">Descrição *</Label>
                  <Input
                    id="edit-descricao"
                    value={editingTransaction.descricao}
                    onChange={(e) => setEditingTransaction({...editingTransaction, descricao: e.target.value})}
                    placeholder="Ex: Corte de cabelo - Cliente João"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-valor">Valor (R$) *</Label>
                    <Input
                      id="edit-valor"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingTransaction.valor}
                      onChange={(e) => setEditingTransaction({...editingTransaction, valor: parseFloat(e.target.value) || 0})}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-data">Data *</Label>
                    <Input
                      id="edit-data"
                      type="date"
                      value={editingTransaction.data}
                      onChange={(e) => setEditingTransaction({...editingTransaction, data: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    onClick={handleEditTransaction} 
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo Mensal</CardTitle>
            <CardDescription>
              Análise financeira de {format(currentDate, 'MMMM/yyyy', { locale: ptBR })}
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
