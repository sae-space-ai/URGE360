# URGE360 - Database Documentation

## Overview

**Motor**: PostgreSQL 15+ con PostGIS  
**Ubicación**: `sql/schema.sql`  
**Conexión**: `postgresql://urge360:secret@localhost:5432/urge360`

## Tablas Principales

### users
Almacena todos los usuarios de la plataforma (clientes, profesionales, ops, admin).

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  verified BOOLEAN DEFAULT FALSE,
  kyc_status kyc_status DEFAULT 'pending',
  rating DECIMAL(2,1),
  total_jobs INTEGER DEFAULT 0,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**
- `idx_users_email` - Búsqueda por email
- `idx_users_role` - Filtrado por rol

### orders
Tabla central que almacena todos los pedidos (reparaciones y mensajería).

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key VARCHAR(255) UNIQUE,
  type service_type NOT NULL,
  status order_status NOT NULL DEFAULT 'created',
  client_id UUID REFERENCES users(id),
  professional_id UUID REFERENCES users(id),
  address_id UUID REFERENCES addresses(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

**Índices:**
- `idx_orders_client` - Pedidos de un cliente
- `idx_orders_professional` - Pedidos asignados a profesional
- `idx_orders_status` - Filtrado por estado
- `idx_orders_created` - Ordenación por fecha

### professionals
Datos específicos de profesionales (trades, zonas, disponibilidad).

```sql
CREATE TABLE professionals (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  trades repair_category[] NOT NULL,
  zones VARCHAR(10)[],
  available BOOLEAN DEFAULT FALSE,
  current_location GEOGRAPHY(POINT, 4326),
  hourly_rate DECIMAL(10,2) NOT NULL,
  rating DECIMAL(2,1) DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0
);
```

**Índices:**
- `idx_professionals_available` - Profesionales disponibles
- `idx_professionals_location` - Búsqueda geoespacial (PostGIS)
- `idx_professionals_trades` - Búsqueda por oficios (GIN)

### repair_requests
Detalles específicos de pedidos de reparación.

```sql
CREATE TABLE repair_requests (
  order_id UUID PRIMARY KEY REFERENCES orders(id),
  category repair_category NOT NULL,
  description TEXT NOT NULL,
  urgency urgency_level NOT NULL,
  photos TEXT[],
  voice_note_url TEXT,
  ai_triage JSONB
);
```

### courier_requests
Detalles específicos de pedidos de mensajería.

```sql
CREATE TABLE courier_requests (
  order_id UUID PRIMARY KEY REFERENCES orders(id),
  pickup_address_id UUID REFERENCES addresses(id),
  delivery_address_id UUID REFERENCES addresses(id),
  package_type package_type NOT NULL,
  package_description TEXT NOT NULL,
  priority priority_level NOT NULL,
  otp_required BOOLEAN DEFAULT FALSE,
  photo_proof BOOLEAN DEFAULT FALSE,
  signature_proof BOOLEAN DEFAULT FALSE
);
```

### order_events
Log inmutable de todos los cambios de estado (máquina de estados).

```sql
CREATE TABLE order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  status order_status NOT NULL,
  actor_id UUID REFERENCES users(id),
  note TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**
- `idx_order_events_order` - Eventos de un pedido
- `idx_order_events_created` - Ordenación cronológica

### evidences
Fotos, firmas, OTPs y otras pruebas de entrega/ejecución.

```sql
CREATE TABLE evidences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  type evidence_type NOT NULL,
  url TEXT,
  data TEXT,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  captured_by UUID REFERENCES users(id)
);
```

### payments
Registro de todos los pagos procesados.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID UNIQUE REFERENCES orders(id),
  amount DECIMAL(10,2) NOT NULL,
  currency CHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) NOT NULL,
  provider VARCHAR(50),
  provider_ref VARCHAR(255),
  method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
```

### invoices
Facturas electrónicas (cumplimiento RD 1619/2012).

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  client_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  iva DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  fiscal_year INTEGER NOT NULL
);
```

### audit_logs
Log inmutable de todas las acciones críticas (seguridad).

```sql
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
```

**Índices:**
- `idx_audit_logs_actor` - Acciones de un usuario
- `idx_audit_logs_action` - Filtrado por tipo de acción
- `idx_audit_logs_created` - Ordenación cronológica

## Relaciones

```
users (1) ──────< orders (N)
users (1) ──────< professionals (1)
orders (1) ──────< order_events (N)
orders (1) ──────< evidences (N)
orders (1) ──────< payments (1)
orders (1) ──────< invoices (1)
orders (1) ──────< chat_messages (N)
orders (1) ──────< claims (N)
users (1) ──────< addresses (N)
users (1) ──────< notifications (N)
```

## Tipos Personalizados (Enums)

```sql
user_role: 'client', 'professional', 'ops', 'admin'
service_type: 'repair', 'courier'
repair_category: 'plumbing', 'electricity', 'locksmith', 'hvac', 'shutters', 'glazing', 'appliances', 'other'
urgency_level: 'emergency', 'urgent', 'scheduled'
risk_level: 'low', 'medium', 'high', 'critical'
order_status: 'created', 'triaged', 'quoted', 'confirmed', 'assigned', 'en_route', 'arrived', 'in_progress', 'picked_up', 'completed', 'delivered', 'paid', 'rated', 'cancelled', 'refunded', 'disputed'
```

## Seguridad

### Row Level Security (RLS)
```sql
-- Clientes solo ven sus propios datos
CREATE POLICY client_own_data ON users
  FOR ALL USING (id = current_setting('app.current_user_id')::UUID);

-- Profesionales ven pedidos asignados
CREATE POLICY professional_assigned_orders ON orders
  FOR SELECT USING (professional_id = current_setting('app.current_user_id')::UUID);

-- Admin/Ops ven todo
CREATE POLICY admin_see_all ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::UUID AND role IN ('admin', 'ops'))
  );
```

### Cifrado
- **Tránsito**: TLS 1.3 obligatorio
- **Reposo**: AES-256 para datos sensibles (PII, pagos)
- **Secrets**: Variables de entorno, nunca en código

### Auditoría
- Todas las acciones críticas se registran en `audit_logs`
- Tabla inmutable (no DELETE, no UPDATE)
- Retención mínima: 4 años (cumplimiento fiscal)

## Backups

### Estrategia
- **Full backup**: Diario a las 02:00 UTC
- **WAL archiving**: Continuo (point-in-time recovery)
- **Retención**: 30 días
- **Offsite**: S3 con cifrado

### Restauración
```bash
# Restaurar desde backup
pg_restore -d urge360 backup.dump

# Point-in-time recovery
pg_ctl -D /var/lib/postgresql/data recovery.conf
```

## Migraciones

### Herramienta
Usamos `node-pg-migrate` para migraciones versionadas.

### Ejemplo
```bash
# Crear migración
npm run migrate:create add_new_column

# Ejecutar migraciones
npm run migrate:up

# Rollback
npm run migrate:down
```

## Performance

### Índices Críticos
- Geoespaciales (PostGIS) para búsqueda de profesionales cercanos
- GIN para arrays (trades, zones)
- B-tree para fechas y IDs

### Queries Optimizadas
```sql
-- Buscar profesionales cercanos con oficio específico
SELECT p.*, u.name, u.rating,
  ST_Distance(p.current_location, ST_MakePoint(:lng, :lat)::geography) as distance
FROM professionals p
JOIN users u ON p.user_id = u.id
WHERE p.available = true
  AND :trade = ANY(p.trades)
  AND ST_DWithin(p.current_location, ST_MakePoint(:lng, :lat)::geography, 5000)
ORDER BY distance
LIMIT 10;
```

### Connection Pooling
- **PgBouncer**: 100 conexiones máx
- **Pool size**: 20 por instancia
- **Timeout**: 30s

## Monitoring

### Métricas Clave
- Queries por segundo
- Tiempo medio de respuesta
- Conexiones activas
- Cache hit ratio
- Deadlocks
- Slow queries (>1s)

### Alertas
- Query time >5s
- Connection pool >80%
- Replication lag >10s
- Disk usage >80%

## Compliance

### RGPD
- **Derecho al olvido**: Soft delete + anonymization
- **Portabilidad**: Export en JSON/CSV
- **Rectificación**: UPDATE con auditoría
- **Acceso**: SELECT con RLS

### Retención
- **Datos personales**: Mientras cuenta activa + 2 años
- **Facturas**: 4 años (obligación fiscal)
- **Audit logs**: 4 años
- **Evidencias**: 1 año tras completado

## Disaster Recovery

### RPO (Recovery Point Objective)
- **Objetivo**: <1 hora
- **Real**: ~5 minutos (WAL archiving)

### RTO (Recovery Time Objective)
- **Objetivo**: <4 horas
- **Real**: ~2 horas (procedimiento documentado)

### Testing
- DR drill trimestral
- Backup restore test mensual
- Failover test semestral
