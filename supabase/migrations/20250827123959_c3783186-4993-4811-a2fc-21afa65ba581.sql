-- Adicionar campos para melhorias na gestão financeira
ALTER TABLE transactions 
ADD COLUMN client_id uuid REFERENCES clients(id),
ADD COLUMN nome text;

-- Adicionar campo fornecedor na tabela products
ALTER TABLE products 
ADD COLUMN supplier_name text;