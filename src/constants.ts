export interface BaybayinChar {
  id: string;
  char: string;
  latin: string;
  type: 'vowel' | 'consonant-vowel';
  description: string;
}

export const BAYBAYIN_CHARACTERS: BaybayinChar[] = [
  // Vowels
  { id: 'a', char: 'ᜀ', latin: 'A', type: 'vowel', description: 'The vowel A.' },
  { id: 'e_i', char: 'ᜁ', latin: 'E/I', type: 'vowel', description: 'The vowel E or I.' },
  { id: 'o_u', char: 'ᜂ', latin: 'O/U', type: 'vowel', description: 'The vowel O or U.' },
  // Consonants (Base form with 'a')
  { id: 'ba', char: 'ᜊ', latin: 'Ba', type: 'consonant-vowel', description: 'The consonant B with the vowel A.' },
  { id: 'ka', char: 'ᜃ', latin: 'Ka', type: 'consonant-vowel', description: 'The consonant K with the vowel A.' },
  { id: 'da', char: 'ᜇ', latin: 'Da/Ra', type: 'consonant-vowel', description: 'The consonant D or R with the vowel A.' },
  { id: 'ga', char: 'ᜄ', latin: 'Ga', type: 'consonant-vowel', description: 'The consonant G with the vowel A.' },
  { id: 'ha', char: 'ᜑ', latin: 'Ha', type: 'consonant-vowel', description: 'The consonant H with the vowel A.' },
  { id: 'la', char: 'ᜎ', latin: 'La', type: 'consonant-vowel', description: 'The consonant L with the vowel A.' },
  { id: 'ma', char: 'ᜈ᜔', latin: 'Ma', type: 'consonant-vowel', description: 'The consonant M with the vowel A.' }, // Note: Ma is actually ᜓ is a mark, wait.
  // Actually let's use standard ones:
  // k: ᜃ, g: ᜄ, ng: ᜅ, t: ᜆ, d/r: ᜇ, n: ᜈ, p: ᜉ, b: ᜊ, m: ᜋ, y: ᜌ, l: ᜎ, w: ᜏ, s: ᜐ, h: ᜑ
];

// Correcting Ma and others
export const REFINED_BAYBAYIN: BaybayinChar[] = [
  { id: 'a', char: 'ᜀ', latin: 'A', type: 'vowel', description: 'The standalone vowel A.' },
  { id: 'ei', char: 'ᜁ', latin: 'E/I', type: 'vowel', description: 'The standalone vowel E or I.' },
  { id: 'ou', char: 'ᜂ', latin: 'O/U', type: 'vowel', description: 'The standalone vowel O or U.' },
  { id: 'ka', char: 'ᜃ', latin: 'Ka', type: 'consonant-vowel', description: 'Consonant K with default vowel A.' },
  { id: 'ga', char: 'ᜄ', latin: 'Ga', type: 'consonant-vowel', description: 'Consonant G with default vowel A.' },
  { id: 'nga', char: 'ᜅ', latin: 'Nga', type: 'consonant-vowel', description: 'Consonant Ng with default vowel A.' },
  { id: 'ta', char: 'ᜆ', latin: 'Ta', type: 'consonant-vowel', description: 'Consonant T with default vowel A.' },
  { id: 'da', char: 'ᜇ', latin: 'Da/Ra', type: 'consonant-vowel', description: 'Consonant D or R with default vowel A.' },
  { id: 'na', char: 'ᜈ', latin: 'Na', type: 'consonant-vowel', description: 'Consonant N with default vowel A.' },
  { id: 'pa', char: 'ᜉ', latin: 'Pa', type: 'consonant-vowel', description: 'Consonant P with default vowel A.' },
  { id: 'ba', char: 'ᜊ', latin: 'Ba', type: 'consonant-vowel', description: 'Consonant B with default vowel A.' },
  { id: 'ma', char: 'ᜋ', latin: 'Ma', type: 'consonant-vowel', description: 'Consonant M with default vowel A.' },
  { id: 'ya', char: 'ᜌ', latin: 'Ya', type: 'consonant-vowel', description: 'Consonant Y with default vowel A.' },
  { id: 'la', char: 'ᜎ', latin: 'La', type: 'consonant-vowel', description: 'Consonant L with default vowel A.' },
  { id: 'wa', char: 'ᜏ', latin: 'Wa', type: 'consonant-vowel', description: 'Consonant W with default vowel A.' },
  { id: 'sa', char: 'ᜐ', latin: 'Sa', type: 'consonant-vowel', description: 'Consonant S with default vowel A.' },
  { id: 'ha', char: 'ᜑ', latin: 'Ha', type: 'consonant-vowel', description: 'Consonant H with default vowel A.' },
];

export interface Lesson {
  id: string;
  title: string;
  type: 'intro' | 'quiz' | 'history';
  characters?: string[]; // IDs of characters introduced
  points: number;
}

export const LESSONS: Lesson[] = [
  { id: 'l1', title: 'The Three Vowels', type: 'intro', characters: ['a', 'ei', 'ou'], points: 50 },
  { id: 'l2', title: 'Vowel Basics Quiz', type: 'quiz', characters: ['a', 'ei', 'ou'], points: 100 },
  { id: 'l3', title: 'The Throat Sounds', type: 'intro', characters: ['ka', 'ga', 'nga'], points: 50 },
  { id: 'l4', title: 'Consonants Part 1 Quiz', type: 'quiz', characters: ['ka', 'ga', 'nga'], points: 100 },
  { id: 'l5', title: 'Soft Sounds', type: 'intro', characters: ['ta', 'da', 'na'], points: 50 },
  { id: 'l6', title: 'Consonants Part 2 Quiz', type: 'quiz', characters: ['ta', 'da', 'na'], points: 150 },
  { id: 'l7', title: 'The Lip Sounds', type: 'intro', characters: ['pa', 'ba', 'ma'], points: 50 },
  { id: 'l8', title: 'Semi-Vowels & Flow', type: 'intro', characters: ['ya', 'la', 'wa'], points: 50 },
  { id: 'l9', title: 'The Sissing Sounds', type: 'intro', characters: ['sa', 'ha'], points: 50 },
  { id: 'l10', title: 'Grand Mastery Test', type: 'quiz', characters: ['a', 'ei', 'ou', 'ka', 'ga', 'nga', 'ta', 'da', 'na', 'pa', 'ba', 'ma', 'ya', 'la', 'wa', 'sa', 'ha'], points: 500 },
];

export const COLORS = {
  primary: '#5A5A40', // Olive
  secondary: '#8B4513', // SaddleBrown
  accent: '#DAA520', // GoldenRod
  background: '#F5F5F0', // Cream
  text: '#1C1C1C',
};

export const COMMUNITY_NOTES = [
  { id: 'c1', user: 'Jaychael', content: "The 'Kudlit' is essential! A dot above changes an 'A' consonant to 'E/I', and below to 'O/U'. Don't forget it!", createdAt: Date.now() - 86400000 },
  { id: 'c2', user: 'Laurice', content: "Baybayin is an 'abugida' – each character represents a consonant-vowel combo. It's so different from the Latin alphabet!", createdAt: Date.now() - 172800000 },
  { id: 'c3', user: 'Bading', content: "Did you know? In ancient times, people wrote on bamboo using sharp daggers! That's why the lines are often curved.", createdAt: Date.now() - 259200000 },
];
