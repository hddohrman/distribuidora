export type PaymentMethod = 'efectivo' | 'cta_cte' | 'qr' | 'transferencia';

export type GeofenceStatus = 'in_range' | 'nearby' | 'out_of_range';

export type TabType = 'pedidos' | 'catalogo' | 'clientes' | 'saldos' | 'sync' | 'admin';

export type UserRole = 'vendedor' | 'cliente' | 'admin';

export type WebAdminTab =
  | 'dashboard'
  | 'recepcion_pedidos'
  | 'compras'
  | 'gastos'
  | 'productos'
  | 'clientes'
  | 'rubros_zonas'
  | 'difusion'
  | 'config';

export interface BankInfo {
  alias: string;
  cbu: string;
  bankName: string;
  accountHolder: string;
  cuit: string;
}

export interface CatalogSyncPayload {
  version?: string;
  date?: string;
  generatedAt?: string;
  timestamp?: number;
  senderRole?: string;
  message?: string;
  vendor?: string;
  zone?: string;
  cashDiscountPercent?: number;
  bankInfo?: BankInfo;
  catalog?: Product[];
  products?: Product[];
  clients?: Client[];
  categories?: string[];
  zones?: string[];
  orders?: Order[];
  collections?: PaymentCollection[];
}

export interface AuthSession {
  role: UserRole;
  vendorName?: string;
  vendorId?: string;
  client?: Client;
  adminName?: string;
}

export interface ComboItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number; // Cantidad de unidades/bultos de este producto que componen 1 combo
  unitPrice?: number; // Precio de referencia
}

export interface CompanySettings {
  companyName: string; // Razón Social o Nombre Comercial
  cuit: string;
  address: string;
  city: string;
  headquartersWhatsApp: string; // WhatsApp principal de Casa Central donde se reciben pedidos
  phoneSecondary?: string;
  email?: string;
  businessHours?: string;
  cashDiscountPercent: number; // % de descuento por pago en efectivo
  bankInfo: BankInfo;
  ticketFooterNotes?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  presentation: string;
  category: string;
  priceWholesale: number; // Precio por bulto/caja
  costPrice?: number; // Costo de compra para rentabilidad
  suggestedRetailPrice?: number; // Precio sugerido al público
  unitType: 'bultos' | 'cajas' | 'packs' | 'unidades';
  unitsPerPack: number;
  stockTruck: number; // Stock físico en el furgón
  stockCentral: number; // Stock en Casa Central
  barcode: string;
  codePrefix: string; // e.g. "5b", "2c", "4c"
  imageUrl?: string; // Foto del producto (Data URL base64 o URL remota)
  isOffer?: boolean; // ¿Está en oferta / paquete de promoción?
  offerBadge?: string; // e.g. "Pack Ahorro 15% OFF", "Super Promo 2x1", "Combo Semanal"
  offerPrice?: number; // Precio promocional opcional
  offerDescription?: string; // Detalle del combo o paquete
  isCombo?: boolean; // ¿Es un producto compuesto / combo?
  comboItems?: ComboItem[]; // Lista de artículos incluidos en el combo
  supplierId?: string; // ID del proveedor asignado
  supplierName?: string; // Nombre del proveedor habitual o de origen
  supplierPhone?: string; // WhatsApp / Teléfono del proveedor
}

export interface Supplier {
  id: string;
  name: string; // e.g. "Molinos Río de la Plata"
  contactName?: string; // e.g. "Carlos Martínez (Ventas Mayoristas)"
  phone: string; // WhatsApp de contacto
  cuit?: string;
  email?: string;
  address?: string;
  category?: string; // e.g. "Almacén", "Bebidas", "Limpieza"
  notes?: string;
}

export interface Client {
  id: string;
  code: string;
  name: string;
  businessName: string;
  address: string;
  zone: string;
  phone: string;
  currentDebt: number;
  creditLimit: number;
  geofenceStatus: GeofenceStatus;
  distanceMeters: number;
  status: 'visited' | 'pending' | 'order_taken' | 'no_purchase';
  lastVisit?: string;
  canAccessApp?: boolean; // Habilitado para acceder a la aplicación móvil
  totalOrdersCount?: number; // Cantidad total histórica de compras
  totalSpent?: number; // Total acumulado en compras ($)
}

export interface BasketItem {
  productId: string;
  name: string;
  presentation: string;
  codePrefix: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  date: string;
  time: string;
  type: 'in_situ' | 'preventa' | 'remito';
  status: 'pending_sync' | 'synced';
  items: BasketItem[];
  total: number;
  subtotalOriginal?: number;
  discountAmount?: number;
  discountPercent?: number;
  customAdjustmentType?: 'none' | 'descuento' | 'recargo';
  customAdjustmentAmount?: number;
  customAdjustmentNotes?: string;
  transferProof?: string;
  creditRemaining?: number;
  bultosCount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  remitoNumber?: string;
  digitalSignature?: boolean;
}

export interface PaymentCollection {
  id: string;
  receiptNumber: string;
  clientId: string;
  clientName: string;
  amount: number; // Monto cobrado en mano/transferido
  originalDebtAmount?: number; // Saldo deudor antes de la cobranza
  debtCancelledAmount?: number; // Monto cancelado de la cuenta corriente
  adjustmentType?: 'none' | 'descuento' | 'recargo';
  adjustmentAmount?: number; // Valor del descuento o recargo aplicado
  adjustmentNotes?: string;
  paymentMethod: PaymentMethod;
  date: string;
  time: string;
  status: 'pending_sync' | 'synced';
  notes?: string;
}

export interface SyncBatchInfo {
  batchId: string;
  filename: string;
  generatedAt: string;
  ordersCount: number;
  paymentsCount: number;
  sizeKb: number;
  status: 'ready' | 'syncing' | 'synced';
}

// ---------------------------------------------------------------------------
// COMPRAS A PROVEEDORES & VARIACIÓN DE COSTOS
// ---------------------------------------------------------------------------
export interface PurchaseItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  previousCost: number;
  updateProductCost: boolean;
  updateSellingPrice?: boolean;
  newSellingPrice?: number;
}

export type PurchaseOrderStatus = 'borrador' | 'pedido' | 'ingresado' | 'cancelado';

export interface SupplierPurchase {
  id: string;
  purchaseNumber: string; // e.g. "COM-00104"
  status?: PurchaseOrderStatus; // 'pedido' (pendiente recepción) | 'ingresado' (en stock central) | 'borrador'
  supplierId?: string;
  supplierName: string; // e.g. "Molinos Río de la Plata", "Arcor Mayorista", "Unilever"
  supplierContact?: string; // Nombre del preventista/contacto
  supplierPhone?: string; // WhatsApp para envío de pedidos
  supplierCuit?: string;
  invoiceNumber: string; // e.g. "FC-A 0004-00012938" o número de remito/pedido
  date: string; // YYYY-MM-DD
  items: PurchaseItem[];
  total: number;
  paymentStatus: 'pagado' | 'pendiente' | 'cuenta_corriente';
  paymentMethod: 'transferencia' | 'efectivo' | 'cheque' | 'cta_cte';
  notes?: string;
  costVariationsDetectedCount?: number;
  receivedAt?: string; // Fecha de confirmación e ingreso a depósito
}

// ---------------------------------------------------------------------------
// GASTOS OPERATIVOS Y COSTOS FIJOS
// ---------------------------------------------------------------------------
export type ExpenseCategory =
  | 'alquiler'
  | 'sueldos'
  | 'combustible'
  | 'servicios'
  | 'impuestos'
  | 'mantenimiento'
  | 'fletes'
  | 'seguros'
  | 'otros';

export type ExpenseType = 'fijo' | 'variable';

export interface OperatingExpense {
  id: string;
  expenseNumber: string; // e.g. "GAS-0045"
  title: string;
  category: ExpenseCategory;
  type: ExpenseType; // Costo Fijo vs Costo Variable
  amount: number;
  date: string; // YYYY-MM-DD
  dueDate?: string;
  paymentMethod: 'transferencia' | 'efectivo' | 'debito_automatico' | 'cheque';
  status: 'pagado' | 'pendiente';
  supplierOrBeneficiary?: string;
  notes?: string;
}
