import React, { useState, useRef } from 'react';
import { CompanySettings } from '../types';
import { LocalIcon } from './LocalIcon';

interface OpcionesViewProps {
  settings?: CompanySettings;
  onSaveSettings: (newSettings: CompanySettings) => void;
  onBack?: () => void;
}

export const OpcionesView: React.FC<OpcionesViewProps> = ({
  settings,
  onSaveSettings,
  onBack,
}) => {
  const [form, setForm] = useState<CompanySettings>(() => ({
    companyName: settings?.companyName || 'Distribuidora Mayorista S.A.',
    headquartersWhatsApp: settings?.headquartersWhatsApp || '+54 9 387 512-3456',
    cashDiscountPercent: settings?.cashDiscountPercent ?? 10,
    cuit: settings?.cuit || '30-71234567-8',
    address: settings?.address || 'Av. San Martín 2340, Parque Industrial',
    city: settings?.city || 'Salta Capital, Salta',
    bankInfo: settings?.bankInfo || {
      alias: 'DISTRI.PAGOS',
      cbu: '0000003100012345678901',
      bankName: 'Banco Macro Salta',
      accountHolder: 'Distribuidora Mayorista S.A.',
      cuit: '30-71234567-8',
    },
    receiptFooterNotes:
      settings?.receiptFooterNotes ||
      'Comprobante comercial no válido como factura. Gracias por confiar en nosotros.',
    logoUrl: settings?.logoUrl || '',
    businessHours: settings?.businessHours || 'Lunes a Viernes 08:00 a 18:00 hs',
    phoneSecondary: settings?.phoneSecondary || '+54 9 387 421-9988',
    emailContact: settings?.emailContact || 'pedidos@distrimayorista.com.ar',
    priceListSheetUrl: settings?.priceListSheetUrl || '',
    ...(settings || {}),
  }));

  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max ~3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert('La imagen seleccionada supera los 3 MB. Por favor seleccione una imagen más liviana.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="flex flex-col w-full pb-24 space-y-4 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Volver"
            >
              <LocalIcon name="arrow_back" className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-[#00236f] text-[#82f5c1] flex items-center justify-center shrink-0 shadow-xs">
            <LocalIcon name="settings" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] text-[#0b1c30] leading-tight">
              Opciones & Datos de la Empresa
            </h1>
            <p className="text-[11px] text-[#444651]">
              <span className="font-bold text-[#00236f]">DistriPro</span> es la aplicación. Aquí configura los datos comerciales y logo de su negocio.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[12px] font-bold animate-in fade-in">
            ✓ Cambios guardados
          </span>
        )}
      </div>

      {savedSuccess && (
        <div className="sm:hidden p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-[12px] font-bold text-emerald-900 animate-in fade-in">
          <span>✓</span>
          <span>¡Opciones guardadas con éxito! Se aplicarán en todos los documentos y tickets.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* 1. Identidad de la Empresa & Logo */}
        <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <LocalIcon name="business" className="w-5 h-5 text-[#00236f]" />
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30]">
              1. Identidad y Logotipo de la Empresa
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[12px] font-bold text-slate-700 block">
                Nombre Comercial / Razón Social de la Empresa:
              </label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Ej: Distribuidora Mayorista El Trébol S.A."
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px] font-bold text-[#0b1c30] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block">
                Este nombre aparecerá en el encabezado de todos los tickets, presupuestos, remitos y mensajes de WhatsApp.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700 block">
                CUIT / Identificación Tributaria:
              </label>
              <input
                type="text"
                value={form.cuit}
                onChange={(e) => setForm({ ...form, cuit: e.target.value })}
                placeholder="30-71234567-8"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px] font-mono font-medium focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700 block">
                Email de Contacto Comercial:
              </label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ventas@midistribuidora.com.ar"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>
          </div>

          {/* Logo Upload Box */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="text-[12px] font-bold text-slate-800 block">
              Logotipo de la Empresa para Comprobantes y Tickets:
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-28 h-28 bg-white border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-2xs">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt="Logo Empresa"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 text-center">
                    <LocalIcon name="image" className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-semibold">Sin logo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="company-logo-input"
                />
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label
                    htmlFor="company-logo-input"
                    className="h-9 px-3.5 rounded-lg bg-[#00236f] hover:bg-[#1a388f] text-white text-[12px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                  >
                    <LocalIcon name="upload" className="w-4 h-4" />
                    <span>Cargar Logo desde el Dispositivo</span>
                  </label>
                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="h-9 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[12px] font-bold transition-all cursor-pointer"
                    >
                      Quitar Logo
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Formatos recomendados: PNG o JPG con fondo transparente o blanco. El logo se imprimirá en el ticket térmico y en los comprobantes en PDF.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. WhatsApp y Teléfonos de Recepción de Pedidos */}
        <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <LocalIcon name="chat" className="w-5 h-5 text-[#006c4a]" />
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30]">
              2. Teléfono de WhatsApp para Recepción de Pedidos
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700 flex items-center justify-between">
                <span>WhatsApp Principal Casa Central (Recepción):</span>
                <span className="text-[10px] text-emerald-700 font-bold">Principal</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.headquartersWhatsApp}
                  onChange={(e) => setForm({ ...form, headquartersWhatsApp: e.target.value })}
                  placeholder="+54 9 387 512-3456"
                  className="w-full h-10 pl-3 pr-8 rounded-lg border-2 border-emerald-500 bg-emerald-50/30 text-[13px] font-mono font-bold text-[#0b1c30] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-2.5 top-2.5 text-emerald-600 font-bold text-[14px]">📱</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                A este número enviarán los pedidos los preventistas y clientes al tocar &quot;Enviar Pedido por WhatsApp&quot;.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700 block">
                Teléfono Secundario / Fijo de Depósito:
              </label>
              <input
                type="text"
                value={form.phoneSecondary || ''}
                onChange={(e) => setForm({ ...form, phoneSecondary: e.target.value })}
                placeholder="+54 9 387 421-9988"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px] font-mono focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* 3. Domicilio y Horarios */}
        <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <LocalIcon name="pin_drop" className="w-5 h-5 text-[#00236f]" />
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30]">
              3. Domicilio y Horarios de Atención
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700 block">
                Domicilio Comercial / Dirección del Depósito:
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Av. San Martín 2340, Parque Industrial"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700 block">
                Ciudad / Provincia:
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Salta Capital, Salta"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[12px] font-bold text-slate-700 block">
                Horario de Atención y Despacho:
              </label>
              <input
                type="text"
                value={form.businessHours || ''}
                onChange={(e) => setForm({ ...form, businessHours: e.target.value })}
                placeholder="Lunes a Sábado de 07:30 a 17:00 hs"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[13px] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* 4. Porcentaje de Descuento en Efectivo */}
        <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <LocalIcon name="percent" className="w-5 h-5 text-amber-600" />
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30]">
              4. Política Comercial: Porcentaje de Descuento Efectivo / Contado
            </h2>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-[12px] font-bold text-amber-950 block">
                  Descuento por Pago de Contado / Efectivo (%):
                </label>
                <span className="text-[11px] text-amber-800 block">
                  Se aplica automáticamente a pedidos pagados en efectivo en venta directa o preventa.
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="relative w-28">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={form.cashDiscountPercent}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        cashDiscountPercent: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-full h-10 pl-3 pr-7 rounded-lg border-2 border-amber-400 font-mono font-black text-amber-950 text-[16px] bg-white text-center focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-[14px] font-black text-amber-800">%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-amber-900">Accesos rápidos:</span>
              {[0, 5, 8, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setForm({ ...form, cashDiscountPercent: pct })}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    form.cashDiscountPercent === pct
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Datos Bancarios (Para cobranzas QR y Transferencia) */}
        <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <LocalIcon name="account_balance" className="w-5 h-5 text-[#00236f]" />
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30]">
              5. Datos Bancarios Oficiales (Cobranzas QR / Transferencias)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700 block">
                Entidad Bancaria / Billetera:
              </label>
              <input
                type="text"
                value={form.bankInfo.bankName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInfo: { ...form.bankInfo, bankName: e.target.value },
                  })
                }
                placeholder="Ej: Banco Macro Salta"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[12px] font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700 block">
                Alias de Cobro:
              </label>
              <input
                type="text"
                value={form.bankInfo.alias}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInfo: { ...form.bankInfo, alias: e.target.value.toUpperCase() },
                  })
                }
                placeholder="DISTRI.PRO.PAGOS"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[12px] font-mono font-bold text-[#00236f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700 block">
                CBU / CVU (22 dígitos):
              </label>
              <input
                type="text"
                value={form.bankInfo.cbu}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInfo: { ...form.bankInfo, cbu: e.target.value },
                  })
                }
                placeholder="0000003100012345678901"
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[12px] font-mono font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-bold text-slate-700 block">
                Titular de la Cuenta:
              </label>
              <input
                type="text"
                value={form.bankInfo.accountHolder}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInfo: { ...form.bankInfo, accountHolder: e.target.value },
                  })
                }
                placeholder="Distribuidora Mayorista S.A."
                className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[12px] font-medium"
              />
            </div>
          </div>
        </section>

        {/* 6. Pie de Página del Ticket y Leyenda */}
        <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <LocalIcon name="receipt" className="w-5 h-5 text-[#00236f]" />
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30]">
              6. Leyenda o Pie de Página en Comprobantes y Tickets
            </h2>
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-bold text-slate-700 block">
              Texto / Mensaje al pie del comprobante:
            </label>
            <textarea
              rows={2}
              value={form.ticketFooterNotes || ''}
              onChange={(e) => setForm({ ...form, ticketFooterNotes: e.target.value })}
              placeholder="¡Gracias por su compra! Reclamos de mercadería dentro de las 48hs de recibido."
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-[#f8f9ff] text-[12px] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
            />
          </div>

          {/* Vista Previa del Ticket Impreso */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
              Vista previa del encabezado impreso en comprobantes:
            </span>
            <div className="bg-white p-3 rounded-lg border border-dashed border-slate-300 font-mono text-center space-y-1 text-[#0b1c30] max-w-xs mx-auto text-[11px] shadow-2xs">
              {form.logoUrl && (
                <img
                  src={form.logoUrl}
                  alt={form.companyName}
                  className="h-12 max-w-[140px] object-contain mx-auto mb-1"
                />
              )}
              <div className="font-sans font-black text-[14px] text-[#00236f]">
                {form.companyName.toUpperCase()}
              </div>
              <div className="text-[10px] text-slate-600">
                CUIT: {form.cuit} • {form.city}
              </div>
              <div className="text-[10px] text-slate-600">
                {form.address} • Tel: {form.headquartersWhatsApp}
              </div>
              <div className="text-[9px] text-slate-400 pt-1 border-t border-dashed border-slate-200">
                Software por DistriPro
              </div>
            </div>
          </div>
        </section>

        {/* Action Save Button */}
        <div className="pt-2 sticky bottom-16 sm:bottom-4 z-20">
          <button
            type="submit"
            className="w-full h-12 bg-[#00236f] hover:bg-[#1a388f] active:scale-98 text-white rounded-xl font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <LocalIcon name="save" className="w-5 h-5 text-[#82f5c1]" />
            <span>Guardar Opciones & Datos de la Empresa</span>
          </button>
        </div>
      </form>
    </div>
  );
};
