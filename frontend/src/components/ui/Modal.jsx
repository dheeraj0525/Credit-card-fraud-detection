import React from "react";
import { X } from "lucide-react";

export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <h3 className="text-base font-bold text-slate-100 font-sans">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="text-xs text-slate-300">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-slate-800/80 pt-4 mt-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
