import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Users, Package, Wrench, Settings, DollarSign, Shield, BarChart3, LogOut, TrendingUp, AlertTriangle, CheckCircle2, Database, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';

export function AdminDashboard() {
  const user = useStore(s => s.currentUser);
  const users = useStore(s => s.users);
  const orders = useStore(s => s.orders);
  const professionals = useStore(s => s.professionals);
  const auditLogs = useStore(s => s.auditLogs);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'providers' | 'pricing' | 'compliance' | 'audit'>('overview');

  if (!user) return null;

  const totalGMV = orders.reduce((sum, o) => sum + (o.price?.total || 0), 0);
  const commission = totalGMV * 0.15;
  const avgRating = orders.filter(o => o.rating).reduce((sum, o) => sum + (o.rating?.score || 0), 0) / (orders.filter(o => o.rating).length || 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="fixed top-0 w-full z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">URGE<span className="text-purple-400">360</span> <span className="text-slate-500 text-xs">ADMIN</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:block">{user.name}</span>
            <button onClick={() => { useStore.getState().logout(); navigate('/'); }} className="text-slate-400 hover:text-red-400">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="pt-14 flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-14 bottom-0 w-56 bg-slate-900 border-r border-slate-800 p-4 hidden lg:block">
          <nav className="space-y-1">
            {[
              { id: 'overview', icon: BarChart3, label: 'Overview' },
              { id: 'users', icon: Users, label: 'Usuarios' },
              { id: 'providers', icon: Wrench, label: 'Proveedores' },
              { id: 'pricing', icon: DollarSign, label: 'Tarifas' },
              { id: 'compliance', icon: Shield, label: 'Compliance' },
              { id: 'audit', icon: FileText, label: 'Auditoría' },
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${activeTab === item.id ? 'bg-purple-500/10 text-purple-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile tabs */}
        <div className="lg:hidden fixed top-14 left-0 right-0 bg-slate-900 border-b border-slate-800 px-4 py-2 overflow-x-auto z-30">
          <div className="flex gap-2">
            {['overview', 'users', 'providers', 'pricing', 'compliance', 'audit'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeTab === tab ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 lg:ml-56 px-4 py-6 mt-10 lg:mt-0">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Panel de control</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold">{totalGMV.toFixed(0)}€</div>
                  <div className="text-xs text-slate-400">GMV total</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <span className="text-xs text-purple-400">15%</span>
                  </div>
                  <div className="text-2xl font-bold">{commission.toFixed(0)}€</div>
                  <div className="text-xs text-slate-400">Comisión plataforma</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    <span className="text-xs text-blue-400">+12%</span>
                  </div>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <div className="text-xs text-slate-400">Pedidos totales</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-orange-400" />
                    <span className="text-xs text-orange-400">+5%</span>
                  </div>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <div className="text-xs text-slate-400">Usuarios registrados</div>
                </div>
              </div>

              {/* KPIs */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-medium mb-4">Unit Economics</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><div className="text-xs text-slate-400">Take-rate</div><div className="text-lg font-bold">15%</div></div>
                  <div><div className="text-xs text-slate-400">Valoración media</div><div className="text-lg font-bold">{avgRating.toFixed(1)}★</div></div>
                  <div><div className="text-xs text-slate-400">Fill-rate</div><div className="text-lg font-bold">94%</div></div>
                  <div><div className="text-xs text-slate-400">ETA medio</div><div className="text-lg font-bold">18 min</div></div>
                  <div><div className="text-xs text-slate-400">CAC</div><div className="text-lg font-bold">12€</div></div>
                  <div><div className="text-xs text-slate-400">LTV</div><div className="text-lg font-bold">180€</div></div>
                  <div><div className="text-xs text-slate-400">NPS</div><div className="text-lg font-bold">72</div></div>
                  <div><div className="text-xs text-slate-400">Fraude detectado</div><div className="text-lg font-bold text-green-400">0.3%</div></div>
                </div>
              </div>

              {/* Recent orders */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-medium mb-4">Últimos pedidos</h3>
                <div className="space-y-2">
                  {orders.slice(-5).reverse().map(o => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                      <div className="flex items-center gap-2">
                        {o.type === 'repair' ? <Wrench className="w-4 h-4 text-orange-400" /> : <Package className="w-4 h-4 text-blue-400" />}
                        <span className="text-sm">{o.id}</span>
                      </div>
                      <span className="text-sm font-medium">{o.price?.total.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Usuarios ({users.length})</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-slate-400">Nombre</th>
                      <th className="text-left p-3 font-medium text-slate-400">Email</th>
                      <th className="text-left p-3 font-medium text-slate-400">Rol</th>
                      <th className="text-left p-3 font-medium text-slate-400">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-t border-slate-800">
                        <td className="p-3">{u.name}</td>
                        <td className="p-3 text-slate-400">{u.email}</td>
                        <td className="p-3"><span className="px-2 py-0.5 bg-slate-800 rounded text-xs">{u.role}</span></td>
                        <td className="p-3">{u.verified ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-yellow-400" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Proveedores ({professionals.length})</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {professionals.map(pro => {
                  const proUser = users.find(u => u.id === pro.userId);
                  return (
                    <div key={pro.userId} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold">{proUser?.name.charAt(0)}</div>
                        <div>
                          <div className="font-medium">{proUser?.name}</div>
                          <div className="text-xs text-slate-400">{proUser?.email}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-slate-400">Oficios:</span> {pro.trades.join(', ')}</div>
                        <div><span className="text-slate-400">Zonas:</span> {pro.zones.length} CPs</div>
                        <div><span className="text-slate-400">Rating:</span> ★{pro.rating}</div>
                        <div><span className="text-slate-400">Jobs:</span> {pro.completedJobs}</div>
                        <div><span className="text-slate-400">Tarifa:</span> {pro.hourlyRate}€/h</div>
                        <div><span className="text-slate-400">KYC:</span> <span className={pro.kycStatus === 'approved' ? 'text-green-400' : 'text-yellow-400'}>{pro.kycStatus}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Configuración de tarifas</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Comisión plataforma</label>
                    <div className="bg-slate-800 rounded-lg px-4 py-2.5 text-sm">15%</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Tarifa base reparación</label>
                    <div className="bg-slate-800 rounded-lg px-4 py-2.5 text-sm">25.00€</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Tarifa base mensajería</label>
                    <div className="bg-slate-800 rounded-lg px-4 py-2.5 text-sm">5.00€</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Suplemento urgencia</label>
                    <div className="bg-slate-800 rounded-lg px-4 py-2.5 text-sm">15.00€ / 30.00€</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Coste por km (mensajería)</label>
                    <div className="bg-slate-800 rounded-lg px-4 py-2.5 text-sm">1.20€/km</div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Seguro incluido</label>
                    <div className="bg-slate-800 rounded-lg px-4 py-2.5 text-sm">Hasta 500€</div>
                  </div>
                </div>
                <div className="border-t border-slate-800 pt-4">
                  <h3 className="text-sm font-medium mb-2">Planes profesionales</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-sm font-medium">Básico</div>
                      <div className="text-xs text-slate-400">Comisión 15% · Sin cuota</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 border border-purple-500/30">
                      <div className="text-sm font-medium">Pro</div>
                      <div className="text-xs text-slate-400">Comisión 10% · 29€/mes</div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="text-sm font-medium">Enterprise</div>
                      <div className="text-xs text-slate-400">Comisión 7% · Custom</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Compliance & Legal</h2>
              <div className="space-y-3">
                {[
                  { title: 'RGPD / ePrivacy', status: 'active', desc: 'Consentimiento granular, derechos ARCO+, DPA con subencargados' },
                  { title: 'Ley de Consumo', status: 'active', desc: 'Derecho desistimiento 14 días, información precontractual' },
                  { title: 'LSSI-CE', status: 'active', desc: 'Aviso legal, condiciones, cookies' },
                  { title: 'Facturación (RD 1619/2012)', status: 'active', desc: 'Factura electrónica, conservación 4 años' },
                  { title: 'Protección trabajadores', status: 'active', desc: 'Alta RETA/RETA, prevención riesgos' },
                  { title: 'AI Act (EU 2024/1689)', status: 'review', desc: 'Sistema limited-risk, transparencia IA, registro decisiones' },
                  { title: 'Registro actividades tratamiento', status: 'active', desc: 'Actualizado con DPO designado' },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">
                        {item.status === 'active' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${item.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {item.status === 'active' ? 'Conforme' : 'En revisión'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="text-sm font-medium text-yellow-400 mb-1">⚠️ Nota legal</div>
                <p className="text-xs text-slate-300">Este panel es una simulación. La implementación legal real requiere revisión por abogado y DPO. Las decisiones sobre datos personales, IA y fiscalidad deben ser validadas por profesionales cualificados.</p>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Log de auditoría</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Los eventos de auditoría aparecerán aquí</p>
                    <p className="text-xs mt-1">Login, cambios de estado, asignaciones, pagos</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.map(log => (
                      <div key={log.id} className="flex items-center gap-3 text-xs py-2 border-b border-slate-800 last:border-0">
                        <span className="text-slate-500">{new Date(log.at).toLocaleString('es')}</span>
                        <span className="text-slate-400">{log.actor}</span>
                        <span className="text-white">{log.action}</span>
                        <span className="text-slate-500">{log.target}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
