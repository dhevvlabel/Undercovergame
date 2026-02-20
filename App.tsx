import React, { useState } from 'react';
import { SetupPhase } from './components/SetupPhase';
import { AssignmentPhase } from './components/AssignmentPhase';
import { GamePhase } from './components/GamePhase';
import { Button } from './components/Button';
import { GamePhase as Phase, Player, Role, GameConfig } from './types';
import { getLocalWordPair } from './services/wordService';

export default function App() {
  const [phase, setPhase] = useState<Phase>(Phase.SETUP);
  const [players, setPlayers] = useState<Player[]>([]);
  const [words, setWords] = useState<{main: string, undercover: string}>({main: '', undercover: ''});
  const [usedWordsHistory, setUsedWordsHistory] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null); // 'Warga Sipil', 'Undercover', 'Mr. White'
  const [config, setConfig] = useState<GameConfig>({ mrWhiteCount: 1, undercoverCount: 2 });
  const [isRestarting, setIsRestarting] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  const createPlayers = (names: string[], gameWords: {main: string, undercover: string}, gameConfig: GameConfig) => {
    const newPlayers: Player[] = names.map(name => ({
      id: crypto.randomUUID(),
      name,
      role: Role.CIVILIAN, // Default
      word: gameWords.main,
      isEliminated: false
    }));

    // Shuffle indices for random assignment
    const indices = Array.from({ length: newPlayers.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Assign Mr. White
    let assignedCount = 0;
    for (let i = 0; i < gameConfig.mrWhiteCount; i++) {
      if (assignedCount < newPlayers.length) {
        newPlayers[indices[assignedCount]].role = Role.MR_WHITE;
        newPlayers[indices[assignedCount]].word = null;
        assignedCount++;
      }
    }

    // Assign Undercovers
    for (let i = 0; i < gameConfig.undercoverCount; i++) {
      if (assignedCount < newPlayers.length) {
        newPlayers[indices[assignedCount]].role = Role.UNDERCOVER;
        newPlayers[indices[assignedCount]].word = gameWords.undercover;
        assignedCount++;
      }
    }
    return newPlayers;
  };

  const handleStartGame = (names: string[], gameWords: {main: string, undercover: string}, gameConfig: GameConfig) => {
    setConfig(gameConfig);
    const newPlayers = createPlayers(names, gameWords, gameConfig);
    setPlayers(newPlayers);
    setWords(gameWords);
    
    // Initialize history with the first set of words
    // We append to existing history from SetupPhase (if any) or just set it
    setUsedWordsHistory(prev => [...prev, gameWords.main, gameWords.undercover]);
    
    setAnnouncement(null);
    setPhase(Phase.ASSIGNMENT);
  };

  const handlePlayAgain = () => {
    setIsRestarting(true);
    
    // Simulate short loading for UX
    setTimeout(() => {
      try {
        // Use local service for word generation with history logic
        const { pair, shouldReset } = getLocalWordPair(usedWordsHistory);
        
        const newWords = {
          main: pair.mainWord,
          undercover: pair.undercoverWord
        };
        
        // Update history: if reset, start fresh with new pair; otherwise append
        if (shouldReset) {
          setUsedWordsHistory([newWords.main, newWords.undercover]);
        } else {
          setUsedWordsHistory(prev => [...prev, newWords.main, newWords.undercover]);
        }
        
        const currentNames = players.map(p => p.name);
        
        const newPlayers = createPlayers(currentNames, newWords, config);
        
        setPlayers(newPlayers);
        setWords(newWords);
        setAnnouncement("Game baru dimulai dengan pemain yang sama.");
        setWinner(null);
        setPhase(Phase.ASSIGNMENT);
      } catch (error) {
        console.error("Failed to restart game:", error);
      } finally {
        setIsRestarting(false);
      }
    }, 800);
  };

  const checkWinCondition = (currentPlayers: Player[]) => {
    const activePlayers = currentPlayers.filter(p => !p.isEliminated);
    const impostors = activePlayers.filter(p => p.role === Role.UNDERCOVER || p.role === Role.MR_WHITE);
    const civilians = activePlayers.filter(p => p.role === Role.CIVILIAN);

    if (impostors.length === 0) {
      setWinner('Warga Sipil');
      setPhase(Phase.GAME_OVER);
      return true;
    }

    if (impostors.length >= civilians.length) {
      setWinner('Undercover');
      setPhase(Phase.GAME_OVER);
      return true;
    }

    return false;
  };

  const handleEliminate = (playerId: string) => {
    const updatedPlayers = players.map(p => 
      p.id === playerId ? { ...p, isEliminated: true } : p
    );
    setPlayers(updatedPlayers);
    checkWinCondition(updatedPlayers);
  };

  const handleMrWhiteGuess = (playerId: string, correct: boolean) => {
    if (correct) {
      setWinner('Mr. White');
      setPhase(Phase.GAME_OVER);
    } else {
      handleEliminate(playerId);
    }
  };

  const resetGame = () => {
    setPhase(Phase.SETUP);
    setPlayers([]);
    setWords({main: '', undercover: ''});
    setUsedWordsHistory([]); // Clear history on full reset
    setWinner(null);
    setAnnouncement(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#e4e4e7] flex flex-col p-4 md:p-8 selection:bg-white selection:text-black">
      <main className="flex-1 flex flex-col items-center w-full max-w-7xl mx-auto">
        {phase === Phase.SETUP && (
          <SetupPhase onStartGame={handleStartGame} />
        )}

        {phase === Phase.ASSIGNMENT && (
          <AssignmentPhase 
            players={players} 
            onComplete={() => setPhase(Phase.ROUND)}
            announcement={announcement}
          />
        )}

        {phase === Phase.ROUND && (
          <GamePhase 
            players={players} 
            mainWord={words.main}
            onEliminate={handleEliminate}
            onMrWhiteGuess={handleMrWhiteGuess}
          />
        )}

        {phase === Phase.GAME_OVER && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in zoom-in-95 duration-500">
            <div className="space-y-4 text-center">
              <h1 className="text-6xl font-black tracking-tighter uppercase">{winner} Menang</h1>
              <p className="text-xl text-gray-500 tracking-widest uppercase">Permainan Selesai</p>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full max-w-2xl border-t border-gray-800 pt-8">
              <div className="text-right border-r border-gray-800 pr-8">
                <p className="text-xs text-gray-500 uppercase mb-1">Kata Warga Sipil</p>
                <p className="text-2xl font-bold">{words.main}</p>
              </div>
              <div className="pl-8">
                <p className="text-xs text-gray-500 uppercase mb-1">Kata Undercover</p>
                <p className="text-2xl font-bold text-yellow-500">{words.undercover}</p>
              </div>
            </div>

            <div className="w-full max-w-2xl bg-gray-900/50 border border-gray-800 p-6">
               <h3 className="text-xs text-gray-500 uppercase mb-4">Daftar Akhir</h3>
               <div className="grid grid-cols-2 gap-2">
                 {players.map(p => (
                   <div key={p.id} className="flex justify-between text-sm p-2 border border-gray-800">
                     <span>{p.name}</span>
                     <span className={`
                       ${p.role === Role.CIVILIAN ? 'text-green-500' : ''}
                       ${p.role === Role.UNDERCOVER ? 'text-yellow-500' : ''}
                       ${p.role === Role.MR_WHITE ? 'text-red-500' : ''}
                     `}>{p.role}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl">
              <Button 
                onClick={handlePlayAgain} 
                disabled={isRestarting}
                className="flex-1 py-4 text-lg"
              >
                {isRestarting ? 'Memuat Game...' : 'Ulangi Game'}
              </Button>
              <Button 
                onClick={resetGame} 
                disabled={isRestarting}
                variant="secondary"
                className="flex-1 py-4 text-lg"
              >
                Mulai Operasi Baru
              </Button>
            </div>
            
            {isRestarting && <p className="text-xs text-gray-500 animate-pulse">Menyiapkan kata baru...</p>}
          </div>
        )}
      </main>
      
      <footer className="mt-12 text-center text-xs text-gray-600 uppercase tracking-widest">
        AI Host System v1.0 • Koneksi Aman
      </footer>
    </div>
  );
}