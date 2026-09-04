import React, { useState } from 'react';
import { Client, PaymentCollection, PaymentMethod } from '../types';
import { LocalIcon } from './LocalIcon';

interface SaldosViewProps {
  clients: Client[];
  collections: PaymentCollection[];
  onRecordPayment: (
    client: Client,
    amount: number,
    method: PaymentMethod,
    notes?: string,
    adjustmentType?: 'none' | 'descuento' | 'recargo',
    adjustmentAmount?: number
  ) => void;
  onViewReceipt: (receipt: PaymentCollection) => void;
}

export const SaldosView: React.FC<SaldosViewProps> = ({
  clients,
  collections,
  onRecordPayment,
  onViewReceipt,
}) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [adjustmentType, setAdjustmentType] = useState<'none' | 'descuento' | 'recargo'>('none');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>('');

  const debtorClients = clients.filter((c) => c.currentDebt > 0);
  const totalDebt = debtorClients.reduce((acc, c) => acc + c.currentDebt, 0);

  const totalCollectedCash = collections
    .filter((c) => c.paymentMethod === 'efectivo')
    .reduce((acc, c) => acc + c.amount, 0) + 139900;

  const totalCollectedQR = collections
    .filter((c) => c.paymentMethod === 'qr')
    .reduce((acc, c) => acc + c.amount, 0);

  const formatMoney = (val: number) => '$' + val.toLocaleString('es-AR');

  const handleOpenPayment = (client: Client) => {
    setSelectedClient(client);
    setAmountInput(client.currentDebt.toString());
    setAdjustmentType('none');
    setAdjustmentAmount(0);
    setAdjustmentNotes('');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    const numericAmount = parseFloat(amountInput);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    onRecordPayment(
      selectedClient,
      numericAmount,
      method,
      adjustmentNotes || undefined,
      adjustmentType,
      adjustmentAmount
    );
    setSelectedClient(null);
    setAmountInput('');
    setAdjustmentType('none');
    setAdjustmentAmount(0);
    setAdjustmentNotes('');
  };

  return (
    <div className="flex flex-col w-full pb-20 space-y-3">
      {/* 1. Arqueo de Caja del Móvil */}
      <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#dce9ff] text-[#00236f] flex items-center justify-center">
              <LocalIcon name="point_of_sale" className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#0b1c30]">
                Arqueo de Caja del Furgón
              </h2>
              <span className="text-[11px] text-[#444651]">David C. • Cierre parcial en calle</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] text-[11px] font-bold">
            Cuadrado
          </span>
        </div>

        {/* Totals cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#eff4ff] p-3 rounded-lg border border-[#dce9ff] flex flex-col">
            <span className="text-[11px] text-[#444651]">Efectivo en Caja Móvil</span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[18px] text-[#00236f]">
              {formatMoney(totalCollectedCash)}
            </span>
            <span className="text-[10px] text-[#006c4a] font-medium mt-0.5">
              Disponible para rendición
            </span>
          </div>
          <div className="bg-[#eff4ff] p-3 rounded-lg border border-[#dce9ff] flex flex-col">
            <span className="text-[11px] text-[#444651]">Cobranzas QR / Transf.</span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[18px] text-[#0b1c30]">
              {formatMoney(totalCollectedQR > 0 ? totalCollectedQR : 48500)}
            </span>
            <span className="text-[10px] text-[#444651] font-medium mt-0.5">
              Acreditado en cuenta
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-[#f8f9ff] rounded-lg border border-[#e5eeff] flex items-center justify-between text-[12px]">
          <span className="text-[#444651]">Total Deuda en Calle (Cta. Cte.):</span>
          <span className="font-bold text-[#ba1a1a]">{formatMoney(totalDebt)}</span>
        </div>
      </section>

      {/* 2. Clientes con Saldo Pendiente */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#0b1c30]">
            Clientes con Saldo Pendiente
          </h3>
          <span className="text-[11px] font-semibold text-[#ba1a1a]">
            {debtorClients.length} cuentas con deuda
          </span>
        </div>

        {debtorClients.map((client) => (
          <article
            key={client.id}
            className="bg-white p-3.5 rounded-xl shadow-xs border border-[#e2e8f0] flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                <LocalIcon name="account_balance" className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30] truncate">
                  {client.name}
                </span>
                <span className="text-[11px] text-[#444651] truncate">
                  {client.code} • {client.address}
                </span>
                <span className="text-[11px] text-[#ba1a1a] font-bold">
                  Debe: {formatMoney(client.currentDebt)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenPayment(client)}
              className="h-9 px-3 bg-[#006c4a] hover:bg-[#005137] text-white text-[12px] font-bold rounded-lg flex items-center gap-1 shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <LocalIcon name="payments" className="w-4 h-4" />
              <span>Cobrar</span>
            </button>
          </article>
        ))}
      </section>

      {/* 3. Recibos de Cobro Emitidos Hoy */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#0b1c30]">
            Recibos de Cobro Emitidos Hoy
          </h3>
          <span className="text-[11px] text-[#444651]">
            {collections.length} cobranzas registradas
          </span>
        </div>

        {collections.length === 0 ? (
          <div className="bg-white p-4 rounded-xl text-center text-[12px] text-[#757682] border border-[#e2e8f0]">
            No se han registrado cobranzas adicionales aún hoy.
          </div>
        ) : (
          collections.map((col) => (
            <div
              key={col.id}
              className="bg-white p-3 rounded-xl border border-[#e2e8f0] shadow-xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#82f5c1] text-[#00714e] flex items-center justify-center">
                  <LocalIcon name="receipt" className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[13px] text-[#0b1c30]">
                    {col.clientName}
                  </span>
                  <span className="text-[11px] text-[#444651]">
                    {col.receiptNumber} • {col.time} hs • {col.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-[14px] text-[#006c4a]">
                  {formatMoney(col.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => onViewReceipt(col)}
                  className="text-[#00236f] hover:text-[#1e3a8a] text-[12px] font-bold"
                >
                  Ver
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Modal: Registrar Cobro */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#82f5c1] text-[#00714e] flex items-center justify-center">
                  <LocalIcon name="payments" className="w-5 h-5" />
                </div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#0b1c30]">
                  Registrar Cobranza
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="text-[#757682] hover:text-[#0b1c30]"
              >
                <LocalIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#eff4ff] rounded-lg border border-[#dce9ff] text-[12px] space-y-1">
              <div className="font-bold text-[#0b1c30]">{selectedClient.name}</div>
              <div className="text-[#444651]">{selectedClient.code}</div>
              <div className="text-[#ba1a1a] font-bold">
                Saldo pendiente total: {formatMoney(selectedClient.currentDebt)}
              </div>
              <div className="pt-1 border-t border-[#dce9ff] text-[11px] text-slate-600 flex items-start gap-1">
                <span className="font-bold text-amber-700 shrink-0">⚠️ Nota Cta. Cte.:</span>
                <span>Por más que abone en efectivo, no se aplica descuento automático. Cancela el saldo total o el importe acordado.</span>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} noValidate className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#444651]">
                    Monto a Imputar de la Deuda ($)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Total: {formatMoney(selectedClient.currentDebt)}
                  </span>
                </div>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0"
                  className="w-full h-11 px-3 bg-[#f8f9ff] border border-[#dce9ff] rounded-lg text-[16px] font-bold text-[#0b1c30] focus:ring-2 focus:ring-[#00236f] focus:outline-none font-mono"
                  required
                />
                {/* Accesos rápidos para cancelar el total o una fracción */}
                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setAmountInput(String(selectedClient.currentDebt))}
                    className="flex-1 py-1 px-2 rounded-md bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] border border-[#c5d8ff] text-[11px] font-bold transition-all cursor-pointer text-center active:scale-95"
                  >
                    ✓ Pagar Total ({formatMoney(selectedClient.currentDebt)})
                  </button>
                  {selectedClient.currentDebt > 10 && (
                    <button
                      type="button"
                      onClick={() => setAmountInput(String(Math.round(selectedClient.currentDebt / 2)))}
                      className="py-1 px-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-medium transition-all cursor-pointer active:scale-95"
                    >
                      50% ({formatMoney(Math.round(selectedClient.currentDebt / 2))})
                    </button>
                  )}
                </div>
              </div>

              {/* Ajuste manual: Descuento o Recargo */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700">
                    Ajuste Comercial Especial (Opcional):
                  </label>
                  {adjustmentType !== 'none' && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        adjustmentType === 'descuento'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {adjustmentType === 'descuento' ? 'Descuento' : 'Recargo'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType('none');
                      setAdjustmentAmount(0);
                    }}
                    className={`h-7 rounded text-[11px] font-bold transition-all ${
                      adjustmentType === 'none'
                        ? 'bg-[#00236f] text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    Sin Ajuste
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('descuento')}
                    className={`h-7 rounded text-[11px] font-bold transition-all ${
                      adjustmentType === 'descuento'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-emerald-800'
                    }`}
                  >
                    - Descuento ($)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('recargo')}
                    className={`h-7 rounded text-[11px] font-bold transition-all ${
                      adjustmentType === 'recargo'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-amber-900'
                    }`}
                  >
                    + Recargo ($)
                  </button>
                </div>

                {adjustmentType !== 'none' && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                        {adjustmentType === 'descuento' ? 'Monto Bonificación ($):' : 'Monto Recargo/Interés ($):'}
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
                        placeholder="Ej: 500"
                        className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-[12px] font-mono font-bold text-[#00236f]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                        Motivo / Justificación:
                      </label>
                      <input
                        type="text"
                        value={adjustmentNotes}
                        onChange={(e) => setAdjustmentNotes(e.target.value)}
                        placeholder="Ej: Bonificación pactada"
                        className="w-full h-8 px-2 bg-white border border-slate-300 rounded text-[11px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#444651] mb-1">
                  Medio de Pago Percibido
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('efectivo')}
                    className={`h-10 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                      method === 'efectivo'
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-[#eff4ff] text-[#0b1c30]'
                    }`}
                  >
                    <LocalIcon name="payments" className="w-4 h-4" />
                    <span>Efectivo (Sin desc.)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('qr')}
                    className={`h-10 rounded-lg text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                      method === 'qr'
                        ? 'bg-[#00236f] text-white shadow-xs'
                        : 'bg-[#eff4ff] text-[#0b1c30]'
                    }`}
                  >
                    <LocalIcon name="qr_code_2" className="w-4 h-4" />
                    <span>Cobro QR</span>
                  </button>
                </div>
              </div>

              {/* Resumen de cobro final */}
              {(() => {
                const num = parseFloat(amountInput) || 0;
                const adj = adjustmentType === 'none' ? 0 : adjustmentAmount;
                const toCollect = adjustmentType === 'descuento' ? Math.max(0, num - adj) : num + adj;
                const remainingDebt = Math.max(0, selectedClient.currentDebt - num);
                return (
                  <div className="p-2.5 bg-slate-100 rounded-lg text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Deuda a imputar:</span>
                      <span className="font-mono font-semibold">{formatMoney(num)}</span>
                    </div>
                    {adjustmentType !== 'none' && adj > 0 && (
                      <div className="flex justify-between text-emerald-800">
                        <span>{adjustmentType === 'descuento' ? 'Descuento especial:' : 'Recargo:'}</span>
                        <span className="font-mono font-bold">
                          {adjustmentType === 'descuento' ? `-${formatMoney(adj)}` : `+${formatMoney(adj)}`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-[#00236f] pt-1 border-t border-slate-200 text-[13px]">
                      <span>Total Efectivo/QR a Cobrar:</span>
                      <span className="font-mono">{formatMoney(toCollect)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Saldo que le quedará al cliente:</span>
                      <span className="font-mono font-bold">{formatMoney(remainingDebt)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="flex-1 h-11 bg-[#eff4ff] text-[#444651] font-bold text-[13px] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-[#006c4a] hover:bg-[#005137] text-white font-bold text-[13px] rounded-lg shadow-md flex items-center justify-center gap-1 cursor-pointer"
                >
                  <LocalIcon name="share" className="w-4.5 h-4.5" />
                  <span>Emitir Recibo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
