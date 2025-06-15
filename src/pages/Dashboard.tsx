
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSupabase } from '@/hooks/useSupabase';
import { useAniversariantes } from '@/hooks/useAniversariantes';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const { getAgendamentos, getTransacoes, getClientes } = useSupabase();
  const { aniversariantesDoDia, loading: loadingAniversariantes, createBirthdayWhatsAppLink } = useAniversariantes();
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

  const handleWhatsAppClick = (cliente: any) => {
    const link = createBirthdayWhatsAppLink(cliente);
    
    if (!link) {
      toast.error(`Cliente ${cliente.nome} não possui telefone cadastrado`);
      return;
    }

    console.log('WhatsApp link gerado para aniversariante:', link);
    
    // Abrir WhatsApp
    const opened = window.open(link, '_blank');
    
    // Fallback para iOS se whatsapp:// não funcionar
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !opened && link.startsWith('whatsapp://')) {
      setTimeout(() => {
        const fallbackUrl = link.replace('whatsapp://send?phone=', 'https://wa.me/+').replace('&text=', '?text=');
        console.log('Fallback para wa.me:', fallbackUrl);
        window.open(fallbackUrl, '_blank');
      }, 1000);
    }
    
    toast.success(`Mensagem de aniversário preparada para ${cliente.nome}!`);
  };

  if (loading || loadingAniversariantes) {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
            Bem-vindo de volta! Aqui está um resumo do seu negócio.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium dark:text-white">Faturamento do Mês</CardTitle>
              <span className="text-lg sm:text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                {format(today, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium dark:text-white">Agendamentos do Mês</CardTitle>
              <span className="text-lg sm:text-2xl">📅</span>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold dark:text-white">{agendamentosMes}</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                {format(today, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium dark:text-white">Agendamentos Hoje</CardTitle>
              <span className="text-lg sm:text-2xl">⏰</span>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{agendamentosHoje}</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                {format(today, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium dark:text-white">Clientes Únicos</CardTitle>
              <span className="text-lg sm:text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{clientesUnicos}</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Total cadastrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments and Birthday Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl dark:text-white">
                <span className="text-xl">📅</span>
                Agendamentos de Hoje
              </CardTitle>
              <CardDescription className="text-sm dark:text-gray-400">
                {format(today, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agendamentosDeHoje.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <span className="text-2xl sm:text-4xl mb-4 block">📅</span>
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Nenhum agendamento para hoje.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agendamentosDeHoje.map((agendamento) => (
                    <div key={agendamento.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate dark:text-white">{agendamento.client_name}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{agendamento.service}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-600 dark:text-pink-400 text-sm sm:text-base">{agendamento.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aniversariantes do Mês */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl dark:text-white">
                <span className="text-xl">🎂</span>
                Aniversariantes do Mês
              </CardTitle>
              <CardDescription className="text-sm dark:text-gray-400">
                {format(today, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aniversariantes.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <span className="text-2xl sm:text-4xl mb-4 block">🎂</span>
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Nenhum aniversariante este mês.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aniversariantes.map((cliente) => (
                    <div key={cliente.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate dark:text-white">{cliente.nome}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
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
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl dark:text-white">
              <span className="text-xl">🔔</span>
              Notificações
            </CardTitle>
            <CardDescription className="text-sm dark:text-gray-400">
              Atualizações importantes do seu negócio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Aniversariantes do Dia - Individual com WhatsApp */}
              {aniversariantesDoDia.length > 0 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🎉</span>
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                      Aniversariante{aniversariantesDoDia.length > 1 ? 's' : ''} de Hoje:
                    </p>
                  </div>
                  <div className="space-y-2">
                    {aniversariantesDoDia.map((cliente) => (
                      <div key={cliente.id} className="bg-white dark:bg-gray-800 p-3 rounded border border-orange-100 dark:border-orange-700">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                          <p className="font-medium text-sm text-orange-900 dark:text-orange-100 flex items-center gap-1">
                            <span className="text-lg">🎂</span>
                            Feliz Aniversário, {cliente.nome}!
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleWhatsAppClick(cliente)}
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white flex items-center gap-1 text-xs px-2 py-1 w-full sm:w-auto"
                            disabled={!cliente.telefone}
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>Enviar WhatsApp</span>
                          </Button>
                        </div>
                        <p className="text-xs text-orange-700 dark:text-orange-300">
                          Hoje é aniversário! {!cliente.telefone && '(Telefone não cadastrado)'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agendamentosHoje > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                    📅 Você tem {agendamentosHoje} agendamento{agendamentosHoje > 1 ? 's' : ''} para hoje.
                  </p>
                </div>
              )}
              
              {aniversariantes.length > 0 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-xs sm:text-sm text-purple-800 dark:text-purple-200">
                    🎂 {aniversariantes.length} cliente{aniversariantes.length > 1 ? 's fazem' : ' faz'} aniversário este mês!
                  </p>
                </div>
              )}
              
              {agendamentosHoje === 0 && aniversariantes.length === 0 && aniversariantesDoDia.length === 0 && (
                <div className="text-center py-4">
                  <span className="text-2xl sm:text-4xl mb-2 block">✨</span>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Tudo em dia! Nenhuma notificação pendente.</p>
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
