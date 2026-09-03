import React, { useState, useRef } from 'react';
import { Product, UserRole, Client, BankInfo, CatalogSyncPayload } from '../types';
import { LocalIcon } from './LocalIcon';

interface WhatsAppCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  client?: Client;
  currentProducts: Product[];
  currentClients: Client[];
  cashDiscountPercent: number;
  bankInfo?: BankInfo;
  onUpdateCatalog: (data: {
    products: Product[];
    clients?: Client[];
    cashDiscountPercent?: number;
    bankInfo?: BankInfo;
    message: string;
    newClientsAddedCount?: number;
  }) => void;
}

export const WhatsAppCatalogModal: React.FC<WhatsAppCatalogModalProps> = ({
  isOpen,
  onClose,
  userRole,
  client,
  currentProducts,
  currentClients,
  cashDiscountPercent,
  bankInfo = {
    alias: 'DISTRI.PRO.PAGOS',
    cbu: '0000003100012345678901',
    bankName: 'Banco Galicia',
    accountHolder: 'DistriPro S.A. Mayorista',
    cuit: '30-71234567-8',
  },
  onUpdateCatalog,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handler for parsing uploaded file
  const handleProcessFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        let incomingProducts: Product[] = [];
        let incomingClients: Client[] = [];
        let incomingDiscount: number | undefined = undefined;
        let incomingBank: BankInfo | undefined = undefined;

        if (Array.isArray(parsed)) {
          incomingProducts = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          if (Array.isArray(parsed.products)) {
            incomingProducts = parsed.products;
          } else if (Array.isArray(parsed.catalog)) {
            incomingProducts = parsed.catalog;
          }

          if (Array.isArray(parsed.clients)) {
            incomingClients = parsed.clients;
          }

          if (typeof parsed.cashDiscountPercent === 'number') {
            incomingDiscount = parsed.cashDiscountPercent;
          }

          if (parsed.bankInfo && typeof parsed.bankInfo === 'object') {
            incomingBank = parsed.bankInfo;
          }
        }

        if (incomingProducts.length === 0 && incomingClients.length === 0) {
          throw new Error('El archivo no contiene productos ni clientes reconocibles.');
        }

        // Merge clients if provided
        let mergedClients = currentClients;
        let newCount = 0;
        if (incomingClients.length > 0) {
          const existingIds = new Set(currentClients.map((c) => c.id));
          const existingCodes = new Set(currentClients.map((c) => c.code.toUpperCase()));

          // Update existing or add new
          const updatedList = currentClients.map((existing) => {
            const match = incomingClients.find(
              (inc) => inc.id === existing.id || inc.code.toUpperCase() === existing.code.toUpperCase()
            );
            return match ? { ...existing, ...match } : existing;
          });

          // Append totally new clients
          const brandNew = incomingClients.filter(
            (inc) => !existingIds.has(inc.id) && !existingCodes.has(inc.code.toUpperCase())
          );
          newCount = brandNew.length;
          mergedClients = [...updatedList, ...brandNew];
        }

        const finalProducts = incomingProducts.length > 0 ? incomingProducts : currentProducts;

        onUpdateCatalog({
          products: finalProducts,
          clients: incomingClients.length > 0 ? mergedClients : undefined,
          cashDiscountPercent: incomingDiscount,
          bankInfo: incomingBank,
          newClientsAddedCount: newCount,
          message: `Sincronización exitosa desde "${file.name}": ${finalProducts.length} productos y ${mergedClients.length} clientes actualizados (${newCount} comercios nuevos dados de alta).`,
        });

        setStatusMessage(
          `¡Éxito! ${finalProducts.length} productos y ${mergedClients.length} clientes actualizados.`
        );

        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err) {
        setStatusMessage(
          'Error al procesar el archivo. Asegúrate de que sea un archivo .dist o .json válido recibido de DistriPro.'
        );
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Demo update simulation
  const handleLoadDemoUpdate = () => {
    // 1. Updated catalog products with wholesale prices
    const updatedCatalog: Product[] = [
      ...currentProducts.map((p) => ({
        ...p,
        priceWholesale: Math.round(p.priceWholesale * 0.95), // 5% promo discount on catalog
      })),
      {
        id: 'prod-9',
        sku: 'CAFE-DOL-170',
        name: 'Café Instantáneo Dolca Frasco 170g',
        brand: 'Nescafé Dolca',
        presentation: 'cajas x 12 unidades',
        category: 'Almacén',
        priceWholesale: 32500,
        unitType: 'cajas',
        unitsPerPack: 12,
        stockTruck: 10,
        stockCentral: 180,
        barcode: '779123456789',
        codePrefix: '3c',
      },
      {
        id: 'prod-10',
        sku: 'CRI-GAL-300',
        name: 'Galletitas Criollitas 300g (Pack x 3)',
        brand: 'Bagley',
        presentation: 'fardos x 16 paquetes',
        category: 'Almacén',
        priceWholesale: 18900,
        unitType: 'bultos',
        unitsPerPack: 16,
        stockTruck: 12,
        stockCentral: 260,
        barcode: '779123456790',
        codePrefix: '2b',
      },
    ];

    // 2. Updated clients including NEW clients created on website/central with defined credit limits!
    const newClient1: Client = {
      id: 'cli-1052',
      code: '#CLI-1052',
      name: 'Minimercado El Trébol',
      businessName: 'El Trébol Almacén Gourmet S.R.L.',
      address: 'Av. Corrientes 3420, Almagro',
      zone: 'Zona 04 Centro',
      phone: '+54 9 11 2345-1052',
      currentDebt: 0,
      creditLimit: 450000,
      geofenceStatus: 'in_range',
      distanceMeters: 50,
      status: 'pending',
      lastVisit: 'Nunca',
    };

    const newClient2: Client = {
      id: 'cli-1053',
      code: '#CLI-1053',
      name: 'Autoservicio La Ribera',
      businessName: 'Distribuciones La Ribera',
      address: 'Paseo Colón 880, San Telmo',
      zone: 'Zona 04 Centro',
      phone: '+54 9 11 8877-1053',
      currentDebt: 0,
      creditLimit: 300000,
      geofenceStatus: 'nearby',
      distanceMeters: 120,
      status: 'pending',
      lastVisit: 'Nunca',
    };

    // Check if new clients already exist
    const existingCodes = new Set(currentClients.map((c) => c.code));
    const mergedClients = [...currentClients];
    if (!existingCodes.has(newClient1.code)) mergedClients.push(newClient1);
    if (!existingCodes.has(newClient2.code)) mergedClients.push(newClient2);

    // Pass 10% cash discount
    const newCashDiscount = 10;

    onUpdateCatalog({
      products: updatedCatalog,
      clients: mergedClients,
      cashDiscountPercent: newCashDiscount,
      newClientsAddedCount: 2,
      message: `¡Catálogo y Clientes sincronizados vía WhatsApp! Se agregaron 2 nuevos comercios (#CLI-1052 y #CLI-1053) con límites de crédito asignados, 10 productos actualizados y ${newCashDiscount}% de descuento por pago en efectivo.`,
    });

    setStatusMessage('¡Catálogo, Comercios Nuevos y Descuentos Sincronizados!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Request catalog via WhatsApp from vendor
  const handleRequestViaWhatsApp = () => {
    const clientName = client ? `${client.name} (${client.code})` : 'Mi Comercio';
    const message = encodeURIComponent(
      `*SOLICITUD DE CATÁLOGO Y ALTA DE COMERCIO - DISTRIPRO*\n\nHola Preventa DistriPro,\nSolicito el archivo actualizado (.dist o .json) con los precios de hoy y la lista de clientes para mi comercio:\n*${clientName}*\n\n¡Muchas gracias!`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Export & Share catalog file for clients (Vendor feature)
  const handleExportCatalogForClients = () => {
    const clientCatalog = currentProducts.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      presentation: p.presentation,
      category: p.category,
      priceWholesale: p.priceWholesale,
      unitType: p.unitType,
      unitsPerPack: p.unitsPerPack,
      barcode: p.barcode,
      codePrefix: p.codePrefix,
    }));

    const catalogPayload: CatalogSyncPayload = {
      version: 'distripro-catalogo-v3.9',
      date: new Date().toISOString(),
      vendor: 'David C.',
      zone: 'Zona 04 Centro',
      cashDiscountPercent: cashDiscountPercent,
      bankInfo: bankInfo,
      catalog: clientCatalog,
      clients: currentClients,
    };

    const blob = new Blob([JSON.stringify(catalogPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `distripro_catalogo_y_clientes_${new Date().toISOString().slice(0, 10)}.dist`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Share link to WhatsApp
    const message = encodeURIComponent(
      `*DISTRIPRO S.A. - CATÁLOGO Y CLIENTES ACTUALIZADOS*\n\nEstimado cliente, te compartimos el archivo *.dist con los precios vigentes, bonificación del ${cashDiscountPercent}% en efectivo, datos bancarios para transferencia y la lista de comercios autorizados con sus límites de crédito.`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="bg-[#00236f] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LocalIcon name="cloud_download" className="w-6 h-6 text-[#82f5c1]" />
            <div>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px]">
                Actualizar Catálogo y Clientes
              </h3>
              <p className="text-[11px] text-[#90a8ff]">
                Sincronización de lista de precios y comercios vía WhatsApp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 cursor-pointer"
          >
            <LocalIcon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5">
          {statusMessage && (
            <div className="p-3 bg-[#eff4ff] text-[#00236f] font-semibold text-[12px] rounded-xl border border-[#82f5c1] flex items-center gap-2">
              <LocalIcon name="verified" className="w-5 h-5 text-[#006c4a]" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Info Banner */}
          <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#dce9ff] text-[12px] text-[#444651] space-y-1">
            <p className="font-bold text-[#00236f] flex items-center gap-1.5">
              <LocalIcon name="chat" className="w-4 h-4 text-[#006c4a]" />
              ¿Qué incluye este archivo de WhatsApp?
            </p>
            <p>
              El archivo <code className="bg-blue-50 px-1 py-0.5 rounded text-[#00236f] font-mono">.dist</code> actualiza tanto los <strong>precios mayoristas</strong> del catálogo, el <strong>% de descuento en efectivo</strong> vigente, como también <strong>nuevos comercios dados de alta</strong> en la web con sus límites de crédito en cuenta corriente.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#006c4a] bg-[#eefcf5]'
                : 'border-[#dce9ff] bg-[#fbfdff] hover:bg-[#eff4ff]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".dist,.json,.txt"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-[#eff4ff] flex items-center justify-center text-[#00236f] mb-2">
              <LocalIcon name="upload_file" className="w-6 h-6" />
            </div>
            <p className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[13px] text-[#0b1c30]">
              Toca para seleccionar el archivo .dist recibido
            </p>
            <p className="text-[11px] text-[#757682] mt-1">
              Compatible con archivos de WhatsApp <code className="font-mono">.dist</code> o <code className="font-mono">.json</code>
            </p>
          </div>

          {/* Action options */}
          <div className="space-y-2 pt-1">
            {/* 1. Instant Demo Simulation */}
            <button
              type="button"
              onClick={handleLoadDemoUpdate}
              className="w-full h-11 bg-[#006c4a] hover:bg-[#005137] text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
            >
              <LocalIcon name="update" className="w-4.5 h-4.5" />
              <span>Simular Archivo WhatsApp (Nuevos Clientes + 10% Desc.)</span>
            </button>

            {/* 2. WhatsApp Request or Export */}
            {userRole === 'cliente' ? (
              <button
                type="button"
                onClick={handleRequestViaWhatsApp}
                className="w-full h-10 bg-[#25d366]/15 hover:bg-[#25d366]/25 text-[#075e54] font-bold text-[12px] rounded-xl flex items-center justify-center gap-2 border border-[#25d366]/30 cursor-pointer transition-all"
              >
                <LocalIcon name="send_to_mobile" className="w-4.5 h-4.5" />
                <span>Pedir Archivo Actualizado a Preventa por WhatsApp</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExportCatalogForClients}
                className="w-full h-10 bg-[#25d366]/15 hover:bg-[#25d366]/25 text-[#075e54] font-bold text-[12px] rounded-xl flex items-center justify-center gap-2 border border-[#25d366]/30 cursor-pointer transition-all"
              >
                <LocalIcon name="share" className="w-4.5 h-4.5" />
                <span>Exportar y Compartir Archivo .dist a Clientes</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
