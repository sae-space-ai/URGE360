import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Package, Shield, Clock, Star, Zap, MapPin, ChevronRight, Menu, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = useStore(s => s.currentUser);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">URGE<span className="text-orange-500">360</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#servicios" className="hover:text-orange-400 transition">Servicios</a>
            <a href="#como-funciona" className="hover:text-orange-400 transition">Cómo funciona</a>
            <a href="#profesionales" className="hover:text-orange-400 transition">Profesionales</a>
            <a href="#precios" className="hover:text-orange-400 transition">Precios</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate(`/${user.role === 'client' ? 'client' : user.role === 'professional' ? 'professional' : user.role === 'ops' ? 'ops' : 'admin'}`)} className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition">
                Mi panel
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/auth')} className="text-sm hover:text-orange-400 transition hidden sm:block">Iniciar sesión</button>
                <button onClick={() => navigate('/auth?mode=register')} className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition">Empezar</button>
              </>
            )}
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 py-4 space-y-3">
            <a href="#servicios" className="block text-sm">Servicios</a>
            <a href="#como-funciona" className="block text-sm">Cómo funciona</a>
            <a href="#precios" className="block text-sm">Precios</a>
            <button onClick={() => navigate('/auth')} className="block text-sm text-orange-400">Iniciar sesión</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-sm text-orange-400 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Operativo en Madrid · Barcelona · Valencia
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Tu hogar resuelto en <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">minutos</span>
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-xl">
                Reparaciones urgentes y mensajería última milla. IA que diagnostica, profesionales verificados, precio cerrado antes de confirmar, tracking en tiempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/auth?mode=register')} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-8 py-4 rounded-xl font-semibold text-lg transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                  Necesito ayuda ahora <ChevronRight className="w-5 h-5" />
                </button>
                <button onClick={() => navigate('/auth?mode=register')} className="border border-slate-700 hover:border-orange-500/50 px-8 py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2">
                  <Package className="w-5 h-5" /> Enviar un paquete
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-slate-400">
                <div className="flex items-center gap-1"><Shield className="w-4 h-4 text-green-400" /> Profesionales verificados</div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-400" /> ETA medio 15 min</div>
                <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> 4.8/5 valoración</div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-500 ml-2">URGE360 — Solicitud en curso</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-orange-400 mb-2">
                      <Wrench className="w-4 h-4" /> Fontanería urgente
                    </div>
                    <p className="text-sm text-slate-300">Fuga en tubería del baño</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Gran Vía 28, Madrid</span>
                      <span className="text-green-400">ETA: 8 min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full w-3/5" />
                    </div>
                    <span className="text-xs text-green-400">En camino</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">73.50€</div>
                      <div className="text-xs text-slate-400">Precio cerrado</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">4.8★</div>
                      <div className="text-xs text-slate-400">Profesional</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-white">342</div>
                      <div className="text-xs text-slate-400">Servicios</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Dos servicios, una plataforma</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-orange-500/30 transition">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Reparaciones urgentes</h3>
              <p className="text-slate-400 mb-4">Fontanería, electricidad, cerrajería, climatización, persianas, cristalería, electrodomésticos. IA diagnostica, profesional asignado en minutos.</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full" /> Diagnóstico IA por texto, foto o voz</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full" /> Precio cerrado antes de confirmar</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full" /> Profesionales verificados con KYC</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full" /> Garantía de satisfacción 30 días</li>
              </ul>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/30 transition">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Mensajería última milla</h3>
              <p className="text-slate-400 mb-4">Recogida y entrega en la misma hora. Documentos, paquetes, urgente. Tracking GPS, OTP, foto y firma de entrega.</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Recogida en 30 minutos</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Código OTP + foto + firma</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Tracking GPS en tiempo real</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Seguro incluido hasta 500€</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Cómo funciona</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Describe', desc: 'Texto, foto o voz. La IA clasifica oficio, urgencia y riesgo.' },
              { step: '02', title: 'Precio cerrado', desc: 'Ves el desglose antes de confirmar. Sin sorpresas.' },
              { step: '03', title: 'Asignación', desc: 'Dispatch automático por ETA, skill, zona y calidad.' },
              { step: '04', title: 'Resuelto', desc: 'Tracking, chat, evidencias, pago y valoración.' },
            ].map(item => (
              <div key={item.step} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="text-3xl font-bold text-orange-500/30 mb-2">{item.step}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo access */}
      <section className="py-16 px-4 bg-gradient-to-br from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Acceso demo</h2>
          <p className="text-slate-400 mb-8">Prueba todos los roles con cuentas de demostración</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: 'Cliente', email: 'maria@demo.es', color: 'orange' },
              { role: 'Profesional', email: 'pro@demo.es', color: 'blue' },
              { role: 'Operaciones', email: 'ops@demo.es', color: 'green' },
              { role: 'Admin', email: 'admin@demo.es', color: 'purple' },
            ].map(d => (
              <button key={d.email} onClick={() => { useStore.getState().login(d.email, 'demo'); navigate(`/${d.role === 'Cliente' ? 'client' : d.role === 'Profesional' ? 'professional' : d.role === 'Operaciones' ? 'ops' : 'admin'}`); }} className={`bg-slate-800 border border-slate-700 hover:border-${d.color}-500/50 rounded-xl p-4 text-left transition`}>
                <div className={`text-sm font-medium text-${d.color}-400`}>{d.role}</div>
                <div className="text-xs text-slate-400 mt-1">{d.email}</div>
                <div className="text-xs text-slate-500 mt-1">password: demo</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">URGE360</span>
          </div>
          <div className="text-sm text-slate-500">© 2024 URGE360 · RGPD compliant · España</div>
        </div>
      </footer>
    </div>
  );
}
