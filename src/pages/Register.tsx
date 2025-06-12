
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Register = () => {
  const [searchParams] = useSearchParams();
  const isTestMode = searchParams.get('test') === 'true';
  
  const [formData, setFormData] = useState({
    fullName: '',
    businessType: '',
    businessName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    businessType: '',
    businessName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    register: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const businessTypes = [
    { value: 'salon', label: 'Salão de Beleza' },
    { value: 'barbershop', label: 'Barbearia' },
    { value: 'clinic', label: 'Clínica Estética' },
    { value: 'spa', label: 'Spa' },
    { value: 'freelancer', label: 'Profissional Autônomo' },
    { value: 'other', label: 'Outro' }
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone) || phone.length >= 10;
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

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      const match = numbers.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (match) {
        return !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
      }
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    handleInputChange('phone', formatted);
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
    
    const newErrors = {
      fullName: '',
      businessType: '',
      businessName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      register: ''
    };
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Por favor, insira seu nome completo.';
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Por favor, selecione o tipo de negócio.';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Por favor, insira o nome do seu negócio.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Por favor, insira seu telefone.';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Por favor, insira um telefone válido.';
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
      
      try {
        console.log('Iniciando processo de cadastro para:', formData.email);
        
        // Limpar estado de autenticação anterior para evitar sessões conflitantes
        cleanupAuthState();
        
        // Tentar fazer logout global antes do cadastro
        try {
          await supabase.auth.signOut({ scope: 'global' });
          console.log('Logout global realizado antes do cadastro');
        } catch (err) {
          console.log('Não foi possível fazer logout (pode não haver sessão ativa):', err);
        }

        // Criar conta no Supabase Auth com dados adicionais nos metadados
        console.log('Criando conta com signUp...');
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName,
              business_type: formData.businessType,
              business_name: formData.businessName,
              phone: formData.phone
            }
          }
        });

        console.log('Resposta do signUp:', { data, error });

        if (error) {
          console.error('Erro no signUp:', error);
          setErrors(prev => ({ ...prev, register: error.message }));
          setIsSubmitting(false);
          return;
        }

        // Verificar se o usuário foi criado com sucesso
        if (data && data.user) {
          console.log('Usuário criado com sucesso:', data.user.id, data.user.email);
          
          // Salvar dados do perfil na tabela profiles
          console.log('Salvando dados do perfil...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: formData.email,
              full_name: formData.fullName,
              business_type: formData.businessType,
              business_name: formData.businessName,
              phone: formData.phone
            });

          if (profileError) {
            console.error('Erro ao salvar perfil:', profileError);
            toast.error('Conta criada, mas erro ao salvar perfil. Você pode atualizar depois.');
          } else {
            console.log('Perfil salvo com sucesso!');
          }

          // Exibir mensagem de sucesso
          if (isTestMode) {
            toast.success('Teste gratuito iniciado com sucesso!');
          } else {
            toast.success('Conta criada com sucesso!');
          }

          // Verificar se há sessão ativa para redirecionar
          if (data.session) {
            console.log('Sessão ativa detectada, redirecionando para dashboard...');
            navigate('/dashboard');
          } else {
            console.log('Sessão não ativa (confirmação de email pode ser necessária)');
            // Redirecionar mesmo assim para o dashboard ou página de verificação
            navigate('/dashboard');
          }
        } else if (data && data.session === null) {
          console.log('Cadastro realizado, mas requer confirmação de email');
          toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
          navigate('/login');
        } else {
          console.error('Resposta de cadastro inesperada:', data);
          setErrors(prev => ({ ...prev, register: 'Erro inesperado durante o cadastro.' }));
          setIsSubmitting(false);
        }

      } catch (error) {
        console.error('Erro inesperado no registro:', error);
        setErrors(prev => ({ ...prev, register: 'Erro inesperado. Tente novamente.' }));
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
            <span className="text-xl sm:text-2xl font-bold text-pink-600">BelezaSmart</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl">
            {isTestMode ? 'Iniciar Teste Gratuito' : 'Criar Conta'}
          </CardTitle>
          <CardDescription className="text-sm">
            {isTestMode 
              ? '30 dias de acesso premium gratuito' 
              : 'Cadastre-se para acessar a plataforma'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTestMode && (
            <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
              <h3 className="font-semibold text-pink-800 mb-2 text-sm">🎉 Teste Premium Gratuito!</h3>
              <p className="text-xs sm:text-sm text-pink-700">
                Você terá acesso completo ao plano Premium por 30 dias, sem compromisso.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm">Nome Completo *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={errors.fullName ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-sm">Tipo de Negócio *</Label>
              <Select 
                value={formData.businessType} 
                onValueChange={(value) => handleInputChange('businessType', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.businessType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo de negócio" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessType && (
                <p className="text-xs text-red-500">{errors.businessType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm">Nome do Negócio *</Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Nome do seu salão/estabelecimento"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className={errors.businessName ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.businessName && (
                <p className="text-xs text-red-500">{errors.businessName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={errors.phone ? 'border-red-500' : ''}
                disabled={isSubmitting}
                maxLength={15}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">E-mail *</Label>
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
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Senha *</Label>
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
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">Confirmar Senha *</Label>
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
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {formData.password && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Critérios da senha:</p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Check 
                      size={14} 
                      className={cn(
                        passwordCriteria.length ? 'text-green-500' : 'text-gray-400'
                      )} 
                    />
                    <span className={cn(
                      'text-xs',
                      passwordCriteria.length ? 'text-green-700' : 'text-gray-600'
                    )}>
                      Pelo menos 6 caracteres
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check 
                      size={14} 
                      className={cn(
                        passwordCriteria.uppercase ? 'text-green-500' : 'text-gray-400'
                      )} 
                    />
                    <span className={cn(
                      'text-xs',
                      passwordCriteria.uppercase ? 'text-green-700' : 'text-gray-600'
                    )}>
                      Uma letra maiúscula
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check 
                      size={14} 
                      className={cn(
                        passwordCriteria.lowercase ? 'text-green-500' : 'text-gray-400'
                      )} 
                    />
                    <span className={cn(
                      'text-xs',
                      passwordCriteria.lowercase ? 'text-green-700' : 'text-gray-600'
                    )}>
                      Uma letra minúscula
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check 
                      size={14} 
                      className={cn(
                        passwordCriteria.number ? 'text-green-500' : 'text-gray-400'
                      )} 
                    />
                    <span className={cn(
                      'text-xs',
                      passwordCriteria.number ? 'text-green-700' : 'text-gray-600'
                    )}>
                      Um número
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check 
                      size={14} 
                      className={cn(
                        passwordCriteria.special ? 'text-green-500' : 'text-gray-400'
                      )} 
                    />
                    <span className={cn(
                      'text-xs',
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
                <p className="text-xs text-red-600">{errors.register}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-pink-600 hover:bg-pink-700 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : (isTestMode ? 'Iniciar Teste Gratuito' : 'Criar Conta')}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs sm:text-sm text-gray-600">
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
