import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Player, Role } from '../types';
import { judgeMrWhiteGuess } from '../services/geminiService';

interface GamePhaseProps {
  players: Player[];
  mainWord: string;
  onEliminate: (playerId: string) => void;
  onMrWhiteGuess: (playerId: string, correct: boolean) => void;
}

export const GamePhase: React.FC<GamePhaseProps> = ({ players, mainWord, onEliminate, onMrWhiteGuess }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  
  // Mr. White Guess State
  const [mrWhiteGuess, setMrWhiteGuess] = useState('');
  const [isJudging, setIsJudging] = useState(false);
  const [guessingPlayerId, setGuessingPlayerId] = useState<string | null>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Clue Order State
  const [clueOrder, setClueOrder] = useState<Player[]>([]);

  const activePlayers = players.filter(p => !p.isEliminated);
  const eliminatedPlayers = players.filter(p => p.isEliminated);

  // Generate random clue order when active players change (start of game or after elimination)
  useEffect(() => {
    // Shuffle active players
    const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
    setClueOrder(shuffled);
  }, [players]); // Trigger when players array updates (e.g. elimination)

  // Reset timer when entering guessing mode
  useEffect(() => {
    if (guessingPlayerId) {
      setTimeLeft(30);
      setFeedbackMessage(null);
      setMrWhiteGuess('');
    }
  }, [guessingPlayerId]);

  // Timer Countdown Logic
  useEffect(() => {
    if (!guessingPlayerId || isJudging || feedbackMessage) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [guessingPlayerId, timeLeft, isJudging, feedbackMessage]);

  const handleTimeout = () => {
    setFeedbackMessage("Waktu habis. Kamu gagal menebak.");
    setTimeout(() => {
      if (guessingPlayerId) {
        onMrWhiteGuess(guessingPlayerId, false);
        cleanupMrWhiteState();
      }
    }, 3000);
  };

  const cleanupMrWhiteState = () => {
    setGuessingPlayerId(null);
    setMrWhiteGuess('');
    setIsVoting(false);
    setSelectedPlayerId(null);
    setIsJudging(false);
    setFeedbackMessage(null);
  };

  const handleVoteSubmit = () => {
    if (!selectedPlayerId) return;

    const player = players.find(p => p.id === selectedPlayerId);
    if (!player) return;

    if (player.role === Role.MR_WHITE) {
      setGuessingPlayerId(player.id);
      // Do not eliminate yet, wait for guess
    } else {
      onEliminate(player.id);
      setIsVoting(false);
      setSelectedPlayerId(null);
    }
  };

  const handleMrWhiteSubmit = async () => {
    if (!guessingPlayerId) return;
    setIsJudging(true);
    try {
      const isCorrect = await judgeMrWhiteGuess(mainWord, mrWhiteGuess);
      
      if (isCorrect) {
        setFeedbackMessage("Tebakan benar. Mr. White menang.");
        setTimeout(() => {
          onMrWhiteGuess(guessingPlayerId, true);
          cleanupMrWhiteState();
        }, 3000);
      } else {
        setFeedbackMessage("Tebakan salah. Kamu dieliminasi.");
        setTimeout(() => {
          onMrWhiteGuess(guessingPlayerId, false);
          cleanupMrWhiteState();
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setIsJudging(false); // Only reset if API fails (network error), otherwise feedback flow handles it
    }
  };

  if (guessingPlayerId) {
    const mrWhite = players.find(p => p.id === guessingPlayerId);
    return (
      <div className="max-w-xl mx-auto w-full space-y-8 text-center animate-in zoom-in-95 duration-300">
        <div className="bg-red-900/10 border border-red-500/50 p-8 relative overflow-hidden">
          {/* Background Pulse for urgency */}
          <div className={`absolute inset-0 bg-red-500/5 pointer-events-none ${timeLeft <= 10 && !feedbackMessage ? 'animate-pulse' : ''}`} />
          
          <h2 className="text-3xl font-black text-red-500 mb-2 uppercase tracking-tighter">KAMU MR. WHITE</h2>
          <p className="text-white text-lg mb-6">
            {mrWhite?.name}, identitasmu terbongkar.
          </p>

          {!feedbackMessage ? (
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <p className="text-gray-400 text-sm uppercase tracking-widest">Tebak kata utama sekarang</p>
                <div className={`text-4xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}>
                  Sisa waktu: {timeLeft} detik
                </div>
              </div>

              <input
                type="text"
                value={mrWhiteGuess}
                onChange={(e) => setMrWhiteGuess(e.target.value)}
                placeholder="Masukkan tebakan kamu"
                className="w-full bg-black border border-red-500/30 p-4 text-center text-white text-xl focus:outline-none focus:border-red-500 placeholder:text-gray-600"
                autoFocus
                disabled={isJudging}
              />
              
              <Button 
                onClick={handleMrWhiteSubmit} 
                disabled={!mrWhiteGuess.trim() || isJudging}
                variant="danger"
                fullWidth
                className="h-16 text-lg"
              >
                {isJudging ? 'MENGANALISIS...' : 'KONFIRMASI TEBAKAN'}
              </Button>
            </div>
          ) : (
            <div className="py-8 space-y-4 animate-in fade-in zoom-in duration-300">
              <div className={`text-2xl font-bold ${feedbackMessage.includes('benar') ? 'text-green-500' : 'text-red-500'}`}>
                {feedbackMessage}
              </div>
              <p className="text-gray-500 text-sm animate-pulse">Memproses hasil permainan...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Sidebar: Status */}
      <div className="md:col-span-1 space-y-6">
        <div className="border border-gray-800 bg-gray-900/30 p-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Aktif</span>
              <span className="text-white font-mono">{activePlayers.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tereliminasi</span>
              <span className="text-white font-mono">{eliminatedPlayers.length}</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-800 bg-gray-900/30 p-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Tereliminasi</h3>
          <ul className="space-y-2">
            {eliminatedPlayers.length === 0 && <li className="text-gray-600 italic text-sm">Belum ada.</li>}
            {eliminatedPlayers.map(p => (
              <li key={p.id} className="text-sm flex justify-between items-center border-b border-gray-800 pb-1">
                 <span className="text-gray-400 line-through decoration-red-500/50">{p.name}</span>
                 <span className={`text-xs px-2 py-0.5 ${
                   p.role === Role.CIVILIAN ? 'bg-green-900/30 text-green-500' :
                   p.role === Role.UNDERCOVER ? 'bg-yellow-900/30 text-yellow-500' :
                   'bg-red-900/30 text-red-500'
                 }`}>{p.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Area */}
      <div className="md:col-span-2 space-y-8">
        {!isVoting ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-8 text-center border border-gray-800 bg-gray-900/20 p-8 animate-in fade-in duration-500">
            <div className="space-y-2">
               {/* Display only in the first round or always? Prompt says 'Setelah semua pemain menerima kata'. 
                   It implies this message is relevant to the transition from Assignment to Round. 
                   It's acceptable to show it as a confirmation status. */}
               <p className="text-sm text-green-500 uppercase tracking-widest font-bold">Semua pemain sudah menerima kata</p>
               <h2 className="text-3xl font-bold tracking-tight">Waktunya memberi petunjuk</h2>
            </div>

            <div className="w-full max-w-md bg-black/50 border border-gray-800 p-6 rounded-lg">
              <h3 className="text-gray-400 text-sm uppercase mb-4 border-b border-gray-800 pb-2">Urutan pemberi petunjuk:</h3>
              <div className="space-y-3">
                {clueOrder.map((p, i) => (
                  <div key={p.id} className="flex items-center space-x-4">
                    <span className="flex-none w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </span>
                    <span className="text-lg text-gray-200">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-gray-500 max-w-md text-sm">
              Ikuti urutan di atas. Setelah semua memberikan petunjuk, mulai pemungutan suara.
            </p>
            
            <Button onClick={() => setIsVoting(true)} className="h-16 px-12 text-lg">
              Mulai Pemungutan Suara
            </Button>
          </div>
        ) : (
          <div className="space-y-6 border border-gray-700 bg-gray-900/50 p-8 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold">PROTOKOL PEMUNGUTAN SUARA</h2>
               <Button variant="ghost" onClick={() => { setIsVoting(false); setSelectedPlayerId(null); }} className="text-xs">Batal</Button>
            </div>
            <p className="text-gray-400 text-sm">Pilih pemain yang mendapat suara terbanyak untuk dieliminasi.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {activePlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`p-4 text-left border transition-all ${
                    selectedPlayerId === player.id 
                      ? 'bg-white text-black border-white' 
                      : 'bg-black text-gray-300 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <span className="font-bold">{player.name}</span>
                </button>
              ))}
            </div>

            <Button 
              fullWidth 
              onClick={handleVoteSubmit} 
              disabled={!selectedPlayerId}
              variant="danger"
              className="mt-6"
            >
              ELIMINASI TARGET
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};