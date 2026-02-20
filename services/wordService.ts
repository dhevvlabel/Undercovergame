import { WordPair } from '../types';

const WORD_DATA: WordPair[] = [
  { mainWord: "Kopi", undercoverWord: "Teh" },
  { mainWord: "Polisi", undercoverWord: "Satpam" },
  { mainWord: "Gitar", undercoverWord: "Biola" },
  { mainWord: "Singa", undercoverWord: "Harimau" },
  { mainWord: "Apel", undercoverWord: "Jeruk" },
  { mainWord: "Dokter", undercoverWord: "Perawat" },
  { mainWord: "Sendok", undercoverWord: "Garpu" },
  { mainWord: "Gunung", undercoverWord: "Bukit" },
  { mainWord: "Laut", undercoverWord: "Danau" },
  { mainWord: "Matahari", undercoverWord: "Bulan" },
  { mainWord: "Emas", undercoverWord: "Perak" },
  { mainWord: "Sepatu", undercoverWord: "Sandal" },
  { mainWord: "Kacamata", undercoverWord: "Lensa Kontak" },
  { mainWord: "Mobil", undercoverWord: "Motor" },
  { mainWord: "Pesawat", undercoverWord: "Helikopter" },
  { mainWord: "Nasi", undercoverWord: "Bubur" },
  { mainWord: "Gula", undercoverWord: "Garam" },
  { mainWord: "Buku", undercoverWord: "Majalah" },
  { mainWord: "Kucing", undercoverWord: "Anjing" },
  { mainWord: "Pintu", undercoverWord: "Jendela" },
  { mainWord: "Bakso", undercoverWord: "Mie Ayam" },
  { mainWord: "Sate", undercoverWord: "Gule" },
  { mainWord: "Komputer", undercoverWord: "Laptop" },
  { mainWord: "Hujan", undercoverWord: "Gerimis" },
  { mainWord: "Berenang", undercoverWord: "Menyelam" }
];

interface WordSelectionResult {
  pair: WordPair;
  shouldReset: boolean;
}

export const getLocalWordPair = (history: string[]): WordSelectionResult => {
  // Normalize history for case-insensitive comparison
  const normalizedHistory = new Set(history.map(w => w.toLowerCase()));

  // Filter available pairs
  // A pair is available if its mainWord is NOT in the history
  let availablePairs = WORD_DATA.filter(pair => 
    !normalizedHistory.has(pair.mainWord.toLowerCase())
  );

  let shouldReset = false;

  // If no pairs available, reset logic: use all data and flag for reset
  if (availablePairs.length === 0) {
    shouldReset = true;
    availablePairs = [...WORD_DATA];
  }

  // Pick random from available
  const randomIndex = Math.floor(Math.random() * availablePairs.length);
  const selectedPair = availablePairs[randomIndex];

  return {
    pair: selectedPair,
    shouldReset
  };
};