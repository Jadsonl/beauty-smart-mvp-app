
-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    nome text NOT NULL,
    telefone text,
    email text,
    created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS public.services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    nome text NOT NULL,
    preco numeric NOT NULL,
    duracao text,
    created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela de transações financeiras
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    descricao text NOT NULL,
    valor numeric NOT NULL,
    data date NOT NULL,
    agendamento_id uuid,
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS e criar políticas para clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own clients" ON public.clients;
CREATE POLICY "Users can manage their own clients"
ON public.clients FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Habilitar RLS e criar políticas para services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own services" ON public.services;
CREATE POLICY "Users can manage their own services"
ON public.services FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Habilitar RLS e criar políticas para transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.transactions;
CREATE POLICY "Users can manage their own transactions"
ON public.transactions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Habilitar RLS e criar políticas para appointments (já existe)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own appointments" ON public.appointments;
CREATE POLICY "Users can manage their own appointments"
ON public.appointments FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Habilitar RLS e criar políticas para products (já existe)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own products" ON public.products;
CREATE POLICY "Users can manage their own products"
ON public.products FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Habilitar RLS e criar políticas para product_inventory (já existe)
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own product_inventory" ON public.product_inventory;
CREATE POLICY "Users can manage their own product_inventory"
ON public.product_inventory FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
