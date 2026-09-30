import { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';

interface SignatureProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureData: string) => void;
  title?: string;
}

export function Signature({ isOpen, onClose, onSign, title = 'Firma de entrega' }: SignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        setHasSignature(false);
      }
    }
  }, [isOpen]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = () => {
    if (!hasSignature || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSign(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-4">Firma en el recuadro para confirmar la entrega</p>
        <div className="border-2 border-dashed border-slate-700 rounded-xl overflow-hidden mb-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <div className="flex gap-3">
          <button onClick={clear} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-lg text-sm transition">
            <RotateCcw className="w-4 h-4" /> Borrar
          </button>
          <button
            onClick={handleSign}
            disabled={!hasSignature}
            className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <Check className="w-4 h-4" /> Confirmar firma
          </button>
        </div>
      </div>
    </div>
  );
}
