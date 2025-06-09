
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  plano: 'autonomo' | 'basico' | 'premium';
  testeGratuito?: boolean;
  diasRestantes?: number;
}

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  createdAt: string;
}

interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao: string;
  createdAt: string;
}

interface Produto {
  id: string;
  nome: string;
  quantidade: number;
  estoqueMinimo: number;
  createdAt: string;
}

interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  servico: string;
  profissional: string;
  data: string;
  horario: string;
  status: 'agendado' | 'concluido' | 'cancelado';
  valor?: number;
  createdAt: string;
}

interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  agendamentoId?: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (userData: any) => boolean;
  clientes: Cliente[];
  addCliente: (cliente: Omit<Cliente, 'id' | 'createdAt'>) => void;
  editCliente: (id: string, cliente: Omit<Cliente, 'id' | 'createdAt'>) => void;
  deleteCliente: (id: string) => void;
  servicos: Servico[];
  addServico: (servico: Omit<Servico, 'id' | 'createdAt'>) => void;
  editServico: (id: string, servico: Omit<Servico, 'id' | 'createdAt'>) => void;
  deleteServico: (id: string) => void;
  produtos: Produto[];
  addProduto: (produto: Omit<Produto, 'id' | 'createdAt'>) => void;
  editProduto: (id: string, produto: Omit<Produto, 'id' | 'createdAt'>) => void;
  deleteProduto: (id: string) => void;
  agendamentos: Agendamento[];
  addAgendamento: (agendamento: Omit<Agendamento, 'id' | 'createdAt'>) => void;
  editAgendamento: (id: string, agendamento: Omit<Agendamento, 'id' | 'createdAt'>) => void;
  deleteAgendamento: (id: string) => void;
  transacoes: Transacao[];
  changePlano: (plano: 'autonomo' | 'basico' | 'premium') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // Load data from localStorage
  const loadFromStorage = (key: string, defaultValue: any) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  };

  const [user, setUser] = useState<User | null>(() => loadFromStorage('beleza_user', null));
  const [clientes, setClientes] = useState<Cliente[]>(() => loadFromStorage('beleza_clientes', []));
  const [servicos, setServicos] = useState<Servico[]>(() => loadFromStorage('beleza_servicos', []));
  const [produtos, setProdutos] = useState<Produto[]>(() => loadFromStorage('beleza_produtos', []));
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(() => loadFromStorage('beleza_agendamentos', []));
  const [transacoes, setTransacoes] = useState<Transacao[]>(() => loadFromStorage('beleza_transacoes', []));

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('beleza_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('beleza_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('beleza_servicos', JSON.stringify(servicos));
  }, [servicos]);

  useEffect(() => {
    localStorage.setItem('beleza_produtos', JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem('beleza_agendamentos', JSON.stringify(agendamentos));
  }, [agendamentos]);

  useEffect(() => {
    localStorage.setItem('beleza_transacoes', JSON.stringify(transacoes));
  }, [transacoes]);

  const login = (email: string, password: string): boolean => {
    // Simulate login validation
    if (email === 'teste@belezasmart.com' && password === 'senha123') {
      const userData: User = {
        id: '1',
        name: 'Salão Teste',
        email: email,
        plano: 'premium',
        testeGratuito: true,
        diasRestantes: 30
      };
      setUser(userData);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao BelezaSmart",
      });
      return true;
    }
    return false;
  };

  const register = (userData: any): boolean => {
    // Check if email already exists
    const existingUsers = loadFromStorage('beleza_registered_users', []);
    if (existingUsers.some((u: any) => u.email === userData.email)) {
      return false;
    }

    // Save new user
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      plano: userData.fromTest ? 'premium' : 'autonomo',
      testeGratuito: userData.fromTest || false,
      diasRestantes: userData.fromTest ? 30 : undefined
    };

    existingUsers.push(newUser);
    localStorage.setItem('beleza_registered_users', JSON.stringify(existingUsers));
    
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    // Clear user-specific data
    setClientes([]);
    setServicos([]);
    setProdutos([]);
    setAgendamentos([]);
    setTransacoes([]);
    localStorage.removeItem('beleza_clientes');
    localStorage.removeItem('beleza_servicos');
    localStorage.removeItem('beleza_produtos');
    localStorage.removeItem('beleza_agendamentos');
    localStorage.removeItem('beleza_transacoes');
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const addCliente = (cliente: Omit<Cliente, 'id' | 'createdAt'>) => {
    const newCliente: Cliente = {
      ...cliente,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setClientes(prev => [...prev, newCliente]);
    toast({
      title: "Cliente adicionado!",
      description: `${cliente.nome} foi cadastrado com sucesso.`,
    });
  };

  const editCliente = (id: string, clienteData: Omit<Cliente, 'id' | 'createdAt'>) => {
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...clienteData } : c));
    toast({
      title: "Cliente atualizado!",
      description: "As informações foram salvas com sucesso.",
    });
  };

  const deleteCliente = (id: string) => {
    const cliente = clientes.find(c => c.id === id);
    setClientes(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Cliente excluído!",
      description: `${cliente?.nome} foi removido com sucesso.`,
    });
  };

  const addServico = (servico: Omit<Servico, 'id' | 'createdAt'>) => {
    const newServico: Servico = {
      ...servico,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setServicos(prev => [...prev, newServico]);
    toast({
      title: "Serviço adicionado!",
      description: `${servico.nome} foi cadastrado com sucesso.`,
    });
  };

  const editServico = (id: string, servicoData: Omit<Servico, 'id' | 'createdAt'>) => {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ...servicoData } : s));
    toast({
      title: "Serviço atualizado!",
      description: "As informações foram salvas com sucesso.",
    });
  };

  const deleteServico = (id: string) => {
    const servico = servicos.find(s => s.id === id);
    setServicos(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Serviço excluído!",
      description: `${servico?.nome} foi removido com sucesso.`,
    });
  };

  const addProduto = (produto: Omit<Produto, 'id' | 'createdAt'>) => {
    const newProduto: Produto = {
      ...produto,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setProdutos(prev => [...prev, newProduto]);
    toast({
      title: "Produto adicionado!",
      description: `${produto.nome} foi cadastrado com sucesso.`,
    });
  };

  const editProduto = (id: string, produtoData: Omit<Produto, 'id' | 'createdAt'>) => {
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ...produtoData } : p));
    toast({
      title: "Produto atualizado!",
      description: "As informações foram salvas com sucesso.",
    });
  };

  const deleteProduto = (id: string) => {
    const produto = produtos.find(p => p.id === id);
    setProdutos(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Produto excluído!",
      description: `${produto?.nome} foi removido com sucesso.`,
    });
  };

  const addAgendamento = (agendamento: Omit<Agendamento, 'id' | 'createdAt'>) => {
    const newAgendamento: Agendamento = {
      ...agendamento,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setAgendamentos(prev => [...prev, newAgendamento]);
    
    // Add transaction if agendamento has value
    if (agendamento.valor) {
      const newTransacao: Transacao = {
        id: Date.now().toString() + '_trans',
        tipo: 'receita',
        descricao: `Agendamento: ${agendamento.servico} - ${agendamento.clienteNome}`,
        valor: agendamento.valor,
        data: agendamento.data,
        agendamentoId: newAgendamento.id
      };
      setTransacoes(prev => [...prev, newTransacao]);
    }
    
    toast({
      title: "Agendamento criado!",
      description: `Agendamento para ${agendamento.clienteNome} foi salvo.`,
    });
  };

  const editAgendamento = (id: string, agendamentoData: Omit<Agendamento, 'id' | 'createdAt'>) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, ...agendamentoData } : a));
    toast({
      title: "Agendamento atualizado!",
      description: "As informações foram salvas com sucesso.",
    });
  };

  const deleteAgendamento = (id: string) => {
    const agendamento = agendamentos.find(a => a.id === id);
    setAgendamentos(prev => prev.filter(a => a.id !== id));
    // Remove related transaction
    setTransacoes(prev => prev.filter(t => t.agendamentoId !== id));
    toast({
      title: "Agendamento excluído!",
      description: `Agendamento de ${agendamento?.clienteNome} foi removido.`,
    });
  };

  const changePlano = (plano: 'autonomo' | 'basico' | 'premium') => {
    setUser(prev => prev ? { ...prev, plano, testeGratuito: false, diasRestantes: undefined } : null);
    toast({
      title: "Plano alterado!",
      description: `Você agora está no plano ${plano.charAt(0).toUpperCase() + plano.slice(1)}.`,
    });
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      register,
      clientes,
      addCliente,
      editCliente,
      deleteCliente,
      servicos,
      addServico,
      editServico,
      deleteServico,
      produtos,
      addProduto,
      editProduto,
      deleteProduto,
      agendamentos,
      addAgendamento,
      editAgendamento,
      deleteAgendamento,
      transacoes,
      changePlano
    }}>
      {children}
    </AppContext.Provider>
  );
};
