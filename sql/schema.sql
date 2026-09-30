-- URGE360 Database Schema
-- PostgreSQL 15+ with PostGIS

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== ENUMS =====
CREATE TYPE user_role AS ENUM ('client', 'professional', 'ops', 'admin');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE service_type AS ENUM ('repair', 'courier');
CREATE TYPE repair_category AS ENUM ('plumbing', 'electricity', 'locksmith', 'hvac', 'shutters', 'glazing', 'appliances', 'other');
CREATE TYPE urgency_level AS ENUM ('emergency', 'urgent', 'scheduled');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE order_status AS ENUM (
  'created', 'triaged', 'quoted', 'confirmed', 'assigned', 'en_route',
  'arrived', 'in_progress', 'picked_up', 'completed', 'delivered', 'paid',
  'rated', 'cancelled', 'refunded', 'disputed'
);
CREATE TYPE package_type AS ENUM ('small', 'medium', 'large', 'fragile', 'document');
CREATE TYPE priority_level AS ENUM ('standard', 'express', 'same_hour');
CREATE TYPE evidence_type AS ENUM ('photo', 'signature', 'otp', 'gps', 'note');
CREATE TYPE claim_type AS ENUM ('quality', 'delay', 'damage', 'overcharge', 'other');
CREATE TYPE claim_status AS ENUM ('pending', 'reviewing', 'resolved', 'rejected');

-- ===== TABLES =====

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  verified BOOLEAN DEFAULT FALSE,
  kyc_status kyc_status DEFAULT 'pending',
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  total_jobs INTEGER DEFAULT 0,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(100),
  street VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  country VARCHAR(2) DEFAULT 'ES',
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_location ON addresses USING GIST(location);

-- Professionals
CREATE TABLE professionals (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  trades repair_category[] NOT NULL DEFAULT '{}',
  zones VARCHAR(10)[], -- postal codes
  available BOOLEAN DEFAULT FALSE,
  current_location GEOGRAPHY(POINT, 4326),
  hourly_rate DECIMAL(10,2) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  kyc_documents JSONB, -- encrypted document references
  bank_account_encrypted TEXT, -- encrypted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_professionals_available ON professionals(available);
CREATE INDEX idx_professionals_location ON professionals USING GIST(current_location);
CREATE INDEX idx_professionals_trades ON professionals USING GIN(trades);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(255) UNIQUE,
  type service_type NOT NULL,
  status order_status NOT NULL DEFAULT 'created',
  client_id UUID REFERENCES users(id) NOT NULL,
  professional_id UUID REFERENCES users(id),
  address_id UUID REFERENCES addresses(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  notes TEXT
);

CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_professional ON orders(professional_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Repair Requests
CREATE TABLE repair_requests (
  order_id UUID PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  category repair_category NOT NULL,
  description TEXT NOT NULL,
  urgency urgency_level NOT NULL,
  photos TEXT[], -- URLs
  voice_note_url TEXT,
  ai_triage JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courier Requests
CREATE TABLE courier_requests (
  order_id UUID PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  pickup_address_id UUID REFERENCES addresses(id) NOT NULL,
  delivery_address_id UUID REFERENCES addresses(id) NOT NULL,
  package_type package_type NOT NULL,
  package_description TEXT NOT NULL,
  weight_kg DECIMAL(5,2),
  priority priority_level NOT NULL DEFAULT 'standard',
  otp_required BOOLEAN DEFAULT FALSE,
  photo_proof BOOLEAN DEFAULT FALSE,
  signature_proof BOOLEAN DEFAULT FALSE,
  instructions TEXT,
  window_start TIMESTAMPTZ,
  window_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Triage
CREATE TABLE ai_triages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  category repair_category NOT NULL,
  urgency urgency_level NOT NULL,
  risk risk_level NOT NULL,
  estimated_duration INTEGER NOT NULL, -- minutes
  materials TEXT[],
  required_skills TEXT[],
  safety_instructions TEXT[],
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  requires_human_review BOOLEAN DEFAULT FALSE,
  model_version VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing
CREATE TABLE order_prices (
  order_id UUID PRIMARY KEY REFERENCES orders(id) ON DELETE CASCADE,
  base DECIMAL(10,2) NOT NULL,
  distance DECIMAL(10,2) DEFAULT 0,
  time_cost DECIMAL(10,2) DEFAULT 0,
  category_cost DECIMAL(10,2) DEFAULT 0,
  urgency_cost DECIMAL(10,2) DEFAULT 0,
  extras DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'EUR',
  iva DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Events (State Machine)
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  actor_id UUID REFERENCES users(id),
  note TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_events_order ON order_events(order_id);
CREATE INDEX idx_order_events_created ON order_events(created_at DESC);

-- Evidences
CREATE TABLE evidences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  type evidence_type NOT NULL,
  url TEXT, -- signed URL
  data TEXT, -- OTP code, signature data
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  captured_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidences_order ON evidences(order_id);

-- Ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) NOT NULL, -- pending, processed, failed, refunded
  provider VARCHAR(50), -- stripe, redsys
  provider_ref VARCHAR(255),
  method VARCHAR(50), -- card, bizum, transfer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_order ON payments(order_id);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  client_id UUID REFERENCES users(id) NOT NULL,
  professional_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  fiscal_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_year ON invoices(fiscal_year);

-- Claims / Guarantees
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  client_id UUID REFERENCES users(id) NOT NULL,
  type claim_type NOT NULL,
  description TEXT NOT NULL,
  status claim_status DEFAULT 'pending',
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_claims_order ON claims(order_id);
CREATE INDEX idx_claims_status ON claims(status);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- text, system, image
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_order ON chat_messages(order_id);

-- Audit Log (Immutable)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- info, success, warning, error
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channel VARCHAR(50) DEFAULT 'in_app', -- in_app, email, sms, whatsapp, push
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_at);

-- Feature Flags
CREATE TABLE feature_flags (
  key VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  environment VARCHAR(50) DEFAULT 'production',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Dispatch Scores (for analytics)
CREATE TABLE dispatch_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES users(id),
  eta_minutes INTEGER,
  skill_match DECIMAL(3,2),
  availability DECIMAL(3,2),
  zone_match DECIMAL(3,2),
  sla_score DECIMAL(3,2),
  load_score DECIMAL(3,2),
  quality_score DECIMAL(3,2),
  cost_score DECIMAL(3,2),
  total_score DECIMAL(5,2),
  selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dispatch_scores_order ON dispatch_scores(order_id);

-- ===== TRIGGERS =====

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===== ROW LEVEL SECURITY =====

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Clients can see their own data
CREATE POLICY client_own_data ON users
  FOR ALL USING (id = current_setting('app.current_user_id')::UUID);

CREATE POLICY client_own_orders ON orders
  FOR ALL USING (client_id = current_setting('app.current_user_id')::UUID);

-- Professionals can see assigned orders
CREATE POLICY professional_assigned_orders ON orders
  FOR SELECT USING (professional_id = current_setting('app.current_user_id')::UUID);

-- Admin/Ops can see everything
CREATE POLICY admin_see_all ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::UUID AND role IN ('admin', 'ops'))
  );

-- ===== SEED DATA =====

-- Feature flags
INSERT INTO feature_flags (key, name, description, enabled, environment) VALUES
  ('ai_triage_v2', 'AI Triage v2', 'Nueva versión del motor de triage', true, 'production'),
  ('batch_dispatch', 'Dispatch por lotes', 'Optimización VRP para mensajería', false, 'staging'),
  ('voice_input', 'Entrada por voz', 'Descripción mediante nota de voz', true, 'production'),
  ('subscription_plans', 'Planes suscripción', 'Suscripciones mensuales', false, 'development'),
  ('real_time_tracking', 'Tracking tiempo real', 'GPS cada 5 segundos', true, 'production');
