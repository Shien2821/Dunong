import React, { useState, useEffect, useRef } from 'react';
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
  Award,
  Globe,
  Facebook,
  Mail,
  Camera,
  LogOut
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { REFINED_BAYBAYIN, LESSONS, Lesson, BaybayinChar, COMMUNITY_NOTES } from './constants';
import { TRANSLATIONS, Language, getTranslation } from './translations';
import { db, auth, googleProvider } from './lib/firebase';

// --- Constants ---

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

const GameNavigation = ({ activeTab, setActiveTab, progress, settings, user }: { activeTab: string, setActiveTab: (t: string) => void, progress: UserProgress, settings: any, user: any }) => {
  const t = getTranslation(settings.language as Language);

  const leftTabs = [
    { id: 'profile', icon: '👤', label: t.profile },
    { id: 'leaderboard', icon: '🏆', label: t.leaderboard },
    { id: 'settings', icon: '⚙️', label: t.settings },
  ];

  const bottomTabs = [
    { id: 'dashboard', icon: '🏰', label: t.dashboard },
    { id: 'notes', icon: '📜', label: t.notes },
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
              setActiveTab(tab.id);
            }}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border-b-2 shadow-lg pointer-events-auto transition-all relative ${
              activeTab === tab.id 
                ? 'bg-accent-gold border-accent-gold-dark text-primary-dark scale-105' 
                : 'bg-white border-parchment text-gray-400'
            }`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              {tab.id === 'profile' && user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl">{tab.icon}</span>
              )}
            </div>
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
              setActiveTab(tab.id);
            }}
            className={`flex flex-col items-center gap-0.5 group transition-all ${
              activeTab === tab.id ? 'text-primary-brand' : 'text-gray-400'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all overflow-hidden ${
              activeTab === tab.id ? 'bg-primary-brand text-white shadow-lg' : 'bg-parchment/10 group-hover:bg-parchment/30'
            }`}>
              {tab.id === 'profile' && user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full border-2 border-white/20 rounded-xl object-cover" />
              ) : (
                <span className="text-xl">{tab.icon}</span>
              )}
            </div>
            <span className="text-[9px] font-black uppercase tracking-tight">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </>
  );
};

const Dashboard = ({ progress, onStartLesson, settings }: { progress: UserProgress, onStartLesson: (l: Lesson) => void, settings: any }) => {
  const t = getTranslation(settings.language as Language);
  const currentChapter = LESSONS.find(l => !progress.completedLessons.includes(l.id)) || LESSONS[0];
  const chapterIdx = LESSONS.findIndex(l => l.id === currentChapter.id);

  return (
    <div className="flex-1 h-full flex flex-col min-w-0">
      <header className="p-6 md:p-8 bg-primary-brand text-white flex flex-col gap-1 -mx-6 md:-mx-12 -mt-6 md:-mt-12 mb-8 shadow-lg">
        <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">{settings.language === 'en' ? 'Chapter' : 'Antas'} {chapterIdx + 1}</h2>
            <h3 className="text-2xl font-black uppercase tracking-tight">{(t as any)[currentChapter.id] || currentChapter.title}</h3>
          </div>
          <button 
            onClick={() => {
              onStartLesson(currentChapter);
            }}
            className="vibrant-button text-xs px-4"
          >
            {t.startLesson}
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
                  {isCompleted ? t.completed : isNext ? (settings.language === 'en' ? 'CURRENT' : 'KASALUKUYAN') : t.locked}
                </div>

                {isNext && (
                   <div className="absolute top-22 left-1/2 -translate-x-1/2 bg-white shadow-xl px-3 py-1.5 rounded-xl border-2 border-accent-green min-w-[120px] text-center z-10">
                     <p className="text-xs font-black text-accent-green uppercase">{(t as any)[lesson.id] || lesson.title}</p>
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


const LessonView = ({ lesson, onComplete, onCancel, settings }: { lesson: Lesson, onComplete: (points: number) => void, onCancel: () => void, settings: any }) => {
  const t = getTranslation(settings.language as Language);
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
    question: `${settings.language === 'en' ? 'Select the corresponding letter:' : 'Piliin ang katumbas na titik:'} ${char.char}`,
    answer: char.latin,
    options: [char.latin, ...REFINED_BAYBAYIN.filter(c => c.id !== char.id).slice(0, 3).map(c => c.latin)].sort(() => Math.random() - 0.5),
    explanation: char.description
  }));

  const handleNext = () => {
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
                      {quizState.isCorrect ? t.correct : t.wrong}
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
            {t.continue}
          </button>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = ({ settings }: { settings: any }) => {
  const t = getTranslation(settings.language as Language);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaders(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Leaderboard Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-black uppercase text-primary-dark px-2">{t.leaderboard}</h2>
      
      {loading ? (
        <div className="vibrant-card p-12 text-center">
          <div className="w-10 h-10 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-dark font-serif italic">Kinukuha ang mga bayani...</p>
        </div>
      ) : (
        <div className="vibrant-card p-0 overflow-hidden shadow-sm">
          {leaders.map((user, i) => (
            <div key={user.id} className={`flex items-center justify-between p-4 border-b border-parchment/30 last:border-0 ${i === 0 ? 'bg-accent-gold/5' : ''}`}>
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-black w-6 text-center ${i < 3 ? 'text-accent-gold' : 'text-gray-300'}`}>
                  {i + 1}
                </span>
                <div className="w-10 h-10 rounded-full bg-parchment/40 flex items-center justify-center font-black text-primary-brand text-xs overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || '👤'
                  )}
                </div>
                <div>
                  <p className="text-lg font-black text-primary-dark uppercase tracking-tight leading-none">{user.name}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                      🔥 {user.streak || 1} {settings.language === 'fil' ? 'ARW' : 'DAY'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-primary-brand leading-none">{user.points}</p>
                <p className="text-[9px] font-black uppercase text-gray-400 mt-1">{t.score}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NotesView = ({ notes, onAddNote, settings }: { notes: Note[], onAddNote: (content: string) => void, settings: any }) => {
  const t = getTranslation(settings.language as Language);
  const [newNote, setNewNote] = useState('');
  const [showCommunity, setShowCommunity] = useState(true);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-5xl font-black uppercase text-primary-dark">{t.notes}</h2>
      </div>

      <div className="space-y-6">
        <div className="p-5 bg-accent-gold/5 border-2 border-accent-gold/20 border-dashed rounded-2xl">
          <p className="text-primary-dark font-serif italic text-base">{settings.language === 'en' ? 'Share your knowledge or read from the community.' : 'Ibahagi ang iyong kaalaman o magbasa mula sa komunidad.'}</p>
        </div>

        <div className="vibrant-card p-4 space-y-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={t.writeNote}
            className="w-full h-24 focus:outline-none transition-all font-serif p-2 leading-relaxed text-lg bg-transparent border-b border-parchment"
          />
          <div className="flex justify-end">
            <button 
              onClick={() => {
                if (newNote) {
                  onAddNote(newNote);
                  setNewNote('');
                }
              }}
              className="vibrant-button flex items-center gap-2 py-2 px-4 text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              {t.addNote}
            </button>
          </div>
        </div>

        <div className="grid gap-4 mt-8">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">{t.communityNotes}</h3>
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

const IntroView = ({ onStart, settings }: { onStart: () => void, settings: any }) => {
  const t = getTranslation(settings.language as Language);
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
        </div>

        <button 
          onClick={() => {
            onStart();
          }}
          className="w-full bg-accent-gold text-primary-dark font-black py-4 rounded-2xl text-xl uppercase tracking-widest border-b-[6px] border-accent-gold-dark hover:translate-y-[2px] hover:border-b-[4px] transition-all active:translate-y-[4px] active:border-b-0"
        >
          {t.getStarted}
        </button>
      </div>
      
      <div className="absolute bottom-8 opacity-40 text-[10px] font-black uppercase tracking-[0.3em]">
        Luzon • Visayas • Mindanao
      </div>
    </div>
  );
};

const AuthView = ({ onComplete, settings }: { onComplete: (name: string, isGoogle?: boolean) => void, settings: any }) => {
  const t = getTranslation(settings.language as Language);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onComplete(result.user.displayName || 'Isko', true);
    } catch (error) {
      console.error("Google Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-paper-bg flex flex-col items-center justify-center p-8 z-[90]">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-black text-primary-dark uppercase">{t.welcome}</h2>
          <p className="font-serif italic text-lg opacity-60">{t.whatName}</p>
        </div>
        
        <div className="vibrant-card p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-primary-brand">{t.username}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.enterName}
              className="w-full p-4 bg-paper-bg border-2 border-parchment rounded-2xl focus:outline-none focus:border-accent-gold font-bold text-xl"
            />
          </div>
          
          <div className="space-y-3">
            <button 
              disabled={!name || loading}
              onClick={() => {
                onComplete(name);
              }}
              className="w-full vibrant-button py-4 text-xl"
            >
              {t.getStarted}
            </button>

            <div className="flex items-center gap-4 my-2">
              <div className="h-px flex-1 bg-parchment"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">o</span>
              <div className="h-px flex-1 bg-parchment"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 border-2 border-parchment rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-parchment/10 transition-all"
            >
              <Mail className="w-4 h-4 text-red-500" />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ settings, setSettings, setShowIntro, user, onUpdateProfile }: { settings: any, setSettings: any, setShowIntro: (s: boolean) => void, user: any, onUpdateProfile: (u: any) => void }) => {
  const t = getTranslation(settings.language as Language);
  const [editingName, setEditingName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { id: 'fil', label: 'Filipino', flag: '🇵🇭' },
    { id: 'en', label: 'English', flag: '🇺🇸' },
  ];

  const handleProfileUpdate = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateProfile({ ...user, name: editingName, avatar });
      setIsSaving(false);
    }, 500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <h2 className="text-4xl font-black uppercase text-primary-dark">{t.settings}</h2>
      
      <div className="grid gap-8">
        {/* Profile Edit */}
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 px-1">{t.editProfile}</p>
          <div className="vibrant-card space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-parchment flex items-center justify-center text-2xl overflow-hidden border-2 border-white shadow-md">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || '👤'
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-brand rounded-lg flex items-center justify-center text-white shadow-lg border-2 border-white hover:scale-110 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black uppercase text-primary-brand tracking-widest hidden">{t.username}</label>
                <input 
                  type="text" 
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full bg-paper-bg border-b-2 border-parchment py-1 font-bold text-lg focus:outline-none focus:border-accent-gold"
                />
              </div>
            </div>
            <button 
              onClick={handleProfileUpdate}
              disabled={isSaving || (editingName === user?.name && avatar === user?.avatar)}
              className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                (editingName !== user?.name || avatar !== user?.avatar)
                ? 'bg-primary-brand text-white shadow-lg' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? t.saving : t.saveProfile}
            </button>
          </div>
        </section>

        {/* Language Selection */}
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 px-1">{t.language}</p>
          <div className="vibrant-card grid grid-cols-2 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSettings((prev: any) => ({ ...prev, language: lang.id }))}
                className={`py-4 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                  settings.language === lang.id 
                    ? 'border-accent-gold bg-accent-gold/5 text-primary-dark font-black' 
                    : 'border-parchment hover:border-accent-gold/30'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-xs uppercase tracking-widest">{lang.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Social Connections */}
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 px-1">{t.socialConnections}</p>
          <div className="vibrant-card space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-parchment hover:border-blue-600/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Facebook className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-600">Facebook</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-brand group-hover:underline">{t.connect}</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-parchment hover:border-red-600/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-600">Google</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-brand group-hover:underline">{t.connect}</span>
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <div className="vibrant-card">
          <button 
            onClick={() => {
              setShowIntro(true);
            }}
            className="w-full vibrant-button py-4"
          >
            {t.playIntro}
          </button>
        </div>

        <button 
          onClick={async () => {
            await signOut(auth);
            onUpdateProfile(null);
          }}
          className="w-full py-4 flex items-center justify-center gap-2 text-red-500 font-black uppercase text-xs tracking-widest hover:bg-red-50 rounded-2xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          {t.logout}
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('dunong_started'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('dunong_settings');
    return saved ? JSON.parse(saved) : { language: 'fil' };
  });

  const t = getTranslation(settings.language as Language);

  useEffect(() => {
    localStorage.setItem('dunong_settings', JSON.stringify(settings));
  }, [settings]);

  const [user, setUser] = useState<{name: string, avatar?: string | null} | null>(() => {
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

  const [fbUser, setFbUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFbUser(user);
        // Fetch existing data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({ name: data.name, avatar: data.avatar });
          setProgress({
            completedLessons: data.completedLessons || [],
            points: data.points || 0,
            streak: data.streak || 1,
            lastActive: data.updatedAt ? (data.updatedAt as Timestamp).toDate().toISOString().split('T')[0] : null
          });
        }
      } else {
        setFbUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync profile to Firestore
  useEffect(() => {
    const syncProfile = async () => {
      if (fbUser && user) {
        try {
          await setDoc(doc(db, 'users', fbUser.uid), {
            name: user.name,
            points: progress.points,
            streak: progress.streak,
            avatar: user.avatar || null,
            completedLessons: progress.completedLessons,
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (error) {
          console.error("Sync Error:", error);
        }
      }
    };

    const timeout = setTimeout(syncProfile, 2000); // Debounce sync
    return () => clearTimeout(timeout);
  }, [user, progress, fbUser]);

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

  const handleAuth = async (name: string, isGoogle?: boolean) => {
    if (isGoogle) {
      // User is already signed in via AuthView's handleGoogleLogin
      // The onAuthStateChanged will handle the state update
    } else {
      // Anonymously sign in so they can store data in Firestore
      try {
        const result = await signInAnonymously(auth);
        setUser({ name });
      } catch (error) {
        console.error("Anon Signin Error:", error);
        setUser({ name }); // Fallback to local only if firebase fails
      }
    }
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
        {showIntro && <IntroView onStart={handleStart} settings={settings} />}
        {!user && !showIntro && <AuthView onComplete={handleAuth} settings={settings} />}
      </AnimatePresence>

      <div className="h-screen w-screen flex flex-col bg-paper-bg overflow-hidden relative">
        {user && <GameNavigation activeTab={activeTab} setActiveTab={setActiveTab} progress={progress} settings={settings} user={user} />}
        
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
                  <Dashboard progress={progress} onStartLesson={setActiveLesson} settings={settings} />
                </motion.div>
              )}

              {activeTab === 'leaderboard' && (
                <motion.div
                  key="leaderboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Leaderboard settings={settings} />
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <NotesView notes={notes} onAddNote={handleAddNote} settings={settings} />
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
                    <div className="w-40 h-40 rounded-[3rem] bg-paper-bg border-[6px] border-white shadow-2xl mx-auto mb-8 flex items-center justify-center text-6xl text-primary-brand overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0) || '👤'
                      )}
                    </div>
                    <div>
                      <h2 className="text-5xl font-black uppercase text-primary-dark tracking-tight">
                        {user?.name || t.anonymous}
                      </h2>
                      <p className="text-2xl text-primary-brand font-serif italic mt-2">Datu Level {Math.floor(progress.points / 100) + 1} • {settings.language === 'en' ? 'Novice' : 'Baguhan'}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-12 px-6">
                      <div className="bg-paper-bg p-4 rounded-2xl border-2 border-parchment shadow-sm">
                         <p className="text-[10px] uppercase font-black text-gray-400">XP</p>
                         <p className="text-2xl font-black text-primary-dark">{progress.points}</p>
                      </div>
                      <div className="bg-paper-bg p-4 rounded-2xl border-2 border-parchment shadow-sm">
                         <p className="text-[10px] uppercase font-black text-gray-400">{settings.language === 'en' ? 'Lesson' : 'Aralin'}</p>
                         <p className="text-2xl font-black text-primary-dark">{progress.completedLessons.length}</p>
                      </div>
                      <div className="bg-paper-bg p-4 rounded-2xl border-2 border-parchment shadow-sm">
                         <p className="text-[10px] uppercase font-black text-gray-400">Streak</p>
                         <p className="text-2xl font-black text-primary-dark">{progress.streak}⚡</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveTab('settings');
                      }}
                      className="mt-12 text-blue-600 font-black uppercase text-xs tracking-widest hover:underline"
                    >
                      {settings.language === 'en' ? 'Go to Settings' : 'Pumunta sa Settings'}
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
                  <SettingsView 
                    settings={settings} 
                    setSettings={setSettings} 
                    setShowIntro={setShowIntro} 
                    user={user}
                    onUpdateProfile={setUser}
                  />
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
              settings={settings}
            />
          )}
        </AnimatePresence>
      </div>

    </>
  );
}

