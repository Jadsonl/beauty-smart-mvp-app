
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { AniversariantesDoDia } from '@/components/dashboard/AniversariantesDoDia';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const { getAgendamentos, getTransacoes, getClientes } = useSupabase();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [aniversariantes, setAniversariantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          console.log('Dashboard: Carregando dados para usuário:', user.id);
          setLoading(true);
          const [agendamentosData, transacoesData, clientesData] = await Promise.all([
            getAgendamentos(),
            getTransacoes(),
            getClientes()
          ]);
          
          // Filtrar aniversariantes do mês atual
          const currentMonth = new Date().getMonth() + 1;
          const aniversariantesDoMes = (clientesData || []).filter(cliente => {
            if (!cliente.date_of_birth) return false;
            const birthMonth = new Date(cliente.date_of_birth).getMonth() + 1;
            return birthMonth === currentMonth;
          }).sort((a, b) => {
            const dayA = new Date(a.date_of_birth).getDate();
            const dayB = new Date(b.date_of_birth).getDate();
            return dayA - dayB;
          });
          
          console.log('Dashboard: Dados carregados - agendamentos:', agendamentosData.length, 'transações:', transacoesData.length, 'aniversariantes:', aniversariantesDoMes.length);
          setAgendamentos(agendamentosData);
          setTransacoes(transacoesData);
          setAniversariantes(aniversariantesDoMes);
        } catch (error) {
          console.error('Dashboard: Erro ao carregar dados:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('Dashboard: Usuário não logado, não carregando dados');
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, getAgendamentos, getTransacoes, getClientes]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Carregando dados...</p>
        </div>
      </Layout>
    );
  }
  
  const today = new Date();
  const thisMonth = format(today, 'yyyy-MM');
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Calculate metrics
  const agendamentosHoje = agendamentos.filter(a => a.date === todayStr).length;
  const agendamentosMes = agendamentos.filter(a => a.date?.startsWith(thisMonth)).length;
  const faturamentoMes = transacoes
    .filter(t => t.tipo === 'receita' && t.data?.startsWith(thisMonth))
    .reduce((sum, t) => sum + (t.valor || 0), 0);
  const clientesUnicos = 0; // We'll get this from clients later
  
  // Get today's appointments
  const agendamentosDeHoje = agendamentos
    .filter(a => a.date === todayStr)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Bem-vindo de volta! Aqui está um resumo do seu negócio.
          </p>
        </div>

        {/* Aniversariantes de Hoje - Nova seção no topo */}
        <AniversariantesDoDia />

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Faturamento do Mês</CardTitle>
              <span className="text-lg sm:text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(today, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Agendamentos do Mês</CardTitle>
              <span className="text-lg sm:text-2xl">📅</span>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{agendamentosMes}</div>
              <p className="text-xs text-muted-foreground">
                {format(today, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Agendamentos Hoje</CardTitle>
              <span className="text-lg sm:text-2xl">⏰</span>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{agendamentosHoje}</div>
              <p className="text-xs text-muted-foreground">
                {format(today, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Clientes Únicos</CardTitle>
              <span className="text-lg sm:text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{clientesUnicos}</div>
              <p className="text-xs text-muted-foreground">
                Total cadastrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments and Birthday Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <span className="text-xl">📅</span>
                Agendamentos de Hoje
              </CardTitle>
              <CardDescription className="text-sm">
                {format(today, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agendamentosDeHoje.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <span className="text-2xl sm:text-4xl mb-4 block">📅</span>
                  <p className="text-gray-500 text-sm sm:text-base">Nenhum agendamento para hoje.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agendamentosDeHoje.map((agendamento) => (
                    <div key={agendamento.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{agendamento.client_name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{agendamento.service}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-600 text-sm sm:text-base">{agendamento.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aniversariantes do Mês */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <span className="text-xl">🎂</span>
                Aniversariantes do Mês
              </CardTitle>
              <CardDescription className="text-sm">
                {format(today, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aniversariantes.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <span className="text-2xl sm:text-4xl mb-4 block">🎂</span>
                  <p className="text-gray-500 text-sm sm:text-base">Nenhum aniversariante este mês.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aniversariantes.map((cliente) => (
                    <div key={cliente.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{cliente.nome}</p>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {format(new Date(cliente.date_of_birth), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl">🎉</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <span className="text-xl">🔔</span>
              Notificações
            </CardTitle>
            <CardDescription className="text-sm">
              Atualizações importantes do seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agendamentosHoje > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    📅 Você tem {agendamentosHoje} agendamento{agendamentosHoje > 1 ? 's' : ''} para hoje.
                  </p>
                </div>
              )}
              
              {aniversariantes.length > 0 && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-purple-800">
                    🎂 {aniversariantes.length} cliente{aniversariantes.length > 1 ? 's fazem' : ' faz'} aniversário este mês!
                  </p>
                </div>
              )}
              
              {agendamentosHoje === 0 && aniversariantes.length === 0 && (
                <div className="text-center py-4">
                  <span className="text-2xl sm:text-4xl mb-2 block">✨</span>
                  <p className="text-gray-500 text-xs sm:text-sm">Tudo em dia! Nenhuma notificação pendente.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
