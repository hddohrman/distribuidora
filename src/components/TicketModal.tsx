import React from 'react';
import { Order } from '../types';
import { LocalIcon } from './LocalIcon';

interface TicketModalProps {
  order: Order | null;
  onClose: () => void;
  onSendWhatsApp: (order: Order) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  order,
  onClose,
  onSendWhatsApp,
}) => {
  if (!order) return null;

  const formatMoney = (val: number) => '$' + val.toLocaleString('es-AR');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadOrderJson = () => {
    const jsonString = JSON.stringify(order, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedido_${order.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        {/* Modal Header */}
        <div className="bg-[#00236f] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LocalIcon name="receipt" className="w-5 h-5 text-[#82f5c1]" />
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px]">
              Comprobante Digital
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            <LocalIcon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Content (Thermal Printer Look) */}
        <div className="p-4 bg-[#fffefc] text-[#0b1c30] text-[12px] font-mono border-b border-dashed border-[#c5c5d3] space-y-3">
          {/* Header */}
          <div className="text-center space-y-0.5">
            <h2 className="font-sans font-black text-[18px] text-[#00236f] tracking-tight">
              DISTRIPRO S.A.
            </h2>
            <p className="text-[10px] text-[#444651]">
              Distribuidora Mayorista de Consumo Masivo
            </p>
            <p className="text-[10px] text-[#444651]">
              CUIT: 30-71829341-8 • IVA Responsable Inscripto
            </p>
            <p className="text-[10px] text-[#444651]">
              Casa Central: Parque Industrial Oeste - Nave 4
            </p>
          </div>

          <div className="border-t border-dashed border-[#c5c5d3] pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>ORDEN/PEDIDO:</span>
              <span className="font-bold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>FECHA / HORA:</span>
              <span>{order.date}, {order.time}</span>
            </div>
            <div className="flex justify-between">
              <span>VENDEDOR:</span>
              <span>David C. (Zona 04)</span>
            </div>
            <div className="flex justify-between">
              <span>CLIENTE:</span>
              <span className="font-bold">{order.clientCode}</span>
            </div>
            <div className="font-bold text-[#00236f] truncate">
              {order.clientName}
            </div>
          </div>

          {/* Line items table */}
          <div className="border-t border-dashed border-[#c5c5d3] pt-2">
            <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-[#e2e8f0]">
              <span>CANT / ARTÍCULO</span>
              <span>TOTAL</span>
            </div>

            <div className="space-y-1.5 pt-1.5">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-[#0b1c30]">
                      {it.quantity}x {it.name}
                    </div>
                    <div className="text-[10px] text-[#757682]">
                      ({it.presentation}) @ {formatMoney(it.unitPrice)}
                    </div>
                  </div>
                  <div className="font-bold text-[#0b1c30]">
                    {formatMoney(it.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-[#0b1c30] pt-2 space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>CANTIDAD BULTOS:</span>
              <span className="font-bold">{order.bultosCount || order.items.reduce((s, i) => s + i.quantity, 0)} bultos</span>
            </div>

            {order.subtotalOriginal && order.subtotalOriginal !== order.total && (
              <>
                <div className="flex justify-between text-[11px] text-[#444651]">
                  <span>SUBTOTAL:</span>
                  <span>{formatMoney(order.subtotalOriginal)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#006c4a] font-bold">
                  <span>DESCUENTO EFECTIVO ({order.discountPercent}%):</span>
                  <span>-{formatMoney(order.discountAmount || (order.subtotalOriginal - order.total))}</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-[11px]">
              <span>CONDICIÓN DE PAGO:</span>
              <span className="font-bold uppercase">
                {order.paymentMethod === 'efectivo'
                  ? `EFECTIVO (${order.discountPercent ? `${order.discountPercent}% OFF` : 'CONTADO'})`
                  : order.paymentMethod === 'cta_cte'
                  ? 'CUENTA CORRIENTE'
                  : 'QR / TRANSFERENCIA BANCARIA'}
              </span>
            </div>

            {order.transferProof && (
              <div className="flex justify-between text-[10px] text-[#444651]">
                <span>REF. TRANSFERENCIA:</span>
                <span className="font-mono font-bold">{order.transferProof}</span>
              </div>
            )}

            {order.creditRemaining !== undefined && order.paymentMethod === 'cta_cte' && (
              <div className="flex justify-between text-[10px] text-[#006c4a]">
                <span>CRÉDITO DISPONIBLE RESTANTE:</span>
                <span className="font-mono font-bold">{formatMoney(order.creditRemaining)}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-[16px] text-[#00236f] pt-1 border-t border-dashed border-[#c5c5d3]">
              <span>TOTAL A COBRAR:</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="pt-2 text-center flex flex-col items-center">
            <div className="tracking-[6px] font-mono text-[14px] font-bold text-[#0b1c30]">
              ||||| | |||| ||| ||||||| |
            </div>
            <span className="text-[10px] text-[#757682] tracking-widest mt-0.5">
              *{order.orderNumber.replace('#', '')}*
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-white space-y-2">
          <button
            type="button"
            onClick={handleDownloadOrderJson}
            className="w-full h-10 bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#166534] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[12px] rounded-lg flex items-center justify-center gap-2 border border-[#bbf7d0] cursor-pointer transition-all active:scale-98"
            title="Descargar archivo JSON para adjuntar en WhatsApp"
          >
            <LocalIcon name="download" className="w-4.5 h-4.5 text-emerald-700" />
            <span>Descargar Archivo JSON del Pedido (WhatsApp)</span>
          </button>

          <button
            type="button"
            onClick={() => onSendWhatsApp(order)}
            className="w-full h-11 bg-[#006c4a] hover:bg-[#005137] text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[13px] rounded-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <LocalIcon name="share" className="w-5 h-5" />
            <span>Enviar Comprobante por WhatsApp</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="h-10 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] font-bold text-[12px] rounded-lg flex items-center justify-center gap-1 border border-[#dce9ff] cursor-pointer"
            >
              <LocalIcon name="print" className="w-4.5 h-4.5" />
              <span>Imprimir Ticket</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 bg-[#f8f9ff] hover:bg-[#eff4ff] text-[#444651] font-bold text-[12px] rounded-lg flex items-center justify-center border border-[#e2e8f0] cursor-pointer"
            >
              <span>Cerrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
