
-- Adicionar coluna professional_id na tabela transactions para rastrear qual profissional realizou o serviço
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES public.professionals(id);

-- Atualizar a função que cria transações quando agendamentos são concluídos
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
        
        -- Criar transação de receita com descrição limpa e professional_id
        INSERT INTO public.transactions (
            user_id,
            tipo,
            descricao,
            valor,
            data,
            agendamento_id,
            professional_id
        ) VALUES (
            NEW.user_id,
            'receita',
            COALESCE(service_name, 'Serviço concluído'),
            COALESCE(NEW.service_value_at_appointment, 0),
            NEW.date,
            NEW.id,
            NEW.professional_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar políticas RLS para a nova coluna professional_id na tabela transactions
-- (As políticas existentes já cobrem isso, mas é bom garantir)
