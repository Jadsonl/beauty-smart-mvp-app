
-- Remover a constraint existente se ela existir
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Criar nova constraint que aceita os valores em inglês que o código está usando
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled'));

-- Atualizar registros existentes com status em português para inglês
UPDATE public.appointments 
SET status = CASE 
    WHEN status = 'Agendado' THEN 'scheduled'
    WHEN status = 'Confirmado' THEN 'confirmed' 
    WHEN status = 'Concluído' OR status = 'Concluido' THEN 'completed'
    WHEN status = 'Cancelado' THEN 'cancelled'
    ELSE status
END
WHERE status IN ('Agendado', 'Confirmado', 'Concluído', 'Concluido', 'Cancelado');
