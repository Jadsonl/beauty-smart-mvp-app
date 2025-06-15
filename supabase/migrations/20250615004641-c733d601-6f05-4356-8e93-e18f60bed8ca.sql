
-- Verificar se a coluna professional_id já existe na tabela transactions
-- Se não existir, será adicionada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'professional_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.transactions 
        ADD COLUMN professional_id uuid REFERENCES public.professionals(id);
    END IF;
END $$;

-- Atualizar a função que cria transações quando agendamentos são concluídos
-- para incluir professional_id e usar descrição limpa (apenas nome do serviço)
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
        
        -- Criar transação de receita com descrição limpa (apenas nome do serviço) e professional_id
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

-- Adicionar políticas RLS para appointments se não existirem
DO $$
BEGIN
    -- Política para SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'appointments' 
        AND policyname = 'Users can manage their own appointments'
    ) THEN
        CREATE POLICY "Users can manage their own appointments"
        ON public.appointments FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Habilitar RLS se não estiver habilitado
    ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
END $$;

-- Adicionar políticas RLS para transactions se não existirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'transactions' 
        AND policyname = 'Users can manage their own transactions'
    ) THEN
        CREATE POLICY "Users can manage their own transactions"
        ON public.transactions FOR ALL
        TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    -- Habilitar RLS se não estiver habilitado
    ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
END $$;
