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
  onOpenWebAdmin?: () => void;
  onOpenOpciones?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  onToggleOnline,
  onOpenScanner,
  onOpenProfile,
  authSession,
  onSwitchRole,
  onOpenWhatsAppSync,
  onOpenWebAdmin,
  onOpenOpciones,
}) => {
  const isClient = authSession?.role === 'cliente';
  const isAdmin = authSession?.role === 'admin';

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
              title="Toca para cambiar de perfil o abrir Casa Central"
              className="flex items-center gap-1 text-[11px] font-medium text-[#444651] hover:text-[#00236f] truncate text-left cursor-pointer"
            >
              <span
                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold tracking-tight uppercase ${
                  isAdmin
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : isClient
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-blue-100 text-[#00236f] border border-blue-200'
                }`}
              >
                {isAdmin ? 'Casa Central' : isClient ? 'Modo Cliente' : 'Modo Vendedor'}
              </span>
              <span className="truncate">
                {isAdmin
                  ? 'Administración'
                  : isClient
                  ? authSession?.client?.name || 'Cliente'
                  : authSession?.vendorName || 'David C.'}
              </span>
              <LocalIcon name="swap_horiz" className="w-3.5 h-3.5 text-[#757682]" />
            </button>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick switch to Web Admin Portal */}
          {onOpenWebAdmin && (
            <button
              type="button"
              onClick={onOpenWebAdmin}
              title="Abrir Portal Web Casa Central (Gestión y Rentabilidad)"
              className="h-8 px-2 sm:px-2.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-[11px] font-bold rounded-lg border border-[#bfdbfe] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
            >
              <LocalIcon name="bar_chart" className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Web Central</span>
            </button>
          )}

          {/* WhatsApp catalog sync button */}
          <button
            type="button"
            onClick={onOpenWhatsAppSync}
            aria-label="Actualizar catálogo vía WhatsApp"
            title="Actualizar catálogo vía WhatsApp"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#006c4a] bg-[#82f5c1]/20 hover:bg-[#82f5c1]/40 active:scale-95 transition-all cursor-pointer border border-[#82f5c1]/40"
          >
            <LocalIcon name="cloud_sync" className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#006c4a]" />
          </button>

          {!isClient && (
            <button
              type="button"
              onClick={onOpenScanner}
              aria-label="Buscar o escanear SKU"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#0b1c30] hover:bg-[#e5eeff] hover:text-[#00236f] active:scale-95 transition-all cursor-pointer"
            >
              <LocalIcon name="qr_code_scanner" className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
          )}

          {onOpenOpciones && (
            <button
              type="button"
              onClick={onOpenOpciones}
              aria-label="Opciones y configuración de empresa"
              title="Opciones y configuración de empresa"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#0b1c30] hover:bg-[#e5eeff] hover:text-[#00236f] active:scale-95 transition-all cursor-pointer"
            >
              <LocalIcon name="settings" className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Perfil y cambio de modo"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#00236f] cursor-pointer"
          >
            {isAdmin ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[11px] ring-2 ring-emerald-200">
                ADM
              </div>
            ) : isClient ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[11px] ring-2 ring-amber-200">
                {authSession?.client?.name?.slice(0, 2).toUpperCase() || 'CL'}
              </div>
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00236f] text-[#82f5c1] flex items-center justify-center font-bold text-[11px] ring-2 ring-[#dce9ff]">
                DC
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

