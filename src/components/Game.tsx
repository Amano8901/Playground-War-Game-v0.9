import React, { useState, useEffect, useRef } from 'react';
import { startNewGame, submitPlayerMove, TurnResponse } from '../services/gemini';
import { Send, Shield, Scale, Activity, Loader2, Globe, Crosshair, Zap, AlertTriangle, Search, ChevronDown, ChevronUp, History, Wifi } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import WorldMap, { regions } from './WorldMap';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { sound } from '../services/sound';
import { GoogleGenAI } from "@google/genai";

import { ConfirmationModal } from './ConfirmationModal';
import { PrefectProfile } from './PrefectProfile';
import { PlaygroundMap } from './PlaygroundMap';

interface Message {
  role: 'headmaster' | 'prefect';
  content: string;
  suggestedActions?: string[];
}

interface ScoreHistoryItem {
  turn: number;
  scores: {
    accountability: number;
    protection: number;
    systemicReform: number;
  };
  action: string;
}

interface GameProps {
  userRole: string;
  initialSessionId?: string | null;
}

export default function Game({ userRole, initialSessionId }: GameProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [scores, setScores] = useState({
    accountability: 0,
    protection: 0,
    systemicReform: 0,
    hotspots: [] as string[],
  });
  const [experience, setExperience] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showPlayground, setShowPlayground] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
  const [prevScores, setPrevScores] = useState({
    accountability: 0,
    protection: 0,
    systemicReform: 0,
    hotspots: [] as string[],
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [liveIntel, setLiveIntel] = useState<string | null>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);
  const intelCache = useRef<Record<string, { text: string, timestamp: number, hotspotStatus: boolean }>>({});
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSessionId) {
      loadSession(initialSessionId);
    } else {
      initGame();
    }
  }, [initialSessionId]);

  const loadSession = async (id: string) => {
    setIsLoading(true);
    try {
      const sessionRef = doc(db, 'sessions', id);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        const data = sessionSnap.data();
        setScores(data.scores || { accountability: 0, protection: 0, systemicReform: 0, hotspots: [] });
        setExperience(data.experience || 0);
        
        // Load messages if they exist (assuming they are stored in a subcollection or array)
        // For now, we'll just re-init the game if no messages are found
        setMessages([{
          role: 'headmaster',
          content: `Tactical session ${id} restored. Welcome back, Prefect. We are continuing from your last recorded position.`
        }]);
      } else {
        initGame();
      }
    } catch (error) {
      console.error("Error loading session:", error);
      initGame();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Fetch Live Intelligence for selected region
  useEffect(() => {
    if (selectedRegionId) {
      const isCurrentlyHotspot = scores.hotspots.includes(selectedRegionId);
      
      // Check cache first
      const cached = intelCache.current[selectedRegionId];
      const now = Date.now();
      const CACHE_TTL = 1000 * 60 * 10; 

      if (cached && (now - cached.timestamp < CACHE_TTL) && cached.hotspotStatus === isCurrentlyHotspot) {
        setLiveIntel(cached.text);
        return;
      }

      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      setIsLoadingIntel(true);
      
      fetchTimeoutRef.current = setTimeout(async () => {
        try {
          const region = regions.find(r => r.id === selectedRegionId);
          
          const savedKey = localStorage.getItem('PWG_CUSTOM_API_KEY');
          const apiKey = savedKey ? atob(savedKey) : process.env.GEMINI_API_KEY;
          
          if (!apiKey) {
            setLiveIntel("Intelligence feed offline. Please configure API key in settings.");
            setIsLoadingIntel(false);
            return;
          }

          const ai = new GoogleGenAI({ apiKey });
          
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate a brief, tactical intelligence report for the region: ${region?.name}. 
            Current Date: March 11, 2026. 
            Context: The region is ${isCurrentlyHotspot ? 'currently a HOTSPOT with critical alerts' : 'stable but under monitoring'}.
            Keep it under 60 words, use military/tactical jargon, and include one "simulated" recent event.`,
          });

          const text = response.text || "Unable to retrieve live intelligence.";
          setLiveIntel(text);
          
          intelCache.current[selectedRegionId] = {
            text,
            timestamp: Date.now(),
            hotspotStatus: isCurrentlyHotspot
          };
        } catch (error: any) {
          console.error("Intel Error:", error);
          setLiveIntel("Tactical feed interrupted. Check local encryption.");
        } finally {
          setIsLoadingIntel(false);
          fetchTimeoutRef.current = null;
        }
      }, 800); 
    } else {
      setLiveIntel(null);
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [selectedRegionId, scores.hotspots]);

  useEffect(() => {
    if (auth.currentUser && sessionId && userRole) {
      const updateSessionRole = async () => {
        try {
          await updateDoc(doc(db, 'sessions', sessionId), {
            role: userRole,
            lastUpdated: new Date().toISOString()
          });
        } catch (e) {
          console.error("Error updating session role:", e);
        }
      };
      updateSessionRole();
    }
  }, [userRole, sessionId]);

  const initGame = async () => {
    setIsLoading(true);
    try {
      sound.playAction();
      const response = await startNewGame();
      setMessages([{ role: 'headmaster', content: response.message, suggestedActions: response.suggestedActions }]);
      setPrevScores(response.scores);
      setScores(response.scores);
      setSuggestedActions(response.suggestedActions || []);
      setScoreHistory([{
        turn: 1,
        scores: { ...response.scores },
        action: 'INITIALIZATION'
      }]);

      // Create Firebase Session
      if (auth.currentUser) {
        const sessionRef = await addDoc(collection(db, 'sessions'), {
          status: 'active',
          role: userRole,
          scores: response.scores,
          hotspots: response.scores.hotspots,
          turnCount: 1,
          experience: 0,
          lastUpdated: new Date().toISOString(),
          createdBy: auth.currentUser.uid
        });
        setSessionId(sessionRef.id);
        
        // Update user's current session
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          currentSessionId: sessionRef.id
        });
      }
    } catch (error) {
      console.error(error);
      setMessages([{ role: 'headmaster', content: 'Failed to initialize the live feed. Please check your connection.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (isLoading) return;
    sound.playClick();
    setIsSidebarOpen(false);
    processMove(action);
  };

  const processMove = async (move: string) => {
    sound.playAction();
    setMessages((prev) => [...prev, { role: 'prefect', content: move }]);
    setIsLoading(true);

    try {
      const response = await submitPlayerMove(move);
      sound.playSuccess();
      
      // Calculate experience gain
      const expGain = 15 + Math.floor(Math.random() * 10);
      const newExperience = experience + expGain;
      setExperience(newExperience);

      setMessages((prev) => [...prev, { role: 'headmaster', content: response.message, suggestedActions: response.suggestedActions }]);
      setPrevScores(scores);
      setScores(response.scores);
      setSuggestedActions(response.suggestedActions || []);

      setScoreHistory(prev => [
        ...prev,
        {
          turn: prev.length + 1,
          scores: { ...response.scores },
          action: move
        }
      ]);

      // Log Action and Update Session in Firebase
      if (auth.currentUser && sessionId) {
        await addDoc(collection(db, `sessions/${sessionId}/actions`), {
          sessionId,
          userId: auth.currentUser.uid,
          role: userRole,
          description: move,
          impact: response.scores,
          timestamp: new Date().toISOString()
        });

        await updateDoc(doc(db, 'sessions', sessionId), {
          scores: response.scores,
          hotspots: response.scores.hotspots,
          experience: newExperience,
          turnCount: messages.length / 2 + 1,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || String(error);
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        setCooldown(30); // 30 second cooldown on 429
        sound.playAlert();
      }
      setMessages((prev) => [...prev, { role: 'headmaster', content: 'Communication error. The feed was interrupted.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMove = input.trim();
    setInput('');
    sound.playClick();
    processMove(userMove);
  };

  const handleRetry = () => {
    if (cooldown > 0) return;
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'prefect');
    if (lastUserMessage) {
      processMove(lastUserMessage.content);
    } else {
      initGame();
    }
  };

  const isRateLimited = messages.length > 0 && messages[messages.length - 1].content.includes("RATE LIMIT");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    const foundRegion = regions.find(r => 
      (r.name?.toLowerCase() || '').includes(query) || 
      (r.id?.toLowerCase() || '').includes(query) ||
      (r.description?.toLowerCase() || '').includes(query)
    );

    if (foundRegion) {
      sound.playClick();
      setSelectedRegionId(foundRegion.id);
      setSearchQuery(''); // Clear search after finding
    }
  };

  const handleNewGame = () => {
    sound.playAlert();
    setConfirmation({
      isOpen: true,
      title: 'System Reboot Required',
      message: 'Are you sure you want to restart the tactical simulation? All current progress will be lost.',
      onConfirm: () => {
        setMessages([]);
        initGame();
      }
    });
  };

  const clearChat = () => {
    sound.playAlert();
    setConfirmation({
      isOpen: true,
      title: 'Purge Communication Logs',
      message: 'Are you sure you want to clear the tactical communication history? This action cannot be undone.',
      onConfirm: () => {
        setMessages(messages.slice(-1)); // Keep only the last message
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#05070a] text-zinc-100 font-mono relative overflow-hidden">
      {/* Tactical Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px]"></div>
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] text-blue-500/20" viewBox="0 0 1000 500">
          <path fill="currentColor" d="M150,200 Q200,150 250,200 T350,200 T450,250 T550,200 T650,200 T750,250 T850,200" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="300" cy="250" r="2" fill="currentColor" />
          <circle cx="700" cy="150" r="2" fill="currentColor" />
          <circle cx="500" cy="350" r="2" fill="currentColor" />
          <rect x="0" y="0" width="1000" height="500" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="10,10" />
        </svg>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-3 md:p-4 border-b border-blue-500/30 bg-[#0a0f18]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <Globe className="w-5 h-5 md:w-6 md:h-6 text-blue-400 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full"></div>
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black tracking-tighter text-blue-400 uppercase flex items-center gap-2">
              <Crosshair className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden xs:inline">Global Reform Command</span>
              <span className="xs:hidden">GRC</span>
            </h1>
            <div className="text-[8px] md:text-[10px] text-blue-500/60 font-bold tracking-widest uppercase truncate max-w-[150px] md:max-w-none">
              Strategic Oversight // v2.0.26
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden sm:flex items-center gap-4">
            <button 
              onClick={handleNewGame}
              className="text-[10px] font-black text-blue-500/60 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              <Zap className="w-3 h-3" />
              REBOOT_SIM
            </button>
            <button 
              onClick={clearChat}
              className="text-[10px] font-black text-zinc-500 hover:text-zinc-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              <Loader2 className="w-3 h-3" />
              PURGE_LOGS
            </button>
          </div>
          <div className="hidden sm:block h-8 w-[1px] bg-zinc-800"></div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Status</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              ACTIVE
            </span>
          </div>
          <div className="hidden sm:block h-8 w-[1px] bg-zinc-800"></div>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Operator</span>
            <span className="text-xs text-blue-400 font-bold">{userRole.toUpperCase()}</span>
          </div>
          <div className="hidden sm:block h-8 w-[1px] bg-zinc-800"></div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                sound.playClick();
                setShowProfile(true);
              }}
              className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-sm text-blue-400 hover:bg-blue-500/20 transition-colors"
              title="Prefect Profile"
            >
              <Shield className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                sound.playClick();
                setShowPlayground(!showPlayground);
              }}
              className={`p-2 border rounded-sm transition-colors ${showPlayground ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/20'}`}
              title="Playground Map"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 bg-blue-500/10 border border-blue-500/30 rounded-sm text-blue-400"
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden z-10 relative">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-blue-500/10 bg-black/20 flex flex-col lg:flex-row overflow-hidden min-h-[200px] lg:min-h-[300px] relative">
            <AnimatePresence>
              {isLoading && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-[#05070a] flex flex-col items-center justify-center p-8"
                >
                  <div className="w-full max-w-2xl aspect-[2/1] relative">
                    <svg viewBox="0 0 1000 500" className="w-full h-full">
                      {regions.map((region) => (
                        <motion.path
                          key={region.id}
                          d={region.path}
                          fill="none"
                          stroke="rgba(59, 130, 246, 0.2)"
                          strokeWidth="1"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ 
                            pathLength: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut",
                            delay: Math.random() * 2
                          }}
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] animate-pulse">
                        Initializing_Global_Oversight
                      </div>
                      <div className="w-48 h-[1px] bg-blue-500/20 relative overflow-hidden">
                        <motion.div 
                          className="absolute inset-0 bg-blue-500"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 p-2 md:p-4 flex items-center justify-center relative">
              {showPlayground ? (
                <PlaygroundMap 
                  selectedZoneId={selectedZoneId}
                  onZoneSelect={setSelectedZoneId}
                  hotspots={scores.hotspots}
                />
              ) : (
                <WorldMap 
                  hotspots={scores.hotspots} 
                  onRegionSelect={setSelectedRegionId}
                  selectedRegionId={selectedRegionId}
                />
              )}
              {!selectedRegionId && (
                <div className="absolute bottom-4 right-4 hidden lg:block">
                  <div className="text-[8px] text-blue-500/30 font-black uppercase tracking-[0.3em] animate-pulse">
                    Select_Sector_For_Intel
                  </div>
                </div>
              )}
            </div>

            <AnimatePresence>
              {selectedRegionId && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="lg:w-80 border-t lg:border-t-0 lg:border-l border-blue-500/10 bg-[#0a0f18]/40 backdrop-blur-md overflow-hidden flex flex-col"
                >
                  <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Sector_Intelligence
                      </h2>
                      <button 
                        onClick={() => setSelectedRegionId(null)}
                        className="text-[8px] text-zinc-500 hover:text-blue-400 uppercase font-bold p-1"
                      >
                        [Dismiss]
                      </button>
                    </div>
                    
                    {(() => {
                      const region = regions.find(r => r.id === selectedRegionId);
                      const isHotspot = (scores.hotspots || []).includes(selectedRegionId || '');
                      return region ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <div className="text-[14px] font-black text-blue-300 uppercase tracking-tight">{region.name}</div>
                            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                              <Globe className="w-2 h-2" />
                              ID: {region.id}
                            </div>
                            <div className="absolute -right-2 -top-2 text-[40px] font-black text-white/5 pointer-events-none select-none">
                              {region.id.slice(0, 2)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black/40 p-3 rounded-sm border border-white/5 relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-full h-[1px] bg-blue-500/20"></div>
                              <div className="text-[7px] text-zinc-500 uppercase font-black mb-1 tracking-tighter">Population</div>
                              <div className="text-[12px] font-mono text-blue-400 font-bold">{region.population}</div>
                            </div>
                            <div className="bg-black/40 p-3 rounded-sm border border-white/5 relative overflow-hidden group">
                              <div className={`absolute top-0 left-0 w-full h-[1px] ${isHotspot ? 'bg-red-500/40' : 'bg-emerald-500/40'}`}></div>
                              <div className="text-[7px] text-zinc-500 uppercase font-black mb-1 tracking-tighter">Tension_Level</div>
                              <div className={`text-[12px] font-mono font-bold ${isHotspot ? 'text-red-400' : 'text-emerald-400'}`}>
                                {isHotspot ? 'CRITICAL' : 'STABLE'}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-[7px] text-zinc-500 uppercase font-black tracking-widest">Strategic_Assessment</div>
                            <p className="text-[10px] text-zinc-400 leading-relaxed font-medium border-l border-blue-500/20 pl-3 py-1">
                              {region.description}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2">
                            <div className="text-[7px] text-blue-500/60 uppercase font-black tracking-widest flex items-center gap-2">
                              <Wifi className="w-2 h-2" />
                              Live_Tactical_Feed
                            </div>
                            <div className="bg-black/40 p-3 rounded-sm border border-blue-500/10 relative overflow-hidden">
                              {isLoadingIntel ? (
                                <div className="space-y-2">
                                  <div className="h-2 bg-blue-500/10 animate-pulse rounded-full w-full"></div>
                                  <div className="h-2 bg-blue-500/10 animate-pulse rounded-full w-5/6"></div>
                                  <div className="h-2 bg-blue-500/10 animate-pulse rounded-full w-4/6"></div>
                                </div>
                              ) : (
                                <p className="text-[10px] text-blue-100/80 leading-relaxed italic font-medium">
                                  "{liveIntel || 'No active intelligence for this sector.'}"
                                </p>
                              )}
                              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(59,130,246,0.02)_50%)] bg-[length:100%_4px]"></div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-blue-500/5">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${isHotspot ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Real_Time_Status</span>
                            </div>
                            <div className="text-[7px] text-zinc-600 font-mono uppercase">
                              {isHotspot ? 'Warning: High probability of escalation in this sector. Recommend immediate intervention.' : 'Sector remains within acceptable parameters. Monitoring continues.'}
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-blue-900/50">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, x: msg.role === 'prefect' ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  className={`flex ${msg.role === 'prefect' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] md:max-w-[85%] rounded-sm p-4 md:p-5 relative ${
                      msg.role === 'prefect'
                        ? 'bg-emerald-950/20 border-r-2 border-emerald-500 text-emerald-100'
                        : 'bg-blue-950/10 border-l-2 border-blue-500 text-zinc-300'
                    }`}
                  >
                    {/* Corner accents */}
                    <div className={`absolute top-0 ${msg.role === 'prefect' ? 'right-0' : 'left-0'} w-2 h-2 border-t border-current opacity-30`}></div>
                    
                    <div className={`text-[8px] md:text-[10px] font-black uppercase mb-2 md:mb-3 tracking-widest flex items-center gap-2 ${
                      msg.role === 'prefect' ? 'text-emerald-500' : 'text-blue-500'
                    }`}>
                      {msg.role === 'prefect' ? <Zap className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                      {msg.role === 'prefect' ? 'DIRECTIVE' : 'REPORT'}
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-xs md:text-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {/* Suggested Actions within Chat */}
                    {msg.role === 'headmaster' && msg.suggestedActions && msg.suggestedActions.length > 0 && idx === messages.length - 1 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <motion.button
                            key={aIdx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: aIdx * 0.1 }}
                            onClick={() => handleActionClick(action)}
                            className="text-[10px] px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition-all flex items-center gap-1"
                          >
                            <Zap className="w-2.5 h-2.5" />
                            {action}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-blue-950/20 border border-blue-500/20 rounded-sm p-3 md:p-4 flex items-center gap-3 text-blue-400/60 italic text-[10px] md:text-xs">
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                  <span>INTERCEPTING_DATA...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 bg-[#0a0f18]/80 backdrop-blur-md border-t border-blue-500/20">
            <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3 max-w-4xl mx-auto w-full">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="TYPE DIRECTIVE..."
                  className="w-full bg-black/40 border border-blue-500/30 rounded-sm px-3 md:px-4 py-2 md:py-3 focus:outline-none focus:border-blue-400 text-zinc-100 placeholder-blue-900/50 font-mono text-xs md:text-sm transition-all"
                  disabled={isLoading}
                />
                <div className="hidden xs:block absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-blue-500/40 font-bold uppercase tracking-widest">
                  SECURE_CH
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || cooldown > 0 || (!input.trim() && !isRateLimited)}
                onClick={isRateLimited ? (e) => { e.preventDefault(); handleRetry(); } : undefined}
                className={`${isRateLimited ? 'bg-red-600/20 text-red-400 border-red-500/50' : 'bg-blue-600/20 text-blue-400 border-blue-500/50'} hover:opacity-80 border disabled:opacity-30 disabled:cursor-not-allowed rounded-sm px-4 md:px-8 py-2 md:py-3 font-black uppercase tracking-tighter transition-all flex items-center gap-2 group text-xs md:text-sm`}
              >
                <span className="hidden xs:inline">
                  {isRateLimited ? (cooldown > 0 ? `COOLDOWN_${cooldown}S` : 'RETRY_SYNC') : 'EXECUTE'}
                </span>
                {isRateLimited && cooldown > 0 ? null : (isRateLimited ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Send className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />)}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar - Scores */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            />
          )}
        </AnimatePresence>

        <div className={`
          fixed inset-0 z-40 md:relative md:inset-auto md:flex
          ${isSidebarOpen ? 'flex' : 'hidden'}
          w-full md:w-80 bg-[#0a0f18]/95 md:bg-[#0a0f18]/60 backdrop-blur-xl p-6 flex-col border-l border-blue-500/10
          transition-all duration-300
        `}>
          <div className="flex items-center justify-between mb-8 md:hidden">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Tactical Overview</h2>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-zinc-500 hover:text-white"
            >
              <Zap className="w-5 h-5 rotate-45" />
            </button>
          </div>
          <div className="mb-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60 mb-6 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Operational_Metrics
            </h2>
            
            <div className="space-y-10">
              <ScoreBar
                icon={<Scale className="w-4 h-4 text-blue-400" />}
                label="Accountability"
                score={scores.accountability}
                prevScore={prevScores.accountability}
                color="bg-blue-500"
              />
              <ScoreBar
                icon={<Shield className="w-4 h-4 text-emerald-400" />}
                label="Protection"
                score={scores.protection}
                prevScore={prevScores.protection}
                color="bg-emerald-500"
              />
              <ScoreBar
                icon={<Activity className="w-4 h-4 text-purple-400" />}
                label="Reform"
                score={scores.systemicReform}
                prevScore={prevScores.systemicReform}
                color="bg-purple-500"
              />
            </div>
          </div>

          {/* Score History Section */}
          <div className="mb-8 border-t border-blue-500/10 pt-6">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60 hover:text-blue-400 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-3 h-3" />
                Score_History
              </div>
              {isHistoryOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4 space-y-3"
                >
                  {scoreHistory.length > 0 ? (
                    scoreHistory.slice().reverse().map((item, i) => (
                      <div key={i} className="text-[9px] p-2 bg-black/40 border border-white/5 rounded-sm">
                        <div className="flex justify-between text-zinc-500 mb-1">
                          <span>TURN_{item.turn}</span>
                          <span className="truncate max-w-[100px]">{item.action}</span>
                        </div>
                        <div className="flex gap-3 font-mono">
                          <span className="text-blue-400">A:{item.scores.accountability}</span>
                          <span className="text-emerald-400">P:{item.scores.protection}</span>
                          <span className="text-purple-400">R:{item.scores.systemicReform}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[9px] text-zinc-600 italic">No history recorded.</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/60 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Tactical_Options
            </h2>
            <div className="space-y-2">
              {suggestedActions.length > 0 ? (
                suggestedActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleActionClick(action)}
                    className="w-full text-left text-[10px] p-3 rounded-sm bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all text-zinc-400 hover:text-blue-300 group relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-blue-500/0 group-hover:bg-blue-500 transition-all"></div>
                    {action}
                  </button>
                ))
              ) : (
                <div className="text-[9px] text-zinc-600 italic p-3 border border-dashed border-zinc-800 rounded-sm">
                  Waiting for strategic analysis...
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-500/10">
            <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-sm">
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black mb-1">
                <AlertTriangle className="w-3 h-3" />
                MISSION_OBJECTIVE
              </div>
              <p className="text-[9px] text-zinc-500 leading-relaxed uppercase tracking-wider">
                Leverage moral authority to restructure the playground. Neutralize captain dominance. Shield non-combatants.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Modals & Overlays */}
      <AnimatePresence>
        {showProfile && (
          <PrefectProfile 
            role={userRole} 
            experience={experience}
            scores={{
              accountability: scores.accountability,
              protection: scores.protection,
              systemicReform: scores.systemicReform
            }}
            onClose={() => setShowProfile(false)} 
          />
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
      />
    </div>
  );
}

function ScoreBar({ icon, label, score, prevScore, color }: { icon: React.ReactNode; label: string; score: number; prevScore: number; color: string }) {
  const diff = score - prevScore;
  
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-zinc-800/50 rounded-sm">{icon}</div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {diff !== 0 && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-[10px] font-black ${diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {diff > 0 ? `+${diff}` : diff}
              </motion.span>
            )}
          </AnimatePresence>
          <span className="text-xs font-black font-mono text-zinc-200">{score}</span>
        </div>
      </div>
      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: `${prevScore}%` }}
          animate={{ width: `${score}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          className={`h-full ${color} relative shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        >
          <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
        </motion.div>
      </div>
    </div>
  );
}
