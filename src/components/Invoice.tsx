import { FileText, Download, X } from 'lucide-react';
import type { Order, User } from '../types';

interface InvoiceProps {
  order: Order;
  client: User;
  professional?: User;
  isOpen: boolean;
  onClose: () => void;
}

export function Invoice({ order, client, professional, isOpen, onClose }: InvoiceProps) {
  if (!isOpen || !order.price) return null;

  const price = order.price;
  const invoiceNumber = `URGE360-${order.id.replace('ord-', '').toUpperCase()}`;
  const issueDate = new Date(order.updatedAt).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const iva = price.total * 0.21;
  const baseImponible = price.total - iva;

  const handleDownload = () => {
    // Simulación de descarga de factura
    const content = `
FACTURA ${invoiceNumber}
================================
Fecha: ${issueDate}

URGE360 PLATFORM S.L.
CIF: B-12345678
Calle de la Innovación 42, 28001 Madrid

CLIENTE:
${client.name}
${client.address?.street || ''}
${client.address?.city || ''} ${client.address?.postalCode || ''}
${client.email}

${professional ? `PROFESIONAL:\n${professional.name}\n` : ''}
SERVICIO: ${order.type === 'repair' ? 'Reparación' : 'Mensajería'}
Descripción: ${order.type === 'repair' ? order.repair?.description : order.courier?.packageDescription}

DESGLOSE:
- Tarifa base: ${price.base.toFixed(2)}€
- Distancia: ${price.distance.toFixed(2)}€
- Tiempo: ${price.time.toFixed(2)}€
${price.urgency > 0 ? `- Urgencia: ${price.urgency.toFixed(2)}€\n` : ''}${price.category > 0 ? `- Categoría: ${price.category.toFixed(2)}€\n` : ''}
Base imponible: ${baseImponible.toFixed(2)}€
IVA (21%): ${iva.toFixed(2)}€
TOTAL: ${price.total.toFixed(2)}€

================================
Factura emitida electrónicamente según RD 1619/2012
Conservación mínima: 4 años
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura-${invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Factura</h3>
              <p className="text-xs text-slate-500">{invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header */}
        <div className="border-b border-slate-200 pb-4 mb-4">
          <div className="flex justify-between text-sm">
            <div>
              <div className="font-bold text-slate-900">URGE360 PLATFORM S.L.</div>
              <div className="text-slate-500 text-xs">CIF: B-12345678</div>
              <div className="text-slate-500 text-xs">Calle de la Innovación 42</div>
              <div className="text-slate-500 text-xs">28001 Madrid</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 text-xs">Fecha emisión</div>
              <div className="font-medium">{issueDate}</div>
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-1">Facturado a:</div>
          <div className="text-sm font-medium">{client.name}</div>
          <div className="text-xs text-slate-600">{client.address?.street}</div>
          <div className="text-xs text-slate-600">{client.address?.city} {client.address?.postalCode}</div>
          <div className="text-xs text-slate-600">{client.email}</div>
        </div>

        {/* Service */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <div className="text-xs text-slate-500 mb-1">Servicio:</div>
          <div className="text-sm font-medium">{order.type === 'repair' ? 'Reparación' : 'Mensajería'}</div>
          <div className="text-xs text-slate-600 mt-1">
            {order.type === 'repair' ? order.repair?.description : order.courier?.packageDescription}
          </div>
          {professional && (
            <div className="text-xs text-slate-600 mt-1">Profesional: {professional.name}</div>
          )}
        </div>

        {/* Breakdown */}
        <div className="border-t border-slate-200 pt-4">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Tarifa base</td>
                <td className="py-2 text-right">{order.price.base.toFixed(2)}€</td>
              </tr>
              {order.price.distance > 0 && (
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-600">Distancia</td>
                  <td className="py-2 text-right">{order.price.distance.toFixed(2)}€</td>
                </tr>
              )}
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-600">Tiempo</td>
                <td className="py-2 text-right">{order.price.time.toFixed(2)}€</td>
              </tr>
              {order.price.urgency > 0 && (
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-600">Suplemento urgencia</td>
                  <td className="py-2 text-right">{order.price.urgency.toFixed(2)}€</td>
                </tr>
              )}
              {order.price.category > 0 && (
                <tr className="border-b border-slate-100">
                  <td className="py-2 text-slate-600">Categoría</td>
                  <td className="py-2 text-right">{order.price.category.toFixed(2)}€</td>
                </tr>
              )}
              <tr className="border-b border-slate-200">
                <td className="py-2 font-medium">Base imponible</td>
                <td className="py-2 text-right font-medium">{baseImponible.toFixed(2)}€</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-2 text-slate-600">IVA (21%)</td>
                <td className="py-2 text-right">{iva.toFixed(2)}€</td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-lg">TOTAL</td>
                <td className="py-3 text-right font-bold text-lg text-orange-600">{order.price.total.toFixed(2)}€</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 text-center">
          Factura emitida electrónicamente según RD 1619/2012<br/>
          Conservación mínima: 4 años · IVA devengado en fecha de emisión
        </div>

        <button
          onClick={handleDownload}
          className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> Descargar factura
        </button>
      </div>
    </div>
  );
}
