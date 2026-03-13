import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';
import { Activity, Shield, Globe, AlertTriangle, History, Map as MapIcon } from 'lucide-react';
import { PlaygroundMap } from './PlaygroundMap';

interface DashboardProps {
  userRole: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [session, setSession] = useState<any>(null);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen to active session
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('createdBy', '==', auth.currentUser.uid),
      where('status', '==', 'active'),
      limit(1)
    );

    const unsubscribeSession = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const sessionData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        setSession(sessionData);

        // Listen to actions for this session
        const actionsRef = collection(db, `sessions/${sessionData.id}/actions`);
        const actionsQuery = query(actionsRef, orderBy('timestamp', 'desc'), limit(5));
        
        onSnapshot(actionsQuery, (actionSnapshot) => {
          setRecentActions(actionSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => handleFirestoreError(err, OperationType.LIST, `sessions/${sessionData.id}/actions`));
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'sessions'));

    return () => unsubscribeSession();
  }, []);

  if (!auth.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500 p-6 text-center">
        <Shield className="w-12 h-12 mb-4 text-amber-500/50" />
        <p className="font-mono uppercase tracking-widest mb-2 text-amber-500/80">Local Guest Session</p>
        <p className="text-xs max-w-md mb-6 leading-relaxed">
          Global Status monitoring is restricted to registered commanders. 
          Your current tactical session is local and will not be persisted to the global database.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl font-bold transition-all text-xs uppercase tracking-widest"
        >
          Return to Command Console
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <Activity className="w-12 h-12 mb-4 animate-pulse" />
        <p className="font-mono uppercase tracking-widest mb-6">Awaiting Command Initialization...</p>
        <button 
          onClick={() => window.location.reload()} // Simple way to trigger Game initialization
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all"
        >
          Initialize Tactical Feed
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-500" />
            Tactical Dashboard
          </h1>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
            Active Role: <span className="text-blue-400">{userRole}</span>
          </div>
        </div>
        <button 
          onClick={() => setShowMap(!showMap)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-widest ${showMap ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-zinc-800 border-white/10 text-gray-400 hover:text-white'}`}
        >
          <MapIcon className="w-4 h-4" />
          {showMap ? 'Hide Playground Map' : 'Show Playground Map'}
        </button>
      </div>

      {showMap && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-white/10 rounded-xl p-6 overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-6 text-purple-400">
            <Globe className="w-5 h-5" />
            <h3 className="font-black uppercase tracking-tighter">Playground Topology</h3>
          </div>
          <div className="h-[400px] flex items-center justify-center">
            <PlaygroundMap 
              selectedZoneId={null}
              onZoneSelect={() => {}}
              hotspots={session.hotspots || []}
            />
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Global Status Stats */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          label="Accountability" 
          value={session.scores.accountability} 
          icon={Globe} 
          color="text-blue-400" 
        />
        <StatCard 
          label="Protection" 
          value={session.scores.protection} 
          icon={Shield} 
          color="text-red-400" 
        />
        <StatCard 
          label="Systemic Reform" 
          value={session.scores.systemicReform} 
          icon={Activity} 
          color="text-purple-400" 
        />
      </div>

      {/* Active Hotspots */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 text-orange-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-black uppercase tracking-tighter">Active Hotspots</h3>
        </div>
        <div className="space-y-2">
          {session.hotspots?.length > 0 ? (
            session.hotspots.map((h: string) => (
              <div key={h} className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg text-sm font-mono text-orange-200">
                {h}
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-sm italic">No active conflicts detected.</p>
          )}
        </div>
      </div>

      {/* Recent Intel / Actions */}
      <div className="lg:col-span-3 bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6 text-gray-400">
          <History className="w-5 h-5" />
          <h3 className="font-black uppercase tracking-tighter">Recent Operations</h3>
        </div>
        <div className="space-y-4">
          {recentActions.map((action) => (
            <div key={action.id} className="flex gap-4 p-4 border-l-2 border-white/5 bg-white/5 rounded-r-lg">
              <div className="text-xs font-mono text-gray-500 whitespace-nowrap">
                {new Date(action.timestamp).toLocaleTimeString()}
              </div>
              <div>
                <div className="text-sm font-bold text-white mb-1">{action.role}</div>
                <p className="text-gray-400 text-sm leading-relaxed">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-black/40 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-black/40 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">{label}</div>
        <div className="text-2xl font-black text-white">{value}</div>
      </div>
    </div>
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        className={`h-full ${color.replace('text-', 'bg-')}`}
      />
    </div>
  </div>
);
