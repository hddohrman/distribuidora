import React, { useState } from 'react';
import { Client, Product, PaymentMethod, BasketItem, Order } from '../types';
import { LocalIcon } from './LocalIcon';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  products: Product[];
  initialClient: Client;
  cashDiscountPercent?: number;
  onCompleteSale: (order: Order) => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  clients,
  products,
  initialClient,
  cashDiscountPercent = 10,
  onCompleteSale,
}) => {
  const [selectedClient, setSelectedClient] = useState<Client>(initialClient);
  const [saleType, setSaleType] = useState<'in_situ' | 'preventa'>('in_situ');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  // Descuento o Recargo manual antes de cobrar
  const [adjustmentType, setAdjustmentType] = useState<'none' | 'descuento' | 'recargo'>('none');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingIndex = basket.findIndex((b) => b.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...basket];
      const newQty = updated[existingIndex].quantity + quantity;
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].subtotal = newQty * product.priceWholesale;
      setBasket(updated);
    } else {
      setBasket([
        ...basket,
        {
          productId: product.id,
          name: product.name,
          presentation: product.presentation,
          codePrefix: `${quantity}${product.unitType[0]}`,
          quantity: quantity,
          unitPrice: product.priceWholesale,
          subtotal: quantity * product.priceWholesale,
        },
      ]);
    }
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setBasket(basket.filter((_, i) => i !== index));
  };

  // Cálculos detallados con Descuento/Recargo manual + Descuento Contado Efectivo
  const rawSubtotal = basket.reduce((acc, item) => acc + item.subtotal, 0);
  const totalBultos = basket.reduce((acc, item) => acc + item.quantity, 0);

  const appliedAdjustment = adjustmentType === 'none' ? 0 : Math.max(0, adjustmentAmount);
  const subtotalAfterAdjustment =
    adjustmentType === 'descuento'
      ? Math.max(0, rawSubtotal - appliedAdjustment)
      : adjustmentType === 'recargo'
      ? rawSubtotal + appliedAdjustment
      : rawSubtotal;

  const cashDiscountAmount =
    paymentMethod === 'efectivo'
      ? Math.round((subtotalAfterAdjustment * cashDiscountPercent) / 100)
      : 0;

  const finalTotal = Math.max(0, subtotalAfterAdjustment - cashDiscountAmount);

  const formatMoney = (v: number) => '$' + v.toLocaleString('es-AR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (basket.length === 0) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} hs`;
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#PED-${randomNum}`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientCode: selectedClient.code,
      date: 'Hoy',
      time: timeStr,
      type: saleType,
      status: 'pending_sync',
      items: basket,
      total: finalTotal,
      subtotalOriginal: rawSubtotal,
      discountAmount: (adjustmentType === 'descuento' ? appliedAdjustment : 0) + cashDiscountAmount,
      discountPercent: paymentMethod === 'efectivo' ? cashDiscountPercent : 0,
      customAdjustmentType: adjustmentType,
      customAdjustmentAmount: appliedAdjustment,
      customAdjustmentNotes: adjustmentNotes,
      bultosCount: totalBultos,
      paymentMethod: paymentMethod,
      notes: notes || (saleType === 'in_situ' ? 'Venta en el acto' : 'Preventa programada'),
    };

    onCompleteSale(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#00236f] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LocalIcon name="add_shopping_cart" className="w-5.5 h-5.5 text-[#82f5c1]" />
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px]">
              Nuevo Pedido / Venta en Sitio
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {/* 1. Client selection */}
          <div>
            <label className="block text-[11px] font-semibold text-[#444651] mb-1">
              Cliente Destino
            </label>
            <select
              value={selectedClient.id}
              onChange={(e) => {
                const found = clients.find((c) => c.id === e.target.value);
                if (found) setSelectedClient(found);
              }}
              className="w-full h-10 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-[13px] font-semibold text-[#0b1c30] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.address})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Sale Type Toggle */}
          <div>
            <label className="block text-[11px] font-semibold text-[#444651] mb-1">
              Tipo de Operación
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSaleType('in_situ')}
                className={`h-10 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                  saleType === 'in_situ'
                    ? 'bg-[#00236f] text-white shadow-xs'
                    : 'bg-[#eff4ff] text-[#0b1c30]'
                }`}
              >
                <LocalIcon name="point_of_sale" className="w-4 h-4" />
                <span>Venta In Situ (Furgón)</span>
              </button>
              <button
                type="button"
                onClick={() => setSaleType('preventa')}
                className={`h-10 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                  saleType === 'preventa'
                    ? 'bg-[#00236f] text-white shadow-xs'
                    : 'bg-[#eff4ff] text-[#0b1c30]'
                }`}
              >
                <LocalIcon name="calendar_today" className="w-4 h-4" />
                <span>Preventa (Mañana)</span>
              </button>
            </div>
          </div>

          {/* 3. Product Selector and Add */}
          <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff] space-y-2">
            <span className="text-[11px] font-bold text-[#00236f] uppercase tracking-wider block">
              Agregar Productos al Pedido
            </span>

            <div className="flex gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 h-10 px-2 bg-white border border-[#dce9ff] rounded-lg text-[12px] font-medium text-[#0b1c30] focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatMoney(p.priceWholesale)}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 h-10 px-2 text-center bg-white border border-[#dce9ff] rounded-lg text-[13px] font-bold"
              />

              <button
                type="button"
                onClick={handleAddItem}
                className="h-10 px-3 bg-[#006c4a] hover:bg-[#005137] text-white text-[12px] font-bold rounded-lg shrink-0 flex items-center justify-center cursor-pointer"
              >
                + Añadir
              </button>
            </div>
          </div>

          {/* 4. Current Basket Table */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-[#444651]">
              <span>Detalle de Canasta</span>
              <span>{basket.length} ítems agregados</span>
            </div>

            {basket.length === 0 ? (
              <div className="p-3 bg-[#eff4ff] rounded-lg text-center text-[12px] text-[#757682]">
                Aún no has agregado productos a este pedido.
              </div>
            ) : (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {basket.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-[#eff4ff] rounded-lg flex items-center justify-between text-[12px]"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-[#0b1c30] truncate">
                        {item.quantity}x {item.name}
                      </div>
                      <div className="text-[10px] text-[#444651]">
                        {formatMoney(item.unitPrice)} c/u
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-[#0b1c30]">
                        {formatMoney(item.subtotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-[#ba1a1a] hover:opacity-80 p-0.5"
                      >
                        <LocalIcon name="delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descuento o Recargo Especial antes de cobrar */}
          <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#dce9ff] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#00236f] uppercase tracking-wider">
                Ajuste Comercial Especial (Opcional)
              </span>
              {adjustmentType !== 'none' && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    adjustmentType === 'descuento'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {adjustmentType === 'descuento' ? 'Descuento Aplicado' : 'Recargo Aplicado'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('none');
                  setAdjustmentAmount(0);
                }}
                className={`h-8 rounded-lg text-[11px] font-bold transition-all ${
                  adjustmentType === 'none'
                    ? 'bg-[#00236f] text-white shadow-2xs'
                    : 'bg-white border border-[#cbd5e1] text-[#444651]'
                }`}
              >
                Sin Ajuste
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('descuento')}
                className={`h-8 rounded-lg text-[11px] font-bold transition-all ${
                  adjustmentType === 'descuento'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white border border-[#cbd5e1] text-emerald-800'
                }`}
              >
                - Descuento ($)
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('recargo')}
                className={`h-8 rounded-lg text-[11px] font-bold transition-all ${
                  adjustmentType === 'recargo'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white border border-[#cbd5e1] text-amber-900'
                }`}
              >
                + Recargo ($)
              </button>
            </div>

            {adjustmentType !== 'none' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-[#444651] block mb-1">
                    {adjustmentType === 'descuento' ? 'Monto a Descontar ($):' : 'Monto a Recargar ($):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={adjustmentAmount === 0 ? '' : adjustmentAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAdjustmentAmount(val === '' ? 0 : Math.max(0, parseFloat(val) || 0));
                    }}
                    placeholder="0"
                    className="w-full h-8 px-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[12px] font-mono font-bold text-[#00236f]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#444651] block mb-1">
                    Motivo / Observación del Ajuste:
                  </label>
                  <input
                    type="text"
                    value={adjustmentNotes}
                    onChange={(e) => setAdjustmentNotes(e.target.value)}
                    placeholder="Ej: Bonificación por volumen / Flete"
                    className="w-full h-8 px-2.5 bg-white border border-[#cbd5e1] rounded-lg text-[12px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-semibold text-[#444651] mb-1">
              Condición de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['efectivo', 'cta_cte', 'qr'] as PaymentMethod[]).map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`h-9 rounded-lg text-[12px] font-bold capitalize transition-all ${
                    paymentMethod === pm
                      ? 'bg-[#00236f] text-white shadow-xs'
                      : 'bg-[#eff4ff] text-[#0b1c30]'
                  }`}
                >
                  {pm === 'cta_cte' ? 'Cta. Cte.' : pm === 'qr' ? 'Cobro QR' : 'Efectivo'}
                </button>
              ))}
            </div>
            {paymentMethod === 'efectivo' && cashDiscountPercent > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 mt-1 block">
                ⚡ Bonificación de {cashDiscountPercent}% OFF por pago en efectivo aplicada.
              </span>
            )}
          </div>

          {/* Detailed Price Breakdown */}
          <div className="p-3 bg-gradient-to-br from-[#00236f] to-[#1e3a8a] text-white rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-white/80">
              <span>Subtotal Lista ({totalBultos} bultos):</span>
              <span className="font-mono font-semibold">{formatMoney(rawSubtotal)}</span>
            </div>

            {adjustmentType !== 'none' && appliedAdjustment > 0 && (
              <div className="flex items-center justify-between text-[11px]">
                <span className={adjustmentType === 'descuento' ? 'text-emerald-300' : 'text-amber-300'}>
                  {adjustmentType === 'descuento' ? 'Descuento especial pactado:' : 'Recargo especial pactado:'}
                </span>
                <span className="font-mono font-bold">
                  {adjustmentType === 'descuento' ? `-${formatMoney(appliedAdjustment)}` : `+${formatMoney(appliedAdjustment)}`}
                </span>
              </div>
            )}

            {paymentMethod === 'efectivo' && cashDiscountAmount > 0 && (
              <div className="flex items-center justify-between text-[11px] text-emerald-300">
                <span>Descuento Contado Efectivo (-{cashDiscountPercent}%):</span>
                <span className="font-mono font-bold">-{formatMoney(cashDiscountAmount)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-white/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#90a8ff] font-bold uppercase block">
                  Total Final a Cobrar
                </span>
                <span className="text-[11px] text-[#dce1ff]">
                  {paymentMethod === 'cta_cte'
                    ? 'Se carga a cuenta corriente'
                    : paymentMethod === 'efectivo'
                    ? 'Cobro en mano contado'
                    : 'Transferencia / QR'}
                </span>
              </div>
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[22px] text-white">
                {formatMoney(finalTotal)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-[#444651] mb-1">
              Observaciones / Horario de Entrega
            </label>
            <input
              type="text"
              placeholder="Ej: Entregar antes de las 11:00 hs, timbre lateral..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-9 px-3 bg-[#f8f9ff] border border-[#dce9ff] rounded-lg text-[12px] text-[#0b1c30]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 bg-[#eff4ff] text-[#444651] font-bold text-[13px] rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={basket.length === 0}
              className={`flex-1 h-11 font-bold text-[13px] rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                basket.length === 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-[#006c4a] hover:bg-[#005137] text-white active:scale-98'
              }`}
            >
              <LocalIcon name="check_circle" className="w-4.5 h-4.5" />
              <span>Confirmar Venta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
