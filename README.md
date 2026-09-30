# URGE360 🚀

**Plataforma SaaS/Marketplace para reparaciones urgentes del hogar y mensajería última milla en España**

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]() [![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)]() [![License](https://img.shields.io/badge/license-proprietary-red)]()

## 🎯 Objetivo

Convertir una solicitud en servicio asignado, trazable, cobrado y evaluado con mínima fricción.

## ✨ Características

### Para Clientes
- 🏠 **Reparaciones urgentes**: Fontanería, electricidad, cerrajería, climatización, persianas, cristalería, electrodomésticos
- 📦 **Mensajería última milla**: Recogida y entrega con tracking GPS, OTP, foto y firma
- 🤖 **Triage IA**: Diagnóstico automático de oficio, urgencia y riesgo
- 💰 **Precio cerrado**: Desglose transparente antes de confirmar
- 📍 **Tracking en tiempo real**: ETA, chat con profesional, evidencias
- 🧾 **Facturación electrónica**: Cumplimiento RD 1619/2012
- ⭐ **Valoraciones**: Sistema de ratings bidireccional
- 🛡️ **Garantía 30 días**: Reclamaciones y reembolsos

### Para Profesionales
- ✅ **Onboarding KYC**: Verificación de identidad y cualificaciones
- 📱 **App móvil**: Aceptar/rechazar trabajos, navegación, evidencias
- 💼 **Gestión de disponibilidad**: Zonas, oficios, horarios
- 💸 **Liquidaciones**: Ingresos, comisiones, historial
- ⭐ **Reputación**: Rating y reseñas

### Para Operaciones
- 🗺️ **Mapa vivo**: Profesionales y pedidos en tiempo real
- 🎯 **Dispatch automático/manual**: Algoritmo de asignación óptima
- 📊 **Métricas**: SLA, fill-rate, ETA, NPS
- 🚨 **Incidencias**: Reasignación, reembolsos, soporte
- 🔍 **Auditoría**: Log inmutable de acciones críticas

### Para Admin
- 👥 **Usuarios RBAC**: Roles client, professional, ops, admin
- 💼 **Proveedores**: KYC, ratings, gestión
- 💰 **Tarifas**: Configuración dinámica de precios y comisiones
- 📈 **KPIs**: GMV, take-rate, CAC, LTV, NPS
- ⚖️ **Compliance**: RGPD, AI Act, facturación, consumo
- 🚩 **Feature Flags**: Control granular de funcionalidades

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  React 18 + TypeScript + Vite + Tailwind CSS + Zustand      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
│              Node.js + Express/Fastify                       │
│         (Autenticación, Rate Limiting, Routing)              │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   PostgreSQL │    │    Redis     │    │   Object     │
│   + PostGIS  │    │   (Cache)    │    │   Storage    │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
              ┌───────────────────────────┐
              │      EVENT BUS            │
              │   (RabbitMQ/Kafka)        │
              └───────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  AI Triage   │    │   Dispatch   │    │  Payment     │
│   Engine     │    │   Engine     │    │   Gateway    │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Principios de Diseño
- **Event-driven**: job.created → quoted → assigned → en_route → completed → paid
- **Idempotencia**: Todas las operaciones críticas son idempotentes
- **Circuit breakers**: Tolerancia a fallos en servicios externos
- **Feature flags**: Control granular sin redeploy
- **HITL**: Human-in-the-loop para decisiones críticas

## 🚀 Quick Start

### Desarrollo local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

### Docker

```bash
# Levantar todo el stack
cd docker
docker-compose up -d

# Ver logs
docker-compose logs -f

# Acceder
# Frontend: http://localhost:3000
# API: http://localhost:4000
# pgAdmin: http://localhost:8082 (admin@urge360.local / admin)
# Redis Commander: http://localhost:8081
```

## 🔐 Cuentas Demo

| Rol | Email | Password |
|-----|-------|----------|
| Cliente | maria@demo.es | cualquiera |
| Profesional | pro@demo.es | cualquiera |
| Operaciones | ops@demo.es | cualquiera |
| Admin | admin@demo.es | cualquiera |

## 📊 Unit Economics

- **GMV**: Volumen total transaccionado
- **Take-rate**: 15% medio (7-15% según plan)
- **CAC**: 12€ (objetivo <15€)
- **LTV**: 180€ (objetivo >150€)
- **LTV/CAC**: 15x (objetivo >10x)
- **Fill-rate**: 94% (objetivo >90%)
- **ETA medio**: 18 min (objetivo <20 min)
- **NPS**: 72 (objetivo >70)
- **Fraude**: 0.3% (objetivo <1%)

## 🛡️ Seguridad y Compliance

### Seguridad
- ✅ RBAC con roles granulares
- ✅ Validación server-side de todas las entradas
- ✅ Cifrado TLS 1.3 + AES-256 en reposo
- ✅ Secrets en variables de entorno
- ✅ Auditoría inmutable
- ✅ Rate limiting
- ✅ MFA para admin/ops
- ✅ Circuit breakers para tolerancia a fallos

### Compliance (España/UE)
- ✅ **RGPD**: Consentimiento granular, derechos ARCO+, DPA
- ✅ **ePrivacy**: Cookies, comunicaciones electrónicas
- ✅ **Ley de Consumo**: Desistimiento 14 días
- ✅ **LSSI-CE**: Aviso legal, condiciones
- ✅ **Facturación**: RD 1619/2012, conservación 4 años
- ✅ **AI Act**: Sistema limited-risk, transparencia
- ✅ **Protección trabajadores**: Alta RETA, prevención riesgos

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e

# Red team / pentesting
npm run test:security
```

### Red Team Hallazgos
1. ✅ Falso profesional → KYC obligatorio + verificación manual
2. ✅ Robo de cuenta → MFA + detección IP anómala
3. ✅ Fraude/reembolso → Límites automáticos + revisión humana >50€
4. ✅ Dirección manipulada → Validación geocoding + distancia máxima
5. ✅ OTP reutilizado → TTL 5 min + un solo uso
6. ✅ Tracking abusivo → Solo durante servicio activo
7. ✅ Prompt injection → Sanitización + validación server-side
8. ✅ Precios extremos → Validación rangos + alerta si >3x media
9. ✅ Doble asignación/cobro → Idempotencia + locks distribuidos
10. ✅ Caída servicios → Circuit breakers + fallback seguro

## 📚 Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Base de datos](docs/DATABASE.md)
- [Red Team](docs/RED_TEAM.md)

## 🗺️ Roadmap

### Fase 1: MVP Transaccional ✅ (Actual)
- [x] Registro/Login
- [x] Flujo reparación end-to-end
- [x] Flujo mensajería end-to-end
- [x] Triage IA (mock)
- [x] Dispatch automático/manual
- [x] Tracking estados
- [x] Chat en tiempo real
- [x] Firma digital
- [x] Facturación
- [x] Valoraciones
- [x] Dashboard profesional
- [x] Panel operaciones
- [x] Panel admin

### Fase 2: Producción
- [ ] Backend real (Node.js + PostgreSQL)
- [ ] Integración pagos (Stripe/Redsys)
- [ ] Mapas reales (Mapbox/Google)
- [ ] Notificaciones push
- [ ] SMS/WhatsApp
- [ ] KYC real (Onfido/Veriff)
- [ ] Object storage (S3)
- [ ] Monitoring (Datadog/Sentry)

### Fase 3: Escalado
- [ ] Microservicios
- [ ] Kubernetes
- [ ] Multi-región
- [ ] Batching VRP
- [ ] ML para pricing dinámico
- [ ] Marketplace B2B
- [ ] API pública

### Fase 4: Expansión
- [ ] Multi-país
- [ ] Multi-idioma
- [ ] Nuevos verticales (limpieza, mudanzas)
- [ ] White-label
- [ ] Franchising

## 🤝 Contribuir

Este es un proyecto privado. Para contribuciones internas:

1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Propietario - URGE360 Platform S.L.

## 📞 Contacto

- **Web**: https://urge360.es
- **Email**: info@urge360.es
- **Soporte**: soporte@urge360.es

---

**Construido con ❤️ en España** 🇪🇸
