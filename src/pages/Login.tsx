
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', login: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-pink-600 rounded-lg"></div>
            <span className="text-2xl font-bold text-pink-600">BelezaSmart</span>
          </div>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
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

          <div className="mt-6 space-y-4 text-center">
            <Link 
              to="/forgot-password" 
              className="text-sm text-pink-600 hover:text-pink-700 hover:underline"
            >
              Esqueci minha senha
            </Link>
            
            <div className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link 
                to="/register" 
                className="text-pink-600 hover:text-pink-700 hover:underline"
              >
                Criar conta
              </Link>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600">
              <p className="font-medium mb-1">Para testar o sistema:</p>
              <p>Crie uma conta ou use credenciais válidas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
