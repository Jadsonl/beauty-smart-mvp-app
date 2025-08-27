
import { useState, useEffect } from 'react';
import { useClientes, type Cliente } from '@/hooks/supabase/useClientes';

export const useAniversariantes = () => {
  const { getClientes, getAniversariantes } = useClientes();
  const [aniversariantesDoDia, setAniversariantesDoDia] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  const getAniversariantesDoDia = async () => {
    setLoading(true);
    try {
      const clientes = await getClientes();
      const hoje = new Date();
      const diaHoje = hoje.getDate();
      const mesHoje = hoje.getMonth() + 1;

      console.log('useAniversariantes: Buscando aniversariantes para dia', diaHoje, 'mês', mesHoje);

      const aniversariantesHoje = clientes.filter(cliente => {
        if (!cliente.date_of_birth) return false;
        
        const nascimento = new Date(cliente.date_of_birth);
        const diaNascimento = nascimento.getDate();
        const mesNascimento = nascimento.getMonth() + 1;
        
        return diaNascimento === diaHoje && mesNascimento === mesHoje;
      });

      console.log('useAniversariantes: Aniversariantes encontrados:', aniversariantesHoje);
      setAniversariantesDoDia(aniversariantesHoje);
      return aniversariantesHoje;
    } catch (error) {
      console.error('useAniversariantes: Erro ao buscar aniversariantes do dia:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneForWhatsApp = (phone: string): string => {
    if (!phone) return '';
    
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Se já tem código do país (55), mantém
    if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
      return `+${cleanPhone}`;
    }
    
    // Se tem 11 dígitos (DDD + número), adiciona código do país
    if (cleanPhone.length === 11) {
      return `+55${cleanPhone}`;
    }
    
    // Se tem 10 dígitos, adiciona 9 após o DDD e código do país
    if (cleanPhone.length === 10) {
      return `+55${cleanPhone.slice(0, 2)}9${cleanPhone.slice(2)}`;
    }
    
    console.warn('Formato de telefone não reconhecido:', phone);
    return `+${cleanPhone}`;
  };

  const createBirthdayWhatsAppLink = (cliente: Cliente): string => {
    if (!cliente.telefone) {
      console.warn('Cliente sem telefone:', cliente.nome);
      return '';
    }

    const numeroCliente = formatPhoneForWhatsApp(cliente.telefone);
    const nomeCliente = cliente.nome;
    
    const mensagem = `Feliz Aniversário, ${nomeCliente}!
Hoje é um dia muito especial, e não poderíamos deixar de desejar a você muita saúde, felicidade, amor e realizações. Que seu novo ciclo seja cheio de momentos incríveis, alegrias e conquistas.

Agradecemos por sua confiança e por fazer parte da nossa história.

Com carinho,
Dai Lopes`;

    const mensagemCodificada = encodeURIComponent(mensagem);
    
    // Detectar se é iOS para usar esquema apropriado
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      const phoneWithoutPlus = numeroCliente.replace('+', '');
      return `whatsapp://send?phone=${phoneWithoutPlus}&text=${mensagemCodificada}`;
    } else {
      return `https://wa.me/${numeroCliente}?text=${mensagemCodificada}`;
    }
  };

  useEffect(() => {
    getAniversariantesDoDia();
  }, []);

  return {
    aniversariantesDoDia,
    loading,
    getAniversariantesDoDia,
    createBirthdayWhatsAppLink
  };
};
