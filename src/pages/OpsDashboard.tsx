import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, MapPin, Clock, Users, Package, Wrench, AlertTriangle, CheckCircle2, XCircle, Search, Filter, RefreshCw, LogOut, Eye, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Order, OrderStatus, Professional } from '../types';

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

export function OpsDashboard() {
  const user = useStore(s => s.currentUser);
  const orders = useStore(s => s.orders);
  const professionals = useStore(s => s.professionals);
  const users = useStore(s => s.users);
  const manualDispatch = useStore(s => s.manualDispatch);
  const autoDispatch = useStore(s => s.autoDispatch);
  const updateOrderStatus = useStore(s => s.updateOrderStatus);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDispatch, setShowDispatch] = useState(false);

  if (!user) return null;

  const filteredOrders = orders.filter(o => {
    if (filter === 'pending') return ['created', 'triaged', 'quoted', 'confirmed'].includes(o.status);
    if (filter === 'active') return ['assigned', 'en_route', 'arrived', 'in_progress', 'picked_up'].includes(o.status);
    if (filter === 'completed') return ['completed', 'delivered', 'paid', 'rated'].includes(o.status);
    return true;
  });

  const stats = {
    total: orders.length,
    active: orders.filter(o => ['assigned', 'en_route', 'arrived', 'in_progress', 'picked_up'].includes(o.status)).length,
    pending: orders.filter(o => ['created', 'triaged', 'quoted', 'confirmed'].includes(o.status)).length,
    availablePros: professionals.filter(p => p.available).length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="fixed top-0 w-full z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">URGE<span className="text-green-400">360</span> <span className="text-slate-500 text-xs">OPS</span></span>
          </div>
          <button onClick={() => { useStore.getState().logout(); navigate('/'); }} className="text-slate-400 hover:text-red-400">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="pt-14 max-w-7xl mx-auto px-4 pb-20">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 py-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-slate-400">Total pedidos</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-400">{stats.active}</div>
            <div className="text-xs text-slate-400">En curso</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-xs text-slate-400">Pendientes</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">{stats.availablePros}</div>
            <div className="text-xs text-slate-400">Profesionales disponibles</div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-52 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <svg viewBox="0 0 800 300" className="w-full h-full">
              {/* Grid */}
              {Array.from({ length: 20 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" stroke="currentColor" strokeWidth="0.5" className="text-slate-700" />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} stroke="currentColor" strokeWidth="0.5" className="text-slate-700" />
              ))}
              {/* Professionals */}
              {professionals.filter(p => p.available).map((p, i) => (
                <g key={p.userId}>
                  <circle cx={200 + i * 150} cy={100 + i * 40} r="8" className="fill-blue-500 animate-pulse" />
                  <text x={200 + i * 150 + 12} y={100 + i * 40 + 4} className="fill-slate-400 text-[10px]">
                    {users.find(u => u.id === p.userId)?.name?.split(' ')[0]}
                  </text>
                </g>
              ))}
              {/* Orders */}
              {orders.filter(o => ['assigned', 'en_route'].includes(o.status)).map((o, i) => (
                <circle key={o.id} cx={300 + i * 100} cy={150 + i * 30} r="6" className="fill-orange-500" />
              ))}
            </svg>
          </div>
          <div className="relative z-10 flex items-center justify-between h-full">
            <div>
              <h3 className="font-bold text-lg">Mapa de operaciones</h3>
              <p className="text-sm text-slate-400">{stats.availablePros} profesionales · {stats.active} servicios activos</p>
            </div>
            <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          {(['all', 'pending', 'active', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filter === f ? 'bg-green-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : f === 'active' ? 'Activos' : 'Completados'}
            </button>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="text-left p-3 font-medium text-slate-400">ID</th>
                  <th className="text-left p-3 font-medium text-slate-400">Tipo</th>
                  <th className="text-left p-3 font-medium text-slate-400">Descripción</th>
                  <th className="text-left p-3 font-medium text-slate-400">Estado</th>
                  <th className="text-left p-3 font-medium text-slate-400">Profesional</th>
                  <th className="text-left p-3 font-medium text-slate-400">Precio</th>
                  <th className="text-left p-3 font-medium text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const pro = users.find(u => u.id === order.professionalId);
                  return (
                    <tr key={order.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                      <td className="p-3 font-mono text-xs">{order.id}</td>
                      <td className="p-3">{order.type === 'repair' ? <Wrench className="w-4 h-4 text-orange-400" /> : <Package className="w-4 h-4 text-blue-400" />}</td>
                      <td className="p-3 max-w-[200px] truncate">{order.type === 'repair' ? order.repair?.description?.slice(0, 40) : order.courier?.packageDescription}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] text-white ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span></td>
                      <td className="p-3 text-xs">{pro?.name || '—'}</td>
                      <td className="p-3 font-medium">{order.price?.total.toFixed(2)}€</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button onClick={() => { setSelectedOrder(order); setShowDispatch(true); }} className="p-1.5 bg-slate-800 rounded hover:bg-slate-700" title="Ver/Asignar">
                            <Eye className="w-3 h-3" />
                          </button>
                          {!order.professionalId && (
                            <button onClick={() => autoDispatch(order.id)} className="p-1.5 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30" title="Auto-asignar">
                              <Send className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Professionals list */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Profesionales en línea</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {professionals.filter(p => p.available).map(pro => {
              const proUser = users.find(u => u.id === pro.userId);
              return (
                <div key={pro.userId} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-medium text-sm">{proUser?.name.charAt(0)}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{proUser?.name}</div>
                      <div className="text-xs text-slate-400">{pro.trades.join(', ')} · {pro.completedJobs} jobs</div>
                    </div>
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Dispatch Modal */}
      {showDispatch && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowDispatch(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Detalle pedido #{selectedOrder.id}</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Tipo</span><span>{selectedOrder.type === 'repair' ? 'Reparación' : 'Mensajería'}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Estado</span><span className={STATUS_COLORS[selectedOrder.status] + ' px-2 py-0.5 rounded-full text-[10px] text-white'}>{STATUS_LABELS[selectedOrder.status]}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Precio</span><span>{selectedOrder.price?.total.toFixed(2)}€</span></div>
              {selectedOrder.triage && (
                <>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Oficio</span><span>{selectedOrder.triage.category}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-400">Riesgo</span><span>{selectedOrder.triage.risk}</span></div>
                </>
              )}
            </div>
            {!selectedOrder.professionalId && (
              <>
                <h4 className="text-sm font-medium mb-2">Asignar manualmente</h4>
                <div className="space-y-2">
                  {professionals.filter(p => p.available).map(pro => {
                    const proUser = users.find(u => u.id === pro.userId);
                    return (
                      <button key={pro.userId} onClick={() => { manualDispatch(selectedOrder.id, pro.userId); setShowDispatch(false); }} className="w-full bg-slate-800 hover:bg-slate-700 rounded-lg p-3 text-left transition flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{proUser?.name}</div>
                          <div className="text-xs text-slate-400">{pro.trades.join(', ')} · ★{pro.rating}</div>
                        </div>
                        <Send className="w-4 h-4 text-green-400" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            <button onClick={() => setShowDispatch(false)} className="w-full mt-4 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-sm">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
