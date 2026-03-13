/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FirebaseProvider, useAuth } from './components/FirebaseProvider';
import { RoleSelection } from './components/RoleSelection';
import { Dashboard } from './components/Dashboard';
import { Tutorial } from './components/Tutorial';
import { Settings } from './components/Settings';
import Game from './components/Game';
import { signInWithGoogle, signInAsGuest, logout, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, BookOpen, LayoutDashboard, Terminal, Settings as SettingsIcon, User as UserIcon, ShieldAlert } from 'lucide-react';
import { sound } from './services/sound';
import { ErrorModal } from './components/ErrorModal';

import { StartScreen } from './components/StartScreen';

function AppContent() {
  const { user, loading, isAnonymous } = useAuth();
  const [localGuest, setLocalGuest] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState<'dashboard' | 'console'>('console');
  const [checkingRole, setCheckingRole] = useState(true);
  const [error, setError] = useState<{ title: string; message: string; code?: string } | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    const handleInteraction = () => {
      // Initialize audio context on first interaction
      (sound as any).init?.();
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  useEffect(() => {
    async function checkRole() {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          }
        } catch (e) {
          console.error("Error checking role:", e);
        }
      }
      setCheckingRole(false);
    }
    checkRole();
  }, [user]);

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Show Start Screen if not in a game and not logged in/guest
  if (!userRole && !localGuest && !activeSessionId) {
    return (
      <StartScreen 
        onStart={(role) => {
          setUserRole(role);
          setLocalGuest(true);
        }} 
        onLoadSession={(id, role) => {
          setActiveSessionId(id);
          setUserRole(role);
          setLocalGuest(true);
        }}
      />
    );
  }

  if (!userRole && !activeSessionId) {
    return <RoleSelection onRoleSelected={setUserRole} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-black uppercase tracking-tighter text-xl text-white">
              PWG <span className="text-blue-500">System</span>
            </h1>
            <nav className="hidden md:flex items-center gap-1">
              <NavButton 
                active={view === 'console'} 
                onClick={() => setView('console')} 
                icon={Terminal} 
                label="Command Console" 
              />
              <NavButton 
                active={view === 'dashboard'} 
                onClick={() => setView('dashboard')} 
                icon={LayoutDashboard} 
                label="Global Status" 
              />
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {(isAnonymous || localGuest) && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <ShieldAlert className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                  {localGuest ? 'Local_Guest' : 'Guest_Mode'}
                </span>
              </div>
            )}
            <button 
              onClick={() => {
                sound.playClick();
                setShowSettings(true);
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                sound.playClick();
                setShowTutorial(true);
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Tutorial"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white truncate max-w-[120px]">
                  {localGuest ? 'Local Commander' : (isAnonymous ? 'Guest Commander' : user?.displayName)}
                </div>
                <button 
                  onClick={() => {
                    sound.playClick();
                    setShowRoleSelection(true);
                  }}
                  className="text-[10px] font-mono uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors block text-right w-full"
                >
                  {userRole || 'Initializing...'}
                </button>
              </div>
              <button 
                onClick={() => {
                  sound.playAlert();
                  if (localGuest) {
                    setLocalGuest(false);
                    setUserRole(null);
                    setActiveSessionId(null);
                  } else {
                    logout();
                  }
                }}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          {view === 'console' ? (
            <motion.div
              key="console"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Game userRole={userRole || 'Prefect'} initialSessionId={activeSessionId} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Dashboard userRole={userRole || 'Prefect'} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showRoleSelection && (
        <RoleSelection 
          isModal 
          onClose={() => setShowRoleSelection(false)} 
          onRoleSelected={(role) => {
            setUserRole(role);
            setShowRoleSelection(false);
          }} 
        />
      )}
      <ErrorModal 
        isOpen={!!error} 
        onClose={() => setError(null)}
        title={error?.title || ''}
        message={error?.message || ''}
        code={error?.code}
      />
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-mono uppercase tracking-widest text-[10px] ${
      active ? 'bg-blue-500/10 text-blue-400' : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
