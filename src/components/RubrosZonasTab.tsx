import React, { useState } from 'react';
import { Product, Client } from '../types';
import { LocalIcon } from './LocalIcon';

interface RubrosZonasTabProps {
  categories: string[];
  zones: string[];
  products: Product[];
  clients: Client[];
  onAddCategory: (name: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
  onAddZone: (name: string) => void;
  onRenameZone: (oldName: string, newName: string) => void;
  onDeleteZone: (name: string) => void;
  onTriggerToast: (title: string, message: string) => void;
}

export const RubrosZonasTab: React.FC<RubrosZonasTabProps> = ({
  categories,
  zones,
  products,
  clients,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onAddZone,
  onRenameZone,
  onDeleteZone,
  onTriggerToast,
}) => {
  // Category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Zone state
  const [newZoneName, setNewZoneName] = useState('');
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editZoneName, setEditZoneName] = useState('');

  const formatMoney = (val: number) => '$' + val.toLocaleString('es-AR');

  // Handle Category Creation
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategoryName.trim();
    if (!clean) return;
    if (categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      onTriggerToast('Rubro Existente', `El rubro "${clean}" ya existe.`);
      return;
    }
    onAddCategory(clean);
    setNewCategoryName('');
    onTriggerToast('Rubro Creado', `Rubro "${clean}" añadido exitosamente.`);
  };

  const handleStartEditCategory = (cat: string) => {
    setEditingCategory(cat);
    setEditCategoryName(cat);
  };

  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const clean = editCategoryName.trim();
    if (!clean || clean === editingCategory) {
      setEditingCategory(null);
      return;
    }
    onRenameCategory(editingCategory, clean);
    setEditingCategory(null);
    onTriggerToast('Rubro Renombrado', `Se actualizó a "${clean}".`);
  };

  const handleDeleteCat = (cat: string) => {
    const count = products.filter((p) => p.category === cat).length;
    if (count > 0) {
      if (
        !confirm(
          `El rubro "${cat}" tiene ${count} productos asociados. ¿Deseas eliminarlo y reasignar los productos al rubro "Almacén"?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`¿Eliminar el rubro "${cat}"?`)) return;
    }
    onDeleteCategory(cat);
    onTriggerToast('Rubro Eliminado', `"${cat}" eliminado del catálogo.`);
  };

  // Handle Zone Creation
  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newZoneName.trim();
    if (!clean) return;
    if (zones.some((z) => z.toLowerCase() === clean.toLowerCase())) {
      onTriggerToast('Zona Existente', `La zona "${clean}" ya existe.`);
      return;
    }
    onAddZone(clean);
    setNewZoneName('');
    onTriggerToast('Zona Creada', `Zona "${clean}" añadida exitosamente.`);
  };

  const handleStartEditZone = (zone: string) => {
    setEditingZone(zone);
    setEditZoneName(zone);
  };

  const handleSaveEditZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    const clean = editZoneName.trim();
    if (!clean || clean === editingZone) {
      setEditingZone(null);
      return;
    }
    onRenameZone(editingZone, clean);
    setEditingZone(null);
    onTriggerToast('Zona Renombrada', `Se actualizó a "${clean}".`);
  };

  const handleDeleteZn = (zone: string) => {
    const count = clients.filter((c) => c.zone === zone).length;
    if (count > 0) {
      if (
        !confirm(
          `La zona "${zone}" tiene ${count} comercios asociados. ¿Deseas eliminarla y reasignar los clientes a "Zona 04 Centro"?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`¿Eliminar la zona "${zone}"?`)) return;
    }
    onDeleteZone(zone);
    onTriggerToast('Zona Eliminada', `"${zone}" eliminada del padrón.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0]">
        <div className="flex items-center gap-2.5 text-[#00236f]">
          <LocalIcon name="category" className="w-6 h-6 text-[#00236f]" />
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[20px] text-[#00236f]">
            Gestión de Rubros y Zonas de Reparto
          </h1>
        </div>
        <p className="text-[13px] text-[#64748b] mt-1">
          Configura y organiza los rubros comerciales para categorizar productos con sus fotos, y define las zonas geográficas de reparto para agrupar clientes y ruteo.
        </p>
      </div>

      {/* Grid: 2 Columns for Rubros and Zonas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ============================================================== */}
        {/* COLUMN 1: RUBROS / CATEGORÍAS COMERCIALES                     */}
        {/* ============================================================== */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#00236f] flex items-center gap-2">
                <LocalIcon name="layers" className="w-5 h-5 text-[#00236f]" />
                <span>Rubros del Catálogo ({categories.length})</span>
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Clasificación de productos para filtros y catálogo mayorista.
              </p>
            </div>
          </div>

          {/* Form to Add Category */}
          <form onSubmit={handleCreateCategory} className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nombre del nuevo rubro (ej: Congelados)..."
              className="flex-1 h-9 px-3 rounded-lg border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]"
            />
            <button
              type="submit"
              disabled={!newCategoryName.trim()}
              className="h-9 px-3.5 bg-[#00236f] hover:bg-[#1e3a8a] text-white text-[12px] font-bold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <LocalIcon name="add" className="w-4 h-4 text-[#82f5c1]" />
              <span>+ Agregar</span>
            </button>
          </form>

          {/* Categories List */}
          <div className="border border-[#e2e8f0] rounded-xl overflow-hidden divide-y divide-[#f1f5f9]">
            {categories.map((cat) => {
              const prodsInCat = products.filter((p) => p.category === cat);
              const prodsCount = prodsInCat.length;
              const valuation = prodsInCat.reduce(
                (sum, p) => sum + p.priceWholesale * (p.stockCentral + p.stockTruck),
                0
              );

              return (
                <div
                  key={cat}
                  className="p-3 flex items-center justify-between hover:bg-[#f8f9ff] transition-colors"
                >
                  {editingCategory === cat ? (
                    <form
                      onSubmit={handleSaveEditCategory}
                      className="flex-1 flex items-center gap-2 mr-2"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="flex-1 h-8 px-2.5 rounded-lg border border-[#00236f] text-[12px] bg-white font-bold"
                      />
                      <button
                        type="submit"
                        className="h-8 px-2.5 bg-emerald-600 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="h-8 px-2 bg-slate-200 text-slate-700 text-[11px] rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <div>
                      <div className="font-bold text-[#0b1c30] text-[13px] flex items-center gap-2">
                        <span>{cat}</span>
                        <span className="px-2 py-0.5 bg-[#eff4ff] text-[#00236f] text-[10px] font-mono font-bold rounded border border-[#dce9ff]">
                          {prodsCount} {prodsCount === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748b] mt-0.5 font-mono">
                        Valuación inventario: {formatMoney(valuation)}
                      </div>
                    </div>
                  )}

                  {editingCategory !== cat && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditCategory(cat)}
                        className="p-1.5 hover:bg-[#eff4ff] text-[#00236f] rounded-lg cursor-pointer transition-colors"
                        title="Editar nombre de rubro"
                      >
                        <LocalIcon name="edit" className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCat(cat)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="Eliminar rubro"
                      >
                        <LocalIcon name="delete" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 2: ZONAS DE REPARTO                                     */}
        {/* ============================================================== */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#e2e8f0] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] text-[#00236f] flex items-center gap-2">
                <LocalIcon name="local_shipping" className="w-5 h-5 text-emerald-700" />
                <span>Zonas de Reparto y Ruteo ({zones.length})</span>
              </h2>
              <p className="text-[12px] text-[#64748b]">
                Agrupación logística para preventistas y ruteo de entregas.
              </p>
            </div>
          </div>

          {/* Form to Add Zone */}
          <form onSubmit={handleCreateZone} className="flex gap-2">
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="Nombre de la nueva zona (ej: Zona 08 Norte)..."
              className="flex-1 h-9 px-3 rounded-lg border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]"
            />
            <button
              type="submit"
              disabled={!newZoneName.trim()}
              className="h-9 px-3.5 bg-[#006c4a] hover:bg-[#005137] text-white text-[12px] font-bold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <LocalIcon name="add" className="w-4 h-4 text-[#82f5c1]" />
              <span>+ Agregar</span>
            </button>
          </form>

          {/* Zones List */}
          <div className="border border-[#e2e8f0] rounded-xl overflow-hidden divide-y divide-[#f1f5f9]">
            {zones.map((zn) => {
              const clientsInZone = clients.filter((c) => c.zone === zn);
              const clientsCount = clientsInZone.length;
              const totalDebt = clientsInZone.reduce((sum, c) => sum + c.currentDebt, 0);

              return (
                <div
                  key={zn}
                  className="p-3 flex items-center justify-between hover:bg-[#f8f9ff] transition-colors"
                >
                  {editingZone === zn ? (
                    <form
                      onSubmit={handleSaveEditZone}
                      className="flex-1 flex items-center gap-2 mr-2"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editZoneName}
                        onChange={(e) => setEditZoneName(e.target.value)}
                        className="flex-1 h-8 px-2.5 rounded-lg border border-emerald-600 text-[12px] bg-white font-bold"
                      />
                      <button
                        type="submit"
                        className="h-8 px-2.5 bg-emerald-600 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingZone(null)}
                        className="h-8 px-2 bg-slate-200 text-slate-700 text-[11px] rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <div>
                      <div className="font-bold text-[#0b1c30] text-[13px] flex items-center gap-2">
                        <span>{zn}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold rounded border border-emerald-200">
                          {clientsCount} {clientsCount === 1 ? 'cliente' : 'clientes'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748b] mt-0.5 font-mono">
                        Saldo en calle: <strong className={totalDebt > 0 ? 'text-amber-700' : 'text-emerald-700'}>{formatMoney(totalDebt)}</strong>
                      </div>
                    </div>
                  )}

                  {editingZone !== zn && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditZone(zn)}
                        className="p-1.5 hover:bg-[#eff4ff] text-[#00236f] rounded-lg cursor-pointer transition-colors"
                        title="Editar nombre de zona"
                      >
                        <LocalIcon name="edit" className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteZn(zn)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="Eliminar zona"
                      >
                        <LocalIcon name="delete" className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
