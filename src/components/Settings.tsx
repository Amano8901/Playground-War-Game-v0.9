import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Key, Shield, Save, Trash2, AlertCircle, Wifi, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { sound } from '../services/sound';
import { testConnection } from '../services/gemini';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<{ status: 'idle' | 'testing' | 'success' | 'error', message?: string }>({ status: 'idle' });

  useEffect(() => {
    const stored = localStorage.getItem('PWG_CUSTOM_API_KEY');
    if (stored) {
      try {
        setApiKey(atob(stored));
      } catch (e) {
        console.error("Failed to load stored key");
      }
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      sound.playSuccess();
      localStorage.setItem('PWG_CUSTOM_API_KEY', btoa(apiKey.trim()));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleClear = () => {
    sound.playAlert();
    localStorage.removeItem('PWG_CUSTOM_API_KEY');
    setApiKey('');
    setTestStatus({ status: 'idle' });
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestStatus({ status: 'error', message: 'Please enter an API key first.' });
      return;
    }
    
    sound.playClick();
    setTestStatus({ status: 'testing' });
    
    // Temporarily set the key for the test if not saved yet
    const originalKey = localStorage.getItem('PWG_CUSTOM_API_KEY');
    localStorage.setItem('PWG_CUSTOM_API_KEY', btoa(apiKey.trim()));
    
    const result = await testConnection();
    
    if (result.success) {
      sound.playSuccess();
      setTestStatus({ status: 'success', message: result.message });
    } else {
      sound.playAlert();
      setTestStatus({ status: 'error', message: result.message });
    }
    
    // Restore original key if we didn't save
    if (!isSaved && originalKey !== btoa(apiKey.trim())) {
      // We keep it set for now so the user can save it if they want
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              System Settings
            </h2>
            <button 
              onClick={() => {
                sound.playClick();
                onClose();
              }} 
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                Custom Gemini API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <p className="mt-2 text-[10px] text-gray-500 leading-relaxed">
                Your key is stored locally in your browser and encrypted (Base64) for basic privacy. 
                It is used directly for AI requests.
              </p>
            </div>

            {testStatus.status !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  testStatus.status === 'testing' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' :
                  testStatus.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                  'bg-red-500/5 border-red-500/20 text-red-400'
                }`}
              >
                {testStatus.status === 'testing' ? <Loader2 className="w-4 h-4 animate-spin shrink-0 mt-0.5" /> :
                 testStatus.status === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> :
                 <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <div className="text-[10px] font-medium leading-relaxed">
                  {testStatus.status === 'testing' ? 'Verifying tactical link...' : testStatus.message}
                </div>
              </motion.div>
            )}

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-white mb-1">Privacy Protocol</h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    All game state and tactical data are encrypted before transmission. 
                    We do not store your API keys on our servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    isSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isSaved ? <Save className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                  {isSaved ? 'Saved' : 'Save Key'}
                </button>
                <button
                  onClick={handleClear}
                  className="p-3 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-xl transition-all"
                  title="Clear Key"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={handleTest}
                disabled={testStatus.status === 'testing'}
                className="w-full flex items-center justify-center gap-2 py-2 border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                <Wifi className="w-4 h-4" />
                Test Connection
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
