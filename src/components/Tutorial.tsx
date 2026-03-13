import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Play, Shield, Globe, Activity } from 'lucide-react';

const steps = [
  {
    title: "Welcome Commander",
    content: "The Playground War-Game is a high-stakes geopolitical simulation. Your decisions will shape the future of global stability.",
    icon: Globe,
    color: "text-blue-400"
  },
  {
    title: "Global Metrics",
    content: "Track three critical scores: Accountability (transparency), Protection (security), and Systemic Reform (structural change). Balance is key.",
    icon: Activity,
    color: "text-purple-400"
  },
  {
    title: "Active Hotspots",
    content: "Monitor the world map for conflict zones. These regions require immediate attention to prevent global escalation.",
    icon: Shield,
    color: "text-red-400"
  },
  {
    title: "Execute Orders",
    content: "Use the command console to issue directives. Your role determines your unique abilities and starting influence.",
    icon: Play,
    color: "text-emerald-400"
  }
];

export const Tutorial: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => currentStep < steps.length - 1 ? setCurrentStep(s => s + 1) : onClose();
  const prev = () => currentStep > 0 && setCurrentStep(s => s - 1);

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 w-8 rounded-full transition-colors ${i === currentStep ? 'bg-blue-500' : 'bg-white/10'}`} 
                />
              ))}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className={`inline-flex p-4 rounded-2xl bg-white/5 mb-6 ${step.color}`}>
                <step.icon className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-4">
                {step.title}
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                {step.content}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center">
            <button 
              onClick={prev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-gray-500 hover:text-white disabled:opacity-0 transition-all font-mono uppercase tracking-widest text-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button 
              onClick={next}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
