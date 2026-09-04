import React, { useState } from 'react';
import { Product, Client, BankInfo, CatalogSyncPayload } from '../types';
import { LocalIcon } from './LocalIcon';

interface DifusionWhatsAppTabProps {
  products: Product[];
  clients: Client[];
  categories: string[];
  zones: string[];
  cashDiscountPercent: number;
  bankInfo: BankInfo;
  onUpdateCashDiscount?: (percent: number) => void;
  onTriggerToast: (title: string, message: string) => void;
}

export const DifusionWhatsAppTab: React.FC<DifusionWhatsAppTabProps> = ({
  products,
  clients,
  categories,
  zones,
  cashDiscountPercent,
  bankInfo,
  onUpdateCashDiscount,
  onTriggerToast,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ''
  );
  const [copiedJson, setCopiedJson] = useState(false);
  const [showTextCatalog, setShowTextCatalog] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const formatMoney = (val: number) => '$' + val.toLocaleString('es-AR');

  const productsWithImageCount = products.filter((p) => Boolean(p.imageUrl)).length;

  // Build the complete Sync Payload containing products (with photos), categories, zones, and policies
  const generateCatalogPayload = (): CatalogSyncPayload => {
    return {
      version: `distripro-v${Date.now()}`,
      generatedAt: new Date().toISOString(),
      timestamp: Date.now(),
      senderRole: 'admin',
      message: 'Catálogo mayorista oficial DistriPro con fotos y precios actualizados',
      products: products, // All products with imageUrl!
      clients: clients,
      categories: categories,
      zones: zones,
      cashDiscountPercent: cashDiscountPercent,
      bankInfo: bankInfo,
    };
  };

  // Download the JSON file
  const handleDownloadCatalogJson = () => {
    const payload = generateCatalogPayload();
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalogo_distripro_con_fotos_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onTriggerToast(
      'Archivo JSON Descargado',
      `Se descargó catalogo_distripro_con_fotos.json (${(blob.size / 1024).toFixed(1)} KB). Adjúntalo en WhatsApp.`
    );
  };

  // Copy JSON to clipboard
  const handleCopyCatalogJson = () => {
    const payload = generateCatalogPayload();
    const jsonString = JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
    onTriggerToast(
      'Código JSON Copiado',
      'Puedes pegarlo directamente en el chat de WhatsApp o en la app del cliente.'
    );
  };

  // Send to a specific client via WhatsApp
  const handleSendToClient = (client: Client) => {
    // 1. Auto-download JSON so user has the file in their hands
    handleDownloadCatalogJson();

    // 2. Prepare WhatsApp message
    const cleanPhone = client.phone.replace(/[^0-9]/g, '');
    const filename = `catalogo_distripro_con_fotos_${new Date().toISOString().slice(0, 10)}.json`;

    const message = `*DISTRIPRO S.A. - CATÁLOGO MAYORISTA OFICIAL CON FOTOS*%0A%0A` +
      `Hola *${client.name}* (${client.code}),%0A` +
      `Te adjunto el archivo *${filename}* con la lista completa de ${products.length} productos, fotos en alta calidad, nuevos precios mayoristas y *${cashDiscountPercent}% de descuento* por pago contado en efectivo.%0A%0A` +
      `📲 *¿CÓMO ACTUALIZAR TU APP DISTRIPRO CON ESTE ARCHIVO?*%0A` +
      `1️⃣ Abrí la app DistriPro en tu celular o PC.%0A` +
      `2️⃣ Tocá el botón verde arriba a la derecha (*Actualizar Catálogo por WhatsApp*).%0A` +
      `3️⃣ Seleccioná este archivo JSON adjunto.%0A%0A` +
      `¡Listo! Tu app se actualizará al instante con todas las fotos y precios vigentes.%0A%0A` +
      `_Casa Central DistriPro - ${bankInfo.bankName}_`;

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(url, '_blank');
    onTriggerToast('WhatsApp Abierto', `Enviando archivo de catálogo a ${client.name}`);
  };

  // Formatted Text Alternative
  const formattedTextCatalog = React.useMemo(() => {
    const dateStr = new Date().toLocaleDateString('es-AR');
    let text = `📦 *DISTRIPRO S.A. - LISTA MAYORISTA (${dateStr})*\n`;
    text += `🔥 *${cashDiscountPercent}% OFF POR PAGO EN EFECTIVO*\n\n`;

    categories.forEach((cat) => {
      const catProds = products.filter((p) => p.category === cat);
      if (catProds.length > 0) {
        text += `🔹 *${cat.toUpperCase()}*\n`;
        catProds.forEach((p) => {
          text += `• *${p.name}* (${p.presentation}) - *$${p.priceWholesale.toLocaleString('es-AR')}* x ${p.unitType}\n`;
        });
        text += `\n`;
      }
    });

    text += `🏦 *PAGOS POR TRANSFERENCIA / QR:*\n`;
    text += `Alias: *${bankInfo.alias}*\n`;
    text += `CBU: ${bankInfo.cbu}\n`;
    text += `Titular: ${bankInfo.accountHolder}\n\n`;
    text += `_Precios sujetos a cambio sin previo aviso. Pedidos al WhatsApp o a tu preventista._`;
    return text;
  }, [products, categories, cashDiscountPercent, bankInfo]);

  const handleCopyTextCatalog = () => {
    navigator.clipboard.writeText(formattedTextCatalog);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    onTriggerToast('Texto Copiado', 'Lista de precios en texto copiada al portapapeles.');
  };

  // Selected client for top action card
  const activeSelectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Filter clients list
  const filteredClients = clients.filter((c) => {
    const term = clientSearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.zone.toLowerCase().includes(term) ||
      c.phone.includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0]">
        <div className="flex items-center gap-2.5 text-emerald-700">
          <LocalIcon name="chat" className="w-6 h-6" />
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-[#00236f]">
            Envío de Catálogos por WhatsApp (Archivos JSON con Fotos)
          </h1>
        </div>
        <p className="text-[13px] text-[#64748b] mt-1">
          Genera y envía por WhatsApp el archivo JSON oficial que actualiza la aplicación de tus clientes con todas las fotos de productos, precios mayoristas vigentes y rubros en un solo clic.
        </p>
      </div>

      {/* Primary JSON Sharing Package Card */}
      <div className="bg-gradient-to-br from-[#00236f] via-[#001950] to-[#000f33] text-white p-6 rounded-2xl shadow-md border border-[#1e3a8a] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-500 text-white font-mono text-[11px] font-bold rounded-full">
                FORMATO JSON OFICIAL
              </span>
              <span className="text-[12px] text-[#82f5c1] font-semibold flex items-center gap-1">
                <LocalIcon name="verified" className="w-4 h-4" />
                <span>Compatible con la App DistriPro Móvil</span>
              </span>
            </div>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-white mt-1">
              Paquete de Catálogo con Fotos para Clientes y Preventistas
            </h2>
            <p className="text-[13px] text-[#dce1ff] max-w-2xl mt-0.5">
              Al enviar este archivo JSON por WhatsApp, el cliente lo descarga y lo abre con el botón "Actualizar Catálogo por WhatsApp" dentro de su app, renovando automáticamente fotos, precios y stock.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadCatalogJson}
              className="h-11 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[13px] rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <LocalIcon name="download" className="w-5 h-5 text-white" />
              <span>📥 Descargar Archivo JSON con Fotos</span>
            </button>
          </div>
        </div>

        {/* Stats Pill Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-[#90a8ff] block">Productos Totales</span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[20px] text-white">
              {products.length}
            </span>
            <span className="text-[10px] text-amber-300 block">
              {products.filter((p) => p.isOffer).length} en Oferta / Promo
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-[#82f5c1] block">Productos con Foto</span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[20px] text-[#82f5c1]">
              {productsWithImageCount} <span className="text-[11px] text-white/70">({Math.round((productsWithImageCount / Math.max(1, products.length)) * 100)}%)</span>
            </span>
            <span className="text-[10px] text-emerald-300 block">Fotos optimizadas</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-[#90a8ff] block">Rubros Comerciales</span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[20px] text-white">
              {categories.length}
            </span>
            <span className="text-[10px] text-[#90a8ff] block">
              {zones.length} zonas de reparto
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-[11px] text-[#90a8ff] block">Clientes Sincronizados</span>
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[20px] text-emerald-300">
              {clients.length}
            </span>
            <span className="text-[10px] text-emerald-200 block">
              {clients.filter((c) => c.canAccessApp !== false).length} habilitados en App
            </span>
          </div>

          <div className="bg-amber-500/20 backdrop-blur-xs p-3 rounded-xl border border-amber-400/40 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-200 block font-semibold">Desc. Contado Efectivo</span>
              <span className="text-[9px] bg-amber-400/30 text-amber-200 px-1 rounded uppercase font-bold">Editable</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="number"
                min="0"
                max="100"
                value={cashDiscountPercent}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                  if (onUpdateCashDiscount) {
                    onUpdateCashDiscount(val);
                  }
                }}
                className="w-14 h-8 px-1 text-center rounded-lg bg-white text-[#00236f] font-mono font-black text-[16px] border border-amber-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <span className="font-black text-[16px] text-amber-300">% OFF</span>
            </div>
            <span className="text-[10px] text-amber-200/90 block mt-0.5">Se actualiza en el JSON</span>
          </div>
        </div>

        {/* Quick WhatsApp Sender Box */}
        <div className="bg-white/10 p-4 rounded-xl border border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-[280px] flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#25d366]/20 text-[#25d366] flex items-center justify-center shrink-0">
              <LocalIcon name="send" className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] text-[#82f5c1] font-semibold block">
                Enviar Archivo JSON a un Cliente Específico:
              </span>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full h-9 mt-0.5 px-3 rounded-lg bg-white text-[#0b1c30] text-[13px] font-semibold focus:outline-none"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - {c.phone} - {c.zone}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => activeSelectedClient && handleSendToClient(activeSelectedClient)}
              className="h-10 px-4 bg-[#25d366] hover:bg-[#20ba59] text-white font-bold text-[13px] rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <LocalIcon name="share" className="w-4.5 h-4.5" />
              <span>📲 Enviar por WhatsApp con Archivo JSON</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCatalogJson}
              className="h-10 px-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-[12px] rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Copiar código JSON completo"
            >
              <LocalIcon name="content_copy" className="w-4 h-4" />
              <span>{copiedJson ? '¡Copiado!' : 'Copiar JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory of Clients with 1-Click WhatsApp Button */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#e2e8f0] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[17px] text-[#00236f]">
              Directorio de Comercios para Enviar Catálogo JSON
            </h2>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Haz clic en el botón de WhatsApp de cualquier cliente para enviarle el catálogo oficial con fotos.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <LocalIcon
              name="search"
              className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Buscar por comercio o zona..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4">Código</th>
                <th className="py-2.5 px-4">Comercio</th>
                <th className="py-2.5 px-4">Zona</th>
                <th className="py-2.5 px-4">Teléfono</th>
                <th className="py-2.5 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-[#00236f]">
                    {client.code}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-[#0b1c30]">
                    {client.name}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {client.zone}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[12px] text-[#444651]">
                    {client.phone}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleSendToClient(client)}
                      className="h-8 px-3 bg-[#25d366]/15 hover:bg-[#25d366]/30 text-[#075e54] font-bold text-[12px] rounded-lg border border-[#25d366]/40 inline-flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <LocalIcon name="send" className="w-3.5 h-3.5" />
                      <span>Enviar Catálogo JSON</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alternative Option: Text-Formatted WhatsApp Message */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#e2e8f0] p-5 space-y-3">
        <button
          type="button"
          onClick={() => setShowTextCatalog(!showTextCatalog)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div>
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#00236f] flex items-center gap-2">
              <LocalIcon name="description" className="w-4 h-4 text-[#64748b]" />
              <span>Ver Alternativa en Texto Formateado para WhatsApp</span>
            </h3>
            <p className="text-[12px] text-[#64748b] mt-0.5">
              Por si necesitas enviar la lista en texto sin fotos a un cliente que no pueda descargar archivos.
            </p>
          </div>
          <LocalIcon
            name={showTextCatalog ? 'expand_less' : 'expand_more'}
            className="w-5 h-5 text-[#64748b]"
          />
        </button>

        {showTextCatalog && (
          <div className="pt-3 border-t border-[#f1f5f9] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCopyTextCatalog}
                className="h-8 px-3 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] font-bold text-[11px] rounded-lg border border-[#bfdbfe] flex items-center gap-1.5 cursor-pointer"
              >
                <LocalIcon name="content_copy" className="w-3.5 h-3.5" />
                <span>{copiedText ? '¡Copiado!' : 'Copiar Texto Completo'}</span>
              </button>
            </div>

            <pre className="p-4 bg-[#f8f9ff] text-[#111b21] rounded-xl border border-[#cbd5e1] font-sans text-[12px] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {formattedTextCatalog}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
