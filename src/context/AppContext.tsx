import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Tipos para as novas tabelas
export interface Agendamento {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

export interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracao?: string;
}

export interface Transacao {
  id: string;
  tipo: 'receita' | 'despesa';
  descricao: string;
  valor: number;
  data: string;
  agendamentoId?: string;
}

export interface Produto {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  unit?: string;
  min_stock_level?: number;
}

export interface ProdutoInventory {
  id: string;
  product_id: string;
  quantity: number;
  min_stock: number;
  cost_per_unit?: number;
}

interface AppContextType {
  // Clientes
  clientes: Cliente[];
  addCliente: (cliente: Omit<Cliente, 'id'>) => void;
  editCliente: (id: string, cliente: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  
  // Serviços
  servicos: Servico[];
  addServico: (servico: Omit<Servico, 'id'>) => void;
  editServico: (id: string, servico: Partial<Servico>) => void;
  deleteServico: (id: string) => void;
  
  // Transações
  transacoes: Transacao[];
  addTransacao: (transacao: Omit<Transacao, 'id'>) => void;
  
  // Produtos
  produtos: Produto[];
  addProduto: (produto: Omit<Produto, 'id'>) => void;
  editProduto: (id: string, produto: Partial<Produto>) => void;
  deleteProduto: (id: string) => void;
  
  // Inventário
  inventory: ProdutoInventory[];
  updateInventory: (productId: string, quantity: number, minStock: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Estados para clientes, serviços, transações, produtos e inventário
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [inventory, setInventory] = useState<ProdutoInventory[]>([]);

  // Carregar dados do localStorage quando o usuário estiver logado
  useEffect(() => {
    if (user?.id) {
      console.log('AppContext: Carregando dados do localStorage para usuário:', user.id);
      
      // Carregar clientes
      const clientesKey = `clientes_${user.id}`;
      const clientesStorage = localStorage.getItem(clientesKey);
      if (clientesStorage) {
        setClientes(JSON.parse(clientesStorage));
      }

      // Carregar serviços
      const servicosKey = `servicos_${user.id}`;
      const servicosStorage = localStorage.getItem(servicosKey);
      if (servicosStorage) {
        setServicos(JSON.parse(servicosStorage));
      }

      // Carregar transações
      const transacoesKey = `transacoes_${user.id}`;
      const transacoesStorage = localStorage.getItem(transacoesKey);
      if (transacoesStorage) {
        setTransacoes(JSON.parse(transacoesStorage));
      }

      // Carregar produtos
      const produtosKey = `produtos_${user.id}`;
      const produtosStorage = localStorage.getItem(produtosKey);
      if (produtosStorage) {
        setProdutos(JSON.parse(produtosStorage));
      }

      // Carregar inventário
      const inventoryKey = `inventory_${user.id}`;
      const inventoryStorage = localStorage.getItem(inventoryKey);
      if (inventoryStorage) {
        setInventory(JSON.parse(inventoryStorage));
      }
    } else {
      // Limpar dados quando não há usuário logado
      setClientes([]);
      setServicos([]);
      setTransacoes([]);
      setProdutos([]);
      setInventory([]);
    }
  }, [user?.id]);

  // Funções para gerenciar clientes
  const addCliente = (cliente: Omit<Cliente, 'id'>) => {
    const novoCliente = { ...cliente, id: Date.now().toString() };
    const novosClientes = [...clientes, novoCliente];
    setClientes(novosClientes);
    if (user?.id) {
      localStorage.setItem(`clientes_${user.id}`, JSON.stringify(novosClientes));
    }
  };

  const editCliente = (id: string, clienteData: Partial<Cliente>) => {
    const novosClientes = clientes.map(cliente => 
      cliente.id === id ? { ...cliente, ...clienteData } : cliente
    );
    setClientes(novosClientes);
    if (user?.id) {
      localStorage.setItem(`clientes_${user.id}`, JSON.stringify(novosClientes));
    }
  };

  const deleteCliente = (id: string) => {
    const novosClientes = clientes.filter(cliente => cliente.id !== id);
    setClientes(novosClientes);
    if (user?.id) {
      localStorage.setItem(`clientes_${user.id}`, JSON.stringify(novosClientes));
    }
  };

  // Funções para gerenciar serviços
  const addServico = (servico: Omit<Servico, 'id'>) => {
    const novoServico = { ...servico, id: Date.now().toString() };
    const novosServicos = [...servicos, novoServico];
    setServicos(novosServicos);
    if (user?.id) {
      localStorage.setItem(`servicos_${user.id}`, JSON.stringify(novosServicos));
    }
  };

  const editServico = (id: string, servicoData: Partial<Servico>) => {
    const novosServicos = servicos.map(servico => 
      servico.id === id ? { ...servico, ...servicoData } : servico
    );
    setServicos(novosServicos);
    if (user?.id) {
      localStorage.setItem(`servicos_${user.id}`, JSON.stringify(novosServicos));
    }
  };

  const deleteServico = (id: string) => {
    const novosServicos = servicos.filter(servico => servico.id !== id);
    setServicos(novosServicos);
    if (user?.id) {
      localStorage.setItem(`servicos_${user.id}`, JSON.stringify(novosServicos));
    }
  };

  // Função para adicionar transação
  const addTransacao = (transacao: Omit<Transacao, 'id'>) => {
    const novaTransacao = { ...transacao, id: Date.now().toString() };
    const novasTransacoes = [...transacoes, novaTransacao];
    setTransacoes(novasTransacoes);
    if (user?.id) {
      localStorage.setItem(`transacoes_${user.id}`, JSON.stringify(novasTransacoes));
    }
  };

  // Funções para gerenciar produtos
  const addProduto = (produto: Omit<Produto, 'id'>) => {
    const novoProduto = { ...produto, id: Date.now().toString() };
    const novosProdutos = [...produtos, novoProduto];
    setProdutos(novosProdutos);
    if (user?.id) {
      localStorage.setItem(`produtos_${user.id}`, JSON.stringify(novosProdutos));
    }
  };

  const editProduto = (id: string, produtoData: Partial<Produto>) => {
    const novosProdutos = produtos.map(produto => 
      produto.id === id ? { ...produto, ...produtoData } : produto
    );
    setProdutos(novosProdutos);
    if (user?.id) {
      localStorage.setItem(`produtos_${user.id}`, JSON.stringify(novosProdutos));
    }
  };

  const deleteProduto = (id: string) => {
    const novosProdutos = produtos.filter(produto => produto.id !== id);
    setProdutos(novosProdutos);
    if (user?.id) {
      localStorage.setItem(`produtos_${user.id}`, JSON.stringify(novosProdutos));
    }
  };

  // Função para atualizar inventário
  const updateInventory = (productId: string, quantity: number, minStock: number) => {
    const inventoryItem = inventory.find(item => item.product_id === productId);
    
    if (inventoryItem) {
      const novoInventory = inventory.map(item =>
        item.product_id === productId 
          ? { ...item, quantity, min_stock: minStock }
          : item
      );
      setInventory(novoInventory);
      if (user?.id) {
        localStorage.setItem(`inventory_${user.id}`, JSON.stringify(novoInventory));
      }
    } else {
      const novoItem: ProdutoInventory = {
        id: Date.now().toString(),
        product_id: productId,
        quantity,
        min_stock: minStock,
        cost_per_unit: 0
      };
      const novoInventory = [...inventory, novoItem];
      setInventory(novoInventory);
      if (user?.id) {
        localStorage.setItem(`inventory_${user.id}`, JSON.stringify(novoInventory));
      }
    }
  };

  return (
    <AppContext.Provider value={{
      // Clientes
      clientes,
      addCliente,
      editCliente,
      deleteCliente,
      
      // Serviços
      servicos,
      addServico,
      editServico,
      deleteServico,
      
      // Transações
      transacoes,
      addTransacao,
      
      // Produtos
      produtos,
      addProduto,
      editProduto,
      deleteProduto,
      
      // Inventário
      inventory,
      updateInventory,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
