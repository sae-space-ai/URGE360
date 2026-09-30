import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Wrench, Package, MapPin, Clock, Star, MessageCircle, ChevronRight,
  AlertTriangle, CheckCircle2, Camera, Mic, Send, ArrowLeft, Phone,
  Shield, CreditCard, FileText, Home, Bell, LogOut, User, X, Truck, Download
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { RepairCategory, Urgency, Order, OrderStatus } from '../types';
import { Chat } from '../components/Chat';
import { Signature } from '../components/Signature';
import { Invoice } from '../components/Invoice';
import { GuaranteeClaim } from '../components/GuaranteeClaim';

const REPAIR_CATEGORIES: { value: RepairCategory; label: string; icon: string; color: string }[] = [
  { value: 'plumbing', label: 'Fontanería', icon: '🚿', color: 'blue' },
  { value: 'electricity', label: 'Electricidad', icon: '⚡', color: 'yellow' },
  { value: 'locksmith', label: 'Cerrajería', icon: '🔑', color: 'green' },
  { value: 'hvac', label: 'Climatización', icon: '❄️', color: 'cyan' },
  { value: 'shutters', label: 'Persianas', icon: '🪟', color: 'orange' },
  { value: 'glazing', label: 'Cristalería', icon: '🪞', color: 'purple' },
  { value: 'appliances', label: 'Electrodomésticos', icon: '🔌', color: 'red' },
  { value: 'other', label: 'Otros', icon: '🔧', color: 'slate' },
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: 'Creado', triaged: 'Analizado', quoted: 'Presupuestado', confirmed: 'Confirmado',
  assigned: 'Asignado', en_route: 'En camino', arrived: 'Ha llegado', in_progress: 'Trabajando',
  picked_up: 'Recogido', completed: 'Completado', delivered: 'Entregado', paid: 'Pagado',
  rated: 'Valorado', cancelled: 'Cancelado', refunded: 'Reembolsado', disputed: 'En disputa'
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  created: 'bg-slate-500', triaged: 'bg-blue-500', quoted: 'bg-indigo-500', confirmed: 'bg-cyan-500',
  assigned: 'bg-purple-500', en_route: 'bg-orange-500', arrived: 'bg-yellow-500', in_progress: 'bg-amber-500',
  picked_up: 'bg-teal-500', completed: 'bg-green-500', delivered: 'bg-green-600', paid: 'bg-emerald-500',
  rated: 'bg-emerald-600', cancelled: 'bg-red-500', refunded: 'bg-red-600', disputed: 'bg-red-700'
};

export function ClientDashboard() {
  const user = useStore(s => s.currentUser);
  const orders = useStore(s => s.orders.filter(o => o.clientId === user?.id));
  const users = useStore(s => s.users);
  const navigate = useNavigate();
  const [view, setView] = useState<'home' | 'repair' | 'courier' | 'tracking' | 'history'>('home');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const notifications = useStore(s => s.notifications);

  if (!user) return null;

  const activeOrders = orders.filter(o => !['rated', 'cancelled', 'refunded'].includes(o.status));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'home' && (
              <button onClick={() => { setView('home'); setSelectedOrder(null); }} className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">URGE<span className="text-orange-500">360</span></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative">
              <Bell className="w-5 h-5 text-slate-400" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">{notifications.filter(n => !n.read).length}</span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs font-medium">{user.name.charAt(0)}</div>
              <span className="text-sm hidden sm:block">{user.name.split(' ')[0]}</span>
            </div>
            <button onClick={() => { useStore.getState().logout(); navigate('/'); }} className="text-slate-400 hover:text-red-400">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-14 max-w-4xl mx-auto px-4 pb-20">
        {view === 'home' && <HomeView user={user} activeOrders={activeOrders} setView={setView} setSelectedOrder={setSelectedOrder} orders={orders} users={users} />}
        {view === 'repair' && <RepairFlow setView={setView} setSelectedOrder={setSelectedOrder} />}
        {view === 'courier' && <CourierFlow setView={setView} setSelectedOrder={setSelectedOrder} />}
        {view === 'tracking' && selectedOrder && (
          <TrackingView
            order={selectedOrder}
            users={users}
            setView={setView}
            onOpenChat={() => setShowChat(true)}
            onOpenSignature={() => setShowSignature(true)}
            onOpenInvoice={() => setShowInvoice(true)}
            onOpenClaim={() => setShowClaim(true)}
          />
        )}
        {/* Modals */}
        {selectedOrder && user && (
          <>
            <Chat
              orderId={selectedOrder.id}
              currentUserId={user.id}
              currentUserRole="client"
              professionalName={users.find(u => u.id === selectedOrder.professionalId)?.name || 'Profesional'}
              isOpen={showChat}
              onClose={() => setShowChat(false)}
            />
            <Signature
              isOpen={showSignature}
              onClose={() => setShowSignature(false)}
              onSign={(data) => {
                useStore.getState().addEvidence(selectedOrder.id, { type: 'signature', data, by: user.id });
              }}
            />
            <Invoice
              order={selectedOrder}
              client={user}
              professional={users.find(u => u.id === selectedOrder.professionalId)}
              isOpen={showInvoice}
              onClose={() => setShowInvoice(false)}
            />
            <GuaranteeClaim
              orderId={selectedOrder.id}
              isOpen={showClaim}
              onClose={() => setShowClaim(false)}
            />
          </>
        )}
        {view === 'history' && <HistoryView orders={orders} users={users} setSelectedOrder={setSelectedOrder} setView={setView} />}
      </main>
    </div>
  );
}

// ===== HOME VIEW =====
function HomeView({ user, activeOrders, setView, setSelectedOrder, orders, users }: any) {
  return (
    <div className="py-6 space-y-6">
      {/* Emergency button */}
      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h2 className="text-lg font-bold">¿Emergencia?</h2>
        </div>
        <p className="text-sm text-slate-300 mb-4">Si hay peligro inmediato (gas, fuego, inundación grave), llama al <strong className="text-white">112</strong> primero.</p>
        <button onClick={() => setView('repair')} className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
          <Zap className="w-5 h-5" /> Necesito ayuda AHORA
        </button>
      </div>

      {/* Active orders */}
      {activeOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Servicios activos</h3>
          <div className="space-y-3">
            {activeOrders.map((order: Order) => {
              const pro = users.find((u: any) => u.id === order.professionalId);
              return (
                <button key={order.id} onClick={() => { setSelectedOrder(order); setView('tracking'); }} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-left hover:border-orange-500/30 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {order.type === 'repair' ? <Wrench className="w-4 h-4 text-orange-400" /> : <Package className="w-4 h-4 text-blue-400" />}
                      <span className="text-sm font-medium">{order.type === 'repair' ? order.repair?.description?.slice(0, 40) : order.courier?.packageDescription?.slice(0, 40)}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{pro?.name || 'Buscando profesional...'}</span>
                    {order.eta && <span className="text-green-400">ETA: {order.eta} min</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Service selection */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">¿Qué necesitas?</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setView('repair')} className="bg-slate-900 border border-slate-800 hover:border-orange-500/30 rounded-xl p-5 text-left transition group">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-500/20 transition">
              <Wrench className="w-5 h-5 text-orange-400" />
            </div>
            <h4 className="font-semibold text-sm">Reparación</h4>
            <p className="text-xs text-slate-400 mt-1">Fontanería, electricidad, cerrajería...</p>
          </button>
          <button onClick={() => setView('courier')} className="bg-slate-900 border border-slate-800 hover:border-blue-500/30 rounded-xl p-5 text-left transition group">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-semibold text-sm">Mensajería</h4>
            <p className="text-xs text-slate-400 mt-1">Envío urgente última milla</p>
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setView('history')} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center hover:border-slate-700 transition">
          <FileText className="w-5 h-5 mx-auto text-slate-400 mb-1" />
          <span className="text-xs text-slate-400">Historial</span>
        </button>
        <button className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center hover:border-slate-700 transition">
          <Home className="w-5 h-5 mx-auto text-slate-400 mb-1" />
          <span className="text-xs text-slate-400">Direcciones</span>
        </button>
        <button className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center hover:border-slate-700 transition">
          <MessageCircle className="w-5 h-5 mx-auto text-slate-400 mb-1" />
          <span className="text-xs text-slate-400">Soporte</span>
        </button>
      </div>
    </div>
  );
}

// ===== REPAIR FLOW =====
function RepairFlow({ setView, setSelectedOrder }: { setView: (v: any) => void; setSelectedOrder: (o: Order) => void }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<RepairCategory | ''>('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('urgent');
  const [showQuote, setShowQuote] = useState(false);
  const createRepairOrder = useStore(s => s.createRepairOrder);
  const updateOrderStatus = useStore(s => s.updateOrderStatus);

  const handleSubmit = () => {
    if (!category || !description) return;
    const order = createRepairOrder({ category: category as RepairCategory, description, urgency });
    setSelectedOrder(order);
    setStep(3);
  };

  const handleConfirm = () => {
    const orders = useStore.getState().orders;
    const lastOrder = orders[orders.length - 1];
    if (lastOrder) {
      updateOrderStatus(lastOrder.id, 'confirmed');
      setSelectedOrder(lastOrder);
      setView('tracking');
    }
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-orange-500' : 'bg-slate-800'}`} />
        ))}
      </div>

      {step === 1 && (
        <>
          <h2 className="text-xl font-bold">¿Qué necesita reparación?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {REPAIR_CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => { setCategory(cat.value); setStep(2); }} className={`p-4 rounded-xl border text-center transition ${category === cat.value ? 'border-orange-500 bg-orange-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                <div className="text-2xl mb-2">{cat.icon}</div>
                <div className="text-xs font-medium">{cat.label}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Cambiar categoría
          </button>
          <h2 className="text-xl font-bold">Describe el problema</h2>
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ej: Fuga en la tubería del baño, el agua gotea constantemente desde hace 2 horas..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 pr-10 text-sm resize-none h-32 focus:border-orange-500 focus:outline-none"
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700" title="Añadir foto">
                  <Camera className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700" title="Nota de voz">
                  <Mic className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Nivel de urgencia</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'scheduled', label: 'Programar', desc: 'Próximos días' },
                  { value: 'urgent', label: 'Urgente', desc: 'Hoy' },
                  { value: 'emergency', label: 'Emergencia', desc: 'Ahora' },
                ].map(u => (
                  <button key={u.value} onClick={() => setUrgency(u.value as Urgency)} className={`p-3 rounded-lg border text-center transition ${urgency === u.value ? 'border-orange-500 bg-orange-500/10' : 'border-slate-800 bg-slate-900'}`}>
                    <div className="text-sm font-medium">{u.label}</div>
                    <div className="text-[10px] text-slate-400">{u.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {urgency === 'emergency' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" /> Instrucciones de seguridad
                </div>
                <p className="text-xs text-slate-300">Si hay peligro inmediato (gas, fuego, inundación grave), llama al <strong>112</strong>. Cierra llaves de paso si es seguro. URGE360 no sustituye servicios de emergencia.</p>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <MapPin className="w-4 h-4" /> Dirección del servicio
              </div>
              <p className="text-sm">Calle Gran Vía 28, 3ºB — 28013 Madrid</p>
            </div>

            <button onClick={handleSubmit} disabled={!description} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" /> Analizar con IA y obtener presupuesto
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Análisis IA completado</h2>
              <p className="text-sm text-slate-400">Presupuesto estimado listo</p>
            </div>
          </div>

          {(() => {
            const orders = useStore.getState().orders;
            const order = orders[orders.length - 1];
            if (!order?.triage || !order?.price) return null;
            return (
              <>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Oficio detectado</span>
                    <span className="text-sm font-medium">{REPAIR_CATEGORIES.find(c => c.value === order.triage?.category)?.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Urgencia</span>
                    <span className="text-sm font-medium capitalize">{order.triage.urgency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Riesgo</span>
                    <span className={`text-sm font-medium capitalize ${order.triage.risk === 'high' || order.triage.risk === 'critical' ? 'text-red-400' : 'text-green-400'}`}>{order.triage.risk}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Duración estimada</span>
                    <span className="text-sm font-medium">{order.triage.estimatedDuration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Confianza IA</span>
                    <span className="text-sm font-medium">{Math.round(order.triage.confidence * 100)}%</span>
                  </div>
                </div>

                {order.triage.safetyInstructions && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="text-sm font-medium text-yellow-400 mb-2">⚠️ Instrucciones de seguridad</div>
                    <ul className="space-y-1">
                      {order.triage.safetyInstructions.map((s, i) => <li key={i} className="text-xs text-slate-300">{s}</li>)}
                    </ul>
                  </div>
                )}

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-sm font-medium mb-3">Desglose de precio</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Tarifa base</span><span>{order.price.base.toFixed(2)}€</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Tiempo estimado</span><span>{order.price.time.toFixed(2)}€</span></div>
                    {order.price.urgency > 0 && <div className="flex justify-between text-sm"><span className="text-slate-400">Suplemento urgencia</span><span>{order.price.urgency.toFixed(2)}€</span></div>}
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold"><span>Total</span><span className="text-orange-400">{order.price.total.toFixed(2)}€</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="w-3 h-3" /> Precio cerrado. Sin sorpresas. Garantía 30 días.
                </div>

                <button onClick={handleConfirm} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" /> Confirmar y asignar profesional
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ===== COURIER FLOW =====
function CourierFlow({ setView, setSelectedOrder }: { setView: (v: any) => void; setSelectedOrder: (o: Order) => void }) {
  const [step, setStep] = useState(1);
  const [pickup, setPickup] = useState('Calle Serrano 45, 28001 Madrid');
  const [delivery, setDelivery] = useState('');
  const [packageType, setPackageType] = useState<'small' | 'medium' | 'large' | 'fragile' | 'document'>('medium');
  const [packageDesc, setPackageDesc] = useState('');
  const [priority, setPriority] = useState<'standard' | 'express' | 'same_hour'>('express');
  const [otpRequired, setOtpRequired] = useState(true);
  const createCourierOrder = useStore(s => s.createCourierOrder);
  const updateOrderStatus = useStore(s => s.updateOrderStatus);

  const handleSubmit = () => {
    if (!delivery || !packageDesc) return;
    const order = createCourierOrder({
      pickupAddress: { id: 'pa', label: 'Origen', street: pickup, city: 'Madrid', postalCode: '28001', lat: 40.4290, lng: -3.6860 },
      deliveryAddress: { id: 'da', label: 'Destino', street: delivery, city: 'Madrid', postalCode: '28012', lat: 40.4100, lng: -3.6970 },
      packageType, packageDescription: packageDesc, priority, otpRequired, photoProof: true, signatureProof: true
    });
    setSelectedOrder(order);
    setStep(2);
  };

  const handleConfirm = () => {
    const orders = useStore.getState().orders;
    const lastOrder = orders[orders.length - 1];
    if (lastOrder) {
      updateOrderStatus(lastOrder.id, 'confirmed');
      useStore.getState().autoDispatch(lastOrder.id);
      setSelectedOrder(lastOrder);
      setView('tracking');
    }
  };

  return (
    <div className="py-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {[1, 2].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-blue-500' : 'bg-slate-800'}`} />
        ))}
      </div>

      {step === 1 && (
        <>
          <h2 className="text-xl font-bold">Enviar un paquete</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">📍 Recogida</label>
              <input value={pickup} onChange={e => setPickup(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">📍 Entrega</label>
              <input value={delivery} onChange={e => setDelivery(e.target.value)} placeholder="Dirección completa de destino" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Tipo de paquete</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { value: 'document', label: '📄' },
                  { value: 'small', label: '📦' },
                  { value: 'medium', label: '📫' },
                  { value: 'large', label: '🏷️' },
                  { value: 'fragile', label: '⚠️' },
                ].map(p => (
                  <button key={p.value} onClick={() => setPackageType(p.value as any)} className={`p-3 rounded-lg border text-center transition ${packageType === p.value ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900'}`}>
                    <div className="text-xl">{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-1 block">Descripción del contenido</label>
              <input value={packageDesc} onChange={e => setPackageDesc(e.target.value)} placeholder="Ej: Documentos legales, caja de ropa..." className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Prioridad</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'standard', label: 'Estándar', desc: '2-4h' },
                  { value: 'express', label: 'Express', desc: '1-2h' },
                  { value: 'same_hour', label: 'Misma hora', desc: '60 min' },
                ].map(p => (
                  <button key={p.value} onClick={() => setPriority(p.value as any)} className={`p-3 rounded-lg border text-center transition ${priority === p.value ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900'}`}>
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className="text-[10px] text-slate-400">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
              <input type="checkbox" checked={otpRequired} onChange={e => setOtpRequired(e.target.checked)} className="w-4 h-4 accent-blue-500" />
              <div>
                <div className="text-sm font-medium">Código OTP de entrega</div>
                <div className="text-xs text-slate-400">El destinatario debe dar un código al repartidor</div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={!delivery || !packageDesc} className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
              <Truck className="w-5 h-5" /> Calcular precio
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Resumen del envío</h2>
          {(() => {
            const orders = useStore.getState().orders;
            const order = orders[orders.length - 1];
            if (!order?.price) return null;
            return (
              <>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-slate-400">Recogida:</span>
                    <span>{order.courier?.pickupAddress.street}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span className="text-slate-400">Entrega:</span>
                    <span>{order.courier?.deliveryAddress.street}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400">Paquete:</span>
                    <span>{order.courier?.packageDescription}</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h3 className="text-sm font-medium mb-3">Desglose de precio</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Tarifa base</span><span>{order.price.base.toFixed(2)}€</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Distancia</span><span>{order.price.distance.toFixed(2)}€</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Tiempo</span><span>{order.price.time.toFixed(2)}€</span></div>
                    {order.price.urgency > 0 && <div className="flex justify-between text-sm"><span className="text-slate-400">Prioridad</span><span>{order.price.urgency.toFixed(2)}€</span></div>}
                    {order.price.category > 0 && <div className="flex justify-between text-sm"><span className="text-slate-400">Tipo paquete</span><span>{order.price.category.toFixed(2)}€</span></div>}
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold"><span>Total</span><span className="text-blue-400">{order.price.total.toFixed(2)}€</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Seguro incluido</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> OTP + Foto + Firma</span>
                </div>

                <button onClick={handleConfirm} className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" /> Confirmar envío
                </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ===== TRACKING VIEW =====
function TrackingView({ order, users, setView, onOpenChat, onOpenSignature, onOpenInvoice, onOpenClaim }: { order: Order; users: any[]; setView: (v: any) => void; onOpenChat: () => void; onOpenSignature: () => void; onOpenInvoice: () => void; onOpenClaim: () => void }) {
  const pro = users.find(u => u.id === order.professionalId);
  const updateOrderStatus = useStore(s => s.updateOrderStatus);
  const addEvidence = useStore(s => s.addEvidence);
  const rateOrder = useStore(s => s.rateOrder);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  const statusSteps = order.type === 'repair'
    ? ['created', 'triaged', 'quoted', 'confirmed', 'assigned', 'en_route', 'arrived', 'in_progress', 'completed', 'paid']
    : ['created', 'quoted', 'confirmed', 'assigned', 'en_route', 'arrived', 'picked_up', 'delivered', 'paid'];

  const currentStepIndex = statusSteps.indexOf(order.status);

  const handleSimulateAdvance = () => {
    const nextStatuses: Record<string, OrderStatus> = {
      assigned: 'en_route', en_route: order.type === 'repair' ? 'arrived' : 'picked_up',
      arrived: 'in_progress', in_progress: 'completed', picked_up: 'delivered',
      completed: 'paid', delivered: 'paid'
    };
    const next = nextStatuses[order.status];
    if (next) {
      updateOrderStatus(order.id, next);
      if (next === 'paid') setShowRating(true);
    }
  };

  const handleRate = () => {
    if (rating > 0) {
      rateOrder(order.id, rating);
      setView('home');
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Status header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {order.type === 'repair' ? <Wrench className="w-5 h-5 text-orange-400" /> : <Package className="w-5 h-5 text-blue-400" />}
            <div>
              <h2 className="font-bold">{order.type === 'repair' ? 'Reparación' : 'Envío'}</h2>
              <p className="text-xs text-slate-400">#{order.id}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${STATUS_COLORS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-4">
          {statusSteps.map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= currentStepIndex ? (order.type === 'repair' ? 'bg-orange-500' : 'bg-blue-500') : 'bg-slate-800'}`} />
          ))}
        </div>

        {pro && (
          <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-medium text-sm">{pro.name.charAt(0)}</div>
              <div>
                <div className="text-sm font-medium">{pro.name}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" /> {pro.rating || '4.8'} · {pro.totalJobs || 0} servicios
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600"><Phone className="w-4 h-4" /></button>
              <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600"><MessageCircle className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {order.eta && !['paid', 'rated', 'completed', 'delivered'].includes(order.status) && (
          <div className="mt-3 text-center">
            <div className="text-2xl font-bold text-green-400">{order.eta} min</div>
            <div className="text-xs text-slate-400">Tiempo estimado de llegada</div>
          </div>
        )}
      </div>

      {/* Map placeholder */}
      {!['paid', 'rated'].includes(order.status) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-48 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <path d="M0,100 Q100,50 200,100 T400,100" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500" />
              <circle cx="50" cy="100" r="6" className="fill-green-500" />
              <circle cx="350" cy="100" r="6" className="fill-red-500" />
              <circle cx="200" cy="80" r="4" className="fill-orange-500 animate-pulse" />
            </svg>
          </div>
          <div className="text-center z-10">
            <MapPin className="w-8 h-8 text-orange-400 mx-auto mb-2 animate-bounce" />
            <p className="text-sm text-slate-400">Tracking GPS en tiempo real</p>
            <p className="text-xs text-slate-500">Simulación de mapa</p>
          </div>
        </div>
      )}

      {/* OTP verification for courier */}
      {order.type === 'courier' && order.status === 'delivered' && !otpVerified && (
        <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-400" /> Verificación OTP</h3>
          <p className="text-xs text-slate-400 mb-3">Introduce el código que te dio el repartidor</p>
          <div className="flex gap-2">
            <input value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="Código OTP" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
            <button onClick={() => { if (otpInput === '847291' || otpInput.length >= 4) { setOtpVerified(true); addEvidence(order.id, { type: 'otp', data: otpInput, by: useStore.getState().currentUser?.id || '' }); } }} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium">Verificar</button>
          </div>
        </div>
      )}

      {/* Evidences */}
      {order.evidences.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">Evidencias</h3>
          <div className="space-y-2">
            {order.evidences.map(ev => (
              <div key={ev.id} className="flex items-center gap-2 text-xs">
                {ev.type === 'otp' && <Shield className="w-3 h-3 text-blue-400" />}
                {ev.type === 'photo' && <Camera className="w-3 h-3 text-green-400" />}
                <span className="text-slate-400">{ev.type === 'otp' ? `OTP: ${ev.data}` : 'Foto de entrega'}</span>
                <span className="text-slate-600 ml-auto">{new Date(ev.at).toLocaleTimeString('es')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-medium mb-3">Historial de eventos</h3>
        <div className="space-y-3">
          {order.events.slice().reverse().map(ev => (
            <div key={ev.id} className="flex gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 ${STATUS_COLORS[ev.status]}`} />
              <div>
                <div className="text-sm">{STATUS_LABELS[ev.status]}</div>
                {ev.note && <div className="text-xs text-slate-400">{ev.note}</div>}
                <div className="text-[10px] text-slate-600">{new Date(ev.at).toLocaleString('es')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      {order.price && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Total</span>
            <span className="text-lg font-bold text-orange-400">{order.price.total.toFixed(2)}€</span>
          </div>
        </div>
      )}

      {/* Rating */}
      {showRating && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-medium mb-3">¿Cómo ha ido?</h3>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)} className={`text-2xl ${s <= rating ? 'text-yellow-400' : 'text-slate-700'}`}>★</button>
            ))}
          </div>
          <button onClick={handleRate} disabled={rating === 0} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-2 rounded-lg text-sm font-medium transition">Enviar valoración</button>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {order.professionalId && !['paid', 'rated', 'cancelled'].includes(order.status) && (
          <button onClick={onOpenChat} className="bg-slate-900 border border-slate-800 hover:border-orange-500/30 py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> Chat
          </button>
        )}
        {order.type === 'courier' && order.status === 'delivered' && (
          <button onClick={onOpenSignature} className="bg-slate-900 border border-slate-800 hover:border-blue-500/30 py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
            ✍️ Firma
          </button>
        )}
        {['paid', 'rated'].includes(order.status) && (
          <>
            <button onClick={onOpenInvoice} className="bg-slate-900 border border-slate-800 hover:border-green-500/30 py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" /> Factura
            </button>
            <button onClick={onOpenClaim} className="bg-slate-900 border border-slate-800 hover:border-yellow-500/30 py-3 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" /> Garantía
            </button>
          </>
        )}
      </div>

      {/* Simulate advance (demo) */}
      {!['paid', 'rated', 'cancelled'].includes(order.status) && (
        <button onClick={handleSimulateAdvance} className="w-full border border-slate-700 hover:border-orange-500/30 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition">
          ▶ Simular siguiente estado (demo)
        </button>
      )}
    </div>
  );
}

// ===== HISTORY VIEW =====
function HistoryView({ orders, users, setSelectedOrder, setView }: any) {
  return (
    <div className="py-6 space-y-4">
      <h2 className="text-xl font-bold">Historial</h2>
      {orders.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aún no tienes servicios completados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: Order) => {
            const pro = users.find((u: any) => u.id === order.professionalId);
            return (
              <button key={order.id} onClick={() => { setSelectedOrder(order); setView('tracking'); }} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-left hover:border-slate-700 transition">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {order.type === 'repair' ? <Wrench className="w-4 h-4 text-orange-400" /> : <Package className="w-4 h-4 text-blue-400" />}
                    <span className="text-sm font-medium">{order.type === 'repair' ? order.repair?.description?.slice(0, 35) : order.courier?.packageDescription?.slice(0, 35)}</span>
                  </div>
                  <span className="text-sm font-bold text-orange-400">{order.price?.total.toFixed(2)}€</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{pro?.name || 'Sin asignar'} · {new Date(order.createdAt).toLocaleDateString('es')}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] text-white ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
