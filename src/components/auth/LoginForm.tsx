
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import PasswordInput from './PasswordInput';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', login: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Carregar credenciais salvas ao inicializar o componente
  useEffect(() => {
    const savedCredentials = localStorage.getItem('belezaSmart_savedCredentials');
    if (savedCredentials) {
      try {
        const { email: savedEmail, rememberMe: savedRememberMe } = JSON.parse(savedCredentials);
        if (savedEmail && savedRememberMe) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Erro ao carregar credenciais salvas:', error);
        localStorage.removeItem('belezaSmart_savedCredentials');
      }
    }
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const cleanupAuthState = () => {
    // Remove todas as chaves relacionadas ao Supabase auth do localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove do sessionStorage também se necessário
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const saveCredentials = (email: string, remember: boolean) => {
    if (remember) {
      const credentialsToSave = {
        email,
        rememberMe: true,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('belezaSmart_savedCredentials', JSON.stringify(credentialsToSave));
    } else {
      localStorage.removeItem('belezaSmart_savedCredentials');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { email: '', password: '', login: '' };
    
    // Validate email
    if (!email) {
      newErrors.email = 'Por favor, insira seu e-mail.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Por favor, insira um e-mail válido.';
    }
    
    // Validate password
    if (!password) {
      newErrors.password = 'Por favor, insira sua senha.';
    }
    
    setErrors(newErrors);
    
    // If validation passes, attempt login
    if (!newErrors.email && !newErrors.password) {
      setIsSubmitting(true);
      
      try {
        console.log('Iniciando processo de login para:', email);
        
        // Limpar estado de autenticação anterior
        cleanupAuthState();
        
        // Tentar fazer logout global antes do login
        try {
          await supabase.auth.signOut({ scope: 'global' });
          console.log('Logout global realizado antes do login');
        } catch (err) {
          console.log('Não foi possível fazer logout (pode não haver sessão ativa):', err);
        }

        console.log('Tentando fazer login...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('Resposta do signInWithPassword:', { data, error });

        if (error) {
          console.error('Erro no login:', error);
          setErrors({ ...newErrors, login: 'E-mail ou senha inválidos. Por favor, tente novamente.' });
          setIsSubmitting(false);
        } else if (data && data.user) {
          console.log('Login bem-sucedido para usuário:', data.user.id, data.user.email);
          
          // Salvar credenciais se "Lembrar de mim" estiver marcado
          saveCredentials(email, rememberMe);
          
          // Navigation will happen automatically when user state changes
          navigate('/dashboard');
        } else {
          console.error('Resposta de login inesperada:', data);
          setErrors({ ...newErrors, login: 'Erro inesperado durante o login.' });
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Erro inesperado no login:', error);
        setErrors({ ...newErrors, login: 'Erro inesperado. Tente novamente.' });
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>
      
      <PasswordInput
        value={password}
        onChange={setPassword}
        error={errors.password}
        disabled={isSubmitting}
      />

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          disabled={isSubmitting}
        />
        <Label 
          htmlFor="rememberMe" 
          className="text-sm font-normal cursor-pointer"
        >
          Lembrar de mim na próxima visita
        </Label>
      </div>

      {errors.login && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.login}</p>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-pink-600 hover:bg-pink-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
};

export default LoginForm;
