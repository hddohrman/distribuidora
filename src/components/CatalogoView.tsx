import React, { useState } from 'react';
import { Product, UserRole, Client, BasketItem } from '../types';
import { LocalIcon } from './LocalIcon';

interface CatalogoViewProps {
  products: Product[];
  categoriesList?: string[];
  userRole?: UserRole;
  client?: Client;
  cashDiscountPercent?: number;
  onAddProductToOrder: (product: Product, quantity: number) => void;
  onOpenWhatsAppSync: () => void;
  clientBasket?: BasketItem[];
  onClientSubmitOrder?: () => void;
}

export const CatalogoView: React.FC<CatalogoViewProps> = ({
  products,
  categoriesList,
  userRole = 'vendedor',
  client,
  cashDiscountPercent = 10,
  onAddProductToOrder,
  onOpenWhatsAppSync,
  clientBasket = [],
  onClientSubmitOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [onlyOffersInRubro, setOnlyOffersInRubro] = useState(false);
  const [qtyState, setQtyState] = useState<{ [productId: string]: number }>({});

  const isClient = userRole === 'cliente';

  const totalOffersCount = products.filter((p) => Boolean(p.isOffer)).length;

  // Dynamic categories list based on props and existing products
  const categories = React.useMemo(() => {
    const rawList = (categoriesList && categoriesList.length > 0
      ? categoriesList
      : Array.from(new Set(products.map((p) => p.category)))
    ).filter((c) => !c.toLowerCase().includes('oferta') && !c.toLowerCase().includes('promo'));

    return ['Todos', '🔥 Ofertas & Promos', ...rawList];
  }, [categoriesList, products]);

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.barcode.includes(searchTerm);

    if (!matchesSearch) return false;

    if (selectedCategory === 'Todos') {
      if (onlyOffersInRubro) return Boolean(prod.isOffer);
      return true;
    }

    if (selectedCategory === '🔥 Ofertas & Promos') {
      return Boolean(prod.isOffer) || prod.category.toLowerCase().includes('oferta') || prod.category.toLowerCase().includes('promo');
    }

    const matchesCategory = prod.category === selectedCategory;
    if (!matchesCategory) return false;

    if (onlyOffersInRubro) {
      return Boolean(prod.isOffer);
    }

    return true;
  });

  const offersInSelectedCategory = selectedCategory === 'Todos' || selectedCategory === '🔥 Ofertas & Promos'
    ? totalOffersCount
    : products.filter((p) => p.category === selectedCategory && Boolean(p.isOffer)).length;

  const getQty = (id: string) => qtyState[id] || 1;

  const handleQtyChange = (id: string, delta: number) => {
    const current = getQty(id);
    const next = Math.max(1, current + delta);
    setQtyState((prev) => ({ ...prev, [id]: next }));
  };

  const formatMoney = (amount: number) => '$' + amount.toLocaleString('es-AR');

  const basketTotal = clientBasket.reduce((sum, it) => sum + it.subtotal, 0);
  const basketCount = clientBasket.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="flex flex-col w-full pb-20 space-y-3">
      {/* Client Mode Greeting & WhatsApp Sync Banner */}
      {isClient && (
        <div className="bg-white p-3.5 rounded-xl border border-[#dce9ff] shadow-xs flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <LocalIcon name="verified" className="w-5 h-5 text-[#006c4a]" />
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#00236f]">
                  Catálogo de Precios Mayoristas
                </h2>
              </div>
              <p className="text-[12px] text-[#444651]">
                Comercio: <strong>{client?.name || 'Cliente Registrado'}</strong> ({client?.code || '#CLI'})
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenWhatsAppSync}
              className="w-full sm:w-auto h-9 px-3.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-[12px] font-bold rounded-lg border border-[#dce9ff] flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <LocalIcon name="cloud_sync" className="w-4.5 h-4.5 text-[#006c4a]" />
              <span>Actualizar Catálogo WhatsApp</span>
            </button>
          </div>

          {/* Promo & Credit Line Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#f0f4ff] text-[11px]">
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] p-2 rounded-lg flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold">
                <LocalIcon name="payments" className="w-4 h-4 text-[#006c4a]" />
                <span>Pago Efectivo contra entrega:</span>
              </span>
              <span className="font-extrabold px-1.5 py-0.5 bg-[#006c4a] text-white rounded">
                {cashDiscountPercent}% OFF
              </span>
            </div>

            <div className="bg-[#f0f4ff] border border-[#dce9ff] text-[#00236f] p-2 rounded-lg flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold">
                <LocalIcon name="credit_card" className="w-4 h-4" />
                <span>Cupo Cuenta Corriente:</span>
              </span>
              <span className="font-mono font-bold">
                {formatMoney(Math.max(0, (client?.creditLimit || 0) - (client?.currentDebt || 0)))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Vendor helper bar for WhatsApp sharing */}
      {!isClient && (
        <div className="bg-[#eff4ff] p-2.5 rounded-xl border border-[#dce9ff] flex items-center justify-between text-[12px]">
          <span className="text-[#444651] font-medium flex items-center gap-1.5">
            <LocalIcon name="error" className="w-4.5 h-4.5 text-[#00236f]" />
            <span>Modo Vendedor: visualización completa con stock en furgón y depósito</span>
          </span>
          <button
            type="button"
            onClick={onOpenWhatsAppSync}
            className="px-2.5 py-1 bg-[#00236f] text-white text-[11px] font-bold rounded-md flex items-center gap-1 hover:bg-[#1e3a8a] transition-all cursor-pointer"
          >
            <LocalIcon name="share" className="w-3.5 h-3.5" />
            <span>Enviar a Clientes</span>
          </button>
        </div>
      )}

      {/* Search and category filter */}
      <section className="bg-white p-3 rounded-xl shadow-xs border border-[#e2e8f0] space-y-2.5">
        <div className="relative">
          <LocalIcon name="search" className="absolute left-3 top-2.5 text-[#757682] w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por SKU, producto, marca o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-9 bg-[#eff4ff] rounded-lg text-[13px] border border-[#dce9ff] text-[#0b1c30] placeholder-[#757682] focus:outline-none focus:ring-2 focus:ring-[#00236f]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-[#757682] hover:text-[#0b1c30]"
            >
              <LocalIcon name="close" className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSel = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setOnlyOffersInRubro(false);
                }}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-[#00236f] text-white shadow-xs'
                    : 'bg-[#eff4ff] text-[#444651] hover:bg-[#dce9ff]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Rubro offers filter toggle if category has offers */}
        {selectedCategory !== '🔥 Ofertas & Promos' && offersInSelectedCategory > 0 && (
          <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/80 px-3 py-1.5 rounded-lg text-[12px]">
            <span className="text-amber-900 font-medium flex items-center gap-1">
              <LocalIcon name="local_fire_department" className="w-3.5 h-3.5 text-amber-600" />
              <span>Hay <strong>{offersInSelectedCategory}</strong> {offersInSelectedCategory === 1 ? 'oferta' : 'ofertas'} en este rubro</span>
            </span>
            <button
              type="button"
              onClick={() => setOnlyOffersInRubro(!onlyOffersInRubro)}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                onlyOffersInRubro
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              {onlyOffersInRubro ? '✓ Mostrando solo ofertas' : 'Ver solo ofertas'}
            </button>
          </div>
        )}
      </section>

      {/* Product List */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1 text-[12px] text-[#444651]">
          <span className="font-semibold">
            {filteredProducts.length} productos disponibles
          </span>
          {!isClient ? (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006c4a]" /> Stock en Furgón
            </span>
          ) : (
            <span className="text-[11px] text-[#006c4a] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006c4a]" /> Precios Mayoristas Vigentes
            </span>
          )}
        </div>

        {filteredProducts.map((prod) => {
          const qty = getQty(prod.id);
          const hasTruckStock = prod.stockTruck > 0;
          const isPromo = Boolean(prod.isOffer);
          const effectivePrice = isPromo && prod.offerPrice ? prod.offerPrice : prod.priceWholesale;
          const hasPromoDiscount = Boolean(isPromo && prod.offerPrice && prod.offerPrice < prod.priceWholesale);

          return (
            <article
              key={prod.id}
              className={`p-3.5 rounded-xl shadow-xs border flex flex-col gap-2.5 transition-all ${
                isPromo
                  ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400'
                  : 'bg-white border-[#e2e8f0] hover:border-[#cbdbf5]'
              }`}
            >
              {/* Promo Badge if applicable */}
              {isPromo && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500 text-white shadow-2xs flex items-center gap-1">
                    <LocalIcon name="local_fire_department" className="w-3 h-3 text-white" />
                    <span>{prod.offerBadge || 'Super Promo / Oferta'}</span>
                  </span>
                  {prod.offerDescription && (
                    <span className="text-[11px] text-amber-900 font-medium">
                      {prod.offerDescription}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  {prod.imageUrl ? (
                    <div className="w-12 h-12 rounded-lg border border-[#dce9ff] overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center shadow-2xs">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center text-[#00236f] font-bold text-[13px] shrink-0">
                      {prod.codePrefix}
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30] truncate">
                      {prod.name}
                    </span>
                    <span className="text-[12px] text-[#444651]">
                      {prod.presentation} • <span className="font-medium text-[#00236f]">{prod.brand}</span>
                    </span>
                    <span className="text-[10px] text-[#757682] font-mono mt-0.5">
                      SKU: {prod.sku} | Barcode: {prod.barcode}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  {hasPromoDiscount ? (
                    <>
                      <span className="font-['Inter',sans-serif] font-extrabold text-[16px] text-emerald-700">
                        {formatMoney(effectivePrice)}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through">
                        {formatMoney(prod.priceWholesale)}
                      </span>
                    </>
                  ) : (
                    <span className="font-['Inter',sans-serif] font-bold text-[16px] text-[#0b1c30]">
                      {formatMoney(prod.priceWholesale)}
                    </span>
                  )}
                  <span className="text-[10px] text-[#444651]">x {prod.unitType}</span>
                </div>
              </div>

              {/* Stock breakdown ONLY FOR VENDOR */}
              {!isClient && (
                <div className="flex items-center justify-between bg-[#f8f9ff] p-2 rounded-lg text-[11px] border border-[#e5eeff]">
                  <div className="flex items-center gap-1.5">
                    <LocalIcon name="local_shipping" className="w-4 h-4 text-[#006c4a]" />
                    <span className="text-[#444651]">En móvil / furgón:</span>
                    <span
                      className={`font-bold ${
                        hasTruckStock ? 'text-[#006c4a]' : 'text-[#ba1a1a]'
                      }`}
                    >
                      {prod.stockTruck} {prod.unitType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LocalIcon name="warehouse" className="w-4 h-4 text-[#00236f]" />
                    <span className="text-[#444651]">Depósito Central:</span>
                    <span className="font-bold text-[#00236f]">
                      {prod.stockCentral}
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity selector & Add button */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center bg-[#eff4ff] rounded-lg border border-[#dce9ff] p-0.5">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(prod.id, -1)}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#00236f] hover:bg-white font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-9 text-center font-['Inter',sans-serif] font-bold text-[13px] text-[#0b1c30]">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(prod.id, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded text-[#00236f] hover:bg-white font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onAddProductToOrder(prod, qty);
                    setQtyState((prev) => ({ ...prev, [prod.id]: 1 }));
                  }}
                  className={`flex-1 h-9 text-white text-[12px] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] transition-all cursor-pointer ${
                    isClient
                      ? 'bg-[#006c4a] hover:bg-[#005137]'
                      : 'bg-[#00236f] hover:bg-[#1e3a8a]'
                  }`}
                >
                  <LocalIcon name="add_shopping_cart" className="w-4.5 h-4.5" />
                  <span>
                    {isClient
                      ? `Agregar al Pedido (${formatMoney(effectivePrice * qty)})`
                      : `Agregar a Preventa (${formatMoney(effectivePrice * qty)})`}
                  </span>
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Floating Client Basket Bar */}
      {isClient && clientBasket.length > 0 && onClientSubmitOrder && (
        <div className="fixed bottom-18 inset-x-3 max-w-xl mx-auto z-40 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-[#00236f] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border border-[#82f5c1]/30">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#82f5c1] font-bold uppercase tracking-wider">
                  Tu Pedido en Marcha
                </span>
                {cashDiscountPercent > 0 && (
                  <span className="text-[10px] bg-[#006c4a] text-white px-1.5 py-0.2 rounded font-bold">
                    {cashDiscountPercent}% OFF en Efectivo
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[16px]">
                  {formatMoney(basketTotal)}
                </span>
                {cashDiscountPercent > 0 && (
                  <span className="text-[11px] text-[#82f5c1] font-bold">
                    ({formatMoney(basketTotal * (1 - cashDiscountPercent / 100))} en efectivo)
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#dce1ff]">
                {basketCount} bultos • {clientBasket.length} productos
              </span>
            </div>

            <button
              type="button"
              onClick={onClientSubmitOrder}
              className="h-10 px-4 bg-[#82f5c1] hover:bg-[#6be4ad] text-[#003824] font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[13px] rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
            >
              <span>Ver y Enviar Pedido</span>
              <LocalIcon name="arrow_forward" className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

