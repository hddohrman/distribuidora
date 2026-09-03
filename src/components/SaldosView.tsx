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
    notes?: string
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
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    const numericAmount = parseFloat(amountInput);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    onRecordPayment(selectedClient, numericAmount, method);
    setSelectedClient(null);
    setAmountInput('');
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

            <div className="p-3 bg-[#eff4ff] rounded-lg border border-[#dce9ff] text-[12px]">
              <div className="font-bold text-[#0b1c30]">{selectedClient.name}</div>
              <div className="text-[#444651]">{selectedClient.code}</div>
              <div className="text-[#ba1a1a] font-bold mt-1">
                Saldo pendiente: {formatMoney(selectedClient.currentDebt)}
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#444651] mb-1">
                  Monto a Cobrar ($)
                </label>
                <input
                  type="number"
                  step="100"
                  min="1"
                  max={selectedClient.currentDebt * 2}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full h-11 px-3 bg-[#f8f9ff] border border-[#dce9ff] rounded-lg text-[16px] font-bold text-[#0b1c30] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#444651] mb-1">
                  Medio de Pago
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
                    <span>Efectivo</span>
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
