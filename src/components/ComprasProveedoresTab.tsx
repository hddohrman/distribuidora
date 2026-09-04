import React, { useState, useMemo } from 'react';
import {
  PackagePlus,
  AlertTriangle,
  Search,
  Plus,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  TrendingUp,
  TrendingDown,
  Info,
  DollarSign,
  Boxes,
  Truck,
  FileText,
  X,
  Sparkles,
  MessageCircle,
  Send,
  Edit3,
  Check,
  Copy,
  Phone,
  UserCheck,
  UserPlus,
  ReceiptText,
  Layers,
  Store,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { Product, SupplierPurchase, PurchaseItem, Supplier, PurchaseOrderStatus } from '../types';

interface ComprasProveedoresTabProps {
  products: Product[];
  purchases: SupplierPurchase[];
  suppliers?: Supplier[];
  onUpdatePurchases: (purchases: SupplierPurchase[]) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateSuppliers?: (suppliers: Supplier[]) => void;
  onTriggerToast: (title: string, message: string) => void;
}

export const ComprasProveedoresTab: React.FC<ComprasProveedoresTabProps> = ({
  products,
  purchases,
  suppliers = [],
  onUpdatePurchases,
  onUpdateProducts,
  onUpdateSuppliers,
  onTriggerToast,
}) => {
  // Navigation between Orders view and Suppliers Directory view
  const [activeSubtab, setActiveSubtab] = useState<'ordenes' | 'agenda'>('ordenes');

  // Filters for Orders
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, pedido, ingresado, pendiente_pago
  const [filterSupplier, setFilterSupplier] = useState<string>('all');

  // Modals state
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [isConfirmReceiptModalOpen, setIsConfirmReceiptModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<SupplierPurchase | null>(null);

  // Targets for specific modals
  const [orderToEdit, setOrderToEdit] = useState<SupplierPurchase | null>(null);
  const [orderToConfirm, setOrderToConfirm] = useState<SupplierPurchase | null>(null);
  const [orderForWhatsApp, setOrderForWhatsApp] = useState<SupplierPurchase | null>(null);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  // WhatsApp Message State
  const [customWhatsAppPhone, setCustomWhatsAppPhone] = useState('');
  const [whatsAppCopied, setWhatsAppCopied] = useState(false);

  // -------------------------------------------------------------------------
  // 1. NEW / DRAFT ORDER FORM STATE
  // -------------------------------------------------------------------------
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierCuit, setSupplierCuit] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'transferencia' | 'efectivo' | 'cheque' | 'cta_cte'>('transferencia');
  const [paymentStatus, setPaymentStatus] = useState<'pagado' | 'pendiente' | 'cuenta_corriente'>('pendiente');
  const [purchaseNotes, setPurchaseNotes] = useState('');

  // Items in the current order being drafted
  const [draftItems, setDraftItems] = useState<PurchaseItem[]>([]);

  // Item selector inside draft
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState<number>(10);
  const [itemUnitCost, setItemUnitCost] = useState<number>(() => {
    const prod = products[0];
    return prod?.costPrice || Math.round((prod?.priceWholesale || 1000) * 0.7);
  });
  const [updateProductCostCheckbox, setUpdateProductCostCheckbox] = useState<boolean>(true);
  const [updateSellingPriceCheckbox, setUpdateSellingPriceCheckbox] = useState<boolean>(false);

  // When selected product changes in draft selector, show its current cost and update unit cost input
  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      const curCost = prod.costPrice || Math.round(prod.priceWholesale * 0.7);
      setItemUnitCost(curCost);
      setUpdateProductCostCheckbox(true);
      setUpdateSellingPriceCheckbox(false);
    }
  };

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const currentCost = selectedProduct?.costPrice || Math.round((selectedProduct?.priceWholesale || 1000) * 0.7);
  const costDifference = itemUnitCost - currentCost;
  const hasCostVariation = Math.abs(costDifference) > 0.01;
  const percentVariation = currentCost > 0 ? ((costDifference / currentCost) * 100).toFixed(1) : '0';

  const currentMarginPercent =
    currentCost > 0 && selectedProduct
      ? ((selectedProduct.priceWholesale - currentCost) / currentCost) * 100
      : 30;

  const suggestedNewSellingPrice = Math.round(itemUnitCost * (1 + currentMarginPercent / 100));

  // Handle supplier change in draft order form
  const handleSupplierChange = (supIdOrName: string) => {
    const matched = suppliers.find((s) => s.id === supIdOrName || s.name === supIdOrName);
    if (matched) {
      setSelectedSupplierId(matched.id);
      setSupplierName(matched.name);
      setSupplierContact(matched.contactName || '');
      setSupplierPhone(matched.phone || '');
      setSupplierCuit(matched.cuit || '');
    } else {
      setSelectedSupplierId('');
      setSupplierName(supIdOrName === '__custom__' ? '' : supIdOrName);
      setSupplierContact('');
      setSupplierPhone('');
      setSupplierCuit('');
    }
  };

  // Add item to draft list
  const handleAddDraftItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || itemQuantity <= 0 || itemUnitCost <= 0) {
      alert('Por favor indica una cantidad válida y costo mayor a cero.');
      return;
    }

    const newItem: PurchaseItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      quantity: Number(itemQuantity),
      unitCost: Number(itemUnitCost),
      subtotal: Number(itemQuantity) * Number(itemUnitCost),
      previousCost: currentCost,
      updateProductCost: hasCostVariation ? updateProductCostCheckbox : false,
      updateSellingPrice: hasCostVariation && updateProductCostCheckbox ? updateSellingPriceCheckbox : false,
      newSellingPrice: suggestedNewSellingPrice,
    };

    setDraftItems((prev) => [...prev, newItem]);
    setItemQuantity(10);
    onTriggerToast('Artículo Agregado', `${selectedProduct.name} (${itemQuantity} bultos) agregado al pedido.`);
  };

  const handleRemoveDraftItem = (index: number) => {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  };

  const draftTotal = useMemo(() => {
    return draftItems.reduce((acc, item) => acc + item.subtotal, 0);
  }, [draftItems]);

  // Open modal to create order
  const handleOpenNewOrderModal = (preselectedSupplier?: Supplier) => {
    if (preselectedSupplier) {
      setSelectedSupplierId(preselectedSupplier.id);
      setSupplierName(preselectedSupplier.name);
      setSupplierContact(preselectedSupplier.contactName || '');
      setSupplierPhone(preselectedSupplier.phone || '');
      setSupplierCuit(preselectedSupplier.cuit || '');
    } else if (suppliers.length > 0) {
      setSelectedSupplierId(suppliers[0].id);
      setSupplierName(suppliers[0].name);
      setSupplierContact(suppliers[0].contactName || '');
      setSupplierPhone(suppliers[0].phone || '');
      setSupplierCuit(suppliers[0].cuit || '');
    } else {
      setSelectedSupplierId('');
      setSupplierName('');
      setSupplierContact('');
      setSupplierPhone('');
      setSupplierCuit('');
    }

    setInvoiceNumber(`PED-${Date.now().toString().slice(-4)}`);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('transferencia');
    setPaymentStatus('pendiente');
    setPurchaseNotes('');
    setDraftItems([]);

    if (products.length > 0) {
      setSelectedProductId(products[0].id);
      setItemQuantity(10);
      setItemUnitCost(products[0].costPrice || Math.round(products[0].priceWholesale * 0.7));
    }

    setIsNewOrderModalOpen(true);
  };

  // Save new order with either status 'pedido' (pending receipt) or 'ingresado' (received directly)
  const handleSaveOrder = (targetStatus: PurchaseOrderStatus) => {
    if (!supplierName.trim()) {
      alert('Por favor selecciona o ingresa el nombre del proveedor.');
      return;
    }
    if (draftItems.length === 0) {
      alert('Debes agregar al menos un artículo al pedido.');
      return;
    }

    const costVariationsCount = draftItems.filter(
      (it) => Math.abs(it.unitCost - it.previousCost) > 0.01
    ).length;

    const newPurchaseNumber =
      targetStatus === 'pedido'
        ? `ORD-${String(purchases.length + 101).padStart(5, '0')}`
        : `COM-${String(purchases.length + 101).padStart(5, '0')}`;

    const newPurchase: SupplierPurchase = {
      id: `pur-${Date.now()}`,
      purchaseNumber: newPurchaseNumber,
      status: targetStatus,
      supplierId: selectedSupplierId || undefined,
      supplierName: supplierName.trim(),
      supplierContact: supplierContact.trim() || undefined,
      supplierPhone: supplierPhone.trim() || undefined,
      supplierCuit: supplierCuit.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || `PED-${Date.now().toString().slice(-4)}`,
      date: purchaseDate,
      items: draftItems,
      total: draftTotal,
      paymentStatus: targetStatus === 'pedido' ? 'pendiente' : paymentStatus,
      paymentMethod,
      notes: purchaseNotes.trim() || undefined,
      costVariationsDetectedCount: costVariationsCount,
      receivedAt: targetStatus === 'ingresado' ? new Date().toISOString().split('T')[0] : undefined,
    };

    // If targetStatus === 'ingresado', increment stock central and update costs
    if (targetStatus === 'ingresado') {
      const updatedProducts = products.map((prod) => {
        const purchaseItem = draftItems.find((it) => it.productId === prod.id);
        if (!purchaseItem) return prod;

        const newStock = prod.stockCentral + purchaseItem.quantity;
        let newCost = prod.costPrice;
        let newPrice = prod.priceWholesale;

        if (purchaseItem.updateProductCost) {
          newCost = purchaseItem.unitCost;
        }
        if (purchaseItem.updateSellingPrice && purchaseItem.newSellingPrice) {
          newPrice = purchaseItem.newSellingPrice;
        }

        return {
          ...prod,
          stockCentral: newStock,
          costPrice: newCost,
          priceWholesale: newPrice,
          supplierId: selectedSupplierId || prod.supplierId,
          supplierName: supplierName.trim() || prod.supplierName,
          supplierPhone: supplierPhone.trim() || prod.supplierPhone,
        };
      });
      onUpdateProducts(updatedProducts);
    }

    onUpdatePurchases([newPurchase, ...purchases]);
    setIsNewOrderModalOpen(false);

    if (targetStatus === 'pedido') {
      onTriggerToast(
        'Pedido a Proveedor Creado',
        `${newPurchase.purchaseNumber} registrado. Ya puedes enviarlo por WhatsApp al proveedor.`
      );
      // Auto open WhatsApp modal for convenience
      handleOpenWhatsAppModal(newPurchase);
    } else {
      onTriggerToast(
        'Compra Ingresada a Stock',
        `${newPurchase.purchaseNumber} ingresada al Depósito Central con éxito.`
      );
    }
  };

  // -------------------------------------------------------------------------
  // 2. EDIT / MODIFY PENDING ORDER WORKFLOW
  // -------------------------------------------------------------------------
  const [editOrderItems, setEditOrderItems] = useState<PurchaseItem[]>([]);
  const [editOrderNotes, setEditOrderNotes] = useState<string>('');
  const [editOrderInvoice, setEditOrderInvoice] = useState<string>('');
  const [editOrderSupplierContact, setEditOrderSupplierContact] = useState<string>('');
  const [editOrderSupplierPhone, setEditOrderSupplierPhone] = useState<string>('');

  // New item selector in edit modal
  const [editAddProductId, setEditAddProductId] = useState<string>(products[0]?.id || '');
  const [editAddQty, setEditAddQty] = useState<number>(10);
  const [editAddUnitCost, setEditAddUnitCost] = useState<number>(() => {
    return products[0]?.costPrice || Math.round((products[0]?.priceWholesale || 1000) * 0.7);
  });

  const handleOpenEditOrderModal = (order: SupplierPurchase) => {
    setOrderToEdit(order);
    setEditOrderItems([...order.items]);
    setEditOrderNotes(order.notes || '');
    setEditOrderInvoice(order.invoiceNumber || '');
    setEditOrderSupplierContact(order.supplierContact || '');
    setEditOrderSupplierPhone(order.supplierPhone || '');

    if (products.length > 0) {
      setEditAddProductId(products[0].id);
      setEditAddQty(10);
      setEditAddUnitCost(products[0].costPrice || Math.round(products[0].priceWholesale * 0.7));
    }

    setIsEditOrderModalOpen(true);
  };

  const handleSelectProductInEdit = (prodId: string) => {
    setEditAddProductId(prodId);
    const p = products.find((x) => x.id === prodId);
    if (p) {
      setEditAddUnitCost(p.costPrice || Math.round(p.priceWholesale * 0.7));
    }
  };

  const handleAddItemToEditOrder = () => {
    const p = products.find((x) => x.id === editAddProductId);
    if (!p || editAddQty <= 0 || editAddUnitCost <= 0) {
      alert('Ingresa una cantidad y costo válidos.');
      return;
    }

    const curCost = p.costPrice || Math.round(p.priceWholesale * 0.7);
    const existingIndex = editOrderItems.findIndex((it) => it.productId === p.id);

    if (existingIndex >= 0) {
      // update existing
      const updated = [...editOrderItems];
      updated[existingIndex].quantity += Number(editAddQty);
      updated[existingIndex].unitCost = Number(editAddUnitCost);
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unitCost;
      setEditOrderItems(updated);
    } else {
      const newItem: PurchaseItem = {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        quantity: Number(editAddQty),
        unitCost: Number(editAddUnitCost),
        subtotal: Number(editAddQty) * Number(editAddUnitCost),
        previousCost: curCost,
        updateProductCost: true,
        updateSellingPrice: false,
      };
      setEditOrderItems([...editOrderItems, newItem]);
    }

    setEditAddQty(10);
    onTriggerToast('Artículo Agregado', `${p.name} sumado a la orden.`);
  };

  const handleUpdateItemInEditOrder = (index: number, field: 'quantity' | 'unitCost', value: number) => {
    setEditOrderItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };
      if (field === 'quantity') {
        target.quantity = Math.max(1, value);
      } else if (field === 'unitCost') {
        target.unitCost = Math.max(0, value);
      }
      target.subtotal = target.quantity * target.unitCost;
      copy[index] = target;
      return copy;
    });
  };

  const handleRemoveItemFromEditOrder = (index: number) => {
    setEditOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveModifiedOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToEdit) return;
    if (editOrderItems.length === 0) {
      alert('El pedido debe tener al menos un artículo.');
      return;
    }

    const newTotal = editOrderItems.reduce((acc, it) => acc + it.subtotal, 0);
    const variationsCount = editOrderItems.filter(
      (it) => Math.abs(it.unitCost - it.previousCost) > 0.01
    ).length;

    const updatedPurchases = purchases.map((p) => {
      if (p.id === orderToEdit.id) {
        return {
          ...p,
          items: editOrderItems,
          total: newTotal,
          notes: editOrderNotes.trim() || undefined,
          invoiceNumber: editOrderInvoice.trim() || p.invoiceNumber,
          supplierContact: editOrderSupplierContact.trim() || p.supplierContact,
          supplierPhone: editOrderSupplierPhone.trim() || p.supplierPhone,
          costVariationsDetectedCount: variationsCount,
        };
      }
      return p;
    });

    onUpdatePurchases(updatedPurchases);
    setIsEditOrderModalOpen(false);
    onTriggerToast('Pedido Actualizado', `Cambios en ${orderToEdit.purchaseNumber} guardados.`);
  };

  // -------------------------------------------------------------------------
  // 3. CONFIRM & RECEIVE INTO CENTRAL STOCK WORKFLOW
  // -------------------------------------------------------------------------
  const [confirmInvoiceNum, setConfirmInvoiceNum] = useState('');
  const [confirmPaymentStatus, setConfirmPaymentStatus] = useState<'pagado' | 'cuenta_corriente' | 'pendiente'>('pagado');
  const [confirmPaymentMethod, setConfirmPaymentMethod] = useState<'transferencia' | 'efectivo' | 'cheque' | 'cta_cte'>('transferencia');
  const [confirmUpdateCosts, setConfirmUpdateCosts] = useState<Record<string, boolean>>({});
  const [confirmUpdatePrices, setConfirmUpdatePrices] = useState<Record<string, boolean>>({});

  const handleOpenConfirmReceiptModal = (order: SupplierPurchase) => {
    setOrderToConfirm(order);
    setConfirmInvoiceNum(order.invoiceNumber.startsWith('PED-') ? `FC-A ${Date.now().toString().slice(-4)}` : order.invoiceNumber);
    setConfirmPaymentStatus(order.paymentStatus || 'pagado');
    setConfirmPaymentMethod(order.paymentMethod || 'transferencia');

    // Default cost updates to true for all items that have variation
    const initialCostUpdates: Record<string, boolean> = {};
    const initialPriceUpdates: Record<string, boolean> = {};
    order.items.forEach((it) => {
      const hasVar = Math.abs(it.unitCost - it.previousCost) > 0.01;
      initialCostUpdates[it.productId] = hasVar;
      initialPriceUpdates[it.productId] = false;
    });
    setConfirmUpdateCosts(initialCostUpdates);
    setConfirmUpdatePrices(initialPriceUpdates);

    setIsConfirmReceiptModalOpen(true);
  };

  const handleConfirmReceipt = () => {
    if (!orderToConfirm) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Increment central stock for each item and optionally update costPrice and priceWholesale
    const updatedProducts = products.map((prod) => {
      const item = orderToConfirm.items.find((it) => it.productId === prod.id);
      if (!item) return prod;

      const newStock = prod.stockCentral + item.quantity;
      let newCost = prod.costPrice;
      let newPrice = prod.priceWholesale;

      if (confirmUpdateCosts[item.productId]) {
        newCost = item.unitCost;
      }
      if (confirmUpdatePrices[item.productId]) {
        const curMargin = prod.costPrice && prod.costPrice > 0
          ? (prod.priceWholesale - prod.costPrice) / prod.costPrice
          : 0.3;
        newPrice = Math.round(item.unitCost * (1 + curMargin));
      }

      return {
        ...prod,
        stockCentral: newStock,
        costPrice: newCost,
        priceWholesale: newPrice,
        supplierId: orderToConfirm.supplierId || prod.supplierId,
        supplierName: orderToConfirm.supplierName || prod.supplierName,
        supplierPhone: orderToConfirm.supplierPhone || prod.supplierPhone,
      };
    });

    // 2. Update order status to 'ingresado'
    const updatedPurchases = purchases.map((p) => {
      if (p.id === orderToConfirm.id) {
        return {
          ...p,
          status: 'ingresado' as PurchaseOrderStatus,
          invoiceNumber: confirmInvoiceNum.trim() || p.invoiceNumber,
          paymentStatus: confirmPaymentStatus,
          paymentMethod: confirmPaymentMethod,
          receivedAt: todayStr,
        };
      }
      return p;
    });

    onUpdateProducts(updatedProducts);
    onUpdatePurchases(updatedPurchases);
    setIsConfirmReceiptModalOpen(false);

    const totalQty = orderToConfirm.items.reduce((acc, it) => acc + it.quantity, 0);
    onTriggerToast(
      'Mercadería Ingresada a Stock',
      `¡${totalQty} bultos ingresados al Depósito Central! Stock y costos sincronizados.`
    );
  };

  // -------------------------------------------------------------------------
  // 4. WHATSAPP SEND ORDER WORKFLOW
  // -------------------------------------------------------------------------
  const handleOpenWhatsAppModal = (order: SupplierPurchase) => {
    setOrderForWhatsApp(order);
    setCustomWhatsAppPhone(order.supplierPhone || '');
    setWhatsAppCopied(false);
    setIsWhatsAppModalOpen(true);
  };

  // Build formatted WhatsApp message
  const whatsAppMessage = useMemo(() => {
    if (!orderForWhatsApp) return '';

    const lines: string[] = [];
    lines.push(`📦 *PEDIDO DE MERCADERÍA - DISTRIPRO MAYORISTA*`);
    lines.push(`📋 *Orden N°:* ${orderForWhatsApp.purchaseNumber}`);
    lines.push(`🏢 *Proveedor:* ${orderForWhatsApp.supplierName}`);
    if (orderForWhatsApp.supplierContact) {
      lines.push(`👤 *Atención:* ${orderForWhatsApp.supplierContact}`);
    }
    lines.push(`📅 *Fecha:* ${orderForWhatsApp.date}`);
    lines.push(``);
    lines.push(`Hola, te enviamos el detalle de los artículos para nuestro pedido:`);
    lines.push(``);
    lines.push(`*DETALLE DE ARTÍCULOS:*`);

    orderForWhatsApp.items.forEach((it, idx) => {
      lines.push(
        `${idx + 1}. *${it.quantity} bultos* x ${it.productName} (SKU: ${it.sku}) - Costo ref: $${it.unitCost.toLocaleString('es-AR')}`
      );
    });

    lines.push(``);
    lines.push(`💰 *Total Estimado:* $${orderForWhatsApp.total.toLocaleString('es-AR')}`);
    if (orderForWhatsApp.notes) {
      lines.push(`📝 *Observaciones:* ${orderForWhatsApp.notes}`);
    }
    lines.push(``);
    lines.push(`Por favor confirmanos recepción del pedido, fecha de entrega y precios finales.`);
    lines.push(`¡Muchas gracias!`);

    return lines.join('\n');
  }, [orderForWhatsApp]);

  const handleCopyWhatsAppMessage = () => {
    navigator.clipboard.writeText(whatsAppMessage);
    setWhatsAppCopied(true);
    setTimeout(() => setWhatsAppCopied(false), 3000);
    onTriggerToast('Mensaje Copiado', 'Texto del pedido copiado al portapapeles.');
  };

  const handleSendWhatsAppWeb = () => {
    const rawPhone = customWhatsAppPhone || orderForWhatsApp?.supplierPhone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

    const encoded = encodeURIComponent(whatsAppMessage);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  // -------------------------------------------------------------------------
  // 5. SUPPLIERS DIRECTORY (AGENDA) CRUD
  // -------------------------------------------------------------------------
  const [supplierForm, setSupplierForm] = useState<{
    id?: string;
    name: string;
    contactName: string;
    phone: string;
    cuit: string;
    email: string;
    address: string;
    category: string;
    notes: string;
  }>({
    name: '',
    contactName: '',
    phone: '',
    cuit: '',
    email: '',
    address: '',
    category: 'Almacén',
    notes: '',
  });

  const handleOpenAddSupplier = () => {
    setSupplierToEdit(null);
    setSupplierForm({
      name: '',
      contactName: '',
      phone: '+54 9 387 ',
      cuit: '',
      email: '',
      address: '',
      category: 'Almacén',
      notes: '',
    });
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (sup: Supplier) => {
    setSupplierToEdit(sup);
    setSupplierForm({
      id: sup.id,
      name: sup.name,
      contactName: sup.contactName || '',
      phone: sup.phone,
      cuit: sup.cuit || '',
      email: sup.email || '',
      address: sup.address || '',
      category: sup.category || 'Almacén',
      notes: sup.notes || '',
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim() || !supplierForm.phone.trim()) {
      alert('Por favor ingresa el nombre de la empresa y número de WhatsApp.');
      return;
    }

    if (supplierToEdit) {
      const updated = suppliers.map((s) =>
        s.id === supplierToEdit.id
          ? {
              ...s,
              name: supplierForm.name.trim(),
              contactName: supplierForm.contactName.trim() || undefined,
              phone: supplierForm.phone.trim(),
              cuit: supplierForm.cuit.trim() || undefined,
              email: supplierForm.email.trim() || undefined,
              address: supplierForm.address.trim() || undefined,
              category: supplierForm.category,
              notes: supplierForm.notes.trim() || undefined,
            }
          : s
      );
      if (onUpdateSuppliers) onUpdateSuppliers(updated);
      onTriggerToast('Proveedor Actualizado', `${supplierForm.name} modificado con éxito.`);
    } else {
      const newSup: Supplier = {
        id: `sup-${Date.now().toString().slice(-4)}`,
        name: supplierForm.name.trim(),
        contactName: supplierForm.contactName.trim() || undefined,
        phone: supplierForm.phone.trim(),
        cuit: supplierForm.cuit.trim() || undefined,
        email: supplierForm.email.trim() || undefined,
        address: supplierForm.address.trim() || undefined,
        category: supplierForm.category,
        notes: supplierForm.notes.trim() || undefined,
      };
      if (onUpdateSuppliers) onUpdateSuppliers([...suppliers, newSup]);
      onTriggerToast('Proveedor Guardado', `${newSup.name} agregado a la agenda de WhatsApp.`);
    }

    setIsSupplierModalOpen(false);
  };

  const handleDeleteSupplier = (supId: string, supName: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${supName} de la agenda de proveedores?`)) {
      if (onUpdateSuppliers) {
        onUpdateSuppliers(suppliers.filter((s) => s.id !== supId));
      }
      onTriggerToast('Proveedor Eliminado', `${supName} fue retirado de la agenda.`);
    }
  };

  const handleDeletePurchase = (purchaseId: string, purchaseNumber: string) => {
    if (confirm(`¿Estás seguro de eliminar el registro de orden/compra ${purchaseNumber}?`)) {
      onUpdatePurchases(purchases.filter((p) => p.id !== purchaseId));
      onTriggerToast('Registro Eliminado', `Orden ${purchaseNumber} eliminada.`);
      if (selectedOrderDetails?.id === purchaseId) {
        setSelectedOrderDetails(null);
      }
    }
  };

  // -------------------------------------------------------------------------
  // FILTERED DATA & SUMMARY METRICS
  // -------------------------------------------------------------------------
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch =
        p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.items.some((it) => it.productName.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchStatus = true;
      if (filterStatus === 'pedido') {
        matchStatus = p.status === 'pedido' || (!p.status && p.paymentStatus === 'pendiente');
      } else if (filterStatus === 'ingresado') {
        matchStatus = p.status === 'ingresado' || (!p.status && p.paymentStatus !== 'pendiente');
      } else if (filterStatus === 'cuenta_corriente') {
        matchStatus = p.paymentStatus === 'cuenta_corriente';
      }

      const matchSupplier = filterSupplier === 'all' || p.supplierName === filterSupplier;

      return matchSearch && matchStatus && matchSupplier;
    });
  }, [purchases, searchTerm, filterStatus, filterSupplier]);

  const metrics = useMemo(() => {
    const totalAmount = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
    const pendingOrders = purchases.filter((p) => p.status === 'pedido');
    const pendingOrdersCount = pendingOrders.length;
    const pendingOrdersAmount = pendingOrders.reduce((sum, p) => sum + (p.total || 0), 0);

    const receivedOrders = purchases.filter((p) => p.status === 'ingresado');
    const totalBultosIngresados = receivedOrders.reduce(
      (sum, p) => sum + p.items.reduce((isum, it) => isum + it.quantity, 0),
      0
    );

    const totalVariations = purchases.reduce(
      (sum, p) => sum + (p.costVariationsDetectedCount || 0),
      0
    );

    return {
      totalAmount,
      pendingOrdersCount,
      pendingOrdersAmount,
      totalBultosIngresados,
      totalVariations,
    };
  }, [purchases]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* TOP HEADER & NAVIGATION SUBTABS                                */}
      {/* ============================================================== */}
      <div className="bg-white p-5 rounded-2xl border border-[#cbd5e1] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[22px] text-[#00236f] flex items-center gap-2.5">
              <PackagePlus className="w-6 h-6 text-[#00236f]" />
              <span>Compras, Pedidos a Proveedores & Contactos WhatsApp</span>
            </h2>
            <p className="text-[13px] text-[#64748b] mt-1">
              Arma pedidos con artículos y cantidades, visualiza costos en vivo, modifica precios y envíalos directo por WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleOpenNewOrderModal()}
              className="px-4 py-2.5 bg-[#00236f] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-[#00174a] transition-all shadow-md active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#82f5c1]" />
              <span>Nuevo Pedido / Compra</span>
            </button>
            <button
              onClick={handleOpenAddSupplier}
              className="px-3.5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-[13px] flex items-center gap-2 hover:bg-emerald-100 transition-all active:scale-98"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>+ Proveedor WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Subtab Toggle Buttons */}
        <div className="flex items-center gap-2 mt-5 border-t border-slate-100 pt-4">
          <button
            onClick={() => setActiveSubtab('ordenes')}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${
              activeSubtab === 'ordenes'
                ? 'bg-[#eff4ff] text-[#00236f] border border-[#dce9ff]'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Órdenes & Compras ({purchases.length})</span>
            {metrics.pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-amber-100 text-amber-900 border border-amber-300">
                {metrics.pendingOrdersCount} pendientes
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubtab('agenda')}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${
              activeSubtab === 'agenda'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Agenda de Proveedores (WhatsApp) ({suppliers.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUBTAB 1: ÓRDENES Y COMPRAS A PROVEEDORES                      */}
      {/* ============================================================== */}
      {activeSubtab === 'ordenes' && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Compras */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#cbd5e1] shadow-xs">
              <div className="flex items-center justify-between text-[#64748b] text-[12px] font-semibold">
                <span>Total Compras Acumuladas</span>
                <div className="p-2 bg-blue-50 text-[#00236f] rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 font-mono font-black text-[22px] text-[#00236f]">
                ${metrics.totalAmount.toLocaleString('es-AR')}
              </div>
              <span className="text-[11px] text-[#64748b]">
                {purchases.length} órdenes registradas
              </span>
            </div>

            {/* Pedidos Pendientes de Entrega */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#cbd5e1] shadow-xs">
              <div className="flex items-center justify-between text-[#64748b] text-[12px] font-semibold">
                <span>Pedidos Pendientes de Entrega</span>
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 font-mono font-black text-[22px] text-amber-700 flex items-center gap-2">
                <span>{metrics.pendingOrdersCount}</span>
                <span className="text-[12px] font-sans font-bold text-slate-500">
                  (${metrics.pendingOrdersAmount.toLocaleString('es-AR')})
                </span>
              </div>
              <span className="text-[11px] text-amber-800 font-medium">
                Enviados por WhatsApp, por ingresar
              </span>
            </div>

            {/* Bultos Ingresados a Depósito */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#cbd5e1] shadow-xs">
              <div className="flex items-center justify-between text-[#64748b] text-[12px] font-semibold">
                <span>Bultos Ingresados a Stock</span>
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Boxes className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 font-mono font-black text-[22px] text-emerald-700">
                {metrics.totalBultosIngresados.toLocaleString('es-AR')} bultos
              </div>
              <span className="text-[11px] text-[#64748b]">
                En depósito central disponible
              </span>
            </div>

            {/* Alarmas de Variación de Costos */}
            <div className="bg-amber-50/70 p-4.5 rounded-2xl border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between text-amber-900 text-[12px] font-bold">
                <span>Alarmas de Costo</span>
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 font-mono font-black text-[22px] text-amber-700 flex items-center gap-2">
                <span>{metrics.totalVariations}</span>
                {metrics.totalVariations > 0 && (
                  <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Cambios detectados
                  </span>
                )}
              </div>
              <span className="text-[11px] text-amber-800/80">
                Aumentos o bajas en cotización
              </span>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-[#cbd5e1] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por orden, proveedor, factura o artículo..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] font-medium focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                >
                  <option value="all">Todos los Estados ({purchases.length})</option>
                  <option value="pedido">⏳ Pedidos Pendientes de Recepción</option>
                  <option value="ingresado">✓ Ingresados a Stock Central</option>
                  <option value="cuenta_corriente">En Cuenta Corriente</option>
                </select>
              </div>

              <div>
                <select
                  value={filterSupplier}
                  onChange={(e) => setFilterSupplier(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] font-medium focus:outline-none focus:ring-2 focus:ring-[#00236f]"
                >
                  <option value="all">Todos los Proveedores</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">N° Orden / Compra</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Proveedor / Contacto WhatsApp</th>
                    <th className="py-3 px-4 text-center">Artículos & Bultos</th>
                    <th className="py-3 px-4 text-right">Total Estimado / Factura</th>
                    <th className="py-3 px-4 text-center">Variación Costos</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#64748b]">
                        <PackagePlus className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-[14px] text-[#0b1c30]">No se encontraron órdenes</p>
                        <p className="text-[12px]">Presiona "Nuevo Pedido / Compra" para generar un pedido a proveedor.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((purchase) => {
                      const isPending = purchase.status === 'pedido';
                      const isReceived = purchase.status === 'ingresado';
                      const hasVariations = (purchase.costVariationsDetectedCount || 0) > 0;
                      const totalItemsQty = purchase.items.reduce((acc, it) => acc + it.quantity, 0);

                      return (
                        <tr key={purchase.id} className="hover:bg-[#f8f9ff] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#00236f]">
                            {purchase.purchaseNumber}
                            <div className="text-[10px] text-slate-400 font-sans font-normal">
                              Ref: {purchase.invoiceNumber}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                                <span>Pedido en Curso</span>
                              </span>
                            ) : isReceived ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>En Stock Central</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                                <span>Registrado</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-[#64748b] font-mono text-[12px]">
                            {purchase.date}
                            {purchase.receivedAt && (
                              <div className="text-[10px] text-emerald-700 font-sans">
                                Recibido: {purchase.receivedAt}
                              </div>
                            )}
                          </td>

                          {/* Supplier & WhatsApp */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0b1c30]">{purchase.supplierName}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {purchase.supplierContact && (
                                <span className="text-[11px] text-slate-500">
                                  {purchase.supplierContact}
                                </span>
                              )}
                              {purchase.supplierPhone && (
                                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  📱 {purchase.supplierPhone}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Items & Bultos */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-[#00236f] text-[12px]">
                              {purchase.items.length} {purchase.items.length === 1 ? 'artículo' : 'artículos'}
                            </span>
                            <div className="text-[11px] text-[#64748b]">
                              ({totalItemsQty} bultos totales)
                            </div>
                          </td>

                          {/* Total */}
                          <td className="py-3.5 px-4 text-right font-mono font-black text-[#00236f] text-[14px]">
                            ${(purchase.total || 0).toLocaleString('es-AR')}
                          </td>

                          {/* Variations */}
                          <td className="py-3.5 px-4 text-center">
                            {hasVariations ? (
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>{purchase.costVariationsDetectedCount} Variaciones</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Sin variación</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* WhatsApp Share Button */}
                              <button
                                onClick={() => handleOpenWhatsAppModal(purchase)}
                                className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-300"
                                title="Enviar o Reenviar pedido por WhatsApp al proveedor"
                              >
                                <MessageCircle className="w-4 h-4 text-emerald-600" />
                              </button>

                              {/* If pending order: Edit & Confirm Buttons */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleOpenEditOrderModal(purchase)}
                                    className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                    title="Modificar artículos o precios del pedido"
                                  >
                                    <Edit3 className="w-4 h-4 text-blue-600" />
                                  </button>

                                  <button
                                    onClick={() => handleOpenConfirmReceiptModal(purchase)}
                                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                                    title="Confirmar recepción e ingresar al stock de Casa Central"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Ingresar a Stock</span>
                                  </button>
                                </>
                              )}

                              {/* Detail Modal */}
                              <button
                                onClick={() => setSelectedOrderDetails(purchase)}
                                className="p-1.5 text-slate-600 hover:text-[#00236f] hover:bg-slate-100 rounded-lg transition-colors"
                                title="Ver comprobante y detalle"
                              >
                                <FileText className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeletePurchase(purchase.id, purchase.purchaseNumber)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* SUBTAB 2: AGENDA DE PROVEEDORES (WHATSAPP)                     */}
      {/* ============================================================== */}
      {activeSubtab === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#cbd5e1] shadow-xs">
            <div>
              <h3 className="font-bold text-[#00236f] text-[15px] flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <span>Directorio de Proveedores con WhatsApp</span>
              </h3>
              <p className="text-[12px] text-slate-500">
                Guarda los contactos de tus proveedores y preventistas para despacharles pedidos por WhatsApp con 1 solo clic.
              </p>
            </div>
            <button
              onClick={handleOpenAddSupplier}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[13px] flex items-center gap-1.5 hover:bg-emerald-700 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proveedor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((sup) => {
              const productsFromSup = products.filter(
                (p) => p.supplierId === sup.id || p.supplierName?.toLowerCase() === sup.name.toLowerCase()
              );
              const cleanPhone = sup.phone.replace(/[^0-9]/g, '');

              return (
                <div
                  key={sup.id}
                  className="bg-white p-4.5 rounded-2xl border border-[#cbd5e1] shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {sup.category || 'Mayorista'}
                        </span>
                        <h4 className="font-bold text-[#00236f] text-[16px] mt-1">{sup.name}</h4>
                        {sup.contactName && (
                          <div className="text-[12px] font-medium text-slate-600 flex items-center gap-1 mt-0.5">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>{sup.contactName}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditSupplier(sup)}
                          className="p-1.5 text-slate-400 hover:text-[#00236f] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar datos del proveedor"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(sup.id, sup.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar proveedor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[12px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">WhatsApp:</span>
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-bold text-emerald-700 flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{sup.phone}</span>
                        </a>
                      </div>
                      {sup.cuit && (
                        <div className="flex items-center justify-between font-mono text-[11px] text-slate-600">
                          <span className="text-slate-500 font-sans">CUIT:</span>
                          <span>{sup.cuit}</span>
                        </div>
                      )}
                      {sup.email && (
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="text-slate-500">Email:</span>
                          <span className="truncate max-w-[170px]">{sup.email}</span>
                        </div>
                      )}
                      {sup.address && (
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="text-slate-500">Dirección:</span>
                          <span className="truncate max-w-[170px]">{sup.address}</span>
                        </div>
                      )}
                    </div>

                    {sup.notes && (
                      <div className="text-[11px] text-slate-500 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                        <span className="font-semibold text-amber-900">Nota comercial:</span> {sup.notes}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Artículos vinculados:</span>
                      <span className="font-bold text-[#00236f] bg-[#eff4ff] px-2 py-0.5 rounded-full">
                        {productsFromSup.length} en catálogo
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 mt-4">
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                        `Hola ${sup.contactName || sup.name}, te escribo de DistriPro Mayorista.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Abrir Chat</span>
                    </a>

                    <button
                      onClick={() => handleOpenNewOrderModal(sup)}
                      className="flex-1 py-2 px-3 bg-[#00236f] text-white rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-[#00184d] transition-colors shadow-xs"
                    >
                      <PackagePlus className="w-3.5 h-3.5 text-[#82f5c1]" />
                      <span>Crear Pedido</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: CREAR PEDIDO / COMPRA A PROVEEDOR                     */}
      {/* ============================================================== */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#00236f] text-white p-4.5 flex items-center justify-between">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] flex items-center gap-2">
                  <PackagePlus className="w-5 h-5 text-[#82f5c1]" />
                  <span>Nuevo Pedido de Mercadería a Proveedor</span>
                </h3>
                <p className="text-[12px] text-slate-300 mt-0.5">
                  Carga artículo y cantidad. El costo aparece automáticamente para que puedas revisarlo o modificarlo.
                </p>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-[13px]">
              {/* Step 1: Supplier Selection */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#00236f] text-[13px] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#00236f]" />
                    <span>1. Datos del Proveedor & Destino</span>
                  </span>
                  {supplierPhone && (
                    <span className="text-[12px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                      WhatsApp: {supplierPhone}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Elegir de Agenda:
                    </label>
                    <select
                      value={selectedSupplierId || (supplierName ? supplierName : '')}
                      onChange={(e) => handleSupplierChange(e.target.value)}
                      className="w-full h-9 px-2 rounded-lg border border-[#cbd5e1] bg-white text-[12px] font-medium"
                    >
                      <option value="">-- Seleccionar Proveedor --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.contactName || 'Mayorista'})
                        </option>
                      ))}
                      <option value="__custom__">+ Otro Proveedor (Manual)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Nombre / Empresa:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Molinos Río de la Plata"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-white text-[12px]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      WhatsApp para Pedido:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: +54 9 11 5555-1234"
                      value={supplierPhone}
                      onChange={(e) => setSupplierPhone(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] bg-white text-[12px] font-mono text-emerald-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Preventista / Contacto:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Carlos Martínez"
                      value={supplierContact}
                      onChange={(e) => setSupplierContact(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-[#cbd5e1] bg-white text-[12px]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Fecha del Pedido:
                    </label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-[#cbd5e1] bg-white text-[12px] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      N° Factura / Remito / Ref:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: FC-A o N° Pedido"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-[#cbd5e1] bg-white text-[12px] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Add Product line (with auto cost display) */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-[13px] flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-emerald-700" />
                    <span>2. Agregar Artículo al Pedido</span>
                  </span>
                  {selectedProduct && (
                    <span className="text-[11px] text-emerald-800 font-medium">
                      Stock Central actual: <strong className="font-mono">{selectedProduct.stockCentral} bultos</strong>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Product Selector */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-[11px] font-bold text-emerald-950 block">
                      Seleccionar Artículo:
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-emerald-300 bg-white text-[12px] font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) • Costo actual: ${(p.costPrice || Math.round(p.priceWholesale * 0.7)).toLocaleString('es-AR')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-emerald-950 block">
                      Cantidad:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full h-10 px-3 rounded-lg border border-emerald-300 bg-white font-mono font-bold text-[13px] text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Unit Cost (appears automatically, editable) */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-emerald-950 flex items-center justify-between">
                      <span>Costo x Bulto ($):</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={itemUnitCost || ''}
                      onChange={(e) => setItemUnitCost(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg border border-emerald-300 bg-white font-mono font-bold text-[13px] text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Add button */}
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddDraftItem}
                      className="w-full h-10 bg-emerald-600 text-white rounded-lg font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-xs active:scale-98"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>

                {/* Live Cost Alarm Warning */}
                {hasCostVariation && (
                  <div className="bg-amber-100/90 border border-amber-300 p-2.5 rounded-lg flex items-center justify-between text-[12px] text-amber-900 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>
                        <strong>Variación de Costo:</strong> Costo anterior: <strong>${currentCost.toLocaleString('es-AR')}</strong> ➜ Nuevo: <strong>${itemUnitCost.toLocaleString('es-AR')}</strong> ({Number(percentVariation) > 0 ? `+${percentVariation}%` : `${percentVariation}%`}).
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={updateProductCostCheckbox}
                          onChange={(e) => setUpdateProductCostCheckbox(e.target.checked)}
                          className="rounded text-emerald-600"
                        />
                        <span>Actualizar costo en catálogo</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Items Table in Draft Order */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#00236f] text-[13px] flex items-center gap-2">
                    <ReceiptText className="w-4 h-4" />
                    <span>3. Lista de Artículos del Pedido ({draftItems.length})</span>
                  </h4>
                  <span className="font-mono font-bold text-[13px] text-emerald-800">
                    Total Estimado: ${draftTotal.toLocaleString('es-AR')}
                  </span>
                </div>

                {draftItems.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                    Aún no agregaste artículos al pedido. Selecciona un artículo arriba y presiona "Agregar".
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-[12px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Artículo</th>
                          <th className="py-2.5 px-3 text-center">Cantidad</th>
                          <th className="py-2.5 px-3 text-right">Costo Unitario</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                          <th className="py-2.5 px-3 text-center">Variación</th>
                          <th className="py-2.5 px-3 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {draftItems.map((item, idx) => {
                          const diff = item.unitCost - item.previousCost;
                          const hasDiff = Math.abs(diff) > 0.01;

                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="py-2 px-3">
                                <div className="font-bold text-[#0b1c30]">{item.productName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                              </td>
                              <td className="py-2 px-3 text-center font-mono font-bold">
                                {item.quantity} bultos
                              </td>
                              <td className="py-2 px-3 text-right font-mono">
                                ${item.unitCost.toLocaleString('es-AR')}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-[#00236f]">
                                ${item.subtotal.toLocaleString('es-AR')}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {hasDiff ? (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                    {diff > 0 ? `+$${diff.toLocaleString('es-AR')}` : `-$${Math.abs(diff).toLocaleString('es-AR')}`}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Sin cambios</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDraftItem(idx)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Notas u Observaciones del Pedido (se incluirán en el mensaje de WhatsApp):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Entregar en Depósito Central por la mañana. Avisar 1 hora antes."
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] text-[12px]"
                />
              </div>
            </div>

            {/* Footer with actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="font-mono text-[14px] font-bold text-[#00236f]">
                Total: ${draftTotal.toLocaleString('es-AR')} ({draftItems.length} artículos)
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-[12px] text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>

                {/* ACTION 1: Guardar como Pedido a Proveedor (Pendiente) */}
                <button
                  type="button"
                  onClick={() => handleSaveOrder('pedido')}
                  disabled={draftItems.length === 0}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[12px] flex items-center gap-1.5 hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Crear Pedido & Enviar WhatsApp</span>
                </button>

                {/* ACTION 2: Ingresar Directo a Stock Central */}
                <button
                  type="button"
                  onClick={() => handleSaveOrder('ingresado')}
                  disabled={draftItems.length === 0}
                  className="px-4 py-2 bg-[#00236f] text-white rounded-xl font-bold text-[12px] flex items-center gap-1.5 hover:bg-[#00174a] transition-colors disabled:opacity-50 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#82f5c1]" />
                  <span>Ingresar Directo a Stock Central</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: MODIFICAR PEDIDO A PROVEEDOR                          */}
      {/* ============================================================== */}
      {isEditOrderModalOpen && orderToEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#00236f] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#82f5c1]" />
                  <span>Modificar Pedido {orderToEdit.purchaseNumber}</span>
                </h3>
                <p className="text-[12px] text-slate-300">
                  Proveedor: <strong>{orderToEdit.supplierName}</strong> • Modifica cantidades, precios o agrega artículos antes de ingresar a stock.
                </p>
              </div>
              <button
                onClick={() => setIsEditOrderModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-[13px]">
              {/* Quick Add Line in Edit */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 text-[12px] block">
                  + Sumar otro artículo al pedido:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-6">
                    <select
                      value={editAddProductId}
                      onChange={(e) => handleSelectProductInEdit(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-[12px]"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Cant."
                      value={editAddQty}
                      onChange={(e) => setEditAddQty(Number(e.target.value))}
                      className="w-full h-9 px-2 rounded-lg border border-slate-300 font-mono text-center text-[12px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Costo"
                      value={editAddUnitCost}
                      onChange={(e) => setEditAddUnitCost(Number(e.target.value))}
                      className="w-full h-9 px-2 rounded-lg border border-slate-300 font-mono text-right text-[12px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItemToEditOrder}
                      className="w-full h-9 bg-blue-600 text-white rounded-lg font-bold text-[12px] hover:bg-blue-700"
                    >
                      Sumar
                    </button>
                  </div>
                </div>
              </div>

              {/* Editable Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Artículo</th>
                      <th className="py-2.5 px-3 text-center w-28">Cantidad</th>
                      <th className="py-2.5 px-3 text-right w-32">Costo x Bulto</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-3 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {editOrderItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3">
                          <div className="font-bold text-[#0b1c30]">{item.productName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemInEditOrder(idx, 'quantity', Number(e.target.value))}
                            className="w-20 h-8 px-2 rounded border border-slate-300 font-mono font-bold text-center text-[12px]"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) => handleUpdateItemInEditOrder(idx, 'unitCost', Number(e.target.value))}
                            className="w-28 h-8 px-2 rounded border border-slate-300 font-mono font-bold text-right text-[12px]"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#00236f]">
                          ${item.subtotal.toLocaleString('es-AR')}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromEditOrder(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Extra details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    WhatsApp del Proveedor:
                  </label>
                  <input
                    type="text"
                    value={editOrderSupplierPhone}
                    onChange={(e) => setEditOrderSupplierPhone(e.target.value)}
                    className="w-full h-8 px-2.5 rounded border border-slate-300 text-[12px] font-mono text-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Atención / Contacto:
                  </label>
                  <input
                    type="text"
                    value={editOrderSupplierContact}
                    onChange={(e) => setEditOrderSupplierContact(e.target.value)}
                    className="w-full h-8 px-2.5 rounded border border-slate-300 text-[12px]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <div className="font-mono text-[14px] font-bold text-[#00236f]">
                Total: ${editOrderItems.reduce((sum, it) => sum + it.subtotal, 0).toLocaleString('es-AR')}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-[12px] text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveModifiedOrder}
                  className="px-4 py-2 bg-[#00236f] text-white rounded-xl font-bold text-[12px] hover:bg-[#00174a] shadow-xs"
                >
                  Guardar Cambios del Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CONFIRMAR E INGRESAR A STOCK CENTRAL                  */}
      {/* ============================================================== */}
      {isConfirmReceiptModalOpen && orderToConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-emerald-700 text-white p-4.5 flex items-center justify-between">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Confirmar Recepción e Ingresar a Stock</span>
                </h3>
                <p className="text-[12px] text-emerald-100 mt-0.5">
                  Orden: <strong>{orderToConfirm.purchaseNumber}</strong> • Proveedor: <strong>{orderToConfirm.supplierName}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsConfirmReceiptModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-[13px]">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-2">
                <span className="font-bold text-emerald-950 text-[13px] block">
                  Verificación de Comprobante de Recepción:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      N° Factura / Remito del Proveedor:
                    </label>
                    <input
                      type="text"
                      value={confirmInvoiceNum}
                      onChange={(e) => setConfirmInvoiceNum(e.target.value)}
                      placeholder="Ej: FC-A 0004-00012938"
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-[12px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Condición de Pago:
                    </label>
                    <select
                      value={confirmPaymentStatus}
                      onChange={(e) => setConfirmPaymentStatus(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white text-[12px] font-medium"
                    >
                      <option value="pagado">Pagado (Cancelado)</option>
                      <option value="cuenta_corriente">En Cuenta Corriente (A pagar)</option>
                      <option value="pendiente">Pendiente de Pago</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items checklist */}
              <div className="space-y-2">
                <span className="font-bold text-[#00236f] text-[13px] block">
                  Artículos que ingresarán al Depósito Central:
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {orderToConfirm.items.map((it) => {
                    const prod = products.find((p) => p.id === it.productId);
                    const curCost = prod?.costPrice || it.previousCost;
                    const diff = it.unitCost - curCost;
                    const hasDiff = Math.abs(diff) > 0.01;

                    return (
                      <div key={it.productId} className="p-3 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#0b1c30]">{it.productName}</span>
                            <span className="text-[11px] text-slate-400 font-mono ml-2">({it.sku})</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-800 text-[13px]">
                              +{it.quantity} bultos a Central
                            </span>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Costo: ${it.unitCost.toLocaleString('es-AR')}
                            </div>
                          </div>
                        </div>

                        {hasDiff && (
                          <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                              <span>
                                Variación: Costo en catálogo era ${curCost.toLocaleString('es-AR')}, ahora entra a ${it.unitCost.toLocaleString('es-AR')}.
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1 cursor-pointer font-bold text-emerald-900">
                                <input
                                  type="checkbox"
                                  checked={confirmUpdateCosts[it.productId] ?? true}
                                  onChange={(e) =>
                                    setConfirmUpdateCosts((prev) => ({
                                      ...prev,
                                      [it.productId]: e.target.checked,
                                    }))
                                  }
                                  className="rounded text-emerald-600"
                                />
                                <span>Actualizar costo en catálogo</span>
                              </label>

                              <label className="flex items-center gap-1 cursor-pointer font-bold text-blue-900">
                                <input
                                  type="checkbox"
                                  checked={confirmUpdatePrices[it.productId] ?? false}
                                  onChange={(e) =>
                                    setConfirmUpdatePrices((prev) => ({
                                      ...prev,
                                      [it.productId]: e.target.checked,
                                    }))
                                  }
                                  className="rounded text-blue-600"
                                />
                                <span>Ajustar precio de venta (mantener margen)</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="font-mono text-[13px] font-bold text-[#00236f]">
                Total a Ingresar: ${orderToConfirm.total.toLocaleString('es-AR')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmReceiptModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-[12px] text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReceipt}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[13px] hover:bg-emerald-700 shadow-md flex items-center gap-2 active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Ingreso al Depósito</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: ENVIAR PEDIDO POR WHATSAPP AL PROVEEDOR               */}
      {/* ============================================================== */}
      {isWhatsAppModalOpen && orderForWhatsApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#25D366] text-white p-4.5 flex items-center justify-between">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span>Enviar Pedido por WhatsApp</span>
                </h3>
                <p className="text-[12px] text-emerald-950 font-medium mt-0.5">
                  Los proveedores no necesitan aplicación: reciben el pedido como texto ordenado en su WhatsApp.
                </p>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-[13px]">
              {/* Recipient info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Proveedor:</span>
                  <span className="font-bold text-[#00236f]">{orderForWhatsApp.supplierName}</span>
                </div>
                {orderForWhatsApp.supplierContact && (
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-500">Preventista / Atención:</span>
                    <span className="font-semibold text-slate-700">{orderForWhatsApp.supplierContact}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[12px] gap-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Celular / WhatsApp:</span>
                  <input
                    type="text"
                    value={customWhatsAppPhone}
                    onChange={(e) => setCustomWhatsAppPhone(e.target.value)}
                    placeholder="+54 9 11 5555-1234"
                    className="h-8 px-2.5 rounded border border-slate-300 font-mono font-bold text-emerald-800 text-right text-[12px] bg-white w-48"
                  />
                </div>
              </div>

              {/* Message preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Mensaje Formateado para WhatsApp:
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyWhatsAppMessage}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    {whatsAppCopied ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Mensaje</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-800">
                  {whatsAppMessage}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleCopyWhatsAppMessage}
                className="px-4 py-2 bg-white border border-slate-300 rounded-xl font-bold text-[12px] text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <Copy className="w-4 h-4 text-slate-500" />
                <span>{whatsAppCopied ? '¡Texto Copiado!' : 'Copiar Texto'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-[12px] font-semibold text-slate-500 hover:bg-slate-200"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsAppWeb}
                  className="px-5 py-2.5 bg-[#25D366] text-white rounded-xl font-bold text-[13px] hover:bg-[#1EBE5D] flex items-center gap-2 shadow-md active:scale-98 transition-all"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Abrir en WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: AGREGAR / EDITAR PROVEEDOR DE AGENDA                  */}
      {/* ============================================================== */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#00236f] text-white p-4.5 flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#82f5c1]" />
                <span>{supplierToEdit ? 'Editar Proveedor' : 'Nuevo Contacto de Proveedor'}</span>
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-5 space-y-3.5 text-[13px]">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Nombre de la Empresa o Distribuidor *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Molinos Río de la Plata"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Persona de Contacto / Preventista:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos Martínez"
                    value={supplierForm.contactName}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contactName: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    WhatsApp para Pedidos *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+54 9 11 5555-1234"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px] font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    CUIT:
                  </label>
                  <input
                    type="text"
                    placeholder="30-50001234-9"
                    value={supplierForm.cuit}
                    onChange={(e) => setSupplierForm({ ...supplierForm, cuit: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px] font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Rubro / Categoría:
                  </label>
                  <select
                    value={supplierForm.category}
                    onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px]"
                  >
                    <option value="Almacén">Almacén</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Golosinas">Golosinas</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Perfumería">Perfumería</option>
                    <option value="Pañales">Pañales</option>
                    <option value="Varios">Varios / Mayorista General</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Email:
                  </label>
                  <input
                    type="email"
                    placeholder="pedidos@empresa.com"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Dirección / Depósito:
                  </label>
                  <input
                    type="text"
                    placeholder="Av. Maipú 1200, Vicente López"
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Notas Comerciales (Días de entrega, plazo de pago, etc.):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Recibe pedidos hasta las 17hs. Entrega martes y jueves."
                  value={supplierForm.notes}
                  onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-[12px] text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-[12px] hover:bg-emerald-700 shadow-xs"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: VER DETALLE / COMPROBANTE DE ORDEN                    */}
      {/* ============================================================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#00236f] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px]">
                  Detalle de {selectedOrderDetails.purchaseNumber}
                </h3>
                <p className="text-[12px] text-slate-300">
                  {selectedOrderDetails.status === 'pedido' ? 'Pedido en Curso' : 'Ingresado al Stock Central'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-[13px]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[12px]">
                <div>
                  <span className="text-slate-500 block">Proveedor:</span>
                  <strong className="text-[#0b1c30]">{selectedOrderDetails.supplierName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Comprobante:</span>
                  <strong className="font-mono text-slate-700">{selectedOrderDetails.invoiceNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Fecha:</span>
                  <span className="font-mono text-slate-700">{selectedOrderDetails.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total:</span>
                  <strong className="font-mono text-emerald-800">${selectedOrderDetails.total.toLocaleString('es-AR')}</strong>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Artículo</th>
                      <th className="py-2.5 px-3 text-center">Bultos</th>
                      <th className="py-2.5 px-3 text-right">Costo Unitario</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrderDetails.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3">
                          <div className="font-bold text-[#0b1c30]">{it.productName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{it.sku}</div>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold">
                          {it.quantity}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          ${it.unitCost.toLocaleString('es-AR')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#00236f]">
                          ${it.subtotal.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedOrderDetails.notes && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[12px] text-amber-900">
                  <span className="font-bold">Observaciones:</span> {selectedOrderDetails.notes}
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleOpenWhatsAppModal(selectedOrderDetails);
                  setSelectedOrderDetails(null);
                }}
                className="px-4 py-2 bg-[#25D366] text-white rounded-xl font-bold text-[12px] flex items-center gap-1.5 hover:bg-[#1EBE5D]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-[12px] text-slate-600 hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
