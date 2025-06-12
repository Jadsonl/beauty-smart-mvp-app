
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
    { value: 'manicure', label: 'Manicure/Pedicure' },
    { value: 'makeup', label: 'Maquiador(a)' },
    { value: 'hairdresser', label: 'Cabeleireiro(a)' },
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
  const isPasswordValid = Object.values(passwordCriteria).some(Boolean) && formData.password.length >= 6;

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
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
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
        console.log('Register: Iniciando processo de cadastro para:', formData.email);
        
        cleanupAuthState();
        
        try {
          await supabase.auth.signOut({ scope: 'global' });
          console.log('Register: Logout global realizado antes do cadastro');
        } catch (err) {
          console.log('Register: Não foi possível fazer logout (pode não haver sessão ativa):', err);
        }

        console.log('Register: Criando conta com signUp...');
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

        console.log('Register: Resposta do signUp:', { data: data?.user?.email, error: error?.message });

        if (error) {
          console.error('Register: Erro no signUp:', error);
          setErrors(prev => ({ ...prev, register: error.message }));
          setIsSubmitting(false);
          return;
        }

        if (data && data.user) {
          console.log('Register: Usuário criado com sucesso:', data.user.id, data.user.email);
          
          console.log('Register: Salvando dados do perfil...');
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
            console.error('Register: Erro ao salvar perfil:', profileError);
            toast.error('Conta criada, mas erro ao salvar perfil. Você pode atualizar depois.');
          } else {
            console.log('Register: Perfil salvo com sucesso!');
          }

          if (isTestMode) {
            toast.success('Teste gratuito iniciado com sucesso!');
          } else {
            toast.success('Conta criada com sucesso!');
          }

          if (data.session) {
            console.log('Register: Sessão ativa detectada, redirecionando para dashboard...');
            navigate('/dashboard');
          } else {
            console.log('Register: Sessão não ativa (confirmação de email pode ser necessária)');
            navigate('/dashboard');
          }
        } else if (data && data.session === null) {
          console.log('Register: Cadastro realizado, mas requer confirmação de email');
          toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
          navigate('/login');
        } else {
          console.error('Register: Resposta de cadastro inesperada:', data);
          setErrors(prev => ({ ...prev, register: 'Erro inesperado durante o cadastro.' }));
          setIsSubmitting(false);
        }

      } catch (error) {
        console.error('Register: Erro inesperado no registro:', error);
        setErrors(prev => ({ ...prev, register: 'Erro inesperado. Tente novamente.' }));
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                BelezaSmart
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-gray-900">
              {isTestMode ? 'Iniciar Teste Gratuito' : 'Criar Conta'}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              {isTestMode 
                ? '30 dias de acesso premium gratuito' 
                : 'Cadastre-se para acessar a plataforma'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isTestMode && (
              <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl">
                <h3 className="font-bold text-pink-800 mb-2 text-sm flex items-center gap-2">
                  🎉 Teste Premium Gratuito!
                </h3>
                <p className="text-xs sm:text-sm text-pink-700">
                  Você terá acesso completo ao plano Premium por 30 dias, sem compromisso.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Nome Completo *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={cn(
                    "transition-colors",
                    errors.fullName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-pink-500'
                  )}
                  disabled={isSubmitting}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="text-sm font-medium">Tipo de Negócio *</Label>
                  <Select 
                    value={formData.businessType} 
                    onValueChange={(value) => handleInputChange('businessType', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={cn(
                      "transition-colors",
                      errors.businessType ? 'border-red-300' : 'border-gray-300 focus:border-pink-500'
                    )}>
                      <SelectValue placeholder="Selecione" />
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
                    <p className="text-xs text-red-600">{errors.businessType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={cn(
                      "transition-colors",
                      errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-pink-500'
                    )}
                    disabled={isSubmitting}
                    maxLength={15}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-medium">Nome do Negócio *</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Nome do seu salão/estabelecimento"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className={cn(
                    "transition-colors",
                    errors.businessName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-pink-500'
                  )}
                  disabled={isSubmitting}
                />
                {errors.businessName && (
                  <p className="text-xs text-red-600">{errors.businessName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn(
                    "transition-colors",
                    errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-pink-500'
                  )}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={cn(
                        "pr-10 transition-colors",
                        errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-pink-500'
                      )}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600">{errors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={cn(
                        "pr-10 transition-colors",
                        errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-pink-500'
                      )}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {formData.password && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700">Critérios da senha:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <div className="flex items-center space-x-2">
                      <Check 
                        size={12} 
                        className={cn(
                          passwordCriteria.length ? 'text-green-500' : 'text-gray-400'
                        )} 
                      />
                      <span className={cn(
                        'text-xs',
                        passwordCriteria.length ? 'text-green-700' : 'text-gray-600'
                      )}>
                        6+ caracteres
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check 
                        size={12} 
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
                  </div>
                </div>
              )}

              {errors.register && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600">{errors.register}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Criando conta...
                  </div>
                ) : (
                  isTestMode ? 'Iniciar Teste Gratuito' : 'Criar Conta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="text-pink-600 hover:text-pink-700 hover:underline font-medium transition-colors"
              >
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
