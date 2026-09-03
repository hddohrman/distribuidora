import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { LocalIcon } from './LocalIcon';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onScanProduct: (product: Product) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onScanProduct,
}) => {
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) setScannedFeedback(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulateScan = (prod: Product) => {
    setScannedFeedback(`Código detectado: ${prod.barcode} (${prod.name})`);
    setTimeout(() => {
      onScanProduct(prod);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-[#0b1c30] text-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-slate-700">
        {/* Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <LocalIcon name="qr_code_scanner" className="text-[#82f5c1] w-5 h-5" />
            <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-[15px]">
              Escanear Barcode / SKU
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <LocalIcon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="relative h-60 bg-black flex items-center justify-center overflow-hidden">
          {/* Background camera grid effect */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Scanner target frame */}
          <div className="relative w-48 h-48 border-2 border-[#82f5c1] rounded-xl flex items-center justify-center">
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#006c4a]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#006c4a]" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#006c4a]" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#006c4a]" />

            {/* Red Laser line */}
            <div className="absolute inset-x-2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse top-1/2 -translate-y-1/2" />

            <span className="text-[11px] text-slate-400 text-center px-4 font-mono">
              Apunta la cámara al código de barras del bulto o producto
            </span>
          </div>

          {scannedFeedback && (
            <div className="absolute inset-x-3 bottom-3 bg-[#006c4a] text-white p-2 rounded-lg text-center text-[12px] font-bold shadow-lg animate-bounce">
              {scannedFeedback}
            </div>
          )}
        </div>

        {/* Quick simulation buttons */}
        <div className="p-3.5 space-y-2 bg-[#12223a]">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Toca un código para simular lectura óptica:
          </span>
          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
            {products.slice(0, 6).map((prod) => (
              <button
                key={prod.id}
                type="button"
                onClick={() => handleSimulateScan(prod)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-left rounded-lg text-[11px] border border-slate-700 transition-colors"
              >
                <div className="font-bold text-white truncate">{prod.name}</div>
                <div className="text-slate-400 font-mono text-[10px] truncate">
                  {prod.barcode}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-10 mt-2 bg-slate-800 hover:bg-slate-700 text-white text-[12px] font-bold rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
