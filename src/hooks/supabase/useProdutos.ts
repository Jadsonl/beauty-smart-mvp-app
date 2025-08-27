
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Produto {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  unit?: string;
  min_stock_level?: number;
  supplier_name?: string;
  created_at?: string;
}

export interface ProdutoInventory {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  min_stock: number;
  cost_per_unit?: number;
  updated_at?: string;
}

export const useProdutos = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getProdutos = useCallback(async (): Promise<Produto[]> => {
    if (!user?.id) {
      console.warn('getProdutos: Usuário não autenticado. Não será possível carregar produtos.');
      return [];
    }
    
    setLoading(true);
    console.log('getProdutos: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('getProdutos: Erro ao buscar produtos:', error);
        return [];
      }
      
      console.log('getProdutos: Produtos encontrados:', data);
      return data || [];
    } catch (error) {
      console.error('getProdutos: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addProduto = useCallback(async (produtoData: Omit<Produto, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('addProduto: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('addProduto: Adicionando produto para user_id:', user.id, 'dados:', produtoData);
    
    try {
      const { error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          ...produtoData
        });
      
      if (error) {
        console.error('addProduto: Erro ao criar produto:', error);
        return false;
      }
      
      console.log('addProduto: Produto criado com sucesso');
      return true;
    } catch (error) {
      console.error('addProduto: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProduto = useCallback(async (id: string, produtoData: Partial<Produto>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('updateProduto: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('updateProduto: Atualizando produto', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('products')
        .update(produtoData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('updateProduto: Erro ao atualizar produto:', error);
        return false;
      }
      
      console.log('updateProduto: Produto atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('updateProduto: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteProduto = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('deleteProduto: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('deleteProduto: Deletando produto', id, 'para user_id:', user.id);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('deleteProduto: Erro ao deletar produto:', error);
        return false;
      }
      
      console.log('deleteProduto: Produto deletado com sucesso');
      return true;
    } catch (error) {
      console.error('deleteProduto: Erro inesperado:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getInventory = useCallback(async (): Promise<ProdutoInventory[]> => {
    if (!user?.id) {
      console.warn('getInventory: Usuário não autenticado. Não será possível carregar inventário.');
      return [];
    }
    
    setLoading(true);
    console.log('getInventory: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('getInventory: Erro ao buscar inventário:', error);
        return [];
      }
      
      console.log('getInventory: Inventário encontrado:', data);
      return data || [];
    } catch (error) {
      console.error('getInventory: Erro inesperado:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    getProdutos,
    addProduto,
    updateProduto,
    deleteProduto,
    getInventory
  };
};
