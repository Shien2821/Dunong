
export const TRANSLATIONS = {
  fil: {
    // Navigation
    profile: 'Profile',
    leaderboard: 'Ranggo',
    dashboard: 'Aralin',
    notes: 'Tala',
    settings: 'Settings',

    // Dashboard
    nextChapter: 'Susunod na Kabanata',
    startLesson: 'Simulan ang Aralin',
    locked: 'Nakalock',
    completed: 'Tapos na',

    // Settings
    editProfile: 'I-edit ang Profile',
    username: 'Pangalan',
    saveProfile: 'I-save ang Profile',
    saving: 'Sini-save...',
    language: 'Wika',
    socialConnections: 'Mga Koneksyon',
    connect: 'I-konek',
    playIntro: 'I-play muli ang Intro',
    logout: 'Mag-logout',

    // Auth
    welcome: 'Maligayang Pagdating',
    whatName: 'Anong pangalan mo?',
    enterName: 'Ipasok ang iyong pangalan...',
    getStarted: 'Magsimula Na',

    // Intro View
    unravel: 'Tuklasin ang sinaunang sulat ng ating mga ninuno.',
    journey: 'Isang paglalakbay sa puso ng Baybayin.',
    continue: 'Magpatuloy',

    // Lesson View
    exit: 'Lumabas',
    next: 'Susunod',
    finish: 'Tapusin',
    check: 'I-check',
    quiz: 'Pagsusulit',
    correct: 'Tama!',
    wrong: 'Mali!',
    lessonComplete: 'Tapos na ang Aralin!',
    youEarned: 'Nakatanggap ka ng',
    points: 'puntos',

    // Lessons
    l1: 'Ang Tatlong Patinig',
    l2: 'Pagsusulit sa Patinig',
    l3: 'Mga Tunog sa Lalamunan',
    l4: 'Pagsusulit sa Katinig (Part 1)',
    l5: 'Mga Malambot na Tunog',
    l6: 'Pagsusulit sa Katinig (Part 2)',
    l7: 'Mga Tunog sa Labi',
    l8: 'Semi-Vowels at Agos',
    l9: 'Mga Tunog na Sutsot',
    l10: 'Dakilang Pagsusulit sa Karunungan',

    // Notes
    myNotes: 'Aking mga Tala',
    communityNotes: 'Tala ng Komunidad',
    writeNote: 'Sumulat ng iyong tala...',
    addNote: 'Idagdag',

    // Leaderboard
    globalRanking: 'Global Ranking',
    score: 'Iskor',
    you: 'Ikaw',
    
    // Default names
    anonymous: 'Walang Pangalan'
  },
  en: {
    // Navigation
    profile: 'Profile',
    leaderboard: 'Ranking',
    dashboard: 'Lessons',
    notes: 'Notes',
    settings: 'Settings',

    // Dashboard
    nextChapter: 'Next Chapter',
    startLesson: 'Start Lesson',
    locked: 'Locked',
    completed: 'Completed',

    // Settings
    editProfile: 'Edit Profile',
    username: 'Username',
    saveProfile: 'Save Profile',
    saving: 'Saving...',
    language: 'Language',
    socialConnections: 'Connections',
    connect: 'Connect',
    playIntro: 'Play Intro Again',
    logout: 'Logout',

    // Auth
    welcome: 'Welcome',
    whatName: 'What is your name?',
    enterName: 'Enter your name...',
    getStarted: 'Get Started',

    // Intro View
    unravel: 'Unravel the ancient scripts of our ancestors.',
    journey: 'A journey into the heart of Baybayin.',
    continue: 'Continue',

    // Lesson View
    exit: 'Exit',
    next: 'Next',
    finish: 'Finish',
    check: 'Check',
    quiz: 'Quiz',
    correct: 'Correct!',
    wrong: 'Wrong!',
    lessonComplete: 'Lesson Complete!',
    youEarned: 'You earned',
    points: 'points',

    // Lessons
    l1: 'The Three Vowels',
    l2: 'Vowel Basics Quiz',
    l3: 'The Throat Sounds',
    l4: 'Consonants Part 1 Quiz',
    l5: 'Soft Sounds',
    l6: 'Consonants Part 2 Quiz',
    l7: 'The Lip Sounds',
    l8: 'Semi-Vowels & Flow',
    l9: 'The Sissing Sounds',
    l10: 'Grand Mastery Test',

    // Notes
    myNotes: 'My Notes',
    communityNotes: 'Community Notes',
    writeNote: 'Write your note...',
    addNote: 'Add',

    // Leaderboard
    globalRanking: 'Global Ranking',
    score: 'Score',
    you: 'You',

    // Default names
    anonymous: 'Anonymous'
  }
};

export type Language = 'fil' | 'en';

export const getTranslation = (lang: Language) => TRANSLATIONS[lang] || TRANSLATIONS.fil;
