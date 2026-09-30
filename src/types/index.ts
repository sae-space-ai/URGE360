// ===== URGE360 Type System =====
export type Role = 'client' | 'professional' | 'ops' | 'admin';
export type ServiceType = 'repair' | 'courier';
export type RepairCategory =
  | 'plumbing' | 'electricity' | 'locksmith' | 'hvac'
  | 'shutters' | 'glazing' | 'appliances' | 'other';
export type Urgency = 'emergency' | 'urgent' | 'scheduled';
export type OrderStatus =
  | 'created' | 'triaged' | 'quoted' | 'confirmed'
  | 'assigned' | 'en_route' | 'arrived' | 'in_progress'
  | 'picked_up' | 'completed' | 'delivered' | 'paid'
  | 'rated' | 'cancelled' | 'refunded' | 'disputed';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  avatar?: string;
  address?: Address;
  verified: boolean;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  rating?: number;
  totalJobs?: number;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
}

export interface RepairRequest {
  category: RepairCategory;
  description: string;
  urgency: Urgency;
  photos?: string[];
  voiceNote?: string;
  aiTriage?: AITriage;
}

export interface CourierRequest {
  pickupAddress: Address;
  deliveryAddress: Address;
  packageType: 'small' | 'medium' | 'large' | 'fragile' | 'document';
  packageDescription: string;
  weight?: number;
  windowStart?: string;
  windowEnd?: string;
  priority: 'standard' | 'express' | 'same_hour';
  otpRequired: boolean;
  photoProof: boolean;
  signatureProof: boolean;
  instructions?: string;
}

export interface AITriage {
  category: RepairCategory;
  urgency: Urgency;
  risk: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // minutes
  materials: string[];
  requiredSkills: string[];
  safetyInstructions?: string[];
  confidence: number;
  requiresHumanReview: boolean;
}

export interface PriceBreakdown {
  base: number;
  distance: number;
  time: number;
  category: number;
  urgency: number;
  extras: number;
  total: number;
  currency: 'EUR';
}

export interface Order {
  id: string;
  type: ServiceType;
  status: OrderStatus;
  clientId: string;
  professionalId?: string;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  repair?: RepairRequest;
  courier?: CourierRequest;
  triage?: AITriage;
  price?: PriceBreakdown;
  eta?: number; // minutes
  events: OrderEvent[];
  evidences: Evidence[];
  rating?: { score: number; comment?: string; at: string };
  notes?: string;
}

export interface OrderEvent {
  id: string;
  status: OrderStatus;
  at: string;
  by: string; // user id or 'system'
  note?: string;
  metadata?: Record<string, unknown>;
}

export interface Evidence {
  id: string;
  type: 'photo' | 'signature' | 'otp' | 'gps' | 'note';
  url?: string;
  data?: string;
  at: string;
  by: string;
}

export interface Professional {
  userId: string;
  trades: RepairCategory[];
  zones: string[]; // postal codes
  available: boolean;
  currentLat?: number;
  currentLng?: number;
  rating: number;
  completedJobs: number;
  hourlyRate: number;
  kycStatus: 'pending' | 'approved' | 'rejected';
}

export interface DispatchScore {
  professionalId: string;
  eta: number;
  skillMatch: number;
  availability: number;
  zone: number;
  sla: number;
  load: number;
  quality: number;
  cost: number;
  total: number;
}

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  details?: string;
  ip?: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  at: string;
  read: boolean;
}
