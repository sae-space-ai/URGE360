import { useState } from 'react';
import { Flag, ToggleLeft, ToggleRight } from 'lucide-react';

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: 'production' | 'staging' | 'development';
}

export function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    {
      key: 'ai_triage_v2',
      name: 'AI Triage v2',
      description: 'Nueva versión del motor de triage con mejor precisión',
      enabled: true,
      environment: 'production'
    },
    {
      key: 'batch_dispatch',
      name: 'Dispatch por lotes',
      description: 'Optimización VRP para mensajería con múltiples paquetes',
      enabled: false,
      environment: 'staging'
    },
    {
      key: 'voice_input',
      name: 'Entrada por voz',
      description: 'Descripción de problemas mediante nota de voz',
      enabled: true,
      environment: 'production'
    },
    {
      key: 'subscription_plans',
      name: 'Planes de suscripción',
      description: 'Suscripciones mensuales para clientes frecuentes',
      enabled: false,
      environment: 'development'
    },
    {
      key: 'real_time_tracking',
      name: 'Tracking en tiempo real',
      description: 'Actualización GPS cada 5 segundos',
      enabled: true,
      environment: 'production'
    },
    {
      key: 'multi_language',
      name: 'Multi-idioma',
      description: 'Soporte para inglés, catalán, euskera y gallego',
      enabled: false,
      environment: 'staging'
    },
  ]);

  const toggleFlag = (key: string) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Flag className="w-5 h-5 text-purple-400" />
          <h3 className="font-medium">Feature Flags</h3>
          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full text-xs">
            {enabledCount}/{flags.length} activos
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {flags.map(flag => (
          <div key={flag.key} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{flag.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                  flag.environment === 'production' ? 'bg-green-500/10 text-green-400' :
                  flag.environment === 'staging' ? 'bg-yellow-500/10 text-yellow-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {flag.environment}
                </span>
              </div>
              <p className="text-xs text-slate-400">{flag.description}</p>
            </div>
            <button
              onClick={() => toggleFlag(flag.key)}
              className="ml-4 text-slate-400 hover:text-white transition"
            >
              {flag.enabled ? (
                <ToggleRight className="w-8 h-8 text-green-400" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400">
          <strong className="text-slate-300">Nota:</strong> Los cambios en feature flags se aplican inmediatamente sin necesidad de redeploy. Usa con precaución en producción.
        </p>
      </div>
    </div>
  );
}
