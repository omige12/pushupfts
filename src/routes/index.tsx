import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, Dumbbell, Swords, Medal, TrendingUp, User as UserIcon,
  Flame, ArrowLeft, Timer, Settings, Shield, Target, ChevronRight, Home, LayoutDashboard, UserCircle, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PushUpCounter } from "@/components/PushUpCounter";

export const Route = createFileRoute("/")({
  component: App,
});

type View = 'dashboard' | 'challenge' | 'select-bot' | 'profile' | 'ranking' | 'achievements';

const BOTS = [
  { id: '1', name: 'Bot Iniciante', color: 'bg-green-500', level: 1, difficulty: 'Muito Fácil', avgPushups: 5 },
  { id: '2', name: 'Bot Nível 2', color: 'bg-green-600', level: 2, difficulty: 'Fácil', avgPushups: 10 },
  { id: '3', name: 'Bot Competitivo', color: 'bg-yellow-500', level: 3, difficulty: 'Iniciante', avgPushups: 15 },
  { id: '4', name: 'Bot Amador', color: 'bg-yellow-600', level: 4, difficulty: 'Médio', avgPushups: 25 },
  { id: '5', name: 'Bot Equilibrado', color: 'bg-orange-500', level: 5, difficulty: 'Desafiante', avgPushups: 35 },
  { id: '6', name: 'Bot Difícil', color: 'bg-orange-600', level: 6, difficulty: 'Difícil', avgPushups: 45 },
  { id: '7', name: 'Bot Muito Difícil', color: 'bg-red-500', level: 7, difficulty: 'Muito Difícil', avgPushups: 55 },
  { id: '8', name: 'Bot Elite', color: 'bg-red-600', level: 8, difficulty: 'Elite', avgPushups: 70 },
  { id: '9', name: 'Bot Mestre', color: 'bg-purple-500', level: 9, difficulty: 'Mestre', avgPushups: 90 },
  { id: '10', name: 'Bot Lendário', color: 'bg-yellow-400', level: 10, difficulty: 'Lendário', avgPushups: 120 },
];

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedBot, setSelectedBot] = useState<typeof BOTS[0] | null>(null);
  const [user, setUser] = useState({
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
      case 'dashboard': return <Dashboard setView={setView} user={user} />;
      case 'select-bot': return <SelectBot setView={setView} onSelect={(b) => { setSelectedBot(b); setView('challenge'); }} />;
      case 'challenge': return <Challenge bot={selectedBot} onExit={() => setView('dashboard')} onComplete={updateStats} />;
      case 'profile': return <Profile setView={setView} user={user} setUser={setUser} />;
      case 'ranking': return <Ranking setView={setView} user={user} />;
      case 'achievements': return <Achievements setView={setView} user={user} />;
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
          { icon: Swords, label: 'Lutar', id: 'select-bot' },
          { icon: Trophy, label: 'Rank', id: 'ranking' },
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

function Dashboard({ setView, user }: { setView: (v: View) => void, user: any }) {
  const stats = user;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-gold to-orange-500 rounded-2xl border-2 border-white/20 shadow-lg shadow-gold/10" />
          <div>
            <h1 className="font-black text-xl italic text-white tracking-tighter leading-none mb-1">GUERREIRO ALPHA</h1>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-purple-evolve text-[8px] h-4 font-black italic tracking-widest px-1.5 border-none">LIGA {stats.league.toUpperCase()}</Badge>
              <div className="flex items-center gap-0.5 text-gold">
                <Flame className="w-3 h-3 fill-gold" />
                <span className="text-[10px] font-black">{stats.streak}</span>
              </div>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 border border-white/5" onClick={() => setView('profile')}><UserCircle className="w-6 h-6" /></Button>
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
        <Button className="game-button bg-energy-red col-span-2 h-36 relative overflow-hidden group" onClick={() => setView('select-bot')}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Swords className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="text-2xl tracking-tighter italic">DESAFIAR</span>
            </div>
            <p className="text-[10px] font-bold opacity-80 tracking-widest">BATALHA DE FLEXÕES</p>
          </div>
        </Button>
        <Button className="game-button bg-primary/20 border border-primary/30 h-32 flex flex-col gap-2" onClick={() => setView('select-bot')}>
          <Dumbbell className="w-6 h-6 text-primary" />
          <span className="text-lg tracking-tighter italic">TREINAR</span>
        </Button>
        <Button className="game-button bg-purple-evolve/20 border border-purple-evolve/30 h-32 flex flex-col gap-2" onClick={() => setView('ranking')}>
          <Trophy className="w-6 h-6 text-purple-evolve" />
          <span className="text-lg tracking-tighter italic">RANKING</span>
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


function Challenge({ bot, onExit, onComplete }: { bot: any, onExit: () => void, onComplete: (won: boolean, pushups: number, xpGained: number, botName: string, botPushups: number) => void }) {
  const [playerPushups, setPlayerPushups] = useState(0);
  const [botPushups, setBotPushups] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
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
        <div className="flex-1 glass-panel p-3 border-r-0 rounded-r-none border-primary/30 bg-primary/10">
          <p className="text-[10px] font-black italic text-primary uppercase tracking-widest">Você</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-white italic">{playerPushups}</span>
            <span className="text-xs font-black text-white/40">💪</span>
          </div>
        </div>
        <div className="z-10 bg-card border-4 border-background w-16 h-16 rounded-full flex items-center justify-center -mx-2 shadow-xl">
          <span className={`text-2xl font-black italic tabular-nums ${timeLeft <= 5 ? 'text-energy-red animate-pulse' : 'text-white'}`}>
            {timeLeft}
          </span>
        </div>
        <div className="flex-1 glass-panel p-3 border-l-0 rounded-l-none border-energy-red/30 bg-energy-red/10 text-right">
          <p className="text-[10px] font-black italic text-energy-red uppercase tracking-widest">{bot?.name || 'BOT'}</p>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs font-black text-white/40">💪</span>
            <span className="text-3xl font-black text-white italic">{botPushups}</span>
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
                <div className="bg-white/5 p-4 rounded-2xl">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">XP Ganho</p>
                  <p className="text-xl font-black text-gold">+{playerPushups >= botPushups ? 150 : 45}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Bônus</p>
                  <p className="text-xl font-black text-purple-evolve">+12</p>
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


function Profile({ setView }: { setView: (v: View) => void }) {
  const [name, setName] = useState("Guerreiro Alpha");
  const stats = {
    level: 15,
    xp: 12450,
    maxXp: 15000,
    wins: 87,
    losses: 23,
    record: 54,
    league: "Elite",
    rank: 124
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic text-white tracking-tighter">PERFIL</h2>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5"><Settings className="w-5 h-5" /></Button>
      </div>

      <div className="glass-panel p-8 flex flex-col items-center gap-6 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-purple-evolve to-energy-red" />
        
        <div className="relative">
          <div className="w-32 h-32 bg-secondary rounded-full border-4 border-gold shadow-[0_0_20px_rgba(255,215,0,0.3)] group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute -bottom-2 -right-2 bg-purple-evolve p-2 rounded-full border-2 border-background shadow-lg">
            <Star className="w-4 h-4 text-white" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <input 
              className="bg-transparent text-center font-black text-2xl text-white focus:outline-none w-full border-b border-transparent focus:border-white/20 pb-1" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Badge className="bg-gold/20 text-gold border-gold/30 px-3 py-0.5 font-bold">LIGA {stats.league.toUpperCase()}</Badge>
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
            <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Rank</p>
            <p className="text-xl font-black text-purple-evolve">#{stats.rank}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black italic tracking-tight text-white/80">HISTÓRICO RECENTE</h3>
        {[
          { opp: "Bot Elite", res: "Vitória", score: "42-39", xp: "+150" },
          { opp: "Bot Avançado", res: "Vitória", score: "38-30", xp: "+120" },
          { opp: "Bot Lendário", res: "Derrota", score: "45-52", xp: "+45" },
        ].map((match, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${match.res === 'Vitória' ? 'bg-green-500' : 'bg-energy-red'}`} />
              <div>
                <p className="text-sm font-bold text-white">{match.opp}</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{match.score}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-black ${match.res === 'Vitória' ? 'text-green-500' : 'text-energy-red'}`}>{match.res}</p>
              <p className="text-[10px] text-gold font-black italic">{match.xp} XP</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Ranking({ setView }: { setView: (v: View) => void }) {
  const [tab, setTab] = useState<'global' | 'local'>('global');
  
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
      <div className="flex flex-col gap-6">
        <h2 className="text-3xl font-black italic text-white tracking-tighter">RANKING</h2>
        
        <div className="flex p-1 bg-white/5 rounded-2xl">
          <button 
            onClick={() => setTab('global')}
            className={`flex-1 py-3 text-sm font-black italic rounded-xl transition-all ${tab === 'global' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            🌎 GLOBAL
          </button>
          <button 
            onClick={() => setTab('local')}
            className={`flex-1 py-3 text-sm font-black italic rounded-xl transition-all ${tab === 'local' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            🇧🇷 BRASIL
          </button>
        </div>

        <div className="space-y-3">
          {[
            { name: "Mega Flex", count: 12500, avatar: "MF", color: "bg-gold" },
            { name: "Push Master", count: 11200, avatar: "PM", color: "bg-silver-400" },
            { name: "Elite Beast", count: 10800, avatar: "EB", color: "bg-orange-600" },
            { name: "Guerreiro Alpha", count: 10450, avatar: "GA", color: "bg-primary", isUser: true },
            { name: "Titan X", count: 9800, avatar: "TX", color: "bg-secondary" },
            { name: "Iron Chest", count: 9500, avatar: "IC", color: "bg-secondary" },
          ].map((player, i) => (
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
                <div className="flex items-center gap-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                  <Flame className="w-3 h-3 text-energy-red" /> 12 dias seguidos
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

function Achievements({ setView }: { setView: (v: View) => void }) {
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


