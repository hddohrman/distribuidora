import React from 'react';
import { AuthSession } from '../types';
import { LocalIcon } from './LocalIcon';

interface HeaderProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  onOpenScanner: () => void;
  onOpenProfile: () => void;
  authSession: AuthSession | null;
  onSwitchRole: () => void;
  onOpenWhatsAppSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  onToggleOnline,
  onOpenScanner,
  onOpenProfile,
  authSession,
  onSwitchRole,
  onOpenWhatsAppSync,
}) => {
  const isClient = authSession?.role === 'cliente';

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-xl mx-auto h-16 px-3 flex items-center justify-between gap-2">
        {/* Logo & App Name */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            alt="DistriPro Logo"
            className="h-8 w-8 object-contain shrink-0 rounded-lg"
            src="/icon.svg"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#00236f] tracking-tight truncate leading-none">
                DistriPro
              </span>
              <button
                type="button"
                onClick={onToggleOnline}
                title="Toca para alternar estado de conexión"
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-['Inter',sans-serif] text-[10px] font-semibold transition-colors ${
                  isOnline
                    ? 'bg-[#82f5c1] text-[#00714e]'
                    : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-[#006c4a] animate-pulse' : 'bg-[#ba1a1a]'
                  }`}
                />
                {isOnline ? 'Online' : 'Offline'}
              </button>
            </div>

            {/* Role indicator / switch button */}
            <button
              type="button"
              onClick={onSwitchRole}
              title="Toca para cambiar entre Vendedor y Cliente"
              className="flex items-center gap-1 text-[11px] font-medium text-[#444651] hover:text-[#00236f] truncate text-left cursor-pointer"
            >
              <span
                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold tracking-tight uppercase ${
                  isClient
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-blue-100 text-[#00236f] border border-blue-200'
                }`}
              >
                {isClient ? 'Modo Cliente' : 'Modo Vendedor'}
              </span>
              <span className="truncate">
                {isClient
                  ? authSession?.client?.name || 'Cliente'
                  : authSession?.vendorName || 'David C.'}
              </span>
              <LocalIcon name="swap_horiz" className="w-3.5 h-3.5 text-[#757682]" />
            </button>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* WhatsApp catalog sync button */}
          <button
            type="button"
            onClick={onOpenWhatsAppSync}
            aria-label="Actualizar catálogo vía WhatsApp"
            title="Actualizar catálogo vía WhatsApp"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#006c4a] bg-[#82f5c1]/20 hover:bg-[#82f5c1]/40 active:scale-95 transition-all cursor-pointer border border-[#82f5c1]/40"
          >
            <LocalIcon name="cloud_sync" className="w-5 h-5 text-[#006c4a]" />
          </button>

          {!isClient && (
            <button
              type="button"
              onClick={onOpenScanner}
              aria-label="Buscar o escanear SKU"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#0b1c30] hover:bg-[#e5eeff] hover:text-[#00236f] active:scale-95 transition-all cursor-pointer"
            >
              <LocalIcon name="qr_code_scanner" className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Perfil y cambio de modo"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#00236f] cursor-pointer"
          >
            {isClient ? (
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[12px] ring-2 ring-amber-200">
                {authSession?.client?.name?.slice(0, 2).toUpperCase() || 'CL'}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#00236f] text-[#82f5c1] flex items-center justify-center font-bold text-[11px] ring-2 ring-[#dce9ff]">
                DC
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

