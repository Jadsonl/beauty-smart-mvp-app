
import { useState, useEffect } from 'react';
import { supabase, type Profile, type Appointment, type Product, type ProductInventory } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export const useSupabase = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Buscar perfil do usuário
  const getProfile = async (): Promise<Profile | null> => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar perfil:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Criar ou atualizar perfil
  const upsertProfile = async (profileData: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...profileData,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Erro ao salvar perfil:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao salvar perfil:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar agendamentos
  const getAppointments = async (): Promise<Appointment[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar agendamentos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Criar agendamento
  const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          ...appointmentData,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Erro ao criar agendamento:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao criar agendamento:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar produtos
  const getProducts = async (): Promise<Product[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar produtos:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Buscar inventário
  const getInventory = async (): Promise<ProductInventory[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_inventory')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao buscar inventário:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar inventário:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getProfile,
    upsertProfile,
    getAppointments,
    createAppointment,
    getProducts,
    getInventory
  };
};
