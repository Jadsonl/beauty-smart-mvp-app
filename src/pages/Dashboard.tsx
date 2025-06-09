
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { user, agendamentos, clientes, transacoes } = useApp();
  
  const today = new Date();
  const thisMonth = format(today, 'yyyy-MM');
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Calculate metrics
  const agendamentosHoje = agendamentos.filter(a => a.data === todayStr).length;
  const agendamentosMes = agendamentos.filter(a => a.data.startsWith(thisMonth)).length;
  const faturamentoMes = transacoes
    .filter(t => t.tipo === 'receita' && t.data.startsWith(thisMonth))
    .reduce((sum, t) => sum + t.valor, 0);
  const clientesUnicos = clientes.length;
  
  // Get today's appointments
  const agendamentosDeHoje = agendamentos
    .filter(a => a.data === todayStr)
    .sort((a, b) => a.horario.localeCompare(b.horario));

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo de volta, {user?.name}! Aqui está um resumo do seu negócio.
          </p>
          
          {user?.testeGratuito && (
            <div className="mt-4 p-4 bg-pink-50 border border-pink-200 rounded-lg">
              <h3 className="font-semibold text-pink-800">🎉 Teste Premium Ativo!</h3>
              <p className="text-pink-700 mt-1">
                Você tem {user.diasRestantes} dias restantes do seu teste gratuito do Plano Premium.
              </p>
            </div>
          )}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento do Mês</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(today, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos do Mês</CardTitle>
              <span className="text-2xl">📅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agendamentosMes}</div>
              <p className="text-xs text-muted-foreground">
                {format(today, 'MMMM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
              <span className="text-2xl">⏰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{agendamentosHoje}</div>
              <p className="text-xs text-muted-foreground">
                {format(today, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
              <span className="text-2xl">👥</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{clientesUnicos}</div>
              <p className="text-xs text-muted-foreground">
                Total cadastrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">📅</span>
                Agendamentos de Hoje
              </CardTitle>
              <CardDescription>
                {format(today, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agendamentosDeHoje.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">📅</span>
                  <p className="text-gray-500">Nenhum agendamento para hoje.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agendamentosDeHoje.map((agendamento) => (
                    <div key={agendamento.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{agendamento.clienteNome}</p>
                        <p className="text-sm text-gray-600">{agendamento.servico}</p>
                        <p className="text-sm text-gray-500">Prof: {agendamento.profissional}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-600">{agendamento.horario}</p>
                        {agendamento.valor && (
                          <p className="text-sm text-green-600">
                            R$ {agendamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                Notificações
              </CardTitle>
              <CardDescription>
                Atualizações importantes do seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agendamentosHoje > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📅 Você tem {agendamentosHoje} agendamento{agendamentosHoje > 1 ? 's' : ''} para hoje.
                    </p>
                  </div>
                )}
                
                {user?.testeGratuito && user?.diasRestantes && user.diasRestantes <= 7 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      ⏰ Seu teste gratuito expira em {user.diasRestantes} dias.
                    </p>
                  </div>
                )}
                
                {agendamentosHoje === 0 && !user?.testeGratuito && (
                  <div className="text-center py-4">
                    <span className="text-4xl mb-2 block">✨</span>
                    <p className="text-gray-500">Tudo em dia! Nenhuma notificação pendente.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
