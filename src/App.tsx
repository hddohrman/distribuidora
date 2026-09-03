/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  TabType,
  Product,
  Client,
  Order,
  PaymentCollection,
  PaymentMethod,
  BasketItem,
  SyncBatchInfo,
  AuthSession,
  BankInfo,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CLIENTS,
  INITIAL_ORDERS,
  INITIAL_SYNC_BATCH,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PedidosView } from './components/PedidosView';
import { CatalogoView } from './components/CatalogoView';
import { ClientesView } from './components/ClientesView';
import { SaldosView } from './components/SaldosView';
import { SyncView } from './components/SyncView';
import { TicketModal } from './components/TicketModal';
import { ScannerModal } from './components/ScannerModal';
import { ClientPickerModal } from './components/ClientPickerModal';
import { NewSaleModal } from './components/NewSaleModal';
import { ProfileModal } from './components/ProfileModal';
import { LoginModal } from './components/LoginModal';
import { WhatsAppCatalogModal } from './components/WhatsAppCatalogModal';
import { ClientOrderModal } from './components/ClientOrderModal';
import { ManualTecnicoModal } from './components/ManualTecnicoModal';
import { LocalIcon } from './components/LocalIcon';

export default function App() {
  // Authentication & Session
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(true);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('catalogo');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Core Data
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [activeClient, setActiveClient] = useState<Client>(INITIAL_CLIENTS[0]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [collections, setCollections] = useState<PaymentCollection[]>([
    {
      id: 'col-1',
      receiptNumber: 'REC-0089',
      clientId: 'cli-1049',
      clientName: 'Kiosco La Estación',
      amount: 15000,
      paymentMethod: 'efectivo',
      date: 'Hoy',
      time: '11:40 hs',
      status: 'pending_sync',
    },
  ]);
  const [syncBatch, setSyncBatch] = useState<SyncBatchInfo>(INITIAL_SYNC_BATCH);

  // Commercial policies synced via WhatsApp / Web
  const [cashDiscountPercent, setCashDiscountPercent] = useState<number>(10);
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    alias: 'DISTRI.PRO.PAGOS',
    cbu: '0000003100012345678901',
    bankName: 'Banco Galicia',
    accountHolder: 'DistriPro S.A. Mayorista',
    cuit: '30-71234567-8',
  });

  // Client Basket (for client ordering from catalog)
  const [clientBasket, setClientBasket] = useState<BasketItem[]>([]);

  // Modals & Overlay states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false);
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isWhatsAppCatalogOpen, setIsWhatsAppCatalogOpen] = useState(false);
  const [isClientOrderOpen, setIsClientOrderOpen] = useState(false);
  const [isManualTecnicoOpen, setIsManualTecnicoOpen] = useState(false);
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  const triggerToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Handle Login or Role Change
  const handleLogin = (session: AuthSession) => {
    setAuthSession(session);
    setIsLoginModalOpen(false);

    if (session.role === 'cliente' && session.client) {
      setActiveClient(session.client);
      setActiveTab('catalogo');
      triggerToast(
        'Modo Cliente Activado',
        `Bienvenido ${session.client.name}. Catálogo listo para armar pedidos.`
      );
    } else {
      setActiveTab('pedidos');
      triggerToast(
        'Modo Vendedor Activado',
        `Bienvenido David C. Acceso completo a stock, ventas y cobranzas.`
      );
    }
  };

  // Pending count calculation
  const pendingOrders = orders.filter((o) => o.status === 'pending_sync');
  const pendingCollections = collections.filter((c) => c.status === 'pending_sync');
  const pendingCount = pendingOrders.length + pendingCollections.length + 3;

  // Handle Fast Draft Sale (from the main Pedidos screen)
  const handleRegisterFastDraftSale = (
    client: Client,
    items: BasketItem[],
    paymentMethod: PaymentMethod
  ) => {
    const rawTotal = items.reduce((sum, it) => sum + it.subtotal, 0);
    const bultos = items.reduce((sum, it) => sum + it.quantity, 0);
    const discountAmount = paymentMethod === 'efectivo' ? Math.round((rawTotal * cashDiscountPercent) / 100) : 0;
    const finalTotal = rawTotal - discountAmount;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} hs`;
    const randNum = Math.floor(8200 + Math.random() * 800);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `#PED-${randNum}`,
      clientId: client.id,
      clientName: client.name,
      clientCode: client.code,
      date: 'Hoy',
      time: timeStr,
      type: 'in_situ',
      status: 'pending_sync',
      items: items,
      total: finalTotal,
      subtotalOriginal: rawTotal,
      discountAmount: discountAmount,
      discountPercent: paymentMethod === 'efectivo' ? cashDiscountPercent : 0,
      bultosCount: bultos,
      paymentMethod: paymentMethod,
      notes: 'Venta in situ al paso registrada desde móvil',
    };

    setOrders([newOrder, ...orders]);

    if (paymentMethod === 'cta_cte') {
      setClients((prev) =>
        prev.map((c) =>
          c.id === client.id ? { ...c, currentDebt: c.currentDebt + finalTotal } : c
        )
      );
    }

    triggerToast(
      '¡Venta In Situ Guardada!',
      `Pedido registrado para ${client.name} por $${finalTotal.toLocaleString('es-AR')}`
    );

    setTimeout(() => {
      setTicketOrder(newOrder);
    }, 400);
  };

  // Handle Full New Sale from Vendor
  const handleCompleteSale = (order: Order) => {
    setOrders([order, ...orders]);
    triggerToast('¡Pedido Creado!', `${order.clientName} - ${order.orderNumber}`);
    setTimeout(() => {
      setTicketOrder(order);
    }, 300);
  };

  // Handle Client Confirm Order
  const handleConfirmClientOrder = (order: Order, sendWhatsApp: boolean) => {
    setOrders([order, ...orders]);
    setClientBasket([]);

    if (order.paymentMethod === 'cta_cte') {
      setClients((prev) =>
        prev.map((c) =>
          c.id === order.clientId ? { ...c, currentDebt: c.currentDebt + order.total } : c
        )
      );
      // Update session if it belongs to current logged client
      if (authSession?.client && authSession.client.id === order.clientId) {
        setAuthSession({
          ...authSession,
          client: {
            ...authSession.client,
            currentDebt: authSession.client.currentDebt + order.total,
          },
        });
      }
    }

    triggerToast(
      '¡Pedido Registrado con Éxito!',
      `${order.orderNumber} por $${order.total.toLocaleString('es-AR')}`
    );

    if (sendWhatsApp) {
      handleSendTicketWhatsApp(order);
    }

    setActiveTab('pedidos');
    setTimeout(() => {
      setTicketOrder(order);
    }, 500);
  };

  // Send WhatsApp Ticket / Order
  const handleSendTicketWhatsApp = (order: Order) => {
    const itemsText = order.items
      .map(
        (it) =>
          `• ${it.quantity}x ${it.name} (${it.presentation}) = $${it.subtotal.toLocaleString('es-AR')}`
      )
      .join('%0A');

    const isClientRole = authSession?.role === 'cliente';
    const title = isClientRole
      ? '*DISTRIPRO S.A. - NUEVO PEDIDO DE COMERCIO (CLIENTE)*'
      : '*DISTRIPRO S.A. - Comprobante de Entrega Preventa*';

    let paymentDetailText = '';
    if (order.paymentMethod === 'efectivo') {
      paymentDetailText = `*Forma de Pago:* EFECTIVO CONTADO%0A*Subtotal Lista:* $${(order.subtotalOriginal || order.total).toLocaleString('es-AR')}%0A*Descuento Comercial:* -${order.discountPercent || cashDiscountPercent}% (-$${(order.discountAmount || 0).toLocaleString('es-AR')})%0A*TOTAL A PAGAR EN MANO:* $${order.total.toLocaleString('es-AR')}`;
    } else if (order.paymentMethod === 'qr' || order.paymentMethod === 'transferencia') {
      paymentDetailText = `*Forma de Pago:* TRANSFERENCIA / QR%0A*TOTAL TRANSFERIDO:* $${order.total.toLocaleString('es-AR')}%0A*Alias Receptor:* ${bankInfo.alias}%0A*CBU:* ${bankInfo.cbu}%0A*Titular:* ${bankInfo.accountHolder}%0A*Ref. Comprobante:* ${order.transferProof || 'Se adjunta en este mensaje'}`;
    } else {
      paymentDetailText = `*Forma de Pago:* CUENTA CORRIENTE (A Plazo)%0A*TOTAL CARGADO A CUENTA:* $${order.total.toLocaleString('es-AR')}${order.creditRemaining !== undefined ? `%0A*Margen de Crédito Restante:* $${order.creditRemaining.toLocaleString('es-AR')}` : ''}`;
    }

    const message = `${title}%0A%0A*Pedido:* ${order.orderNumber}%0A*Comercio:* ${order.clientName} (${order.clientCode})%0A*Fecha:* ${order.date}, ${order.time}%0A%0A*Detalle de Mercadería:*%0A${itemsText}%0A%0A${paymentDetailText}%0A%0A*Observaciones / Entrega:* ${order.notes || 'Ninguna'}%0A%0A_Generado desde DistriPro Móvil_`;

    const clientObj = clients.find((c) => c.id === order.clientId) || activeClient;
    const phone = clientObj ? clientObj.phone.replace(/[^0-9]/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // Sync WhatsApp Batch to Central
  const handleSyncWhatsApp = () => {
    const message = `*DISTRIPRO - LOTE DE SINCRONIZACIÓN MÓVIL*%0A%0A*Archivo:* ${syncBatch.filename}%0A*Vendedor:* David C. (Zona 04 Centro)%0A*Lote ID:* ${syncBatch.batchId}%0A*Pedidos Registrados:* ${syncBatch.ordersCount + pendingOrders.length}%0A*Cobranzas:* ${syncBatch.paymentsCount}%0A*Tamaño Cifrado:* ${syncBatch.sizeKb} KB%0A*Timestamp:* ${new Date().toLocaleTimeString()} hs%0A%0A_Favor de procesar en ERP Casa Central y acusar recibo._`;

    triggerToast(
      'Sincronización WhatsApp Lista',
      `Abriendo WhatsApp con ${syncBatch.filename}`
    );

    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Floating Export
  const handleFloatingExport = () => {
    triggerToast(
      'Generando Lote Cifrado',
      `${pendingCount} pedidos compilados en archivo .dist`
    );
    setActiveTab('sync');
  };

  // Download .dist backup file directly
  const handleDownloadDistFile = () => {
    const batchData = {
      header: {
        vendor: 'David C.',
        zone: 'Zona 04 Centro',
        batchId: syncBatch.batchId,
        generatedAt: new Date().toISOString(),
        version: 'distripro-v3.9',
      },
      orders: orders,
      collections: collections,
      clientsUpdate: clients.map((c) => ({ id: c.id, debt: c.currentDebt, creditLimit: c.creditLimit })),
      cashDiscountPercent: cashDiscountPercent,
      bankInfo: bankInfo,
    };

    const blob = new Blob([JSON.stringify(batchData, null, 2)], {
      type: 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = syncBatch.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    triggerToast('Descarga Iniciada', `Archivo ${syncBatch.filename} guardado.`);
  };

  // Regenerate batch
  const handleGenerateNewBatch = () => {
    const now = new Date();
    const batchNum = `${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours()}${now.getMinutes()}`;
    setSyncBatch({
      ...syncBatch,
      batchId: `BATCH-${batchNum}`,
      filename: `distripro_sync_david_${batchNum}.dist`,
      generatedAt: `${now.getHours()}:${now.getMinutes()} hs`,
    });
    triggerToast('Lote Regenerado', `Nuevo archivo: distripro_sync_david_${batchNum}.dist`);
  };

  // Mark all synced
  const handleMarkAllSynced = () => {
    setOrders((prev) => prev.map((o) => ({ ...o, status: 'synced' })));
    setCollections((prev) => prev.map((c) => ({ ...c, status: 'synced' })));
    triggerToast('Sincronización Completa', 'Todos los registros han sido confirmados en Casa Central.');
  };

  // Record payment
  const handleRecordPayment = (
    client: Client,
    amount: number,
    method: PaymentMethod
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} hs`;
    const randNum = Math.floor(100 + Math.random() * 900);

    const newCol: PaymentCollection = {
      id: `col-${Date.now()}`,
      receiptNumber: `REC-0${randNum}`,
      clientId: client.id,
      clientName: client.name,
      amount: amount,
      paymentMethod: method,
      date: 'Hoy',
      time: timeStr,
      status: 'pending_sync',
    };

    setCollections([newCol, ...collections]);
    setClients((prev) =>
      prev.map((c) =>
        c.id === client.id
          ? { ...c, currentDebt: Math.max(0, c.currentDebt - amount) }
          : c
      )
    );

    triggerToast(
      'Cobranza Registrada',
      `Recibo ${newCol.receiptNumber} emitido por $${amount.toLocaleString('es-AR')}`
    );

    const text = encodeURIComponent(
      `*DISTRIPRO S.A. - Recibo de Cobranza*%0A%0A*Recibo Nº:* ${newCol.receiptNumber}%0A*Cliente:* ${client.name}%0A*Fecha:* ${newCol.date}, ${newCol.time}%0A*Monto Cobrado:* $${amount.toLocaleString('es-AR')}%0A*Medio:* ${method.toUpperCase()}%0A*Nuevo Saldo:* $${Math.max(0, client.currentDebt - amount).toLocaleString('es-AR')}%0A%0A_Cobrador: David C. (Zona 04 Centro)_`
    );
    window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  // Record visit reason
  const handleRecordVisitReason = (client: Client, reason: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === client.id ? { ...c, status: 'visited' } : c
      )
    );
    triggerToast('Motivo Registrado', `${client.name}: ${reason}`);
  };

  // Barcode scanned product
  const handleScanProduct = (product: Product) => {
    triggerToast('Producto Escaneado', `${product.name} (SKU: ${product.sku})`);
    setActiveTab('catalogo');
  };

  // Handle Catalog & Clients Updates from WhatsApp file (.dist)
  const handleUpdateCatalogFromWhatsApp = (data: {
    products: Product[];
    clients?: Client[];
    cashDiscountPercent?: number;
    bankInfo?: BankInfo;
    message: string;
    newClientsAddedCount?: number;
  }) => {
    if (data.products && data.products.length > 0) {
      setProducts(data.products);
    }
    if (data.clients && data.clients.length > 0) {
      setClients(data.clients);

      // Keep current active or logged client updated with new credit limit
      if (authSession?.client) {
        const found = data.clients.find(
          (c) => c.id === authSession.client?.id || c.code === authSession.client?.code
        );
        if (found) {
          setAuthSession({
            ...authSession,
            client: found,
          });
          setActiveClient(found);
        }
      } else if (activeClient) {
        const found = data.clients.find(
          (c) => c.id === activeClient.id || c.code === activeClient.code
        );
        if (found) {
          setActiveClient(found);
        }
      }
    }
    if (typeof data.cashDiscountPercent === 'number') {
      setCashDiscountPercent(data.cashDiscountPercent);
    }
    if (data.bankInfo) {
      setBankInfo(data.bankInfo);
    }

    triggerToast('¡Sincronización Exitosa!', data.message);
  };

  const userRole = authSession?.role || 'vendedor';
  const effectiveClient = authSession?.client || activeClient;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col antialiased selection:bg-blue-100">
      {/* Top Header */}
      <Header
        isOnline={isOnline}
        onToggleOnline={() => {
          setIsOnline(!isOnline);
          triggerToast(
            !isOnline ? 'Modo Online Activado' : 'Modo Offline Activado',
            !isOnline
              ? 'Conectado a Casa Central'
              : 'Operando en Modo Calle desconectado'
          );
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        authSession={authSession}
        onSwitchRole={() => setIsLoginModalOpen(true)}
        onOpenWhatsAppSync={() => setIsWhatsAppCatalogOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-xl mx-auto pt-18 pb-20 px-3 flex flex-col">
        {activeTab === 'pedidos' && (
          <PedidosView
            orders={orders}
            clients={clients}
            activeClient={effectiveClient}
            onOpenClientPicker={() => setIsClientPickerOpen(true)}
            onOpenNewSaleModal={() => setIsNewSaleOpen(true)}
            onViewTicket={(ord) => setTicketOrder(ord)}
            onRegisterFastDraftSale={handleRegisterFastDraftSale}
            onSyncWhatsApp={handleSyncWhatsApp}
            onFloatingExport={handleFloatingExport}
            syncBatch={syncBatch}
            pendingCount={pendingCount}
            userRole={userRole}
            onGoToCatalog={() => setActiveTab('catalogo')}
          />
        )}

        {activeTab === 'catalogo' && (
          <CatalogoView
            products={products}
            userRole={userRole}
            client={effectiveClient}
            cashDiscountPercent={cashDiscountPercent}
            onOpenWhatsAppSync={() => setIsWhatsAppCatalogOpen(true)}
            clientBasket={clientBasket}
            onUpdateClientBasket={(items) => setClientBasket(items)}
            onOpenClientOrder={() => setIsClientOrderOpen(true)}
            onClientSubmitOrder={() => setIsClientOrderOpen(true)}
            onAddProductToOrder={(product, qty) => {
              if (userRole === 'cliente') {
                const existingIdx = clientBasket.findIndex((it) => it.productId === product.id);
                if (existingIdx >= 0) {
                  const updated = [...clientBasket];
                  updated[existingIdx].quantity += qty;
                  updated[existingIdx].subtotal = updated[existingIdx].quantity * product.priceWholesale;
                  setClientBasket(updated);
                } else {
                  setClientBasket([
                    ...clientBasket,
                    {
                      productId: product.id,
                      name: product.name,
                      presentation: product.presentation,
                      quantity: qty,
                      unitPrice: product.priceWholesale,
                      subtotal: qty * product.priceWholesale,
                    },
                  ]);
                }
                triggerToast(
                  'Producto Agregado',
                  `${qty}x ${product.name} sumado a tu pedido.`
                );
              } else {
                triggerToast(
                  'Producto Agregado',
                  `${qty}x ${product.name} añadido a la canasta.`
                );
                setIsNewSaleOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'clientes' && userRole === 'vendedor' && (
          <ClientesView
            clients={clients}
            onSelectClientForSale={(client) => {
              setActiveClient(client);
              setActiveTab('pedidos');
              triggerToast('Cliente Seleccionado', `${client.code} ${client.name}`);
            }}
            onRecordVisitReason={handleRecordVisitReason}
          />
        )}

        {activeTab === 'saldos' && userRole === 'vendedor' && (
          <SaldosView
            clients={clients}
            collections={collections}
            onRecordPayment={handleRecordPayment}
            onViewReceipt={(col) => {
              triggerToast(
                `Recibo ${col.receiptNumber}`,
                `${col.clientName}: $${col.amount.toLocaleString('es-AR')}`
              );
            }}
          />
        )}

        {activeTab === 'sync' && (
          <SyncView
            isOnline={isOnline}
            onToggleOnline={() => setIsOnline(!isOnline)}
            syncBatch={syncBatch}
            pendingOrders={pendingOrders}
            onGenerateNewBatch={handleGenerateNewBatch}
            onSendBatchWhatsApp={handleSyncWhatsApp}
            onDownloadDistFile={handleDownloadDistFile}
            onMarkAllSynced={handleMarkAllSynced}
            userRole={userRole}
            client={effectiveClient}
            onOpenWhatsAppCatalogModal={() => setIsWhatsAppCatalogOpen(true)}
            onOpenManualTecnico={() => setIsManualTecnicoOpen(true)}
            productsCount={products.length}
          />
        )}
      </main>

      {/* Sticky Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
        pendingCount={pendingCount}
        userRole={userRole}
        clientBasketCount={clientBasket.reduce((sum, it) => sum + it.quantity, 0)}
      />

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          if (authSession) {
            setIsLoginModalOpen(false);
          }
        }}
        clients={clients}
        currentSession={authSession}
        onLogin={handleLogin}
        onOpenWhatsAppCatalog={() => setIsWhatsAppCatalogOpen(true)}
      />

      <WhatsAppCatalogModal
        isOpen={isWhatsAppCatalogOpen}
        onClose={() => setIsWhatsAppCatalogOpen(false)}
        currentProducts={products}
        currentClients={clients}
        cashDiscountPercent={cashDiscountPercent}
        bankInfo={bankInfo}
        onUpdateCatalog={handleUpdateCatalogFromWhatsApp}
        userRole={userRole}
        client={effectiveClient}
      />

      <ClientOrderModal
        isOpen={isClientOrderOpen}
        onClose={() => setIsClientOrderOpen(false)}
        client={effectiveClient}
        basket={clientBasket}
        cashDiscountPercent={cashDiscountPercent}
        bankInfo={bankInfo}
        onUpdateBasket={(items) => setClientBasket(items)}
        onConfirmOrder={handleConfirmClientOrder}
      />

      <TicketModal
        order={ticketOrder}
        onClose={() => setTicketOrder(null)}
        onSendWhatsApp={handleSendTicketWhatsApp}
      />

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        products={products}
        onScanProduct={handleScanProduct}
      />

      <ClientPickerModal
        isOpen={isClientPickerOpen}
        onClose={() => setIsClientPickerOpen(false)}
        clients={clients}
        activeClientId={effectiveClient.id}
        onSelectClient={(cli) => {
          setActiveClient(cli);
          triggerToast('Cliente Cambiado', `${cli.code} ${cli.name}`);
        }}
      />

      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        clients={clients}
        products={products}
        initialClient={effectiveClient}
        onCompleteSale={handleCompleteSale}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        pendingCount={pendingCount}
        authSession={authSession}
        onSwitchRole={() => setIsLoginModalOpen(true)}
        onOpenManualTecnico={() => setIsManualTecnicoOpen(true)}
      />

      <ManualTecnicoModal
        isOpen={isManualTecnicoOpen}
        onClose={() => setIsManualTecnicoOpen(false)}
      />

      {/* Floating Action Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-sm mx-auto animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="bg-[#00236f] text-white p-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#82f5c1]/30">
            <LocalIcon name="verified" className="w-6 h-6 text-[#82f5c1] shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px]">
                {toast.title}
              </span>
              <span className="text-[12px] text-[#dce1ff] truncate">
                {toast.message}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
