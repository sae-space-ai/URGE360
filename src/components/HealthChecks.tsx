import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  message?: string;
}

export function HealthChecks() {
  const [statuses, setStatuses] = useState<HealthStatus[]>([
    { service: 'API Gateway', status: 'healthy', latency: 45 },
    { service: 'PostgreSQL', status: 'healthy', latency: 12 },
    { service: 'Redis Cache', status: 'healthy', latency: 3 },
    { service: 'AI Triage Engine', status: 'healthy', latency: 230 },
    { service: 'Payment Gateway', status: 'healthy', latency: 180 },
    { service: 'Maps/Geocoding', status: 'healthy', latency: 95 },
    { service: 'Notification Service', status: 'healthy', latency: 28 },
    { service: 'Object Storage', status: 'healthy', latency: 67 },
  ]);
  const [lastCheck, setLastCheck] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simular check con posibles degradaciones
      const newStatuses = statuses.map(s => ({
        ...s,
        status: Math.random() > 0.95 ? 'degraded' as const : 'healthy' as const,
        latency: Math.floor(Math.random() * 200) + 10
      }));
      setStatuses(newStatuses);
      setLastCheck(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const overallStatus = statuses.every(s => s.status === 'healthy')
    ? 'healthy'
    : statuses.some(s => s.status === 'down')
      ? 'down'
      : 'degraded';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-green-400" />
          <h3 className="font-medium">Estado del sistema</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            overallStatus === 'healthy' ? 'bg-green-500/10 text-green-400' :
            overallStatus === 'degraded' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {overallStatus === 'healthy' ? 'Operativo' : overallStatus === 'degraded' ? 'Degradado' : 'Caído'}
          </span>
        </div>
        <button onClick={refresh} disabled={isRefreshing} className="p-2 hover:bg-slate-800 rounded-lg transition">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-2">
        {statuses.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
            <div className="flex items-center gap-2">
              {s.status === 'healthy' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
              {s.status === 'degraded' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
              {s.status === 'down' && <XCircle className="w-4 h-4 text-red-400" />}
              <span className="text-sm">{s.service}</span>
            </div>
            <div className="flex items-center gap-3">
              {s.latency && (
                <span className={`text-xs ${s.latency > 200 ? 'text-yellow-400' : 'text-slate-400'}`}>
                  {s.latency}ms
                </span>
              )}
              <div className={`w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${
                    s.status === 'healthy' ? 'bg-green-500' :
                    s.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: s.status === 'healthy' ? '100%' : s.status === 'degraded' ? '60%' : '0%' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-500 text-center">
        Última verificación: {lastCheck.toLocaleTimeString('es-ES')}
      </div>
    </div>
  );
}
