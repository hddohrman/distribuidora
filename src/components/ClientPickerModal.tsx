import React, { useState } from 'react';
import { Client } from '../types';
import { LocalIcon } from './LocalIcon';

interface ClientPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  activeClientId: string;
  onSelectClient: (client: Client) => void;
}

export const ClientPickerModal: React.FC<ClientPickerModalProps> = ({
  isOpen,
  onClose,
  clients,
  activeClientId,
  onSelectClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMoney = (v: number) => '$' + v.toLocaleString('es-AR');

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-3.5 bg-[#00236f] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LocalIcon name="storefront" className="w-5 h-5 text-[#82f5c1]" />
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px]">
              Seleccionar Cliente en Geocerca
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            <LocalIcon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-[#e2e8f0]">
          <div className="relative">
            <LocalIcon name="search" className="absolute left-3 top-2.5 text-[#757682] w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-[#eff4ff] rounded-lg text-[13px] border border-[#dce9ff] text-[#0b1c30] placeholder-[#757682] focus:outline-none focus:ring-2 focus:ring-[#00236f]"
              autoFocus
            />
          </div>
        </div>

        {/* Client list */}
        <div className="p-2 space-y-1.5 overflow-y-auto flex-1">
          {filtered.map((cli) => {
            const isSelected = cli.id === activeClientId;
            const inRange = cli.geofenceStatus === 'in_range';

            return (
              <button
                key={cli.id}
                type="button"
                onClick={() => {
                  onSelectClient(cli);
                  onClose();
                }}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#eff4ff] border-[#00236f] shadow-xs'
                    : 'bg-white hover:bg-[#f8f9ff] border-[#e2e8f0]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      inRange ? 'bg-[#82f5c1] text-[#00714e]' : 'bg-[#eff4ff] text-[#00236f]'
                    }`}
                  >
                    <LocalIcon name="store" className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[13px] text-[#0b1c30] truncate">
                      {cli.name}
                    </span>
                    <span className="text-[11px] text-[#444651] truncate">
                      {cli.code} • {cli.address}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      inRange ? 'bg-[#82f5c1] text-[#00714e]' : 'bg-[#f1f5f9] text-[#757682]'
                    }`}
                  >
                    {cli.distanceMeters}m
                  </span>
                  <span className="text-[10px] text-[#444651] font-semibold mt-0.5">
                    Saldo: {formatMoney(cli.currentDebt)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
