import React, { useState, useRef } from 'react';
import { Order, Product, Client } from '../types';
import { LocalIcon } from './LocalIcon';

interface RecepcionPedidosTabProps {
  orders: Order[];
  products: Product[];
  clients: Client[];
  onProcessIncomingOrder: (order: Order) => void;
  onTriggerToast: (title: string, message: string) => void;
  onViewTicket?: (order: Order) => void;
}

export const RecepcionPedidosTab: React.FC<RecepcionPedidosTabProps> = ({
  orders,
  products,
  clients,
  onProcessIncomingOrder,
  onTriggerToast,
  onViewTicket,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [parsedOrder, setParsedOrder] = useState<Order | null>(null);
  const [rawJsonText, setRawJsonText] = useState('');
  const [showJsonTextarea, setShowJsonTextarea] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatMoney = (val: number) => '$' + val.toLocaleString('es-AR');

  // Process uploaded JSON file
  const handleProcessFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseOrderData(content, file.name);
    };
    reader.onerror = () => {
      onTriggerToast('Error de Lectura', 'No se pudo leer el archivo seleccionado.');
    };
    reader.readAsText(file);
  };

  const parseOrderData = (rawText: string, fileName?: string) => {
    try {
      const data = JSON.parse(rawText.trim());

      // Check if it is a single Order
      if (data.orderNumber && data.items && Array.isArray(data.items)) {
        setParsedOrder(data as Order);
        onTriggerToast(
          'Pedido Reconocido',
          `Pedido ${data.orderNumber} de ${data.clientName || 'Cliente'} listo para verificar e ingresar.`
        );
        return;
      }

      // Check if it's a batch with orders array
      if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
        // Take the first order or alert
        const firstOrder = data.orders[0];
        setParsedOrder(firstOrder as Order);
        onTriggerToast(
          'Lote Detectado',
          `El archivo contiene ${data.orders.length} pedidos. Mostrando ${firstOrder.orderNumber} para procesar.`
        );
        return;
      }

      throw new Error('Formato de pedido no compatible');
    } catch {
      onTriggerToast(
        'Archivo No Válido',
        'El archivo o texto no contiene un formato de pedido JSON válido de DistriPro.'
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleSimulateWhatsAppOrder = () => {
    const targetClient = clients[0] || {
      id: 'cli-1049',
      name: 'Kiosco La Estación',
      code: '#CLI-1049',
      address: 'Av. Corrientes 1420',
      phone: '+54 9 11 4829-1029',
      currentDebt: 32000,
      creditLimit: 250000,
    };

    const randNum = Math.floor(2000 + Math.random() * 7000);
    const sampleItems = products.slice(0, 3).map((p, idx) => ({
      productId: p.id,
      name: p.name,
      presentation: p.presentation,
      quantity: (idx + 1) * 2,
      unitPrice: p.priceWholesale,
      subtotal: (idx + 1) * 2 * p.priceWholesale,
    }));

    const rawSubtotal = sampleItems.reduce((acc, it) => acc + it.subtotal, 0);
    const discPercent = 10;
    const discAmount = Math.round(rawSubtotal * (discPercent / 100));
    const finalTotal = rawSubtotal - discAmount;

    const simulatedOrder: Order = {
      id: `ord-wasap-${Date.now()}`,
      orderNumber: `#PED-${randNum}`,
      clientId: targetClient.id,
      clientName: targetClient.name,
      clientCode: targetClient.code,
      date: 'Hoy',
      time: `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')} hs`,
      type: 'preventa',
      status: 'pending_sync',
      items: sampleItems,
      total: finalTotal,
      subtotalOriginal: rawSubtotal,
      discountPercent: discPercent,
      discountAmount: discAmount,
      paymentMethod: 'efectivo',
      bultosCount: sampleItems.reduce((acc, it) => acc + it.quantity, 0),
      notes: 'Pedido recibido vía WhatsApp desde catálogo autogestión con pago contra entrega.',
    };

    setParsedOrder(simulatedOrder);
    onTriggerToast(
      'Pedido Simulado Cargado',
      `Pedido ${simulatedOrder.orderNumber} de ${simulatedOrder.clientName} listo para ingresar.`
    );
  };

  const handleConfirmOrderAdmission = () => {
    if (!parsedOrder) return;
    onProcessIncomingOrder(parsedOrder);
    setParsedOrder(null);
    setRawJsonText('');
  };

  // Matched client in database
  const matchedClient = parsedOrder
    ? clients.find(
        (c) => c.id === parsedOrder.clientId || c.code === parsedOrder.clientCode
      )
    : null;

  const clientDebt = matchedClient?.currentDebt ?? 0;
  const clientLimit = matchedClient?.creditLimit ?? 200000;
  const clientAvailable = Math.max(0, clientLimit - clientDebt);

  const [selectedClientFilter, setSelectedClientFilter] = useState<string | null>(null);

  // Client rankings and purchase metrics to identify the best client
  const clientRankings = React.useMemo(() => {
    return clients
      .map((client) => {
        // Find all central orders for this client
        const clientOrders = orders.filter(
          (o) =>
            o.clientId === client.id ||
            o.clientCode.toUpperCase() === client.code.toUpperCase() ||
            o.clientName.toLowerCase() === client.name.toLowerCase()
        );

        const countFromOrders = clientOrders.length;
        const spentFromOrders = clientOrders.reduce((sum, o) => sum + o.total, 0);

        const totalPurchases = Math.max(countFromOrders, client.totalOrdersCount || 0);
        const totalMoneySpent = Math.max(spentFromOrders, client.totalSpent || 0);
        const averageTicket = totalPurchases > 0 ? Math.round(totalMoneySpent / totalPurchases) : 0;

        return {
          client,
          ordersCount: totalPurchases,
          ordersInCentralCount: countFromOrders,
          totalSpent: totalMoneySpent,
          averageTicket,
          lastOrder: clientOrders[0]
            ? `${clientOrders[0].date} ${clientOrders[0].time}`
            : client.lastVisit || 'Sin compras recientes',
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [clients, orders]);

  const bestClient = clientRankings[0];
  const secondClient = clientRankings[1];
  const thirdClient = clientRankings[2];

  // Filter existing central orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.clientName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.clientCode.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || ord.status === statusFilter;
    const matchesClient =
      !selectedClientFilter ||
      ord.clientId === selectedClientFilter ||
      ord.clientCode.toUpperCase() === selectedClientFilter.toUpperCase() ||
      ord.clientName.toLowerCase() === selectedClientFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesClient;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <LocalIcon name="inbox" className="w-6 h-6" />
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-[#00236f]">
              Recepción de Pedidos desde WhatsApp (Archivos JSON)
            </h1>
          </div>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Carga aquí el archivo JSON que te envió el cliente o preventista por WhatsApp para verificar mercadería, comprobar transferencias, actualizar stock central e impactar la cuenta corriente.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulateWhatsAppOrder}
          className="h-9 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[12px] rounded-lg border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
        >
          <LocalIcon name="play_arrow" className="w-4 h-4 text-emerald-700" />
          <span>Simular Archivo Recibido por WhatsApp</span>
        </button>
      </div>

      {/* Grid: Upload Box + Order Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & Input */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-600 bg-emerald-50/70'
                : 'border-[#cbd5e1] bg-white hover:bg-[#f8f9ff]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.dist,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eff4ff] text-[#00236f] flex items-center justify-center mb-3 shadow-xs">
              <LocalIcon name="upload_file" className="w-7 h-7" />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#0b1c30]">
              Cargar Archivo JSON de Pedido
            </h3>
            <p className="text-[12px] text-[#64748b] mt-1 max-w-xs mx-auto">
              Arrastra el archivo <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded text-emerald-800">pedido_*.json</code> o <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded text-blue-800">.dist</code> recibido por WhatsApp
            </p>
            <div className="mt-3 inline-block">
              <span className="h-8 px-3 bg-[#00236f] text-white text-[12px] font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs">
                <LocalIcon name="folder_open" className="w-3.5 h-3.5 text-[#82f5c1]" />
                <span>Explorar Archivos</span>
              </span>
            </div>
          </div>

          {/* Toggle Textarea for copy-pasted JSON */}
          <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] space-y-2">
            <button
              type="button"
              onClick={() => setShowJsonTextarea(!showJsonTextarea)}
              className="w-full flex items-center justify-between text-[12px] font-bold text-[#00236f] cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <LocalIcon name="code" className="w-4 h-4 text-[#64748b]" />
                <span>O pegar texto JSON de WhatsApp</span>
              </span>
              <LocalIcon
                name={showJsonTextarea ? 'expand_less' : 'expand_more'}
                className="w-4 h-4 text-[#64748b]"
              />
            </button>

            {showJsonTextarea && (
              <div className="pt-2 space-y-2 animate-in fade-in">
                <textarea
                  rows={4}
                  value={rawJsonText}
                  onChange={(e) => setRawJsonText(e.target.value)}
                  placeholder="Pega aquí el JSON del pedido..."
                  className="w-full p-2.5 rounded-lg border border-[#cbd5e1] font-mono text-[11px] bg-[#f8f9ff] focus:outline-none focus:ring-1 focus:ring-[#00236f]"
                />
                <button
                  type="button"
                  disabled={!rawJsonText.trim()}
                  onClick={() => parseOrderData(rawJsonText)}
                  className="w-full h-8 bg-[#00236f] text-white font-bold text-[11px] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Analizar Pedido Pegado
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Visualizer & Admission Action */}
        <div className="lg:col-span-7">
          {parsedOrder ? (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-300 overflow-hidden animate-in fade-in">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#00236f] to-[#001950] text-white p-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-500 text-white font-mono text-[11px] font-bold rounded">
                      PEDIDO WHATSAPP
                    </span>
                    <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px]">
                      {parsedOrder.orderNumber}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#dce1ff] mt-0.5">
                    {parsedOrder.date} a las {parsedOrder.time} • {parsedOrder.items?.length || 0} productos
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-[#82f5c1] font-bold uppercase">Total del Pedido</div>
                  <div className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[22px] text-white">
                    {formatMoney(parsedOrder.total)}
                  </div>
                </div>
              </div>

              {/* Client & Payment Info */}
              <div className="p-4 space-y-3.5 text-[13px]">
                {/* Client Banner */}
                <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-[#00236f] text-[14px]">
                      {parsedOrder.clientName}
                    </div>
                    <div className="text-[12px] text-[#64748b]">
                      Código: <span className="font-mono font-semibold">{parsedOrder.clientCode}</span>
                      {matchedClient && (
                        <span> • Zona: <strong className="text-[#0b1c30]">{matchedClient.zone}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Credit Status */}
                  <div className="flex items-center gap-3 text-right text-[11px]">
                    <div>
                      <span className="text-[#64748b] block">Deuda Actual</span>
                      <span className={`font-mono font-bold ${clientDebt > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {formatMoney(clientDebt)}
                      </span>
                    </div>
                    <div className="border-l border-[#dce9ff] pl-3">
                      <span className="text-[#64748b] block">Crédito Disponible</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {formatMoney(clientAvailable)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Condition */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LocalIcon
                      name={
                        parsedOrder.paymentMethod === 'efectivo'
                          ? 'payments'
                          : parsedOrder.paymentMethod === 'cta_cte'
                          ? 'credit_score'
                          : 'account_balance'
                      }
                      className="w-5 h-5 text-emerald-700"
                    />
                    <div>
                      <div className="font-bold text-emerald-900 text-[12px]">
                        Forma de Pago: {parsedOrder.paymentMethod === 'efectivo' ? 'Efectivo Contado' : parsedOrder.paymentMethod === 'cta_cte' ? 'Cuenta Corriente' : 'Transferencia / QR'}
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        {parsedOrder.paymentMethod === 'efectivo' && (
                          <span>Aplica {parsedOrder.discountPercent || 10}% descuento contado (-{formatMoney(parsedOrder.discountAmount || 0)})</span>
                        )}
                        {parsedOrder.paymentMethod === 'cta_cte' && (
                          <span>Se cargará automáticamente a la cuenta corriente del cliente</span>
                        )}
                        {(parsedOrder.paymentMethod === 'qr' || parsedOrder.paymentMethod === 'transferencia') && (
                          <span>Comprobante / Ref: {parsedOrder.transferProof || 'Verificado en banco'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-200/80 text-emerald-900 text-[11px] font-bold rounded-full">
                    {parsedOrder.paymentMethod?.toUpperCase()}
                  </span>
                </div>

                {/* Items Table */}
                <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] font-semibold">
                      <tr>
                        <th className="py-2 px-3">Producto</th>
                        <th className="py-2 px-3 text-center">Cant.</th>
                        <th className="py-2 px-3 text-right">P. Unit</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {parsedOrder.items.map((it, idx) => {
                        const matchedProd = products.find((p) => p.id === it.productId);
                        return (
                          <tr key={idx} className="hover:bg-[#f8f9ff]">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                {matchedProd?.imageUrl ? (
                                  <img
                                    src={matchedProd.imageUrl}
                                    alt={it.name}
                                    className="w-8 h-8 rounded object-cover border border-[#e2e8f0] shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded bg-[#eff4ff] text-[#00236f] flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {it.name.slice(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-[#0b1c30] truncate max-w-[200px]">
                                    {it.name}
                                  </div>
                                  <div className="text-[10px] text-[#64748b]">{it.presentation}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold">
                              {it.quantity}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-[#64748b]">
                              {formatMoney(it.unitPrice)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-[#00236f]">
                              {formatMoney(it.subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Notes */}
                {parsedOrder.notes && (
                  <div className="text-[11px] text-[#64748b] bg-slate-50 p-2.5 rounded-lg border border-[#e2e8f0]">
                    <strong className="text-[#0b1c30]">Notas del pedido:</strong> {parsedOrder.notes}
                  </div>
                )}

                {/* Confirmation Button */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmOrderAdmission}
                    className="flex-1 h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
                  >
                    <LocalIcon name="task_alt" className="w-5 h-5 text-[#82f5c1]" />
                    <span>📥 Confirmar e Ingresar Pedido a Central</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setParsedOrder(null)}
                    className="h-11 px-4 bg-slate-100 hover:bg-slate-200 text-[#444651] font-bold text-[12px] rounded-xl cursor-pointer"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xs border border-[#e2e8f0] p-10 text-center flex flex-col items-center justify-center min-h-[340px]">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <LocalIcon name="receipt_long" className="w-8 h-8" />
              </div>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#00236f]">
                Esperando archivo de pedido...
              </h3>
              <p className="text-[12px] text-[#64748b] max-w-sm mt-1">
                Arrastra el archivo JSON recibido por WhatsApp o haz clic en "Simular Archivo Recibido" arriba para probar el flujo de ingreso de pedidos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* RANKING Y CANTIDAD DE COMPRAS POR CLIENTE (MEJOR CLIENTE)      */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#e2e8f0] overflow-hidden p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[18px] text-[#00236f]">
                Ranking de Compras por Cliente (¿Quién es el Mejor Cliente?)
              </h2>
            </div>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Historial consolidado de pedidos y facturación por comercio para identificar a los clientes con mayor volumen y frecuencia.
            </p>
          </div>

          {selectedClientFilter && (
            <button
              type="button"
              onClick={() => setSelectedClientFilter(null)}
              className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0b1c30] text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LocalIcon name="close" className="w-3.5 h-3.5 text-slate-600" />
              <span>Ver Todos los Clientes</span>
            </button>
          )}
        </div>

        {/* Podium: Top 3 Best Clients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* #1 BEST CLIENT */}
          {bestClient && (
            <div className="relative bg-gradient-to-br from-amber-50 to-amber-100/60 p-4 rounded-xl border-2 border-amber-400/80 shadow-xs flex flex-col justify-between">
              <div className="absolute -top-3 -right-2 bg-amber-400 text-amber-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                <span>🥇 #1 MEJOR CLIENTE</span>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <LocalIcon name="trophy" className="w-4 h-4 text-amber-600" />
                  <span>Mayor Facturación</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-amber-950 mt-1 truncate">
                  {bestClient.client.name}
                </h3>
                <div className="text-[11px] text-amber-900/80 font-mono">
                  {bestClient.client.code} • {bestClient.client.zone}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-300/60 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-amber-900">Total Comprado:</span>
                  <span className="font-mono font-black text-[18px] text-amber-950">
                    {formatMoney(bestClient.totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-amber-900">
                  <span>Cantidad de Compras:</span>
                  <span className="font-mono font-bold bg-amber-200/80 text-amber-950 px-1.5 py-0.2 rounded">
                    {bestClient.ordersCount} pedidos
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-amber-900">
                  <span>Ticket Promedio:</span>
                  <span className="font-mono font-semibold">{formatMoney(bestClient.averageTicket)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedClientFilter(bestClient.client.id)}
                  className="w-full mt-2 h-8 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <LocalIcon name="receipt" className="w-3.5 h-3.5" />
                  <span>Ver {bestClient.ordersCount} pedidos de este cliente</span>
                </button>
              </div>
            </div>
          )}

          {/* #2 SECOND CLIENT */}
          {secondClient && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <span>🥈 #2 CLIENTE DESTACADO</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#00236f] mt-1 truncate">
                  {secondClient.client.name}
                </h3>
                <div className="text-[11px] text-[#64748b] font-mono">
                  {secondClient.client.code} • {secondClient.client.zone}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-[#64748b]">Total Comprado:</span>
                  <span className="font-mono font-bold text-[16px] text-[#00236f]">
                    {formatMoney(secondClient.totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#64748b]">
                  <span>Cantidad de Compras:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">
                    {secondClient.ordersCount} pedidos
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#64748b]">
                  <span>Ticket Promedio:</span>
                  <span className="font-mono">{formatMoney(secondClient.averageTicket)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedClientFilter(secondClient.client.id)}
                  className="w-full mt-2 h-8 bg-slate-200 hover:bg-slate-300 text-[#0b1c30] font-semibold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <LocalIcon name="receipt" className="w-3.5 h-3.5" />
                  <span>Ver {secondClient.ordersCount} pedidos</span>
                </button>
              </div>
            </div>
          )}

          {/* #3 THIRD CLIENT */}
          {thirdClient && (
            <div className="bg-slate-50 p-4 rounded-xl border border-amber-200/70 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <span>🥉 #3 CLIENTE FRECUENTE</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#00236f] mt-1 truncate">
                  {thirdClient.client.name}
                </h3>
                <div className="text-[11px] text-[#64748b] font-mono">
                  {thirdClient.client.code} • {thirdClient.client.zone}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] text-[#64748b]">Total Comprado:</span>
                  <span className="font-mono font-bold text-[16px] text-[#00236f]">
                    {formatMoney(thirdClient.totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#64748b]">
                  <span>Cantidad de Compras:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">
                    {thirdClient.ordersCount} pedidos
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#64748b]">
                  <span>Ticket Promedio:</span>
                  <span className="font-mono">{formatMoney(thirdClient.averageTicket)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedClientFilter(thirdClient.client.id)}
                  className="w-full mt-2 h-8 bg-slate-200 hover:bg-slate-300 text-[#0b1c30] font-semibold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <LocalIcon name="receipt" className="w-3.5 h-3.5" />
                  <span>Ver {thirdClient.ordersCount} pedidos</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Complete Client Purchase Breakdown Table */}
        <div className="border border-[#e2e8f0] rounded-xl overflow-hidden">
          <div className="p-3 bg-[#f8f9ff] border-b border-[#e2e8f0] flex items-center justify-between">
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[13px] text-[#00236f]">
              Tabla Comparativa de Clientes por Cantidad de Compras ({clientRankings.length})
            </span>
            <span className="text-[11px] text-[#64748b]">
              Ordenado por mayor total facturado acumulado
            </span>
          </div>
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] text-[10px] uppercase tracking-wider font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3 text-center">Puesto</th>
                  <th className="py-2.5 px-3">Cliente / Comercio</th>
                  <th className="py-2.5 px-3">Zona</th>
                  <th className="py-2.5 px-3 text-center">Compras Totales</th>
                  <th className="py-2.5 px-3 text-right">Total Facturado</th>
                  <th className="py-2.5 px-3 text-right">Ticket Promedio</th>
                  <th className="py-2.5 px-3">Última Compra</th>
                  <th className="py-2.5 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {clientRankings.map((rank, idx) => {
                  const isSelected = selectedClientFilter === rank.client.id;
                  return (
                    <tr
                      key={rank.client.id}
                      className={`hover:bg-[#f8f9ff] transition-colors ${
                        isSelected ? 'bg-blue-50/80 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-bold">
                        {idx === 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                            🥇 #1
                          </span>
                        ) : idx === 1 ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-bold">
                            🥈 #2
                          </span>
                        ) : idx === 2 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                            🥉 #3
                          </span>
                        ) : (
                          <span className="text-[#64748b]">#{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#0b1c30]">{rank.client.name}</div>
                        <div className="text-[10px] text-[#64748b] font-mono">{rank.client.code}</div>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#64748b]">{rank.client.zone}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#00236f]">
                        <span className="px-2 py-0.5 bg-[#eff4ff] rounded-md text-[#00236f]">
                          {rank.ordersCount} compras
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        {formatMoney(rank.totalSpent)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#64748b]">
                        {formatMoney(rank.averageTicket)}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#64748b]">{rank.lastOrder}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedClientFilter(isSelected ? null : rank.client.id)
                          }
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#00236f] text-white'
                              : 'bg-slate-100 hover:bg-[#eff4ff] text-[#00236f]'
                          }`}
                        >
                          {isSelected ? '✓ Viendo Pedidos' : 'Ver Pedidos'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Orders History in Casa Central */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#e2e8f0] overflow-hidden space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] text-[#00236f]">
                Historial de Pedidos en Casa Central ({filteredOrders.length})
              </h2>
              {selectedClientFilter && (
                <span className="bg-blue-100 text-[#00236f] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>
                    Filtrado por:{' '}
                    {clients.find((c) => c.id === selectedClientFilter)?.name || selectedClientFilter}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedClientFilter(null)}
                    className="hover:text-rose-600 cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              {selectedClientFilter
                ? `Mostrando únicamente los pedidos del cliente seleccionado. Haz clic en "×" para ver todos.`
                : `Historial de órdenes procesadas y listas para armar reparto o facturación.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <LocalIcon
                name="search"
                className="w-4 h-4 text-[#94a3b8] absolute left-2.5 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Buscar por N° pedido o cliente..."
                className="h-8 pl-8 pr-2.5 rounded-lg border border-[#cbd5e1] text-[12px] bg-[#f8f9ff] focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-[#cbd5e1] text-[12px] bg-[#f8f9ff]"
            >
              <option value="all">Todos los estados</option>
              <option value="synced">Sincronizados en Central</option>
              <option value="delivered">Entregados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4">Nº Pedido</th>
                <th className="py-2.5 px-4">Fecha / Hora</th>
                <th className="py-2.5 px-4">Cliente & Comercio</th>
                <th className="py-2.5 px-4 text-center">Bultos</th>
                <th className="py-2.5 px-4 text-right">Total</th>
                <th className="py-2.5 px-4 text-center">Pago</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#64748b] text-[13px]">
                    No se encontraron pedidos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#00236f]">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-[12px]">
                      <div>{ord.date}</div>
                      <div className="text-[10px] text-[#64748b]">{ord.time}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0b1c30]">{ord.clientName}</div>
                      <div className="text-[11px] text-[#64748b] font-mono">{ord.clientCode}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      {ord.bultosCount || ord.items.reduce((sum, it) => sum + it.quantity, 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#00236f]">
                      {formatMoney(ord.total)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-700">
                        {ord.paymentMethod || 'Efectivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        En Central
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {onViewTicket && (
                        <button
                          type="button"
                          onClick={() => onViewTicket(ord)}
                          className="p-1.5 hover:bg-[#eff4ff] text-[#00236f] rounded-lg transition-colors cursor-pointer"
                          title="Ver remito / comprobante"
                        >
                          <LocalIcon name="receipt" className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
