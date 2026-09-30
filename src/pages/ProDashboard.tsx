import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, Clock, Star, CheckCircle2, XCircle, Navigation, Wallet, Bell, LogOut, Wrench, Package, ChevronRight, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Order, OrderStatus } from '../types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: 'Creado', triaged: 'Analizado', quoted: 'Presupuestado', confirmed: 'Confirmado',
  assigned: 'Asignado', en_route: 'En camino', arrived: 'Ha llegado', in_progress: 'Trabajando',
  picked_up: 'Recogido', completed: 'Completado', delivered: 'Entregado', paid: 'Pagado',
  rated: 'Valorado', cancelled: 'Cancelado', refunded: 'Reembolsado', disputed: 'En disputa'
};

export function ProDashboard() {
  const user = useStore(s => s.currentUser);
  const orders = useStore(s => s.orders.filter(o => o.professionalId === user?.id));
  const updateOrderStatus = useStore(s => s.updateOrderStatus);
  const addEvidence = useStore(s => s.addEvidence);
  const navigate = useNavigate();
  const [available, setAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'earnings' | 'profile'>('jobs');

  if (!user) return null;

  const pendingOrders = orders.filter(o => o.status === 'assigned');
  const activeOrders = orders.filter(o => ['en_route', 'arrived', 'in_progress', 'picked_up'].includes(o.status));
  const completedToday = orders.filter(o => ['completed', 'delivered', 'paid', 'rated'].includes(o.status));
  const todayEarnings = completedToday.reduce((sum, o) => sum + (o.price?.total || 0), 0);

  const handleAccept = (orderId: string) => {
    updateOrderStatus(orderId, 'en_route', 'Profesional en camino');
  };

  const handleAdvance = (orderId: string, currentStatus: OrderStatus) => {
    const nextMap: Partial<Record<OrderStatus, OrderStatus>> = {
      en_route: 'arrived', arrived: 'in_progress', in_progress: 'completed', picked_up: 'delivered'
    };
    const next = nextMap[currentStatus];
    if (next) {
      updateOrderStatus(orderId, next);
      if (next === 'completed' || next === 'delivered') {
        addEvidence(orderId, { type: 'photo', by: user.id });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="fixed top-0 w-full z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">URGE<span className="text-blue-400">360</span> <span className="text-slate-500 text-xs">PRO</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setAvailable(!available)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition ${available ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
              <span className={`w-2 h-2 rounded-full ${available ? 'bg-green-400' : 'bg-red-400'}`} />
              {available ? 'Disponible' : 'No disponible'}
            </button>
            <button onClick={() => { useStore.getState().logout(); navigate('/'); }} className="text-slate-400 hover:text-red-400">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-14 max-w-4xl mx-auto px-4 pb-20">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 py-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-green-400">{todayEarnings.toFixed(0)}€</div>
            <div className="text-[10px] text-slate-400">Hoy</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-blue-400">{completedToday.length}</div>
            <div className="text-[10px] text-slate-400">Completados</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-yellow-400 flex items-center justify-center gap-1"><Star className="w-4 h-4" /> {user.rating || '4.8'}</div>
            <div className="text-[10px] text-slate-400">Valoración</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['jobs', 'earnings', 'profile'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-400'}`}>
              {tab === 'jobs' ? 'Trabajos' : tab === 'earnings' ? 'Ingresos' : 'Perfil'}
            </button>
          ))}
        </div>

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Pending */}
            {pendingOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><Bell className="w-4 h-4" /> Nuevas asignaciones</h3>
                {pendingOrders.map(order => (
                  <div key={order.id} className="bg-slate-900 border border-orange-500/30 rounded-xl p-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {order.type === 'repair' ? <Wrench className="w-4 h-4 text-orange-400" /> : <Package className="w-4 h-4 text-blue-400" />}
                        <span className="text-sm font-medium">{order.type === 'repair' ? order.repair?.description?.slice(0, 40) : order.courier?.packageDescription}</span>
                      </div>
                      <span className="text-sm font-bold text-orange-400">{order.price?.total.toFixed(2)}€</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-3 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {order.type === 'repair' ? 'Calle Gran Vía 28, Madrid' : order.courier?.pickupAddress?.street}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(order.id)} className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Aceptar
                      </button>
                      <button onClick={() => updateOrderStatus(order.id, 'cancelled', 'Rechazado por profesional')} className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
                        <XCircle className="w-4 h-4" /> Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active */}
            {activeOrders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><Navigation className="w-4 h-4" /> En progreso</h3>
                {activeOrders.map(order => (
                  <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {order.type === 'repair' ? <Wrench className="w-4 h-4 text-orange-400" /> : <Package className="w-4 h-4 text-blue-400" />}
                        <span className="text-sm font-medium">{order.type === 'repair' ? order.repair?.description?.slice(0, 40) : order.courier?.packageDescription}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-400">{STATUS_LABELS[order.status]}</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">
                      <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {order.type === 'repair' ? 'Calle Gran Vía 28, Madrid' : order.courier?.deliveryAddress?.street}</div>
                      {order.eta && <div className="flex items-center gap-2 mt-1"><Clock className="w-3 h-3" /> ETA: {order.eta} min</div>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAdvance(order.id, order.status)} className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
                        <ChevronRight className="w-4 h-4" /> Avanzar estado
                      </button>
                      <button onClick={() => addEvidence(order.id, { type: 'photo', by: user.id })} className="px-3 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-sm transition">
                        📷
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pendingOrders.length === 0 && activeOrders.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No tienes trabajos activos</p>
                <p className="text-xs mt-1">Activa tu disponibilidad para recibir nuevos</p>
              </div>
            )}

            {/* Completed */}
            {completedToday.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-2">Completados hoy</h3>
                {completedToday.map(order => (
                  <div key={order.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-sm">{order.type === 'repair' ? order.repair?.description?.slice(0, 30) : order.courier?.packageDescription?.slice(0, 30)}</span>
                    </div>
                    <span className="text-sm font-medium text-green-400">{order.price?.total.toFixed(2)}€</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400">{todayEarnings.toFixed(2)}€</div>
              <div className="text-sm text-slate-400 mt-1">Ganancias de hoy</div>
              <div className="text-xs text-slate-500 mt-2">Comisión plataforma: 15% · Liquidación semanal</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-medium mb-3">Resumen semanal</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Servicios completados</span><span>{completedToday.length}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Ingresos brutos</span><span>{todayEarnings.toFixed(2)}€</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Comisión (15%)</span><span className="text-red-400">-{(todayEarnings * 0.15).toFixed(2)}€</span></div>
                <div className="border-t border-slate-800 pt-2 flex justify-between font-bold"><span>Neto</span><span className="text-green-400">{(todayEarnings * 0.85).toFixed(2)}€</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-xl font-bold">{user.name.charAt(0)}</div>
                <div>
                  <h3 className="font-bold">{user.name}</h3>
                  <p className="text-sm text-slate-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">KYC ✓</span>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs">Verificado</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Teléfono</span><span>{user.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Valoración</span><span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {user.rating}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Servicios</span><span>{user.totalJobs}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Tarifa/hora</span><span>45€</span></div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
