-- Adicionar campo date_of_birth na tabela professionals
ALTER TABLE public.professionals 
ADD COLUMN date_of_birth DATE;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.professionals.date_of_birth IS 'Data de nascimento do profissional para lembretes de aniversário';