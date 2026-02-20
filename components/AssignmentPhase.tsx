import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './Button';
import { Player, Role } from '../types';
import { User, Lock } from 'lucide-react';

interface AssignmentPhaseProps {
  players: Player[];
  onComplete: () => void;
  announcement?: string | null;
}

export const AssignmentPhase: React.FC<AssignmentPhaseProps> = ({ players, onComplete, announcement }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<'handover' | 'card'>('handover');
  const [isFlipped, setIsFlipped] = useState(false);

  const currentPlayer = players[currentIndex];

  const handleReady = () => {
    setStep('card');
    setIsFlipped(false);
  };

  const handleCardClick = () => {
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleNext = () => {
    setStep('handover');
    setIsFlipped(false);
    if (currentIndex < players.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-md mx-auto px-4">
      {announcement && step === 'handover' && (
        <div className="w-full bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-blue-400 font-bold uppercase tracking-wider text-sm shadow-[0_0_15px_rgba(59,130,246,0.1)] mb-8 animate-pulse text-center">
          {announcement}
        </div>
      )}

      <div className="w-full flex flex-col items-center space-y-8">
        {/* Header Info */}
        <div className="text-center space-y-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            Pemain {currentIndex + 1} / {players.length}
          </p>
          <h2 className="text-2xl font-bold text-white">
            {currentPlayer.name}
          </h2>
        </div>

        {step === 'handover' ? (
          <div className="flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-xl">
              <User className="w-10 h-10 text-zinc-400" />
            </div>
            
            <div className="text-center space-y-2 max-w-xs">
              <p className="text-zinc-400">
                Serahkan perangkat kepada <span className="text-white font-bold">{currentPlayer.name}</span>.
              </p>
              <p className="text-xs text-zinc-600">
                Pastikan tidak ada orang lain yang melihat layar.
              </p>
            </div>

            <Button onClick={handleReady} className="w-full max-w-xs h-14 text-lg">
              Saya {currentPlayer.name}, Siap
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* 3D Card Container */}
            <div 
              className="relative w-64 h-96 cursor-pointer perspective-[1000px]"
              onClick={handleCardClick}
            >
              <motion.div
                className="w-full h-full relative"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front of Card */}
                <div 
                  className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl flex flex-col items-center justify-center p-6 text-center space-y-4 backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="w-16 h-16 rounded-full bg-zinc-950/50 flex items-center justify-center border border-zinc-800">
                    <Lock className="w-6 h-6 text-zinc-500" />
                  </div>
                  <p className="text-zinc-400 font-medium tracking-wide">
                    Tap untuk melihat peran
                  </p>
                </div>

                {/* Back of Card */}
                <div 
                  className="absolute inset-0 w-full h-full bg-white text-zinc-900 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-6 text-center space-y-6 backface-hidden overflow-hidden"
                  style={{ 
                    transform: "rotateY(180deg)",
                    backfaceVisibility: 'hidden' 
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Peran Anda</p>
                    <h3 className={`text-2xl font-black uppercase tracking-tight ${
                      currentPlayer.role === Role.MR_WHITE ? 'text-red-600' : 
                      currentPlayer.role === Role.UNDERCOVER ? 'text-indigo-600' : 'text-zinc-900'
                    }`}>
                      {currentPlayer.role === Role.MR_WHITE ? 'Mr. White' : 
                       currentPlayer.role === Role.UNDERCOVER ? 'Undercover' : 'Warga Sipil'}
                    </h3>
                  </div>

                  <div className="w-full h-px bg-zinc-200" />

                  <div className="space-y-2">
                    {currentPlayer.role === Role.MR_WHITE ? (
                      <p className="text-sm font-medium text-zinc-600 italic">
                        Kamu tidak memiliki kata rahasia. Tebak kata milik Warga Sipil!
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Kata Rahasia</p>
                        <p className="text-3xl font-black text-zinc-900 break-words leading-tight">
                          {currentPlayer.word}
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-zinc-50">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                      Rahasiakan Identitasmu
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Post-Flip Controls */}
            <div className={`space-y-4 w-full max-w-xs transition-opacity duration-500 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <p className="text-center text-sm text-zinc-500">
                Ingat kata kamu. Jangan beri tahu pemain lain.
              </p>
              <Button 
                onClick={handleNext} 
                variant="secondary" 
                fullWidth 
                className="h-12"
              >
                {currentIndex < players.length - 1 ? 'Tutup & Oper ke Pemain Berikutnya' : 'Selesai Pembagian'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
