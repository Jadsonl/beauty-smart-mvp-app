
-- Criar tabela de profissionais
CREATE TABLE IF NOT EXISTS public.professionals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS e criar políticas para professionals
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own professionals"
ON public.professionals FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Adicionar novas colunas à tabela appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id),
ADD COLUMN IF NOT EXISTS service_value_at_appointment numeric,
ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES public.professionals(id);

-- Atualizar a coluna status se ela não existir ou não tiver valor padrão
ALTER TABLE public.appointments 
ALTER COLUMN status SET DEFAULT 'scheduled';

-- Função para criar transação quando agendamento for concluído
CREATE OR REPLACE FUNCTION public.create_transaction_on_appointment_completion()
RETURNS TRIGGER AS $$
DECLARE
    service_name text;
BEGIN
    -- Verificar se o status foi alterado para 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Buscar o nome do serviço
        SELECT nome INTO service_name 
        FROM public.services 
        WHERE id = NEW.service_id;
        
        -- Criar transação de receita
        INSERT INTO public.transactions (
            user_id,
            tipo,
            descricao,
            valor,
            data,
            agendamento_id
        ) VALUES (
            NEW.user_id,
            'receita',
            COALESCE('Serviço concluído: ' || service_name, 'Serviço concluído'),
            COALESCE(NEW.service_value_at_appointment, 0),
            NEW.date,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para automatizar criação de transação
DROP TRIGGER IF EXISTS appointment_completion_trigger ON public.appointments;
CREATE TRIGGER appointment_completion_trigger
    AFTER UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.create_transaction_on_appointment_completion();
