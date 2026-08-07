import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, Dumbbell, Swords, Medal, TrendingUp, User as UserIcon,
  Flame, ArrowLeft, Timer, Settings, Shield, Target, ChevronRight, Home, LayoutDashboard, UserCircle, Star,
  Copy, Check, Search, Zap, Award, Sparkles, LogOut
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

type View = 'dashboard' | 'challenge' | 'select-bot' | 'select-duration' | 'profile' | 'settings' | 'edit-profile' | 'multiplayer' | 'achievements' | 'support' | 'support-chat' | 'history' | 'friend-challenge' | 'ranking';

const getPatentInfo = (wins: number, totalPushups: number, record: number, xp: number) => {
  const score = (wins * 10) + (totalPushups / 10) + (record * 2) + (xp / 100);
  
  const patents = [
    { name: "Bronze", min: 0, emoji: "🥉" },
    { name: "Prata", min: 500, emoji: "🥈" },
    { name: "Ouro", min: 1500, emoji: "🥇" },
    { name: "Diamante", min: 3000, emoji: "💎" },
    { name: "Pro", min: 6000, emoji: "🔥" },
    { name: "Mestre", min: 10000, emoji: "👑" },
    { name: "Lenda", min: 20000, emoji: "🌟" }
  ];
  
  let currentPatent = patents[0];
  let nextPatent = patents[1];
  
  for (let i = 0; i < patents.length; i++) {
    if (score >= patents[i].min) {
      currentPatent = patents[i];
      nextPatent = patents[i+1] || null;
    } else {
      break;
    }
  }
  
  if (currentPatent.name === "Lenda") {
    return { name: "Lenda", subRank: "", emoji: "🌟", score, nextThreshold: null };
  }

  const range = nextPatent.min - currentPatent.min;
  const progress = score - currentPatent.min;
  const subRankSize = range / 3;
  
  let subRank = "III";
  if (progress >= subRankSize * 2) subRank = "I";
  else if (progress >= subRankSize) subRank = "II";

  return {
    name: currentPatent.name,
    subRank,
    emoji: currentPatent.emoji,
    score,
    nextThreshold: nextPatent.min
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
    case "Lenda": return "🌟";
    default: return "🥉";
  }
};

const BOTS = [
  { id: '1', name: 'Bot Nível 1', color: 'bg-green-500', level: 1, difficulty: 'Muito Fácil', avgPushups: 5 },
  { id: '2', name: 'Bot Nível 2', color: 'bg-green-600', level: 2, difficulty: 'Fácil', avgPushups: 15 },
  { id: '3', name: 'Bot Nível 3', color: 'bg-yellow-500', level: 3, difficulty: 'Médio', avgPushups: 30 },
  { id: '4', name: 'Bot Nível 4', color: 'bg-orange-600', level: 4, difficulty: 'Difícil', avgPushups: 60 },
  { id: '5', name: 'Bot Nível 5', color: 'bg-yellow-400', level: 5, difficulty: 'Lendário', avgPushups: 120 },
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
      { id: 'h1', opp: "Bot Elite", res: "Vitória", score: "42-39", xp: "+150", date: '2026-08-01' },
    ]
  });

  const updateStats = (won: boolean, pushups: number, xpGained: number, botName: string, botPushups: number) => {
    setUser(prev => {
      const newRecord = Math.max(prev.record, pushups);
      const totalPushups = prev.totalPushups + pushups;
      const wins = won ? prev.wins + 1 : prev.wins;
      
      const oldPatentData = getPatentInfo(prev.wins, prev.totalPushups, prev.record, prev.xp);
      const newPatentData = getPatentInfo(wins, totalPushups, newRecord, prev.xp + xpGained);

      if (newPatentData.name !== oldPatentData.name || newPatentData.subRank !== oldPatentData.subRank) {
        if (newPatentData.score > oldPatentData.score) {
          setLevelUpData({ 
            old: `${oldPatentData.name} ${oldPatentData.subRank}`, 
            new: `${newPatentData.name} ${newPatentData.subRank}` 
          });
          confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFFFFF', '#60A5FA'] });
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
      case 'profile': return <Profile setView={setView} user={user} />;
      case 'settings': return <SettingsView setView={setView} />;
      case 'edit-profile': return <EditProfile setView={setView} user={user} setUser={setUser} />;
      case 'multiplayer': return <Multiplayer setView={setView} user={user} onSelectBot={() => setView('select-bot')} />;
      case 'achievements': return <Achievements setView={setView} user={user} />;
      case 'support': return <Support setView={setView} />;
      case 'support-chat': return <SupportChat setView={setView} />;
      case 'history': return <FullHistory setView={setView} user={user} />;
      case 'friend-challenge': return <FriendChallenge setView={setView} user={user} />;
      case 'ranking': return <Ranking setView={setView} user={user} />;
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
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <Trophy className="w-32 h-32 text-gold mx-auto drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase">🎉 NOVA PATENTE!</h2>
                <p className="text-muted-foreground font-bold tracking-widest uppercase">VOCÊ EVOLUIU NA ARENA</p>
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center opacity-50"><p className="text-[10px] font-black mb-1 uppercase tracking-widest">Anterior</p><p className="text-xl font-black text-white italic">{levelUpData.old}</p></div>
                <ChevronRight className="w-8 h-8 text-primary" />
                <div className="text-center"><p className="text-[10px] font-black mb-1 uppercase tracking-widest text-primary">Atual</p><p className="text-3xl font-black text-gold italic drop-shadow-sm">{levelUpData.new}</p></div>
              </div>
              <Button onClick={() => setLevelUpData(null)} className="game-button bg-primary w-full py-8 text-xl italic uppercase">CONTINUAR JORNADA</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 w-full bg-card border-t border-border flex justify-around p-3 z-50">
        {[
          { icon: Home, label: 'Início', id: 'dashboard' },
          { icon: Swords, label: 'Multiplayer', id: 'multiplayer' },
          { icon: TrendingUp, label: 'Ranking', id: 'ranking' },
          { icon: UserCircle, label: 'Perfil', id: 'profile' },
          { icon: Star, label: 'Conquistas', id: 'achievements' },
        ].map(item => (
          <button key={item.id} onClick={() => setView(item.id as View)} className={`flex flex-col items-center gap-1 ${view === item.id ? 'text-primary' : 'text-muted-foreground'}`}>
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Dashboard({ setView, user, setSelectedBot }: { setView: (v: View) => void, user: any, setSelectedBot: (b: any) => void }) {
  const patentData = getPatentInfo(user.wins, user.totalPushups, user.record, user.xp);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-gold to-orange-500 rounded-2xl border-2 border-white/20 shadow-lg shadow-gold/10 overflow-hidden">
            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-secondary flex items-center justify-center"><UserIcon className="w-6 h-6" /></div>}
          </div>
          <div>
            <h1 className="font-black text-xl italic text-white tracking-tighter">{user.name.toUpperCase()}</h1>
            <Badge className="bg-purple-evolve">{patentData.emoji} {patentData.name.toUpperCase()} {patentData.subRank}</Badge>
          </div>
        </div>
      </header>
      <div className="glass-panel p-5 space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase"><span>NÍVEL {user.level}</span><span>{user.xp} / {user.maxXp} XP</span></div>
        <Progress value={(user.xp / user.maxXp) * 100} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button className="game-button bg-energy-red col-span-2 h-32" onClick={() => setView('multiplayer')}><Swords className="w-8 h-8 mr-2" /> MULTIPLAYER</Button>
        <Button className="game-button bg-primary/20 h-24" onClick={() => { setSelectedBot(null); setView('select-duration'); }}><Dumbbell className="w-6 h-6 mr-2" /> TREINAR</Button>
        <Button className="game-button bg-purple-evolve/20 h-24" onClick={() => setView('profile')}><UserCircle className="w-6 h-6 mr-2" /> PERFIL</Button>
      </div>
    </motion.div>
  );
}

// Implement remaining components... (SelectBot, SelectDuration, Challenge, Profile, SettingsView, EditProfile, Multiplayer, Achievements, Support, SupportChat, FullHistory, FriendChallenge, Ranking)
// ... will continue implementation for all sub-components.
