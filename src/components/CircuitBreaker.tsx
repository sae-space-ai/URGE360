import { useState, useEffect } from 'react';
import { Zap, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerProps {
  serviceName: string;
  failureThreshold?: number;
  recoveryTimeout?: number;
}

export function CircuitBreaker({ serviceName, failureThreshold = 5, recoveryTimeout = 30000 }: CircuitBreakerProps) {
  const [state, setState] = useState<CircuitState>('closed');
  const [failures, setFailures] = useState(0);
  const [lastFailure, setLastFailure] = useState<Date | null>(null);
  const [requests, setRequests] = useState<{ success: boolean; timestamp: Date }[]>([]);

  // Simular llamadas al servicio
  const callService = () => {
    const shouldFail = Math.random() < 0.3; // 30% probabilidad de fallo
    const request = { success: !shouldFail, timestamp: new Date() };
    setRequests(prev => [...prev.slice(-19), request]);

    if (shouldFail) {
      setFailures(prev => prev + 1);
      setLastFailure(new Date());
      if (failures + 1 >= failureThreshold && state === 'closed') {
        setState('open');
        setTimeout(() => {
          setState('half-open');
          setFailures(0);
        }, recoveryTimeout);
      }
    } else {
      if (state === 'half-open') {
        setState('closed');
        setFailures(0);
      }
    }
  };

  const reset = () => {
    setState('closed');
    setFailures(0);
    setRequests([]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400" />
          <h4 className="text-sm font-medium">{serviceName}</h4>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          state === 'closed' ? 'bg-green-500/10 text-green-400' :
          state === 'half-open' ? 'bg-yellow-500/10 text-yellow-400' :
          'bg-red-500/10 text-red-400'
        }`}>
          {state === 'closed' ? 'Operativo' : state === 'half-open' ? 'Recuperando' : 'Caído'}
        </div>
      </div>

      {/* Visual representation */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${
          state === 'closed' ? 'bg-green-500' :
          state === 'half-open' ? 'bg-yellow-500 animate-pulse' :
          'bg-red-500'
        }`} />
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              state === 'closed' ? 'bg-green-500' :
              state === 'half-open' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: state === 'closed' ? '100%' : state === 'half-open' ? '50%' : '0%' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-lg font-bold text-green-400">
            {requests.filter(r => r.success).length}
          </div>
          <div className="text-[10px] text-slate-400">Éxitos</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-lg font-bold text-red-400">{failures}</div>
          <div className="text-[10px] text-slate-400">Fallos</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="text-lg font-bold text-blue-400">{failureThreshold}</div>
          <div className="text-[10px] text-slate-400">Umbral</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={callService}
          disabled={state === 'open'}
          className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg text-xs transition"
        >
          Simular llamada
        </button>
        <button
          onClick={reset}
          className="px-3 bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-xs transition"
        >
          Reset
        </button>
      </div>

      {lastFailure && (
        <div className="mt-3 text-[10px] text-slate-500 text-center">
          Último fallo: {lastFailure.toLocaleTimeString('es-ES')}
        </div>
      )}
    </div>
  );
}

export function CircuitBreakerPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-orange-400" />
        <h3 className="font-medium">Circuit Breakers</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <CircuitBreaker serviceName="AI Triage Engine" failureThreshold={3} recoveryTimeout={20000} />
        <CircuitBreaker serviceName="Payment Gateway" failureThreshold={5} recoveryTimeout={30000} />
        <CircuitBreaker serviceName="Maps API" failureThreshold={4} recoveryTimeout={25000} />
        <CircuitBreaker serviceName="Notification Service" failureThreshold={6} recoveryTimeout={15000} />
      </div>
    </div>
  );
}
