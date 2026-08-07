import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, Dumbbell, Swords, Medal, TrendingUp, User as UserIcon,
  Flame, ArrowLeft, Timer, Settings, Shield, Target, ChevronRight, Home, LayoutDashboard, UserCircle, Star,
  Copy, Check, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PushUpCounter } from "@/components/PushUpCounter";

export const Route = createFileRoute("/")({
  component: App,
});

type View = 'dashboard' | 'challenge' | 'select-bot' | 'select-duration' | 'profile' | 'multiplayer' | 'achievements' | 'support' | 'support-chat' | 'history' | 'friend-challenge' | 'ranking';

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
  const [user, setUser] = useState({
    id: "PUSH-" + Math.random().toString(36).substr(2, 4).toUpperCase(),
    name: "GUERREIRO ALPHA",
    age: 25,
    weight: 75,
    height: 175,
    goal: "Ganhar força",
    level: 15,
    xp: 12450,
    maxXp: 15000,
    wins: 87,
    losses: 23,
    record: 54,
    totalPushups: 10450,
    league: "Bronze",
    avatar: null,
    frame: "basic",
    achievements: ["1", "2"],
    history: [
      { id: 'h1', opp: "Bot Elite", res: "Vitória", score: "42-39", xp: "+150", date: '2026-08-01' },
      { id: 'h2', opp: "Bot Avançado", res: "Vitória", score: "38-30", xp: "+120", date: '2026-07-28' },
      { id: 'h3', opp: "Bot Lendário", res: "Derrota", score: "45-52", xp: "+45", date: '2026-07-25' },
    ]
  });

  const getLeague = (record: number) => {
    if (record >= 1500) return "Lenda";
    if (record >= 1000) return "Mestre";
    if (record >= 800) return "Diamante";
    if (record >= 500) return "Ouro";
    if (record >= 300) return "Prata";
    return "Bronze";
  };

  const updateStats = (won: boolean, pushups: number, xpGained: number, botName: string, botPushups: number) => {
    setUser(prev => {
      const newRecord = Math.max(prev.record, pushups);
      const newXp = prev.xp + xpGained;
      let newLevel = prev.level;
      let nextMaxXp = prev.maxXp;
      
      if (newXp >= prev.maxXp) {
        newLevel += 1;
        nextMaxXp = Math.floor(prev.maxXp * 1.2);
      }

      const newMatch = {
        id: Math.random().toString(36).substr(2, 9),
        opp: botName,
        res: won ? "Vitória" : "Derrota",
        score: `${pushups}-${botPushups}`,
        xp: `+${xpGained}`,
        date: new Date().toISOString().split('T')[0]
      };

      return {
        ...prev,
        wins: won ? prev.wins + 1 : prev.wins,
        losses: !won ? prev.losses + 1 : prev.losses,
        record: newRecord,
        totalPushups: prev.totalPushups + pushups,
        xp: newXp % prev.maxXp,
        level: newLevel,
        maxXp: nextMaxXp,
        league: getLeague(newRecord),
        history: [newMatch, ...prev.history].slice(0, 10)
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
  const stats = user;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <header className="flex justify-between items-center">
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
              <Badge className="bg-purple-evolve text-[8px] h-4 font-black italic tracking-widest px-1.5 border-none">LIGA {stats.league.toUpperCase()}</Badge>
              <div className="flex items-center gap-0.5 text-gold">
                <Flame className="w-3 h-3 fill-gold" />
                <span className="text-[10px] font-black">{stats.streak}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-10 h-10" />
      </header>

      <div className="glass-panel p-5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/30" />
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-black italic text-muted-foreground uppercase tracking-widest">Nível {stats.level}</span>
          <span className="text-[10px] font-black italic text-white tracking-tighter">{stats.xp} / {stats.maxXp} XP</span>
        </div>
        <Progress value={(stats.xp / stats.maxXp) * 100} className="h-2.5 bg-white/5" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button className="game-button bg-energy-red col-span-2 h-36 relative overflow-hidden group" onClick={() => setView('multiplayer')}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Swords className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-2xl tracking-tighter italic uppercase">Multiplayer</span>
            </div>
            <p className="text-[10px] font-bold opacity-80 tracking-widest">BATALHA ONLINE</p>
          </div>
        </Button>
        <Button className="game-button bg-primary/20 border border-primary/30 h-32 flex flex-col gap-2" onClick={() => { setSelectedBot(null); setView('select-duration'); }}>
          <Dumbbell className="w-6 h-6 text-primary" />
          <span className="text-lg tracking-tighter italic">TREINAR</span>
        </Button>
        <Button className="game-button bg-purple-evolve/20 border border-purple-evolve/30 h-32 flex flex-col gap-2" onClick={() => setView('profile')}>
          <UserCircle className="w-6 h-6 text-purple-evolve" />
          <span className="text-lg tracking-tighter italic">PERFIL</span>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black italic tracking-widest text-white/60 uppercase">Destaques</h3>
          <Button variant="link" className="text-[10px] font-black text-primary p-0 h-auto uppercase italic tracking-widest" onClick={() => setView('achievements')}>Ver Tudo</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {[
            { label: 'Recorde', val: '54', sub: 'flexões', icon: Target, color: 'text-gold' },
            { label: 'Vitórias', val: '87', sub: 'partidas', icon: Shield, color: 'text-blue-400' },
            { label: 'Sequência', val: '12', sub: 'dias', icon: Flame, color: 'text-energy-red' },
          ].map((item, i) => (
            <div key={i} className="min-w-[120px] glass-panel p-4 border-white/5 flex flex-col items-center gap-1">
              <item.icon className={`w-5 h-5 ${item.color} mb-1`} />
              <span className="text-xl font-black italic text-white leading-none">{item.val}</span>
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{item.sub}</span>
            </div>
          ))}
        </div>
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
          <Card key={bot.id} className="glass-panel p-5 flex items-center justify-between cursor-pointer hover:bg-white/10 hover:scale-[1.02] transition-all border-white/5 group" onClick={() => onSelect(bot)}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${bot.color} flex items-center justify-center font-black text-white text-2xl shadow-lg border-2 border-white/20 group-hover:rotate-3 transition-transform`}>
                {bot.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-black text-lg italic text-white tracking-tight">{bot.name.toUpperCase()}</p>
                  <Badge variant="outline" className="text-[8px] font-black h-4 px-1 opacity-60">Nível {bot.level}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{bot.difficulty}</span>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-[10px] font-black text-gold italic">{bot.avgPushups} FLEXÕES MÉDIA</span>
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
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
          // Bots have different speeds based on difficulty
          const chance = bot.level / 20; // 0.05 to 2.5
          if (Math.random() < chance) {
            setBotPushups(b => b + 1);
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
            <Badge className="bg-primary/20 text-[8px] h-3 px-1 border-none">{user.league}</Badge>
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
          <p className="text-[10px] font-black italic text-energy-red uppercase tracking-widest">{bot?.name || 'ADVERSÁRIO'}</p>
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
        <PushUpCounter isActive={gameState === 'playing'} onCount={setPlayerPushups} />
        
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


function Profile({ setView, user, setUser }: { setView: (v: View) => void, user: any, setUser: any }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  const stats = user;
  
  const handleSave = () => {
    setUser(formData);
    setEditing(false);
  };

  if (editing) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setEditing(false)}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="text-3xl font-black italic text-white tracking-tighter">EDITAR PERFIL</h2>
        </div>

        <div className="glass-panel p-6 space-y-4">
          <div className="flex flex-col items-center gap-4 mb-6">
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
              <div className="w-24 h-24 bg-secondary rounded-full border-4 border-gold flex items-center justify-center overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <UserIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-[8px] font-black text-white uppercase">Trocar Foto</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nome de Usuário</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-white focus:outline-none focus:border-primary"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Idade</label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-white focus:outline-none focus:border-primary"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Peso (kg)</label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-white focus:outline-none focus:border-primary"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Altura (cm)</label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-white focus:outline-none focus:border-primary"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Objetivo</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 font-bold text-white focus:outline-none focus:border-primary appearance-none h-[50px]"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              >
                <option value="Ganhar força">Ganhar força</option>
                <option value="Resistência">Resistência</option>
                <option value="Hipertrofia">Hipertrofia</option>
                <option value="Perda de peso">Perda de peso</option>
              </select>
            </div>
          </div>
          <Button onClick={handleSave} className="game-button bg-primary w-full py-6 mt-4">SALVAR ALTERAÇÕES</Button>
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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic text-white tracking-tighter">PERFIL</h2>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5" onClick={() => setView('dashboard')}><ArrowLeft className="w-5 h-5" /></Button>
      </div>

      <div className="glass-panel p-8 flex flex-col items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-purple-evolve to-energy-red" />
        
        <div className="relative">
          <div className="w-32 h-32 bg-secondary rounded-full border-4 border-gold shadow-[0_0_20px_rgba(255,215,0,0.3)] group-hover:scale-105 transition-transform duration-500 flex items-center justify-center overflow-hidden">
             {stats.avatar ? (
               <img src={stats.avatar} className="w-full h-full object-cover" alt={stats.name} />
             ) : (
               <UserIcon className="w-16 h-16 text-muted-foreground" />
             )}
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
            <Badge className="bg-gold/20 text-gold border-gold/30 px-3 py-0.5 font-bold">LIGA {stats.league.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-center mt-1">
             <Badge className="bg-white/10 text-white/60 border-white/20 px-3 py-0.5 font-bold">{stats.weight}KG • {stats.age} ANOS • {stats.height}CM</Badge>
          </div>
        </div>

        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs font-black italic text-muted-foreground uppercase tracking-widest">
            <span>Nível {stats.level}</span>
            <span>{stats.xp} / {stats.maxXp} XP</span>
          </div>
          <Progress value={(stats.xp / stats.maxXp) * 100} className="h-3 bg-white/5" />
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

        <Button 
          variant="ghost" 
          className="glass-panel p-6 h-auto flex justify-between items-center border-white/5 hover:bg-white/10"
          onClick={() => setEditing(true)}
        >
          <div className="flex items-center gap-4">
            <Settings className="w-6 h-6 text-white/40" />
            <div className="text-left">
              <p className="font-black text-white italic">CONFIGURAÇÕES</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Editar seu personagem</p>
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
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView('profile')}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter">HISTÓRICO</h2>
      </div>

      <div className="space-y-4">
        {user.history.map((match: any) => (
          <div key={match.id} className="glass-panel p-5 flex items-center justify-between border-white/5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg border-2 border-white/20 ${match.res === 'Vitória' ? 'bg-green-500' : 'bg-energy-red'}`}>
                {match.opp[0]}
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

    // AI Logic (Simple keyword matching for the demo as requested by "A IA deve responder somente assuntos relacionados ao aplicativo")
    setTimeout(() => {
      let response = "Desculpe, só posso responder perguntas relacionadas ao PushUp Arena. Tente perguntar sobre duelos, treinos, ligas ou ranking!";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('duelo')) response = "Nos duelos, você compete contra bots de diferentes níveis. Escolha a duração e tente fazer mais flexões que o adversário!";
      else if (lower.includes('treino')) response = "No modo treino, você pode praticar sozinho. Nossa IA analisa sua postura e conta suas repetições em tempo real.";
      else if (lower.includes('liga')) response = "Existem 6 ligas: Bronze, Prata, Ouro, Diamante, Mestre e Lenda. Melhore seu recorde para subir de liga!";
      else if (lower.includes('bot')) response = "Temos 10 níveis de bots, do Iniciante ao Lendário. Cada nível aumenta a velocidade e quantidade de flexões do oponente.";
      else if (lower.includes('ranking')) response = "O ranking mostra os melhores jogadores Global e do Brasil. Acumule vitórias para subir nas tabelas!";
      else if (lower.includes('perfil') || lower.includes('configuração')) response = "Você pode editar seu nome, peso, altura e foto diretamente na tela de Configurações dentro do seu Perfil.";

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
        league: 'Ouro',
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

      <div className="space-y-4">
        <div className="glass-panel p-4 space-y-3">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">🔍 PROCURAR JOGADOR POR ID</p>
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 font-mono text-sm text-white focus:outline-none focus:border-primary"
              placeholder="Ex: PUSH-DEMO"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            />
            <Button onClick={handleSearch} size="icon" className="game-button bg-primary"><Search className="w-5 h-5" /></Button>
          </div>
        </div>

        {foundPlayer && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-5 border-primary/30 bg-primary/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center border-2 border-primary/30">
                <UserIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-black text-lg italic text-white tracking-tight">{foundPlayer.name}</p>
                <div className="flex items-center gap-2">
                   <Badge className="bg-primary/20 text-[8px] h-4 px-1.5 border-none">{foundPlayer.id}</Badge>
                   <Badge className="bg-gold/20 text-gold border-none text-[8px] h-4 px-1.5 uppercase font-black italic">LIGA {foundPlayer.league}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="bg-white/5 p-2 rounded-xl text-center">
                  <p className="text-[8px] text-muted-foreground uppercase font-black">Nível</p>
                  <p className="text-sm font-black text-white">{foundPlayer.level}</p>
               </div>
               <div className="bg-white/5 p-2 rounded-xl text-center">
                  <p className="text-[8px] text-muted-foreground uppercase font-black">Recorde</p>
                  <p className="text-sm font-black text-gold">{foundPlayer.record}</p>
               </div>
            </div>
            <Button className="game-button bg-primary w-full py-4 text-sm uppercase italic" onClick={sendChallenge}>Enviar Desafio</Button>
          </motion.div>
        )}

        <Button 
          className="game-button bg-energy-red h-24 flex flex-col items-center justify-center relative overflow-hidden group"
          onClick={onSelectBot}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <Swords className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-lg tracking-tighter italic uppercase leading-none">Desafio Rápido</span>
          <p className="text-[8px] font-black opacity-60 tracking-widest uppercase mt-1">Oponentes Reais (Bots Matchmaking)</p>
        </Button>

        <Button 
          className="game-button bg-blue-500/20 border border-blue-500/30 h-24 flex flex-col items-center justify-center group"
          onClick={() => setView('friend-challenge')}
        >
          <UserIcon className="w-6 h-6 mb-1 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-lg tracking-tighter italic uppercase leading-none">Jogar com Amigos</span>
          <p className="text-[8px] font-black opacity-60 tracking-widest uppercase mt-1">Convidar via link</p>
        </Button>
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
  const [tab, setTab] = useState<'global' | 'local' | 'friends'>('global');
  
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 pb-24">
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-black italic text-white tracking-tighter">RANKING</h2>
        
        <div className="flex p-1 bg-white/5 rounded-2xl">
          <button 
            onClick={() => setTab('global')}
            className={`flex-1 py-3 text-[10px] font-black italic rounded-xl transition-all ${tab === 'global' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            🌎 GLOBAL
          </button>
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
            { name: "Guerreiro Alpha", count: 10450, avatar: "GA", color: "bg-primary", isUser: true, record: 54, wins: 87, streak: 12 },
            { name: "Amigo 1", count: 8200, avatar: "A1", color: "bg-secondary", record: 42, wins: 56, streak: 3 },
          ] : [
            { name: "Mega Flex", count: 12500, avatar: "MF", color: "bg-gold", record: 120, wins: 342, streak: 45 },
            { name: "Push Master", count: 11200, avatar: "PM", color: "bg-slate-400", record: 98, wins: 287, streak: 32 },
            { name: "Elite Beast", count: 10800, avatar: "EB", color: "bg-orange-600", record: 92, wins: 215, streak: 21 },
            { name: "Guerreiro Alpha", count: 10450, avatar: "GA", color: "bg-primary", isUser: true, record: 54, wins: 87, streak: 12 },
            { name: "Titan X", count: 9800, avatar: "TX", color: "bg-secondary", record: 88, wins: 156, streak: 15 },
          ]).map((player: any, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${player.isUser ? 'bg-primary/20 border-primary/50 scale-[1.02] shadow-[0_0_20px_rgba(96,165,250,0.2)]' : 'bg-white/5 border-white/5'}`}>
              <span className={`w-8 font-black text-lg italic ${i === 0 ? 'text-gold' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                {i + 1}º
              </span>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg ${player.color}`}>
                {player.avatar}
              </div>
              <div className="flex-1">
                <span className="font-black text-white tracking-tight">{player.name}</span>
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
  const achievements = [
    { title: "Primeiro Duelo", desc: "Vença sua primeira partida contra um bot", icon: Trophy, color: "text-gold", completed: true },
    { title: "Monstro das Flexões", desc: "Faça 100 flexões em um único dia", icon: Flame, color: "text-energy-red", completed: true },
    { title: "Elite Alpha", desc: "Alcance o Rank Elite na temporada", icon: Shield, color: "text-purple-evolve", completed: false },
    { title: "Mestre da Rapidez", desc: "Vença um Bot Lendário em 30s", icon: Timer, color: "text-blue-400", completed: false },
    { title: "Colecionador", desc: "Desbloqueie 5 molduras diferentes", icon: Medal, color: "text-orange-500", completed: true },
    { title: "Lendário", desc: "Fique no Top 10 Global por 1 semana", icon: Star, color: "text-yellow-400", completed: false },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
      <h2 className="text-3xl font-black italic text-white tracking-tighter mb-6">CONQUISTAS</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {achievements.map((ach, i) => (
          <div key={i} className={`glass-panel p-5 flex flex-col items-center gap-3 relative transition-all duration-300 ${!ach.completed ? 'opacity-40 grayscale' : 'hover:scale-[1.05] hover:shadow-gold/20 shadow-xl'}`}>
            <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${ach.color}`}>
              <ach.icon className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-white uppercase tracking-tighter leading-tight mb-1">{ach.title}</p>
              <p className="text-[8px] text-muted-foreground font-medium leading-tight">{ach.desc}</p>
            </div>
            {!ach.completed && (
              <div className="absolute top-2 right-2">
                <Shield className="w-4 h-4 text-white/20" />
              </div>
            )}
            {ach.completed && (
              <div className="absolute top-2 right-2 bg-green-500 w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-3xl -mr-16 -mt-16 rounded-full" />
        <h3 className="text-sm font-black italic text-white uppercase mb-4 tracking-widest">PROGRESSO TOTAL</h3>
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-black text-gold">12 <span className="text-sm text-white/40">/ 40</span></span>
          <span className="text-xs font-black text-muted-foreground italic mb-1">RECOMPENSAS EXCLUSIVAS</span>
        </div>
        <Progress value={30} className="h-2 bg-white/5" />
      </div>
    </motion.div>
  );
}


