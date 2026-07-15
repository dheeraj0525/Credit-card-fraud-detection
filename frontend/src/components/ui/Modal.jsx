import React from "react";

export function Modal({ isOpen, onClose, title, children, footer, ...props }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[90%] max-w-[650px] rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 text-2xl transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>
        
        <div className="text-sm text-slate-300">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 mt-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
