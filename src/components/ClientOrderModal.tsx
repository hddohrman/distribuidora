import React, { useState } from 'react';
import { Client, BasketItem, Order, PaymentMethod, BankInfo } from '../types';
import { LocalIcon } from './LocalIcon';

interface ClientOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  basket: BasketItem[];
  cashDiscountPercent: number;
  bankInfo?: BankInfo;
  onUpdateBasket: (items: BasketItem[]) => void;
  onConfirmOrder: (order: Order, sendWhatsApp: boolean) => void;
}

export const ClientOrderModal: React.FC<ClientOrderModalProps> = ({
  isOpen,
  onClose,
  client,
  basket,
  cashDiscountPercent,
  bankInfo = {
    alias: 'DISTRI.PRO.PAGOS',
    cbu: '0000003100012345678901',
    bankName: 'Banco Galicia',
    accountHolder: 'DistriPro S.A. Mayorista',
    cuit: '30-71234567-8',
  },
  onUpdateBasket,
  onConfirmOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [notes, setNotes] = useState('');
  const [transferProof, setTransferProof] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const rawSubtotal = basket.reduce((acc, item) => acc + item.subtotal, 0);
  const totalBultos = basket.reduce((acc, item) => acc + item.quantity, 0);
  const formatMoney = (v: number) => '$' + Math.round(v).toLocaleString('es-AR');

  // Credit calculation
  const creditLimit = client.creditLimit || 0;
  const currentDebt = client.currentDebt || 0;
  const availableCredit = Math.max(0, creditLimit - currentDebt);
  const isCtaCteExceeded = rawSubtotal > availableCredit;

  // Cash discount calculation
  const discountPercent = paymentMethod === 'efectivo' ? cashDiscountPercent : 0;
  const discountAmount = paymentMethod === 'efectivo' ? Math.round((rawSubtotal * discountPercent) / 100) : 0;
  const finalTotal = rawSubtotal - discountAmount;

  const handleQtyChange = (index: number, delta: number) => {
    const updated = [...basket];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
      updated[index].subtotal = newQty * updated[index].unitPrice;
    }
    onUpdateBasket(updated);
  };

  const handleRemove = (index: number) => {
    onUpdateBasket(basket.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProcessOrder = (sendWhatsApp: boolean) => {
    if (basket.length === 0) return;

    if (paymentMethod === 'cta_cte' && isCtaCteExceeded) {
      return; // Blocked due to credit limit
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} hs`;
    const randNum = Math.floor(1000 + Math.random() * 9000);

    const newOrder: Order = {
      id: `ord-cli-${Date.now()}`,
      orderNumber: `#PED-${randNum}`,
      clientId: client.id,
      clientName: client.name,
      clientCode: client.code,
      date: 'Hoy',
      time: timeStr,
      type: 'preventa',
      status: 'pending_sync',
      items: basket,
      total: finalTotal,
      subtotalOriginal: rawSubtotal,
      discountAmount: discountAmount,
      discountPercent: discountPercent,
      transferProof: paymentMethod === 'qr' || paymentMethod === 'transferencia' ? transferProof : undefined,
      creditRemaining: paymentMethod === 'cta_cte' ? Math.max(0, availableCredit - rawSubtotal) : undefined,
      bultosCount: totalBultos,
      paymentMethod: paymentMethod,
      notes: notes || 'Pedido autogestionado por cliente desde catálogo móvil',
    };

    onConfirmOrder(newOrder, sendWhatsApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#00236f] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LocalIcon name="shopping_cart" className="w-5 h-5 text-[#82f5c1]" />
            <div>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] leading-tight">
                Confirmar Pedido de Compra
              </h3>
              <p className="text-[11px] text-[#90a8ff]">
                {client.name} • {client.code}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <LocalIcon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-[#0b1c30]">
          {/* Client Financial Profile Card */}
          <div className="bg-[#f0f4ff] rounded-xl p-3 border border-[#dce9ff] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#00236f] flex items-center gap-1.5">
                <LocalIcon name="account_balance_wallet" className="w-4 h-4" />
                <span>Estado de Cuenta Corriente del Comercio</span>
              </span>
              <span className="px-2 py-0.5 bg-white rounded font-mono text-[11px] font-bold text-[#00236f] border border-[#dce9ff]">
                {client.code}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-white p-2 rounded-lg border border-[#e2e8f0]">
                <span className="text-[10px] text-[#757682] uppercase font-semibold block">
                  Límite Otorgado
                </span>
                <span className="text-[12px] font-bold text-[#0b1c30]">
                  {formatMoney(creditLimit)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#e2e8f0]">
                <span className="text-[10px] text-[#757682] uppercase font-semibold block">
                  Saldo Deudor
                </span>
                <span className={`text-[12px] font-bold ${currentDebt > 0 ? 'text-[#ba1a1a]' : 'text-[#006c4a]'}`}>
                  {formatMoney(currentDebt)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#e2e8f0]">
                <span className="text-[10px] text-[#757682] uppercase font-semibold block">
                  Crédito Disponible
                </span>
                <span className="text-[12px] font-black text-[#006c4a]">
                  {formatMoney(availableCredit)}
                </span>
              </div>
            </div>
          </div>

          {/* Basket list */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-semibold text-[#444651]">
              <span>Detalle de Productos ({basket.length})</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded font-bold">{totalBultos} bultos totales</span>
            </div>

            {basket.length === 0 ? (
              <div className="p-4 bg-[#eff4ff] rounded-xl text-center text-[12px] text-[#757682]">
                Aún no has agregado productos al pedido. Visita el catálogo para sumar artículos.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {basket.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#f8f9ff] border border-[#e5eeff] rounded-xl flex items-center justify-between text-[12px]"
                  >
                    <div className="min-w-0 pr-2 flex-1">
                      <div className="font-bold text-[#0b1c30] truncate">{item.name}</div>
                      <div className="text-[11px] text-[#757682]">
                        {formatMoney(item.unitPrice)} c/u • {item.presentation}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Stepper */}
                      <div className="flex items-center bg-[#eff4ff] rounded-md border border-[#dce9ff] p-0.5">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(idx, -1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-[#00236f] hover:bg-white rounded"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-[12px]">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(idx, 1)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-[#00236f] hover:bg-white rounded"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-[#0b1c30] w-18 text-right text-[12px]">
                        {formatMoney(item.subtotal)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="text-[#ba1a1a] hover:opacity-80 p-1 cursor-pointer"
                        title="Quitar producto"
                      >
                        <LocalIcon name="delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formas de Pago Selector */}
          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-[#00236f] flex items-center gap-1.5">
              <LocalIcon name="payments" className="w-4.5 h-4.5" />
              <span>Selecciona la Forma de Pago:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option 1: Efectivo */}
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  paymentMethod === 'efectivo'
                    ? 'border-[#006c4a] bg-[#ecfdf5] shadow-xs'
                    : 'border-[#dce9ff] bg-[#fbfdff] hover:bg-[#eff4ff]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-7 h-7 rounded-lg bg-[#006c4a]/15 text-[#006c4a] flex items-center justify-center mb-1">
                    <LocalIcon name="payments" className="w-4.5 h-4.5" />
                  </div>
                  {cashDiscountPercent > 0 && (
                    <span className="px-1.5 py-0.5 bg-[#006c4a] text-white text-[10px] font-extrabold rounded-md shadow-xs">
                      {cashDiscountPercent}% OFF
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-[12px] text-[#0b1c30]">Efectivo</div>
                  <div className="text-[11px] text-[#006c4a] font-semibold">Contra entrega</div>
                </div>
              </button>

              {/* Option 2: QR o Transferencia */}
              <button
                type="button"
                onClick={() => setPaymentMethod('qr')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  paymentMethod === 'qr' || paymentMethod === 'transferencia'
                    ? 'border-[#00236f] bg-[#eff4ff] shadow-xs'
                    : 'border-[#dce9ff] bg-[#fbfdff] hover:bg-[#eff4ff]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-7 h-7 rounded-lg bg-[#00236f]/15 text-[#00236f] flex items-center justify-center mb-1">
                    <LocalIcon name="qr_code_2" className="w-4.5 h-4.5" />
                  </div>
                  <span className="px-1.5 py-0.5 bg-blue-100 text-[#00236f] text-[10px] font-bold rounded-md">
                    Inmediato
                  </span>
                </div>
                <div>
                  <div className="font-bold text-[12px] text-[#0b1c30]">QR / Transferencia</div>
                  <div className="text-[11px] text-[#757682]">Galicia / Alias CBU</div>
                </div>
              </button>

              {/* Option 3: Cuenta Corriente */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cta_cte')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  paymentMethod === 'cta_cte'
                    ? isCtaCteExceeded
                      ? 'border-[#ba1a1a] bg-[#fff0ed]'
                      : 'border-[#00236f] bg-[#eff4ff] shadow-xs'
                    : isCtaCteExceeded
                    ? 'border-[#ffdad6] bg-slate-50 opacity-80'
                    : 'border-[#dce9ff] bg-[#fbfdff] hover:bg-[#eff4ff]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 ${
                    isCtaCteExceeded ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#00236f]/15 text-[#00236f]'
                  }`}>
                    <LocalIcon name="credit_score" className="w-4.5 h-4.5" />
                  </div>
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                    isCtaCteExceeded ? 'bg-[#ba1a1a] text-white' : 'bg-slate-200 text-[#444651]'
                  }`}>
                    {isCtaCteExceeded ? 'Sin cupo' : 'Cupo OK'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-[12px] text-[#0b1c30]">Cuenta Corriente</div>
                  <div className={`text-[10px] truncate ${isCtaCteExceeded ? 'text-[#ba1a1a] font-bold' : 'text-[#757682]'}`}>
                    Disp: {formatMoney(availableCredit)}
                  </div>
                </div>
              </button>
            </div>

            {/* Detailed view for selected payment method */}
            {paymentMethod === 'efectivo' && (
              <div className="p-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl text-[12px] text-[#065f46] space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <LocalIcon name="verified" className="w-4.5 h-4.5" />
                    <span>Descuento Comercial de Contado ({cashDiscountPercent}%) Aplicado</span>
                  </span>
                  <span className="text-[#006c4a] font-black">
                    -{formatMoney(discountAmount)}
                  </span>
                </div>
                <p className="text-[11px] text-[#047857]">
                  Abonando en efectivo al repartidor al momento de la entrega obtienes un {cashDiscountPercent}% de bonificación sobre el total de tu pedido.
                </p>
              </div>
            )}

            {(paymentMethod === 'qr' || paymentMethod === 'transferencia') && (
              <div className="p-3 bg-[#eff4ff] border border-[#bfdbfe] rounded-xl text-[12px] text-[#0b1c30] space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#dce9ff] pb-2">
                  <span className="font-bold text-[#00236f] flex items-center gap-1.5">
                    <LocalIcon name="account_balance" className="w-4.5 h-4.5 text-[#006c4a]" />
                    <span>Datos Bancarios para Pago por Transferencia o QR</span>
                  </span>
                  <span className="text-[10px] text-[#006c4a] bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    Acreditación en el día
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-[#dce9ff] flex items-center justify-between">
                    <div>
                      <span className="text-[#757682] block text-[10px] uppercase font-bold">Alias Bancario</span>
                      <span className="font-mono font-bold text-[#00236f] text-[13px]">{bankInfo.alias}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankInfo.alias, 'alias')}
                      className="px-2 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-[11px] font-bold rounded cursor-pointer transition-all"
                    >
                      {copiedField === 'alias' ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-[#dce9ff] flex items-center justify-between">
                    <div>
                      <span className="text-[#757682] block text-[10px] uppercase font-bold">CBU / CVU</span>
                      <span className="font-mono font-bold text-[#00236f] text-[11px]">{bankInfo.cbu}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankInfo.cbu, 'cbu')}
                      className="px-2 py-1 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-[11px] font-bold rounded cursor-pointer transition-all"
                    >
                      {copiedField === 'cbu' ? '¡Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-[#444651] bg-white p-2 rounded-lg border border-[#dce9ff] flex flex-wrap justify-between items-center gap-1">
                  <span><strong>Titular:</strong> {bankInfo.accountHolder}</span>
                  <span><strong>CUIT:</strong> {bankInfo.cuit}</span>
                  <span><strong>Banco:</strong> {bankInfo.bankName}</span>
                </div>

                {/* Optional Transfer Voucher Ref */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#444651] mb-1">
                    Nº de Comprobante / Referencia de Transferencia (opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: TRF-482910 o últimos 4 dígitos..."
                    value={transferProof}
                    onChange={(e) => setTransferProof(e.target.value)}
                    className="w-full h-8 px-2.5 bg-white border border-[#dce9ff] rounded-lg text-[12px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'cta_cte' && (
              <div className="space-y-2 animate-in fade-in">
                {isCtaCteExceeded ? (
                  <div className="p-3 bg-[#fff0ed] border border-[#ffdad6] rounded-xl text-[12px] text-[#ba1a1a] space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-[13px]">
                      <LocalIcon name="warning" className="w-5 h-5 text-[#ba1a1a]" />
                      <span>Límite de Cuenta Corriente Excedido</span>
                    </div>
                    <p className="text-[11px] text-[#444651]">
                      El pedido de <strong>{formatMoney(rawSubtotal)}</strong> supera tu crédito disponible actual de <strong>{formatMoney(availableCredit)}</strong> (exceso: <strong>{formatMoney(rawSubtotal - availableCredit)}</strong>).
                    </p>
                    <div className="pt-1 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('efectivo')}
                        className="px-2.5 py-1.5 bg-[#006c4a] text-white text-[11px] font-bold rounded-lg cursor-pointer hover:bg-[#005137]"
                      >
                        Pagar en Efectivo ({cashDiscountPercent}% OFF)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('qr')}
                        className="px-2.5 py-1.5 bg-[#00236f] text-white text-[11px] font-bold rounded-lg cursor-pointer hover:bg-[#1e3a8a]"
                      >
                        Pagar por Transferencia / QR
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#eff4ff] border border-[#bfdbfe] rounded-xl text-[12px] text-[#00236f] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <LocalIcon name="check_circle" className="w-4.5 h-4.5 text-[#006c4a]" />
                      <span>Crédito Disponible Suficiente para la Compra</span>
                    </div>
                    <p className="text-[11px] text-[#444651]">
                      Tu margen actual es de <strong>{formatMoney(availableCredit)}</strong>. Luego de registrar este pedido, tu nuevo saldo disponible será de <strong>{formatMoney(availableCredit - rawSubtotal)}</strong>.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-[#444651] mb-1">
              Instrucciones u Horario de Entrega
            </label>
            <input
              type="text"
              placeholder="Ej: Entregar por la mañana, timbre pasillo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-9 px-3 bg-[#f8f9ff] border border-[#dce9ff] rounded-lg text-[12px] text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
            />
          </div>

          {/* Total Breakdown Summary Card */}
          <div className="p-3.5 bg-[#00236f] text-white rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#dce1ff]">
              <span>Subtotal Mercadería ({totalBultos} bultos):</span>
              <span className="font-bold">{formatMoney(rawSubtotal)}</span>
            </div>

            {paymentMethod === 'efectivo' && discountAmount > 0 && (
              <div className="flex items-center justify-between text-[12px] text-[#82f5c1] font-bold border-t border-white/10 pt-1">
                <span>Descuento Pago Efectivo ({cashDiscountPercent}%):</span>
                <span>-{formatMoney(discountAmount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/15 pt-2">
              <div>
                <span className="text-[10px] text-[#82f5c1] font-bold uppercase tracking-wider block">
                  Total Final a Pagar
                </span>
                <span className="text-[11px] text-[#90a8ff]">
                  Condición: {paymentMethod === 'efectivo' ? 'Efectivo con Descuento' : paymentMethod === 'cta_cte' ? 'Cuenta Corriente' : 'QR / Transferencia'}
                </span>
              </div>
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[22px] text-white">
                {formatMoney(finalTotal)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-1 space-y-2">
            <button
              type="button"
              disabled={basket.length === 0 || (paymentMethod === 'cta_cte' && isCtaCteExceeded)}
              onClick={() => handleProcessOrder(true)}
              className={`w-full h-11 font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[13px] rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                basket.length === 0 || (paymentMethod === 'cta_cte' && isCtaCteExceeded)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#25d366] hover:bg-[#20ba59] text-white active:scale-98'
              }`}
            >
              <LocalIcon name="send" className="w-4.5 h-4.5" />
              <span>Confirmar y Enviar Pedido vía WhatsApp</span>
            </button>

            <button
              type="button"
              disabled={basket.length === 0 || (paymentMethod === 'cta_cte' && isCtaCteExceeded)}
              onClick={() => handleProcessOrder(false)}
              className="w-full h-9 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] font-bold text-[12px] rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar Pedido Localmente en la App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
