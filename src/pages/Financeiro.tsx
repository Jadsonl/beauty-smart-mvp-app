import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Pencil, Plus, Trash2 } from 'lucide-react';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import { ProfessionalFilter } from '@/components/financeiro/ProfessionalFilter';
import { DateFilters } from '@/components/financeiro/DateFilters';
import { TransacaoEditModal } from '@/components/financeiro/TransacaoEditModal';
import { AdicionarTransacaoModal } from '@/components/financeiro/AdicionarTransacaoModal';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type Transacao } from '@/hooks/useSupabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Financeiro = () => {
  const { 
    transacoes, 
    profissionais,
    selectedProfessionalId,
    setSelectedProfessionalId,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    serviceFilter,
    setServiceFilter,
    loading,
    handleUpdateTransacao,
    handleAddTransacao,
    handleDeleteTransacao
  } = useFinanceiro();
  
  const [searchFilter, setSearchFilter] = useState('');
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTransacao, setDeleteTransacao] = useState<Transacao | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    
    return descricaoMatch || professionalMatch;
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

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Transações Financeiras', 14, 15);
    const tableColumn = ['Tipo', 'Descrição', 'Data', 'Profissional', 'Valor'];
    const tableRows = filteredTransacoes.map((t) => {
      // Encontrar profissional
      const profissional = profissionais.find((p) => p.id === t.professional_id);
      const professionalName = t.tipo === 'receita' && profissional ? profissional.name : 'Despesa';
      return [
        t.tipo === 'receita' ? 'Receita' : 'Despesa',
        t.descricao,
        t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '',
        professionalName,
        (t.tipo === 'receita' ? '+' : '-') + ' R$ ' + t.valor.toFixed(2),
      ];
    });
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 22,
    });
    doc.save('transacoes_Financeiro.pdf');
  };

  const handleExportExcel = () => {
    const data = filteredTransacoes.map((t) => {
      const profissional = profissionais.find((p) => p.id === t.professional_id);
      return {
        Tipo: t.tipo === 'receita' ? 'Receita' : 'Despesa',
        Descrição: t.descricao,
        Data: t.data ? new Date(t.data).toLocaleDateString('pt-BR') : '',
        Profissional: t.tipo === 'receita' && profissional ? profissional.name : 'Despesa',
        Valor: (t.tipo === 'receita' ? '+' : '-') + ' R$ ' + t.valor.toFixed(2),
      };
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financeiro</h1>
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
                R$ {totalReceitas.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                R$ {totalDespesas.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${saldoTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ProfessionalFilter
                value={selectedProfessionalId}
                onChange={setSelectedProfessionalId}
                profissionais={profissionais}
              />
              
              <DateFilters
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
              />
              
              {/* Busca por Serviço ou Profissional */}
              <div className="space-y-2">
                <Label htmlFor="search-filter">Buscar por Serviço ou Profissional</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search-filter"
                    type="text"
                    placeholder="Digite o nome do serviço ou profissional..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            {(selectedProfessionalId !== 'all' || searchFilter) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Filtros ativos:</span>
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
                  Período: {format(new Date(selectedYear, selectedMonth - 1), 'MMMM/yyyy', { locale: ptBR })}
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
                // Find professional name for this transaction
                const professional = profissionais.find(p => p.id === transacao.professional_id);
                const professionalName = transacao.tipo === 'receita' && professional 
                  ? professional.name 
                  : 'Despesa';

                return (
                  <div key={transacao.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-2 hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant={transacao.tipo === 'receita' ? 'default' : 'destructive'}>
                          {transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                        </Badge>
                        <span className="font-medium text-sm sm:text-base">{transacao.descricao}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span>{format(new Date(transacao.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        <span className="font-medium text-gray-800">{professionalName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`text-lg font-bold ${
                        transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transacao.tipo === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
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
          onSave={handleSaveTransacao}
          loading={loading}
        />

        {/* Modal de Adição */}
        <AdicionarTransacaoModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          profissionais={profissionais}
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
