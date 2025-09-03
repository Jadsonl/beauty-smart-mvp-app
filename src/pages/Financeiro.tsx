import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Pencil, Plus, Trash2 } from 'lucide-react';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { useSupabase } from '@/hooks/useSupabase';
import { ProfessionalFilter } from '@/components/financeiro/ProfessionalFilter';
import { DateRangeFilter } from '@/components/financeiro/DateRangeFilter';
import { MonthNavigation } from '@/components/financeiro/MonthNavigation';
import { TransacaoEditModal } from '@/components/financeiro/TransacaoEditModal';
import { AdicionarTransacaoModal } from '@/components/financeiro/AdicionarTransacaoModal';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Transacao } from '@/hooks/useSupabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Financeiro = () => {
  const { 
    transacoes, 
    profissionais,
    clientes,
    selectedProfessionalId,
    setSelectedProfessionalId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    serviceFilter,
    setServiceFilter,
    loading,
    handleUpdateTransacao,
    handleAddTransacao,
    handleDeleteTransacao
  } = useFinanceiro();
  
  const { getProdutos } = useSupabase();
  const [produtos, setProdutos] = useState([]);
  
  const [searchFilter, setSearchFilter] = useState('');
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTransacao, setDeleteTransacao] = useState<Transacao | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Aplicar filtro de mês atual automaticamente
  React.useEffect(() => {
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    
    if (!startDate && !endDate) {
      setStartDate(startOfCurrentMonth);
      setEndDate(endOfCurrentMonth);
    }
  }, [startDate, endDate, setStartDate, setEndDate]);

  // Carregar produtos
  React.useEffect(() => {
    const loadProdutos = async () => {
      const produtosData = await getProdutos();
      setProdutos(produtosData);
    };
    loadProdutos();
  }, [getProdutos]);

  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);

  const saldoTotal = totalReceitas - totalDespesas;

  // Filter transactions based on search
  const filteredTransacoes = transacoes.filter(transacao => {
    if (!searchFilter.trim()) return true;
    
    const searchTerm = searchFilter.toLowerCase();
    const descricaoMatch = transacao.descricao.toLowerCase().includes(searchTerm);
    
    // Find professional name for this transaction
    const professional = profissionais.find(p => p.id === transacao.professional_id);
    const professionalMatch = professional?.name.toLowerCase().includes(searchTerm) || false;
    
    // Find client name for this transaction
    const client = clientes.find(c => c.id === transacao.client_id);
    const clientMatch = client?.nome.toLowerCase().includes(searchTerm) || false;
    
    // Also search by date
    const dateMatch = format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR }).includes(searchTerm);
    
    return descricaoMatch || professionalMatch || clientMatch || dateMatch;
  });

  const handleEditTransacao = (transacao: Transacao) => {
    setEditingTransacao(transacao);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransacao(null);
  };

  const handleSaveTransacao = async (transacaoId: string, updatedData: Partial<Transacao>) => {
    return await handleUpdateTransacao(transacaoId, updatedData);
  };

  const handleAddLancamento = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSaveNewTransacao = async (transacaoData: Omit<Transacao, 'id' | 'user_id' | 'created_at'>) => {
    return await handleAddTransacao(transacaoData);
  };

  const handleOpenDeleteModal = (transacao: Transacao) => {
    setDeleteTransacao(transacao);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTransacao(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteTransacao) {
      const success = await handleDeleteTransacao(deleteTransacao.id);
      if (success) {
        handleCloseDeleteModal();
      }
    }
  };

  const handlePreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    setCurrentMonth(prevMonth);
    setStartDate(startOfMonth(prevMonth));
    setEndDate(endOfMonth(prevMonth));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    setCurrentMonth(nextMonth);
    setStartDate(startOfMonth(nextMonth));
    setEndDate(endOfMonth(nextMonth));
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setCurrentMonth(now);
    setStartDate(startOfMonth(now));
    setEndDate(endOfMonth(now));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Transações Financeiras', 14, 15);

    const tableColumn = ['Tipo', 'Descrição', 'Data', 'Profissional', 'Valor'];
    const tableRows = filteredTransacoes.map((t) => {
      const profissional = profissionais.find((p) => p.id === t.professional_id);
      const showProfessional = t.tipo === 'receita' && profissional && profissional.id !== '' && profissional.name !== '';
      const professionalName = showProfessional ? profissional.name : '';

      return [
        t.tipo === 'receita' ? 'Receita' : 'Despesa',
        t.descricao,
        t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '',
        professionalName,
        (t.tipo === 'receita' ? '+' : '-') + ' R$ ' + t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      ];
    });

    // Calcular total
    const total = filteredTransacoes.reduce((sum, t) =>
      t.tipo === 'receita' ? sum + t.valor : sum - t.valor, 0);

    // Linha total
    tableRows.push([
      '', '', '', 'Total',
      `${total >= 0 ? '+' : '-'} R$ ${Math.abs(total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
      styles: { fontSize: 11 },
      columnStyles: {
        0: { cellWidth: 22 },    // Tipo
        1: { cellWidth: 46 },    // Descrição
        2: { cellWidth: 24 },    // Data
        3: { cellWidth: 44 },    // Profissional
        4: { cellWidth: 38, halign: 'right' }, // Valor
      },
      didParseCell: function (data) {
        // Se for despesa E coluna == 'Valor', pinta de vermelho
        if (
          data.section === 'body'
          && data.column.index === 4
          && data.row.index < filteredTransacoes.length // linhas de transação, não a última de total
        ) {
          const transacao = filteredTransacoes[data.row.index];
          if (transacao.tipo === 'despesa') {
            data.cell.styles.textColor = [220, 38, 38]; // vermelho-600 do Tailwind
          }
        }
        // Na célula de total (última linha)
        if (
          data.section === 'body'
          && data.row.index === tableRows.length - 1 // ultima linha (total)
          && data.column.index === 3 // coluna 'Total'
        ) {
          data.cell.styles.fontStyle = 'bold';
        }
        if (
          data.section === 'body'
          && data.row.index === tableRows.length - 1 // ultima linha (total)
          && data.column.index === 4
        ) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [34, 197, 94]; // verde-500 do Tailwind para total positivo
          if (total < 0) {
            data.cell.styles.textColor = [220, 38, 38]; // vermelho-600 se total negativo
          }
        }
      }
    });
    doc.save('transacoes_Financeiro.pdf');
  };

  const handleExportExcel = () => {
    const data = filteredTransacoes.map((t) => {
      const profissional = profissionais.find((p) => p.id === t.professional_id);
      const showProfessional = t.tipo === 'receita' && profissional && profissional.id !== '' && profissional.name !== '';
      const professionalName = showProfessional ? profissional.name : '';

      return {
        Tipo: t.tipo === 'receita' ? 'Receita' : 'Despesa',
        Descrição: t.descricao,
        Data: t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '',
        Profissional: professionalName,
        Valor: (t.tipo === 'receita' ? '+' : '-') + ' R$ ' + t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      };
    });

    // Calcular total
    const total = filteredTransacoes.reduce((sum, t) =>
      t.tipo === 'receita' ? sum + t.valor : sum - t.valor, 0);

    // Linha total
    data.push({
      Tipo: '',
      Descrição: '',
      Data: '',
      Profissional: 'Total',
      Valor: (total >= 0 ? '+' : '-') + ` R$ ${Math.abs(total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transacoes');
    XLSX.writeFile(wb, 'transacoes_Financeiro.xlsx');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Financeiro</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
              <span>Exportar PDF</span>
            </Button>
            <Button onClick={handleExportExcel} variant="outline" className="flex items-center gap-2">
              <span>Exportar Excel</span>
            </Button>
            <Button onClick={handleAddLancamento} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Lançamento
            </Button>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navegação de Mês */}
        <MonthNavigation
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onCurrentMonth={handleCurrentMonth}
        />

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Use os filtros abaixo para refinar sua análise financeira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Linha única de filtros organizados */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <ProfessionalFilter
                  value={selectedProfessionalId}
                  onChange={setSelectedProfessionalId}
                  profissionais={profissionais}
                />
                
                <DateRangeFilter
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onClearFilters={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                  onShowAll={() => {
                    setStartDate(undefined);
                    setEndDate(undefined);
                  }}
                />

                {/* Busca na terceira coluna */}
                <div className="space-y-2">
                  <Label htmlFor="search-filter">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="search-filter"
                      type="text"
                      placeholder="Nome, serviço, cliente..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {(selectedProfessionalId !== 'all' || searchFilter) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {selectedProfessionalId !== 'all' && (
                  <Badge variant="secondary">
                    Profissional: {profissionais.find(p => p.id === selectedProfessionalId)?.name || 'N/A'}
                  </Badge>
                )}
                {searchFilter && (
                  <Badge variant="secondary">
                    Busca: "{searchFilter}"
                  </Badge>
                 )}
                 <Badge variant="secondary">
                   {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                 </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
            <CardDescription>
              {filteredTransacoes.length > 0 
                ? `${filteredTransacoes.length} transação(ões) encontrada(s)`
                : 'Nenhuma transação encontrada com os filtros aplicados'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransacoes.map((transacao) => {
                const professional = profissionais.find(p => p.id === transacao.professional_id);
                const client = clientes.find(c => c.id === transacao.client_id);
                const showProfessional = transacao.tipo === 'receita' && professional && professional.id !== '' && professional.name !== '';
                const professionalName = showProfessional ? professional.name : '';
                const clientName = client?.nome || '';

                return (
                  <div key={transacao.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant={transacao.tipo === 'receita' ? 'default' : 'destructive'}>
                          {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                        <span className="font-medium text-sm sm:text-base text-foreground">
                          {transacao.tipo === 'despesa' && transacao.nome ? transacao.nome : transacao.descricao}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span>{format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        {professionalName && <span className="font-medium text-foreground">Profissional: {professionalName}</span>}
                        {clientName && <span className="font-medium text-foreground">Cliente: {clientName}</span>}
                        {transacao.tipo === 'despesa' && transacao.descricao !== transacao.nome && (
                          <span className="text-muted-foreground">Obs: {transacao.descricao}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-lg font-bold ${
                        transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTransacao(transacao)}
                        className="ml-2"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(transacao)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        <TransacaoEditModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          transacao={editingTransacao}
          profissionais={profissionais}
          clientes={clientes}
          onSave={handleSaveTransacao}
          loading={loading}
        />

        {/* Modal de Adição */}
        <AdicionarTransacaoModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          profissionais={profissionais}
          clientes={clientes}
          produtos={produtos}
          onSave={handleSaveNewTransacao}
          loading={loading}
        />

        {/* Modal de Confirmação de Exclusão */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Excluir Lançamento Financeiro"
          description="Tem certeza que deseja excluir este lançamento financeiro? Esta ação não pode ser desfeita."
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default Financeiro;
