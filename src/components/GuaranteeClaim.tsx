import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';

interface Claim {
  id: string;
  orderId: string;
  type: 'quality' | 'delay' | 'damage' | 'overcharge' | 'other';
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  createdAt: string;
  resolution?: string;
}

interface GuaranteeClaimProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GuaranteeClaim({ orderId, isOpen, onClose }: GuaranteeClaimProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<Claim['type']>('quality');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) return;
    const newClaim: Claim = {
      id: crypto.randomUUID(),
      orderId,
      type,
      description,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setClaims(prev => [...prev, newClaim]);
    setShowForm(false);
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-bold">Garantía y Reclamaciones</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-green-400 font-medium mb-1">
            <CheckCircle2 className="w-4 h-4" /> Garantía URGE360
          </div>
          <p className="text-xs text-slate-300">
            Todos nuestros servicios tienen 30 días de garantía. Si no estás satisfecho, puedes abrir una reclamación y nuestro equipo la revisará en 24-48h.
          </p>
        </div>

        {/* Existing claims */}
        {claims.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Mis reclamaciones</h4>
            <div className="space-y-2">
              {claims.map(claim => (
                <div key={claim.id} className="bg-slate-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium capitalize">{claim.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      claim.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      claim.status === 'reviewing' ? 'bg-blue-500/10 text-blue-400' :
                      claim.status === 'resolved' ? 'bg-green-500/10 text-green-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {claim.status === 'pending' ? 'Pendiente' :
                       claim.status === 'reviewing' ? 'En revisión' :
                       claim.status === 'resolved' ? 'Resuelta' : 'Rechazada'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{claim.description}</p>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {new Date(claim.createdAt).toLocaleDateString('es-ES')}
                  </div>
                  {claim.resolution && (
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <p className="text-xs text-slate-400">{claim.resolution}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New claim form */}
        {showForm ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Tipo de incidencia</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as Claim['type'])}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="quality">Calidad del servicio</option>
                <option value="delay">Retraso excesivo</option>
                <option value="damage">Daños causados</option>
                <option value="overcharge">Cobro incorrecto</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Descripción</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe el problema con detalle..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm resize-none h-24 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-lg text-sm transition">
                Cancelar
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-orange-500 hover:bg-orange-600 py-2.5 rounded-lg text-sm font-medium transition">
                Enviar reclamación
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" /> Abrir nueva reclamación
          </button>
        )}

        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
            <div className="text-xs text-slate-400">
              <strong className="text-slate-300">Plazos de resolución:</strong><br/>
              • Reclamaciones simples: 24-48h<br/>
              • Casos complejos: 5-7 días laborables<br/>
              • Reembolsos: 3-5 días tras aprobación
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
