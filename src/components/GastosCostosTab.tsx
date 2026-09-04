import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Receipt,
  Plus,
  Search,
  Building,
  Users,
  Fuel,
  Zap,
  Shield,
  Wrench,
  Truck,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  X,
  PieChart,
  ArrowDownRight,
  TrendingDown,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { OperatingExpense, ExpenseCategory, ExpenseType } from '../types';

interface GastosCostosTabProps {
  expenses: OperatingExpense[];
  onUpdateExpenses: (expenses: OperatingExpense[]) => void;
  onTriggerToast: (title: string, message: string) => void;
}

const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; icon: any; defaultType: ExpenseType; color: string }
> = {
  alquiler: {
    label: 'Alquiler Galpón / Depósito',
    icon: Building,
    defaultType: 'fijo',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  sueldos: {
    label: 'Sueldos & Cargas Sociales',
    icon: Users,
    defaultType: 'fijo',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  combustible: {
    label: 'Combustible Flota (Gasoil/Nafta)',
    icon: Fuel,
    defaultType: 'variable',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  servicios: {
    label: 'Servicios (Luz, Agua, Internet, Gas)',
    icon: Zap,
    defaultType: 'fijo',
    color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
  impuestos: {
    label: 'Impuestos & Tasas Municipales',
    icon: Receipt,
    defaultType: 'fijo',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  mantenimiento: {
    label: 'Mantenimiento Mecánico & Edilicio',
    icon: Wrench,
    defaultType: 'variable',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  fletes: {
    label: 'Fletes Externos & Logística',
    icon: Truck,
    defaultType: 'variable',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  seguros: {
    label: 'Seguros Flota & Mercadería',
    icon: Shield,
    defaultType: 'fijo',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  otros: {
    label: 'Otros Gastos Operativos',
    icon: FileSpreadsheet,
    defaultType: 'variable',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
  },
};

export const GastosCostosTab: React.FC<GastosCostosTabProps> = ({
  expenses,
  onUpdateExpenses,
  onTriggerToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'fijo' | 'variable'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pagado' | 'pendiente'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<OperatingExpense | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('alquiler');
  const [formType, setFormType] = useState<ExpenseType>('fijo');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<
    'transferencia' | 'efectivo' | 'debito_automatico' | 'cheque'
  >('transferencia');
  const [formStatus, setFormStatus] = useState<'pagado' | 'pendiente'>('pagado');
  const [formBeneficiary, setFormBeneficiary] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Open modal for new expense
  const handleOpenNew = (presetCategory?: ExpenseCategory) => {
    setEditingExpense(null);
    const cat = presetCategory || 'alquiler';
    setFormTitle(CATEGORY_CONFIG[cat].label);
    setFormCategory(cat);
    setFormType(CATEGORY_CONFIG[cat].defaultType);
    setFormAmount(0);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDueDate('');
    setFormPaymentMethod('transferencia');
    setFormStatus('pagado');
    setFormBeneficiary('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (exp: OperatingExpense) => {
    setEditingExpense(exp);
    setFormTitle(exp.title);
    setFormCategory(exp.category);
    setFormType(exp.type);
    setFormAmount(exp.amount);
    setFormDate(exp.date);
    setFormDueDate(exp.dueDate || '');
    setFormPaymentMethod(exp.paymentMethod);
    setFormStatus(exp.status);
    setFormBeneficiary(exp.supplierOrBeneficiary || '');
    setFormNotes(exp.notes || '');
    setIsModalOpen(true);
  };

  // Change category in form -> auto-suggest default type
  const handleCategoryChange = (cat: ExpenseCategory) => {
    setFormCategory(cat);
    setFormType(CATEGORY_CONFIG[cat].defaultType);
    if (!formTitle || Object.values(CATEGORY_CONFIG).some((c) => c.label === formTitle)) {
      setFormTitle(CATEGORY_CONFIG[cat].label);
    }
  };

  // Save Expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || formAmount <= 0) {
      alert('Ingresa una descripción válida y monto mayor a cero.');
      return;
    }

    if (editingExpense) {
      const updatedList = expenses.map((exp) =>
        exp.id === editingExpense.id
          ? {
              ...exp,
              title: formTitle.trim(),
              category: formCategory,
              type: formType,
              amount: Number(formAmount),
              date: formDate,
              dueDate: formDueDate.trim() || undefined,
              paymentMethod: formPaymentMethod,
              status: formStatus,
              supplierOrBeneficiary: formBeneficiary.trim() || undefined,
              notes: formNotes.trim() || undefined,
            }
          : exp
      );
      onUpdateExpenses(updatedList);
      onTriggerToast('Gasto Actualizado', `Modificaciones guardadas en "${formTitle}".`);
    } else {
      const newExp: OperatingExpense = {
        id: `exp-${Date.now()}`,
        expenseNumber: `GAS-${String(expenses.length + 1).padStart(3, '0')}`,
        title: formTitle.trim(),
        category: formCategory,
        type: formType,
        amount: Number(formAmount),
        date: formDate,
        dueDate: formDueDate.trim() || undefined,
        paymentMethod: formPaymentMethod,
        status: formStatus,
        supplierOrBeneficiary: formBeneficiary.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };
      onUpdateExpenses([newExp, ...expenses]);
      onTriggerToast(
        'Gasto Registrado',
        `$${newExp.amount.toLocaleString('es-AR')} en "${newExp.title}" incorporado a costos.`
      );
    }

    setIsModalOpen(false);
  };

  // Toggle status
  const handleToggleStatus = (exp: OperatingExpense) => {
    const nextStatus = exp.status === 'pagado' ? 'pendiente' : 'pagado';
    const updated = expenses.map((e) =>
      e.id === exp.id ? { ...e, status: nextStatus } : e
    );
    onUpdateExpenses(updated);
    onTriggerToast(
      nextStatus === 'pagado' ? 'Gasto Marcado Pagado' : 'Gasto Pasado a Pendiente',
      `"${exp.title}" ahora figura como ${nextStatus}.`
    );
  };

  // Delete
  const handleDelete = (exp: OperatingExpense) => {
    if (confirm(`¿Estás seguro de eliminar el gasto "${exp.title}" por $${exp.amount.toLocaleString('es-AR')}?`)) {
      onUpdateExpenses(expenses.filter((e) => e.id !== exp.id));
      onTriggerToast('Gasto Eliminado', `"${exp.title}" fue eliminado.`);
    }
  };

  // Summary Metrics
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalFixedCosts = useMemo(() => {
    return expenses.filter((e) => e.type === 'fijo').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalVariableCosts = useMemo(() => {
    return expenses.filter((e) => e.type === 'variable').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalPendingExpenses = useMemo(() => {
    return expenses.filter((e) => e.status === 'pendiente').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Filtered List
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.supplierOrBeneficiary && e.supplierOrBeneficiary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = typeFilter === 'all' || e.type === typeFilter;
      const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;

      return matchSearch && matchType && matchCat && matchStatus;
    });
  }, [expenses, searchTerm, typeFilter, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#cbd5e1] shadow-xs">
        <div>
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-[22px] text-[#00236f] flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-[#00236f]" />
            <span>Gastos Operativos & Costos Fijos de la Empresa</span>
          </h2>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Registra alquiler, nómina, combustible y servicios para calcular el resultado neto real y punto de equilibrio de la distribuidora.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenNew()}
            className="h-11 px-5 rounded-xl bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold text-[13px] flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cargar Gasto / Costo</span>
          </button>
        </div>
      </div>

      {/* Quick Registration Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[12px]">
        <span className="font-bold text-[#64748b] shrink-0">Accesos Rápidos:</span>
        <button
          type="button"
          onClick={() => handleOpenNew('alquiler')}
          className="h-8 px-3 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-800 font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
        >
          <Building className="w-3.5 h-3.5 text-indigo-600" />
          <span>+ Alquiler Galpón</span>
        </button>
        <button
          type="button"
          onClick={() => handleOpenNew('sueldos')}
          className="h-8 px-3 rounded-lg bg-white border border-blue-200 hover:border-blue-400 text-blue-800 font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>+ Sueldos / Nómina</span>
        </button>
        <button
          type="button"
          onClick={() => handleOpenNew('combustible')}
          className="h-8 px-3 rounded-lg bg-white border border-amber-200 hover:border-amber-400 text-amber-800 font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
        >
          <Fuel className="w-3.5 h-3.5 text-amber-600" />
          <span>+ Combustible Camiones</span>
        </button>
        <button
          type="button"
          onClick={() => handleOpenNew('servicios')}
          className="h-8 px-3 rounded-lg bg-white border border-yellow-200 hover:border-yellow-400 text-yellow-900 font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-600" />
          <span>+ Luz / Edenor</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gastos */}
        <div className="bg-white p-4.5 rounded-2xl border border-[#cbd5e1] shadow-xs">
          <div className="flex items-center justify-between text-[#64748b] text-[12px] font-semibold">
            <span>Total Gastos del Período</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-lg">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono font-black text-[22px] text-rose-700">
            ${totalExpenses.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-[#64748b]">
            Costos fijos + variables operativos
          </span>
        </div>

        {/* Costos Fijos */}
        <div className="bg-white p-4.5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <div className="flex items-center justify-between text-indigo-900 text-[12px] font-bold">
            <span>🏢 Costos Fijos (Estructura)</span>
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-lg">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono font-black text-[22px] text-indigo-950">
            ${totalFixedCosts.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-indigo-800/80">
            {totalExpenses > 0 ? ((totalFixedCosts / totalExpenses) * 100).toFixed(0) : 0}% de los gastos (independiente de ventas)
          </span>
        </div>

        {/* Costos Variables */}
        <div className="bg-white p-4.5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-900 text-[12px] font-bold">
            <span>🚚 Costos Variables (Operativos)</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono font-black text-[22px] text-amber-900">
            ${totalVariableCosts.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-amber-800/80">
            Combustible, fletes y mantenimiento rodados
          </span>
        </div>

        {/* Gastos Pendientes de Pago */}
        <div className="bg-white p-4.5 rounded-2xl border border-[#cbd5e1] shadow-xs">
          <div className="flex items-center justify-between text-[#64748b] text-[12px] font-semibold">
            <span>⏳ Gastos a Pagar / Pendientes</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 font-mono font-black text-[22px] text-[#00236f]">
            ${totalPendingExpenses.toLocaleString('es-AR')}
          </div>
          <span className="text-[11px] text-[#64748b]">
            Comprobantes con vencimiento a liquidar
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#cbd5e1] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar gasto, proveedor, concepto..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#cbd5e1] text-[13px] bg-[#f8f9ff] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00236f]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-[13px]">
          {/* Filter Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-[#cbd5e1] bg-[#f8f9ff] font-medium focus:ring-2 focus:ring-[#00236f]"
          >
            <option value="all">Tipo: Fijos & Variables</option>
            <option value="fijo">Solo Costos Fijos</option>
            <option value="variable">Solo Costos Variables</option>
          </select>

          {/* Filter Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-[#cbd5e1] bg-[#f8f9ff] font-medium focus:ring-2 focus:ring-[#00236f]"
          >
            <option value="all">Todas las Categorías</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-[#cbd5e1] bg-[#f8f9ff] font-medium focus:ring-2 focus:ring-[#00236f]"
          >
            <option value="all">Todos los Estados</option>
            <option value="pagado">Pagados</option>
            <option value="pendiente">Pendientes</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-[#cbd5e1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f8f9ff] border-b border-[#e2e8f0] text-[#64748b] text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">N° Gasto</th>
                <th className="py-3 px-4">Concepto / Descripción</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-center">Tipo de Costo</th>
                <th className="py-3 px-4">Destinatario / Proveedor</th>
                <th className="py-3 px-4">Fecha / Venc.</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748b]">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-[14px] text-[#0b1c30]">No se registraron gastos</p>
                    <p className="text-[12px]">Presiona "Cargar Gasto / Costo" para agregar gastos fijos o variables.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const catCfg = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.otros;
                  const Icon = catCfg.icon;

                  return (
                    <tr key={exp.id} className="hover:bg-[#f8f9ff] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#00236f]">
                        {exp.expenseNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0b1c30]">{exp.title}</div>
                        {exp.notes && (
                          <div className="text-[11px] text-[#64748b] truncate max-w-xs">
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${catCfg.color}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{catCfg.label.split('(')[0].trim()}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {exp.type === 'fijo' ? (
                          <span className="bg-indigo-100 text-indigo-900 text-[10px] uppercase font-black px-2 py-0.5 rounded">
                            Costo Fijo
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 text-[10px] uppercase font-black px-2 py-0.5 rounded">
                            Variable
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748b]">
                        {exp.supplierOrBeneficiary || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[12px] text-[#64748b]">
                        <div>{exp.date}</div>
                        {exp.dueDate && (
                          <span className="text-[10px] text-rose-600 block">
                            Vto: {exp.dueDate}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-rose-700 text-[14px]">
                        ${exp.amount.toLocaleString('es-AR')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(exp)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all border ${
                            exp.status === 'pagado'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                          }`}
                          title="Click para cambiar estado Pagado / Pendiente"
                        >
                          {exp.status === 'pagado' ? '✓ Pagado' : '⏳ Pendiente'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 hover:bg-[#eff4ff] text-[#00236f] rounded-lg transition-colors cursor-pointer"
                            title="Editar gasto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(exp)}
                            className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar gasto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MODAL: CARGAR / EDITAR GASTO OPERATIVO                           */}
      {/* ================================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#00236f] text-white p-4.5 flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[16px] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#82f5c1]" />
                <span>{editingExpense ? 'Editar Gasto Operativo' : 'Registrar Gasto / Costo Fijo'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-5 space-y-3.5 text-[13px] max-h-[85vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="font-bold text-[#0b1c30]">Concepto del Gasto *:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Alquiler Galpón Central, Sueldos Choferes, Combustible YPF..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Categoría:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory)}
                    className="w-full h-9 px-2.5 rounded-lg border border-[#cbd5e1] bg-white font-medium"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Tipo de Costo:</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ExpenseType)}
                    className="w-full h-9 px-2.5 rounded-lg border border-[#cbd5e1] bg-white font-bold text-[#00236f]"
                  >
                    <option value="fijo">🏢 Costo Fijo (Estructural)</option>
                    <option value="variable">🚚 Costo Variable (Operativo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0b1c30]">Monto ($) *:</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Ej: 350000"
                    value={formAmount || ''}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono font-black text-rose-700 text-[14px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Fecha de Registro:</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Destinatario / Proveedor:</label>
                  <input
                    type="text"
                    placeholder="Ej: Edenor, Inmobiliaria, YPF, Choferes"
                    value={formBeneficiary}
                    onChange={(e) => setFormBeneficiary(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Fecha Vencimiento (opcional):</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Medio de Pago:</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                    className="w-full h-9 px-2.5 rounded-lg border border-[#cbd5e1] bg-white font-medium"
                  >
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="debito_automatico">Débito Automático</option>
                    <option value="efectivo">Efectivo de Caja</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0b1c30]">Estado del Pago:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full h-9 px-2.5 rounded-lg border border-[#cbd5e1] bg-white font-bold"
                  >
                    <option value="pagado">✓ Ya Pagado</option>
                    <option value="pendiente">⏳ Pendiente de Liquidar</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0b1c30]">Notas / Factura N°:</label>
                <input
                  type="text"
                  placeholder="Número de factura o comprobante, observaciones..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[#cbd5e1]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0b1c30] font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-[#00236f] hover:bg-[#1e3a8a] text-white font-bold cursor-pointer shadow-xs"
                >
                  {editingExpense ? 'Guardar Cambios' : 'Registrar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
