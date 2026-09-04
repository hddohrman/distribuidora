import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import { LocalIcon } from './LocalIcon';

interface ClientesViewProps {
  clients: Client[];
  onSelectClientForSale: (client: Client) => void;
  onRecordVisitReason: (client: Client, reason: string) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clients,
  onSelectClientForSale,
  onRecordVisitReason,
}) => {
  const [filter, setFilter] = useState<'todos' | 'en_rango' | 'con_deuda' | 'pendientes'>('todos');
  const [search, setSearch] = useState('');
  const [selectedForReason, setSelectedForReason] = useState<Client | null>(null);
  const [sortField, setSortField] = useState<'currentDebt' | 'creditLimit' | 'totalSpent' | 'name' | 'distanceMeters'>('currentDebt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'tarjetas' | 'tabla'>('tarjetas');

  const formatMoney = (val: number) => '$' + val.toLocaleString('es-AR');

  const handleSort = (field: 'currentDebt' | 'creditLimit' | 'totalSpent' | 'name' | 'distanceMeters') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      // Default to mayor a menor (desc) for numeric fields, and A-Z (asc) for name
      if (['currentDebt', 'creditLimit', 'totalSpent'].includes(field)) {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  };

  const filteredAndSortedClients = useMemo(() => {
    const list = clients.filter((cli) => {
      const matchesSearch =
        cli.name.toLowerCase().includes(search.toLowerCase()) ||
        cli.code.toLowerCase().includes(search.toLowerCase()) ||
        cli.address.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filter === 'en_rango') return cli.geofenceStatus === 'in_range';
      if (filter === 'con_deuda') return cli.currentDebt > 0;
      if (filter === 'pendientes') return cli.status === 'pending';
      return true;
    });

    return list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
      } else if (sortField === 'currentDebt') {
        comparison = (a.currentDebt || 0) - (b.currentDebt || 0);
      } else if (sortField === 'creditLimit') {
        comparison = (a.creditLimit || 0) - (b.creditLimit || 0);
      } else if (sortField === 'totalSpent') {
        comparison = (a.totalSpent || 0) - (b.totalSpent || 0);
      } else if (sortField === 'distanceMeters') {
        comparison = (a.distanceMeters || 0) - (b.distanceMeters || 0);
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [clients, search, filter, sortField, sortDirection]);

  const handleSendWhatsApp = (client: Client) => {
    const text = encodeURIComponent(
      `Hola ${client.name}, te saluda David C. de DistriPro Mayorista. Estoy recorriendo la Zona 04 Centro. ¿Te reservo mercadería o bultos de pañales/perfumería para hoy?`
    );
    window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full pb-20 space-y-3">
      {/* Search and route summary header */}
      <section className="bg-white p-3 rounded-xl shadow-xs border border-[#e2e8f0] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LocalIcon name="route" className="text-[#00236f] w-5.5 h-5.5" />
            <div className="flex flex-col">
              <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30]">
                Ruta del Día • Zona 04 Centro
              </span>
              <span className="text-[11px] text-[#444651]">
                24 clientes asignados • GPS Geocerca activa
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#00236f] text-[11px] font-bold">
            22/24 visitados
          </span>
        </div>

        <div className="relative">
          <LocalIcon name="search" className="absolute left-3 top-2.5 text-[#757682] w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-[#eff4ff] rounded-lg text-[13px] border border-[#dce9ff] text-[#0b1c30] placeholder-[#757682] focus:outline-none focus:ring-2 focus:ring-[#00236f]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilter('todos')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              filter === 'todos'
                ? 'bg-[#00236f] text-white'
                : 'bg-[#eff4ff] text-[#444651] hover:bg-[#dce9ff]'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('en_rango')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              filter === 'en_rango'
                ? 'bg-[#00236f] text-white'
                : 'bg-[#eff4ff] text-[#444651] hover:bg-[#dce9ff]'
            }`}
          >
            En Rango Geocerca
          </button>
          <button
            type="button"
            onClick={() => setFilter('pendientes')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              filter === 'pendientes'
                ? 'bg-[#00236f] text-white'
                : 'bg-[#eff4ff] text-[#444651] hover:bg-[#dce9ff]'
            }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFilter('con_deuda')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              filter === 'con_deuda'
                ? 'bg-[#00236f] text-white'
                : 'bg-[#eff4ff] text-[#444651] hover:bg-[#dce9ff]'
            }`}
          >
            Con Deuda Cta. Cte.
          </button>
        </div>

        {/* ORDENAR COLUMNAS DE MAYOR A MENOR / MENOR A MAYOR */}
        <div className="pt-2 border-t border-[#e2e8f0] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#00236f] flex items-center gap-1">
              <LocalIcon name="sort" className="w-3.5 h-3.5 text-[#00236f]" />
              <span>Ordenar Columnas (Click para alternar Mayor a Menor):</span>
            </span>
            <div className="flex items-center gap-1 bg-[#eff4ff] p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('tarjetas')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  viewMode === 'tarjetas' ? 'bg-[#00236f] text-white' : 'text-[#444651]'
                }`}
              >
                Tarjetas
              </button>
              <button
                type="button"
                onClick={() => setViewMode('tabla')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  viewMode === 'tabla' ? 'bg-[#00236f] text-white' : 'text-[#444651]'
                }`}
              >
                Tabla
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => handleSort('currentDebt')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all ${
                sortField === 'currentDebt'
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Saldo Deudor</span>
              {sortField === 'currentDebt' ? (
                <span className="font-mono text-[10px] bg-rose-200 px-1 rounded">
                  {sortDirection === 'desc' ? '▼ Mayor a menor' : '▲ Menor a mayor'}
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">▼</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSort('creditLimit')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all ${
                sortField === 'creditLimit'
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Límite Crédito</span>
              {sortField === 'creditLimit' ? (
                <span className="font-mono text-[10px] bg-blue-200 px-1 rounded">
                  {sortDirection === 'desc' ? '▼ Mayor a menor' : '▲ Menor a mayor'}
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">▼</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSort('totalSpent')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all ${
                sortField === 'totalSpent'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Total Compras</span>
              {sortField === 'totalSpent' ? (
                <span className="font-mono text-[10px] bg-emerald-200 px-1 rounded">
                  {sortDirection === 'desc' ? '▼ Mayor a menor' : '▲ Menor a mayor'}
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">▼</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSort('name')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all ${
                sortField === 'name'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Nombre</span>
              {sortField === 'name' ? (
                <span className="font-mono text-[10px] bg-amber-200 px-1 rounded">
                  {sortDirection === 'desc' ? '▼ Z-A' : '▲ A-Z'}
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">▲</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSort('distanceMeters')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-all ${
                sortField === 'distanceMeters'
                  ? 'bg-teal-100 text-teal-900 border border-teal-300'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>Distancia GPS</span>
              {sortField === 'distanceMeters' ? (
                <span className="font-mono text-[10px] bg-teal-200 px-1 rounded">
                  {sortDirection === 'desc' ? '▼ Lejano a cercano' : '▲ Cercano a lejano'}
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">▲</span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* VISTA EN TABLA CON COLUMNAS CLICKEABLES DE MAYOR A MENOR */}
      {viewMode === 'tabla' ? (
        <section className="bg-white rounded-xl shadow-xs border border-[#e2e8f0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-2.5 px-3 cursor-pointer hover:bg-[#eff4ff] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Cliente</span>
                      {sortField === 'name' && (
                        <span>{sortDirection === 'desc' ? '▼' : '▲'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('currentDebt')}
                    className="py-2.5 px-3 text-right cursor-pointer hover:bg-[#eff4ff] transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1 text-rose-800">
                      <span>Deuda</span>
                      {sortField === 'currentDebt' && (
                        <span>{sortDirection === 'desc' ? '▼' : '▲'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('creditLimit')}
                    className="py-2.5 px-3 text-right cursor-pointer hover:bg-[#eff4ff] transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Límite</span>
                      {sortField === 'creditLimit' && (
                        <span>{sortDirection === 'desc' ? '▼' : '▲'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('totalSpent')}
                    className="py-2.5 px-3 text-right cursor-pointer hover:bg-[#eff4ff] transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Compras</span>
                      {sortField === 'totalSpent' && (
                        <span>{sortDirection === 'desc' ? '▼' : '▲'}</span>
                      )}
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredAndSortedClients.map((client) => {
                  return (
                    <tr key={client.id} className="hover:bg-[#f8f9ff] transition-colors">
                      <td className="py-2 px-3">
                        <div className="font-bold text-[#0b1c30]">{client.name}</div>
                        <div className="text-[10px] text-[#64748b]">{client.code} • {client.address}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        <span className={client.currentDebt > 0 ? 'text-[#ba1a1a]' : 'text-[#006c4a]'}>
                          {formatMoney(client.currentDebt)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[#444651]">
                        {formatMoney(client.creditLimit || 0)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-[#00236f]">
                        {formatMoney(client.totalSpent || 0)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSendWhatsApp(client)}
                            className="p-1 rounded bg-[#eff4ff] text-[#006c4a] hover:bg-[#dce9ff]"
                            title="WhatsApp"
                          >
                            <LocalIcon name="chat" className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectClientForSale(client)}
                            className="px-2 py-1 bg-[#00236f] text-white text-[10px] font-bold rounded"
                          >
                            Vender
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        /* VISTA EN TARJETAS CON ORDENAMIENTO */
        <section className="space-y-2">
          {filteredAndSortedClients.map((client) => {
            const inRange = client.geofenceStatus === 'in_range';
            const nearby = client.geofenceStatus === 'nearby';

            return (
              <article
                key={client.id}
                className="bg-white p-3.5 rounded-xl shadow-xs border border-[#e2e8f0] space-y-2.5 transition-all hover:border-[#cbdbf5]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        inRange
                          ? 'bg-[#82f5c1] text-[#00714e]'
                          : nearby
                          ? 'bg-[#dce9ff] text-[#00236f]'
                          : 'bg-[#f1f5f9] text-[#757682]'
                      }`}
                    >
                      <LocalIcon name="storefront" className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[14px] text-[#0b1c30] truncate">
                          {client.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#444651] truncate">
                        {client.code} • {client.address}
                      </span>
                      <span className="text-[11px] text-[#757682]">
                        Contacto: {client.businessName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Compras: {formatMoney(client.totalSpent || 0)} • Límite: {formatMoney(client.creditLimit || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Geofence indicator & Debt */}
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        inRange
                          ? 'bg-[#82f5c1] text-[#00714e]'
                          : nearby
                          ? 'bg-[#dce9ff] text-[#00236f]'
                          : 'bg-[#f1f5f9] text-[#757682]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          inRange ? 'bg-[#006c4a] animate-pulse' : 'bg-current'
                        }`}
                      />
                      {inRange
                        ? `En rango (${client.distanceMeters}m)`
                        : nearby
                        ? `A ${client.distanceMeters}m`
                        : 'Fuera de rango'}
                    </span>
                    <span
                      className={`text-[11px] font-bold mt-1 ${
                        client.currentDebt > 0 ? 'text-[#ba1a1a]' : 'text-[#006c4a]'
                      }`}
                    >
                      Saldo: {formatMoney(client.currentDebt)}
                    </span>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(client)}
                      className="h-8 px-2.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006c4a] text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="Enviar WhatsApp"
                    >
                      <LocalIcon name="chat" className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedForReason(client)}
                      className="h-8 px-2 bg-[#f8f9ff] hover:bg-[#e5eeff] text-[#444651] text-[11px] font-medium rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <LocalIcon name="event_busy" className="w-3.5 h-3.5" />
                      <span>No compra</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectClientForSale(client)}
                    className="h-8 px-3 bg-[#00236f] hover:bg-[#1e3a8a] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <LocalIcon name="point_of_sale" className="w-4 h-4" />
                    <span>Tomar Venta / Pedido</span>
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Non-purchase Reason Modal */}
      {selectedForReason && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full space-y-3 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px] text-[#0b1c30]">
                Registrar Visita sin Compra
              </h3>
              <button
                type="button"
                onClick={() => setSelectedForReason(null)}
                className="text-[#757682] hover:text-[#0b1c30]"
              >
                <LocalIcon name="close" className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[12px] text-[#444651]">
              Cliente: <span className="font-bold">{selectedForReason.name}</span>
            </p>

            <div className="space-y-1.5">
              {[
                'Comercio cerrado / dueño ausente',
                'Tiene stock suficiente de última compra',
                'Sin fondos / esperando cobranza',
                'Precios no competitivos / prefiere otra marca',
                'Reclamo de mercadería pendiente',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    onRecordVisitReason(selectedForReason, reason);
                    setSelectedForReason(null);
                  }}
                  className="w-full text-left p-2.5 text-[12px] font-medium text-[#0b1c30] bg-[#eff4ff] hover:bg-[#dce9ff] rounded-lg transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
