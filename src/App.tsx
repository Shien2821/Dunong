import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Trophy, 
  User, 
  PlusCircle, 
  LayoutDashboard,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Award
} from 'lucide-react';
import { REFINED_BAYBAYIN, LESSONS, Lesson, BaybayinChar, COMMUNITY_NOTES } from './constants';

// --- Constants ---

const AUDIO_FILES = {
  music: [
    { id: 'bahay-kubo', name: 'Bahay Kubo', url: 'https://ia800905.us.archive.org/24/items/PhilippineFolkSongs/BahayKubo.mp3' },
    { id: 'magtanim', name: "Magtanim ay 'di Biro", url: 'https://ia800905.us.archive.org/24/items/PhilippineFolkSongs/MagtanimAyDiBiro.mp3' },
    { id: 'leron', name: 'Leron Leron Sinta', url: 'https://ia800905.us.archive.org/24/items/PhilippineFolkSongs/LeronLeronSinta.mp3' },
  ],
  sfx: {
    click: 'https://www.soundjay.com/buttons/sounds/button-16.mp3',
    correct: 'https://www.soundjay.com/buttons/sounds/button-3.mp3',
    wrong: 'https://www.soundjay.com/buttons/sounds/button-10.mp3',
  }
};

// --- Types ---
interface UserProgress {
  completedLessons: string[];
  points: number;
  streak: number;
  lastActive: string | null;
}

interface Note {
  id: string;
  lessonId: string;
  content: string;
  createdAt: number;
}

// --- Components ---

const GameNavigation = ({ activeTab, setActiveTab, progress, playSfx }: { activeTab: string, setActiveTab: (t: string) => void, progress: UserProgress, playSfx: (s: string) => void }) => {
  const leftTabs = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'leaderboard', icon: '🏆', label: 'Ranggo' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  const bottomTabs = [
    { id: 'dashboard', icon: '🏰', label: 'Mag-aral' },
    { id: 'notes', icon: '📜', label: 'Kaalaman' },
  ];

  return (
    <>
      {/* Left Vertical Navigation */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40 pointer-events-none">
        {leftTabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSfx('click');
              setActiveTab(tab.id);
            }}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border-b-2 shadow-lg pointer-events-auto transition-all relative ${
              activeTab === tab.id 
                ? 'bg-accent-gold border-accent-gold-dark text-primary-dark scale-105' 
                : 'bg-white border-parchment text-gray-400'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.id === 'profile' && (
              <div className="absolute -bottom-1 bg-primary-brand text-[7px] text-white px-1.5 rounded-full font-black uppercase shadow-sm">
                Lvl {Math.floor(progress.points / 100) + 1}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Bottom Horizontal Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4 px-6 py-2 bg-white/90 backdrop-blur-md rounded-2xl border-b-2 border-parchment shadow-2xl z-40 w-max max-w-[90vw]">
        {bottomTabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSfx('click');
              setActiveTab(tab.id);
            }}
            className={`flex flex-col items-center gap-0.5 group transition-all ${
              activeTab === tab.id ? 'text-primary-brand' : 'text-gray-400'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              activeTab === tab.id ? 'bg-primary-brand text-white shadow-lg' : 'bg-parchment/10 group-hover:bg-parchment/30'
            }`}>
              <span className="text-xl">{tab.icon}</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-tight">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </>
  );
};

const Dashboard = ({ progress, onStartLesson, playSfx }: { progress: UserProgress, onStartLesson: (l: Lesson) => void, playSfx: (s: string) => void }) => {
  const currentChapter = LESSONS.find(l => !progress.completedLessons.includes(l.id)) || LESSONS[0];
  const chapterIdx = LESSONS.findIndex(l => l.id === currentChapter.id);

  return (
    <div className="flex-1 h-full flex flex-col min-w-0">
      <header className="p-6 md:p-8 bg-primary-brand text-white flex flex-col gap-1 -mx-6 md:-mx-12 -mt-6 md:-mt-12 mb-8 shadow-lg">
        <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Antas {chapterIdx + 1}</h2>
            <h3 className="text-2xl font-black uppercase tracking-tight">{currentChapter.title}</h3>
          </div>
          <button 
            onClick={() => {
              playSfx('click');
              onStartLesson(currentChapter);
            }}
            className="vibrant-button text-xs px-4"
          >
            Mabuhay
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center py-6 relative overflow-y-auto">
        <div className="relative flex flex-col items-center gap-10 w-full max-w-md">
          {LESSONS.map((lesson, idx) => {
            const isCompleted = progress.completedLessons.includes(lesson.id);
            const isNext = !isCompleted && (idx === 0 || progress.completedLessons.includes(LESSONS[idx - 1].id));
            const isLocked = !isCompleted && !isNext;
            const mainChar = REFINED_BAYBAYIN.find(c => c.id === (lesson.characters?.[0] || 'ka'))?.char || 'ᜀ';

            // More gentle alternating curve positions
            const offset = idx % 2 === 0 ? (idx % 4 === 0 ? 'ml-0' : 'mr-20') : (idx % 3 === 0 ? 'ml-20' : 'ml-10');

            return (
              <div key={lesson.id} className={`group relative ${offset} transition-all`}>
                <div 
                  onClick={() => {
                    if (!isLocked) {
                      playSfx('click');
                      onStartLesson(lesson);
                    }
                  }}
                  className={`baybayin-char-circle cursor-pointer w-20 h-20 text-2xl ${
                    isCompleted ? 'bg-accent-gold border-accent-gold-dark' : 
                    isNext ? 'bg-accent-green border-[#1F613C] animate-pulse ring-4 ring-accent-green/20 scale-105' : 
                    'bg-gray-200 border-gray-300'
                  }`}
                >
                  <span className={isLocked ? 'text-gray-400' : 'text-white'}>{mainChar}</span>
                </div>
                
                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-lg border-2 text-[9px] font-bold shadow-sm ${
                   isCompleted ? 'bg-white border-parchment text-primary-brand' :
                   isNext ? 'bg-white border-accent-green text-accent-green shadow-lg' :
                   'bg-gray-50 border-gray-100 text-gray-300'
                }`}>
                  {isCompleted ? 'TAPOS NA' : isNext ? 'KASALUKUYAN' : 'NAKAHARANG'}
                </div>

                {isNext && (
                   <div className="absolute top-22 left-1/2 -translate-x-1/2 bg-white shadow-xl px-3 py-1.5 rounded-xl border-2 border-accent-green min-w-[120px] text-center z-10">
                     <p className="text-xs font-black text-accent-green uppercase">{lesson.title}</p>
                   </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-48 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #8B4513 0, #8B4513 2px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}></div>
      </div>
    </div>
  );
};


const LessonView = ({ lesson, onComplete, onCancel, playSfx }: { lesson: Lesson, onComplete: (points: number) => void, onCancel: () => void, playSfx: (s: string) => void }) => {
  const [step, setStep] = useState(0);
  const [selectedChars] = useState(() => {
    return lesson.characters?.map(cid => REFINED_BAYBAYIN.find(c => c.id === cid)!) || [];
  });
  
  const [quizState, setQuizState] = useState<{
    currentQuestion: number;
    selectedAnswer: string | null;
    isCorrect: boolean | null;
    showExplanation: boolean;
  }>({
    currentQuestion: 0,
    selectedAnswer: null,
    isCorrect: null,
    showExplanation: false,
  });

  const questions = selectedChars.map(char => ({
    question: `Piliin ang katumbas na titik: ${char.char}`,
    answer: char.latin,
    options: [char.latin, ...REFINED_BAYBAYIN.filter(c => c.id !== char.id).slice(0, 3).map(c => c.latin)].sort(() => Math.random() - 0.5),
    explanation: char.description
  }));

  const handleNext = () => {
    playSfx('click');
    if (lesson.type === 'intro') {
      if (step < selectedChars.length - 1) {
        setStep(step + 1);
      } else {
        onComplete(lesson.points);
      }
    } else {
      if (quizState.currentQuestion < questions.length - 1) {
        setQuizState({
          ...quizState,
          currentQuestion: quizState.currentQuestion + 1,
          selectedAnswer: null,
          isCorrect: null,
          showExplanation: false,
        });
      } else {
        onComplete(lesson.points);
      }
    }
  };

  const handleCheckAnswer = (option: string) => {
    if (quizState.selectedAnswer) return;
    const isCorrect = option === questions[quizState.currentQuestion].answer;
    playSfx(isCorrect ? 'correct' : 'wrong');
    setQuizState({ ...quizState, selectedAnswer: option, isCorrect, showExplanation: true });
  };

  return (
    <div className="fixed inset-0 bg-paper-bg z-50 flex flex-col p-6 md:p-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
        <div className="flex justify-between items-center mb-12">
          <button onClick={onCancel} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <XCircle className="w-8 h-8 opacity-40 hover:opacity-100 text-primary-dark" />
          </button>
          <div className="flex-1 h-3 bg-parchment mx-8 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent-gold" 
              initial={{ width: 0 }}
              animate={{ width: `${((lesson.type === 'intro' ? step + 1 : quizState.currentQuestion + 1) / (lesson.type === 'intro' ? selectedChars.length : questions.length)) * 100}%` }}
            />
          </div>
        </div>

        <motion.div 
          key={lesson.type === 'intro' ? step : quizState.currentQuestion}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col"
        >
          {lesson.type === 'intro' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
              <span className="text-8xl bg-white w-40 h-40 flex items-center justify-center rounded-[40px] border-4 border-parchment shadow-xl text-primary-dark">
                {selectedChars[step].char}
              </span>
              <div className="space-y-4">
                <h2 className="text-7xl font-black text-primary-brand">{selectedChars[step].latin}</h2>
                <p className="text-xl text-primary-dark/60 font-serif italic max-w-sm mx-auto">
                  {selectedChars[step].description}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-6">
              <h2 className="text-3xl text-center mb-6 font-black text-primary-dark">{questions[quizState.currentQuestion].question}</h2>
              <div className="grid grid-cols-2 gap-4">
                {questions[quizState.currentQuestion].options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleCheckAnswer(option)}
                    className={`vibrant-card border-2 py-6 text-3xl font-black transition-all ${
                      quizState.selectedAnswer === option
                        ? quizState.isCorrect 
                          ? 'border-accent-green bg-accent-green/10 text-accent-green' 
                          : 'border-red-500 bg-red-50 text-red-600'
                        : 'hover:border-accent-gold/40 text-primary-dark'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              <AnimatePresence>
                {quizState.showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border-2 ${quizState.isCorrect ? 'bg-accent-green/5 border-accent-green text-accent-green' : 'bg-red-50 border-red-500 text-red-700'}`}
                  >
                    <div className="flex items-center gap-2 font-black uppercase tracking-widest mb-1 text-[10px]">
                      {quizState.isCorrect ? <CheckCircle2 className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
                      {quizState.isCorrect ? 'Tumpak!' : 'Mali, subukan uli.'}
                    </div>
                    <p className="font-serif italic text-base opacity-80">{questions[quizState.currentQuestion].explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        <div className="mt-12 py-8 flex justify-end">
          <button 
            disabled={lesson.type === 'quiz' && quizState.selectedAnswer === null}
            onClick={handleNext} 
            className="vibrant-button px-16 py-4 text-xl"
          >
            Ipagpatuloy
          </button>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const mockUsers = [
    { name: 'Shien', points: 1250, streak: 12 },
    { name: 'Sof', points: 1100, streak: 8 },
    { name: 'Samaire', points: 950, streak: 5 },
    { name: 'Mhevly', points: 800, streak: 3 },
    
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-black uppercase text-primary-dark px-2">Ranggo</h2>
      <div className="vibrant-card p-0 overflow-hidden shadow-sm">
        {mockUsers.map((user, i) => (
          <div key={user.name} className={`flex items-center justify-between p-4 border-b border-parchment/30 last:border-0 ${i === 0 ? 'bg-accent-gold/5' : ''}`}>
            <div className="flex items-center gap-4">
              <span className={`text-2xl font-black w-6 text-center ${i < 3 ? 'text-accent-gold' : 'text-gray-300'}`}>
                {i + 1}
              </span>
              <div className="w-10 h-10 rounded-full bg-parchment/40 flex items-center justify-center font-black text-primary-brand text-xs">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-black text-primary-dark uppercase tracking-tight leading-none">{user.name}</p>
                <div className="flex gap-2 mt-1">
                   <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">🔥 {user.streak} ARW</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-primary-brand leading-none">{user.points}</p>
              <p className="text-[9px] font-black uppercase text-gray-400 mt-1">XP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotesView = ({ notes, onAddNote, playSfx }: { notes: Note[], onAddNote: (content: string) => void, playSfx: (s: string) => void }) => {
  const [newNote, setNewNote] = useState('');
  const [showCommunity, setShowCommunity] = useState(true);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-5xl font-black uppercase text-primary-dark">Dagdag Kaalaman</h2>
      </div>

      <div className="space-y-6">
        <div className="p-5 bg-accent-gold/5 border-2 border-accent-gold/20 border-dashed rounded-2xl">
          <p className="text-primary-dark font-serif italic text-base">Ibahagi ang iyong kaalaman o magbasa mula sa komunidad.</p>
        </div>

        <div className="vibrant-card p-4 space-y-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Isulat ang iyong alam..."
            className="w-full h-24 focus:outline-none transition-all font-serif p-2 leading-relaxed text-lg bg-transparent border-b border-parchment"
          />
          <div className="flex justify-end">
            <button 
              onClick={() => {
                if (newNote) {
                  playSfx('click');
                  onAddNote(newNote);
                  setNewNote('');
                }
              }}
              className="vibrant-button flex items-center gap-2 py-2 px-4 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Ibahagi
            </button>
          </div>
        </div>

        <div className="grid gap-4 mt-8">
          {/* User's recently added notes can appear here too if we want, but for now let's focus on the board */}
          {COMMUNITY_NOTES.map(cn => (
            <div key={cn.id} className="vibrant-card space-y-3 hover:border-accent-gold transition-colors p-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-parchment flex items-center justify-center text-[8px] font-black uppercase text-primary-brand">
                  {cn.user.charAt(0)}
                </div>
                <span className="font-black text-[9px] text-primary-brand uppercase tracking-tighter">{cn.user}</span>
              </div>
              <p className="font-serif italic text-lg text-primary-dark/80">{cn.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const IntroView = ({ onStart, playSfx }: { onStart: () => void, playSfx: (s: string) => void }) => {
  return (
    <div className="fixed inset-0 bg-[#8B4513] flex flex-col items-center justify-center p-8 z-[100] text-white">
      <div className="max-w-md w-full text-center space-y-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 bg-white rounded-[32px] flex items-center justify-center text-[#8B4513] text-6xl font-black italic mx-auto shadow-2xl"
        >
          D
        </motion.div>
        
        <div className="space-y-3">
          <h1 className="text-5xl font-black uppercase tracking-widest">Dunong</h1>
          <p className="text-lg font-serif italic opacity-70 leading-relaxed px-4">
            Unravel the ancient scripts of our ancestors. A journey into the heart of Baybayin.
          </p>
        </div>

        <button 
          onClick={() => {
            playSfx('click');
            onStart();
          }}
          className="w-full bg-accent-gold text-primary-dark font-black py-4 rounded-2xl text-xl uppercase tracking-widest border-b-[6px] border-accent-gold-dark hover:translate-y-[2px] hover:border-b-[4px] transition-all active:translate-y-[4px] active:border-b-0"
        >
          Magsimula na
        </button>
      </div>
      
      <div className="absolute bottom-8 opacity-40 text-[10px] font-black uppercase tracking-[0.3em]">
        Luzon • Visayas • Mindanao
      </div>
    </div>
  );
};

const AuthView = ({ onComplete, playSfx }: { onComplete: (name: string) => void, playSfx: (s: string) => void }) => {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-paper-bg flex flex-col items-center justify-center p-8 z-[90]">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-black text-primary-dark uppercase">Sino ka?</h2>
          <p className="font-serif italic text-lg opacity-60">Ipakilala ang iyong sarili, bayani.</p>
        </div>
        
        <div className="vibrant-card p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-primary-brand">Pangalan</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hal: Bhie143"
              className="w-full p-4 bg-paper-bg border-2 border-parchment rounded-2xl focus:outline-none focus:border-accent-gold font-bold text-xl"
            />
          </div>
          
          <button 
            disabled={!name}
            onClick={() => {
              playSfx('click');
              onComplete(name);
            }}
            className="w-full vibrant-button py-4 text-xl"
          >
            Pumasok
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ settings, setSettings, playSfx, setShowIntro }: { settings: any, setSettings: any, playSfx: (s: string) => void, setShowIntro: (s: boolean) => void }) => {
  return (
    <div className="space-y-12">
      <h2 className="text-5xl font-black uppercase text-primary-dark">Settings</h2>
      <div className="grid gap-6">
        <div className="vibrant-card flex justify-between items-center">
          <div>
            <p className="text-xl font-bold">Sound Effects</p>
            <p className="text-sm opacity-60">Play sounds on correct actions</p>
          </div>
          <button 
            onClick={() => {
              setSettings((prev: any) => ({ ...prev, sfx: !prev.sfx }));
              playSfx('click');
            }}
            className={`w-16 h-8 rounded-full flex items-center px-1 transition-colors ${settings.sfx ? 'bg-accent-green' : 'bg-parchment'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${settings.sfx ? 'translate-x-8' : 'translate-x-0'}`}></div>
          </button>
        </div>

        <div className="vibrant-card flex justify-between items-center">
          <div>
            <p className="text-xl font-bold">Background Music</p>
            <p className="text-sm opacity-60">Traditional Filipino instruments</p>
          </div>
          <button 
            onClick={() => {
              setSettings((prev: any) => ({ ...prev, music: !prev.music }));
              playSfx('click');
            }}
            className={`w-16 h-8 rounded-full flex items-center px-1 transition-colors ${settings.music ? 'bg-accent-green' : 'bg-parchment'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${settings.music ? 'translate-x-8' : 'translate-x-0'}`}></div>
          </button>
        </div>

        <div className="vibrant-card space-y-4">
          <p className="text-sm font-black uppercase text-gray-400">Audio Playlist</p>
          <div className="grid gap-2">
            {AUDIO_FILES.music.map((song, i) => (
              <button 
                key={song.id}
                onClick={() => {
                  playSfx('click');
                  window.dispatchEvent(new CustomEvent('changeSong', { detail: i }));
                }}
                className="w-full text-left p-3 rounded-xl border border-parchment hover:border-accent-gold-dark transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg opacity-40 font-black">{i + 1}</span>
                  <span className="font-bold">{song.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        <div className="vibrant-card">
          <button 
            onClick={() => {
              playSfx('click');
              setShowIntro(true);
            }}
            className="w-full text-primary-brand font-black uppercase text-sm tracking-widest hover:underline text-center"
          >
            Panoorin muli ang Intro
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('dunong_started'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  const [audioSettings, setAudioSettings] = useState(() => {
    const saved = localStorage.getItem('dunong_audio');
    return saved ? JSON.parse(saved) : { music: true, sfx: true, volume: 0.4 };
  });

  const [currentSongIdx, setCurrentSongIdx] = useState(0);
  const [musicAudio] = useState(() => new Audio());

  useEffect(() => {
    localStorage.setItem('dunong_audio', JSON.stringify(audioSettings));
  }, [audioSettings]);

  // BG Music logic
  useEffect(() => {
    if (!musicAudio) return;

    const onEnded = () => {
      setCurrentSongIdx((prev) => (prev + 1) % AUDIO_FILES.music.length);
    };

    const handleSongChange = (e: any) => {
      setCurrentSongIdx(e.detail);
    };
    
    window.addEventListener('changeSong', handleSongChange);
    musicAudio.addEventListener('ended', onEnded);
    
    return () => {
      window.removeEventListener('changeSong', handleSongChange);
      musicAudio.removeEventListener('ended', onEnded);
    };
  }, [musicAudio]);

  useEffect(() => {
    if (!musicAudio) return;

    if (audioSettings.music && !showIntro) {
      if (musicAudio.src !== AUDIO_FILES.music[currentSongIdx].url) {
        musicAudio.src = AUDIO_FILES.music[currentSongIdx].url;
      }
      musicAudio.volume = audioSettings.volume;
      
      const playPromise = musicAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.warn("Audio playback blocked. Waiting for interaction.");
        });
      }
    } else {
      musicAudio.pause();
    }
  }, [audioSettings.music, currentSongIdx, showIntro, musicAudio]);

  // Sync music settings changes (like volume or toggling)
  useEffect(() => {
    if (musicAudio) {
      musicAudio.volume = audioSettings.volume;
      if (!audioSettings.music) {
        musicAudio.pause();
      } else if (!showIntro && musicAudio.paused && musicAudio.src) {
        musicAudio.play().catch(() => {});
      }
    }
  }, [audioSettings.volume, audioSettings.music, showIntro, musicAudio]);

  const playSfx = (type: string) => {
    if (!audioSettings.sfx) return;
    const url = (AUDIO_FILES.sfx as any)[type];
    if (url) {
      const sfx = new Audio(url);
      sfx.volume = 0.5;
      sfx.play().catch(() => {});
    }
    
    // Explicitly try to resume BG music on ANY interaction to unlock it
    // We allow this even if showIntro is true if the intention is to transition out of intro
    if (audioSettings.music && musicAudio.paused && musicAudio.src) {
      musicAudio.play().catch(() => {});
    }
  };
  const [user, setUser] = useState<{name: string} | null>(() => {
    const saved = localStorage.getItem('dunong_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('dunong_progress');
    return saved ? JSON.parse(saved) : {
      completedLessons: [],
      points: 0,
      streak: 1,
      lastActive: new Date().toISOString().split('T')[0]
    };
  });
  
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('dunong_notes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dunong_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('dunong_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('dunong_user', JSON.stringify(user));
    }
  }, [user]);

  const handleStart = () => {
    setShowIntro(false);
    localStorage.setItem('dunong_started', 'true');
  };

  const handleAuth = (name: string) => {
    setUser({ name });
  };

  const handleCompleteLesson = (plusPoints: number) => {
    if (!activeLesson) return;
    
    setProgress(prev => ({
      ...prev,
      completedLessons: prev.completedLessons.includes(activeLesson.id) 
        ? prev.completedLessons 
        : [...prev.completedLessons, activeLesson.id],
      points: prev.points + plusPoints
    }));
    setActiveLesson(null);
  };

  const handleAddNote = (content: string) => {
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      lessonId: 'general',
      content,
      createdAt: Date.now()
    };
    setNotes(prev => [...prev, note]);
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroView onStart={handleStart} playSfx={playSfx} />}
        {!user && !showIntro && <AuthView onComplete={handleAuth} playSfx={playSfx} />}
      </AnimatePresence>

      <div className="h-screen w-screen flex flex-col bg-paper-bg overflow-hidden relative">
        {user && <GameNavigation activeTab={activeTab} setActiveTab={setActiveTab} progress={progress} playSfx={playSfx} />}
        
        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-32">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Dashboard progress={progress} onStartLesson={setActiveLesson} playSfx={playSfx} />
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Leaderboard />
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <NotesView notes={notes} onAddNote={handleAddNote} playSfx={playSfx} />
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-parchment shadow-lg mb-12">
                    <div className="w-40 h-40 bg-accent-gold/20 rounded-[48px] mx-auto flex items-center justify-center border-4 border-primary-brand shadow-inner mb-6">
                      <User className="w-20 h-20 text-primary-brand opacity-60" />
                    </div>
                    <div>
                      <h2 className="text-5xl font-black uppercase text-primary-dark tracking-tight">
                        {user?.name || 'Magiting na Isko'}
                      </h2>
                      <p className="text-2xl text-primary-brand font-serif italic mt-2">Datu Level {Math.floor(progress.points / 100) + 1} • Baguhan</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-12 px-6">
                      <div className="bg-paper-bg p-4 rounded-2xl border-2 border-parchment shadow-sm">
                         <p className="text-[10px] uppercase font-black text-gray-400">XP</p>
                         <p className="text-2xl font-black text-primary-dark">{progress.points}</p>
                      </div>
                      <div className="bg-paper-bg p-4 rounded-2xl border-2 border-parchment shadow-sm">
                         <p className="text-[10px] uppercase font-black text-gray-400">Aralin</p>
                         <p className="text-2xl font-black text-primary-dark">{progress.completedLessons.length}</p>
                      </div>
                      <div className="bg-paper-bg p-4 rounded-2xl border-2 border-parchment shadow-sm">
                         <p className="text-[10px] uppercase font-black text-gray-400">Streak</p>
                         <p className="text-2xl font-black text-primary-dark">{progress.streak}⚡</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        playSfx('click');
                        setActiveTab('settings');
                      }}
                      className="mt-12 text-blue-600 font-black uppercase text-xs tracking-widest hover:underline"
                    >
                      Pumunta sa Settings
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <SettingsView settings={audioSettings} setSettings={setAudioSettings} playSfx={playSfx} setShowIntro={setShowIntro} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <AnimatePresence>
          {activeLesson && (
            <LessonView 
              lesson={activeLesson} 
              onComplete={handleCompleteLesson} 
              onCancel={() => setActiveLesson(null)} 
              playSfx={playSfx}
            />
          )}
        </AnimatePresence>
      </div>

    </>
  );
}

