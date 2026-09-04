import React, { useState } from 'react';
import { CompanySettings, BankInfo, Product } from '../types';
import { LocalIcon } from './LocalIcon';
import { PARSED_SHEET_DATA, convertSheetItemsToProducts } from '../data/productPriceSheet';
import {
  Building2,
  Phone,
  Percent,
  CreditCard,
  FileSpreadsheet,
  Save,
  CheckCircle,
  ExternalLink,
  Info,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface ConfigOpcionesTabProps {
  settings?: CompanySettings;
  companySettings?: CompanySettings;
  onUpdateSettings?: (newSettings: CompanySettings) => void;
  products?: Product[];
  onUpdateProducts?: (products: Product[]) => void;
  onTriggerToast: (title: string, message: string) => void;
}

export const ConfigOpcionesTab: React.FC<ConfigOpcionesTabProps> = ({
  settings,
  companySettings,
  onUpdateSettings,
  products = [],
  onUpdateProducts,
  onTriggerToast,
}) => {
  const initialSettings: CompanySettings = settings || companySettings || {
    companyName: 'Distribuidora Mayorista S.A.',
    headquartersWhatsApp: '+54 9 387 512-3456',
    cashDiscountPercent: 10,
    cuit: '30-71234567-8',
    address: 'Av. San Martín 2340, Parque Industrial',
    city: 'Salta Capital, Salta',
    bankInfo: {
      alias: 'DISTRI.PAGOS',
      cbu: '0000003100012345678901',
      bankName: 'Banco Macro Salta',
      accountHolder: 'Distribuidora Mayorista S.A.',
      cuit: '30-71234567-8',
    },
    receiptFooterNotes: 'Comprobante comercial no válido como factura. Gracias por confiar en nosotros.',
  };

  const [formData, setFormData] = useState<CompanySettings>({
    ...initialSettings,
    companyName: initialSettings?.companyName || 'Distribuidora Mayorista S.A.',
    headquartersWhatsApp: initialSettings?.headquartersWhatsApp || '+54 9 387 512-3456',
    cashDiscountPercent: initialSettings?.cashDiscountPercent ?? 10,
    cuit: initialSettings?.cuit || '30-71234567-8',
    address: initialSettings?.address || 'Av. San Martín 2340, Parque Industrial',
    city: initialSettings?.city || 'Salta Capital, Salta',
    bankInfo: initialSettings?.bankInfo || {
      alias: 'DISTRI.PAGOS',
      cbu: '0000003100012345678901',
      bankName: 'Banco Macro Salta',
      accountHolder: 'Distribuidora Mayorista S.A.',
      cuit: '30-71234567-8',
    },
    receiptFooterNotes: initialSettings?.receiptFooterNotes || 'Comprobante comercial no válido como factura.',
  });
  const [showSheetPreview, setShowSheetPreview] = useState(false);
  const [sheetSearch, setSheetSearch] = useState('');

  const handleInputChange = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleBankChange = <K extends keyof BankInfo>(key: K, value: BankInfo[K]) => {
    setFormData((prev) => ({
      ...prev,
      bankInfo: {
        ...(prev?.bankInfo || {}),
        [key]: value,
      } as BankInfo,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSettings) {
      onUpdateSettings(formData);
    }
    onTriggerToast('Configuración Guardada', 'Los parámetros de Casa Central fueron actualizados exitosamente.');
  };

  const handleTestWhatsApp = () => {
    const cleanPhone = (formData?.headquartersWhatsApp || '+54 9 387 512-3456').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `*DISTRIPRO CASA CENTRAL - MENSAJE DE PRUEBA*\n\nEste es un mensaje de verificación para la línea principal de recepción de pedidos (${formData?.companyName || 'Distribuidora'}).`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleImportAttachedSheet = () => {
    const newProducts = convertSheetItemsToProducts(PARSED_SHEET_DATA);
    
    // Merge or append products: if sku already exists, update its cost and price; if not, append
    const updatedMap = new Map<string, Product>();
    products.forEach((p) => updatedMap.set(p.sku, p));

    let addedCount = 0;
    let updatedCount = 0;

    newProducts.forEach((np) => {
      if (updatedMap.has(np.sku)) {
        const existing = updatedMap.get(np.sku)!;
        updatedMap.set(np.sku, {
          ...existing,
          costPrice: np.costPrice,
          priceWholesale: np.priceWholesale,
          suggestedRetailPrice: np.suggestedRetailPrice,
          supplierName: np.supplierName,
        });
        updatedCount++;
      } else {
        updatedMap.set(np.sku, np);
        addedCount++;
      }
    });

    const finalProducts = Array.from(updatedMap.values());
    onUpdateProducts(finalProducts);
    onTriggerToast(
      'Planilla Incorporada',
      `Se actualizaron ${updatedCount} productos y se incorporaron ${addedCount} nuevos artículos al catálogo.`
    );
  };

  const filteredSheetRows = PARSED_SHEET_DATA.filter((row) =>
    row.description.toLowerCase().includes(sheetSearch.toLowerCase()) ||
    row.code.toLowerCase().includes(sheetSearch.toLowerCase()) ||
    row.category.toLowerCase().includes(sheetSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in">
      {/* Header & Subtitle */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#00236f] text-[#82f5c1] flex items-center justify-center shadow-xs">
              <LocalIcon name="settings" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-[#0b1c30] tracking-tight">
                Opciones y Configuración Central
              </h1>
              <p className="text-[12px] text-slate-500">
                Parámetros de empresa, WhatsApp principal de recepción de pedidos, políticas de descuento y datos bancarios.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="h-10 px-5 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-[13px] rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0 active:scale-98"
        >
          <Save className="w-4 h-4 text-[#82f5c1]" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============================================================== */}
        {/* SECCIÓN 1: WHATSAPP PRINCIPAL DE CASA CENTRAL                   */}
        {/* ============================================================== */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-[15px] text-[#0b1c30]">
                WhatsApp Principal de Casa Central (Recepción de Pedidos)
              </h2>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Canal Oficial
            </span>
          </div>

          <p className="text-[12px] text-slate-600">
            Este es el número al que los clientes y preventistas envían sus pedidos, comprobantes de pago y lotes de sincronización desde la App móvil.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700 block">
                Número de WhatsApp Casa Central:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="+54 9 387 512-3456"
                  value={formData.headquartersWhatsApp}
                  onChange={(e) => handleInputChange('headquartersWhatsApp', e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl border border-slate-300 font-mono text-[14px] font-bold text-[#00236f] bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00236f] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Abrir chat de WhatsApp para verificar el enlace"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Probar</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-400">
                Prefijo por defecto para Salta: <code className="font-mono font-semibold">+54 9 387</code>
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700 block">
                Teléfono Secundario / Administración:
              </label>
              <input
                type="text"
                placeholder="+54 9 387 421-9988"
                value={formData.phoneSecondary || ''}
                onChange={(e) => handleInputChange('phoneSecondary', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-[13px] text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
              <span className="text-[11px] text-slate-400">
                Línea fija o alternativa para atención al cliente
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECCIÓN 2: DATOS DE LA EMPRESA / RAZÓN SOCIAL                  */}
        {/* ============================================================== */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00236f]" />
              <h2 className="font-bold text-[15px] text-[#0b1c30]">
                Datos de la Empresa y Comprobantes
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700">Razón Social / Nombre Comercial:</label>
              <input
                type="text"
                required
                placeholder="Ej: DistriPro Salta S.A. Mayorista"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-[13px] font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700">CUIT / Identificación Tributaria:</label>
              <input
                type="text"
                required
                placeholder="30-71234567-8"
                value={formData.cuit}
                onChange={(e) => handleInputChange('cuit', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono text-[13px] text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700">Dirección Depósito Central:</label>
              <input
                type="text"
                placeholder="Av. San Martín 2340, Parque Industrial"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-[13px] text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700">Ciudad y Provincia:</label>
              <input
                type="text"
                placeholder="Salta Capital, Salta"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-[13px] text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700">Correo Electrónico de Pedidos:</label>
              <input
                type="email"
                placeholder="pedidos@distriprosalta.com.ar"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-[13px] text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700">Horarios de Atención y Despacho:</label>
              <input
                type="text"
                placeholder="Lunes a Sábado de 07:30 a 17:00 hs"
                value={formData.businessHours || ''}
                onChange={(e) => handleInputChange('businessHours', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-[13px] text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-[12px] font-bold text-slate-700">Leyenda al pie de los Tickets / Comprobantes:</label>
            <input
              type="text"
              placeholder="¡Gracias por su compra! Reclamos de mercadería dentro de las 48hs de recibido."
              value={formData.ticketFooterNotes || ''}
              onChange={(e) => handleInputChange('ticketFooterNotes', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-[13px] text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00236f] focus:outline-none"
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECCIÓN 3: PARÁMETROS COMERCIALES & POLÍTICA DE DESCUENTO       */}
        {/* ============================================================== */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-[15px] text-[#0b1c30]">
                Políticas Comerciales y Parámetros
              </h2>
            </div>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[14px] text-emerald-950 block">
                  Porcentaje de Descuento por Pago Contado Efectivo (%)
                </span>
                <span className="text-[12px] text-emerald-800">
                  Bonificación aplicable a ventas directas al paso y catálogo preventa al abonar en efectivo.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.cashDiscountPercent}
                  onChange={(e) => handleInputChange('cashDiscountPercent', Number(e.target.value))}
                  className="w-24 h-10 px-3 rounded-xl border-2 border-emerald-500 font-mono font-black text-[18px] text-emerald-900 bg-white text-center focus:outline-none"
                />
                <span className="font-black text-emerald-900 text-[18px]">%</span>
              </div>
            </div>

            {/* Aclaración de la Regla de Negocio solicitada por el usuario */}
            <div className="bg-white p-3 rounded-lg border border-emerald-300 text-[12px] text-slate-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#0b1c30]">Regla de Cobranzas en Cuenta Corriente:</strong> Por normativa comercial, al registrar una cobranza de deuda en cuenta corriente <strong>no se aplica automáticamente este descuento de efectivo</strong> (el cliente debe cancelar el saldo total adeudado). Sin embargo, el módulo de cobranzas incluye un campo manual para registrar un descuento especial pactado o un recargo por mora si correspondiera.
              </div>
            </div>
          </div>

          {/* DATOS BANCARIOS */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#00236f]" />
              <h3 className="font-bold text-[13px] text-[#0b1c30]">
                Datos Bancarios para Transferencias y QR
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Alias Bancario:</label>
                <input
                  type="text"
                  value={formData.bankInfo.alias}
                  onChange={(e) => handleBankChange('alias', e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono font-bold text-[#00236f] bg-slate-50 text-[12px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">CBU / CVU:</label>
                <input
                  type="text"
                  value={formData.bankInfo.cbu}
                  onChange={(e) => handleBankChange('cbu', e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono text-slate-800 bg-slate-50 text-[12px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Banco Receptor:</label>
                <input
                  type="text"
                  value={formData.bankInfo.bankName}
                  onChange={(e) => handleBankChange('bankName', e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-800 bg-slate-50 text-[12px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Titular de la Cuenta:</label>
                <input
                  type="text"
                  value={formData.bankInfo.accountHolder}
                  onChange={(e) => handleBankChange('accountHolder', e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 text-slate-800 bg-slate-50 text-[12px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">CUIT Titular Cuenta:</label>
                <input
                  type="text"
                  value={formData.bankInfo.cuit}
                  onChange={(e) => handleBankChange('cuit', e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 font-mono text-slate-800 bg-slate-50 text-[12px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECCIÓN 4: PLANILLA ADJUNTA DE PRODUCTOS Y PRECIOS             */}
        {/* ============================================================== */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="font-bold text-[15px] text-[#0b1c30]">
                  Planilla Adjunta de Productos y Precios ({PARSED_SHEET_DATA.length} artículos)
                </h2>
                <p className="text-[12px] text-slate-500">
                  Lista de precios mayoristas con costos de compra provista (San Iginio, Doncella, Bic, Johnson, DEA, Sedal, Ala, Colgate, Candela, etc.)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSheetPreview(!showSheetPreview)}
                className="h-9 px-3 text-[12px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                {showSheetPreview ? 'Ocultar Planilla' : 'Ver Planilla Completa'}
              </button>

              <button
                type="button"
                onClick={handleImportAttachedSheet}
                className="h-9 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[12px] rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span>Incorporar al Catálogo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Artículos</span>
              <span className="text-[18px] font-black font-mono text-[#00236f]">{PARSED_SHEET_DATA.length}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Rubro Perfumería</span>
              <span className="text-[18px] font-black font-mono text-purple-700">
                {PARSED_SHEET_DATA.filter((i) => i.category === 'Perfumería').length}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Rubro Limpieza</span>
              <span className="text-[18px] font-black font-mono text-cyan-700">
                {PARSED_SHEET_DATA.filter((i) => i.category === 'Limpieza').length}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block">Margen Promedio</span>
              <span className="text-[18px] font-black font-mono text-emerald-600">~24%</span>
            </div>
          </div>

          {/* Vista Previa Expandible */}
          {showSheetPreview && (
            <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Buscar en la planilla (descripción, código, rubro)..."
                  value={sheetSearch}
                  onChange={(e) => setSheetSearch(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-[12px] bg-slate-50"
                />
                <span className="text-[11px] text-slate-500 shrink-0">
                  {filteredSheetRows.length} de {PARSED_SHEET_DATA.length} registros
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                    <tr>
                      <th className="p-2.5">Código</th>
                      <th className="p-2.5">Descripción del Producto</th>
                      <th className="p-2.5">Rubro</th>
                      <th className="p-2.5 text-right">Costo ($)</th>
                      <th className="p-2.5 text-right">Mayorista ($)</th>
                      <th className="p-2.5 text-right">Sugerido ($)</th>
                      <th className="p-2.5 text-right">Margen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSheetRows.map((row) => {
                      const marginPct = row.wholesalePrice > 0 ? (((row.wholesalePrice - row.cost) / row.wholesalePrice) * 100).toFixed(1) : '0';
                      return (
                        <tr key={row.code} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-[#00236f]">{row.code}</td>
                          <td className="p-2.5 font-semibold text-slate-800">{row.description}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                              {row.category}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">${row.cost.toLocaleString('es-AR')}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                            ${row.wholesalePrice.toLocaleString('es-AR')}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-500">
                            ${row.suggestedPublicPrice.toLocaleString('es-AR')}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-600">{marginPct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            className="h-11 px-6 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-[14px] rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
          >
            <Save className="w-5 h-5 text-[#82f5c1]" />
            <span>Guardar Toda la Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};
