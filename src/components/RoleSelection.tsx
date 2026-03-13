import React from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';
import { Shield, Globe, Zap, X, Swords } from 'lucide-react';
import { sound } from '../services/sound';

export const roles = [
  {
    id: 'Prefect',
    icon: Shield,
    description: 'Enforces rules and maintains playground order. High protection, moderate accountability.',
    startingBonus: 'Protection +10',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10'
  },
  {
    id: 'Diplomat',
    icon: Globe,
    description: 'Negotiates peace and builds alliances between cliques. High accountability, moderate systemic reform.',
    startingBonus: 'Accountability +10',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 'Rebel',
    icon: Zap,
    description: 'Challenges the status quo and sparks systemic change. High systemic reform, moderate protection.',
    startingBonus: 'Systemic Reform +10',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10'
  },
  {
    id: 'Captain',
    icon: Swords,
    description: 'Dominates territory through influence and strength. High protection, moderate accountability.',
    startingBonus: 'Protection +5, Accountability +5',
    color: 'text-red-400',
    bg: 'bg-red-500/10'
  }
];

interface RoleSelectionProps {
  onRoleSelected: (role: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelected, onClose, isModal }) => {
  const selectRole = async (roleId: string) => {
    sound.playSuccess();
    if (!auth.currentUser) {
      // Handle local guest role selection
      onRoleSelected(roleId);
      return;
    }

    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await setDoc(userRef, {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        role: roleId,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      onRoleSelected(roleId);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    }
  };

  const content = (
    <div className={`max-w-4xl mx-auto p-8 relative ${isModal ? 'bg-zinc-900 rounded-[2.5rem] border border-white/10 shadow-2xl' : ''}`}>
      {isModal && onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      
      <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 text-center text-white">
        Select Your Command Role
      </h2>
      <p className="text-gray-500 text-center mb-8 text-sm uppercase tracking-widest font-mono">
        Operational parameters will be adjusted based on selection
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <motion.button
            key={role.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectRole(role.id)}
            className={`p-6 rounded-2xl border border-white/5 ${role.bg} text-left transition-all hover:border-white/20 group relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <role.icon className="w-16 h-16" />
            </div>
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className={`p-3 rounded-xl bg-black/40 ${role.color}`}>
                <role.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">{role.id}</h3>
            </div>
            <p className="text-gray-400 text-xs mb-4 leading-relaxed relative z-10">
              {role.description}
            </p>
            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 relative z-10">
              Starting Bonus: <span className={role.color}>{role.startingBonus}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return content;
};
