import React, { useState } from 'react';
import { SyncBatchInfo, Order, UserRole, Client } from '../types';
import { LocalIcon } from './LocalIcon';

interface SyncViewProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  syncBatch: SyncBatchInfo;
  pendingOrders: Order[];
  onGenerateNewBatch: () => void;
  onSendBatchWhatsApp: () => void;
  onDownloadDistFile: () => void;
  onMarkAllSynced: () => void;
  userRole?: UserRole;
  client?: Client;
  onOpenWhatsAppCatalogModal?: () => void;
  onOpenManualTecnico?: () => void;
  productsCount?: number;
}

export const SyncView: React.FC<SyncViewProps> = ({
  isOnline,
  onToggleOnline,
  syncBatch,
  pendingOrders,
  onGenerateNewBatch,
  onSendBatchWhatsApp,
  onDownloadDistFile,
  onMarkAllSynced,
  userRole = 'vendedor',
  client,
  onOpenWhatsAppCatalogModal,
  onOpenManualTecnico,
  productsCount = 8,
}) => {
  const [lastSyncTime, setLastSyncTime] = useState<string>('Hoy, 14:35 hs');
  const [syncInProgress, setSyncInProgress] = useState(false);

  const isClient = userRole === 'cliente';

  const handleSimulateSync = () => {
    setSyncInProgress(true);
    setTimeout(() => {
      setSyncInProgress(false);
      onMarkAllSynced();
      const now = new Date();
      setLastSyncTime(`Hoy, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} hs`);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-20 space-y-3">
      {/* Client-Focused View */}
      {isClient ? (
        <>
          {/* Client WhatsApp Catalog Sync Card */}
          <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-xl bg-[#82f5c1] text-[#00714e] flex items-center justify-center shrink-0">
                  <LocalIcon name="cloud_sync" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#00236f]">
                    Actualización de Catálogo vía WhatsApp
                  </h3>
                  <p className="text-[12px] text-[#444651]">
                    Comercio: <strong>{client?.name}</strong> ({client?.code})
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#dce9ff] space-y-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#444651]">Productos cargados en tu app:</span>
                <span className="font-bold text-[#00236f]">{productsCount} artículos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#444651]">Última actualización de precios:</span>
                <span className="font-bold text-[#006c4a]">Hoy (Lista Vigente)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#444651]">Formato de archivo soportado:</span>
                <span className="font-mono font-bold text-[#00236f]">.dist / .json</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onOpenWhatsAppCatalogModal}
                className="w-full h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <LocalIcon name="upload_file" className="w-5 h-5" />
                <span>Cargar Archivo de Catálogo Recibido</span>
              </button>

              <button
                type="button"
                onClick={onOpenWhatsAppCatalogModal}
                className="w-full h-10 bg-[#25d366]/15 hover:bg-[#25d366]/25 text-[#075e54] font-bold text-[12px] rounded-xl flex items-center justify-center gap-2 border border-[#25d366]/30 cursor-pointer transition-all"
              >
                <LocalIcon name="chat" className="w-4.5 h-4.5" />
                <span>Pedir Catálogo Actualizado por WhatsApp al Preventista</span>
              </button>
            </div>
          </section>

          {/* Connection Mode Banner */}
          <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LocalIcon name="wifi" className="text-[#006c4a] w-5 h-5" />
                <span className="font-bold text-[13px] text-[#0b1c30]">
                  Operación Local sin Internet
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] text-[10px] font-bold">
                Offline Listo
              </span>
            </div>
            <p className="text-[12px] text-[#444651]">
              Puedes armar tus pedidos en cualquier momento aun si te quedas sin conexión o datos móviles. Los pedidos se despachan directamente por WhatsApp.
            </p>
          </section>
        </>
      ) : (
        /* Vendor-Focused View */
        <>
          {/* 1. Connection Mode Banner */}
          <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isOnline ? 'bg-[#82f5c1] text-[#00714e]' : 'bg-[#ffdad6] text-[#ba1a1a]'
                  }`}
                >
                  <LocalIcon name={isOnline ? 'wifi' : 'wifi_off'} className="w-5.5 h-5.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#0b1c30]">
                    {isOnline ? 'Modo Online (Conectado)' : 'Modo Calle (Offline Activo)'}
                  </span>
                  <span className="text-[11px] text-[#444651]">
                    {isOnline
                      ? 'Conexión a servidor central activa'
                      : 'Operando con almacenamiento local cifrado'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleOnline}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
                  isOnline
                    ? 'bg-[#dce9ff] text-[#00236f] hover:bg-[#cbdbf5]'
                    : 'bg-[#82f5c1] text-[#00714e]'
                }`}
              >
                {isOnline ? 'Simular Offline' : 'Activar Online'}
              </button>
            </div>

            <div className="p-3 bg-[#eff4ff] rounded-lg border border-[#dce9ff] flex items-center justify-between text-[12px]">
              <span className="text-[#444651]">Última sincronización con Casa Central:</span>
              <span className="font-bold text-[#00236f]">{lastSyncTime}</span>
            </div>
          </section>

          {/* Catalog Share for Clients */}
          <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LocalIcon name="share" className="text-[#00236f] w-5.5 h-5.5" />
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30]">
                  Enviar Catálogo a Comercios vía WhatsApp
                </h3>
              </div>
            </div>
            <p className="text-[12px] text-[#444651]">
              Genera el archivo <code className="font-mono bg-blue-50 px-1 py-0.5 rounded text-[#00236f]">.dist</code> con precios vigentes (sin visibilidad de stock interno de furgón) y envíalo por WhatsApp a tus clientes para que hagan pedidos.
            </p>
            <button
              type="button"
              onClick={onOpenWhatsAppCatalogModal}
              className="w-full h-10 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-[12px] rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <LocalIcon name="send_to_mobile" className="w-4.5 h-4.5" />
              <span>Generar y Compartir Catálogo para Clientes</span>
            </button>
          </section>

          {/* 2. WhatsApp Batch File Container */}
          <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#82f5c1] text-[#00714e] flex items-center justify-center">
                  <LocalIcon name="all_inbox" className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#0b1c30]">
                    Lote Cifrado .dist para WhatsApp
                  </h3>
                  <span className="text-[11px] text-[#444651]">
                    Protocolo de respaldo de emergencia fuera de cobertura
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#82f5c1] text-[#00714e] text-[11px] font-bold">
                Listo para enviar
              </span>
            </div>

            {/* Lote card */}
            <div className="bg-[#f8f9ff] p-3 rounded-lg border border-[#e5eeff] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#444651]">Archivo de Lote:</span>
                <span className="font-mono font-bold text-[12px] text-[#00236f]">
                  {syncBatch.filename}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#e2e8f0]">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#444651]">Pedidos Incluidos</span>
                  <span className="font-bold text-[14px] text-[#0b1c30]">
                    {syncBatch.ordersCount + pendingOrders.length}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#444651]">Cobranzas</span>
                  <span className="font-bold text-[14px] text-[#0b1c30]">
                    {syncBatch.paymentsCount}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#444651]">Tamaño Cifrado</span>
                  <span className="font-bold text-[14px] text-[#0b1c30]">
                    {syncBatch.sizeKb} KB
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onSendBatchWhatsApp}
                className="w-full h-11 bg-[#006c4a] hover:bg-[#005137] text-white font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <LocalIcon name="share" className="w-5 h-5" />
                <span>Enviar Lote por WhatsApp a Casa Central</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onDownloadDistFile}
                  className="flex-1 h-9 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] font-bold text-[12px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LocalIcon name="download" className="w-4 h-4" />
                  <span>Descargar .dist</span>
                </button>

                <button
                  type="button"
                  onClick={onGenerateNewBatch}
                  className="flex-1 h-9 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] font-bold text-[12px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LocalIcon name="refresh" className="w-4 h-4" />
                  <span>Regenerar Lote</span>
                </button>
              </div>
            </div>
          </section>

          {/* 3. Online sync button */}
          <section className="bg-white p-4 rounded-xl shadow-xs border border-[#e2e8f0] space-y-2">
            <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30]">
              Sincronización Directa por Red
            </h4>
            <p className="text-[12px] text-[#444651]">
              Envía los datos directamente a la API de Casa Central cuando tengas señal 4G/WiFi.
            </p>
            <button
              type="button"
              onClick={handleSimulateSync}
              disabled={syncInProgress}
              className={`w-full h-11 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                syncInProgress
                  ? 'bg-slate-200 text-slate-500'
                  : 'bg-[#00236f] hover:bg-[#1e3a8a] text-white shadow-md'
              }`}
            >
              <LocalIcon
                name="sync"
                className={`w-4.5 h-4.5 ${syncInProgress ? 'animate-spin' : ''}`}
              />
              <span>
                {syncInProgress
                  ? 'Transmitiendo datos a Central...'
                  : 'Sincronizar Todo con Casa Central'}
              </span>
            </button>
          </section>
        </>
      )}

      {/* Manual Técnico y Despliegue en Producción Card */}
      {onOpenManualTecnico && (
        <section className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#dce9ff] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#00236f] text-[#82f5c1] flex items-center justify-center shrink-0">
              <LocalIcon name="menu_book" className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h5 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[13px] text-[#00236f] truncate">
                Manual Técnico de Producción
              </h5>
              <p className="text-[11px] text-[#757682] truncate">
                Guía de arquitectura, comandos de compilación, Nginx, Docker y PWA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenManualTecnico}
            className="h-8 px-3 bg-white hover:bg-slate-100 text-[#00236f] font-bold text-[11px] rounded-lg border border-[#dce9ff] shrink-0 cursor-pointer shadow-xs transition-all"
          >
            Ver Manual
          </button>
        </section>
      )}
    </div>
  );
};

