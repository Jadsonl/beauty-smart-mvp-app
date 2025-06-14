
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, insira seu e-mail.');
      return;
    }
    
    if (!validateEmail(email)) {
      toast.error('Por favor, insira um e-mail válido.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Erro ao enviar e-mail de recuperação:', error);
        toast.error('Erro ao enviar e-mail de recuperação. Verifique o endereço e tente novamente.');
      } else {
        setEmailSent(true);
        toast.success('E-mail de recuperação enviado com sucesso!');
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-pink-600 rounded-lg"></div>
              <span className="text-2xl font-bold text-pink-600">BelezaSmart</span>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <CardTitle className="text-2xl text-green-600">E-mail Enviado!</CardTitle>
            <CardDescription>
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600">
                Enviamos as instruções para: <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Não recebeu o e-mail? Verifique sua pasta de spam ou tente novamente.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                Voltar para o Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-pink-600 rounded-lg"></div>
            <span className="text-2xl font-bold text-pink-600">BelezaSmart</span>
          </div>
          <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu e-mail para receber as instruções de recuperação de senha
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
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-pink-600 hover:bg-pink-700"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Instruções'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-pink-600 hover:text-pink-700 hover:underline"
            >
              Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
