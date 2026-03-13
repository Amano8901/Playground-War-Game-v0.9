import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, Scale, Activity, Award, Zap, History, Globe, Swords } from 'lucide-react';

interface PrefectProfileProps {
  role: string;
  scores: {
    accountability: number;
    protection: number;
    systemicReform: number;
  };
  experience: number;
  onClose: () => void;
}

export const PrefectProfile: React.FC<PrefectProfileProps> = ({ role, scores, experience, onClose }) => {
  const level = Math.floor(experience / 100) + 1;
  const nextLevelExp = level * 100;
  const progress = (experience % 100);

  const getRoleConfig = () => {
    switch (role) {
      case 'Prefect':
        return { icon: Shield, color: 'text-blue-400', border: 'border-blue-500/50', gradient: 'from-blue-600/20 to-blue-900/20' };
      case 'Diplomat':
        return { icon: Globe, color: 'text-emerald-400', border: 'border-emerald-500/50', gradient: 'from-emerald-600/20 to-emerald-900/20' };
      case 'Rebel':
        return { icon: Zap, color: 'text-purple-400', border: 'border-purple-500/50', gradient: 'from-purple-600/20 to-purple-900/20' };
      case 'Captain':
        return { icon: Swords, color: 'text-red-400', border: 'border-red-500/50', gradient: 'from-red-600/20 to-red-900/20' };
      default:
        return { icon: User, color: 'text-gray-400', border: 'border-gray-500/50', gradient: 'from-gray-600/20 to-gray-900/20' };
    }
  };

  const config = getRoleConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="max-w-2xl w-full bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative h-32 bg-gradient-to-r ${config.gradient} flex items-end p-6`}>
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <Zap className="w-6 h-6 rotate-45" />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-zinc-800 border-2 ${config.border} flex items-center justify-center shadow-lg`}>
              <config.icon className={`w-10 h-10 ${config.color}`} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">{role} Commander</h2>
              <div className={`text-xs font-mono ${config.color} uppercase tracking-widest`}>LEVEL {level} // {experience} XP</div>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Attributes */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Core_Attributes
            </h3>
            
            <AttributeBar 
              icon={<Scale className="w-4 h-4 text-blue-400" />}
              label="Accountability"
              value={scores.accountability}
              color="bg-blue-500"
            />
            <AttributeBar 
              icon={<Shield className="w-4 h-4 text-emerald-400" />}
              label="Protection"
              value={scores.protection}
              color="bg-emerald-500"
            />
            <AttributeBar 
              icon={<Activity className="w-4 h-4 text-purple-400" />}
              label="Systemic Reform"
              value={scores.systemicReform}
              color="bg-purple-500"
            />
          </div>

          {/* Progression & Achievements */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
              <Award className="w-3 h-3" />
              Progression_Data
            </h3>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Experience</span>
                <span className="text-xs font-bold text-white">{experience} / {nextLevelExp} XP</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full ${config.color.replace('text-', 'bg-')}`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Recent_Achievements</div>
              <div className="flex flex-wrap gap-2">
                <AchievementBadge label="First Directive" active />
                <AchievementBadge label="Peacekeeper" active />
                <AchievementBadge label="System Hacker" />
                <AchievementBadge label="Global Influence" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-black/20 border-t border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <History className="w-3 h-3" />
              Active Since: 2026.03.11
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-gray-200 transition-colors"
          >
            Return to Command
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AttributeBar = ({ icon, label, value, color }: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[10px] font-mono text-gray-300 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-bold text-white">{value}</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);

const AchievementBadge = ({ label, active }: { label: string; active?: boolean }) => (
  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
    active ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-gray-600'
  }`}>
    {label}
  </div>
);
