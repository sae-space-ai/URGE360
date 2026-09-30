import { create } from 'zustand';
import type {
  User, Order, OrderStatus, OrderEvent, Evidence, Professional,
  RepairRequest, CourierRequest, AITriage, PriceBreakdown,
  RepairCategory, Urgency, Address, AuditLog, Notification, DispatchScore
} from '../types';

// ===== Seed Data =====
const seedUsers: User[] = [
  { id: 'u1', email: 'maria@demo.es', name: 'María García', phone: '+34 612 345 678', role: 'client', verified: true, address: { id: 'a1', label: 'Casa', street: 'Calle Gran Vía 28, 3ºB', city: 'Madrid', postalCode: '28013', lat: 40.4200, lng: -3.7025 }, createdAt: '2024-01-15' },
  { id: 'u2', email: 'pro@demo.es', name: 'Carlos Fontanero', phone: '+34 623 456 789', role: 'professional', verified: true, kycStatus: 'approved', rating: 4.8, totalJobs: 342, createdAt: '2023-06-01' },
  { id: 'u3', email: 'ops@demo.es', name: 'Laura Ops', phone: '+34 634 567 890', role: 'ops', verified: true, createdAt: '2023-01-01' },
  { id: 'u4', email: 'admin@demo.es', name: 'Admin URGE360', phone: '+34 645 678 901', role: 'admin', verified: true, createdAt: '2023-01-01' },
  { id: 'u5', email: 'rider@demo.es', name: 'Ahmed Repartidor', phone: '+34 656 789 012', role: 'professional', verified: true, kycStatus: 'approved', rating: 4.9, totalJobs: 1205, createdAt: '2023-03-15' },
  { id: 'u6', email: 'electric@demo.es', name: 'Pedro Electricista', phone: '+34 667 890 123', role: 'professional', verified: true, kycStatus: 'approved', rating: 4.7, totalJobs: 198, createdAt: '2023-08-20' },
];

const seedProfessionals: Professional[] = [
  { userId: 'u2', trades: ['plumbing', 'appliances'], zones: ['28001', '28002', '28003', '28004', '28013'], available: true, currentLat: 40.4180, currentLng: -3.7035, rating: 4.8, completedJobs: 342, hourlyRate: 45, kycStatus: 'approved' },
  { userId: 'u5', trades: ['other'], zones: ['28001', '28002', '28003', '28004', '28005', '28006', '28013'], available: true, currentLat: 40.4220, currentLng: -3.6980, rating: 4.9, completedJobs: 1205, hourlyRate: 15, kycStatus: 'approved' },
  { userId: 'u6', trades: ['electricity', 'hvac'], zones: ['28001', '28002', '28003', '28010', '28013'], available: true, currentLat: 40.4250, currentLng: -3.7050, rating: 4.7, completedJobs: 198, hourlyRate: 50, kycStatus: 'approved' },
];

const seedOrders: Order[] = [
  {
    id: 'ord-001', type: 'repair', status: 'en_route', clientId: 'u1', professionalId: 'u2',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(), updatedAt: new Date().toISOString(),
    repair: { category: 'plumbing', description: 'Fuga en tubería del baño, agua goteando constantemente', urgency: 'urgent', aiTriage: undefined },
    triage: { category: 'plumbing', urgency: 'urgent', risk: 'medium', estimatedDuration: 60, materials: ['llave inglesa', 'teflón', 'junta tórica'], requiredSkills: ['fontanería básica'], confidence: 0.92, requiresHumanReview: false },
    price: { base: 25, distance: 3.5, time: 30, category: 0, urgency: 15, extras: 0, total: 73.5, currency: 'EUR' },
    eta: 8,
    events: [
      { id: 'e1', status: 'created', at: new Date(Date.now() - 25 * 60000).toISOString(), by: 'u1' },
      { id: 'e2', status: 'triaged', at: new Date(Date.now() - 24 * 60000).toISOString(), by: 'system', note: 'IA Triage: fontanería, urgencia alta, riesgo medio' },
      { id: 'e3', status: 'quoted', at: new Date(Date.now() - 23 * 60000).toISOString(), by: 'system', note: 'Presupuesto estimado: 73.50€' },
      { id: 'e4', status: 'confirmed', at: new Date(Date.now() - 20 * 60000).toISOString(), by: 'u1' },
      { id: 'e5', status: 'assigned', at: new Date(Date.now() - 18 * 60000).toISOString(), by: 'system', note: 'Asignado a Carlos Fontanero (score: 0.94)' },
      { id: 'e6', status: 'en_route', at: new Date(Date.now() - 10 * 60000).toISOString(), by: 'u2', note: 'En camino, ETA 8 min' },
    ],
    evidences: []
  },
  {
    id: 'ord-002', type: 'courier', status: 'picked_up', clientId: 'u1', professionalId: 'u5',
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(), updatedAt: new Date().toISOString(),
    courier: {
      pickupAddress: { id: 'pa1', label: 'Origen', street: 'Calle Serrano 45', city: 'Madrid', postalCode: '28001', lat: 40.4290, lng: -3.6860 },
      deliveryAddress: { id: 'da1', label: 'Destino', street: 'Calle Atocha 12', city: 'Madrid', postalCode: '28012', lat: 40.4100, lng: -3.6970 },
      packageType: 'medium', packageDescription: 'Caja de documentos legales', weight: 3, priority: 'express', otpRequired: true, photoProof: true, signatureProof: true, instructions: 'Timbre 3ºB, llamar al llegar'
    },
    price: { base: 5, distance: 4.2, time: 15, category: 2, urgency: 8, extras: 3, total: 37.2, currency: 'EUR' },
    eta: 5,
    events: [
      { id: 'e7', status: 'created', at: new Date(Date.now() - 40 * 60000).toISOString(), by: 'u1' },
      { id: 'e8', status: 'assigned', at: new Date(Date.now() - 35 * 60000).toISOString(), by: 'system' },
      { id: 'e9', status: 'en_route', at: new Date(Date.now() - 30 * 60000).toISOString(), by: 'u5' },
      { id: 'e10', status: 'arrived', at: new Date(Date.now() - 25 * 60000).toISOString(), by: 'u5' },
      { id: 'e11', status: 'picked_up', at: new Date(Date.now() - 20 * 60000).toISOString(), by: 'u5', note: 'Recogido con foto y OTP verificado' },
    ],
    evidences: [
      { id: 'ev1', type: 'otp', data: '847291', at: new Date(Date.now() - 22 * 60000).toISOString(), by: 'u1' },
      { id: 'ev2', type: 'photo', at: new Date(Date.now() - 20 * 60000).toISOString(), by: 'u5' },
    ]
  }
];

// ===== AI Triage Engine (Deterministic + LLM-simulated) =====
function runAITriage(repair: RepairRequest): AITriage {
  const categoryMap: Record<string, RepairCategory> = {
    'agua': 'plumbing', 'tubería': 'plumbing', 'grifo': 'plumbing', 'wc': 'plumbing', 'fontan': 'plumbing',
    'luz': 'electricity', 'enchufe': 'electricity', 'cortocircuito': 'electricity', 'eléctric': 'electricity',
    'cerradura': 'locksmith', 'llave': 'locksmith', 'puerta': 'locksmith', 'cerrajer': 'locksmith',
    'calefacción': 'hvac', 'aire': 'hvac', 'climatiz': 'hvac', 'radiador': 'hvac',
    'persiana': 'shutters', 'ventana': 'glazing', 'cristal': 'glazing', 'rot': 'glazing',
    'lavadora': 'appliances', 'frigorífico': 'appliances', 'electrodoméstico': 'appliances',
  };

  const desc = (repair.description || '').toLowerCase();
  let detectedCategory = repair.category;
  for (const [keyword, cat] of Object.entries(categoryMap)) {
    if (desc.includes(keyword)) { detectedCategory = cat; break; }
  }

  const riskMap: Record<RepairCategory, 'low' | 'medium' | 'high' | 'critical'> = {
    plumbing: 'medium', electricity: 'high', locksmith: 'low', hvac: 'medium',
    shutters: 'low', glazing: 'medium', appliances: 'low', other: 'low'
  };

  const isEmergency = desc.includes('inundación') || desc.includes('humo') || desc.includes('fuego') || desc.includes('gas') || desc.includes('chispas');
  const urgency: Urgency = isEmergency ? 'emergency' : repair.urgency;
  const risk = isEmergency ? 'critical' : riskMap[detectedCategory];

  const safetyInstructions: string[] = [];
  if (detectedCategory === 'electricity') safetyInstructions.push('⚡ No toques cables pelados. Corta la luz del cuadro general si es seguro.');
  if (detectedCategory === 'plumbing' && desc.includes('fuga')) safetyInstructions.push('💧 Cierra la llave de paso general para minimizar daños.');
  if (isEmergency) safetyInstructions.push('🚨 Si hay peligro inmediato, llama al 112. URGE360 no sustituye servicios de emergencia.');

  const durationMap: Record<RepairCategory, number> = {
    plumbing: 60, electricity: 45, locksmith: 30, hvac: 90,
    shutters: 45, glazing: 60, appliances: 75, other: 60
  };

  return {
    category: detectedCategory,
    urgency,
    risk,
    estimatedDuration: durationMap[detectedCategory],
    materials: getMaterials(detectedCategory),
    requiredSkills: [getTradeName(detectedCategory)],
    safetyInstructions: safetyInstructions.length > 0 ? safetyInstructions : undefined,
    confidence: 0.85 + Math.random() * 0.12,
    requiresHumanReview: risk === 'critical' || urgency === 'emergency'
  };
}

function getMaterials(cat: RepairCategory): string[] {
  const map: Record<RepairCategory, string[]> = {
    plumbing: ['llave inglesa', 'teflón', 'juntas', 'abrazaderas'],
    electricity: ['destornilladores aislados', 'multímetro', 'clemas', 'cable'],
    locksmith: ['bombín', 'llaves', 'lubricante'],
    hvac: ['filtros', 'gas refrigerante', 'herramientas HVAC'],
    shutters: ['cintas', 'rodamientos', 'tornillería'],
    glazing: ['masilla', 'silicona', 'cristal medida'],
    appliances: ['herramientas específicas', 'recambios'],
    other: ['herramientas generales']
  };
  return map[cat];
}

function getTradeName(cat: RepairCategory): string {
  const map: Record<RepairCategory, string> = {
    plumbing: 'Fontanería', electricity: 'Electricidad', locksmith: 'Cerrajería',
    hvac: 'Climatización', shutters: 'Persianas', glazing: 'Cristalería',
    appliances: 'Electrodomésticos', other: 'Multi-oficio'
  };
  return map[cat];
}

// ===== Pricing Engine =====
function calculatePrice(type: 'repair' | 'courier', repair?: RepairRequest, courier?: CourierRequest, triage?: AITriage): PriceBreakdown {
  if (type === 'repair' && triage) {
    const urgencySurcharge = triage.urgency === 'emergency' ? 30 : triage.urgency === 'urgent' ? 15 : 0;
    const base = 25;
    const timeCost = (triage.estimatedDuration / 60) * 45;
    const total = Math.round((base + timeCost + urgencySurcharge) * 100) / 100;
    return { base, distance: 0, time: Math.round(timeCost * 100) / 100, category: 0, urgency: urgencySurcharge, extras: 0, total, currency: 'EUR' };
  }
  if (type === 'courier' && courier) {
    const dist = Math.sqrt(Math.pow(courier.deliveryAddress.lat - courier.pickupAddress.lat, 2) + Math.pow(courier.deliveryAddress.lng - courier.pickupAddress.lng, 2)) * 111;
    const urgencySurcharge = courier.priority === 'same_hour' ? 12 : courier.priority === 'express' ? 8 : 0;
    const sizeExtra = courier.packageType === 'large' ? 5 : courier.packageType === 'fragile' ? 3 : 0;
    const base = 5;
    const distCost = Math.round(dist * 1.2 * 100) / 100;
    const timeCost = 15;
    const total = Math.round((base + distCost + timeCost + urgencySurcharge + sizeExtra) * 100) / 100;
    return { base, distance: distCost, time: timeCost, category: sizeExtra, urgency: urgencySurcharge, extras: 0, total, currency: 'EUR' };
  }
  return { base: 0, distance: 0, time: 0, category: 0, urgency: 0, extras: 0, total: 0, currency: 'EUR' };
}

// ===== Dispatch Engine =====
function calculateDispatchScore(pro: Professional, order: Order): DispatchScore {
  const eta = 5 + Math.random() * 20;
  const skillMatch = order.type === 'repair' && order.triage
    ? (pro.trades.includes(order.triage.category) ? 1 : 0.2)
    : 0.8;
  const availability = pro.available ? 1 : 0;
  const zone = 0.8;
  const sla = 0.85;
  const load = 1 - (pro.completedJobs > 500 ? 0.1 : 0);
  const quality = pro.rating / 5;
  const cost = 1 - (pro.hourlyRate / 100);
  const total = eta * 0.2 + (1 - skillMatch) * 0.25 + (1 - availability) * 0.2 + (1 - zone) * 0.05 + (1 - sla) * 0.1 + (1 - load) * 0.05 + (1 - quality) * 0.1 + (1 - cost) * 0.05;

  return { professionalId: pro.userId, eta: Math.round(eta), skillMatch, availability, zone, sla, load, quality, cost, total: Math.round(total * 100) / 100 };
}

function dispatchOrder(order: Order, professionals: Professional[]): { professionalId: string; score: DispatchScore } | null {
  const scores = professionals
    .filter(p => p.available && p.kycStatus === 'approved')
    .map(p => ({ professionalId: p.userId, score: calculateDispatchScore(p, order) }))
    .sort((a, b) => a.score.total - b.score.total);
  return scores[0] || null;
}

// ===== Store =====
interface AppState {
  currentUser: User | null;
  users: User[];
  professionals: Professional[];
  orders: Order[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  // Auth
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (data: Partial<User>) => User;
  // Orders
  createRepairOrder: (repair: RepairRequest) => Order;
  createCourierOrder: (courier: CourierRequest) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  addEvidence: (orderId: string, evidence: Omit<Evidence, 'id' | 'at'>) => void;
  rateOrder: (orderId: string, score: number, comment?: string) => void;
  // Dispatch
  autoDispatch: (orderId: string) => void;
  manualDispatch: (orderId: string, professionalId: string) => void;
  // Notifications
  addNotification: (n: Omit<Notification, 'id' | 'at' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: seedUsers,
  professionals: seedProfessionals,
  orders: seedOrders,
  notifications: [],
  auditLogs: [],

  login: (email, _password) => {
    const user = get().users.find(u => u.email === email);
    if (user) {
      set({ currentUser: user });
      get().auditLogs.push({ id: crypto.randomUUID(), at: new Date().toISOString(), actor: user.id, action: 'login', target: 'auth' });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null }),

  register: (data) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email: data.email || '',
      name: data.name || '',
      phone: data.phone || '',
      role: data.role || 'client',
      verified: false,
      createdAt: new Date().toISOString(),
      address: data.address
    };
    set(s => ({ users: [...s.users, newUser], currentUser: newUser }));
    return newUser;
  },

  createRepairOrder: (repair) => {
    const triage = runAITriage(repair);
    const price = calculatePrice('repair', repair, undefined, triage);
    const order: Order = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      type: 'repair',
      status: 'triaged',
      clientId: get().currentUser?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      repair,
      triage,
      price,
      eta: 15 + Math.floor(Math.random() * 30),
      events: [
        { id: crypto.randomUUID(), status: 'created', at: new Date().toISOString(), by: get().currentUser?.id || '' },
        { id: crypto.randomUUID(), status: 'triaged', at: new Date().toISOString(), by: 'system', note: `IA: ${getTradeName(triage.category)}, ${triage.urgency}, riesgo ${triage.risk}` }
      ],
      evidences: []
    };
    set(s => ({ orders: [...s.orders, order] }));
    // Auto-dispatch after triage
    setTimeout(() => get().autoDispatch(order.id), 500);
    return order;
  },

  createCourierOrder: (courier) => {
    const price = calculatePrice('courier', undefined, courier);
    const order: Order = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      type: 'courier',
      status: 'quoted',
      clientId: get().currentUser?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      courier,
      price,
      eta: 10 + Math.floor(Math.random() * 20),
      events: [
        { id: crypto.randomUUID(), status: 'created', at: new Date().toISOString(), by: get().currentUser?.id || '' },
        { id: crypto.randomUUID(), status: 'quoted', at: new Date().toISOString(), by: 'system', note: `Precio: ${price.total}€` }
      ],
      evidences: []
    };
    set(s => ({ orders: [...s.orders, order] }));
    return order;
  },

  updateOrderStatus: (orderId, status, note) => {
    set(s => ({
      orders: s.orders.map(o => {
        if (o.id !== orderId) return o;
        const event: OrderEvent = { id: crypto.randomUUID(), status, at: new Date().toISOString(), by: get().currentUser?.id || 'system', note };
        return { ...o, status, updatedAt: new Date().toISOString(), events: [...o.events, event] };
      })
    }));
  },

  addEvidence: (orderId, evidence) => {
    const ev: Evidence = { ...evidence, id: crypto.randomUUID(), at: new Date().toISOString() };
    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? { ...o, evidences: [...o.evidences, ev] } : o)
    }));
  },

  rateOrder: (orderId, score, comment) => {
    set(s => ({
      orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'rated', rating: { score, comment, at: new Date().toISOString() } } : o)
    }));
  },

  autoDispatch: (orderId) => {
    const order = get().orders.find(o => o.id === orderId);
    if (!order) return;
    const result = dispatchOrder(order, get().professionals);
    if (result) {
      const pro = get().professionals.find(p => p.userId === result.professionalId);
      const user = get().users.find(u => u.id === result.professionalId);
      set(s => ({
        orders: s.orders.map(o => {
          if (o.id !== orderId) return o;
          const event: OrderEvent = { id: crypto.randomUUID(), status: 'assigned', at: new Date().toISOString(), by: 'system', note: `Auto-asignado a ${user?.name} (score: ${result.score.total})` };
          return { ...o, status: 'assigned', professionalId: result.professionalId, eta: result.score.eta, events: [...o.events, event] };
        })
      }));
      get().addNotification({ type: 'success', title: 'Profesional asignado', message: `${user?.name} aceptó tu solicitud. ETA: ${result.score.eta} min` });
    }
  },

  manualDispatch: (orderId, professionalId) => {
    const user = get().users.find(u => u.id === professionalId);
    set(s => ({
      orders: s.orders.map(o => {
        if (o.id !== orderId) return o;
        const event: OrderEvent = { id: crypto.randomUUID(), status: 'assigned', at: new Date().toISOString(), by: get().currentUser?.id || 'ops', note: `Asignación manual a ${user?.name}` };
        return { ...o, status: 'assigned', professionalId, events: [...o.events, event] };
      })
    }));
  },

  addNotification: (n) => {
    const notif: Notification = { ...n, id: crypto.randomUUID(), at: new Date().toISOString(), read: false };
    set(s => ({ notifications: [notif, ...s.notifications] }));
  },

  markNotificationRead: (id) => {
    set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
  }
}));
