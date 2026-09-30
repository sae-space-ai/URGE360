import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(params.get('mode') === 'register' ? 'register' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const login = useStore(s => s.login);
  const register = useStore(s => s.register);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      const user = useStore.getState().currentUser;
      if (user) {
        const path = user.role === 'client' ? '/client' : user.role === 'professional' ? '/professional' : user.role === 'ops' ? '/ops' : '/admin';
        navigate(path);
      }
    } else {
      setError('Credenciales incorrectas. Usa las cuentas demo.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !name || !phone) { setError('Completa todos los campos'); return; }
    const user = register({ email, name, phone, role: 'client' });
    navigate('/client');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </button>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">URGE<span className="text-orange-500">360</span></h1>
              <p className="text-xs text-slate-400">{mode === 'login' ? 'Accede a tu cuenta' : 'Crea tu cuenta'}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'login' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Iniciar sesión</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === 'register' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Registrarse</button>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 mb-4">{error}</div>}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none transition" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input type="tel" placeholder="+34 612 345 678" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none transition" />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none transition" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none transition" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 py-3 rounded-lg font-semibold transition">
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-400 mb-2 font-medium">Cuentas demo:</p>
            <div className="space-y-1 text-xs text-slate-500">
              <div><span className="text-orange-400">Cliente:</span> maria@demo.es</div>
              <div><span className="text-blue-400">Profesional:</span> pro@demo.es</div>
              <div><span className="text-green-400">Operaciones:</span> ops@demo.es</div>
              <div><span className="text-purple-400">Admin:</span> admin@demo.es</div>
              <div className="text-slate-600 mt-1">Password: cualquiera</div>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center mt-6">
            Al continuar aceptas nuestros <a href="#" className="text-orange-400">Términos</a> y <a href="#" className="text-orange-400">Política de privacidad</a> (RGPD).
          </p>
        </div>
      </div>
    </div>
  );
}
