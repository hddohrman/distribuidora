/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
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
  SupplierPurchase,
  OperatingExpense,
  Supplier,
  CompanySettings,
} from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CLIENTS,
  INITIAL_ORDERS,
  INITIAL_SYNC_BATCH,
  INITIAL_CATEGORIES,
  INITIAL_ZONES,
  INITIAL_PURCHASES,
  INITIAL_EXPENSES,
  INITIAL_SUPPLIERS,
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
import { WebAdminView } from './components/WebAdminView';
import { OpcionesView } from './components/OpcionesView';
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
    bankName: 'Banco Macro Salta',
    accountHolder: 'DistriPro Salta S.A. Mayorista',
    cuit: '30-71234567-8',
  });

  const defaultCompanySettings: CompanySettings = {
    companyName: 'DistriPro Salta S.A. Mayorista',
    cuit: '30-71234567-8',
    headquartersWhatsApp: '+54 9 387 512-3456',
    phoneSecondary: '+54 9 387 421-9988',
    address: 'Av. San Martín 2340, Parque Industrial',
    city: 'Salta Capital, Salta',
    email: 'pedidos@distriprosalta.com.ar',
    businessHours: 'Lunes a Sábado de 07:30 a 17:00 hs',
    ticketFooterNotes: '¡Gracias por su compra! Reclamos de mercadería dentro de las 48hs de recibido.',
    cashDiscountPercent: 10,
    bankInfo: {
      alias: 'DISTRI.PRO.PAGOS',
      cbu: '0000003100012345678901',
      bankName: 'Banco Macro Salta',
      accountHolder: 'DistriPro Salta S.A. Mayorista',
      cuit: '30-71234567-8',
    },
  };

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('distripro_company_settings');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...defaultCompanySettings,
            ...parsed,
            headquartersWhatsApp: parsed.headquartersWhatsApp || defaultCompanySettings.headquartersWhatsApp,
            bankInfo: parsed.bankInfo || defaultCompanySettings.bankInfo,
          };
        }
      } catch (e) {}
    }
    return defaultCompanySettings;
  });

  useEffect(() => {
    if (companySettings) {
      localStorage.setItem('distripro_company_settings', JSON.stringify(companySettings));
      if (companySettings.cashDiscountPercent !== undefined && companySettings.cashDiscountPercent !== cashDiscountPercent) {
        setCashDiscountPercent(companySettings.cashDiscountPercent);
      }
      if (companySettings.bankInfo) {
        setBankInfo(companySettings.bankInfo);
      }
    }
  }, [companySettings]);

  // Rubros y Zonas de Reparto
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [zones, setZones] = useState<string[]>(INITIAL_ZONES);

  // Purchases and Operating Expenses
  const [purchases, setPurchases] = useState<SupplierPurchase[]>(() => {
    const saved = localStorage.getItem('distripro_purchases');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_PURCHASES;
  });

  const [expenses, setExpenses] = useState<OperatingExpense[]>(() => {
    const saved = localStorage.getItem('distripro_expenses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_EXPENSES;
  });

  // Suppliers Directory & Contacts
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('distripro_suppliers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_SUPPLIERS;
  });

  useEffect(() => {
    localStorage.setItem('distripro_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('distripro_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('distripro_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

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

    if (session.role === 'admin') {
      setActiveTab('admin');
      triggerToast(
        'Casa Central Activada',
        'Bienvenido al panel web de administración y rentabilidad.'
      );
    } else if (session.role === 'cliente' && session.client) {
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

  const handleOpenWebAdmin = () => {
    setAuthSession({
      role: 'admin',
      adminName: 'Administración Central',
    });
    setActiveTab('admin');
    triggerToast('Casa Central Activada', 'Panel de administración web.');
  };

  const handleOpenMobileApp = () => {
    setAuthSession({
      role: 'vendedor',
      vendorName: 'David C.',
      vendorId: 'PREV-402',
    });
    setActiveTab('pedidos');
    triggerToast('App Móvil de Calle', 'Vista de preventista activada.');
  };

  // Handle batch import into central database
  const handleImportBatchIntoCentral = (payload: any) => {
    let ordersAdded = 0;
    let collectionsAdded = 0;

    if (payload.orders && Array.isArray(payload.orders)) {
      setOrders((prev) => {
        const existingIds = new Set(prev.map((o) => o.id));
        const newOrders = payload.orders.filter((o: Order) => !existingIds.has(o.id));
        ordersAdded = newOrders.length;
        return [...newOrders, ...prev];
      });
    }

    if (payload.collections && Array.isArray(payload.collections)) {
      setCollections((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newCols = payload.collections.filter((c: PaymentCollection) => !existingIds.has(c.id));
        collectionsAdded = newCols.length;
        return [...newCols, ...prev];
      });
    }

    if (payload.clients && Array.isArray(payload.clients)) {
      setClients(payload.clients);
    }
    if (payload.products && Array.isArray(payload.products)) {
      setProducts(payload.products);
    }

    triggerToast(
      'Lote Consolidado en Central',
      `Se incorporaron ${ordersAdded} pedidos y ${collectionsAdded} cobranzas al sistema.`
    );
  };

  // Pending count calculation
  const pendingOrders = orders.filter((o) => o.status === 'pending_sync');
  const pendingCollections = collections.filter((c) => c.status === 'pending_sync');
  const pendingCount = pendingOrders.length + pendingCollections.length + 3;

  // Helper to deduct stock, including individual components when selling a combo pack
  const deductStockForOrderItems = (orderItems: BasketItem[], saleType: 'in_situ' | 'preventa' | 'remito') => {
    setProducts((prev) => {
      const updated = prev.map((p) => ({ ...p }));
      orderItems.forEach((item) => {
        const prod = updated.find((p) => p.id === item.productId);
        if (prod) {
          const isVan = saleType === 'in_situ';
          // Check if this product is a combo with constituent items
          if (prod.isCombo && prod.comboItems && prod.comboItems.length > 0) {
            // Deduct stock from constituent items
            prod.comboItems.forEach((cItem) => {
              const subProd = updated.find((p) => p.id === cItem.productId);
              if (subProd) {
                const totalDeduction = cItem.quantity * item.quantity;
                if (isVan) {
                  subProd.stockVan = Math.max(0, subProd.stockVan - totalDeduction);
                } else {
                  subProd.stockCentral = Math.max(0, subProd.stockCentral - totalDeduction);
                }
              }
            });
          }
          // Also deduct the main product item stock
          if (isVan) {
            prod.stockVan = Math.max(0, prod.stockVan - item.quantity);
          } else {
            prod.stockCentral = Math.max(0, prod.stockCentral - item.quantity);
          }
        }
      });
      return updated;
    });
  };

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
    deductStockForOrderItems(items, 'in_situ');

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
    deductStockForOrderItems(order.items, order.type);
    triggerToast('¡Pedido Creado!', `${order.clientName} - ${order.orderNumber}`);
    setTimeout(() => {
      setTicketOrder(order);
    }, 300);
  };

  // Handle Client Confirm Order
  const handleConfirmClientOrder = (order: Order, sendWhatsApp: boolean) => {
    setOrders([order, ...orders]);
    deductStockForOrderItems(order.items, order.type);
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
    const enterpriseName = companySettings.companyName || 'Distribuidora Mayorista';
    const title = isClientRole
      ? `*${enterpriseName.toUpperCase()} - NUEVO PEDIDO DE COMERCIO*`
      : `*${enterpriseName.toUpperCase()} - Comprobante de Entrega Preventa*`;

    let paymentDetailText = '';
    if (order.paymentMethod === 'efectivo') {
      paymentDetailText = `*Forma de Pago:* EFECTIVO CONTADO%0A*Subtotal Lista:* $${(order.subtotalOriginal || order.total).toLocaleString('es-AR')}%0A*Descuento Comercial:* -${order.discountPercent || cashDiscountPercent}% (-$${(order.discountAmount || 0).toLocaleString('es-AR')})%0A*TOTAL A PAGAR EN MANO:* $${order.total.toLocaleString('es-AR')}`;
    } else if (order.paymentMethod === 'qr' || order.paymentMethod === 'transferencia') {
      paymentDetailText = `*Forma de Pago:* TRANSFERENCIA / QR%0A*TOTAL TRANSFERIDO:* $${order.total.toLocaleString('es-AR')}%0A*Alias Receptor:* ${companySettings.bankInfo?.alias || bankInfo.alias}%0A*CBU:* ${companySettings.bankInfo?.cbu || bankInfo.cbu}%0A*Titular:* ${companySettings.bankInfo?.accountHolder || bankInfo.accountHolder}%0A*Ref. Comprobante:* ${order.transferProof || 'Se adjunta en este mensaje'}`;
    } else {
      paymentDetailText = `*Forma de Pago:* CUENTA CORRIENTE (A Plazo)%0A*TOTAL CARGADO A CUENTA:* $${order.total.toLocaleString('es-AR')}${order.creditRemaining !== undefined ? `%0A*Margen de Crédito Restante:* $${order.creditRemaining.toLocaleString('es-AR')}` : ''}`;
    }

    const message = `${title}%0A%0A*Pedido:* ${order.orderNumber}%0A*Comercio:* ${order.clientName} (${order.clientCode})%0A*Fecha:* ${order.date}, ${order.time}%0A%0A*Detalle de Mercadería:*%0A${itemsText}%0A%0A${paymentDetailText}%0A%0A*Observaciones / Entrega:* ${order.notes || 'Ninguna'}%0A%0A_Generado mediante sistema DistriPro_`;

    // WhatsApp recipient resolution:
    // If client is placing an order, send to company's configured headquarters WhatsApp
    // If vendor is sharing ticket, prioritize client phone or fallback to company WhatsApp
    const headquartersPhoneClean = (companySettings?.headquartersWhatsApp || '+54 9 387 512-3456').replace(/[^0-9]/g, '');
    const clientObj = clients.find((c) => c.id === order.clientId) || activeClient;
    const clientPhoneClean = clientObj ? clientObj.phone.replace(/[^0-9]/g, '') : '';
    const phone = isClientRole ? headquartersPhoneClean : (clientPhoneClean || headquartersPhoneClean);

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

  const handleRenameCategory = (oldName: string, newName: string) => {
    setCategories((prev) => prev.map((c) => (c === oldName ? newName : c)));
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: newName } : p))
    );
  };

  const handleDeleteCategory = (catToDelete: string) => {
    setCategories((prev) => prev.filter((c) => c !== catToDelete));
    setProducts((prev) =>
      prev.map((p) => (p.category === catToDelete ? { ...p, category: 'Almacén' } : p))
    );
  };

  const handleRenameZone = (oldZone: string, newZone: string) => {
    setZones((prev) => prev.map((z) => (z === oldZone ? newZone : z)));
    setClients((prev) =>
      prev.map((c) => (c.zone === oldZone ? { ...c, zone: newZone } : c))
    );
  };

  const handleDeleteZone = (zoneToDelete: string) => {
    setZones((prev) => prev.filter((z) => z !== zoneToDelete));
    setClients((prev) =>
      prev.map((c) => (c.zone === zoneToDelete ? { ...c, zone: 'Zona 04 Centro' } : c))
    );
  };

  const handleProcessIncomingOrderFromWhatsApp = (order: Order) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.id === order.id || o.orderNumber === order.orderNumber);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...order, status: 'synced' };
        return copy;
      }
      return [{ ...order, status: 'synced' }, ...prev];
    });

    setProducts((prev) =>
      prev.map((p) => {
        const item = order.items.find((it) => it.productId === p.id);
        if (item) {
          return {
            ...p,
            stockCentral: Math.max(0, p.stockCentral - item.quantity),
          };
        }
        return p;
      })
    );

    if (order.paymentMethod === 'cta_cte') {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === order.clientId || c.code === order.clientCode) {
            return {
              ...c,
              currentDebt: c.currentDebt + order.total,
            };
          }
          return c;
        })
      );
    }

    triggerToast(
      'Pedido Ingresado a Central',
      `Pedido ${order.orderNumber} de ${order.clientName} registrado. Stock actualizado.`
    );
  };

  const userRole = authSession?.role || 'vendedor';
  const effectiveClient = authSession?.client || activeClient;

  // Render Casa Central Web Admin Suite if user is admin
  if (userRole === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100">
        <WebAdminView
          products={products}
          clients={clients}
          orders={orders}
          collections={collections}
          purchases={purchases}
          expenses={expenses}
          suppliers={suppliers}
          companySettings={companySettings}
          onUpdateCompanySettings={(settings) => {
            setCompanySettings(settings);
            setCashDiscountPercent(settings.cashDiscountPercent);
            setBankInfo(settings.bankInfo);
            localStorage.setItem('distripro_company_settings', JSON.stringify(settings));
          }}
          cashDiscountPercent={cashDiscountPercent}
          bankInfo={bankInfo}
          categories={categories}
          zones={zones}
          onUpdateProducts={(prods) => setProducts(prods)}
          onUpdateClients={(clis) => setClients(clis)}
          onUpdatePurchases={(p) => setPurchases(p)}
          onUpdateExpenses={(e) => setExpenses(e)}
          onUpdateSuppliers={(s) => setSuppliers(s)}
          onUpdateCategories={(cats) => setCategories(cats)}
          onUpdateZones={(zns) => setZones(zns)}
          onRenameCategory={handleRenameCategory}
          onDeleteCategory={handleDeleteCategory}
          onRenameZone={handleRenameZone}
          onDeleteZone={handleDeleteZone}
          onUpdateCashDiscount={(pct) => setCashDiscountPercent(pct)}
          onUpdateBankInfo={(b) => setBankInfo(b)}
          onImportSyncBatch={handleImportBatchIntoCentral}
          onProcessIncomingOrderJson={handleProcessIncomingOrderFromWhatsApp}
          onOpenMobileApp={handleOpenMobileApp}
          onTriggerToast={triggerToast}
          onViewTicket={(ord) => setTicketOrder(ord)}
        />

        {/* Floating Action Toast Notification */}
        {toast && (
          <div className="fixed top-6 right-6 z-50 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
            <div className="bg-[#00236f] text-white p-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-[#82f5c1]/30">
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

        {/* Global Login modal if opened */}
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
      </div>
    );
  }

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
        onOpenWebAdmin={handleOpenWebAdmin}
        onOpenOpciones={() => setActiveTab('opciones')}
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
              const effectivePrice = product.isOffer && product.offerPrice ? product.offerPrice : product.priceWholesale;
              if (userRole === 'cliente') {
                const existingIdx = clientBasket.findIndex((it) => it.productId === product.id);
                if (existingIdx >= 0) {
                  const updated = [...clientBasket];
                  updated[existingIdx].quantity += qty;
                  updated[existingIdx].subtotal = updated[existingIdx].quantity * effectivePrice;
                  setClientBasket(updated);
                } else {
                  setClientBasket([
                    ...clientBasket,
                    {
                      productId: product.id,
                      name: product.name,
                      presentation: product.presentation,
                      quantity: qty,
                      unitPrice: effectivePrice,
                      subtotal: qty * effectivePrice,
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

        {activeTab === 'opciones' && (
          <OpcionesView
            settings={companySettings}
            onSaveSettings={(newSettings) => {
              setCompanySettings(newSettings);
              setCashDiscountPercent(newSettings.cashDiscountPercent);
              setBankInfo(newSettings.bankInfo);
              localStorage.setItem('distripro_company_settings', JSON.stringify(newSettings));
              triggerToast(
                'Opciones Guardadas',
                `Datos y logo de ${newSettings.companyName} actualizados correctamente.`
              );
            }}
            onBack={() => setActiveTab(userRole === 'cliente' ? 'catalogo' : 'pedidos')}
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
        companySettings={companySettings}
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
        onOpenWebAdmin={handleOpenWebAdmin}
        onOpenOpciones={() => {
          setIsProfileOpen(false);
          setActiveTab('opciones');
        }}
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
