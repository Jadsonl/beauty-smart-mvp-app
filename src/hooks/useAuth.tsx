
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('useAuth: Obtendo sessão inicial...');
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('useAuth: Erro ao obter sessão inicial:', error);
      } else {
        console.log('useAuth: Sessão inicial:', session?.user?.email || 'Nenhuma sessão');
        setUser(session?.user || null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Mudança de estado de autenticação:', event, session?.user?.email || 'Nenhum usuário');
        
        setUser(session?.user || null);
        
        // Only set loading to false after handling the auth state change
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('useAuth: Tentando fazer login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('useAuth: Resposta do signInWithPassword:', { data: data?.user?.email, error: error?.message });

      if (error) {
        console.error('useAuth: Erro de login:', error);
        setLoading(false);
        return { error: 'E-mail ou senha inválidos. Por favor, tente novamente.' };
      }

      console.log('useAuth: Login bem-sucedido para:', data?.user?.email);
      return {};
    } catch (error) {
      console.error('useAuth: Erro inesperado no login:', error);
      setLoading(false);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('useAuth: Tentando cadastrar usuário:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('useAuth: Resposta do signUp:', { data: data?.user?.email, error: error?.message });

      if (error) {
        console.error('useAuth: Erro no cadastro:', error);
        setLoading(false);
        return { error: error.message };
      }

      console.log('useAuth: Cadastro bem-sucedido para:', data?.user?.email);
      return {};
    } catch (error) {
      console.error('useAuth: Erro inesperado no cadastro:', error);
      setLoading(false);
      return { error: 'Erro inesperado. Tente novamente.' };
    }
  };

  const signOut = async () => {
    try {
      console.log('useAuth: Fazendo logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('useAuth: Erro no logout:', error);
      } else {
        console.log('useAuth: Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('useAuth: Erro inesperado no logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
