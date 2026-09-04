import React from 'react';
import { TabType, UserRole } from '../types';
import { LocalIcon } from './LocalIcon';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  pendingCount: number;
  userRole?: UserRole;
  clientBasketCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendingCount,
  userRole = 'vendedor',
  clientBasketCount = 0,
}) => {
  const isClient = userRole === 'cliente';

  const vendorNavItems = [
    {
      id: 'pedidos' as TabType,
      label: 'Pedidos',
      icon: 'receipt_long',
    },
    {
      id: 'catalogo' as TabType,
      label: 'Catálogo',
      icon: 'inventory_2',
    },
    {
      id: 'clientes' as TabType,
      label: 'Clientes',
      icon: 'storefront',
    },
    {
      id: 'saldos' as TabType,
      label: 'Saldos',
      icon: 'account_balance_wallet',
    },
    {
      id: 'sync' as TabType,
      label: 'Sync',
      icon: 'sync_saved_locally',
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: 'opciones' as TabType,
      label: 'Opciones',
      icon: 'settings',
    },
  ];

  const clientNavItems = [
    {
      id: 'catalogo' as TabType,
      label: 'Catálogo',
      icon: 'inventory_2',
      badge: clientBasketCount > 0 ? clientBasketCount : null,
    },
    {
      id: 'pedidos' as TabType,
      label: 'Mis Pedidos',
      icon: 'receipt_long',
    },
    {
      id: 'sync' as TabType,
      label: 'Sync WhatsApp',
      icon: 'cloud_sync',
    },
    {
      id: 'opciones' as TabType,
      label: 'Opciones',
      icon: 'settings',
    },
  ];

  const navItems = isClient ? clientNavItems : vendorNavItems;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#f8f9ff]/95 backdrop-blur-xl border-t border-[#e5eeff] shadow-[0_-1px_12px_rgba(0,0,0,0.06)] pb-safe">
      <div className="max-w-xl mx-auto flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-all relative select-none cursor-pointer ${
                isActive
                  ? 'text-[#00236f] font-semibold scale-105'
                  : 'text-[#444651] hover:text-[#00236f] font-normal'
              }`}
            >
              <div className="relative">
                <LocalIcon
                  name={item.icon}
                  className={`w-6 h-6 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.75px]'
                  }`}
                />
                {item.badge !== null && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-[#006c4a] text-white text-[10px] font-bold rounded-full min-w-[16px] text-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-['Inter',sans-serif] tracking-tight mt-0.5">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1 bg-[#00236f] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
