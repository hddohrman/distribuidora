import React, { useState } from 'react';
import { Client, UserRole, AuthSession } from '../types';
import { LocalIcon } from './LocalIcon';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  clients: Client[];
  currentSession: AuthSession | null;
  onLogin: (session: AuthSession) => void;
  onOpenWhatsAppCatalog: () => void;
  canCancel?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  clients,
  currentSession,
  onLogin,
  onOpenWhatsAppCatalog,
  canCancel = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('vendedor');
  const [vendorPassword, setVendorPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clientCodeInput, setClientCodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    // Valid password check
    if (
      vendorPassword.trim() === 'distri123' ||
      vendorPassword.trim() === '1234' ||
      vendorPassword.trim() === 'admin'
    ) {
      onLogin({
        role: 'vendedor',
        vendorName: 'David C.',
        vendorId: 'PREV-402',
      });
      setVendorPassword('');
    } else {
      setErrorMessage('Contraseña incorrecta. (Prueba con: distri123 o 1234)');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (
      adminPassword.trim() === 'admin' ||
      adminPassword.trim() === 'distri123' ||
      adminPassword.trim() === '1234'
    ) {
      onLogin({
        role: 'admin',
        adminName: 'Administración Central',
      });
      setAdminPassword('');
    } else {
      setErrorMessage('Contraseña incorrecta. (Prueba con: admin o distri123)');
    }
  };

  const handleDirectAdminDemo = () => {
    onLogin({
      role: 'admin',
      adminName: 'Administración Central',
    });
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const sanitized = clientCodeInput.trim().toUpperCase().replace('#', '');
    const found = clients.find(
      (c) =>
        c.code.toUpperCase().replace('#', '') === sanitized ||
        c.id.toUpperCase().replace('CLI-', '') === sanitized ||
        c.name.toLowerCase().includes(clientCodeInput.trim().toLowerCase())
    );

    if (found) {
      if (found.canAccessApp === false) {
        setErrorMessage(
          `El cliente "${found.name}" no está habilitado para operar en la App. Solicita la activación a Administración Central.`
        );
        return;
      }
      onLogin({
        role: 'cliente',
        client: found,
      });
      setClientCodeInput('');
    } else {
      setErrorMessage(
        'Código no encontrado. Si eres un cliente nuevo, toca "Actualizar Catálogo y Clientes vía WhatsApp" para darte de alta.'
      );
    }
  };

  const handleSelectPredefinedClient = (client: Client) => {
    onLogin({
      role: 'cliente',
      client: client,
    });
  };

  const handleDirectVendorDemo = () => {
    onLogin({
      role: 'vendedor',
      vendorName: 'David C.',
      vendorId: 'PREV-402',
    });
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-[#dce9ff] animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#00236f] text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              alt="DistriPro Logo"
              className="h-8 w-8 object-contain rounded-lg shrink-0"
              src="/icon.svg"
            />
            <div>
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] leading-tight">
                Acceso a DistriPro
              </h2>
              <p className="text-[11px] text-[#90a8ff]">
                Selecciona tu perfil para ingresar al sistema
              </p>
            </div>
          </div>
          {canCancel && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 cursor-pointer"
            >
              <LocalIcon name="close" className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current status if already logged in */}
        {currentSession && (
          <div className="bg-[#eff4ff] px-4 py-2 text-[11px] text-[#00236f] flex items-center justify-between border-b border-[#dce9ff] shrink-0">
            <span>
              Sesión actual:{' '}
              <strong>
                {currentSession.role === 'admin'
                  ? 'Casa Central / Administración Web'
                  : currentSession.role === 'vendedor'
                  ? `Vendedor (${currentSession.vendorName})`
                  : `Cliente (${currentSession.client?.name})`}
              </strong>
            </span>
            <span className="text-[#006c4a] font-bold">Activo</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="p-4 pb-2 shrink-0">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#444651] mb-2">
            Tipo de Usuario
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-[#f0f4ff] p-1.5 rounded-xl border border-[#dce9ff]">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('vendedor');
                setErrorMessage('');
              }}
              className={`py-2 px-2 rounded-lg text-[11px] sm:text-[12px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-center ${
                selectedRole === 'vendedor'
                  ? 'bg-[#00236f] text-white shadow-sm'
                  : 'text-[#444651] hover:text-[#00236f]'
              }`}
            >
              <LocalIcon name="badge" className="w-4 h-4" />
              <span>Vendedor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('cliente');
                setErrorMessage('');
              }}
              className={`py-2 px-2 rounded-lg text-[11px] sm:text-[12px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-center ${
                selectedRole === 'cliente'
                  ? 'bg-[#00236f] text-white shadow-sm'
                  : 'text-[#444651] hover:text-[#00236f]'
              }`}
            >
              <LocalIcon name="storefront" className="w-4 h-4" />
              <span>Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage('');
              }}
              className={`py-2 px-2 rounded-lg text-[11px] sm:text-[12px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-center ${
                selectedRole === 'admin'
                  ? 'bg-[#00236f] text-white shadow-sm'
                  : 'text-[#444651] hover:text-[#00236f]'
              }`}
            >
              <LocalIcon name="bar_chart" className="w-4 h-4 text-emerald-400" />
              <span>Casa Central</span>
            </button>
          </div>
        </div>

        {/* Form Body based on role */}
        <div className="p-4 pt-2 space-y-3.5 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-2.5 bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-[12px] flex items-center gap-2 font-medium">
              <LocalIcon name="error" className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {selectedRole === 'vendedor' ? (
            /* VENDEDOR FORM */
            <form onSubmit={handleVendorSubmit} className="space-y-3.5">
              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff] space-y-1.5">
                <div className="flex items-center gap-2 text-[#00236f] font-bold text-[13px]">
                  <LocalIcon name="lock" className="w-5 h-5 text-[#006c4a]" />
                  <span>Ingreso de Preventista / Repartidor</span>
                </div>
                <p className="text-[12px] text-[#444651]">
                  Acceso completo a pedidos, stock de furgón y depósito, ruta de clientes, arqueo de saldos y exportación de lotes.
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                  Contraseña de Vendedor
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa la contraseña..."
                    value={vendorPassword}
                    onChange={(e) => setVendorPassword(e.target.value)}
                    autoFocus
                    className="w-full h-11 pl-3 pr-10 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-[13px] font-medium text-[#0b1c30] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-[#444651] hover:text-[#0b1c30] p-1 cursor-pointer"
                  >
                    <LocalIcon name={showPassword ? 'close' : 'scan'} className="w-4.5 h-4.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#757682] mt-1">
                  Contraseña sugerida: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-[#00236f]">distri123</code>
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <LocalIcon name="login" className="w-4.5 h-4.5" />
                  <span>Ingresar como Vendedor</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectVendorDemo}
                  className="w-full h-9 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00236f] font-semibold text-[12px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <LocalIcon name="bolt" className="w-4 h-4" />
                  <span>Acceso Rápido Demo (David C. • Preventista)</span>
                </button>
              </div>
            </form>
          ) : selectedRole === 'admin' ? (
            /* CASA CENTRAL / WEB ADMIN FORM */
            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div className="bg-[#f0fdf4] p-3 rounded-xl border border-[#bbf7d0] space-y-1.5">
                <div className="flex items-center gap-2 text-[#14532d] font-bold text-[13px]">
                  <LocalIcon name="bar_chart" className="w-5 h-5 text-emerald-600" />
                  <span>Portal Web Casa Central & Gestión</span>
                </div>
                <p className="text-[12px] text-[#166534]">
                  Dashboard comercial, rentabilidad y márgenes de ganancia, alta y edición de clientes/productos y difusiones automáticas por WhatsApp.
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                  Contraseña de Administrador
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa la contraseña de admin..."
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    autoFocus
                    className="w-full h-11 pl-3 pr-10 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-[13px] font-medium text-[#0b1c30] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-[#444651] hover:text-[#0b1c30] p-1 cursor-pointer"
                  >
                    <LocalIcon name={showPassword ? 'close' : 'scan'} className="w-4.5 h-4.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#757682] mt-1">
                  Clave administrativa: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-[#00236f]">admin</code> o <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-[#00236f]">distri123</code>
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <LocalIcon name="login" className="w-4.5 h-4.5" />
                  <span>Ingresar a Casa Central</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectAdminDemo}
                  className="w-full h-9 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[12px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-emerald-200"
                >
                  <LocalIcon name="bolt" className="w-4 h-4 text-emerald-600" />
                  <span>Acceso Rápido Directo (Administrador)</span>
                </button>
              </div>
            </form>
          ) : (
            /* CLIENTE FORM */
            <form onSubmit={handleClientSubmit} className="space-y-3.5">
              {/* WhatsApp Pre-Update Box for New Clients */}
              <div className="p-3 bg-[#eefcf5] border border-[#a7f3d0] rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[12px] font-bold text-[#006c4a] flex items-center gap-1.5">
                      <LocalIcon name="cloud_download" className="w-4.5 h-4.5" />
                      <span>¿Cliente nuevo o primera vez usando la app?</span>
                    </span>
                    <p className="text-[11px] text-[#065f46] mt-0.5 leading-relaxed">
                      Si te diste de alta en el sitio web o recibiste un archivo <strong>.dist</strong> por WhatsApp, cárgalo aquí antes de entrar para actualizar la lista de clientes con tu comercio y tus límites de crédito.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenWhatsAppCatalog}
                  className="w-full py-2.5 px-3 bg-[#006c4a] hover:bg-[#005137] text-white text-[12px] font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <LocalIcon name="sync" className="w-4.5 h-4.5" />
                  <span>Actualizar Catálogo y Clientes vía WhatsApp (.dist)</span>
                </button>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0b1c30] mb-1">
                  Código de Comercio Asignado
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-[#757682] text-[13px] font-bold">
                    #
                  </span>
                  <input
                    type="text"
                    placeholder="Ej: #CLI-1048 o 1048..."
                    value={clientCodeInput}
                    onChange={(e) => setClientCodeInput(e.target.value)}
                    autoFocus
                    className="w-full h-11 pl-9 pr-3 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-[13px] font-medium text-[#0b1c30] focus:ring-2 focus:ring-[#00236f] focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Suggestions including any newly loaded clients */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-[#444651]">
                    Comercios registrados ({clients.length} disponibles):
                  </span>
                  <span className="text-[10px] text-[#006c4a] font-bold">Toca para entrar</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectPredefinedClient(c)}
                      className="p-2 bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#dce9ff] rounded-lg text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[12px] text-[#00236f] group-hover:underline">
                          {c.code}
                        </span>
                        <span className="text-[10px] text-[#006c4a] font-bold">Entrar →</span>
                      </div>
                      <div className="text-[11px] text-[#0b1c30] font-medium truncate">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-[#757682] truncate flex justify-between">
                        <span>{c.address}</span>
                        {c.creditLimit > 0 && (
                          <span className="font-mono text-[#006c4a]">
                            Límite: ${(c.creditLimit / 1000).toFixed(0)}k
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full h-11 bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <LocalIcon name="check_circle" className="w-4.5 h-4.5" />
                  <span>Ingresar con Código</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
