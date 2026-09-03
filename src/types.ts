export type PaymentMethod = 'efectivo' | 'cta_cte' | 'qr' | 'transferencia';

export type GeofenceStatus = 'in_range' | 'nearby' | 'out_of_range';

export type TabType = 'pedidos' | 'catalogo' | 'clientes' | 'saldos' | 'sync';

export type UserRole = 'vendedor' | 'cliente';

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
  vendor?: string;
  zone?: string;
  cashDiscountPercent?: number;
  bankInfo?: BankInfo;
  catalog?: Product[];
  products?: Product[];
  clients?: Client[];
}

export interface AuthSession {
  role: UserRole;
  vendorName?: string;
  vendorId?: string;
  client?: Client;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  presentation: string;
  category: 'Pañales' | 'Perfumería' | 'Golosinas' | 'Almacén' | 'Limpieza' | 'Bebidas';
  priceWholesale: number; // Precio por bulto/caja
  unitType: 'bultos' | 'cajas' | 'packs' | 'unidades';
  unitsPerPack: number;
  stockTruck: number; // Stock físico en el furgón
  stockCentral: number; // Stock en Casa Central
  barcode: string;
  codePrefix: string; // e.g. "5b", "2c", "4c"
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
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  time: string;
  status: 'pending_sync' | 'synced';
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
