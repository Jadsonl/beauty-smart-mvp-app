-- Corrigir search_path nas funções para resolver alertas de segurança
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.confirmation_tokens 
  WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_transaction_on_appointment_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;