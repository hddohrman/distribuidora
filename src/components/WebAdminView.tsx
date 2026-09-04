import React, { useState, useMemo, useRef } from 'react';
import {
  Product,
  Client,
  Order,
  PaymentCollection,
  BankInfo,
  WebAdminTab,
  CatalogSyncPayload,
  SupplierPurchase,
  OperatingExpense,
  Supplier,
  ComboItem,
  CompanySettings,
} from '../types';
import { INITIAL_SUPPLIERS } from '../data/mockData';
import { LocalIcon } from './LocalIcon';
import { RecepcionPedidosTab } from './RecepcionPedidosTab';
import { RubrosZonasTab } from './RubrosZonasTab';
import { DifusionWhatsAppTab } from './DifusionWhatsAppTab';
import { ComprasProveedoresTab } from './ComprasProveedoresTab';
import { GastosCostosTab } from './GastosCostosTab';
import { ConfigOpcionesTab } from './ConfigOpcionesTab';
import { OpcionesView } from './OpcionesView';
import {
  ShoppingCart,
  Receipt,
  AlertTriangle,
  TrendingDown,
  Scale,
  DollarSign,
  TrendingUp,
  Percent,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Package,
  Layers,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';

interface WebAdminViewProps {
  products: Product[];
  clients: Client[];
  orders: Order[];
  collections: PaymentCollection[];
  purchases?: SupplierPurchase[];
  expenses?: OperatingExpense[];
  suppliers?: Supplier[];
  companySettings?: CompanySettings;
  onUpdateCompanySettings?: (newSettings: CompanySettings) => void;
  cashDiscountPercent: number;
  bankInfo: BankInfo;
  categories?: string[];
  zones?: string[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateClients: (clients: Client[]) => void;
  onUpdatePurchases?: (purchases: SupplierPurchase[]) => void;
  onUpdateExpenses?: (expenses: OperatingExpense[]) => void;
  onUpdateSuppliers?: (suppliers: Supplier[]) => void;
  onUpdateCategories?: (categories: string[]) => void;
  onUpdateZones?: (zones: string[]) => void;
  onRenameCategory?: (oldName: string, newName: string) => void;
  onDeleteCategory?: (catToDelete: string) => void;
  onRenameZone?: (oldZone: string, newZone: string) => void;
  onDeleteZone?: (zoneToDelete: string) => void;
  onUpdateCashDiscount: (percent: number) => void;
  onUpdateBankInfo: (bank: BankInfo) => void;
  onImportSyncBatch: (payload: CatalogSyncPayload) => void;
  onProcessIncomingOrderJson?: (order: Order) => void;
  onOpenMobileApp: () => void;
  onTriggerToast: (title: string, message: string) => void;
  onViewTicket?: (order: Order) => void;
}

export const WebAdminView: React.FC<WebAdminViewProps> = ({
  products,
  clients,
  orders,
  collections,
  purchases = [],
  expenses = [],
  suppliers = [],
  companySettings,
  onUpdateCompanySettings,
  cashDiscountPercent,
  bankInfo,
  categories = ['Almacén', 'Bebidas', 'Limpieza', 'Perfumería', 'Pañales', 'Golosinas'],
  zones = ['Zona 04 Centro', 'Zona 05 Norte', 'Zona 06 Sur', 'Zona 07 Oeste', 'Zona Mayorista'],
  onUpdateProducts,
  onUpdateClients,
  onUpdatePurchases,
  onUpdateExpenses,
  onUpdateSuppliers,
  onUpdateCategories,
  onUpdateZones,
  onRenameCategory,
  onDeleteCategory,
  onRenameZone,
  onDeleteZone,
  onUpdateCashDiscount,
  onUpdateBankInfo,
  onImportSyncBatch,
  onProcessIncomingOrderJson,
  onOpenMobileApp,
  onTriggerToast,
  onViewTicket,
}) => {
  const [activeTab, setActiveTab] = useState<WebAdminTab>('dashboard');

  // Effective company settings fallback
  const defaultCompanySettings: CompanySettings = useMemo(() => ({
    companyName: 'DistriPro Salta S.A. Mayorista',
    cuit: '30-71234567-8',
    headquartersWhatsApp: '+54 9 387 512-3456',
    phoneSecondary: '+54 9 387 421-9988',
    address: 'Av. San Martín 2340, Parque Industrial',
    city: 'Salta Capital, Salta',
    email: 'pedidos@distriprosalta.com.ar',
    businessHours: 'Lunes a Sábado de 07:30 a 17:00 hs',
    ticketFooterNotes: '¡Gracias por su compra! Reclamos de mercadería dentro de las 48hs de recibido.',
    cashDiscountPercent: cashDiscountPercent || 10,
    bankInfo: bankInfo || {
      alias: 'DISTRI.PRO.PAGOS',
      cbu: '0000003100012345678901',
      bankName: 'Banco Macro Salta',
      accountHolder: 'DistriPro Salta S.A. Mayorista',
      cuit: '30-71234567-8',
    },
  }), [cashDiscountPercent, bankInfo]);

  const [internalCompanySettings, setInternalCompanySettings] = useState<CompanySettings>(
    companySettings || defaultCompanySettings
  );

  const effectiveCompanySettings = companySettings || internalCompanySettings;

  const handleUpdateCompanySettings = (newSettings: CompanySettings) => {
    setInternalCompanySettings(newSettings);
    if (onUpdateCompanySettings) {
      onUpdateCompanySettings(newSettings);
    }
    if (newSettings.cashDiscountPercent !== cashDiscountPercent) {
      onUpdateCashDiscount(newSettings.cashDiscountPercent);
    }
    if (newSettings.bankInfo) {
      onUpdateBankInfo(newSettings.bankInfo);
    }
  };

  // Internal fallbacks for purchases, expenses and suppliers
  const [internalPurchases, setInternalPurchases] = useState<SupplierPurchase[]>(purchases);
  const [internalExpenses, setInternalExpenses] = useState<OperatingExpense[]>(expenses);
  const [internalSuppliers, setInternalSuppliers] = useState<Supplier[]>(
    suppliers.length > 0 ? suppliers : INITIAL_SUPPLIERS
  );

  const effectivePurchases = purchases.length > 0 ? purchases : internalPurchases;
  const effectiveExpenses = expenses.length > 0 ? expenses : internalExpenses;
  const effectiveSuppliers = suppliers.length > 0 ? suppliers : internalSuppliers;

  const handleUpdatePurchases = (newPurchases: SupplierPurchase[]) => {
    setInternalPurchases(newPurchases);
    if (onUpdatePurchases) {
      onUpdatePurchases(newPurchases);
    }
  };

  const handleUpdateExpenses = (newExpenses: OperatingExpense[]) => {
    setInternalExpenses(newExpenses);
    if (onUpdateExpenses) {
      onUpdateExpenses(newExpenses);
    }
  };

  const handleUpdateSuppliers = (newSuppliers: Supplier[]) => {
    setInternalSuppliers(newSuppliers);
    if (onUpdateSuppliers) {
      onUpdateSuppliers(newSuppliers);
    }
  };

  // Filters for Products
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  // Product Modal State (New / Edit)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [formMarginPercent, setFormMarginPercent] = useState<number>(30);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  // Combo builder state for the product modal
  const [comboAddProductId, setComboAddProductId] = useState<string>('');
  const [comboAddQuantity, setComboAddQuantity] = useState<number>(1);

  const [productForm, setProductForm] = useState<{
    id?: string;
    sku: string;
    name: string;
    brand: string;
    presentation: string;
    category: Product['category'];
    priceWholesale: number;
    costPrice: number;
    unitType: Product['unitType'];
    unitsPerPack: number;
    stockTruck: number;
    stockCentral: number;
    barcode: string;
    codePrefix: string;
    imageUrl?: string;
    isOffer?: boolean;
    offerBadge?: string;
    offerPrice?: number;
    offerDescription?: string;
    supplierId?: string;
    supplierName?: string;
    supplierPhone?: string;
    isCombo?: boolean;
    comboItems?: ComboItem[];
  }>({
    sku: '',
    name: '',
    brand: '',
    presentation: '',
    category: 'Almacén',
    priceWholesale: 0,
    costPrice: 0,
    unitType: 'cajas',
    unitsPerPack: 12,
    stockTruck: 10,
    stockCentral: 100,
    barcode: '',
    codePrefix: '2c',
    imageUrl: undefined,
    isOffer: false,
    offerBadge: '',
    offerPrice: 0,
    offerDescription: '',
    supplierId: '',
    supplierName: '',
    supplierPhone: '',
    isCombo: false,
    comboItems: [],
  });

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setProductForm((prev) => ({ ...prev, imageUrl: compressed }));
          onTriggerToast('Foto Cargada', 'La imagen se optimizó y asoció al producto.');
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Price adjustment modal
  const [isPriceAdjustModalOpen, setIsPriceAdjustModalOpen] = useState(false);
  const [priceAdjustCategory, setPriceAdjustCategory] = useState<string>('all');
  const [priceAdjustPercent, setPriceAdjustPercent] = useState<number>(5);

  // Filters for Clients
  const [clientSearch, setClientSearch] = useState('');
  const [clientZoneFilter, setClientZoneFilter] = useState<string>('all');

  // Sorting for Clients Table (Permite ordenar columnas de mayor a menor al hacer click)
  const [clientSortKey, setClientSortKey] = useState<
    'code' | 'name' | 'address' | 'phone' | 'currentDebt' | 'creditLimit' | 'totalOrdersCount'
  >('currentDebt');
  const [clientSortDirection, setClientSortDirection] = useState<'desc' | 'asc'>('desc');

  const handleSortClients = (
    key: 'code' | 'name' | 'address' | 'phone' | 'currentDebt' | 'creditLimit' | 'totalOrdersCount'
  ) => {
    if (clientSortKey === key) {
      setClientSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setClientSortKey(key);
      setClientSortDirection('desc'); // Por defecto de mayor a menor al hacer click
    }
  };

  // Client Modal State (New / Edit)
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState<{
    id?: string;
    code: string;
    name: string;
    businessName: string;
    address: string;
    zone: string;
    phone: string;
    currentDebt: number;
    creditLimit: number;
    canAccessApp?: boolean;
  }>({
    code: '',
    name: '',
    businessName: '',
    address: '',
    zone: 'Zona 04 Centro',
    phone: '+54 9 387 ',
    currentDebt: 0,
    creditLimit: 150000,
    canAccessApp: true,
  });

  // WhatsApp Broadcast State
  const [broadcastZone, setBroadcastZone] = useState<string>('all');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(
    clients.map((c) => c.id)
  );
  const [catalogType, setCatalogType] = useState<
    'completo' | 'ofertas' | 'compacto' | 'link_web'
  >('completo');
  const [includeCashDiscount, setIncludeCashDiscount] = useState(true);
  const [includeBankData, setIncludeBankData] = useState(true);
  const [sentClientIds, setSentClientIds] = useState<string[]>([]);

  // Sync Import text state
  const [importJsonText, setImportJsonText] = useState('');

  // -------------------------------------------------------------
  // CALCULATIONS: Profitability, Sales & Margins
  // -------------------------------------------------------------
  const metrics = useMemo(() => {
    // 1. Total Sales from Orders
    let totalSales = 0;
    let totalCostOfGoods = 0;
    let totalBultosSold = 0;

    orders.forEach((ord) => {
      totalSales += ord.total;
      ord.items.forEach((item) => {
        totalBultosSold += item.quantity;
        const prod = products.find((p) => p.id === item.productId);
        const cost = prod?.costPrice || item.unitPrice * 0.72; // default 28% margin if not specified
        totalCostOfGoods += cost * item.quantity;
      });
    });

    const grossProfit = totalSales - totalCostOfGoods;
    const profitMarginPercent = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    // 2. Collections
    const totalCollections = collections.reduce((acc, col) => acc + col.amount, 0);

    // 3. Client Debt (Money in the street)
    const totalDebt = clients.reduce((acc, cli) => acc + cli.currentDebt, 0);

    // 4. Category breakdown
    const categoryStats: Record<
      string,
      { sales: number; cost: number; profit: number; marginPercent: number; units: number }
    > = {};

    products.forEach((p) => {
      if (!categoryStats[p.category]) {
        categoryStats[p.category] = { sales: 0, cost: 0, profit: 0, marginPercent: 0, units: 0 };
      }
    });

    orders.forEach((ord) => {
      ord.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const cat = prod?.category || 'Almacén';
        if (!categoryStats[cat]) {
          categoryStats[cat] = { sales: 0, cost: 0, profit: 0, marginPercent: 0, units: 0 };
        }
        const cost = (prod?.costPrice || item.unitPrice * 0.72) * item.quantity;
        categoryStats[cat].sales += item.subtotal;
        categoryStats[cat].cost += cost;
        categoryStats[cat].profit += item.subtotal - cost;
        categoryStats[cat].units += item.quantity;
      });
    });

    Object.keys(categoryStats).forEach((cat) => {
      const c = categoryStats[cat];
      c.marginPercent = c.sales > 0 ? (c.profit / c.sales) * 100 : 0;
    });

    // 5. Top Products Profitability
    const productSalesMap: Record<
      string,
      { product: Product; quantity: number; totalSales: number; totalCost: number; profit: number; margin: number }
    > = {};

    orders.forEach((ord) => {
      ord.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod) return;
        if (!productSalesMap[prod.id]) {
          productSalesMap[prod.id] = {
            product: prod,
            quantity: 0,
            totalSales: 0,
            totalCost: 0,
            profit: 0,
            margin: 0,
          };
        }
        const cost = (prod.costPrice || prod.priceWholesale * 0.72) * item.quantity;
        productSalesMap[prod.id].quantity += item.quantity;
        productSalesMap[prod.id].totalSales += item.subtotal;
        productSalesMap[prod.id].totalCost += cost;
        productSalesMap[prod.id].profit += item.subtotal - cost;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .map((item) => ({
        ...item,
        margin: item.totalSales > 0 ? (item.profit / item.totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit);

    // 6. Operating Expenses & Fixed Costs Breakdown
    const totalExpenses = effectiveExpenses.reduce((acc, exp) => acc + exp.amount, 0);
    const fixedCosts = effectiveExpenses.filter((e) => e.type === 'fijo').reduce((acc, exp) => acc + exp.amount, 0);
    const variableCosts = effectiveExpenses.filter((e) => e.type === 'variable').reduce((acc, exp) => acc + exp.amount, 0);
    const pendingExpenses = effectiveExpenses.filter((e) => e.status === 'pendiente').reduce((acc, exp) => acc + exp.amount, 0);

    // Net Operating Profit = Gross Profit - Total Operating Expenses
    const netOperatingProfit = grossProfit - totalExpenses;
    const netProfitMarginPercent = totalSales > 0 ? (netOperatingProfit / totalSales) * 100 : 0;

    // Break-even Sales Point ($) = Fixed Costs / (Gross Profit Margin % / 100)
    const breakEvenSales = profitMarginPercent > 0 ? Math.round(fixedCosts / (profitMarginPercent / 100)) : 0;

    // Purchases summary
    const totalPurchasesAmount = effectivePurchases.reduce((acc, p) => {
      const amount = typeof p.total === 'number' ? p.total : 0;
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
    const totalPurchasesUnits = effectivePurchases.reduce((acc, p) => {
      if (Array.isArray(p.items)) {
        return acc + p.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      }
      return acc;
    }, 0);
    const costVariationAlertsCount = effectivePurchases.reduce(
      (acc, p) => acc + (p.costVariationsDetectedCount || 0),
      0
    );

    return {
      totalSales,
      totalCostOfGoods,
      grossProfit,
      profitMarginPercent,
      totalBultosSold,
      totalCollections,
      totalDebt,
      categoryStats,
      topProducts,
      totalExpenses,
      fixedCosts,
      variableCosts,
      pendingExpenses,
      netOperatingProfit,
      netProfitMarginPercent,
      breakEvenSales,
      totalPurchasesAmount,
      totalPurchasesUnits,
      costVariationAlertsCount,
    };
  }, [orders, products, clients, collections, effectivePurchases, effectiveExpenses]);

  // -------------------------------------------------------------
  // HANDLERS: Product Management & Bidirectional Margin Calculator
  // -------------------------------------------------------------
  const handleProductCostChange = (newCost: number) => {
    const margin = formMarginPercent || 30;
    const newPrice = newCost > 0 ? Math.round(newCost * (1 + margin / 100)) : productForm.priceWholesale;
    setProductForm((prev) => ({
      ...prev,
      costPrice: newCost,
      priceWholesale: newPrice,
    }));
  };

  const handleProductPriceChange = (newPrice: number) => {
    if (productForm.costPrice > 0) {
      const calculatedMargin = Number((((newPrice - productForm.costPrice) / productForm.costPrice) * 100).toFixed(1));
      setFormMarginPercent(calculatedMargin);
    }
    setProductForm((prev) => ({
      ...prev,
      priceWholesale: newPrice,
    }));
  };

  const handleProductMarginChange = (newMargin: number) => {
    setFormMarginPercent(newMargin);
    if (productForm.costPrice > 0) {
      const newPrice = Math.round(productForm.costPrice * (1 + newMargin / 100));
      setProductForm((prev) => ({
        ...prev,
        priceWholesale: newPrice,
      }));
    }
  };

  const handleOpenNewProductModal = () => {
    setEditingProduct(null);
    setFormMarginPercent(30);
    setComboAddProductId('');
    setComboAddQuantity(1);
    setProductForm({
      sku: `PROD-${products.length + 1}`,
      name: '',
      brand: '',
      presentation: 'cajas x 12u',
      category: categories[0] || 'Almacén',
      priceWholesale: 10000,
      costPrice: 7000,
      unitType: 'cajas',
      unitsPerPack: 12,
      stockTruck: 10,
      stockCentral: 100,
      barcode: `779123456${80 + products.length}`,
      codePrefix: '2c',
      imageUrl: undefined,
      isOffer: false,
      offerBadge: '',
      offerPrice: 0,
      offerDescription: '',
      supplierId: effectiveSuppliers[0]?.id || '',
      supplierName: effectiveSuppliers[0]?.name || '',
      supplierPhone: effectiveSuppliers[0]?.phone || '',
      isCombo: false,
      comboItems: [],
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setComboAddProductId('');
    setComboAddQuantity(1);
    const initialCost = prod.costPrice || Math.round(prod.priceWholesale * 0.72);
    const initialMargin =
      initialCost > 0
        ? Number((((prod.priceWholesale - initialCost) / initialCost) * 100).toFixed(1))
        : 30;
    setFormMarginPercent(initialMargin);

    setProductForm({
      id: prod.id,
      sku: prod.sku,
      name: prod.name,
      brand: prod.brand,
      presentation: prod.presentation,
      category: prod.category,
      priceWholesale: prod.priceWholesale,
      costPrice: initialCost,
      unitType: prod.unitType,
      unitsPerPack: prod.unitsPerPack,
      stockTruck: prod.stockTruck,
      stockCentral: prod.stockCentral,
      barcode: prod.barcode,
      codePrefix: prod.codePrefix,
      imageUrl: prod.imageUrl,
      isOffer: prod.isOffer ?? false,
      offerBadge: prod.offerBadge ?? '',
      offerPrice: prod.offerPrice ?? 0,
      offerDescription: prod.offerDescription ?? '',
      supplierId: prod.supplierId || '',
      supplierName: prod.supplierName || '',
      supplierPhone: prod.supplierPhone || '',
      isCombo: prod.isCombo ?? false,
      comboItems: prod.comboItems ? [...prod.comboItems] : [],
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || productForm.priceWholesale <= 0) {
      onTriggerToast('Error en Formulario', 'Ingresa un nombre y precio válido.');
      return;
    }

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              sku: productForm.sku,
              name: productForm.name,
              brand: productForm.brand || 'General',
              presentation: productForm.presentation,
              category: productForm.category,
              priceWholesale: Number(productForm.priceWholesale),
              costPrice: Number(productForm.costPrice),
              unitType: productForm.unitType,
              unitsPerPack: Number(productForm.unitsPerPack),
              stockTruck: Number(productForm.stockTruck),
              stockCentral: Number(productForm.stockCentral),
              barcode: productForm.barcode,
              codePrefix: productForm.codePrefix,
              imageUrl: productForm.imageUrl,
              isOffer: Boolean(productForm.isOffer),
              offerBadge: productForm.offerBadge?.trim() || undefined,
              offerPrice:
                productForm.isOffer && productForm.offerPrice
                  ? Number(productForm.offerPrice)
                  : undefined,
              offerDescription: productForm.offerDescription?.trim() || undefined,
              supplierId: productForm.supplierId?.trim() || undefined,
              supplierName: productForm.supplierName?.trim() || undefined,
              supplierPhone: productForm.supplierPhone?.trim() || undefined,
              isCombo: Boolean(productForm.isCombo),
              comboItems: productForm.isCombo ? (productForm.comboItems || []) : undefined,
            }
          : p
      );
      onUpdateProducts(updated);
      onTriggerToast('Producto Actualizado', `${productForm.name} guardado con éxito.`);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now().toString().slice(-4)}`,
        sku: productForm.sku,
        name: productForm.name,
        brand: productForm.brand || 'General',
        presentation: productForm.presentation,
        category: productForm.category,
        priceWholesale: Number(productForm.priceWholesale),
        costPrice: Number(productForm.costPrice),
        unitType: productForm.unitType,
        unitsPerPack: Number(productForm.unitsPerPack),
        stockTruck: Number(productForm.stockTruck),
        stockCentral: Number(productForm.stockCentral),
        barcode: productForm.barcode,
        codePrefix: productForm.codePrefix,
        imageUrl: productForm.imageUrl,
        isOffer: Boolean(productForm.isOffer),
        offerBadge: productForm.offerBadge?.trim() || undefined,
        offerPrice:
          productForm.isOffer && productForm.offerPrice
            ? Number(productForm.offerPrice)
            : undefined,
        offerDescription: productForm.offerDescription?.trim() || undefined,
        supplierId: productForm.supplierId?.trim() || undefined,
        supplierName: productForm.supplierName?.trim() || undefined,
        supplierPhone: productForm.supplierPhone?.trim() || undefined,
        isCombo: Boolean(productForm.isCombo),
        comboItems: productForm.isCombo ? (productForm.comboItems || []) : undefined,
      };
      onUpdateProducts([...products, newProd]);
      onTriggerToast('Producto Creado', `${newProd.name} agregado al catálogo mayorista.`);
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      onUpdateProducts(products.filter((p) => p.id !== productId));
      onTriggerToast('Producto Eliminado', `${name} retirado del catálogo.`);
    }
  };

  const handleApplyPriceAdjustment = () => {
    const factor = 1 + priceAdjustPercent / 100;
    const updated = products.map((p) => {
      if (priceAdjustCategory === 'all' || p.category === priceAdjustCategory) {
        return {
          ...p,
          priceWholesale: Math.round(p.priceWholesale * factor),
          costPrice: p.costPrice ? Math.round(p.costPrice * factor) : undefined,
        };
      }
      return p;
    });
    onUpdateProducts(updated);
    setIsPriceAdjustModalOpen(false);
    onTriggerToast(
      'Precios Actualizados',
      `Se aplicó ${priceAdjustPercent > 0 ? '+' : ''}${priceAdjustPercent}% a ${
        priceAdjustCategory === 'all' ? 'todos los productos' : priceAdjustCategory
      }.`
    );
  };

  // -------------------------------------------------------------
  // HANDLERS: Client Management
  // -------------------------------------------------------------
  const handleOpenNewClientModal = () => {
    setEditingClient(null);
    setClientForm({
      code: `#CLI-${1050 + clients.length}`,
      name: '',
      businessName: '',
      address: '',
      zone: 'Zona 04 Centro',
      phone: '+54 9 11 ',
      currentDebt: 0,
      creditLimit: 200000,
      canAccessApp: true,
    });
    setIsClientModalOpen(true);
  };

  const handleOpenEditClientModal = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      id: client.id,
      code: client.code,
      name: client.name,
      businessName: client.businessName,
      address: client.address,
      zone: client.zone,
      phone: client.phone,
      currentDebt: client.currentDebt,
      creditLimit: client.creditLimit,
      canAccessApp: client.canAccessApp !== false,
    });
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim() || !clientForm.address.trim()) {
      onTriggerToast('Error en Formulario', 'Ingresa nombre de comercio y dirección.');
      return;
    }

    if (editingClient) {
      const updated = clients.map((c) =>
        c.id === editingClient.id
          ? {
              ...c,
              code: clientForm.code,
              name: clientForm.name,
              businessName: clientForm.businessName || clientForm.name,
              address: clientForm.address,
              zone: clientForm.zone,
              phone: clientForm.phone,
              currentDebt: Number(clientForm.currentDebt),
              creditLimit: Number(clientForm.creditLimit),
              canAccessApp: clientForm.canAccessApp ?? true,
            }
          : c
      );
      onUpdateClients(updated);
      onTriggerToast('Cliente Actualizado', `${clientForm.name} guardado con éxito.`);
    } else {
      const newClient: Client = {
        id: `cli-${Date.now().toString().slice(-4)}`,
        code: clientForm.code,
        name: clientForm.name,
        businessName: clientForm.businessName || clientForm.name,
        address: clientForm.address,
        zone: clientForm.zone,
        phone: clientForm.phone,
        currentDebt: Number(clientForm.currentDebt),
        creditLimit: Number(clientForm.creditLimit),
        canAccessApp: clientForm.canAccessApp ?? true,
        geofenceStatus: 'nearby',
        distanceMeters: 50,
        status: 'pending',
      };
      onUpdateClients([...clients, newClient]);
      onTriggerToast('Cliente Registrado', `${newClient.name} dado de alta en ${newClient.zone}.`);
    }
    setIsClientModalOpen(false);
  };

  const handleDeleteClient = (clientId: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el cliente "${name}"?`)) {
      onUpdateClients(clients.filter((c) => c.id !== clientId));
      onTriggerToast('Cliente Eliminado', `${name} eliminado de la base.`);
    }
  };

  const handleToggleClientAppAccess = (client: Client) => {
    const newStatus = client.canAccessApp === false;
    const updated = clients.map((c) =>
      c.id === client.id ? { ...c, canAccessApp: newStatus } : c
    );
    onUpdateClients(updated);
    onTriggerToast(
      newStatus ? 'Cliente Habilitado' : 'Acceso Bloqueado',
      `"${client.name}" ${newStatus ? 'ahora puede ingresar a la App' : 'ha sido deshabilitado de la App'}.`
    );
  };

  // -------------------------------------------------------------
  // WHATSAPP BROADCAST MESSAGE GENERATOR
  // -------------------------------------------------------------
  const filteredBroadcastClients = useMemo(() => {
    return clients.filter((c) => {
      if (broadcastZone === 'all') return true;
      return c.zone === broadcastZone;
    });
  }, [clients, broadcastZone]);

  const generatedWhatsAppText = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    if (catalogType === 'link_web') {
      let msg = `🛒 *DISTROPRO MAYORISTA - CATÁLOGO ONLINE Y PEDIDOS*\n`;
      msg += `📅 *Vigencia:* ${todayStr}\n\n`;
      msg += `Estimado cliente, ya podés armar tu pedido mayorista directamente desde nuestro catálogo online con precios actualizados y promociones vigentes:\n\n`;
      msg += `👉 *Abrir Catálogo y Pedir:* https://distripro.app/catalogo\n\n`;
      if (includeCashDiscount && cashDiscountPercent > 0) {
        msg += `⚡ *Beneficio Exclusivo:* *${cashDiscountPercent}% de descuento* por pago en efectivo contado contra entrega.\n\n`;
      }
      if (includeBankData) {
        msg += `🏦 *Datos para transferencias bancarias:*\n`;
        msg += `• Banco: ${bankInfo.bankName}\n`;
        msg += `• Alias: *${bankInfo.alias}*\n`;
        msg += `• CBU: \`${bankInfo.cbu}\`\n`;
        msg += `• Titular: ${bankInfo.accountHolder} (CUIT: ${bankInfo.cuit})\n\n`;
      }
      msg += `Cualquier consulta estamos a tu disposición por este medio. ¡Muchas gracias por tu compra!`;
      return msg;
    }

    if (catalogType === 'ofertas') {
      let msg = `🔥 *OFERTAS DESTACADAS DE LA SEMANA - DISTRIPRO MAYORISTA*\n`;
      msg += `📅 *Precios vigentes al:* ${todayStr}\n\n`;

      const offers = products.slice(0, 5);
      offers.forEach((p, idx) => {
        const cashPrice = includeCashDiscount
          ? Math.round(p.priceWholesale * (1 - cashDiscountPercent / 100))
          : p.priceWholesale;
        msg += `${idx + 1}️⃣ *${p.name}*\n`;
        msg += `   • Presentación: ${p.presentation}\n`;
        msg += `   • Precio Lista: $${p.priceWholesale.toLocaleString('es-AR')}\n`;
        if (includeCashDiscount) {
          msg += `   • *Efectivo (-${cashDiscountPercent}%): $${cashPrice.toLocaleString('es-AR')}*\n`;
        }
        msg += `\n`;
      });

      if (includeBankData) {
        msg += `💳 *Alias Transferencia:* *${bankInfo.alias}* (${bankInfo.bankName})\n`;
      }
      msg += `📦 Respondé este mensaje con las cantidades deseadas para reservar stock.`;
      return msg;
    }

    if (catalogType === 'compacto') {
      let msg = `📋 *LISTA DE PRECIOS MAYORISTA EXPRESS - DISTRIPRO*\n`;
      msg += `📅 ${todayStr}\n\n`;
      products.forEach((p) => {
        msg += `• *${p.name}* (${p.presentation}) ➜ *$${p.priceWholesale.toLocaleString('es-AR')}*\n`;
      });
      if (includeCashDiscount) {
        msg += `\n⚡ *Descuento contado efectivo:* ${cashDiscountPercent}%\n`;
      }
      msg += `\nEnvianos tu lista de bultos por WhatsApp para preparar tu despacho.`;
      return msg;
    }

    // Default: Catálogo Completo por Categorías
    let msg = `📦 *CATÁLOGO GENERAL DE PRECIOS MAYORISTAS - DISTRIPRO*\n`;
    msg += `📅 *Actualizado:* ${todayStr}\n\n`;

    const categories: string[] = Array.from(new Set(products.map((p) => p.category)));
    categories.forEach((cat: string) => {
      const catProducts = products.filter((p) => p.category === cat);
      msg += `🏷️ *--- ${cat.toUpperCase()} ---*\n`;
      catProducts.forEach((p) => {
        const cashPrice = includeCashDiscount
          ? Math.round(p.priceWholesale * (1 - cashDiscountPercent / 100))
          : p.priceWholesale;
        msg += `• *${p.name}*\n`;
        msg += `  ${p.presentation} ➜ *$${p.priceWholesale.toLocaleString('es-AR')}*`;
        if (includeCashDiscount) {
          msg += ` (Efectivo: *$${cashPrice.toLocaleString('es-AR')}*)`;
        }
        msg += `\n`;
      });
      msg += `\n`;
    });

    if (includeCashDiscount && cashDiscountPercent > 0) {
      msg += `💵 *Condición Comercial:* *${cashDiscountPercent}% OFF* por pago en efectivo contra entrega.\n\n`;
    }

    if (includeBankData) {
      msg += `🏦 *Cuenta Oficial para Pagos y Transferencias:*\n`;
      msg += `• Banco: ${bankInfo.bankName}\n`;
      msg += `• Alias: *${bankInfo.alias}*\n`;
      msg += `• CBU: \`${bankInfo.cbu}\`\n`;
      msg += `• Razón Social: ${bankInfo.accountHolder}\n\n`;
    }

    msg += `📲 Para coordinar pedidos, envianos las cantidades o solicítale a tu preventista asignado.`;
    return msg;
  }, [products, catalogType, includeCashDiscount, includeBankData, cashDiscountPercent, bankInfo]);

  const handleSendSingleWhatsApp = (client: Client) => {
    const cleanPhone = client.phone.replace(/[^0-9]/g, '');
    const personalizedHeader = `Hola *${client.name}*! Te enviamos la información actualizada de DistriPro Mayorista:\n\n`;
    const fullText = personalizedHeader + generatedWhatsAppText;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(fullText)}`;
    window.open(url, '_blank');

    if (!sentClientIds.includes(client.id)) {
      setSentClientIds([...sentClientIds, client.id]);
    }
    onTriggerToast('WhatsApp Abierto', `Mensaje preparado para ${client.name}.`);
  };

  const handleCopyBroadcastText = () => {
    navigator.clipboard.writeText(generatedWhatsAppText);
    onTriggerToast('Mensaje Copiado', 'Texto de catálogo listo para pegar en WhatsApp o difusión.');
  };

  // -------------------------------------------------------------
  // HANDLERS: Export / Sync
  // -------------------------------------------------------------
  const handleDownloadFullCatalogJson = () => {
    const payload: CatalogSyncPayload = {
      version: '3.8.4',
      date: new Date().toISOString(),
      vendor: 'Casa Central',
      zone: 'General',
      cashDiscountPercent,
      bankInfo,
      products,
      clients,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `distripro_catalogo_central_${new Date().toISOString().slice(0, 10)}.dist`;
    a.click();
    URL.revokeObjectURL(url);
    onTriggerToast(
      'Archivo Generado',
      'Descargado archivo .dist de sincronización para los preventistas.'
    );
  };

  const handleImportJsonBatch = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      onImportSyncBatch(parsed);
      setImportJsonText('');
      onTriggerToast('Lote Procesado', 'Datos incorporados a Casa Central con éxito.');
    } catch (err) {
      onTriggerToast('Error de Formato', 'El texto ingresado no es un JSON válido.');
    }
  };

  // Filtered Products Table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.barcode.includes(productSearch);
      const matchCat =
        productCategoryFilter === 'all' || p.category === productCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Filtered & Sorted Clients Table (Permite ordenar columnas de mayor a menor al hacer click)
  const filteredClients = useMemo(() => {
    const list = clients.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.code.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.address.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone.includes(clientSearch);
      const matchZone = clientZoneFilter === 'all' || c.zone === clientZoneFilter;
      return matchSearch && matchZone;
    });

    return list.sort((a, b) => {
      let comparison = 0;
      if (clientSortKey === 'currentDebt') {
        comparison = a.currentDebt - b.currentDebt;
      } else if (clientSortKey === 'creditLimit') {
        comparison = a.creditLimit - b.creditLimit;
      } else if (clientSortKey === 'totalOrdersCount') {
        comparison = (a.totalOrdersCount || 0) - (b.totalOrdersCount || 0);
      } else if (clientSortKey === 'code') {
        comparison = a.code.localeCompare(b.code, undefined, { numeric: true });
      } else if (clientSortKey === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (clientSortKey === 'address') {
        comparison = a.address.localeCompare(b.address);
      } else if (clientSortKey === 'phone') {
        comparison = a.phone.localeCompare(b.phone);
      }
      return clientSortDirection === 'desc' ? -comparison : comparison;
    });
  }, [clients, clientSearch, clientZoneFilter, clientSortKey, clientSortDirection]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  const uniqueZones = useMemo(() => {
    return Array.from(new Set(clients.map((c) => c.zone)));
  }, [clients]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0b1c30] flex flex-col font-['Inter',sans-serif]">
      {/* Top Office / Web Admin Header */}
      <header className="sticky top-0 z-40 bg-[#00236f] text-white shadow-md border-b border-[#1e3a8a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/icon.svg"
              alt="DistriPro Logo"
              className="h-9 w-9 object-contain bg-white rounded-lg p-1 shrink-0 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[18px] tracking-tight text-white leading-none">
                  DistriPro Web
                </span>
                <span className="bg-[#82f5c1] text-[#004f35] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Casa Central / Admin
                </span>
              </div>
              <p className="text-[11px] text-[#90a8ff] truncate">
                Panel Central de Control Comercial, Productos, Clientes y Rentabilidad
              </p>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`h-9 px-3 sm:px-3.5 text-[12px] font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                activeTab === 'config'
                  ? 'bg-white text-[#00236f] shadow-md ring-2 ring-[#82f5c1]'
                  : 'bg-[#13327a] hover:bg-[#1e44a0] text-white border border-white/20'
              }`}
              title="Abrir Pantalla de Opciones y Configuración de Empresa (Logo, CUIT, WhatsApp, Políticas)"
            >
              <LocalIcon name="settings" className="w-4 h-4 text-[#82f5c1]" />
              <span>Opciones Empresa</span>
            </button>

            <button
              type="button"
              onClick={onOpenMobileApp}
              className="h-9 px-3.5 bg-[#82f5c1] hover:bg-[#6ee7b7] text-[#004f35] text-[12px] font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title="Abrir vista de la App Móvil para Preventistas y Clientes"
            >
              <LocalIcon name="phone_android" className="w-4 h-4 text-[#004f35]" />
              <span className="hidden sm:inline">Ver App Móvil de Calle</span>
              <span className="sm:hidden">App Móvil</span>
            </button>
          </div>
        </div>

        {/* Main Admin Navigation Bar */}
        <div className="bg-[#001950] border-t border-[#1e3a8a]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto scrollbar-none py-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`h-9 px-3 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LocalIcon name="bar_chart" className="w-4 h-4" />
              <span>Dashboard & Rentabilidad</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recepcion_pedidos')}
              className={`h-9 px-3 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'recepcion_pedidos'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LocalIcon name="inbox" className="w-4 h-4 text-emerald-400" />
              <span className="flex items-center gap-1.5">
                <span>Recepción Pedidos WhatsApp</span>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {orders.length}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('productos')}
              className={`h-9 px-3 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'productos'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LocalIcon name="inventory_2" className="w-4 h-4" />
              <span>Carga Productos ({products.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clientes')}
              className={`h-9 px-3 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'clientes'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LocalIcon name="users" className="w-4 h-4" />
              <span>Clientes & Límites ({clients.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rubros_zonas')}
              className={`h-9 px-3 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'rubros_zonas'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LocalIcon name="category" className="w-4 h-4 text-amber-300" />
              <span>Rubros & Zonas</span>
            </button>

            {/* Compras a Proveedores */}
            <button
              type="button"
              onClick={() => setActiveTab('compras')}
              className={`h-9 px-3 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'compras'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-[#82f5c1]" />
              <span className="flex items-center gap-1.5">
                <span>Compras Proveedores</span>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {effectivePurchases.length}
                </span>
                {metrics.costVariationAlertsCount > 0 && (
                  <span
                    className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 animate-pulse"
                    title="Compras con alerta de variación en precio de costo"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>{metrics.costVariationAlertsCount}</span>
                  </span>
                )}
              </span>
            </button>

            {/* Gastos y Costos Fijos */}
            <button
              type="button"
              onClick={() => setActiveTab('gastos')}
              className={`h-9 px-3 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'gastos'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Receipt className="w-4 h-4 text-amber-300" />
              <span className="flex items-center gap-1.5">
                <span>Gastos & Costos</span>
                <span className="bg-slate-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {effectiveExpenses.length}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('difusion')}
              className={`h-9 px-3 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'difusion'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LocalIcon name="chat" className="w-4 h-4 text-emerald-400" />
              <span>Enviar Catálogo (JSON + Fotos)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`h-9 px-3 rounded-lg text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'config'
                  ? 'bg-white text-[#00236f] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <LocalIcon name="settings" className="w-4 h-4 text-[#82f5c1]" />
              <span>Opciones & Configuración</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ============================================================== */}
        {/* TAB 1: DASHBOARD & RENTABILIDAD                                */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Executive Welcome Bar */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[22px] text-[#00236f]">
                  Dashboard Ejecutivo de Ventas y Rentabilidad
                </h1>
                <p className="text-[13px] text-[#64748b] mt-0.5">
                  Métricas calculadas en tiempo real en base a pedidos registrados, costos de adquisición y cobranzas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadFullCatalogJson}
                  className="h-9 px-3 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-[12px] font-bold rounded-lg flex items-center gap-1.5 transition-all border border-[#bfdbfe] cursor-pointer"
                >
                  <LocalIcon name="download" className="w-4 h-4" />
                  <span>Exportar Reporte (.dist)</span>
                </button>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Ventas Totales */}
              <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#64748b]">
                  <span className="text-[12px] font-semibold uppercase tracking-wider">Facturación Total</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00236f] flex items-center justify-center">
                    <LocalIcon name="point_of_sale" className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-[24px] font-bold font-mono text-[#00236f]">
                    ${metrics.totalSales.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[11px] text-[#64748b] mt-1 flex items-center gap-1">
                    <span>{orders.length} pedidos confirmados</span>
                  </div>
                </div>
              </div>

              {/* Costo Mercadería (CMV) */}
              <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#64748b]">
                  <span className="text-[12px] font-semibold uppercase tracking-wider">Costo Mercadería (CMV)</span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#475569] flex items-center justify-center">
                    <LocalIcon name="inventory_2" className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-[24px] font-bold font-mono text-[#475569]">
                    ${metrics.totalCostOfGoods.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[11px] text-[#64748b] mt-1">
                    <span>Costo adquisición bultos</span>
                  </div>
                </div>
              </div>

              {/* Ganancia Bruta / Rentabilidad $ */}
              <div className="bg-emerald-50/70 p-4 rounded-xl shadow-xs border border-emerald-200 flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-800">
                  <span className="text-[12px] font-semibold uppercase tracking-wider">Ganancia Bruta</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <LocalIcon name="trending_up" className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-[24px] font-bold font-mono text-emerald-700">
                    +${metrics.grossProfit.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800 mt-1 flex items-center gap-1">
                    <span className="bg-emerald-200/80 px-1.5 py-0.5 rounded text-[10px]">
                      {metrics.profitMarginPercent.toFixed(1)}% Margen Neto
                    </span>
                  </div>
                </div>
              </div>

              {/* Cobranzas Realizadas */}
              <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#64748b]">
                  <span className="text-[12px] font-semibold uppercase tracking-wider">Cobrado en Mano / Banco</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <LocalIcon name="payments" className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-[24px] font-bold font-mono text-[#0b1c30]">
                    ${metrics.totalCollections.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[11px] text-[#64748b] mt-1">
                    <span>{collections.length} recibos procesados</span>
                  </div>
                </div>
              </div>

              {/* Deuda en la Calle */}
              <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#64748b]">
                  <span className="text-[12px] font-semibold uppercase tracking-wider">Saldos en la Calle</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                    <LocalIcon name="receipt_long" className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-[24px] font-bold font-mono text-rose-600">
                    ${metrics.totalDebt.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[11px] text-[#64748b] mt-1">
                    <span>Cuenta Corriente Clientes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* P&L OPERATIVO: INTEGRACIÓN DE COMPRAS, GASTOS Y COSTOS FIJOS */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00236f] text-white flex items-center justify-center shadow-xs">
                    <Scale className="w-5 h-5 text-[#82f5c1]" />
                  </div>
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] text-[#00236f] flex items-center gap-2">
                      <span>Estado de Resultados Operativo (P&L Real)</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        Gastos & Costos Fijos Deducidos
                      </span>
                    </h2>
                    <p className="text-[12px] text-[#64748b]">
                      Cálculo de rentabilidad neta deduciendo costos fijos de estructura, sueldos, alquiler y fletes de las ventas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('gastos')}
                    className="h-8 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-700" />
                    <span>Cargar Gastos / Costos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('compras')}
                    className="h-8 px-3 rounded-lg bg-[#eff4ff] hover:bg-[#dbe7ff] text-[#00236f] border border-[#bfdbfe] text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-[#00236f]" />
                    <span>Cargar Compras</span>
                  </button>
                </div>
              </div>

              {/* Cascada Financiera P&L */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-[12px]">
                <div className="space-y-0.5">
                  <div className="text-[#64748b] font-medium text-[11px] uppercase">1. Facturación</div>
                  <div className="font-mono font-bold text-[15px] text-[#00236f]">
                    ${metrics.totalSales.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[10px] text-slate-500">100% Ingresos</div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[#64748b] font-medium text-[11px] uppercase">2. (-) CMV Ventas</div>
                  <div className="font-mono font-bold text-[15px] text-rose-600">
                    -${metrics.totalCostOfGoods.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {metrics.totalSales > 0 ? ((metrics.totalCostOfGoods / metrics.totalSales) * 100).toFixed(1) : 0}% costo mercadería
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[#64748b] font-medium text-[11px] uppercase">3. (=) Ganancia Bruta</div>
                  <div className="font-mono font-bold text-[15px] text-emerald-700">
                    +${metrics.grossProfit.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    {metrics.profitMarginPercent.toFixed(1)}% margen bruto
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[#64748b] font-medium text-[11px] uppercase">4. (-) Gastos & Costos</div>
                  <div className="font-mono font-bold text-[15px] text-amber-700">
                    -${metrics.totalExpenses.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[10px] text-amber-800 font-semibold">
                    Fijos: ${metrics.fixedCosts.toLocaleString('es-AR')} | Var: ${metrics.variableCosts.toLocaleString('es-AR')}
                  </div>
                </div>

                <div className="space-y-0.5 col-span-2 md:col-span-1 bg-white p-2 rounded-lg border border-emerald-300 shadow-2xs">
                  <div className="text-emerald-900 font-bold text-[11px] uppercase">5. (=) Resultado Neto</div>
                  <div className={`font-mono font-black text-[16px] ${metrics.netOperatingProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {metrics.netOperatingProfit >= 0 ? '+' : ''}${metrics.netOperatingProfit.toLocaleString('es-AR')}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-bold">
                    {metrics.netProfitMarginPercent.toFixed(1)}% Margen Neto Real
                  </div>
                </div>
              </div>

              {/* Grid de Métricas de Estructura y Compras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gastos Totales */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-900">
                    <span className="text-[12px] font-semibold uppercase tracking-wider">Gastos de Operación</span>
                    <Receipt className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="mt-2">
                    <div className="text-[22px] font-bold font-mono text-amber-900">
                      ${metrics.totalExpenses.toLocaleString('es-AR')}
                    </div>
                    <div className="text-[11px] text-amber-800 mt-1 flex items-center justify-between">
                      <span>Fijos: ${metrics.fixedCosts.toLocaleString('es-AR')}</span>
                      <span>Pendientes: ${metrics.pendingExpenses.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>

                {/* Resultado Neto Real */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  metrics.netOperatingProfit >= 0
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                    : 'border-rose-200 bg-rose-50/50 text-rose-900'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold uppercase tracking-wider">Beneficio Neto Real</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="mt-2">
                    <div className="text-[22px] font-bold font-mono">
                      {metrics.netOperatingProfit >= 0 ? '+' : ''}${metrics.netOperatingProfit.toLocaleString('es-AR')}
                    </div>
                    <div className="text-[11px] mt-1 font-semibold">
                      <span>Bolsillo neto descontando alquiler, sueldos y servicios</span>
                    </div>
                  </div>
                </div>

                {/* Punto de Equilibrio (Break-Even) */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[#00236f]">
                    <span className="text-[12px] font-semibold uppercase tracking-wider">Punto de Equilibrio</span>
                    <Scale className="w-4 h-4 text-[#00236f]" />
                  </div>
                  <div className="mt-2">
                    <div className="text-[22px] font-bold font-mono text-[#00236f]">
                      ${metrics.breakEvenSales.toLocaleString('es-AR')}
                    </div>
                    <div className="text-[11px] text-[#475569] mt-1">
                      <span>Ventas mínimas para cubrir costos fijos (${metrics.fixedCosts.toLocaleString('es-AR')})</span>
                    </div>
                  </div>
                </div>

                {/* Compras a Proveedores */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-[12px] font-semibold uppercase tracking-wider">Compras Proveedores</span>
                    <ShoppingCart className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="mt-2">
                    <div className="text-[22px] font-bold font-mono text-slate-800">
                      ${metrics.totalPurchasesAmount.toLocaleString('es-AR')}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                      <span>{metrics.totalPurchasesUnits} bultos comprados</span>
                      {metrics.costVariationAlertsCount > 0 && (
                        <span className="text-amber-700 font-bold">
                          {metrics.costVariationAlertsCount} con alarma de costo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Grid: Rentabilidad por Categoría & Top Rentables */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Rentabilidad por Categoría */}
              <div className="lg:col-span-6 bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] space-y-4">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#00236f] flex items-center gap-2">
                      <LocalIcon name="bar_chart" className="w-5 h-5 text-[#006c4a]" />
                      <span>Rentabilidad y Ventas por Categoría</span>
                    </h3>
                    <p className="text-[12px] text-[#64748b]">
                      Margen bruto (%) y ganancia aportada por cada rubro
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {Object.entries(metrics.categoryStats).map(([cat, stat]: [string, { sales: number; cost: number; profit: number; marginPercent: number; units: number }]) => {
                    const margin = stat.marginPercent;
                    const isHigh = margin >= 30;
                    const isMedium = margin >= 20 && margin < 30;

                    return (
                      <div key={cat} className="space-y-1.5 p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
                        <div className="flex items-center justify-between text-[13px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#00236f]">{cat}</span>
                            <span className="text-[11px] text-[#64748b]">({stat.units} bultos)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[12px] text-[#475569]">
                              Ventas: ${stat.sales.toLocaleString('es-AR')}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                                isHigh
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isMedium
                                  ? 'bg-blue-100 text-[#00236f]'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {margin.toFixed(1)}% Margen
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(Math.max(margin * 2.5, 8), 100)}%`,
                            }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] text-[#64748b] pt-0.5">
                          <span>Costo: ${stat.cost.toLocaleString('es-AR')}</span>
                          <span className="font-bold text-emerald-700">
                            Ganancia Neta: +${stat.profit.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ranking de Productos Más Rentables */}
              <div className="lg:col-span-6 bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] space-y-4">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#00236f] flex items-center gap-2">
                      <LocalIcon name="trending_up" className="w-5 h-5 text-emerald-600" />
                      <span>Top Productos por Ganancia en Ventas</span>
                    </h3>
                    <p className="text-[12px] text-[#64748b]">
                      Artículos que mayor rentabilidad líquida generan
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] text-[#64748b] uppercase text-[10px] tracking-wider">
                        <th className="py-2 font-semibold">Producto</th>
                        <th className="py-2 font-semibold text-center">Bultos</th>
                        <th className="py-2 font-semibold text-right">Venta</th>
                        <th className="py-2 font-semibold text-right">Costo</th>
                        <th className="py-2 font-semibold text-right text-emerald-700">Ganancia ($)</th>
                        <th className="py-2 font-semibold text-right">Margen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {metrics.topProducts.map((item, idx) => (
                        <tr key={item.product.id} className="hover:bg-[#f8f9ff]">
                          <td className="py-2.5 pr-2">
                            <div className="font-bold text-[#00236f] truncate max-w-[170px]">
                              {item.product.name}
                            </div>
                            <div className="text-[10px] text-[#64748b]">{item.product.sku}</div>
                          </td>
                          <td className="py-2.5 text-center font-mono font-semibold">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 text-right font-mono text-[#0b1c30]">
                            ${item.totalSales.toLocaleString('es-AR')}
                          </td>
                          <td className="py-2.5 text-right font-mono text-[#64748b]">
                            ${item.totalCost.toLocaleString('es-AR')}
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-emerald-600">
                            +${item.profit.toLocaleString('es-AR')}
                          </td>
                          <td className="py-2.5 text-right">
                            <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {item.margin.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CARGA Y GESTIÓN DE PRODUCTOS (ABM PRODUCTOS)            */}
        {/* ============================================================== */}
        {activeTab === 'productos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header / Action Bar */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-[#00236f]">
                  Catálogo Maestro y Carga de Productos
                </h1>
                <p className="text-[13px] text-[#64748b] mt-0.5">
                  Gestiona precios mayoristas, costos de adquisición, márgenes automáticos y stock en Casa Central.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPriceAdjustModalOpen(true)}
                  className="h-9 px-3 bg-[#f8f9ff] hover:bg-[#e5eeff] text-[#00236f] text-[12px] font-bold rounded-lg border border-[#bfdbfe] flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <LocalIcon name="percent" className="w-4 h-4" />
                  <span>Ajuste Masivo %</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadFullCatalogJson}
                  className="h-9 px-3 bg-[#f8f9ff] hover:bg-[#e5eeff] text-[#475569] text-[12px] font-bold rounded-lg border border-[#cbd5e1] flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Descargar catálogo en formato .dist para los celulares de preventistas"
                >
                  <LocalIcon name="download" className="w-4 h-4" />
                  <span>Exportar Catálogo</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenNewProductModal}
                  className="h-9 px-4 bg-[#00236f] hover:bg-[#1e3a8a] text-white text-[13px] font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <LocalIcon name="add_circle" className="w-4 h-4 text-[#82f5c1]" />
                  <span>+ Cargar Nuevo Producto</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <LocalIcon
                  name="search"
                  className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar por nombre, SKU o código de barras..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#64748b] font-medium">Categoría:</span>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                >
                  <option value="all">Todas ({products.length})</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-[#e2e8f0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-3 text-center">Foto</th>
                      <th className="py-3 px-4">SKU / Código</th>
                      <th className="py-3 px-4">Producto & Marca</th>
                      <th className="py-3 px-4">Rubro</th>
                      <th className="py-3 px-4 text-right">Costo Compra</th>
                      <th className="py-3 px-4 text-right">Precio Mayorista</th>
                      <th className="py-3 px-4 text-right">Margen Bruto</th>
                      <th className="py-3 px-4 text-center">Stock Central</th>
                      <th className="py-3 px-4 text-center">Stock Camión</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredProducts.map((prod) => {
                      const cost = prod.costPrice || Math.round(prod.priceWholesale * 0.72);
                      const profitUnit = prod.priceWholesale - cost;
                      const marginPercent = prod.priceWholesale > 0 ? (profitUnit / prod.priceWholesale) * 100 : 0;

                      return (
                        <tr key={prod.id} className="hover:bg-[#f8f9ff] transition-colors">
                          <td className="py-2 px-3 text-center">
                            {prod.imageUrl ? (
                              <div className="inline-block relative">
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-[#cbd5e1] shadow-2xs mx-auto"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 mx-auto rounded-lg bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
                                <LocalIcon name="image" className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#00236f]">
                            {prod.sku}
                            <div className="text-[10px] text-[#94a3b8]">{prod.barcode}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0b1c30]">{prod.name}</div>
                            <div className="text-[11px] text-[#64748b]">
                              {prod.brand} • {prod.presentation}
                            </div>
                            {prod.isCombo && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                  📦 COMBO ({prod.comboItems?.length || 0} artículos incluidos)
                                </span>
                                {prod.comboItems && prod.comboItems.length > 0 && (
                                  <div className="mt-1 text-[11px] text-purple-900 bg-purple-50/70 p-1.5 rounded-md border border-purple-100 flex flex-wrap gap-1">
                                    {prod.comboItems.map((ci, idx) => (
                                      <span key={idx} className="bg-white px-1.5 py-0.5 rounded border border-purple-200 shadow-2xs font-medium">
                                        {ci.quantity}x {ci.productName}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            {prod.supplierName && (
                              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#00236f] bg-slate-100 px-2 py-0.5 rounded-md w-fit border border-slate-200">
                                <span className="font-semibold">🏢 {prod.supplierName}</span>
                                {prod.supplierPhone && (
                                  <a
                                    href={`https://wa.me/${prod.supplierPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                      `Hola ${prod.supplierName}, te consultamos por el artículo: ${prod.name} (${prod.sku})`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-700 hover:text-emerald-800 font-mono font-bold flex items-center gap-0.5 ml-1"
                                    title="Enviar WhatsApp al proveedor"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                    📱 {prod.supplierPhone}
                                  </a>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-[#eff4ff] text-[#00236f] px-2 py-0.5 rounded text-[11px] font-medium border border-[#dce9ff]">
                              {prod.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#64748b]">
                            ${cost.toLocaleString('es-AR')}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#00236f]">
                            ${prod.priceWholesale.toLocaleString('es-AR')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="font-mono font-bold text-emerald-600">
                              +${profitUnit.toLocaleString('es-AR')}
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded">
                              {marginPercent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-[#0b1c30]">
                            {prod.stockCentral}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-blue-700">
                            {prod.stockTruck}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProductModal(prod)}
                                className="p-1.5 hover:bg-[#eff4ff] text-[#00236f] rounded-lg transition-colors cursor-pointer"
                                title="Editar precios o stock"
                              >
                                <LocalIcon name="edit" className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar producto"
                              >
                                <LocalIcon name="delete" className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: GESTIÓN DE CLIENTES & LÍMITES                           */}
        {/* ============================================================== */}
        {activeTab === 'clientes' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header / Action Bar */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-[#00236f]">
                  Padrón de Clientes y Gestión de Crédito
                </h1>
                <p className="text-[13px] text-[#64748b] mt-0.5">
                  Alta de comercios, control de límites en cuenta corriente, saldos deudores y zonas de reparto.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenNewClientModal}
                  className="h-9 px-4 bg-[#00236f] hover:bg-[#1e3a8a] text-white text-[13px] font-bold rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <LocalIcon name="add_circle" className="w-4 h-4 text-[#82f5c1]" />
                  <span>+ Alta Nuevo Cliente</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <LocalIcon
                  name="search"
                  className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar por código, comercio, dirección o teléfono..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#64748b] font-medium">Zona de Reparto:</span>
                <select
                  value={clientZoneFilter}
                  onChange={(e) => setClientZoneFilter(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                >
                  <option value="all">Todas las Zonas ({clients.length})</option>
                  {uniqueZones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-[#e2e8f0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th
                        onClick={() => handleSortClients('code')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors select-none group"
                        title="Clic para ordenar de mayor a menor / menor a mayor"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Código</span>
                          {clientSortKey === 'code' ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-[#00236f] bg-blue-100 px-1.5 py-0.2 rounded">
                              {clientSortDirection === 'desc' ? 'Z-A ↓' : 'A-Z ↑'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortClients('name')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors select-none group"
                        title="Clic para ordenar de mayor a menor / menor a mayor"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Comercio / Razón Social</span>
                          {clientSortKey === 'name' ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-[#00236f] bg-blue-100 px-1.5 py-0.2 rounded">
                              {clientSortDirection === 'desc' ? 'Z-A ↓' : 'A-Z ↑'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortClients('address')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors select-none group"
                        title="Clic para ordenar por dirección"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Dirección & Zona</span>
                          {clientSortKey === 'address' ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-[#00236f] bg-blue-100 px-1.5 py-0.2 rounded">
                              {clientSortDirection === 'desc' ? 'Z-A ↓' : 'A-Z ↑'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortClients('phone')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-200/70 transition-colors select-none group"
                        title="Clic para ordenar por teléfono"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>WhatsApp / Teléfono</span>
                          {clientSortKey === 'phone' ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-[#00236f] bg-blue-100 px-1.5 py-0.2 rounded">
                              {clientSortDirection === 'desc' ? 'Mayor ↓' : 'Menor ↑'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortClients('currentDebt')}
                        className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200/70 transition-colors select-none group"
                        title="Clic para ordenar por Deuda Actual (Mayor a Menor)"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Deuda Actual</span>
                          {clientSortKey === 'currentDebt' ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              {clientSortDirection === 'desc' ? 'Mayor ↓' : 'Menor ↑'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortClients('creditLimit')}
                        className="py-3 px-4 text-right cursor-pointer hover:bg-slate-200/70 transition-colors select-none group"
                        title="Clic para ordenar por Límite de Crédito"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Límite Crédito</span>
                          {clientSortKey === 'creditLimit' ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                              {clientSortDirection === 'desc' ? 'Mayor ↓' : 'Menor ↑'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSortClients('totalOrdersCount')}
                        className="py-3 px-4 text-center cursor-pointer hover:bg-slate-200/70 transition-colors select-none group"
                        title="Clic para ordenar por Compras Totales"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>Compras Totales</span>
                          {clientSortKey === 'totalOrdersCount' ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                              {clientSortDirection === 'desc' ? 'Mayor ↓' : 'Menor ↑'}
                            </span>
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4 text-center">Acceso App</th>
                      <th className="py-3 px-4 text-center">Estado Calle</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredClients.map((client) => {
                      const hasDebt = client.currentDebt > 0;
                      const isOverLimit = client.currentDebt > client.creditLimit;
                      const canAccess = client.canAccessApp !== false;

                      return (
                        <tr key={client.id} className="hover:bg-[#f8f9ff] transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#00236f]">
                            {client.code}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#0b1c30]">{client.name}</div>
                            <div className="text-[11px] text-[#64748b]">{client.businessName}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div>{client.address}</div>
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {client.zone}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[12px]">
                            <div className="flex items-center gap-1.5">
                              <span>{client.phone}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const text = `Hola ${client.name}, te contactamos desde DistriPro Mayorista.`;
                                  window.open(
                                    `https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`,
                                    '_blank'
                                  );
                                }}
                                className="text-emerald-600 hover:text-emerald-700 p-0.5"
                                title="Abrir WhatsApp"
                              >
                                <LocalIcon name="chat" className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            <span className={isOverLimit ? 'text-rose-600' : hasDebt ? 'text-amber-700' : 'text-emerald-600'}>
                              ${client.currentDebt.toLocaleString('es-AR')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[#64748b]">
                            ${client.creditLimit.toLocaleString('es-AR')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="font-bold text-[#00236f] text-[12px]">
                              {client.totalOrdersCount || 0} pedidos
                            </div>
                            <div className="text-[11px] font-mono text-emerald-700 font-semibold">
                              ${(client.totalSpent || 0).toLocaleString('es-AR')}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleClientAppAccess(client)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all border ${
                                canAccess
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                              }`}
                              title="Click para activar o desactivar acceso a la App Preventa"
                            >
                              {canAccess ? '✓ Habilitado' : '✕ Bloqueado'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {client.status === 'order_taken' ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                                Pedido Tomado
                              </span>
                            ) : client.status === 'visited' ? (
                              <span className="bg-blue-100 text-[#00236f] text-[11px] font-bold px-2 py-0.5 rounded-full">
                                Visitado
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-full">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditClientModal(client)}
                                className="p-1.5 hover:bg-[#eff4ff] text-[#00236f] rounded-lg transition-colors cursor-pointer"
                                title="Editar cliente o límite"
                              >
                                <LocalIcon name="edit" className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClient(client.id, client.name)}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar cliente"
                              >
                                <LocalIcon name="delete" className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: DIFUSIÓN Y ENVÍO DE CATÁLOGOS POR WHATSAPP             */}
        {/* ============================================================== */}
        {activeTab === 'difusion' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0]">
              <div className="flex items-center gap-2.5 text-emerald-700">
                <LocalIcon name="chat" className="w-6 h-6" />
                <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-[#00236f]">
                  Centro de Difusión de Catálogos por WhatsApp
                </h1>
              </div>
              <p className="text-[13px] text-[#64748b] mt-1">
                Genera listas de precios profesionales formateadas para WhatsApp y envíalas individualmente o en bloque a tus clientes registrados.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Configuration & Client Selector */}
              <div className="lg:col-span-6 space-y-5">
                {/* Format Settings */}
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] space-y-4">
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#00236f]">
                    1. Formato y Tipo de Catálogo a Enviar
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <button
                      type="button"
                      onClick={() => setCatalogType('completo')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        catalogType === 'completo'
                          ? 'border-[#00236f] bg-[#eff4ff] text-[#00236f] font-bold ring-1 ring-[#00236f]'
                          : 'border-[#cbd5e1] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <div className="font-bold">Catálogo Completo</div>
                      <div className="text-[11px] text-[#64748b] mt-0.5">Todos los rubros y precios</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCatalogType('ofertas')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        catalogType === 'ofertas'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-600'
                          : 'border-[#cbd5e1] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <div className="font-bold">Ofertas de la Semana</div>
                      <div className="text-[11px] text-[#64748b] mt-0.5">5 productos destacados</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCatalogType('compacto')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        catalogType === 'compacto'
                          ? 'border-[#00236f] bg-[#eff4ff] text-[#00236f] font-bold ring-1 ring-[#00236f]'
                          : 'border-[#cbd5e1] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <div className="font-bold">Lista Rápida Express</div>
                      <div className="text-[11px] text-[#64748b] mt-0.5">Texto ultra condensado</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCatalogType('link_web')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        catalogType === 'link_web'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600'
                          : 'border-[#cbd5e1] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <div className="font-bold">Enlace Catálogo Web</div>
                      <div className="text-[11px] text-[#64748b] mt-0.5">Cliente pide online</div>
                    </button>
                  </div>

                  {/* Inclusion Options */}
                  <div className="space-y-2 pt-2 border-t border-[#f1f5f9] text-[13px]">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCashDiscount}
                        onChange={(e) => setIncludeCashDiscount(e.target.checked)}
                        className="w-4 h-4 rounded text-[#00236f] focus:ring-[#00236f]"
                      />
                      <span>
                        Incluir descuento contado efectivo (<strong>-{cashDiscountPercent}%</strong>)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeBankData}
                        onChange={(e) => setIncludeBankData(e.target.checked)}
                        className="w-4 h-4 rounded text-[#00236f] focus:ring-[#00236f]"
                      />
                      <span>
                        Incluir datos bancarios oficiales (Alias: <strong>{bankInfo.alias}</strong>)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Recipient Client List */}
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#00236f]">
                      2. Seleccionar Clientes ({filteredBroadcastClients.length})
                    </h3>
                    <select
                      value={broadcastZone}
                      onChange={(e) => setBroadcastZone(e.target.value)}
                      className="h-8 px-2.5 rounded-lg border border-[#cbd5e1] text-[12px] bg-[#f8f9ff]"
                    >
                      <option value="all">Todas las Zonas</option>
                      {uniqueZones.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#f1f5f9] pr-1">
                    {filteredBroadcastClients.map((c) => {
                      const isSent = sentClientIds.includes(c.id);

                      return (
                        <div
                          key={c.id}
                          className="py-2.5 flex items-center justify-between gap-3 text-[12px]"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-[#0b1c30] truncate">{c.name}</div>
                            <div className="text-[11px] text-[#64748b] font-mono">{c.phone}</div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isSent ? (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <LocalIcon name="task_alt" className="w-3.5 h-3.5" />
                                <span>Enviado</span>
                              </span>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => handleSendSingleWhatsApp(c)}
                              className="h-8 px-2.5 bg-[#effcf5] hover:bg-[#d1fae5] text-[#065f46] font-bold rounded-lg border border-[#a7f3d0] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <LocalIcon name="chat" className="w-3.5 h-3.5" />
                              <span>Enviar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Live WhatsApp Message Preview */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-[#efeae2] p-5 rounded-2xl shadow-sm border border-[#d1d7db] flex flex-col h-full min-h-[500px]">
                  <div className="flex items-center justify-between pb-3 border-b border-[#d1d7db]/80">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#25d366] flex items-center justify-center text-white">
                        <LocalIcon name="chat" className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-[14px] text-[#111b21]">
                        Vista Previa de WhatsApp
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyBroadcastText}
                      className="h-8 px-3 bg-white hover:bg-slate-50 text-[#00236f] text-[12px] font-bold rounded-lg border border-[#cbd5e1] flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <LocalIcon name="copy" className="w-4 h-4" />
                      <span>Copiar Texto</span>
                    </button>
                  </div>

                  {/* Message Bubble */}
                  <div className="flex-1 mt-4">
                    <div className="bg-white p-4 rounded-xl shadow-xs text-[13px] leading-relaxed text-[#111b21] max-w-full font-sans whitespace-pre-wrap select-text border border-[#e9edef]">
                      {generatedWhatsAppText}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#d1d7db]/80 text-[11px] text-[#54656f] flex items-center justify-between">
                    <span>Texto optimizado con negritas y viñetas para WhatsApp Web y Móvil.</span>
                    <button
                      type="button"
                      onClick={handleCopyBroadcastText}
                      className="font-bold text-[#006c4a] hover:underline"
                    >
                      Copiar Todo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: OPCIONES & CONFIGURACIÓN DE EMPRESA & SYNC MÓVIL       */}
        {/* ============================================================== */}
        {activeTab === 'config' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Opciones y Configuración Completa de Empresa */}
            <OpcionesView
              settings={
                companySettings || {
                  companyName: 'Distribuidora Mayorista S.A.',
                  headquartersWhatsApp: '+54 9 387 512-3456',
                  cashDiscountPercent: cashDiscountPercent,
                  cuit: '30-71234567-8',
                  address: 'Av. San Martín 2340, Parque Industrial',
                  city: 'Salta Capital, Salta',
                  bankInfo: bankInfo,
                  receiptFooterNotes:
                    'Comprobante comercial no válido como factura. Gracias por confiar en nosotros.',
                }
              }
              onSaveSettings={(newSettings) => {
                if (onUpdateCompanySettings) {
                  onUpdateCompanySettings(newSettings);
                }
                onUpdateCashDiscount(newSettings.cashDiscountPercent);
                onUpdateBankInfo(newSettings.bankInfo);
                onTriggerToast(
                  'Opciones Guardadas',
                  `Datos, logo y políticas de ${newSettings.companyName} actualizados correctamente.`
                );
              }}
              onBack={() => setActiveTab('dashboard')}
            />

            {/* Sincronización de Archivos .dist con Preventistas */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] space-y-4">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] text-[#00236f] flex items-center gap-2">
                <LocalIcon name="sync" className="w-5 h-5 text-emerald-600" />
                <span>Sincronización de Lotes .dist con Preventistas de Calle</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-[14px] text-slate-800 flex items-center gap-2">
                    <LocalIcon name="download" className="w-4 h-4 text-[#00236f]" />
                    <span>Exportar Catálogo Central para Móviles</span>
                  </h3>
                  <p className="text-[12px] text-[#64748b]">
                    Genera el archivo .dist para enviar por WhatsApp a los preventistas y que actualicen sus celulares.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadFullCatalogJson}
                    className="w-full h-10 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-[13px] rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <LocalIcon name="download" className="w-4 h-4 text-[#82f5c1]" />
                    <span>Generar Archivo .dist para Sincronizar Móviles</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-[14px] text-slate-800 flex items-center gap-2">
                    <LocalIcon name="cloud_sync" className="w-4 h-4 text-emerald-600" />
                    <span>Recepción de Lotes .dist de Preventistas</span>
                  </h3>
                  <p className="text-[12px] text-[#64748b]">
                    Pega aquí el contenido del lote .dist enviado por los vendedores para consolidar ventas y cobranzas:
                  </p>
                  <textarea
                    rows={4}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder="Pegar contenido del archivo .dist aquí..."
                    className="w-full p-2.5 rounded-lg border border-[#cbd5e1] font-mono text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                  />
                  <button
                    type="button"
                    onClick={handleImportJsonBatch}
                    disabled={!importJsonText.trim()}
                    className={`w-full h-10 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${
                      importJsonText.trim()
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <LocalIcon name="task_alt" className="w-4 h-4" />
                    <span>Procesar e Incorporar al Dashboard</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ============================================================== */}
        {/* TAB: RECEPCIÓN DE PEDIDOS DESDE WHATSAPP (CARGA JSON)          */}
        {/* ============================================================== */}
        {activeTab === 'recepcion_pedidos' && (
          <RecepcionPedidosTab
            orders={orders}
            products={products}
            clients={clients}
            onProcessIncomingOrder={(order) => {
              if (onProcessIncomingOrderJson) {
                onProcessIncomingOrderJson(order);
              } else {
                onTriggerToast('Pedido Procesado', `Pedido ${order.orderNumber} registrado.`);
              }
            }}
            onTriggerToast={onTriggerToast}
            onViewTicket={onViewTicket}
          />
        )}

        {/* ============================================================== */}
        {/* TAB: GESTIÓN DE RUBROS Y ZONAS DE REPARTO                      */}
        {/* ============================================================== */}
        {activeTab === 'rubros_zonas' && (
          <RubrosZonasTab
            categories={categories}
            zones={zones}
            products={products}
            clients={clients}
            onAddCategory={(cat) => {
              if (onUpdateCategories) onUpdateCategories([...categories, cat]);
              onTriggerToast('Rubro Creado', `Rubro "${cat}" disponible para nuevos productos.`);
            }}
            onRenameCategory={(oldName, newName) => {
              if (onRenameCategory) onRenameCategory(oldName, newName);
              onTriggerToast('Rubro Actualizado', `Rubro "${oldName}" renombrado a "${newName}".`);
            }}
            onDeleteCategory={(cat) => {
              if (onDeleteCategory) onDeleteCategory(cat);
              onTriggerToast('Rubro Eliminado', `Rubro "${cat}" removido.`);
            }}
            onAddZone={(zone) => {
              if (onUpdateZones) onUpdateZones([...zones, zone]);
              onTriggerToast('Zona Creada', `Zona "${zone}" agregada.`);
            }}
            onRenameZone={(oldZone, newZone) => {
              if (onRenameZone) onRenameZone(oldZone, newZone);
              onTriggerToast('Zona Actualizada', `Zona "${oldZone}" renombrada a "${newZone}".`);
            }}
            onDeleteZone={(zone) => {
              if (onDeleteZone) onDeleteZone(zone);
              onTriggerToast('Zona Eliminada', `Zona "${zone}" removida.`);
            }}
            onTriggerToast={onTriggerToast}
          />
        )}

        {/* ============================================================== */}
        {/* TAB: DIFUSIÓN Y ENVÍO DE CATÁLOGO WHATSAPP (JSON + FOTOS)      */}
        {/* ============================================================== */}
        {activeTab === 'difusion' && (
          <DifusionWhatsAppTab
            products={products}
            clients={clients}
            categories={categories}
            zones={zones}
            cashDiscountPercent={cashDiscountPercent}
            bankInfo={bankInfo}
            onUpdateCashDiscount={onUpdateCashDiscount}
            onTriggerToast={onTriggerToast}
          />
        )}

        {/* ============================================================== */}
        {/* TAB: COMPRAS A PROVEEDORES Y ALARMAS DE COSTO                  */}
        {/* ============================================================== */}
        {activeTab === 'compras' && (
          <ComprasProveedoresTab
            purchases={effectivePurchases}
            products={products}
            suppliers={effectiveSuppliers}
            onUpdatePurchases={handleUpdatePurchases}
            onUpdateProducts={onUpdateProducts}
            onUpdateSuppliers={handleUpdateSuppliers}
            onTriggerToast={onTriggerToast}
          />
        )}

        {/* ============================================================== */}
        {/* TAB: GASTOS OPERATIVOS Y COSTOS FIJOS                          */}
        {/* ============================================================== */}
        {activeTab === 'gastos' && (
          <GastosCostosTab
            expenses={effectiveExpenses}
            onUpdateExpenses={handleUpdateExpenses}
            onTriggerToast={onTriggerToast}
          />
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: CARGAR / EDITAR PRODUCTO                                */}
      {/* ============================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#00236f] text-white p-4 flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] flex items-center gap-2">
                <LocalIcon name="inventory_2" className="w-5 h-5 text-[#82f5c1]" />
                <span>{editingProduct ? 'Editar Producto' : 'Cargar Nuevo Producto'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <LocalIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-3.5 text-[13px] max-h-[80vh] overflow-y-auto">
              {/* FOTO DEL PRODUCTO */}
              <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#cbd5e1] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#0b1c30] flex items-center gap-1.5 text-[13px]">
                    <LocalIcon name="photo_camera" className="w-4 h-4 text-[#00236f]" />
                    <span>Foto del Producto</span>
                  </label>
                  {productForm.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, imageUrl: undefined })}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <LocalIcon name="delete" className="w-3.5 h-3.5" />
                      <span>Quitar foto</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {productForm.imageUrl ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 shrink-0 bg-white shadow-xs">
                      <img
                        src={productForm.imageUrl}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0 bg-white">
                      <LocalIcon name="image" className="w-6 h-6 text-slate-400" />
                      <span className="text-[9px] text-slate-400">Sin foto</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <input
                      type="file"
                      ref={productFileInputRef}
                      onChange={handlePhotoFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => productFileInputRef.current?.click()}
                      className="h-8 px-3 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white text-[12px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <LocalIcon name="upload" className="w-3.5 h-3.5 text-[#82f5c1]" />
                      <span>{productForm.imageUrl ? 'Cambiar Foto' : 'Cargar Foto desde Dispositivo'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#64748b]">o URL:</span>
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/producto.jpg"
                        value={productForm.imageUrl?.startsWith('data:') ? '' : (productForm.imageUrl || '')}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value || undefined })}
                        className="flex-1 h-7 px-2 rounded border border-[#cbd5e1] text-[11px] bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">SKU / Código:</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono bg-[#f8f9ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Rubro / Categoría:</label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value as Product['category'],
                      })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-[#f8f9ff]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">Nombre del Producto:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Aceite Girasol Cocinero 1.5L"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-[#f8f9ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Marca:</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-[#f8f9ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Presentación:</label>
                  <input
                    type="text"
                    placeholder="cajas x 12u"
                    value={productForm.presentation}
                    onChange={(e) => setProductForm({ ...productForm, presentation: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-[#f8f9ff]"
                  />
                </div>
              </div>

              {/* SELECCIÓN Y GUARDADO DE PROVEEDOR DE ORIGEN */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-[#00236f] flex items-center gap-1.5">
                    <span>🏢 Proveedor / Distribuidor de Origen:</span>
                  </label>
                  {productForm.supplierPhone && (
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-semibold">
                      WhatsApp: {productForm.supplierPhone}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Elegir de agenda:</label>
                    <select
                      value={productForm.supplierName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = effectiveSuppliers.find((s) => s.name === val);
                        if (match) {
                          setProductForm((prev) => ({
                            ...prev,
                            supplierId: match.id,
                            supplierName: match.name,
                            supplierPhone: match.phone,
                          }));
                        } else {
                          setProductForm((prev) => ({
                            ...prev,
                            supplierId: undefined,
                            supplierName: val === '__otro__' ? '' : val,
                          }));
                        }
                      }}
                      className="w-full h-9 px-2 rounded-lg border border-[#cbd5e1] bg-white text-[12px] font-medium"
                    >
                      <option value="">-- Sin asignar / Otro --</option>
                      {effectiveSuppliers.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.contactName || 'Mayorista'})
                        </option>
                      ))}
                      <option value="__otro__">+ Ingresar manualmente</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium block mb-1">Nombre / Razón Social:</label>
                    <input
                      type="text"
                      placeholder="Ej: Molinos Río de la Plata"
                      value={productForm.supplierName || ''}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, supplierName: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-white text-[12px]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 font-medium block">WhatsApp del Proveedor:</label>
                  <input
                    type="text"
                    placeholder="Ej: +54 9 11 5555-1234 (para enviar pedidos por WhatsApp)"
                    value={productForm.supplierPhone || ''}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, supplierPhone: e.target.value }))}
                    className="w-full h-8 px-3 rounded-lg border border-[#cbd5e1] bg-white text-[12px] font-mono"
                  />
                </div>
              </div>

              {/* CALCULADORA BIDIRECCIONAL DE PRECIOS Y MARGEN DE GANANCIA */}
              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-emerald-700" />
                    <span className="text-[13px] font-bold text-emerald-950">
                      Calculadora de Margen & Precio de Venta
                    </span>
                  </div>
                  {productForm.priceWholesale > 0 && productForm.costPrice > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="bg-emerald-200 text-emerald-950 font-mono text-[11px] px-2 py-0.5 rounded-md font-extrabold">
                        Margen: {formMarginPercent.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Costo de Compra */}
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-emerald-950 flex items-center justify-between">
                      <span>Costo de Compra ($):</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={productForm.costPrice || ''}
                      onChange={(e) => handleProductCostChange(Number(e.target.value))}
                      placeholder="Ej: 7000"
                      className="w-full h-9 px-3 rounded-lg border border-emerald-300 font-mono bg-white font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-emerald-800 block">Costo proveedor</span>
                  </div>

                  {/* Margen de Ganancia (%) */}
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-emerald-950 flex items-center justify-between">
                      <span>Margen Deseado (%):</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={formMarginPercent !== undefined ? formMarginPercent : ''}
                        onChange={(e) => handleProductMarginChange(Number(e.target.value))}
                        placeholder="30"
                        className="w-full h-9 pl-3 pr-7 rounded-lg border border-emerald-400 font-mono bg-emerald-100/50 font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <span className="absolute right-2.5 top-2 text-[12px] font-black text-emerald-800">%</span>
                    </div>
                    <span className="text-[10px] text-emerald-800 block">Ajusta el precio</span>
                  </div>

                  {/* Precio de Venta Mayorista */}
                  <div className="space-y-1">
                    <label className="text-[12px] font-bold text-emerald-950 flex items-center justify-between">
                      <span>Precio Venta ($):</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={productForm.priceWholesale || ''}
                      onChange={(e) => handleProductPriceChange(Number(e.target.value))}
                      placeholder="Ej: 9100"
                      className="w-full h-9 px-3 rounded-lg border-2 border-emerald-500 font-mono bg-white font-black text-[#00236f] focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
                    />
                    <span className="text-[10px] text-emerald-800 block">Ajusta el margen</span>
                  </div>
                </div>

                {/* Margen Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-semibold text-emerald-900 mr-1">Margen rápido:</span>
                  {[15, 20, 25, 30, 35, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleProductMarginChange(pct)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        Math.round(formMarginPercent) === pct
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      +{pct}%
                    </button>
                  ))}
                </div>

                {/* Resumen de Rentabilidad y Utilidad neta */}
                <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-600">Ganancia Neta x Bulto:</span>
                    <span className="font-bold text-emerald-700 text-[13px]">
                      +${(productForm.priceWholesale - productForm.costPrice).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-emerald-100">
                    <span>Margen s/ Venta: {productForm.priceWholesale > 0 ? (((productForm.priceWholesale - productForm.costPrice) / productForm.priceWholesale) * 100).toFixed(1) : 0}%</span>
                    <span className="text-emerald-800 font-medium">✓ Sincronización automática activa</span>
                  </div>
                </div>
              </div>

              {/* Stock Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Stock Casa Central:</label>
                  <input
                    type="number"
                    value={productForm.stockCentral}
                    onChange={(e) => setProductForm({ ...productForm, stockCentral: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono bg-[#f8f9ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Stock en Camión/Furgón:</label>
                  <input
                    type="number"
                    value={productForm.stockTruck}
                    onChange={(e) => setProductForm({ ...productForm, stockTruck: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono bg-[#f8f9ff]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">Código de Barras EAN-13:</label>
                <input
                  type="text"
                  value={productForm.barcode}
                  onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono bg-[#f8f9ff]"
                />
              </div>

              {/* SECCIÓN OFERTAS & PROMOCIONES */}
              <div className="p-3.5 rounded-xl border-2 border-amber-300 bg-amber-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-950 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(productForm.isOffer)}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          isOffer: e.target.checked,
                          offerBadge: e.target.checked ? (productForm.offerBadge || '🔥 PROMO') : '',
                          offerPrice:
                            e.target.checked && !productForm.offerPrice
                              ? Math.round(productForm.priceWholesale * 0.9)
                              : productForm.offerPrice,
                        })
                      }
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>🔥 Marcar como Oferta / Promoción Destacada</span>
                  </label>
                  {productForm.isOffer && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-400 text-amber-950">
                      Activa en Catálogo
                    </span>
                  )}
                </div>

                {productForm.isOffer && (
                  <div className="space-y-2.5 pt-1 border-t border-amber-200 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-amber-900">
                          Texto del Cartel / Badge:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 🔥 15% OFF, COMBO, 2x1"
                          value={productForm.offerBadge || ''}
                          onChange={(e) =>
                            setProductForm({ ...productForm, offerBadge: e.target.value })
                          }
                          className="w-full h-8 px-2.5 rounded-lg border border-amber-300 bg-white text-[12px] font-bold text-amber-950"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-amber-900">
                          Precio Especial Promo ($):
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={productForm.offerPrice || ''}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              offerPrice: Number(e.target.value),
                            })
                          }
                          placeholder={`Habitual: $${productForm.priceWholesale}`}
                          className="w-full h-8 px-2.5 rounded-lg border border-amber-300 bg-white font-mono font-bold text-amber-950 text-[13px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-900">
                        Detalle / Condición de la Promoción:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Llevando 3 bultos o más bonificación directa"
                        value={productForm.offerDescription || ''}
                        onChange={(e) =>
                          setProductForm({ ...productForm, offerDescription: e.target.value })
                        }
                        className="w-full h-8 px-2.5 rounded-lg border border-amber-300 bg-white text-[12px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN PRODUCTO COMBO MULTI-ARTÍCULO */}
              <div className="p-3.5 rounded-xl border-2 border-purple-300 bg-purple-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-purple-950 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(productForm.isCombo)}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          isCombo: e.target.checked,
                          presentation: e.target.checked && (!productForm.presentation || productForm.presentation === 'cajas x 12u') ? 'Combo Promocional' : productForm.presentation,
                        })
                      }
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-purple-300"
                    />
                    <span className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-purple-700" />
                      ¿Es un Producto Combo / Pack Compuesto?
                    </span>
                  </label>
                  {productForm.isCombo && (
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                      {(productForm.comboItems || []).length} artículos vinculados
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-purple-800">
                  Al vender este combo, el sistema descontará automáticamente el stock individual de cada uno de los artículos que lo componen.
                </p>

                {productForm.isCombo && (
                  <div className="space-y-3 pt-1 border-t border-purple-200">
                    {/* Agregar Artículo al Combo */}
                    <div className="bg-white p-3 rounded-lg border border-purple-200 space-y-2">
                      <div className="text-[11px] font-bold text-purple-950 flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-purple-600" />
                        <span>Agregar Artículo que Incluye el Combo:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="sm:col-span-2">
                          <select
                            value={comboAddProductId}
                            onChange={(e) => setComboAddProductId(e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-purple-300 text-[12px] bg-white text-slate-800"
                          >
                            <option value="">-- Seleccionar producto del catálogo --</option>
                            {products
                              .filter((p) => p.id !== productForm.id && !p.isCombo)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.brand} - {p.presentation}) - Costo: ${p.costPrice || Math.round(p.priceWholesale * 0.72)}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min="1"
                            value={comboAddQuantity}
                            onChange={(e) => setComboAddQuantity(Math.max(1, Number(e.target.value)))}
                            placeholder="Cant."
                            className="w-16 h-8 px-2 rounded-lg border border-purple-300 text-[12px] text-center font-bold"
                            title="Cantidad de unidades en el combo"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!comboAddProductId) {
                                onTriggerToast('Selección requerida', 'Elige un producto para agregarlo al combo.');
                                return;
                              }
                              const targetP = products.find((p) => p.id === comboAddProductId);
                              if (!targetP) return;

                              const currentItems = productForm.comboItems || [];
                              const existingIdx = currentItems.findIndex((ci) => ci.productId === targetP.id);

                              let updatedList: ComboItem[];
                              if (existingIdx >= 0) {
                                updatedList = currentItems.map((ci, idx) =>
                                  idx === existingIdx
                                    ? { ...ci, quantity: ci.quantity + comboAddQuantity }
                                    : ci
                                );
                              } else {
                                updatedList = [
                                  ...currentItems,
                                  {
                                    productId: targetP.id,
                                    productName: targetP.name,
                                    productSku: targetP.sku,
                                    quantity: comboAddQuantity,
                                    unitCost: targetP.costPrice || Math.round(targetP.priceWholesale * 0.72),
                                    unitPriceWholesale: targetP.priceWholesale,
                                  },
                                ];
                              }

                              setProductForm({
                                ...productForm,
                                comboItems: updatedList,
                              });
                              setComboAddProductId('');
                              setComboAddQuantity(1);
                              onTriggerToast('Artículo Vinculado', `${comboAddQuantity}x ${targetP.name} sumado al combo.`);
                            }}
                            className="flex-1 h-8 bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Vincular</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tabla de Artículos en el Combo */}
                    {(productForm.comboItems || []).length > 0 ? (
                      <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-purple-100/70 text-purple-900 font-bold border-b border-purple-200">
                            <tr>
                              <th className="py-1.5 px-2">Artículo</th>
                              <th className="py-1.5 px-2 text-center">Cant.</th>
                              <th className="py-1.5 px-2 text-right">Costo Unit.</th>
                              <th className="py-1.5 px-2 text-right">Subtotal</th>
                              <th className="py-1.5 px-2 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-purple-100">
                            {productForm.comboItems!.map((ci, idx) => {
                              const lineCost = (ci.unitCost || 0) * ci.quantity;
                              return (
                                <tr key={idx} className="hover:bg-purple-50/50">
                                  <td className="py-1.5 px-2 font-medium text-slate-800">
                                    {ci.productName}
                                    <div className="text-[9px] text-slate-400 font-mono">{ci.productSku}</div>
                                  </td>
                                  <td className="py-1.5 px-2 text-center font-bold text-purple-900">
                                    {ci.quantity}u
                                  </td>
                                  <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                                    ${(ci.unitCost || 0).toLocaleString('es-AR')}
                                  </td>
                                  <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-800">
                                    ${lineCost.toLocaleString('es-AR')}
                                  </td>
                                  <td className="py-1.5 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = productForm.comboItems!.filter((_, i) => i !== idx);
                                        setProductForm({ ...productForm, comboItems: updated });
                                      }}
                                      className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
                                      title="Quitar artículo del combo"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>

                        {/* Costo Acumulado Sugerido */}
                        <div className="p-2 bg-purple-50 flex items-center justify-between border-t border-purple-200 text-[11px]">
                          <div>
                            <span className="text-purple-900 font-medium">Costo Total Compra Componentes: </span>
                            <span className="font-mono font-bold text-purple-950">
                              ${productForm.comboItems!.reduce((sum, ci) => sum + (ci.unitCost || 0) * ci.quantity, 0).toLocaleString('es-AR')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const totalCost = productForm.comboItems!.reduce(
                                (sum, ci) => sum + (ci.unitCost || 0) * ci.quantity,
                                0
                              );
                              handleProductCostChange(totalCost);
                              onTriggerToast('Costo Actualizado', `Costo de compra fijado en $${totalCost.toLocaleString('es-AR')}`);
                            }}
                            className="text-[10px] font-bold text-purple-700 bg-white border border-purple-300 hover:bg-purple-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
                          >
                            Usar como Costo del Combo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-center text-purple-600 bg-white/70 py-3 rounded-lg border border-dashed border-purple-300">
                        Aún no has agregado ningún artículo a este combo.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0b1c30] font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold cursor-pointer shadow-xs"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: AJUSTE MASIVO DE PRECIOS (%)                            */}
      {/* ============================================================== */}
      {isPriceAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#00236f] text-white p-4 flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] flex items-center gap-2">
                <LocalIcon name="percent" className="w-5 h-5 text-[#82f5c1]" />
                <span>Ajuste Masivo de Precios</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPriceAdjustModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <LocalIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-[13px]">
              <p className="text-[#64748b]">
                Aplica un incremento o decremento porcentual a los precios y costos de la categoría seleccionada:
              </p>

              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">Rubro / Categoría:</label>
                <select
                  value={priceAdjustCategory}
                  onChange={(e) => setPriceAdjustCategory(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-[#f8f9ff]"
                >
                  <option value="all">Todo el Catálogo General</option>
                  {uniqueCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">Porcentaje a Modificar (%):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={priceAdjustPercent}
                    onChange={(e) => setPriceAdjustPercent(Number(e.target.value))}
                    className="w-28 h-10 px-3 rounded-lg border border-[#cbd5e1] font-mono font-bold text-[16px] text-[#00236f] bg-[#f8f9ff]"
                  />
                  <div className="flex gap-1">
                    {[5, 10, 15, 20].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriceAdjustPercent(p)}
                        className="h-8 px-2 bg-slate-100 hover:bg-slate-200 text-[#0b1c30] text-[11px] font-bold rounded cursor-pointer"
                      >
                        +{p}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[12px]">
                ⚠️ Esta acción actualizará los precios mayoristas en el catálogo central y se reflejará en la próxima sincronización de los preventistas.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setIsPriceAdjustModalOpen(false)}
                  className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyPriceAdjustment}
                  className="h-9 px-5 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold cursor-pointer shadow-xs"
                >
                  Aplicar Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ALTA / EDICIÓN DE CLIENTE                               */}
      {/* ============================================================== */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#00236f] text-white p-4 flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] flex items-center gap-2">
                <LocalIcon name="users" className="w-5 h-5 text-[#82f5c1]" />
                <span>{editingClient ? 'Editar Cliente' : 'Alta de Nuevo Comercio'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <LocalIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-5 space-y-3.5 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Código de Cliente:</label>
                  <input
                    type="text"
                    required
                    value={clientForm.code}
                    onChange={(e) => setClientForm({ ...clientForm, code: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono bg-[#f8f9ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Zona de Reparto:</label>
                  <select
                    value={clientForm.zone}
                    onChange={(e) => setClientForm({ ...clientForm, zone: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-[#f8f9ff]"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">Nombre de Fantasía:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Kiosco Belgrano"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-[#f8f9ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">Razón Social / Titular:</label>
                <input
                  type="text"
                  placeholder="Ej: Roberto Pérez"
                  value={clientForm.businessName}
                  onChange={(e) => setClientForm({ ...clientForm, businessName: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-[#f8f9ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">Dirección del Local:</label>
                <input
                  type="text"
                  required
                  placeholder="Calle 1234, Local 2"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-[#f8f9ff]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">WhatsApp / Teléfono:</label>
                <input
                  type="text"
                  required
                  placeholder="+54 9 11 1234-5678"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono bg-[#f8f9ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Límite de Crédito ($):</label>
                  <input
                    type="number"
                    min="0"
                    value={clientForm.creditLimit}
                    onChange={(e) => setClientForm({ ...clientForm, creditLimit: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono font-bold text-[#00236f] bg-[#f8f9ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Deuda Actual ($):</label>
                  <input
                    type="number"
                    min="0"
                    value={clientForm.currentDebt}
                    onChange={(e) => setClientForm({ ...clientForm, currentDebt: Number(e.target.value) })}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono font-bold text-rose-600 bg-[#f8f9ff]"
                  />
                </div>
              </div>

              {/* HABILITACIÓN PARA ACCESO EN APP MÓVIL */}
              <div className="p-3 rounded-xl border border-[#cbd5e1] bg-[#f8f9ff]">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clientForm.canAccessApp !== false}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, canAccessApp: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#00236f] focus:ring-[#00236f] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#00236f] block text-[13px]">
                      Habilitado para operar en la App Móvil
                    </span>
                    <span className="text-[11px] text-[#64748b] block">
                      Permite al comercio ingresar con su código de cliente y autogestionar pedidos por WhatsApp.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold cursor-pointer shadow-xs"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
