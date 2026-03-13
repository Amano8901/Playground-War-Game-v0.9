import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  code?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, title, message, code }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-zinc-950 border border-red-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/10 rounded-2xl">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white">{title}</h2>
                  <p className="text-[10px] font-mono text-red-500/60 uppercase tracking-widest">Error_Code: {code || 'UNKNOWN_ERR'}</p>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="space-y-3">
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Firebase Console
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-3 text-zinc-500 hover:text-white font-bold text-sm transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
            
            {/* Tactical Scanline */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(239,68,68,0.02)_50%)] bg-[length:100%_4px]"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
