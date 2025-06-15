
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  business_type?: string;
  business_name?: string;
  address?: string;
  created_at?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user?.id) {
      console.warn('getProfile: Usuário não autenticado. Não será possível carregar perfil.');
      return null;
    }
    
    setLoading(true);
    console.log('getProfile: Iniciando busca para user_id:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('getProfile: Erro ao buscar perfil:', error);
        return null;
      }
      
      console.log('getProfile: Perfil encontrado:', data);
      return data;
    } catch (error) {
      console.error('getProfile: Erro inesperado:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (profileData: Partial<Profile>): Promise<boolean> => {
    if (!user?.id) {
      console.warn('updateProfile: Usuário não autenticado');
      return false;
    }
    
    setLoading(true);
    console.log('updateProfile: Iniciando atualização para user_id:', user.id);
    console.log('updateProfile: Dados recebidos do frontend:', profileData);
    
    // Verificar primeiro o schema da tabela profiles
    console.log('updateProfile: Verificando estrutura da tabela profiles...');
    
    try {
      // Primeiro verificar se o perfil já existe
      console.log('updateProfile: Verificando se perfil existe...');
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      console.log('updateProfile: Perfil existente encontrado:', existingProfile);
      
      if (selectError) {
        console.error('updateProfile: Erro na busca de perfil existente:', {
          message: selectError.message,
          details: selectError.details,
          hint: selectError.hint,
          code: selectError.code
        });
      }

      // Preparar dados apenas com as colunas que existem na tabela
      const dataToSave = {
        full_name: profileData.full_name || null,
        phone: profileData.phone || null,
        business_name: profileData.business_name || null,
        business_type: profileData.business_type || null,
      };
      
      console.log('updateProfile: Dados preparados para salvar (sem address):', dataToSave);

      let result;
      
      if (existingProfile) {
        // Atualizar perfil existente
        console.log('updateProfile: Atualizando perfil existente para id:', user.id);
        result = await supabase
          .from('profiles')
          .update(dataToSave)
          .eq('id', user.id)
          .select();
          
        console.log('updateProfile: Resultado da atualização:', result);
      } else {
        // Criar novo perfil
        console.log('updateProfile: Criando novo perfil');
        const newProfileData = {
          id: user.id,
          email: user.email!,
          ...dataToSave,
        };
        
        console.log('updateProfile: Dados para novo perfil:', newProfileData);
        
        result = await supabase
          .from('profiles')
          .insert(newProfileData)
          .select();
          
        console.log('updateProfile: Resultado da criação:', result);
      }
      
      if (result.error) {
        console.error('updateProfile: Erro COMPLETO do Supabase:', {
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code,
          stack: result.error.stack,
          full_error: result.error
        });
        return false;
      }
      
      console.log('updateProfile: Operação realizada com sucesso. Dados salvos:', result.data);
      return true;
    } catch (error) {
      console.error('updateProfile: Erro inesperado capturado:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        full_error: error
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    getProfile,
    updateProfile
  };
};
