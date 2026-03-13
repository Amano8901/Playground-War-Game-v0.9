import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Check } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0f18] border border-blue-500/30 rounded-sm overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-blue-500/10 px-6 py-4 border-b border-blue-500/20 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-400">{title}</h2>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-zinc-400 text-sm leading-relaxed font-mono uppercase tracking-wider">
                {message}
              </p>
            </div>

            {/* Footer */}
            <div className="bg-black/40 px-6 py-4 border-t border-blue-500/10 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
              >
                <X className="w-3 h-3" />
                Abort
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-6 py-2 bg-blue-600/20 border border-blue-500/50 rounded-sm text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/40 transition-all flex items-center gap-2"
              >
                <Check className="w-3 h-3" />
                Confirm
              </button>
            </div>

            {/* Decorative Scanline */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
