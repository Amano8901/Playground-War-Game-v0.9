import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, User, Terminal, Zap, Shield, Globe, Play, History, Loader2, Swords } from 'lucide-react';
import { sound } from '../services/sound';
import { db, auth, signInWithGoogle } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

interface StartScreenProps {
  onStart: (role: string) => void;
  onLoadSession: (sessionId: string, role: string) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onLoadSession }) => {
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    { id: 'Prefect', name: 'The Prefect', icon: Shield, desc: 'Enforce rules and maintain order.' },
    { id: 'Diplomat', name: 'The Diplomat', icon: Globe, desc: 'Negotiate peace and build alliances.' },
    { id: 'Rebel', name: 'The Rebel', icon: Zap, desc: 'Challenge the status quo and spark change.' },
    { id: 'Captain', name: 'The Captain', icon: Swords, desc: 'Dominates territory through influence.' }
  ];

  useEffect(() => {
    async function fetchSessions() {
      if (auth.currentUser) {
        setIsLoadingSessions(true);
        try {
          const q = query(
            collection(db, 'sessions'),
            where('createdBy', '==', auth.currentUser.uid),
            orderBy('lastUpdated', 'desc'),
            limit(3)
          );
          const snapshot = await getDocs(q);
          const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRecentSessions(sessions);
        } catch (e) {
          console.error("Error fetching sessions:", e);
        } finally {
          setIsLoadingSessions(false);
        }
      }
    }
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-20"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10"
      >
        {/* Left Side: Branding */}
        <div className="text-center lg:text-left">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 inline-flex p-5 rounded-[2rem] bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]"
          >
            <Terminal className="w-16 h-16" />
          </motion.div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
            Playground<br />
            <span className="text-blue-500">War-Game</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
            The ultimate geopolitical simulation. Command the playground, 
            neutralize threats, and enforce the new world order.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              Secure Protocol v2.0
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              <Globe className="w-3 h-3" />
              Global Deployment
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="bg-zinc-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div className="space-y-6">
            {!auth.currentUser && (
              <button
                onClick={signInWithGoogle}
                className="w-full group relative flex items-center justify-center gap-3 bg-white text-black font-black py-5 px-8 rounded-2xl hover:bg-blue-50 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <LogIn className="w-5 h-5" />
                INITIALIZE COMMANDER AUTH
              </button>
            )}

            {auth.currentUser && (
              <div className="flex items-center gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-blue-500 uppercase tracking-widest">Authenticated</div>
                  <div className="text-sm font-bold text-white">{auth.currentUser.displayName}</div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                <User className="w-3 h-3" />
                Select_Operational_Role
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedRole(role.id);
                    }}
                    className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                      selectedRole === role.id 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                    }`}
                  >
                    <role.icon className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{role.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  if (selectedRole) {
                    sound.playSuccess();
                    onStart(selectedRole);
                  }
                }}
                disabled={!selectedRole}
                className="w-full group relative flex items-center justify-center gap-3 bg-blue-600 text-white font-black py-5 px-8 rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5 fill-current" />
                {auth.currentUser ? 'START NEW SIMULATION' : 'CONTINUE AS GUEST'}
              </button>
            </div>

            {/* Recent Sessions */}
            {auth.currentUser && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                    <History className="w-3 h-3" />
                    Recent_Deployments
                  </h3>
                </div>
                
                <div className="space-y-2">
                  {isLoadingSessions ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                  ) : recentSessions.length > 0 ? (
                    recentSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          sound.playClick();
                          onLoadSession(session.id, session.role || 'Prefect');
                        }}
                        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group"
                      >
                        <div className="text-left">
                          <div className="text-[10px] font-bold text-white uppercase tracking-wider">Session_{session.id.slice(0, 8)}</div>
                          <div className="text-[8px] font-mono text-gray-500 uppercase">
                            {new Date(session.lastUpdated).toLocaleDateString()} // Turn {session.turnCount}
                          </div>
                        </div>
                        <Zap className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                      </button>
                    ))
                  ) : (
                    <div className="text-[10px] text-gray-600 italic text-center py-4 border border-dashed border-white/5 rounded-xl">
                      No previous deployments found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-gray-600 uppercase tracking-[0.5em] pointer-events-none">
        System_Status: Optimal // Connection: Encrypted
      </div>
    </div>
  );
};
