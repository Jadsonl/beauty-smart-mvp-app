
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Register = () => {
  const [searchParams] = useSearchParams();
  const isTestMode = searchParams.get('test') === 'true';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    register: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordCriteria = (password: string) => {
    return {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const passwordCriteria = getPasswordCriteria(formData.password);
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      register: ''
    };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Por favor, insira seu nome completo.';
    }
    
    if (!formData.email) {
      newErrors.email = 'Por favor, insira seu e-mail.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor, insira um e-mail válido.';
    }
    
    if (!formData.password) {
      newErrors.password = 'Por favor, insira uma senha.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirme sua senha.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }
    
    setErrors(newErrors);
    
    if (!Object.values(newErrors).some(error => error)) {
      setIsSubmitting(true);
      
      const { error } = await signUp(formData.email, formData.password);
      
      if (error) {
        setErrors(prev => ({ ...prev, register: error }));
        setIsSubmitting(false);
      } else {
        navigate('/dashboard');
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
          <CardTitle className="text-2xl">
            {isTestMode ? 'Iniciar Teste Gratuito' : 'Criar Conta'}
          </CardTitle>
          <CardDescription>
            {isTestMode 
              ? '30 dias de acesso premium gratuito' 
              : 'Cadastre-se para acessar a plataforma'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTestMode && (
            <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
              <h3 className="font-semibold text-pink-800 mb-2">🎉 Teste Premium Gratuito!</h3>
              <p className="text-sm text-pink-700">
                Você terá acesso completo ao plano Premium por 30 dias, sem compromisso.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo / Razão Social</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome ou nome do salão"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {formData.password && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Critérios da senha:</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Check 
                      size={16} 
                      className={cn(
                        passwordCriteria.length ? 'text-green-500' : 'text-gray-400'
                      )} 
                    />
                    <span className={cn(
                      'text-sm',
                      passwordCriteria.length ? 'text-green-700' : 'text-gray-600'
                    )}>
                      Pelo menos 6 caracteres
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check 
                      size={16} 
                      className={cn(
                        passwordCriteria.uppercase ? 'text-green-500' : 'text-gray-400'
                      )} 
                    />
                    <span className={cn(
                      'text-sm',
                      passwordCriteria.uppercase ? 'text-green-700' : 'text-gray-600'
                    )}>
                      Uma letra maiúscula
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check 
                      size={16} 
                      className={cn(
                        passwordCriteria.lowercase ? 'text-green-500' : 'text-gray-400'
                      )} 
                    />
                    <span className={cn(
                      'text-sm',
                      passwordCriteria.lowercase ? 'text-green-700' : 'text-gray-600'
                    )}>
                      Uma letra minúscula
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check 
                      size={16} 
                      className={cn(
                        passwordCriteria.number ? 'text-green-500' : 'text-gray-400'
                      )} 
                    />
                    <span className={cn(
                      'text-sm',
                      passwordCriteria.number ? 'text-green-700' : 'text-gray-600'
                    )}>
                      Um número
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check 
                      size={16} 
                      className={cn(
                        passwordCriteria.special ? 'text-green-500' : 'text-gray-400'
                      )} 
                    />
                    <span className={cn(
                      'text-sm',
                      passwordCriteria.special ? 'text-green-700' : 'text-gray-600'
                    )}>
                      Um caractere especial
                    </span>
                  </div>
                </div>
              </div>
            )}

            {errors.register && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.register}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-pink-600 hover:bg-pink-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : (isTestMode ? 'Iniciar Teste Gratuito' : 'Criar Conta')}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link 
              to="/login" 
              className="text-pink-600 hover:text-pink-700 hover:underline"
            >
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
