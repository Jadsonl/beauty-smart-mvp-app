
-- Criar tabela para tokens de confirmação temporários
CREATE TABLE public.confirmation_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  appointment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS à tabela confirmation_tokens
ALTER TABLE public.confirmation_tokens ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários criem tokens para seus próprios agendamentos
CREATE POLICY "Users can create confirmation tokens for their appointments" 
  ON public.confirmation_tokens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários vejam seus próprios tokens
CREATE POLICY "Users can view their own confirmation tokens" 
  ON public.confirmation_tokens 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Criar índice para performance na busca por token
CREATE INDEX idx_confirmation_tokens_token ON public.confirmation_tokens(token);
CREATE INDEX idx_confirmation_tokens_appointment_id ON public.confirmation_tokens(appointment_id);

-- Criar função para limpeza automática de tokens expirados (opcional)
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM public.confirmation_tokens 
  WHERE expires_at < now() OR used_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
