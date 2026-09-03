import React, { useState } from 'react';
import { Client, Order, PaymentMethod, BasketItem, SyncBatchInfo, UserRole } from '../types';
import { LocalIcon } from './LocalIcon';

interface PedidosViewProps {
  orders: Order[];
  clients: Client[];
  activeClient: Client;
  onOpenClientPicker: () => void;
  onOpenNewSaleModal: () => void;
  onViewTicket: (order: Order) => void;
  onRegisterFastDraftSale: (
    client: Client,
    items: BasketItem[],
    paymentMethod: PaymentMethod
  ) => void;
  onSyncWhatsApp: () => void;
  onFloatingExport: () => void;
  syncBatch: SyncBatchInfo;
  pendingCount: number;
  userRole?: UserRole;
  onGoToCatalog?: () => void;
}

export const PedidosView: React.FC<PedidosViewProps> = ({
  orders,
  clients: _clients,
  activeClient,
  onOpenClientPicker,
  onOpenNewSaleModal,
  onViewTicket,
  onRegisterFastDraftSale,
  onSyncWhatsApp,
  onFloatingExport,
  syncBatch,
  pendingCount,
  userRole = 'vendedor',
  onGoToCatalog,
}) => {
  const isClient = userRole === 'cliente';
  // Current draft items in the mobile basket (matching screenshot)
  const [draftItems, setDraftItems] = useState<BasketItem[]>([
    {
      productId: 'prod-1',
      name: 'Pañales Huggies Active Sec G',
      presentation: '5 bultos x 8 packs',
      codePrefix: '5b',
      quantity: 5,
      unitPrice: 12500,
      subtotal: 62500,
    },
    {
      productId: 'prod-2',
      name: 'Desodorante Axe Black 150ml',
      presentation: '2 cajas display x 12u',
      codePrefix: '2c',
      quantity: 2,
      unitPrice: 9200,
      subtotal: 18400,
    },
    {
      productId: 'prod-3',
      name: 'Caramelos Flynn Paff Tutti Frutti',
      presentation: '4 cajas x 50 tiras',
      codePrefix: '4c',
      quantity: 4,
      unitPrice: 3500,
      subtotal: 14000,
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');

  // Calculations for draft
  const totalAmount = draftItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalBultos = draftItems.reduce((sum, item) => sum + item.quantity, 0);

  // Format currency
  const formatMoney = (amount: number) => {
    return '$' + amount.toLocaleString('es-AR');
  };

  const handleRegisterSale = () => {
    if (draftItems.length === 0) return;
    onRegisterFastDraftSale(activeClient, draftItems, paymentMethod);
  };

  // Filter orders for client mode
  const clientOrders = isClient
    ? orders.filter(
        (o) =>
          o.clientId === activeClient.id ||
          o.clientCode === activeClient.code ||
          o.clientName.toLowerCase() === activeClient.name.toLowerCase()
      )
    : orders;

  if (isClient) {
    const totalSpent = clientOrders.reduce((acc, o) => acc + o.total, 0);

    return (
      <div className="flex flex-col w-full pb-20 space-y-3.5">
        {/* Client Business Header */}
        <section className="bg-white rounded-xl p-4 shadow-xs border border-[#e2e8f0] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-[18px] shadow-sm">
                {activeClient.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#757682] uppercase tracking-wider block">
                  Comercio Registrado
                </span>
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[17px] text-[#00236f] leading-tight">
                  {activeClient.name}
                </h2>
                <span className="text-[12px] text-[#444651]">
                  {activeClient.address}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg font-mono text-[12px] font-bold">
              {activeClient.code}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f1f5f9]">
            <div className="p-2 bg-[#f8f9ff] rounded-lg border border-[#e5eeff]">
              <span className="text-[10px] text-[#757682] block">Pedidos Realizados</span>
              <span className="font-bold text-[15px] text-[#00236f]">
                {clientOrders.length} pedidos
              </span>
            </div>
            <div className="p-2 bg-[#f8f9ff] rounded-lg border border-[#e5eeff]">
              <span className="text-[10px] text-[#757682] block">Total Comprado</span>
              <span className="font-bold text-[15px] text-[#006c4a]">
                {formatMoney(totalSpent)}
              </span>
            </div>
          </div>
        </section>

        {/* Action: New Order via Catalog */}
        <section>
          <button
            type="button"
            onClick={onGoToCatalog}
            className="w-full h-13 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl px-4 flex items-center justify-between shadow-md active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LocalIcon name="inventory_2" className="w-6 h-6" />
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px]">
                Explorar Catálogo y Armar Pedido
              </span>
            </div>
            <LocalIcon name="arrow_forward" className="w-5 h-5" />
          </button>
        </section>

        {/* Client Orders List */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#0b1c30]">
              Historial de Tus Pedidos
            </h3>
            <span className="text-[12px] text-[#757682]">
              {clientOrders.length} registros
            </span>
          </div>

          {clientOrders.length === 0 ? (
            <div className="p-6 bg-white rounded-xl border border-[#e2e8f0] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#eff4ff] text-[#00236f] flex items-center justify-center mx-auto">
                <LocalIcon name="receipt_long" className="w-6.5 h-6.5" />
              </div>
              <div>
                <p className="font-bold text-[#0b1c30] text-[14px]">
                  Aún no has registrado pedidos
                </p>
                <p className="text-[12px] text-[#444651] mt-0.5">
                  Ingresa al catálogo para seleccionar los productos y despachar tu orden directamente por WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={onGoToCatalog}
                className="px-4 py-2 bg-[#00236f] text-white font-bold text-[12px] rounded-lg cursor-pointer"
              >
                Abrir Catálogo de Productos
              </button>
            </div>
          ) : (
            clientOrders.map((ord) => (
              <article
                key={ord.id}
                className="bg-white rounded-xl p-3.5 shadow-xs border border-[#e2e8f0] space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#00236f] text-[13px]">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-[#757682]">
                        • {ord.date} {ord.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#444651] mt-0.5">
                      {ord.items.length} productos ({ord.bultosCount || ord.items.reduce((a, b) => a + b.quantity, 0)} bultos)
                    </p>
                  </div>

                  <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[16px] text-[#006c4a]">
                    {formatMoney(ord.total)}
                  </span>
                </div>

                {/* Items preview */}
                <div className="bg-[#f8f9ff] rounded-lg p-2 text-[11px] text-[#444651] space-y-1 border border-[#eff4ff]">
                  {ord.items.slice(0, 3).map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate pr-2">
                        • {it.quantity}x {it.name}
                      </span>
                      <span className="font-semibold shrink-0">
                        {formatMoney(it.subtotal)}
                      </span>
                    </div>
                  ))}
                  {ord.items.length > 3 && (
                    <div className="text-[10px] text-[#00236f] font-semibold italic">
                      + {ord.items.length - 3} productos más...
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
                  <span className="px-2 py-0.5 rounded-md bg-[#82f5c1]/30 text-[#00714e] text-[10px] font-bold">
                    {ord.paymentMethod === 'efectivo' ? 'Pago Efectivo' : 'Cta. Corriente'}
                  </span>

                  <button
                    type="button"
                    onClick={() => onViewTicket(ord)}
                    className="text-[#00236f] hover:text-[#1e3a8a] font-bold text-[12px] flex items-center gap-1 cursor-pointer"
                  >
                    <LocalIcon name="receipt" className="w-4 h-4" />
                    <span>Ver Comprobante</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-20 space-y-3">
      {/* 1. Operational Status Bar (David C. / Street Mode) */}
      <section className="w-full bg-[#ffffff] rounded-xl p-3 shadow-xs border border-[#e2e8f0] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 shadow-xs">
              <LocalIcon name="badge" className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#0b1c30] truncate leading-tight">
                David C.
              </span>
              <span className="font-['Inter',sans-serif] text-[11px] text-[#444651] truncate">
                Turno Tarde • Zona 04 Centro
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dce9ff] text-[#0b1c30] text-[11px] font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
            <span>GPS Activo</span>
          </div>
        </div>

        {/* Offline Alert Strip */}
        <div className="w-full bg-[#dce9ff] rounded-lg p-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#82f5c1] text-[#00714e] flex items-center justify-center shrink-0">
              <LocalIcon name="cloud_off" className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-semibold text-[#0b1c30] truncate">
                Modo Calle (Offline Activo)
              </span>
              <span className="text-[11px] text-[#444651] truncate">
                {pendingCount} ventas locales guardadas sin subir
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white text-[#00236f] font-['Inter',sans-serif] text-[11px] font-bold shrink-0 shadow-xs">
            {pendingCount} Pendientes
          </span>
        </div>
      </section>

      {/* 2. Quick Primary Action: New Sale */}
      <section className="w-full">
        <button
          type="button"
          onClick={onOpenNewSaleModal}
          className="w-full h-14 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-xl px-4 flex items-center justify-between shadow-md active:scale-[0.99] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <LocalIcon name="add_circle" className="w-6.5 h-6.5" />
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] tracking-tight">
              + Nueva Venta / Pedido en Sitio
            </span>
          </div>
          <LocalIcon name="arrow_forward" className="w-5 h-5" />
        </button>
      </section>

      {/* 3. WhatsApp Sync Generator Card */}
      <section className="w-full bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#e2e8f0] space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#82f5c1] text-[#00714e] flex items-center justify-center shrink-0">
              <LocalIcon name="all_inbox" className="w-5.5 h-5.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[16px] text-[#0b1c30] truncate">
                  Sincronización WhatsApp
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] text-[11px] font-bold">
                  Listo
                </span>
              </div>
              <span className="text-[12px] text-[#444651] truncate">
                Casa Central • Respaldos cifrados .dist
              </span>
            </div>
          </div>
          <LocalIcon name="phonelink_ring" className="text-[#c5c5d3] w-5 h-5" />
        </div>

        {/* Payload detail pillbox */}
        <div className="w-full bg-[#eff4ff] rounded-lg p-3 space-y-1.5 border border-[#e5eeff]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#444651]">Lote generado</span>
            <span className="font-['Inter',sans-serif] text-[12px] font-bold text-[#00236f] truncate max-w-[200px]">
              {syncBatch.filename}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#0b1c30]">
            <div className="flex items-center gap-1">
              <LocalIcon name="receipt_long" className="w-4 h-4 text-[#006c4a]" />
              <span className="font-bold">{syncBatch.ordersCount}</span> pedidos
            </div>
            <div className="w-1 h-1 rounded-full bg-[#c5c5d3]" />
            <div className="flex items-center gap-1">
              <LocalIcon name="payments" className="w-4 h-4 text-[#006c4a]" />
              <span className="font-bold">{syncBatch.paymentsCount}</span> cobros
            </div>
            <div className="w-1 h-1 rounded-full bg-[#c5c5d3]" />
            <div className="flex items-center gap-1">
              <LocalIcon name="database" className="w-4 h-4 text-[#006c4a]" />
              <span>{syncBatch.sizeKb} KB</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSyncWhatsApp}
          className="w-full h-12 bg-[#006c4a] hover:bg-[#005137] text-white rounded-lg px-4 flex items-center justify-center gap-2 font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-[15px] shadow-sm active:scale-[0.99] transition-all cursor-pointer"
        >
          <LocalIcon name="send" className="w-5.5 h-5.5" />
          <span>Enviar Archivo WhatsApp a Casa Central</span>
        </button>
      </section>

      {/* 4. Quick Street Sale Form Panel ("Venta In Situ al Paso" / Fast Draft) */}
      <section className="w-full bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#e2e8f0] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#dce9ff] text-[#00236f] flex items-center justify-center">
              <LocalIcon name="point_of_sale" className="w-5 h-5" />
            </div>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#0b1c30]">
              Venta In Situ al Paso
            </h2>
          </div>
          <span className="text-[11px] text-[#006c4a] bg-[#82f5c1] px-2 py-0.5 rounded-full font-bold">
            Fast Draft
          </span>
        </div>

        {/* Client Selector Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#444651] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006c4a]" />
              Cliente en Rango (Geocerca)
            </span>
            <button
              type="button"
              onClick={onOpenClientPicker}
              className="text-[#00236f] hover:underline font-bold text-[11px] cursor-pointer"
            >
              Cambiar cliente
            </button>
          </label>
          <div
            onClick={onOpenClientPicker}
            className="w-full h-11 bg-[#eff4ff] hover:bg-[#e5eeff] rounded-lg px-3 flex items-center justify-between gap-2 border border-[#e5eeff] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <LocalIcon name="store" className="text-[#006c4a] w-5 h-5 shrink-0" />
              <span className="font-['Inter',sans-serif] text-[13px] font-semibold text-[#0b1c30] truncate">
                {activeClient.code} {activeClient.name}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#444651] text-[11px] font-bold shrink-0">
              Saldo: {formatMoney(activeClient.currentDebt)}
            </span>
          </div>
        </div>

        {/* Street Basket Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[#444651] text-[11px] font-semibold px-1">
            <span>Canasta de Carga en Móvil</span>
            <span>Subtotal</span>
          </div>

          {draftItems.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-[#eff4ff] rounded-lg flex items-center justify-between gap-2 border border-[#e5eeff]/80"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#00236f] font-['Inter',sans-serif] font-bold text-[13px] shrink-0 shadow-xs border border-[#dce9ff]">
                  {item.codePrefix}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-semibold text-[#0b1c30] truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-[#444651] truncate">
                    {item.presentation}
                  </span>
                </div>
              </div>
              <span className="font-['Inter',sans-serif] font-bold text-[14px] text-[#0b1c30] shrink-0">
                {formatMoney(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Total Display Banner */}
        <div className="p-3.5 bg-[#1e3a8a] text-white rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#90a8ff] font-bold uppercase tracking-wider">
              Total a Cobrar
            </span>
            <span className="text-[11px] text-[#dce1ff]">
              {draftItems.length} líneas de productos ({totalBultos} bultos)
            </span>
          </div>
          <div className="font-['Plus_Jakarta_Sans',sans-serif] font-extrabold text-[22px] tracking-tight">
            {formatMoney(totalAmount)}
          </div>
        </div>

        {/* Payment Condition Segmented Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-[#444651]">Condición de Pago In Situ</span>
          <div className="grid grid-cols-3 gap-2" id="paymentOptions">
            <button
              type="button"
              onClick={() => setPaymentMethod('efectivo')}
              className={`h-10 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethod === 'efectivo'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'bg-[#dce9ff] text-[#0b1c30] hover:bg-[#cbdbf5]'
              }`}
            >
              <LocalIcon name="payments" className="w-4 h-4" />
              <span>Efectivo</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('cta_cte')}
              className={`h-10 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethod === 'cta_cte'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'bg-[#dce9ff] text-[#0b1c30] hover:bg-[#cbdbf5]'
              }`}
            >
              <LocalIcon name="account_balance_wallet" className="w-4 h-4" />
              <span>Cta. Cte.</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('qr')}
              className={`h-10 rounded-lg text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethod === 'qr'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'bg-[#dce9ff] text-[#0b1c30] hover:bg-[#cbdbf5]'
              }`}
            >
              <LocalIcon name="qr_code_2" className="w-4 h-4" />
              <span>Cobro QR</span>
            </button>
          </div>
        </div>

        {/* WhatsApp Receipt & Record Action Button */}
        <button
          type="button"
          onClick={handleRegisterSale}
          className="w-full h-13 bg-[#006c4a] hover:bg-[#005137] text-white rounded-lg px-3 flex items-center justify-center gap-2 font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] shadow-md active:scale-[0.99] transition-all cursor-pointer"
        >
          <LocalIcon name="share" className="w-5.5 h-5.5" />
          <span className="truncate">Registrar Venta & Comprobante WhatsApp</span>
        </button>
      </section>

      {/* 5. Route Summary Mini Sparklines */}
      <section className="w-full grid grid-cols-3 gap-2">
        <div className="bg-[#ffffff] p-2.5 rounded-xl shadow-xs border border-[#e2e8f0] flex flex-col">
          <span className="text-[11px] font-medium text-[#444651]">Preventa Hoy</span>
          <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#0b1c30]">
            $268.100
          </span>
          <span className="text-[11px] font-semibold text-[#006c4a] flex items-center gap-0.5 mt-0.5">
            <LocalIcon name="trending_up" className="w-3.5 h-3.5" /> 18 pedidos
          </span>
        </div>
        <div className="bg-[#ffffff] p-2.5 rounded-xl shadow-xs border border-[#e2e8f0] flex flex-col">
          <span className="text-[11px] font-medium text-[#444651]">Cobrado Efectivo</span>
          <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#0b1c30]">
            $139.900
          </span>
          <span className="text-[11px] font-semibold text-[#00236f] flex items-center gap-0.5 mt-0.5">
            <LocalIcon name="lock" className="w-3.5 h-3.5" /> En caja móvil
          </span>
        </div>
        <div className="bg-[#ffffff] p-2.5 rounded-xl shadow-xs border border-[#e2e8f0] flex flex-col">
          <span className="text-[11px] font-medium text-[#444651]">Efectividad</span>
          <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#0b1c30]">
            92%
          </span>
          <span className="text-[11px] font-medium text-[#444651] flex items-center gap-0.5 mt-0.5">
            <LocalIcon name="check_circle" className="w-3.5 h-3.5 text-[#006c4a]" />{' '}
            22/24 vis.
          </span>
        </div>
      </section>

      {/* 6. Today's Order & Street Sales List */}
      <section className="w-full space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#0b1c30]">
            Ventas y Pedidos Tomados Hoy
          </h3>
          <span className="text-[11px] font-semibold text-[#444651]">
            {orders.length} de {orders.length + 11} mostrados
          </span>
        </div>

        {/* List of Orders */}
        {orders.map((ord) => {
          const isPendingSync = ord.status === 'pending_sync';
          return (
            <article
              key={ord.id}
              className="w-full bg-[#ffffff] rounded-xl p-3 shadow-xs border border-[#e2e8f0] space-y-2 transition-all hover:border-[#cbdbf5]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      ord.type === 'remito'
                        ? 'bg-[#82f5c1] text-[#00714e]'
                        : ord.type === 'preventa'
                        ? 'bg-[#dce9ff] text-[#00236f]'
                        : 'bg-[#dce9ff] text-[#00236f]'
                    }`}
                  >
                    <LocalIcon
                      name={
                        ord.type === 'remito'
                          ? 'local_shipping'
                          : ord.type === 'preventa'
                          ? 'calendar_today'
                          : 'shopping_bag'
                      }
                      className="w-4.5 h-4.5"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30] truncate">
                      {ord.clientName}
                    </span>
                    <span className="text-[11px] text-[#444651] truncate">
                      {ord.type === 'in_situ'
                        ? 'Venta en el acto • Cobrado Efectivo'
                        : ord.type === 'preventa'
                        ? `Preventa para mañana • Pedido ${ord.orderNumber}`
                        : `${ord.remitoNumber || 'Remito'} • Cta. Cte.`}
                    </span>
                  </div>
                </div>
                <span className="font-['Inter',sans-serif] font-bold text-[15px] text-[#0b1c30] shrink-0">
                  {formatMoney(ord.total)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9]">
                <div className="flex items-center gap-1.5">
                  {isPendingSync ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                      Pendiente Sync WhatsApp
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] text-[10px] font-bold flex items-center gap-1">
                      <LocalIcon name="done_all" className="w-3.5 h-3.5" />
                      Sincronizado OK
                    </span>
                  )}
                  <span className="text-[11px] text-[#444651]">{ord.time}</span>
                </div>

                <div className="flex items-center gap-1">
                  {ord.digitalSignature && (
                    <span className="text-[11px] text-[#444651] mr-1 hidden sm:inline">
                      Firma digital recibida
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onViewTicket(ord)}
                    className="text-[#006c4a] hover:text-[#005137] font-semibold text-[12px] flex items-center gap-0.5 py-1 px-1.5 rounded hover:bg-[#eff4ff] cursor-pointer"
                  >
                    <LocalIcon name="receipt" className="w-4 h-4" /> Ticket
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* 7. Sticky Quick WhatsApp Export Floating Bar for Fast Reach */}
      <aside className="sticky bottom-2 w-full z-40">
        <div className="w-full bg-[#213145] text-[#eaf1ff] rounded-xl p-2 px-3 shadow-xl flex items-center justify-between gap-2 border border-slate-700/50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#006c4a] flex items-center justify-center text-white shrink-0">
              <LocalIcon name="cloud_upload" className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-bold truncate leading-tight text-white">
                {pendingCount} Registros sin enviar
              </span>
              <span className="text-[11px] text-[#c5c5d3] truncate">
                Crea backup cifrado .dist
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onFloatingExport}
            className="h-9 px-3 bg-[#006c4a] hover:bg-[#005137] text-white text-[12px] font-bold rounded-lg flex items-center gap-1.5 shrink-0 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <LocalIcon name="chat" className="w-4 h-4" />
            <span>Exportar WhatsApp</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
