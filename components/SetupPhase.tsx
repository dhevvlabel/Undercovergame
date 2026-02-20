import React, { useState } from 'react';
import { Button } from './Button';
import { GameConfig } from '../types';
import { getLocalWordPair } from '../services/wordService';

interface SetupPhaseProps {
  onStartGame: (names: string[], words: { main: string; undercover: string }, config: GameConfig) => void;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({ onStartGame }) => {
  const [names, setNames] = useState<string[]>([]);
  const [currentName, setCurrentName] = useState('');
  const [mainWord, setMainWord] = useState('');
  const [undercoverWord, setUndercoverWord] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<GameConfig>({ mrWhiteCount: 1, undercoverCount: 2 });

  const addPlayer = () => {
    if (currentName.trim()) {
      setNames([...names, currentName.trim()]);
      setCurrentName('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addPlayer();
    }
  };

  const removePlayer = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const handleGenerateWords = () => {
    setIsGenerating(true);
    // Simulate short delay
    setTimeout(() => {
      // In setup phase, we just pick a random pair from local service.
      // History isn't tracked yet in App state, so we pass empty history to get any random pair.
      // The history will be initialized in App.tsx when game starts.
      const { pair } = getLocalWordPair([]);
      setMainWord(pair.mainWord);
      setUndercoverWord(pair.undercoverWord);
      setIsGenerating(false);
    }, 500);
  };

  const canStart = names.length >= 3 && mainWord && undercoverWord;

  return (
    <div className="space-y-8 max-w-2xl mx-auto w-full">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter">UNDERCOVER</h1>
        <p className="text-gray-400 text-sm uppercase tracking-widest">Konfigurasi Sistem</p>
      </div>

      {/* Players Section */}
      <div className="space-y-4 border border-gray-800 p-6 bg-gray-900/50">
        <h2 className="text-lg font-bold border-b border-gray-700 pb-2">1. Daftar Pemain</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Masukkan nama pemain"
            className="flex-1 bg-black border border-gray-700 p-3 text-white focus:outline-none focus:border-white transition-colors"
          />
          <Button onClick={addPlayer} disabled={!currentName.trim()}>Tambah</Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {names.map((name, idx) => (
            <div key={idx} className="flex items-center bg-gray-800 px-3 py-1 border border-gray-700">
              <span className="mr-2">{name}</span>
              <button onClick={() => removePlayer(idx)} className="text-gray-500 hover:text-red-500">×</button>
            </div>
          ))}
          {names.length === 0 && <span className="text-gray-600 italic">Belum ada pemain.</span>}
        </div>
      </div>

      {/* Config Section */}
      <div className="space-y-4 border border-gray-800 p-6 bg-gray-900/50">
        <h2 className="text-lg font-bold border-b border-gray-700 pb-2">2. Pembagian Peran</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-gray-500 mb-2 uppercase">Jumlah Undercover</label>
            <input 
              type="number" 
              min="1" 
              max={Math.max(1, names.length - 2)}
              value={config.undercoverCount}
              onChange={(e) => setConfig({...config, undercoverCount: parseInt(e.target.value) || 1})}
              className="w-full bg-black border border-gray-700 p-3 text-white focus:outline-none focus:border-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-2 uppercase">Mr. White</label>
            <input 
              type="number" 
              min="0" 
              max="1"
              value={config.mrWhiteCount}
              onChange={(e) => setConfig({...config, mrWhiteCount: parseInt(e.target.value) || 0})}
              className="w-full bg-black border border-gray-700 p-3 text-white focus:outline-none focus:border-white"
            />
          </div>
        </div>
      </div>

      {/* Words Section */}
      <div className="space-y-4 border border-gray-800 p-6 bg-gray-900/50">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
           <h2 className="text-lg font-bold">3. Kata Rahasia</h2>
           <button 
            onClick={handleGenerateWords} 
            disabled={isGenerating}
            className="text-xs text-green-500 hover:text-green-400 uppercase tracking-wider disabled:text-gray-600"
          >
            {isGenerating ? '[ MEMPROSES... ]' : '[ ACAK KATA ]'}
           </button>
        </div>
       
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-2 uppercase">Kata Warga Sipil</label>
            <input
              type="password"
              value={mainWord}
              onChange={(e) => setMainWord(e.target.value)}
              placeholder="cth. Kopi"
              className="w-full bg-black border border-gray-700 p-3 text-white focus:outline-none focus:border-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-2 uppercase">Kata Undercover</label>
            <input
              type="password"
              value={undercoverWord}
              onChange={(e) => setUndercoverWord(e.target.value)}
              placeholder="cth. Teh"
              className="w-full bg-black border border-gray-700 p-3 text-white focus:outline-none focus:border-white"
            />
          </div>
        </div>
        <p className="text-xs text-gray-600">* Kata disembunyikan untuk kerahasiaan. Klik kolom untuk mengedit.</p>
      </div>

      <Button 
        fullWidth 
        onClick={() => onStartGame(names, { main: mainWord, undercover: undercoverWord }, config)}
        disabled={!canStart}
        className="h-16 text-lg"
      >
        Mulai Permainan
      </Button>
    </div>
  );
};