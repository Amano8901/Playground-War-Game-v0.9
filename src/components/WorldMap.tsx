import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Activity, Search } from 'lucide-react';

interface WorldMapProps {
  hotspots: string[];
}

interface RegionData {
  id: string;
  name: string;
  path: string;
  borders: string;
  population: string;
  description: string;
}

export const regions: RegionData[] = [
  { 
    id: 'NORTH_AMERICA', 
    name: 'North America', 
    path: 'M150,100 L250,100 L280,150 L250,250 L150,250 Z', 
    borders: 'M180,100 L180,250 M150,180 L280,180 M210,100 L210,180 M250,100 L250,150',
    population: '592M',
    description: 'High technological output. Significant influence on global playground policy. Currently facing internal polarization and trade disputes with major Asian markets.'
  },
  { 
    id: 'SOUTH_AMERICA', 
    name: 'South America', 
    path: 'M250,250 L300,250 L320,350 L280,450 L230,350 Z', 
    borders: 'M250,350 L320,350 M280,250 L280,450 M230,350 L300,350',
    population: '430M',
    description: 'Emerging markets. Rich in natural resources and cultural diversity. Increasing regional cooperation amidst economic volatility and resource nationalism.'
  },
  { 
    id: 'EUROPE', 
    name: 'Europe', 
    path: 'M450,100 L550,100 L580,180 L480,180 Z', 
    borders: 'M500,100 L500,180 M450,140 L580,140 M530,100 L530,140',
    population: '746M',
    description: 'Complex regulatory landscape. Strong focus on systemic playground reform. Balancing energy security with aggressive climate goals and eastern border tensions.'
  },
  { 
    id: 'AFRICA', 
    name: 'Africa', 
    path: 'M450,180 L580,180 L620,350 L500,450 L420,300 Z', 
    borders: 'M450,250 L600,250 M520,180 L520,450 M480,300 L620,300 M550,250 L550,350',
    population: '1.2B',
    description: 'Rapidly growing youth population. Strategic importance for future stability. Hub for digital innovation and infrastructure development under global competition.'
  },
  { 
    id: 'MIDDLE_EAST', 
    name: 'Middle East', 
    path: 'M580,180 L650,180 L680,250 L600,250 Z', 
    borders: 'M620,180 L620,250 M580,210 L680,210',
    population: '411M',
    description: 'High tension, oil-rich region with strategic choke points. Tactical hub for energy security and regional power dynamics with active proxy conflicts.'
  },
  { 
    id: 'ASIA', 
    name: 'Asia', 
    path: 'M580,50 L850,50 L900,300 L650,300 L650,180 Z', 
    borders: 'M700,50 L700,300 M580,150 L900,150 M780,50 L780,300 M650,220 L900,220',
    population: '4.5B',
    description: 'Global manufacturing powerhouse. Dense urban centers and varied interests. Rapid technological escalation and maritime territorial disputes in the South Sea.'
  },
  { 
    id: 'OCEANIA', 
    name: 'Oceania', 
    path: 'M750,350 L900,350 L920,450 L780,450 Z', 
    borders: 'M820,350 L820,450 M750,400 L920,400',
    population: '42M',
    description: 'Maritime focus. Key partner in environmental and systemic oversight. Critical for Pacific security and climate resilience against rising sea levels.'
  },
];

const majorCities = [
  { name: 'New York', x: 210, y: 160, importance: 'HIGH' },
  { name: 'London', x: 480, y: 120, importance: 'HIGH' },
  { name: 'Paris', x: 495, y: 135, importance: 'MED' },
  { name: 'Cairo', x: 550, y: 220, importance: 'MED' },
  { name: 'Dubai', x: 620, y: 210, importance: 'HIGH' },
  { name: 'Tokyo', x: 860, y: 140, importance: 'HIGH' },
  { name: 'Sydney', x: 880, y: 420, importance: 'MED' },
  { name: 'Rio', x: 300, y: 380, importance: 'MED' },
  { name: 'Cape Town', x: 520, y: 430, importance: 'MED' },
  { name: 'Moscow', x: 600, y: 100, importance: 'HIGH' },
  { name: 'Beijing', x: 780, y: 130, importance: 'HIGH' },
  { name: 'Mumbai', x: 700, y: 240, importance: 'HIGH' },
  { name: 'Seoul', x: 830, y: 135, importance: 'MED' },
  { name: 'Singapore', x: 750, y: 280, importance: 'HIGH' },
  { name: 'Berlin', x: 515, y: 115, importance: 'MED' },
  { name: 'Toronto', x: 200, y: 140, importance: 'MED' },
  { name: 'Los Angeles', x: 160, y: 180, importance: 'HIGH' },
  { name: 'Mexico City', x: 200, y: 230, importance: 'MED' },
  { name: 'Buenos Aires', x: 290, y: 430, importance: 'MED' },
  { name: 'Lagos', x: 480, y: 300, importance: 'MED' },
  { name: 'Nairobi', x: 580, y: 320, importance: 'MED' },
  { name: 'Istanbul', x: 560, y: 160, importance: 'HIGH' },
  { name: 'Tehran', x: 630, y: 180, importance: 'MED' },
  { name: 'New Delhi', x: 720, y: 200, importance: 'HIGH' },
  { name: 'Jakarta', x: 780, y: 320, importance: 'MED' },
  { name: 'Bangkok', x: 770, y: 260, importance: 'MED' },
  { name: 'Shanghai', x: 820, y: 180, importance: 'HIGH' },
];

const dataLinks = [
  { from: 'New York', to: 'London', type: 'DATA', importance: 'HIGH' },
  { from: 'London', to: 'Tokyo', type: 'STRATEGIC', importance: 'HIGH' },
  { from: 'Tokyo', to: 'Sydney', type: 'DATA', importance: 'MED' },
  { from: 'Sydney', to: 'Singapore', type: 'STRATEGIC', importance: 'MED' },
  { from: 'Singapore', to: 'Dubai', type: 'DATA', importance: 'HIGH' },
  { from: 'Dubai', to: 'London', type: 'STRATEGIC', importance: 'HIGH' },
  { from: 'New York', to: 'Los Angeles', type: 'DATA', importance: 'MED' },
  { from: 'Los Angeles', to: 'Tokyo', type: 'STRATEGIC', importance: 'HIGH' },
  { from: 'Paris', to: 'Berlin', type: 'DATA', importance: 'MED' },
  { from: 'Berlin', to: 'Moscow', type: 'STRATEGIC', importance: 'HIGH' },
  { from: 'Moscow', to: 'Beijing', type: 'DATA', importance: 'HIGH' },
  { from: 'Beijing', to: 'Shanghai', type: 'STRATEGIC', importance: 'HIGH' },
  { from: 'Shanghai', to: 'Singapore', type: 'DATA', importance: 'MED' },
  { from: 'Mumbai', to: 'Dubai', type: 'STRATEGIC', importance: 'MED' },
  { from: 'Cairo', to: 'Istanbul', type: 'DATA', importance: 'MED' },
  { from: 'Istanbul', to: 'Berlin', type: 'STRATEGIC', importance: 'MED' },
  { from: 'Rio', to: 'Cape Town', type: 'DATA', importance: 'LOW' },
  { from: 'Cape Town', to: 'Nairobi', type: 'STRATEGIC', importance: 'LOW' },
  { from: 'Nairobi', to: 'Dubai', type: 'DATA', importance: 'MED' },
];

const simulatedAttacks = [
  { from: 'MIDDLE_EAST', to: 'EUROPE', intensity: 0.8, status: 'active' },
  { from: 'ASIA', to: 'OCEANIA', intensity: 0.4, status: 'defended' },
  { from: 'NORTH_AMERICA', to: 'MIDDLE_EAST', intensity: 0.6, status: 'active' },
];

const casualtyPoints = [
  { x: 620, y: 210, severity: 'HIGH' }, // Dubai area
  { x: 560, y: 160, severity: 'MED' },  // Istanbul area
  { x: 780, y: 130, severity: 'HIGH' }, // Beijing area
];

export default function WorldMap({ hotspots = [], onRegionSelect, selectedRegionId }: WorldMapProps & { onRegionSelect?: (id: string) => void, selectedRegionId?: string | null }) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const svgRef = useRef<SVGSVGElement>(null);
  const safeHotspots = Array.isArray(hotspots) ? hotspots : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = regions.find(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (found && onRegionSelect) {
      onRegionSelect(found.id);
      setSearchQuery('');
    }
  };

  // Handle Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(transform.scale * delta, 1), 5);
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  // Handle Pan & Mouse Tracking
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (svgRef.current) {
      const CTM = svgRef.current.getScreenCTM();
      if (CTM) {
        setMousePos({
          x: (e.clientX - CTM.e) / CTM.a,
          y: (e.clientY - CTM.f) / CTM.d
        });
      }
    }

    if (!isDragging || transform.scale === 1) return;
    setTransform(prev => ({
      ...prev,
      x: prev.x + e.movementX / prev.scale,
      y: prev.y + e.movementY / prev.scale
    }));
  };

  // Zoom to selected region
  useEffect(() => {
    if (selectedRegionId) {
      const region = regions.find(r => r.id === selectedRegionId);
      if (region) {
        const center = getCenter(region.path);
        setTransform({
          x: (500 - center.x) * 1.5,
          y: (250 - center.y) * 1.5,
          scale: 2
        });
      }
    } else {
      setTransform({ x: 0, y: 0, scale: 1 });
    }
  }, [selectedRegionId]);

  return (
    <div 
      className="relative w-full h-full min-h-[250px] bg-[#05070a] border border-blue-500/20 rounded-sm overflow-hidden group transition-all duration-500 shadow-[inset_0_0_50px_rgba(59,130,246,0.1)] cursor-crosshair"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {/* Search Bar Overlay */}
      <div className="absolute top-4 left-4 z-50 w-64 hidden md:block">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500/40 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH_REGION..."
            className="w-full bg-black/60 border border-blue-500/20 rounded-sm pl-10 pr-4 py-2 text-[10px] font-mono focus:outline-none focus:border-blue-500/50 transition-all placeholder-blue-900/30 backdrop-blur-md"
          />
        </form>
      </div>

      {/* Tactical Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:30px_30px] opacity-20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b11_1px,transparent_1px),linear-gradient(to_bottom,#1e293b11_1px,transparent_1px)] [background-size:100px_100px]"></div>
      </div>
      
      <motion.svg 
        ref={svgRef}
        viewBox="0 0 1000 500" 
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.15)]"
        animate={{
          scale: transform.scale,
          x: transform.x,
          y: transform.y
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        {/* Coordinate Markers */}
        <g className="fill-blue-500/20 text-[6px] font-mono select-none">
          {Array.from({ length: 11 }).map((_, i) => (
            <text key={`x-${i}`} x={i * 100} y="15" textAnchor="middle">{i * 10}°E</text>
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <text key={`y-${i}`} x="10" y={i * 100} dominantBaseline="middle">{i * 10}°N</text>
          ))}
        </g>

        {/* Regions */}
        {regions.map((region) => {
          const isActive = safeHotspots.includes(region.id);
          const isHovered = hoveredRegion === region.id;
          const isSelected = selectedRegionId === region.id;
          const center = getCenter(region.path);

          // Check if this region is currently defending
          const defendingAttack = simulatedAttacks.find(a => a.to === region.id && a.status === 'defended');
          const isDefending = !!defendingAttack;
          const defenseSuccess = defendingAttack ? defendingAttack.intensity : 0;

          return (
            <g 
              key={region.id} 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
              onClick={() => onRegionSelect?.(region.id)}
            >
              {/* Region Glow */}
              <AnimatePresence>
                {(isHovered || isSelected || isActive || isDefending) && (
                  <motion.path
                    d={region.path}
                    initial={{ opacity: 0 }}
                    animate={isDefending ? {
                      opacity: [0.05, 0.2, 0.05],
                      fill: "rgba(59, 130, 246, 0.4)"
                    } : { opacity: 0.1 }}
                    exit={{ opacity: 0 }}
                    fill={isDefending ? "rgba(59, 130, 246, 0.4)" : "url(#regionGradient)"}
                    className="pointer-events-none"
                    transition={isDefending ? {
                      repeat: Infinity,
                      duration: 2 - defenseSuccess,
                      ease: "easeInOut"
                    } : {}}
                  />
                )}
              </AnimatePresence>

              {/* Selection Pulse Animation */}
              <AnimatePresence>
                {isSelected && (
                  <motion.path
                    d={region.path}
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.02, 1],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    fill="none"
                    stroke="rgba(96, 165, 250, 0.6)"
                    strokeWidth="6"
                    className="pointer-events-none"
                    style={{ filter: 'blur(8px)', transformOrigin: `${center.x}px ${center.y}px` }}
                  />
                )}
              </AnimatePresence>

              <motion.path
                d={region.path}
                initial={false}
                animate={{
                  fill: isActive 
                    ? ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.2)'] 
                    : isSelected ? 'rgba(59, 130, 246, 0.4)' : isHovered ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.1)',
                  stroke: isActive 
                    ? ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.8)'] 
                    : isSelected ? 'rgba(96, 165, 250, 1)' : isHovered ? 'rgba(147, 197, 253, 1)' : 'rgba(51, 65, 85, 0.3)',
                  strokeDasharray: isActive ? ["1,0", "5,2", "1,0", "2,5"] : "none",
                  strokeWidth: isActive ? [2, 4, 2] : isSelected ? 3 : isHovered ? 2 : 0.8,
                  scale: isHovered ? 1.01 : 1,
                  filter: isHovered ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'none',
                }}
                transition={{ 
                  fill: { repeat: isActive ? Infinity : 0, duration: 1.5 },
                  stroke: { repeat: isActive ? Infinity : 0, duration: 0.2 },
                  strokeDasharray: { repeat: isActive ? Infinity : 0, duration: 0.1 },
                  strokeWidth: { repeat: isActive ? Infinity : 0, duration: 1, ease: "easeInOut" },
                  scale: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="transition-colors"
                style={{ transformOrigin: `${center.x}px ${center.y}px` }}
              />

              {/* Glitch Overlay for Hotspots */}
              {isActive && (
                <motion.path
                  d={region.path}
                  animate={{
                    x: [0, -1, 1, 0],
                    y: [0, 1, -1, 0],
                    opacity: [0, 0.2, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  fill="none"
                  stroke="rgba(239, 68, 68, 0.5)"
                  strokeWidth="3"
                  className="pointer-events-none"
                />
              )}

              {/* Internal Borders */}
              <path
                d={region.borders}
                fill="none"
                stroke="rgba(59, 130, 246, 0.15)"
                strokeWidth="0.4"
                strokeDasharray="1,2"
              />
              
              {/* Tactical Grid Overlay for Region */}
              <path
                d={region.path}
                fill="url(#shieldPattern)"
                opacity={isSelected ? 0.1 : 0.03}
                className="pointer-events-none"
              />
              
              {/* Hotspot Visuals */}
              {isActive && (
                <g>
                  {/* Pulsing Rings */}
                  {[1, 2, 3].map((i) => (
                    <motion.circle
                      key={i}
                      cx={center.x}
                      cy={center.y}
                      initial={{ r: 0, opacity: 0.6 }}
                      animate={{ r: 40 * i, opacity: 0 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3, 
                        delay: i * 0.8,
                        ease: "easeOut"
                      }}
                      fill="none"
                      stroke="rgba(239, 68, 68, 0.3)"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Glitchy Core */}
                  <motion.g
                    animate={{
                      x: [0, -2, 2, 0],
                      filter: ["none", "hue-rotate(90deg)", "none"]
                    }}
                    transition={{ repeat: Infinity, duration: 0.1 }}
                  >
                    <motion.circle
                      cx={center.x}
                      cy={center.y}
                      animate={{ 
                        r: [3, 6, 3],
                        opacity: [0.8, 1, 0.8],
                        scale: [1, 1.3, 1]
                      }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      fill="rgba(239, 68, 68, 0.9)"
                    />
                  </motion.g>
                  {/* Targeting Reticle */}
                  <g className="stroke-red-500/50 stroke-[0.5]">
                    <line x1={center.x - 15} y1={center.y} x2={center.x + 15} y2={center.y} />
                    <line x1={center.x} y1={center.y - 15} x2={center.x} y2={center.y + 15} />
                    <circle cx={center.x} cy={center.y} r="10" fill="none" />
                  </g>
                  {/* Alert Icon */}
                  <motion.g
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    transform={`translate(${center.x + 15}, ${center.y - 15})`}
                  >
                    <path
                      d="M0,-8 L7,5 L-7,5 Z"
                      fill="rgba(239, 68, 68, 0.9)"
                      stroke="white"
                      strokeWidth="0.5"
                    />
                    <motion.text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      className="text-[6px] fill-white font-black"
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      !
                    </motion.text>
                  </motion.g>
                </g>
              )}

              {/* Tooltip Label */}
              <AnimatePresence>
                {(isHovered || isSelected) && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      x: isHovered ? mousePos.x : center.x,
                      y: isHovered ? mousePos.y - 50 : center.y - 60
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="pointer-events-none"
                    transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.5 }}
                  >
                    <rect
                      x="-60"
                      y="0"
                      width="120"
                      height="45"
                      rx="1"
                      fill="rgba(5, 7, 10, 0.95)"
                      stroke={isActive ? "rgba(239, 68, 68, 0.5)" : isSelected ? "rgba(96, 165, 250, 0.8)" : "rgba(59, 130, 246, 0.5)"}
                      strokeWidth="1"
                    />
                    {/* Tooltip Header Accent */}
                    <rect
                      x="-60"
                      y="0"
                      width="120"
                      height="2"
                      fill={isActive ? "rgba(239, 68, 68, 0.8)" : isSelected ? "rgba(96, 165, 250, 1)" : "rgba(59, 130, 246, 0.8)"}
                    />
                    <text
                      x="0"
                      y="14"
                      textAnchor="middle"
                      className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'fill-red-400' : isSelected ? 'fill-blue-300' : 'fill-blue-400'}`}
                    >
                      {region.name}
                    </text>
                    <text
                      x="0"
                      y="26"
                      textAnchor="middle"
                      className="text-[7px] fill-zinc-400 font-bold uppercase tracking-widest"
                    >
                      POP: {region.population}
                    </text>
                    <text
                      x="0"
                      y="36"
                      textAnchor="middle"
                      className={`text-[7px] font-black uppercase tracking-widest ${isActive ? 'fill-red-500 animate-pulse' : 'fill-emerald-500'}`}
                    >
                      {isActive ? 'STATUS: CRITICAL' : 'STATUS: STABLE'}
                    </text>
                  </motion.g>
                )}
              </AnimatePresence>
            </g>
          );
        })}

        {/* Simulated Attacks & Defenses */}
        <g className="pointer-events-none">
          {simulatedAttacks.map((attack, i) => {
            const fromRegion = regions.find(r => r.id === attack.from);
            const toRegion = regions.find(r => r.id === attack.to);
            if (!fromRegion || !toRegion) return null;
            
            const start = getCenter(fromRegion.path);
            const end = getCenter(toRegion.path);
            const isDefended = attack.status === 'defended';
            const pathId = `attack-path-${i}`;
            const pathD = `M${start.x},${start.y} Q${(start.x + end.x) / 2},${(start.y + end.y) / 2 - 80} ${end.x},${end.y}`;
            
            // Refined attack visuals based on intensity
            const strokeWidth = 1 + attack.intensity * 3;
            const color = isDefended ? "rgba(96, 165, 250, 0.6)" : `rgba(239, 68, 68, ${0.4 + attack.intensity * 0.6})`;
            const arrowColor = isDefended ? "#60a5fa" : "#ef4444";

            return (
              <g key={pathId}>
                {/* Attack Path Trace */}
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray="2,6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                
                {/* Directional Arrow (Triangle) */}
                <motion.g
                  style={{
                    offsetPath: `path("${pathD}")`,
                  }}
                  animate={{
                    offsetDistance: ["0%", "100%"],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 3 / attack.intensity,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.5
                  }}
                >
                  <path 
                    d="M-4,-3 L4,0 L-4,3 Z" 
                    fill={arrowColor} 
                    transform="rotate(0)"
                  />
                  {/* Engine Trail */}
                  <motion.rect
                    x="-10" y="-1" width="6" height="2"
                    fill={isDefended ? "rgba(96, 165, 250, 0.4)" : "rgba(239, 68, 68, 0.4)"}
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ repeat: Infinity, duration: 0.1 }}
                  />
                </motion.g>

                {/* Defensive Shield (if defended) */}
                {isDefended && (
                  <g>
                    <motion.circle
                      cx={end.x}
                      cy={end.y}
                      r="35"
                      fill="none"
                      stroke="rgba(59, 130, 246, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.circle
                      cx={end.x}
                      cy={end.y}
                      r="30"
                      fill="rgba(59, 130, 246, 0.05)"
                      stroke="rgba(59, 130, 246, 0.6)"
                      strokeWidth="2"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.4, 0.8, 0.4],
                        strokeWidth: [1, 3, 1]
                      }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    />
                    {/* Shield Hex Grid Pattern (Simulated) */}
                    <circle cx={end.x} cy={end.y} r="30" fill="url(#shieldPattern)" opacity="0.2" />
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Casualty Glows (Severe) */}
        <g className="pointer-events-none">
          {casualtyPoints.map((point, i) => (
            <g key={`casualty-${i}`}>
              {/* Outer Severe Glow */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={point.severity === 'HIGH' ? 15 : 10}
                fill="rgba(239, 68, 68, 0.3)"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                style={{ filter: 'blur(8px)' }}
              />
              {/* Impact Core */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={point.severity === 'HIGH' ? 6 : 4}
                fill="#ef4444"
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.2, 1],
                }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill="white"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.4 }}
              />
            </g>
          ))}
        </g>

        {/* Tactical Data Links & Packets */}
        <g className="pointer-events-none">
          {dataLinks.map((link, i) => {
            const fromCity = majorCities.find(c => c.name === link.from);
            const toCity = majorCities.find(c => c.name === link.to);
            if (!fromCity || !toCity) return null;

            const isData = link.type === 'DATA';
            const color = isData ? 'rgba(34, 197, 94, 0.4)' : 'rgba(168, 85, 247, 0.4)';
            const packetColor = isData ? '#22c55e' : '#a855f7';
            const duration = link.importance === 'HIGH' ? 2 : link.importance === 'MED' ? 4 : 6;
            const strokeWidth = link.importance === 'HIGH' ? 1 : 0.5;

            return (
              <g key={`link-group-${i}`}>
                <motion.line
                  x1={fromCity.x}
                  y1={fromCity.y}
                  x2={toCity.x}
                  y2={toCity.y}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={link.importance === 'HIGH' ? "none" : "2,4"}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: i * 0.05 }}
                />
                {/* Data Packet */}
                <motion.circle
                  r={link.importance === 'HIGH' ? "1.2" : "0.8"}
                  fill={packetColor}
                  animate={{
                    cx: [fromCity.x, toCity.x],
                    cy: [fromCity.y, toCity.y],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: duration + Math.random(),
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.2
                  }}
                />
              </g>
            );
          })}
        </g>

        {/* Radar Sweep */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '500px 250px' }}
          className="pointer-events-none"
        >
          <line
            x1="500"
            y1="250"
            x2="500"
            y2="-250"
            stroke="url(#radarGradient)"
            strokeWidth="2"
          />
        </motion.g>

        {/* Major Cities */}
        <g className="hidden md:block">
          {majorCities.map((city) => (
            <CityMarker key={city.name} city={city} />
          ))}
        </g>

        {/* Scanning Line */}
        <motion.line
          x1="0"
          y1="0"
          x2="1000"
          y2="0"
          stroke="rgba(59, 130, 246, 0.1)"
          strokeWidth="1"
          animate={{ y: [0, 500, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />

        {/* Definitions */}
        <defs>
          <radialGradient id="regionGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
          <pattern id="shieldPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 10 5 L 5 10 L 0 5 Z" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* CRT Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>

      {/* Top Right HUD */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        <div className="text-[8px] font-black text-blue-500/60 uppercase tracking-widest">
          System_Status: <span className="text-emerald-500">Online</span>
        </div>
        <div className="text-[6px] font-mono text-zinc-600 uppercase flex gap-2">
          <span>CPU: 42%</span>
          <span>MEM: 1.2GB</span>
          <span>NET: 124MB/S</span>
        </div>
      </div>

      {/* Map Overlays */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        <div className="text-[8px] font-black text-blue-500/60 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1 h-1 bg-blue-500 animate-pulse"></div>
          Live_Feed_0x22
        </div>
        <div className="text-[6px] font-mono text-zinc-600 uppercase">
          Lat: 34.0522° N // Lon: 118.2437° W
        </div>
      </div>

      {/* Legend / Hotspots */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 max-w-[60%]">
        {safeHotspots.length > 0 ? (
          safeHotspots.map(id => (
            <motion.div 
              key={id} 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded-sm"
            >
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[7px] font-black uppercase text-red-400 tracking-widest">
                ALERT: {id.replace('_', ' ')}
              </span>
            </motion.div>
          ))
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
            <span className="text-[7px] font-black uppercase text-emerald-500/60 tracking-widest">
              Global_Stability_Nominal
            </span>
          </div>
        )}
      </div>

      {/* Compass / Scale */}
      <div className="absolute bottom-3 right-3 flex flex-col items-end gap-2">
        <div className="w-8 h-8 border border-blue-500/20 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 border-t border-blue-500/40 rounded-full animate-[spin_4s_linear_infinite]"></div>
          <span className="text-[8px] text-blue-500/60 font-black">N</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-16 h-[1px] bg-blue-500/30 relative">
            <div className="absolute left-0 top-[-2px] w-[1px] h-1 bg-blue-500/30"></div>
            <div className="absolute right-0 top-[-2px] w-[1px] h-1 bg-blue-500/30"></div>
          </div>
          <span className="text-[6px] text-blue-500/40 font-mono mt-1">5000 KM</span>
        </div>
      </div>
    </div>
  );
}

function getCenter(path: string) {
  const coords = path.match(/[\d.]+/g)?.map(Number) || [];
  let x = 0, y = 0;
  for (let i = 0; i < coords.length; i += 2) {
    x += coords[i];
    y += coords[i + 1];
  }
  return { x: x / (coords.length / 2), y: y / (coords.length / 2) };
}

function CityMarker({ city }: { city: any }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <g 
      className="group/city cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {city.importance === 'HIGH' ? (
        <motion.path
          d={`M${city.x-3},${city.y-3} L${city.x+3},${city.y-3} L${city.x+3},${city.y+3} L${city.x-3},${city.y+3} Z`}
          fill="rgba(96, 165, 250, 0.8)"
          stroke="rgba(255, 255, 255, 0.5)"
          strokeWidth="0.5"
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          whileHover={{ scale: 1.5, fill: "#fff" }}
        />
      ) : (
        <motion.circle
          cx={city.x}
          cy={city.y}
          r="1.5"
          fill="rgba(96, 165, 250, 0.4)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="0.5"
          whileHover={{ r: 3, fill: "rgba(255, 255, 255, 0.8)" }}
        />
      )}
      
      <AnimatePresence>
        {isHovered && (
          <motion.g
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="pointer-events-none"
            transform={`translate(${city.x}, ${city.y - 12})`}
          >
            <rect
              x="-30"
              y="0"
              width="60"
              height="10"
              rx="1"
              fill="rgba(5, 7, 10, 0.9)"
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="0.5"
            />
            <text
              x="0"
              y="7"
              textAnchor="middle"
              className="text-[5px] fill-blue-300 font-black uppercase tracking-widest"
            >
              {city.name}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </g>
  );
}
