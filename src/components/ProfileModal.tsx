import React from 'react';
import { AuthSession } from '../types';
import { LocalIcon } from './LocalIcon';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCount: number;
  authSession: AuthSession | null;
  onSwitchRole: () => void;
  onOpenManualTecnico?: () => void;
  onOpenWebAdmin?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  pendingCount,
  authSession,
  onSwitchRole,
  onOpenManualTecnico,
  onOpenWebAdmin,
}) => {
  if (!isOpen) return null;

  const isClient = authSession?.role === 'cliente';
  const isAdmin = authSession?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#00236f] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[16px] ring-2 ring-emerald-300">
                ADM
              </div>
            ) : isClient ? (
              <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[18px] ring-2 ring-amber-300">
                {authSession?.client?.name.slice(0, 2).toUpperCase() || 'CL'}
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#1e3a8a] text-[#82f5c1] flex items-center justify-center font-bold text-[16px] ring-2 ring-[#82f5c1]">
                DC
              </div>
            )}
            <div>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px]">
                {isAdmin
                  ? 'Casa Central / Administración'
                  : isClient
                  ? authSession?.client?.name
                  : authSession?.vendorName || 'David C.'}
              </h3>
              <p className="text-[12px] text-[#90a8ff]">
                {isAdmin
                  ? 'Control Comercial, Productos y Rentabilidad'
                  : isClient
                  ? `Comercio Registrado • ${authSession?.client?.code}`
                  : 'Preventista Senior • ID #PREV-402'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white cursor-pointer"
          >
            <LocalIcon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="p-4 space-y-3 text-[12px] text-[#0b1c30]">
          <div className="space-y-1.5 bg-[#eff4ff] p-3 rounded-xl border border-[#dce9ff]">
            {isAdmin ? (
              <>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Nivel de Acceso:</span>
                  <span className="font-bold text-emerald-800">Super Admin / Gerencia</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Módulos Habilitados:</span>
                  <span className="font-bold text-[#00236f]">ABM Productos, Clientes, Rentabilidad</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Canal de Difusión:</span>
                  <span className="font-bold text-[#006c4a]">WhatsApp Automático</span>
                </div>
              </>
            ) : isClient ? (
              <>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Código de Cliente:</span>
                  <span className="font-bold font-mono text-[#00236f]">
                    {authSession?.client?.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Dirección:</span>
                  <span className="font-bold">{authSession?.client?.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Teléfono:</span>
                  <span className="font-bold">{authSession?.client?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Catálogo de Cliente:</span>
                  <span className="font-bold text-[#006c4a]">
                    Solo pedido (Stock oculto)
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Zona Asignada:</span>
                  <span className="font-bold">Zona 04 Centro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Turno:</span>
                  <span className="font-bold">Tarde (13:00 a 19:30 hs)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Móvil / Vehículo:</span>
                  <span className="font-bold">Móvil #14 - Furgón Sprinter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Permisos:</span>
                  <span className="font-bold text-[#00236f]">
                    Acceso Total (Stock + Precios + Clientes)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#444651]">Ventas sin sincronizar:</span>
                  <span className="font-bold text-[#ba1a1a]">{pendingCount} pendientes</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-1 text-[#444651]">
            <p><strong>DistriPro Suite v3.8.4</strong> (Web Admin + Mobile Offline)</p>
            <p>Base de datos local segura • Cero llamadas a CDN externas</p>
          </div>

          <div className="pt-2 space-y-2">
            {onOpenWebAdmin && !isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWebAdmin();
                }}
                className="w-full h-10 bg-emerald-700 hover:bg-emerald-800 text-white text-[13px] font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <LocalIcon name="bar_chart" className="w-4.5 h-4.5" />
                <span>Abrir Portal Web Casa Central</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchRole();
              }}
              className="w-full h-10 bg-[#00236f] hover:bg-[#1e3a8a] text-white text-[13px] font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <LocalIcon name="swap_horiz" className="w-4.5 h-4.5" />
              <span>Cambiar Perfil / Iniciar Sesión</span>
            </button>

            {onOpenManualTecnico && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManualTecnico();
                }}
                className="w-full h-9 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] text-[12px] font-bold rounded-lg border border-[#dce9ff] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <LocalIcon name="menu_book" className="w-4.5 h-4.5 text-[#006c4a]" />
                <span>Manual Técnico de Producción</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full h-9 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0b1c30] text-[12px] font-semibold rounded-lg cursor-pointer"
            >
              Cerrar Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

