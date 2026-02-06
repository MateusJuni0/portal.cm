-- SETUP DATABASE - COZINHA INTELIGENTE V5.0 (SaaS Ready)
-- Execute este script no seu PostgreSQL

-- 1. Estrutura de Tenancy
CREATE TABLE IF NOT EXISTS tenants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name text NOT NULL,
    owner_email text UNIQUE NOT NULL,
    plan_level text DEFAULT 'BASIC',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_configs (
    tenant_id uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    whatsapp_number text,
    whatsapp_token text,
    whatsapp_phone_id text,
    opening_hours jsonb,
    low_stock_threshold numeric DEFAULT 0.2,
    ai_enabled boolean DEFAULT true,
    timezone text DEFAULT 'Europe/London'
);

-- 2. Gestão de Pedidos
CREATE TABLE IF NOT EXISTS production_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES tenants(id),
    external_order_id text,
    source_channel text, -- iFood, UberEats, POS, Site
    idempotency_key text UNIQUE,
    status text DEFAULT 'RECEIVED', -- RECEIVED, PREPARING, READY, DELIVERED, CANCELED
    priority text DEFAULT 'NORMAL', -- NORMAL, VIP, URGENT
    sla_minutes integer DEFAULT 45,
    customer_name text,
    customer_phone text,
    total_amount numeric(10,2),
    raw_payload jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS production_order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES production_orders(id) ON DELETE CASCADE,
    sku text,
    product_name text,
    quantity numeric DEFAULT 1,
    unit text,
    unit_price numeric(10,2),
    sector text, -- Cozinha, Bar, Churrasqueira
    notes text
);

-- 3. Inventário e Receitas (Ficha Técnica)
CREATE TABLE IF NOT EXISTS inventory_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES tenants(id),
    name text,
    sku text,
    current_stock numeric DEFAULT 0,
    min_stock numeric DEFAULT 0,
    unit text,
    expiry_date date,
    last_update timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid REFERENCES tenants(id),
    product_sku text,
    product_name text
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
    inventory_item_id uuid REFERENCES inventory_items(id),
    quantity numeric,
    unit text
);

-- 4. Monitorização e Logs
CREATE TABLE IF NOT EXISTS order_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES production_orders(id),
    event_type text,
    payload jsonb,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflow_failures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name text,
    step_name text,
    payload jsonb,
    error_message text,
    status text DEFAULT 'PENDING', -- PENDING, RETRYING, RESOLVED, DEAD
    retry_count integer DEFAULT 0,
    next_retry_at timestamptz,
    created_at timestamptz DEFAULT now()
);