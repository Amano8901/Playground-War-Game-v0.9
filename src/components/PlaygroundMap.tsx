import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Activity, Shield, Users, Info } from 'lucide-react';

export interface Zone {
  id: string;
  name: string;
  description: string;
  status: 'STABLE' | 'TENSE' | 'CRITICAL';
  control: 'PREFECTS' | 'CAPTAINS' | 'NEUTRAL';
  population: string;
  coordinates: { x: number; y: number };
}

export const playgroundZones: Zone[] = [
  {
    id: 'SWINGS',
    name: 'The Swings',
    description: 'High-altitude territory. Used for rapid observation and aerial signaling.',
    status: 'TENSE',
    control: 'CAPTAINS',
    population: '15 Students',
    coordinates: { x: 200, y: 150 }
  },
  {
    id: 'SANDBOX',
    name: 'The Sandbox',
    description: 'Resource-rich excavation site. Strategic for hidden caches and fortification.',
    status: 'STABLE',
    control: 'NEUTRAL',
    population: '22 Students',
    coordinates: { x: 500, y: 300 }
  },
  {
    id: 'SLIDE',
    name: 'The Slide',
    description: 'One-way rapid transit corridor. Critical for quick retreats and gravity-assisted maneuvers.',
    status: 'CRITICAL',
    control: 'CAPTAINS',
    population: '8 Students',
    coordinates: { x: 800, y: 100 }
  },
  {
    id: 'JUNGLE_GYM',
    name: 'The Jungle Gym',
    description: 'Multi-level vertical fortress. Hard to breach, excellent defensive positions.',
    status: 'STABLE',
    control: 'PREFECTS',
    population: '12 Students',
    coordinates: { x: 350, y: 400 }
  },
  {
    id: 'BASKETBALL_COURT',
    name: 'The Courts',
    description: 'Open-field combat zone. High visibility, low cover. High-stakes diplomacy area.',
    status: 'TENSE',
    control: 'NEUTRAL',
    population: '30 Students',
    coordinates: { x: 700, y: 400 }
  },
  {
    id: 'OAK_TREE',
    name: 'The Great Oak',
    description: 'Ancient neutral ground. Used for high-level summits and intelligence exchanges.',
    status: 'STABLE',
    control: 'NEUTRAL',
    population: '5 Students',
    coordinates: { x: 100, y: 400 }
  }
];

interface PlaygroundMapProps {
  selectedZoneId: string | null;
  onZoneSelect: (id: string) => void;
  hotspots: string[];
}

export const PlaygroundMap: React.FC<PlaygroundMapProps> = ({ selectedZoneId, onZoneSelect, hotspots }) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">
      {/* Map Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <svg viewBox="0 0 1000 500" className="w-full h-full">
        {/* Connection Lines */}
        <g stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1" strokeDasharray="5,5">
          <line x1="200" y1="150" x2="500" y2="300" />
          <line x1="500" y1="300" x2="800" y2="100" />
          <line x1="350" y1="400" x2="500" y2="300" />
          <line x1="700" y1="400" x2="500" y2="300" />
          <line x1="100" y1="400" x2="200" y2="150" />
        </g>

        {/* Zones */}
        {playgroundZones.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          const isHovered = hoveredZone === zone.id;
          const isHotspot = hotspots.includes(zone.id);

          return (
            <g 
              key={zone.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
              onClick={() => onZoneSelect(zone.id)}
            >
              {/* Hotspot Pulse */}
              {isHotspot && (
                <motion.circle
                  cx={zone.coordinates.x}
                  cy={zone.coordinates.y}
                  r="30"
                  fill="none"
                  stroke="rgba(239, 68, 68, 0.5)"
                  strokeWidth="2"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Selection Ring */}
              <AnimatePresence>
                {(isSelected || isHovered) && (
                  <motion.circle
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    cx={zone.coordinates.x}
                    cy={zone.coordinates.y}
                    r="25"
                    fill="none"
                    stroke={isSelected ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.3)"}
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                )}
              </AnimatePresence>

              {/* Zone Marker */}
              <motion.circle
                cx={zone.coordinates.x}
                cy={zone.coordinates.y}
                r="8"
                fill={
                  zone.status === 'CRITICAL' ? '#ef4444' :
                  zone.status === 'TENSE' ? '#f59e0b' : '#10b981'
                }
                className="shadow-lg"
                animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />

              {/* Zone Label */}
              <text
                x={zone.coordinates.x}
                y={zone.coordinates.y + 25}
                textAnchor="middle"
                className={`text-[10px] font-mono font-bold uppercase tracking-widest fill-white pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-60'}`}
              >
                {zone.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/5 space-y-2">
        <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Zone Status</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[9px] font-mono text-gray-300">STABLE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-[9px] font-mono text-gray-300">TENSE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-[9px] font-mono text-gray-300">CRITICAL</span>
        </div>
      </div>

      {/* Zone Info Overlay */}
      <AnimatePresence>
        {hoveredZone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 right-4 w-48 bg-black/80 backdrop-blur-md p-4 rounded-lg border border-blue-500/30 pointer-events-none"
          >
            {(() => {
              const zone = playgroundZones.find(z => z.id === hoveredZone);
              if (!zone) return null;
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-black text-blue-400 uppercase">{zone.name}</div>
                    <Activity className={`w-3 h-3 ${zone.status === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}`} />
                  </div>
                  <p className="text-[9px] text-gray-400 leading-tight">{zone.description}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <div>
                      <div className="text-[7px] text-gray-500 uppercase">Control</div>
                      <div className="text-[8px] font-bold text-white">{zone.control}</div>
                    </div>
                    <div>
                      <div className="text-[7px] text-gray-500 uppercase">Pop</div>
                      <div className="text-[8px] font-bold text-white">{zone.population}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
