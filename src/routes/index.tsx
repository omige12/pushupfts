import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, Dumbbell, Swords, Medal, TrendingUp, User as UserIcon,
  Flame, ArrowLeft, Timer, Shield, Target, ChevronRight, Home, LayoutDashboard, UserCircle, Star,
  Copy, Check, Search, Zap, Award, Sparkles, Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PushUpCounter } from "@/components/PushUpCounter";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: App,
});

type View = 'dashboard' | 'challenge' | 'select-bot' | 'select-duration' | 'profile' | 'settings' | 'edit-profile' | 'multiplayer' | 'achievements' | 'support' | 'support-chat' | 'history' | 'friend-challenge' | 'ranking' | 'patents-list';

const getPatentInfo = (wins: number, totalPushups: number, record: number, xp: number) => {
  const score = (wins * 10) + (totalPushups / 10) + (record * 2) + (xp / 100);
  
  const patents = [
    { name: "Bronze", min: 0, emoji: "🥉", color: "from-orange-700 to-orange-400", divisions: ["III", "II", "I"] },
    { name: "Prata", min: 1000, emoji: "🥈", color: "from-slate-400 to-slate-200", divisions: ["III", "II", "I"] },
    { name: "Ouro", min: 3000, emoji: "🥇", color: "from-yellow-600 to-yellow-300", divisions: ["III", "II", "I"] },
    { name: "Diamante", min: 7000, emoji: "💎", color: "from-blue-600 to-cyan-300", divisions: ["III", "II", "I"] },
    { name: "Pro", min: 15000, emoji: "🔥", color: "from-red-600 to-orange-500", divisions: ["III", "II", "I"] },
    { name: "Mestre", min: 30000, emoji: "👑", color: "from-purple-600 to-pink-500", divisions: ["III", "II", "I"] },
    { name: "Lendário", min: 60000, emoji: "🌟", color: "from-gold to-white", divisions: ["III", "II", "I"] }
  ];
  
  let currentPatentIndex = 0;
  for (let i = 0; i < patents.length; i++) {
    if (score >= patents[i].min) {
      currentPatentIndex = i;
    } else {
      break;
    }
  }
  
  const currentPatent = patents[currentPatentIndex];
  const nextPatent = patents[currentPatentIndex + 1] || null;
  
  let subRank = "III";
  let nextThreshold = null;
  
  if (nextPatent) {
    const range = nextPatent.min - currentPatent.min;
    const progressWithinPatent = score - currentPatent.min;
    const divisionSize = range / 3;
    
    if (progressWithinPatent >= divisionSize * 2) {
      subRank = "I";
      nextThreshold = nextPatent.min;
    } else if (progressWithinPatent >= divisionSize) {
      subRank = "II";
      nextThreshold = currentPatent.min + (divisionSize * 2);
    } else {
      subRank = "III";
      nextThreshold = currentPatent.min + divisionSize;
    }
  } else {
    // Max level (Lendário I) logic
    const divisionSize = 10000; // Arbitrary for Lendário
    const progressAboveMin = score - currentPatent.min;
    if (progressAboveMin >= divisionSize * 2) subRank = "I";
    else if (progressAboveMin >= divisionSize) subRank = "II";
    else subRank = "III";
    nextThreshold = null;
  }

  return {
    name: currentPatent.name,
    subRank,
    emoji: currentPatent.emoji,
    score,
    nextThreshold,
    color: currentPatent.color
  };
};

const getPatentEmoji = (patent: string) => {
  switch (patent) {
    case "Bronze": return "🥉";
    case "Prata": return "🥈";
    case "Ouro": return "🥇";
    case "Diamante": return "💎";
    case "Pro": return "🔥";
    case "Mestre": return "👑";
    case "Lendário": return "🌟";
    default: return "🥉";
  }
};


const BOTS = [
  { 
    id: '1', 
    name: 'Iniciante', 
    avatar: '/__l5e/assets-v1/38600428-3d1e-452a-a930-5df3237659ce/bot1.jpg', 
    color: 'bg-green-500', 
    level: 1, 
    difficulty: 'Fácil', 
    avgPushups: 20,
    league: 'Bronze',
    stats: { strength: 25, stamina: 20, speed: 25 },
    record: 25,
    pushupRate: 0.35 // Increased from 0.12
  },
  { 
    id: '2', 
    name: 'Determinado', 
    avatar: '/__l5e/assets-v1/f7a3c87a-4217-408f-9f48-c3622417f6b3/bot2.jpg', 
    color: 'bg-green-600', 
    level: 2, 
    difficulty: 'Normal', 
    avgPushups: 40,
    league: 'Bronze',
    stats: { strength: 40, stamina: 35, speed: 40 },
    record: 45,
    pushupRate: 0.65 // Increased from 0.25
  },
  { 
    id: '3', 
    name: 'Guerreiro', 
    avatar: '/__l5e/assets-v1/fefd13a2-e94d-4c4e-8905-1e643f4ba559/bot3.jpg', 
    color: 'bg-yellow-500', 
    level: 3, 
    difficulty: 'Médio', 
    avgPushups: 65,
    league: 'Prata',
    stats: { strength: 65, stamina: 60, speed: 60 },
    record: 75,
    pushupRate: 1.15 // Increased from 0.45
  },
  { 
    id: '4', 
    name: 'Máquina', 
    avatar: '/__l5e/assets-v1/de17b012-30cb-48de-98d8-a7244435b40d/bot4.jpg', 
    color: 'bg-orange-600', 
    level: 4, 
    difficulty: 'Difícil', 
    avgPushups: 100,
    league: 'Prata',
    stats: { strength: 85, stamina: 80, speed: 85 },
    record: 120,
    pushupRate: 1.85 // Increased from 0.75
  },
  { 
    id: '5', 
    name: 'David Goggins "Lendário"', 
    avatar: '/__l5e/assets-v1/f377642d-ef7d-403a-97da-018c2f682720/bot5.jpg', 
    color: 'bg-yellow-400', 
    level: 5, 
    difficulty: 'Lendário', 
    avgPushups: 350,
    league: 'Ouro',
    stats: { strength: 100, stamina: 100, speed: 100 },
    record: 450,
    pushupRate: 2.85 // Increased from 1.5
  },
];

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedBot, setSelectedBot] = useState<typeof BOTS[0] | null>(null);
  const [duration, setDuration] = useState(30);
  const [levelUpData, setLevelUpData] = useState<{old: string, new: string} | null>(null);
  const [user, setUser] = useState({
    id: "PUSH-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
    name: "GUERREIRO ALPHA",
    age: 25,
    weight: 75,
    height: 175,
    goal: "Ganhar força",
    level: 1,
    patent: "Bronze",
    subRank: "III",
    xp: 350,
    maxXp: 500,
    wins: 87,
    losses: 23,
    record: 54,
    totalPushups: 10450,
    streak: 12,
    avatar: null,
    frame: "basic",
    achievements: ["1", "2"],
    history: [
      { id: 'h1', opp: "Guerreiro", res: "Vitória", score: "42-39", xp: "+150", date: '2026-08-01' },
      { id: 'h2', opp: "Determinado", res: "Vitória", score: "38-30", xp: "+120", date: '2026-07-28' },
      { id: 'h3', opp: "David Goggins \"Lendário\"", res: "Derrota", score: "45-82", xp: "+45", date: '2026-07-25' },
    ]
  });

  const updateStats = (won: boolean, pushups: number, xpGained: number, botName: string, botPushups: number) => {
    setUser(prev => {
      const newRecord = Math.max(prev.record, pushups);
      const totalPushups = prev.totalPushups + pushups;
      const wins = won ? prev.wins + 1 : prev.wins;
      const newXpTotal = (prev.wins * 100) + (prev.totalPushups) + xpGained; // Arbitrary total XP for patent calculation
      
      const oldPatentData = getPatentInfo(prev.wins, prev.totalPushups, prev.record, prev.xp);
      const newPatentData = getPatentInfo(wins, totalPushups, newRecord, prev.xp + xpGained);

      if (newPatentData.name !== oldPatentData.name || newPatentData.subRank !== oldPatentData.subRank) {
        if (newPatentData.score > oldPatentData.score) {
          setLevelUpData({ 
            old: `${oldPatentData.name} ${oldPatentData.subRank}`, 
            new: `${newPatentData.name} ${newPatentData.subRank}` 
          });
          confetti({ 
            particleCount: 200, 
            spread: 70, 
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FFFFFF', '#60A5FA']
          });
        }
      }

      const newMatch = {
        id: Math.random().toString(36).substr(2, 9),
        opp: botName,
        res: won ? "Vitória" : "Derrota",
        score: `${pushups}-${botPushups}`,
        xp: `+${xpGained}`,
        date: new Date().toISOString().split('T')[0]
      };

      let newXp = prev.xp + xpGained;
      let newLevel = prev.level;
      let nextMaxXp = prev.maxXp;
      
      while (newXp >= nextMaxXp) {
        newXp -= nextMaxXp;
        newLevel += 1;
        nextMaxXp = Math.floor(nextMaxXp * 1.2);
      }
      
      return {
        ...prev,
        wins: wins,
        losses: !won ? prev.losses + 1 : prev.losses,
        record: newRecord,
        totalPushups: totalPushups,
        xp: newXp,
        level: newLevel,
        maxXp: nextMaxXp,
        patent: newPatentData.name,
        subRank: newPatentData.subRank,
        history: [newMatch, ...prev.history].slice(0, 15)
      };
    });
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard setView={setView} user={user} setSelectedBot={setSelectedBot} />;
      case 'select-bot': return <SelectBot setView={setView} onSelect={(b) => { setSelectedBot(b); setView('select-duration'); }} />;
      case 'select-duration': return <SelectDuration setView={setView} onSelect={(d) => { setDuration(d); setView('challenge'); }} selectedBot={selectedBot} />;
      case 'challenge': return <Challenge bot={selectedBot} duration={duration} user={user} onExit={() => { setView('dashboard'); setSelectedBot(null); }} onComplete={updateStats} />;
      case 'profile': return <Profile setView={setView} user={user} setUser={setUser} />;
      case 'settings': return <Profile setView={setView} user={user} setUser={setUser} initialEditing={true} />;
      case 'edit-profile': return <Profile setView={setView} user={user} setUser={setUser} initialEditing={true} />;
      case 'multiplayer': return <Multiplayer setView={setView} user={user} onSelectBot={() => setView('select-bot')} />;
      case 'achievements': return <Achievements setView={setView} user={user} />;
      case 'support': return <Support setView={setView} />;
      case 'support-chat': return <SupportChat setView={setView} />;
      case 'history': return <FullHistory setView={setView} user={user} />;
      case 'friend-challenge': return <FriendChallenge setView={setView} user={user} />;
      case 'ranking': return <Ranking setView={setView} user={user} />;
      case 'patents-list': return <PatentsList setView={setView} user={user} />;
      default: return <Dashboard setView={setView} user={user} setSelectedBot={setSelectedBot} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>

      <AnimatePresence>
        {levelUpData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
            onClick={() => setLevelUpData(null)}
          >
            <div className="text-center space-y-6">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Trophy className="w-32 h-32 text-gold mx-auto drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase">🎉 NOVA PATENTE!</h2>
                <p className="text-muted-foreground font-bold tracking-widest uppercase">VOCÊ EVOLUIU NA ARENA</p>
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center opacity-50">
                  <p className="text-[10px] font-black mb-1 uppercase tracking-widest">Anterior</p>
                  <p className="text-xl font-black text-white italic">{levelUpData.old}</p>
                </div>
                <ChevronRight className="w-8 h-8 text-primary" />
                <div className="text-center">
                  <p className="text-[10px] font-black mb-1 uppercase tracking-widest text-primary">Atual</p>
                  <p className="text-3xl font-black text-gold italic drop-shadow-sm">{levelUpData.new}</p>
                </div>
              </div>
              <Button className="game-button bg-primary w-full py-8 text-xl italic uppercase">CONTINUAR JORNADA</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 w-full bg-card border-t border-border flex justify-around items-center p-3 z-50">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${view === 'dashboard' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Início</span>
        </button>
        <button onClick={() => setView('achievements')} className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${view === 'achievements' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Medal className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Conquistas</span>
        </button>
        <button onClick={() => setView('multiplayer')} className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${view === 'multiplayer' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Swords className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Batalha</span>
        </button>
        <button onClick={() => setView('ranking')} className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${view === 'ranking' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Ranking</span>
        </button>
        <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${view === 'profile' || view === 'settings' || view === 'edit-profile' ? 'text-primary' : 'text-muted-foreground'}`}>
          <UserCircle className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-tighter">Perfil</span>
        </button>
      </nav>
    </div>
  );
}


function Dashboard({ setView, user, setSelectedBot }: { setView: (v: View) => void, user: any, setSelectedBot: (b: any) => void }) {
  const stats = user;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-gold to-orange-500 rounded-2xl border-2 border-white/20 shadow-lg shadow-gold/10 overflow-hidden">
            {stats.avatar ? (
              <img src={stats.avatar} className="w-full h-full object-cover" alt={stats.name} />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-black text-xl italic text-white tracking-tighter leading-none mb-1">{stats.name.toUpperCase()}</h1>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-purple-evolve text-[8px] h-4 font-black italic tracking-widest px-1.5 border-none">{getPatentEmoji(stats.patent)} {stats.patent.toUpperCase()}</Badge>
              <div className="flex items-center gap-0.5 text-gold">
                <Flame className="w-3 h-3 fill-gold" />
                <span className="text-[10px] font-black">{stats.streak}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div 
        className="glass-panel p-5 relative overflow-hidden group border-primary/20 cursor-pointer active:scale-[0.98] transition-all"
        onClick={() => setView('patents-list')}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black italic text-muted-foreground uppercase tracking-widest">{getPatentEmoji(stats.patent)} {stats.patent} {stats.subRank}</span>
            <span className="text-[8px] font-black text-primary/80 uppercase tracking-tighter">Próxima Patente: {getPatentInfo(stats.wins + 50, stats.totalPushups, stats.record, stats.xp).name}</span>
          </div>
          <span className="text-[10px] font-black italic text-white tracking-tighter">{stats.xp} / {stats.maxXp} XP</span>
        </div>
        <Progress value={(stats.xp / stats.maxXp) * 100} className="h-2.5 bg-white/5" />
        <div className="mt-3 flex justify-between items-center">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider italic">
            Faltam {stats.maxXp - stats.xp} XP para subir de nível
          </p>
          <div className="flex items-center gap-1">
             <Star className="w-3 h-3 text-gold fill-gold" />
             <span className="text-[8px] font-black text-gold uppercase tracking-widest">Ver Trilhas</span>
          </div>
        </div>
      </div>



      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="game-button bg-primary/20 h-28 flex flex-col gap-2 border-white/5 active:scale-95 transition-all shadow-[0_6px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none" 
          onClick={() => setView('profile')}
        >
          <UserCircle className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">👤 Perfil</span>
        </Button>
        <Button 
          className="game-button bg-primary/20 h-28 flex flex-col gap-2 border-white/5 active:scale-95 transition-all shadow-[0_6px_0_0_rgba(0,0,0,0.3)] hover:shadow-[0_4px_0_0_rgba(0,0,0,0.3)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none" 
          onClick={() => setView('achievements')}
        >
          <Medal className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">🎖️ Conquistas</span>
        </Button>
      </div>

      <div className="space-y-4 pt-2">
        <Button 
          className="game-button bg-energy-red w-full h-36 relative overflow-hidden group shadow-[0_10px_0_0_rgba(185,28,28,0.5)] active:scale-95 transition-all active:translate-y-[10px] active:shadow-none" 
          onClick={() => setView('multiplayer')}
        >
          <div className="relative flex flex-col items-center gap-2">
            <Swords className="w-12 h-12 group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
            <span className="text-3xl tracking-tighter italic font-black uppercase text-shadow-lg">⚔️ Multijogador</span>
          </div>
          <div className="absolute top-0 right-0 p-2">
            <Badge className="bg-yellow-400 text-black font-black italic text-[8px] animate-pulse">RANKED</Badge>
          </div>
        </Button>

        <Button 
          className="game-button bg-white/10 w-full h-20 flex gap-4 border-white/10 shadow-[0_6px_0_0_rgba(0,0,0,0.2)] active:scale-95 active:translate-y-[6px] active:shadow-none" 
          onClick={() => { setSelectedBot(null); setView('select-duration'); }}
        >
          <Dumbbell className="w-8 h-8 text-white opacity-80" />
          <span className="text-xl tracking-tighter italic font-black uppercase">💪 Treinar</span>
        </Button>
      </div>



    </motion.div>
  );
}

function SelectBot({ setView, onSelect }: { setView: (v: View) => void, onSelect: (b: typeof BOTS[0]) => void }) {
  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView('dashboard')}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter">OPONENTES</h2>
      </div>

      <div className="space-y-4">
        {BOTS.map(bot => (
          <Card key={bot.id} className="glass-panel p-5 flex items-center justify-between cursor-pointer hover:bg-white/10 hover:scale-[1.02] transition-all border-white/5 group overflow-hidden" onClick={() => onSelect(bot)}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-secondary border-2 border-white/10 overflow-hidden relative shadow-lg group-hover:rotate-2 transition-transform">
                <img src={bot.avatar} className="w-full h-full object-cover" alt={bot.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                  <span className="text-[8px] font-black text-white uppercase tracking-tighter">Ver Perfil</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-black text-lg italic text-white tracking-tight leading-tight">{bot.name.toUpperCase()}</p>
                  <Badge className="bg-primary/20 text-[8px] h-4 px-1.5 border-none font-black italic">LVL {bot.level}</Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] font-black h-4 px-1 opacity-60 uppercase border-white/10">{bot.difficulty}</Badge>
                    <span className="text-[9px] font-black text-gold italic uppercase tracking-widest">{bot.league}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-white/40" />
                      <span className="text-[10px] font-black text-muted-foreground italic uppercase">{bot.record} Recorde</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {Object.entries(bot.stats).map(([key, val]: [string, any]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[6px] font-black text-white/30 uppercase tracking-tighter leading-none">{key === 'strength' ? 'FOR' : key === 'stamina' ? 'RES' : 'VEL'}</span>
                          <div className="h-0.5 w-6 bg-white/5 rounded-full overflow-hidden mt-0.5">
                            <div className="h-full bg-primary/60" style={{ width: `${val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform border border-white/5">
              <ChevronRight className="w-6 h-6" />
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

function SelectDuration({ setView, onSelect, selectedBot }: { setView: (v: View) => void, onSelect: (d: number) => void, selectedBot: any }) {
  const durations = [
    { label: '30 seg', value: 30 },
    { label: '1 min', value: 60 },
    { label: '2 min', value: 120 },
    { label: '3 min', value: 180 },
    { label: '5 min', value: 300 },
  ];

  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView(selectedBot ? 'select-bot' : 'dashboard')}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter">DURAÇÃO</h2>
      </div>

      <div className="grid gap-4">
        {durations.map(d => (
          <Button 
            key={d.value} 
            className="game-button bg-white/5 border border-white/10 h-20 text-xl tracking-tighter italic"
            onClick={() => onSelect(d.value)}
          >
            {d.label.toUpperCase()}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}


function Challenge({ bot, duration, user, onExit, onComplete }: { bot: any, duration: number, user: any, onExit: () => void, onComplete: (won: boolean, pushups: number, xpGained: number, botName: string, botPushups: number) => void }) {
  const [playerPushups, setPlayerPushups] = useState(0);
  const [botPushups, setBotPushups] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);

  const handlePlayerCount = useCallback((count: number) => {
    setPlayerPushups(count);
  }, []);

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('playing');
      }
    }

    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
        if (bot) {
          // New difficulty logic based on pushupRate
          // pushupRate is the chance to add a pushup every second.
          // For David Goggins (1.5), it means 1 guaranteed pushup + 50% chance for a second one.
          const rate = bot.pushupRate || 0.1;
          const guaranteed = Math.floor(rate);
          const chance = rate - guaranteed;
          
          let increment = guaranteed;
          if (Math.random() < chance) {
            increment += 1;
          }
          
          if (increment > 0) {
            setBotPushups(b => b + increment);
          }
        }
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('finished');
      if (playerPushups >= botPushups) {
        confetti({ 
          particleCount: 250, 
          spread: 80, 
          origin: { y: 0.6 },
          colors: ['#FFD700', '#60A5FA', '#F43F5E']
        });
        onComplete(true, playerPushups, 150 + playerPushups, bot.name, botPushups);
      } else {
        onComplete(false, playerPushups, 45 + playerPushups, bot.name, botPushups);
      }
    }
  }, [timeLeft, bot, gameState, countdown, playerPushups, botPushups, onComplete]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 flex flex-col h-[calc(100vh-80px)]">
      <div className="flex justify-between items-center mb-6 relative">
        <div className="flex-1 glass-panel p-3 border-r-0 rounded-r-none border-primary/30 bg-primary/10 relative overflow-hidden">
          <AnimatePresence>
            <motion.div 
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0, 0.2, 0] }}
              key={playerPushups}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-primary pointer-events-none"
            />
          </AnimatePresence>
          <p className="text-[10px] font-black italic text-primary uppercase tracking-widest">{user.name} ({user.id})</p>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-[8px] h-3 px-1 border-none">{getPatentEmoji(user.patent)} {user.patent}</Badge>
            <motion.span 
              key={playerPushups}
              initial={{ scale: 0.8, y: 5 }}
              animate={{ scale: 1, y: 0 }}
              className="text-3xl font-black text-white italic"
            >
              {playerPushups}
            </motion.span>
            <span className="text-xs font-black text-white/40">💪</span>
            {playerPushups > 0 && playerPushups === user.record + 1 && (
              <motion.span 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute -top-1 right-2 text-[8px] font-black text-gold italic bg-black/40 px-1 rounded"
              >
                RECORD!
              </motion.span>
            )}
          </div>
        </div>
        <div className="z-10 bg-card border-4 border-background w-16 h-16 rounded-full flex items-center justify-center -mx-2 shadow-xl overflow-hidden relative">
          <motion.div 
            animate={timeLeft <= 5 ? { scale: [1, 1.1, 1], backgroundColor: ['rgba(0,0,0,0)', 'rgba(244,63,94,0.2)', 'rgba(0,0,0,0)'] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="absolute inset-0"
          />
          <span className={`text-2xl font-black italic tabular-nums relative z-10 ${timeLeft <= 5 ? 'text-energy-red' : 'text-white'}`}>
            {timeLeft}
          </span>
        </div>
        <div className="flex-1 glass-panel p-3 border-l-0 rounded-l-none border-energy-red/30 bg-energy-red/10 text-right relative overflow-hidden">
          <AnimatePresence>
            <motion.div 
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 1.2, 1], opacity: [0, 0.2, 0] }}
              key={botPushups}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-energy-red pointer-events-none"
            />
          </AnimatePresence>
          <div className="flex items-center justify-end gap-2 mb-1">
             <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                <img src={bot?.avatar} className="w-full h-full object-cover" alt="Bot" />
             </div>
             <p className="text-[10px] font-black italic text-energy-red uppercase tracking-widest leading-none">{bot?.name || 'ADVERSÁRIO'}</p>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Badge className="bg-energy-red/20 text-[8px] h-3 px-1 border-none">{bot?.id ? `LVL ${bot.level}` : 'RIVAL'}</Badge>
            <span className="text-xs font-black text-white/40">💪</span>
            <motion.span 
              key={botPushups}
              initial={{ scale: 0.8, y: 5 }}
              animate={{ scale: 1, y: 0 }}
              className="text-3xl font-black text-white italic"
            >
              {botPushups}
            </motion.span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col gap-6">
        <PushUpCounter isActive={gameState === 'playing'} onCount={handlePlayerCount} />
        
        <div className="glass-panel p-4 bg-white/5 border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-10 bg-primary rounded-full" />
            <div>
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Vantagem</p>
              <p className="text-xs font-black text-white italic">
                {playerPushups > botPushups ? `+${playerPushups - botPushups} FLEXÕES` : 
                 botPushups > playerPushups ? `-${botPushups - playerPushups} FLEXÕES` : 'EMPATE'}
              </p>
            </div>
          </div>
          <Timer className="w-6 h-6 text-white/20" />
        </div>
      </div>

      <AnimatePresence>
        {gameState === 'countdown' && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <span className="text-8xl font-black italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
              {countdown === 0 ? "VAI!" : countdown}
            </span>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/90 backdrop-blur-md"
          >
            <div className="glass-panel p-8 w-full max-w-sm text-center space-y-8 border-primary/20">
              <div className="space-y-2">
                <Trophy className={`w-20 h-20 mx-auto ${playerPushups >= botPushups ? 'text-gold' : 'text-muted-foreground opacity-50'}`} />
                <h2 className="text-5xl font-black italic text-white tracking-tighter">
                  {playerPushups >= botPushups ? "VITÓRIA!" : "DERROTA!"}
                </h2>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest italic">
                  RESULTADO FINAL: {playerPushups} vs {botPushups}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Flexões</p>
                  <p className="text-xl font-black text-white">{playerPushups}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Recorde</p>
                  <p className="text-xl font-black text-gold">{user.record}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Média/Min</p>
                  <p className="text-xl font-black text-blue-400">{(playerPushups / (duration / 60)).toFixed(1)}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">XP Total</p>
                  <p className="text-xl font-black text-purple-evolve">+{playerPushups >= botPushups ? 150 + playerPushups : 45 + playerPushups}</p>
                </div>
              </div>

              <Button onClick={onExit} className="game-button bg-primary w-full py-6 text-xl tracking-tighter italic">CONTINUAR</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


function Profile({ setView, user, setUser, initialEditing = false }: { setView: (v: View) => void, user: any, setUser: any, initialEditing?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  useEffect(() => {
    if (initialEditing) {
      setEditing(true);
    }
  }, [initialEditing]);

  const stats = user;
  
  const handleSave = () => {
    setUser(formData);
    setEditing(false);
    toast.success("Perfil atualizado com sucesso", {
      icon: "✅",
      className: "font-black italic text-xs uppercase tracking-widest bg-card border-green-500/50 text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]"
    });
  };

  if (editing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setEditing(false)}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="text-3xl font-black italic text-white tracking-tighter">EDITAR PERFIL</h2>
        </div>

        <div className="glass-panel p-6 space-y-6">
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="relative group cursor-pointer" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (re) => {
                    setFormData({ ...formData, avatar: re.target?.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}>
              <div className="w-32 h-32 bg-secondary rounded-full border-4 border-gold flex items-center justify-center overflow-hidden shadow-2xl">
                {formData.avatar ? (
                  <img src={formData.avatar} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <UserIcon className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Alterar Foto</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nome de Atleta</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black italic text-white focus:outline-none focus:border-primary transition-all text-lg uppercase tracking-tight"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                placeholder="EX: GUERREIRO"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 text-center block">Idade</label>
                <input 
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black italic text-white focus:outline-none focus:border-primary transition-all text-center"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 text-center block">Peso (kg)</label>
                <input 
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black italic text-white focus:outline-none focus:border-primary transition-all text-center"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 text-center block">Altura (cm)</label>
                <input 
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black italic text-white focus:outline-none focus:border-primary transition-all text-center"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Objetivo Fitness</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black text-white focus:outline-none focus:border-primary appearance-none h-[58px] italic"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                >
                  <option value="Ganhar força" className="bg-[#1A1F2C] text-white">GANHAR FORÇA</option>
                  <option value="Resistência" className="bg-[#1A1F2C] text-white">RESISTÊNCIA</option>
                  <option value="Hipertrofia" className="bg-[#1A1F2C] text-white">HIPERTROFIA</option>
                  <option value="Perda de peso" className="bg-[#1A1F2C] text-white">PERDA DE PESO</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="game-button bg-primary w-full py-8 mt-4 text-xl italic uppercase tracking-tighter">
            Salvar Alterações
          </Button>
        </div>

      </motion.div>
    );
  }

  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView('dashboard')}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter">PERFIL</h2>
      </div>

      <div className="glass-panel p-8 flex flex-col items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-purple-evolve to-energy-red" />
        
        <div 
          className="relative cursor-pointer active:scale-95 transition-transform"
          onClick={() => setEditing(true)}
        >
          <div className="w-32 h-32 bg-secondary rounded-full border-4 border-gold shadow-[0_0_20px_rgba(255,215,0,0.3)] group-hover:scale-105 transition-transform duration-500 flex items-center justify-center overflow-hidden relative">
             {stats.avatar ? (
               <img src={stats.avatar} className="w-full h-full object-cover" alt={stats.name} />
             ) : (
               <UserIcon className="w-16 h-16 text-muted-foreground" />
             )}
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
               <Pencil className="w-8 h-8 text-white" />
             </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-purple-evolve p-2 rounded-full border-2 border-background shadow-lg">
            <Star className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-black text-2xl text-white tracking-tight">{stats.name.toUpperCase()}</h3>
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg cursor-pointer hover:bg-white/10 transition-colors" onClick={copyId}>
              <span className="text-[10px] font-mono text-muted-foreground">{stats.id}</span>
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
            </div>
            <Badge 
              className="bg-gold/20 text-gold border-gold/30 px-3 py-0.5 font-bold cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setView('patents-list')}
            >
              {getPatentEmoji(stats.patent)} {stats.patent.toUpperCase()}
            </Badge>
          </div>
          <div className="flex justify-center mt-1">
             <Badge className="bg-white/10 text-white/60 border-white/20 px-3 py-0.5 font-bold">{stats.weight}KG • {stats.age} ANOS • {stats.height}CM</Badge>
          </div>
        </div>


        <div 
          className="w-full space-y-2 cursor-pointer active:scale-[0.98] transition-all"
          onClick={() => setView('patents-list')}
        >
          <div className="flex justify-between text-xs font-black italic text-muted-foreground uppercase tracking-widest">
            <span>Nível {stats.level}</span>
            <span>{stats.xp} / {stats.maxXp} XP</span>
          </div>
          <Progress value={(stats.xp / stats.maxXp) * 100} className="h-3 bg-white/5" />
          <div className="flex justify-center">
             <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Toque para ver patentes</span>
          </div>
        </div>




        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 hover:bg-white/10 transition-colors">
            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Vitórias</p>
            <p className="text-xl font-black text-white">{stats.wins}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 hover:bg-white/10 transition-colors">
            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Recorde</p>
            <p className="text-xl font-black text-gold">{stats.record}</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl text-center border border-white/5 hover:bg-white/10 transition-colors">
            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Total</p>
            <p className="text-xl font-black text-purple-evolve">{stats.totalPushups}</p>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 gap-4">
        <Button 
          variant="ghost" 
          className="glass-panel p-6 h-auto flex justify-between items-center border-white/5 hover:bg-white/10"
          onClick={() => setView('history')}
        >
          <div className="flex items-center gap-4">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="font-black text-white italic">HISTÓRICO</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Partidas anteriores</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/20" />
        </Button>

        <Button 
          variant="ghost" 
          className="glass-panel p-6 h-auto flex justify-between items-center border-white/5 hover:bg-white/10"
          onClick={() => setView('support')}
        >
          <div className="flex items-center gap-4">
            <Shield className="w-6 h-6 text-green-400" />
            <div className="text-left">
              <p className="font-black text-white italic">SUPORTE</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Ajuda e atendimento</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/20" />
        </Button>

      </div>
    </motion.div>
  );
}

function FullHistory({ setView, user }: { setView: (v: View) => void, user: any }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView('profile')}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter">HISTÓRICO</h2>
      </div>

      <div className="space-y-4">
        {user.history.map((match: any) => (
          <div key={match.id} className="glass-panel p-5 flex items-center justify-between border-white/5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg border-2 border-white/20 overflow-hidden ${match.res === 'Vitória' ? 'bg-green-500' : 'bg-energy-red'}`}>
                {BOTS.find(b => b.name === match.opp || b.name + ' "Lendário"' === match.opp) ? (
                  <img src={BOTS.find(b => b.name === match.opp || b.name + ' "Lendário"' === match.opp)?.avatar} className="w-full h-full object-cover" alt="Bot" />
                ) : (
                  match.opp[0]
                )}
              </div>
              <div>
                <p className="font-black text-lg italic text-white tracking-tight">{match.opp.toUpperCase()}</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{match.score} • {match.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-black italic ${match.res === 'Vitória' ? 'text-green-500' : 'text-energy-red'}`}>{match.res.toUpperCase()}</p>
              <p className="text-[10px] text-gold font-black italic">{match.xp} XP</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Support({ setView }: { setView: (v: View) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView('profile')}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter">SUPORTE</h2>
      </div>

      <div className="grid gap-4">
        <div className="glass-panel p-8 text-center space-y-4 border-primary/20">
          <Shield className="w-16 h-16 text-primary mx-auto opacity-50" />
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Como podemos ajudar?</h3>
          <p className="text-sm text-muted-foreground font-medium">Nossa equipe e IA estão prontas para resolver suas dúvidas.</p>
        </div>

        <Button 
          className="game-button bg-white/5 border border-white/10 h-24 flex items-center justify-between px-8"
          onClick={() => setView('support-chat')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-lg tracking-tighter italic">CHAT 24 HORAS</p>
              <p className="text-[8px] opacity-60 tracking-widest font-black uppercase">Atendimento por IA</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/20" />
        </Button>

        <a 
          href="mailto:suporte@pushuparena.com"
          className="game-button bg-white/5 border border-white/10 h-24 flex items-center justify-between px-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-left">
              <p className="text-lg tracking-tighter italic">ENVIAR E-MAIL</p>
              <p className="text-[8px] opacity-60 tracking-widest font-black uppercase">suporte@pushuparena.com</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/20" />
        </a>
      </div>
    </motion.div>
  );
}

function SupportChat({ setView }: { setView: (v: View) => void }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Olá! Sou seu assistente do PushUp Arena. Como posso ajudar você hoje com duelos, treinos ou sua conta?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages([...messages, { role: 'user', text: userMsg }]);
    setInput('');

    // AI Logic (Advanced response system for the 24h AI Support)
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let response = "";
      
      const knowledge = {
        app: "O PushUp Arena é um aplicativo de competição de flexões com sistema de patentes, bots desafiadores e modo multiplayer em tempo real.",
        treino: "No modo treino, você pratica sozinho com ajuda da nossa IA que analisa sua postura e conta cada repetição. Ideal para aquecer!",
        duelo: "As competições (duelos) permitem que você enfrente bots ou outros jogadores. Você escolhe a duração e quem fizer mais flexões vence.",
        conta: "Sua conta armazena todo seu progresso, recordes e conquistas. Você pode personalizar seu perfil tocando na sua foto.",
        patentes: "Nosso sistema competitivo vai de Bronze a Lendário, cada uma com 3 divisões (I, II, III). Acumule Score para subir!",
        xp: "Você ganha XP ao completar treinos e vencer duelos. O XP aumenta seu nível de jogador e libera recompensas.",
        conquistas: "As conquistas são desafios específicos que dam bônus de XP e molduras exclusivas para seu perfil.",
        bots: "Temos 5 bots: Iniciante, Determinado, Guerreiro, Máquina e o lendário David Goggins. Cada um tem um ritmo de flexões diferente.",
        multiplayer: "No multiplayer, você pode buscar jogadores pelo ID único (ex: PUSH-XXXX) ou aceitar desafios rápidos do servidor.",
        perfil: "Para editar seu perfil, basta tocar na sua foto na tela de Perfil. Lá você altera nome, idade, peso e altura.",
        ajuda: "Estou aqui para ajudar 24 horas! Posso tirar dúvidas sobre treinos, patentes, bots ou qualquer função do app.",
      };

      if (lower.includes('duelo') || lower.includes('combate') || lower.includes('vencer')) response = knowledge.duelo;
      else if (lower.includes('treino') || lower.includes('praticar') || lower.includes('exercício')) response = knowledge.treino;
      else if (lower.includes('patente') || lower.includes('liga') || lower.includes('rank') || lower.includes('bronze') || lower.includes('lenda')) response = knowledge.patentes;
      else if (lower.includes('bot') || lower.includes('goggins') || lower.includes('máquina')) response = knowledge.bots;
      else if (lower.includes('ranking') || lower.includes('pontos') || lower.includes('score')) response = "O Score é calculado com base em vitórias, total de flexões e recordes. Use isso para subir no Ranking Brasil!";
      else if (lower.includes('perfil') || lower.includes('mudar') || lower.includes('foto') || lower.includes('nome') || lower.includes('editar')) response = knowledge.perfil;
      else if (lower.includes('xp') || lower.includes('nível') || lower.includes('level')) response = knowledge.xp;
      else if (lower.includes('conquista') || lower.includes('medalha') || lower.includes('troféu')) response = knowledge.conquistas;
      else if (lower.includes('multiplayer') || lower.includes('amigo') || lower.includes('desafiar')) response = knowledge.multiplayer;
      else if (lower.includes('aplicativo') || lower.includes('app') || lower.includes('pushup arena')) response = knowledge.app;
      else if (lower.includes('oi') || lower.includes('olá') || lower.includes('bom dia') || lower.includes('ajuda')) response = "Olá! Como posso ajudar você hoje na Arena? Pergunte sobre treinos, patentes ou como melhorar seu desempenho!";
      else {
        response = "Essa é uma ótima pergunta! No momento, só consigo ajudar com informações sobre o PushUp Arena (treinos, patentes, bots, perfil, etc). Se precisar de algo técnico ou humano, nossa equipe de suporte via e-mail pode ajudar!";
      }

      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 600);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-80px)] p-6 gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView('support')}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 relative">
            <Shield className="w-6 h-6 text-primary" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div>
            <h2 className="text-xl font-black italic text-white tracking-tighter leading-none mb-1">ARENA AI</h2>
            <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">ONLINE AGORA</p>
          </div>
        </div>
      </div>

      <div className="flex-1 glass-panel p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
              msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 font-bold text-white focus:outline-none focus:border-primary"
          placeholder="Como subir de liga?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} className="game-button bg-primary px-6 h-[58px]">
          <Target className="w-6 h-6 rotate-90" />
        </Button>
      </div>
    </motion.div>
  );
}

function Multiplayer({ setView, user, onSelectBot }: { setView: (v: View) => void, user: any, onSelectBot: () => void }) {
  const [searchId, setSearchId] = useState('');
  const [foundPlayer, setFoundPlayer] = useState<any>(null);
  const [challengeReceived, setChallengeReceived] = useState<string | null>(null);

  const handleSearch = () => {
    if (searchId.trim().toUpperCase() === 'PUSH-DEMO') {
      setFoundPlayer({
        id: 'PUSH-DEMO',
        name: 'RICARDO BRUTO',
        level: 18,
        patent: 'Ouro',
        record: 85,
        avatar: null
      });
    } else {
      setFoundPlayer(null);
    }
  };

  const sendChallenge = () => {
    alert(`Desafio enviado para ${foundPlayer.name}!`);
    // Demo: auto-receive challenge back after 2s
    setTimeout(() => {
      setChallengeReceived(foundPlayer.name);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic text-white tracking-tighter">MULTIJOGADOR</h2>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5" onClick={() => setView('dashboard')}><ArrowLeft className="w-5 h-5" /></Button>
      </div>

      <div className="flex flex-col gap-4 items-stretch">
        <div className="glass-panel p-6 space-y-4 border-white/5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center flex items-center justify-center gap-2">
            <Search className="w-3 h-3" /> PROCURAR JOGADOR POR ID
          </p>
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm text-white focus:outline-none focus:border-primary text-center tracking-widest"
              placeholder="PUSH-XXXX"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            />
            <Button onClick={handleSearch} className="game-button bg-primary h-auto px-6"><Search className="w-5 h-5" /></Button>
          </div>
        </div>

        {foundPlayer && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 border-primary/30 bg-primary/5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center border-2 border-primary/30 shadow-lg">
                <UserIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-black text-xl italic text-white tracking-tight leading-none mb-1">{foundPlayer.name}</p>
                <div className="flex items-center gap-2">
                   <Badge className="bg-primary/20 text-[8px] h-4 px-1.5 border-none font-mono">{foundPlayer.id}</Badge>
                   <Badge className="bg-gold/20 text-gold border-none text-[8px] h-4 px-1.5 uppercase font-black italic">
                     {getPatentEmoji(foundPlayer.patent)} {foundPlayer.patent.toUpperCase()}
                   </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 p-3 rounded-xl text-center border border-white/5">
                  <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">Nível</p>
                  <p className="text-lg font-black text-white italic">{foundPlayer.level}</p>
               </div>
               <div className="bg-white/5 p-3 rounded-xl text-center border border-white/5">
                  <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest mb-1">Recorde</p>
                  <p className="text-lg font-black text-gold italic">{foundPlayer.record}</p>
               </div>
            </div>
            <Button className="game-button bg-primary w-full py-4 text-sm uppercase italic" onClick={sendChallenge}>Desafiar Agora</Button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <Button 
            className="game-button bg-energy-red h-28 flex flex-col items-center justify-center relative overflow-hidden group border-none"
            onClick={onSelectBot}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Swords className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xl tracking-tighter italic uppercase leading-none">Desafio Rápido</span>
            <p className="text-[9px] font-black opacity-60 tracking-widest uppercase mt-1">Bots Matchmaking</p>
          </Button>

          <Button 
            className="game-button bg-blue-500/10 border-2 border-blue-500/20 h-28 flex flex-col items-center justify-center group shadow-none"
            onClick={() => setView('friend-challenge')}
          >
            <UserIcon className="w-8 h-8 mb-1 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-xl tracking-tighter italic uppercase leading-none text-blue-400">Jogar com Amigos</span>
            <p className="text-[9px] font-black text-blue-400/60 tracking-widest uppercase mt-1">Convidar via ID</p>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {challengeReceived && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-24 left-6 right-6 z-50 glass-panel p-6 border-gold/50 bg-gold/10 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
            <h3 className="text-lg font-black italic text-white tracking-tighter mb-4">VOCÊ RECEBEU UM DESAFIO!</h3>
            <p className="text-sm font-medium text-white/80 mb-6 uppercase tracking-wide">
              <span className="text-gold">{challengeReceived}</span> quer duelar com você!
            </p>
            <div className="flex gap-3">
              <Button className="game-button bg-green-500 flex-1 py-4" onClick={() => { setView('select-duration'); setChallengeReceived(null); }}>✅ ACEITAR</Button>
              <Button className="game-button bg-energy-red flex-1 py-4" onClick={() => setChallengeReceived(null)}>❌ RECUSAR</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FriendChallenge({ setView, user }: { setView: (v: View) => void, user: any }) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView('multiplayer')}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter">AMIGOS</h2>
      </div>

      <div className="glass-panel p-8 text-center space-y-6 border-blue-500/20">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-blue-500/30">
          <UserIcon className="w-10 h-10 text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">Convidar Amigos</h3>
          <p className="text-xs text-muted-foreground font-medium px-4">Compartilhe seu ID para competir contra quem você conhece.</p>
        </div>
        
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 font-mono text-lg font-black text-white tracking-[0.2em] relative group cursor-pointer" onClick={copyId}>
          {user.id}
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-white" />}
          </div>
        </div>

        <Button className="game-button bg-blue-500 w-full py-6 text-lg tracking-tighter italic uppercase">
          Compartilhar Link
        </Button>
      </div>
    </motion.div>
  );
}


function Ranking({ setView, user }: { setView: (v: View) => void, user: any }) {
  const [tab, setTab] = useState<'local' | 'friends'>('local');
  
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 pb-24">
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-black italic text-white tracking-tighter">RANKING</h2>
        
        <div className="flex p-1 bg-white/5 rounded-2xl">
          <button 
            onClick={() => setTab('local')}
            className={`flex-1 py-3 text-[10px] font-black italic rounded-xl transition-all ${tab === 'local' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            🇧🇷 BRASIL
          </button>
          <button 
            onClick={() => setTab('friends')}
            className={`flex-1 py-3 text-[10px] font-black italic rounded-xl transition-all ${tab === 'friends' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            👥 AMIGOS
          </button>
        </div>

        <div className="space-y-3">
          {(tab === 'friends' ? [
            { name: "Guerreiro Alpha", count: 10450, avatar: "GA", color: "bg-primary", isUser: true, record: 54, wins: 87, streak: 12, patent: user.patent },
            { name: "Amigo 1", count: 8200, avatar: "A1", color: "bg-secondary", record: 42, wins: 56, streak: 3, patent: "Prata" },
          ] : [
            { name: "Mega Flex", count: 12500, avatar: "MF", color: "bg-gold", record: 120, wins: 342, streak: 45, patent: "Lenda" },
            { name: "Push Master", count: 11200, avatar: "PM", color: "bg-slate-400", record: 98, wins: 287, streak: 32, patent: "Mestre" },
            { name: "Elite Beast", count: 10800, avatar: "EB", color: "bg-orange-600", record: 92, wins: 215, streak: 21, patent: "Pro" },
            { name: "Guerreiro Alpha", count: 10450, avatar: "GA", color: "bg-primary", isUser: true, record: 54, wins: 87, streak: 12, patent: user.patent },
            { name: "Titan X", count: 9800, avatar: "TX", color: "bg-secondary", record: 88, wins: 156, streak: 15, patent: "Diamante" },
          ]).map((player: any, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${player.isUser ? 'bg-primary/20 border-primary/50 scale-[1.02] shadow-[0_0_20px_rgba(96,165,250,0.2)]' : 'bg-white/5 border-white/5'}`}>
              <span className={`w-8 font-black text-lg italic ${i === 0 ? 'text-gold' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                {i + 1}º
              </span>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg ${player.color}`}>
                {player.avatar}
              </div>
              <div className="flex-1">
                <span className="font-black text-white tracking-tight">{getPatentEmoji(player.patent || "Bronze")} {player.name}</span>
                {player.isUser && <Badge className="ml-2 bg-primary text-[8px] h-4 py-0">VOCÊ</Badge>}
                <div className="flex items-center gap-3 text-[7px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                  <div className="flex items-center gap-0.5"><Target className="w-2.5 h-2.5 text-gold" /> {player.record}</div>
                  <div className="flex items-center gap-0.5"><Shield className="w-2.5 h-2.5 text-blue-400" /> {player.wins}W</div>
                  <div className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-energy-red" /> {player.streak}D</div>
                </div>
              </div>
              <div className="text-right">
                <span className="font-black text-white italic">{player.count.toLocaleString()}</span>
                <p className="text-[8px] font-black text-muted-foreground uppercase">pontos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Achievements({ setView, user }: { setView: (v: View) => void, user: any }) {
  const categories = [
    { 
      id: 'treino', 
      label: 'Treino', 
      icon: Dumbbell,
      items: [
        { title: "Primeira Flexão", desc: "Comece sua jornada", req: 1, current: user.totalPushups, reward: "XP +50", icon: Zap },
        { title: "Cem Flexões", desc: "Mostre consistência", req: 100, current: user.totalPushups, reward: "XP +200", icon: Award },
        { title: "Guerreiro Mil", desc: "Nível impressionante", req: 1000, current: user.totalPushups, reward: "Moldura Mil", icon: Shield },
      ]
    },
    { 
      id: 'competição', 
      label: 'Competição', 
      icon: Swords,
      items: [
        { title: "Primeira Vitória", desc: "Vença um duelo", req: 1, current: user.wins, reward: "XP +100", icon: Trophy },
        { title: "Dez Vitórias", desc: "Competidor Nato", req: 10, current: user.wins, reward: "Medalha Bronze", icon: Medal },
        { title: "Cinquenta Vitórias", desc: "Elite da Arena", req: 50, current: user.wins, reward: "Título Mestre", icon: Star },
      ]
    },
    { 
      id: 'evolução', 
      label: 'Evolução', 
      icon: TrendingUp,
      items: [
        { title: "Rank Prata", desc: "Evoluindo sempre", req: 250, current: user.xp, reward: "XP +500", icon: Sparkles },
        { title: "Rank Ouro", desc: "Jogador Experiente", req: 600, current: user.xp, reward: "XP +1000", icon: Flame },
        { title: "Rank Diamante", desc: "Elite do Fitness", req: 1200, current: user.xp, reward: "Moldura Rara", icon: Shield },
      ]
    }
  ];

  const [activeCat, setActiveCat] = useState('treino');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 pb-24 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic text-white tracking-tighter">CONQUISTAS</h2>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5" onClick={() => setView('dashboard')}><ArrowLeft className="w-5 h-5" /></Button>
      </div>
      
      {/* ⭐ Destaques Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-gold fill-gold" />
          <h3 className="text-sm font-black italic tracking-widest text-white uppercase">⭐ Destaques</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Melhor Recorde', val: user.record, sub: 'FLEXÕES', icon: Target, color: 'text-gold' },
            { label: 'Total Flexões', val: user.totalPushups, sub: 'FLEXÕES', icon: Dumbbell, color: 'text-primary' },
            { label: 'Sequência Dias', val: user.streak, sub: 'DIAS 🔥', icon: Flame, color: 'text-energy-red' },
            { label: 'Sequência Vitórias', val: Math.floor(user.wins / 10) + 1, sub: 'VITÓRIAS', icon: Swords, color: 'text-blue-400' },
            { label: 'Melhor Desempenho', val: Math.floor(user.record * 0.9), sub: 'RECENTE', icon: TrendingUp, color: 'text-green-400' },
            { label: 'Última Conquista', val: 'Elite', sub: 'RANK PRO', icon: Medal, color: 'text-purple-evolve' },
          ].map((item, i) => (
            <div key={i} className="glass-panel p-4 border-white/5 flex flex-col items-center gap-1 text-center">
              <item.icon className={`w-5 h-5 ${item.color} mb-1`} />
              <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">{item.label}</p>
              <span className="text-xl font-black italic text-white leading-none">{item.val}</span>
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map(cat => (
          <Button 
            key={cat.id} 
            onClick={() => setActiveCat(cat.id)}
            className={`game-button h-12 px-6 flex items-center gap-2 border-none shadow-none text-xs ${activeCat === cat.id ? 'bg-primary' : 'bg-white/5 opacity-50'}`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {categories.find(c => c.id === activeCat)?.items.map((ach, i) => {
          const isCompleted = ach.current >= ach.req;
          const progress = Math.min((ach.current / ach.req) * 100, 100);
          
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-panel p-5 border-white/5 relative overflow-hidden group ${!isCompleted && 'opacity-70'}`}
            >
              {isCompleted && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 blur-2xl -mr-12 -mt-12 rounded-full" />
              )}
              
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${isCompleted ? 'bg-gold/20 border-gold/40 text-gold' : 'bg-white/5 border-white/10 text-white/20'}`}>
                  <ach.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className={`font-black text-sm italic tracking-tight ${isCompleted ? 'text-white' : 'text-white/60'}`}>{ach.title.toUpperCase()}</h4>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase">{ach.desc}</p>
                    </div>
                    {isCompleted && (
                      <Badge className="bg-gold text-black text-[8px] h-4 font-black italic border-none">DESBLOQUEADO</Badge>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>{ach.current} / {ach.req}</span>
                      <span className="text-primary">{ach.reward}</span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-white/5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

    </motion.div>
  );
}

function PatentsList({ setView, user }: { setView: (v: View) => void, user: any }) {
  const patents = [
    { name: "Bronze", min: 0, emoji: "🥉", color: "from-orange-700 to-orange-400", rewards: ["Moldura Básica", "XP Base"], divisions: ["III", "II", "I"] },
    { name: "Prata", min: 1000, emoji: "🥈", color: "from-slate-400 to-slate-200", rewards: ["Moldura Prateada", "XP +10%"], divisions: ["III", "II", "I"] },
    { name: "Ouro", min: 3000, emoji: "🥇", color: "from-yellow-600 to-yellow-300", rewards: ["Moldura Dourada", "XP +25%"], divisions: ["III", "II", "I"] },
    { name: "Diamante", min: 7000, emoji: "💎", color: "from-blue-600 to-cyan-300", rewards: ["Moldura Diamante", "XP +50%"], divisions: ["III", "II", "I"] },
    { name: "Pro", min: 15000, emoji: "🔥", color: "from-red-600 to-orange-500", rewards: ["Efeito de Fogo", "XP +100%"], divisions: ["III", "II", "I"] },
    { name: "Mestre", min: 30000, emoji: "👑", color: "from-purple-600 to-pink-500", rewards: ["Coroa Especial", "XP +150%"], divisions: ["III", "II", "I"] },
    { name: "Lendário", min: 60000, emoji: "🌟", color: "from-gold to-white", rewards: ["Aura Lendária", "XP +200%"], divisions: ["III", "II", "I"] }
  ];

  const currentInfo = getPatentInfo(user.wins, user.totalPushups, user.record, user.xp);
  
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 pb-24 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView('profile')}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter">TRILHA DE EVOLUÇÃO</h2>
      </div>

      <div className="glass-panel p-6 bg-gradient-to-br from-primary/20 to-transparent border-primary/30 relative overflow-hidden group">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentInfo.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
        <div className="flex items-center gap-5 mb-6 relative">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentInfo.color} flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(0,0,0,0.3)] border-2 border-white/20`}>
            {currentInfo.emoji}
          </div>
          <div>
            <h3 className="font-black text-2xl italic text-white uppercase tracking-tighter leading-none mb-1">{currentInfo.name} {currentInfo.subRank}</h3>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">PATENTE ATUAL</p>
          </div>
        </div>
        
        <div className="space-y-3 relative">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span>Score Atual: {Math.floor(currentInfo.score)}</span>
            <span>Próxima Divisão: {currentInfo.nextThreshold || 'MAX'}</span>
          </div>
          <Progress 
            value={currentInfo.nextThreshold ? ((currentInfo.score - patents.find(p => p.name === currentInfo.name)!.min) / (currentInfo.nextThreshold - patents.find(p => p.name === currentInfo.name)!.min)) * 100 : 100} 
            className="h-3 bg-white/5 border border-white/5" 
          />
          {currentInfo.nextThreshold && (
             <p className="text-[10px] font-black text-gold italic text-center uppercase tracking-wider animate-pulse mt-2">
               Faltam {Math.max(0, Math.floor(currentInfo.nextThreshold - currentInfo.score))} pontos para o próximo nível
             </p>
          )}
        </div>
      </div>

      <div className="space-y-6 relative mt-10">
        <div className="absolute left-[39px] top-10 bottom-10 w-1 bg-gradient-to-b from-primary/50 via-white/5 to-transparent z-0" />
        
        {patents.map((p, i) => {
          const isUnlocked = currentInfo.score >= p.min;
          const isCurrent = currentInfo.name === p.name;
          const isNext = !isUnlocked && (i === 0 || currentInfo.score >= patents[i-1].min);

          return (
            <motion.div 
              key={p.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative z-10 flex items-start gap-6 p-4 rounded-3xl border transition-all duration-500 ${
                isCurrent ? 'bg-white/10 border-gold shadow-[0_0_40px_rgba(255,215,0,0.15)] scale-[1.02]' : 
                isUnlocked ? 'bg-white/5 border-white/10' : 
                'bg-black/40 border-white/5 grayscale opacity-30'
              }`}
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-4xl shadow-2xl shrink-0 border-2 border-white/10`}>
                {p.emoji}
              </div>
              
              <div className="flex-1 pt-1">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="font-black text-xl italic text-white uppercase tracking-tighter">{p.name}</h4>
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{p.min} SCORE</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.divisions.map(div => (
                    <Badge key={div} variant="outline" className={`text-[9px] font-black border-white/10 py-0.5 px-2 ${isCurrent && currentInfo.subRank === div ? 'bg-gold text-black border-none' : 'text-white/40'}`}>
                      {p.name} {div}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {p.rewards.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                      <Sparkles className="w-2 h-2 text-gold" />
                      <span className="text-[7px] font-black text-white/60 uppercase tracking-tighter">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {isCurrent && (
                <div className="absolute -right-2 -top-2">
                  <Badge className="bg-gold text-black font-black italic text-[10px] px-3 py-1 shadow-lg animate-bounce">ATUAL</Badge>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}



