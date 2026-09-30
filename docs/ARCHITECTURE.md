# URGE360 - Arquitectura y Decisiones Técnicas

## 1. Arquitectura y Decisiones

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v4
- **Estado**: Zustand (ligero, escalable, sin boilerplate)
- **Routing**: React Router v6
- **Backend (diseño)**: Node.js + Express/Fastify + PostgreSQL/PostGIS + Redis
- **Infraestructura**: Docker + Kubernetes (preparado)

### Decisiones Clave
1. **SPA con estado local**: MVP funcional sin backend real, pero preparado para conectar APIs
2. **Zustand sobre Redux**: Menos boilerplate, mejor DX, suficiente para nuestro caso
3. **Tailwind v4**: Utility-first, consistente, rápido
4. **TypeScript estricto**: Seguridad de tipos en todo el código
5. **Componentes modulares**: Reutilizables y testeables

### Principios de Diseño
- **Event-driven**: job.created → quoted → assigned → en_route → arrived → working/picked_up → completed/delivered → paid
- **Idempotencia**: Todas las operaciones críticas son idempotentes
- **CQRS ligero**: Separación lectura/escritura en el store
- **Feature flags**: Control granular de funcionalidades
- **Circuit breakers**: Tolerancia a fallos en servicios externos

## 2. Journeys y UX

### Cliente
1. **Landing** → Registro/Login
2. **Dashboard** → "Necesito ayuda ahora" o "Enviar paquete"
3. **Flujo reparación**: Categoría → Descripción (texto/voz/foto) → Triage IA → Precio → Confirmar → Tracking → Pago → Valoración
4. **Flujo mensajería**: Origen/Destino → Tipo paquete → Prioridad → Precio → Confirmar → OTP → Tracking → Firma → Pago
5. **Post-servicio**: Factura, Garantía/Reclamación, Historial

### Profesional
1. **Onboarding**: KYC, documentación, zonas, oficios
2. **Dashboard**: Disponibilidad, trabajos pendientes, activos, completados
3. **Ejecución**: Aceptar → En camino → Llegado → Trabajando → Completado (con evidencias)
4. **Ingresos**: Liquidaciones semanales, historial

### Operaciones
1. **Mapa vivo**: Profesionales, pedidos activos
2. **Dispatch**: Manual o automático
3. **Incidencias**: Reasignación, reembolsos, soporte
4. **Métricas**: SLA, fill-rate, ETA, NPS

### Admin
1. **Overview**: KPIs, GMV, comisión
2. **Usuarios**: RBAC, verificación
3. **Proveedores**: KYC, ratings
4. **Tarifas**: Configuración dinámica
5. **Compliance**: RGPD, AI Act, facturación
6. **Auditoría**: Log inmutable

## 3. Modelo de Datos

### Entidades Principales
```typescript
User {
  id, email, name, phone, role, verified, kycStatus, rating, totalJobs, createdAt
}

Order {
  id, type, status, clientId, professionalId, createdAt, updatedAt
  repair?: RepairRequest
  courier?: CourierRequest
  triage?: AITriage
  price?: PriceBreakdown
  eta?: number
  events: OrderEvent[]
  evidences: Evidence[]
  rating?: Rating
}

Professional {
  userId, trades[], zones[], available, currentLat, currentLng
  rating, completedJobs, hourlyRate, kycStatus
}
```

### Estados (Máquina de Estados)
```
REPARACIÓN:
created → triaged → quoted → confirmed → assigned → en_route → arrived → in_progress → completed → paid → rated

MENSAJERÍA:
created → quoted → confirmed → assigned → en_route → arrived → picked_up → delivered → paid → rated
```

## 4. APIs y Eventos

### Endpoints (diseño)
```
POST /api/auth/login
POST /api/auth/register
GET /api/orders
POST /api/orders/repair
POST /api/orders/courier
PATCH /api/orders/:id/status
POST /api/orders/:id/dispatch
POST /api/orders/:id/evidence
POST /api/orders/:id/rate
GET /api/professionals
GET /api/users/me
POST /api/invoices/:orderId
POST /api/claims
```

### Eventos (Event Bus)
```
order.created
order.triaged
order.quoted
order.confirmed
order.assigned
order.en_route
order.arrived
order.in_progress
order.completed
order.delivered
order.paid
order.rated
order.cancelled
professional.location_updated
notification.sent
payment.processed
```

## 5. IA y Agentes

### Agentes Especializados
1. **Intake/Triage**: Clasifica oficio, urgencia, riesgo
2. **Diagnóstico Visual**: Analiza fotos (mock)
3. **Presupuestos**: Calcula precio con incertidumbre
4. **Dispatch**: Asigna profesional óptimo
5. **Routing**: Optimiza rutas (VRP)
6. **Atención**: Chat automatizado
7. **Técnico-Copilot**: Guía al profesional
8. **Courier-Copilot**: Guía al repartidor
9. **Fraude/Riesgo**: Detecta anomalías
10. **Calidad**: Monitoriza ratings
11. **Growth**: Analiza métricas
12. **Ops**: Soporte operativo

### Reglas Críticas
- **HITL (Human-in-the-Loop)**: Emergencias, reembolsos >50€, decisiones de riesgo
- **Determinista**: Precios, asignaciones, validaciones
- **LLM solo como sugerencia**: Nunca decisión final sin validación

## 6. Motores

### DispatchScore
```typescript
score = ETA * 0.2 + (1 - skill_match) * 0.25 + (1 - availability) * 0.2 + 
        (1 - zone) * 0.05 + (1 - sla) * 0.1 + (1 - load) * 0.05 + 
        (1 - quality) * 0.1 + (1 - cost) * 0.05
```

### Pricing
```typescript
repair: base + time_cost + urgency_surcharge
courier: base + distance_cost + time_cost + priority_surcharge + size_extra
```

### Routing (VRP)
- Algoritmo de Clarke-Wright para batching
- Time windows y restricciones de capacidad
- Optimización multi-objetivo (tiempo, coste, SLA)

## 7. Seguridad y Compliance

### Seguridad
- **RBAC**: Roles client, professional, ops, admin
- **Validación server-side**: Todas las entradas
- **Cifrado**: TLS 1.3, AES-256 en reposo
- **Secrets**: Variables de entorno, nunca en código
- **Auditoría**: Log inmutable de acciones críticas
- **Rate limiting**: Protección contra abuso
- **MFA**: Obligatorio para admin/ops

### Compliance (España/UE)
- **RGPD**: Consentimiento granular, derechos ARCO+, DPA
- **ePrivacy**: Cookies, comunicaciones electrónicas
- **Ley de Consumo**: Desistimiento 14 días, información precontractual
- **LSSI-CE**: Aviso legal, condiciones
- **Facturación**: RD 1619/2012, conservación 4 años
- **AI Act**: Sistema limited-risk, transparencia
- **Protección trabajadores**: Alta RETA, prevención riesgos

## 8. Monetización y KPIs

### Ingresos
- **Comisión**: 15% por servicio (básico), 10% (Pro), 7% (Enterprise)
- **Tarifas**: Base + urgencia + envío
- **Planes**: Suscripción profesional (29€/mes Pro)
- **B2B**: Contratos enterprise custom

### Unit Economics
- **GMV**: Volumen total transaccionado
- **Take-rate**: 15% medio
- **Margen contribución**: ~40% tras costes variables
- **CAC**: 12€ (objetivo <15€)
- **LTV**: 180€ (objetivo >150€)
- **LTV/CAC**: 15x (objetivo >10x)
- **Fill-rate**: 94% (objetivo >90%)
- **ETA medio**: 18 min (objetivo <20 min)
- **NPS**: 72 (objetivo >70)
- **Fraude**: 0.3% (objetivo <1%)

## 9. Estructura Repositorio

```
urge360/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── Chat.tsx
│   │   ├── Signature.tsx
│   │   ├── Invoice.tsx
│   │   ├── HealthChecks.tsx
│   │   ├── FeatureFlags.tsx
│   │   ├── GuaranteeClaim.tsx
│   │   └── CircuitBreaker.tsx
│   ├── pages/           # Páginas principales
│   │   ├── Landing.tsx
│   │   ├── Auth.tsx
│   │   ├── ClientDashboard.tsx
│   │   ├── ProDashboard.tsx
│   │   ├── OpsDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── store/           # Estado global
│   │   └── useStore.ts
│   ├── types/           # Tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── manifest.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   └── RED_TEAM.md
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── sql/
│   └── schema.sql
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
└── README.md
```

## 10. Implementación por Fases

### Fase 1: MVP Transaccional (Actual)
- ✅ Registro/Login
- ✅ Flujo reparación end-to-end
- ✅ Flujo mensajería end-to-end
- ✅ Triage IA (mock)
- ✅ Dispatch automático/manual
- ✅ Tracking estados
- ✅ Chat en tiempo real
- ✅ Firma digital
- ✅ Facturación
- ✅ Valoraciones
- ✅ Dashboard profesional
- ✅ Panel operaciones
- ✅ Panel admin

### Fase 2: Producción
- Backend real (Node.js + PostgreSQL)
- Integración pagos (Stripe/Redsys)
- Mapas reales (Mapbox/Google)
- Notificaciones push
- SMS/WhatsApp
- KYC real (Onfido/Veriff)
- Object storage (S3)
- Monitoring (Datadog/Sentry)

### Fase 3: Escalado
- Microservicios
- Kubernetes
- Multi-región
- Batching VRP
- ML para pricing dinámico
- Marketplace B2B
- API pública

### Fase 4: Expansión
- Multi-país
- Multi-idioma
- Nuevos verticales (limpieza, mudanzas)
- White-label
- Franchising

## 11. Tests y Red Team

### Cobertura de Tests
- **Unit**: Motores (pricing, dispatch, triage)
- **Integration**: Flujos end-to-end
- **E2E**: Cypress/Playwright
- **Performance**: Load testing (k6)
- **Security**: OWASP ZAP, manual pentesting

### Red Team (Hallazgos y Controles)
1. **Falso profesional**: KYC obligatorio + verificación manual
2. **Robo de cuenta**: MFA + detección de IP anómala
3. **Fraude/reembolso**: Límites automáticos + revisión humana >50€
4. **Dirección manipulada**: Validación geocoding + distancia máxima
5. **OTP reutilizado**: TTL 5 min + un solo uso
6. **Tracking abusivo**: Solo durante servicio activo
7. **Prompt injection**: Sanitización + validación server-side
8. **Precios extremos**: Validación rangos + alerta si >3x media
9. **Doble asignación/cobro**: Idempotencia + locks distribuidos
10. **Caída mapas/pagos/LLM**: Circuit breakers + fallback seguro
11. **Carrera de estados**: Optimistic locking + validación transiciones
12. **Pérdida conectividad**: Queue + retry + sincronización offline
13. **Fuga entre tenants**: Row-level security + validación ownership
14. **Abuso privilegios**: RBAC estricto + auditoría + MFA admin

## 12. Criterios de Aceptación

### Funcionales
- ✅ Completar flujo reparación end-to-end
- ✅ Completar flujo mensajería end-to-end
- ✅ Separación clara reparación/mensajería
- ✅ Asignación automática + manual
- ✅ Estados en tiempo real
- ✅ Pagos abstractos (preparado para integrar)
- ✅ Evidencias (foto, firma, OTP)
- ✅ Trazabilidad completa (eventos)
- ✅ Recuperación ante fallos (circuit breakers)
- ✅ Administración completa

### No Funcionales
- ✅ Responsive (mobile-first)
- ✅ PWA-ready (manifest.json)
- ✅ Accesibilidad (ARIA, contraste)
- ✅ Performance (<3s load)
- ✅ Seguridad (RBAC, validación, auditoría)
- ✅ Compliance (RGPD, AI Act, facturación)
- ✅ Escalabilidad (arquitectura preparada)
- ✅ Mantenibilidad (TypeScript, componentes)
- ✅ Testeabilidad (lógica separada de UI)
- ✅ Documentación (arquitectura, API, DB)

### Crítico
- ✅ Ninguna función crítica depende exclusivamente de LLM
- ✅ Reglas deterministas para acciones económicas/peligrosas
- ✅ HITL para decisiones de alto riesgo
- ✅ Fallback seguro ante fallos de servicios externos
- ✅ Datos sensibles cifrados y separados
- ✅ Auditoría inmutable de acciones críticas
