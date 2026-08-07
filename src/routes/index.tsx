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
  { id: 'beginner', name: 'Bot Iniciante', color: 'bg-green-500', level: 1, difficulty: 'Fácil', avgPushups: 10 },
  { id: 'amateur', name: 'Bot Amador', color: 'bg-blue-500', level: 3, difficulty: 'Médio', avgPushups: 20 },
  { id: 'pro', name: 'Bot Intermediário', color: 'bg-purple-500', level: 6, difficulty: 'Difícil', avgPushups: 35 },
  { id: 'advanced', name: 'Bot Avançado', color: 'bg-orange-500', level: 12, difficulty: 'Elite', avgPushups: 50 },
  { id: 'elite', name: 'Bot Elite', color: 'bg-red-500', level: 20, difficulty: 'Expert', avgPushups: 70 },
  { id: 'legendary', name: 'Bot Lendário', color: 'bg-yellow-500', level: 50, difficulty: 'Máximo', avgPushups: 100 },
];

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedBot, setSelectedBot] = useState<typeof BOTS[0] | null>(null);

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard setView={setView} />;
      case 'select-bot': return <SelectBot setView={setView} onSelect={(b) => { setSelectedBot(b); setView('challenge'); }} />;
      case 'challenge': return <Challenge bot={selectedBot} onExit={() => setView('dashboard')} />;
      case 'profile': return <Profile setView={setView} />;
      case 'ranking': return <Ranking setView={setView} />;
      case 'achievements': return <Achievements setView={setView} />;
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

function Dashboard({ setView }: { setView: (v: View) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <div className="glass-panel p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-gold to-orange-500 rounded-full border-4 border-white/10" />
        <div>
          <h2 className="font-black text-xl text-white">Guerreiro Alpha</h2>
          <div className="flex items-center gap-2 text-gold">
            <Trophy className="w-4 h-4" /> <span className="font-bold text-sm">Liga Elite</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button className="game-button bg-energy-red col-span-2 h-32" onClick={() => setView('select-bot')}>
          <Swords className="w-10 h-10 mr-2" /> DESAFIAR
        </Button>
        <Button className="game-button bg-primary/20 h-28" onClick={() => setView('select-bot')}>
          <Dumbbell /> TREINAR
        </Button>
        <Button className="game-button bg-purple-evolve h-28" onClick={() => setView('ranking')}>
          <Trophy /> RANKING
        </Button>
      </div>
    </motion.div>
  );
}

function SelectBot({ setView, onSelect }: { setView: (v: View) => void, onSelect: (b: typeof BOTS[0]) => void }) {
  return (
    <motion.div initial={{ x: 20 }} animate={{ x: 0 }} className="p-6">
      <h2 className="text-2xl font-black mb-6">Escolha o Bot</h2>
      <div className="space-y-3">
        {BOTS.map(bot => (
          <Card key={bot.id} className="glass-panel p-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition" onClick={() => onSelect(bot)}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${bot.color} flex items-center justify-center font-bold text-white`}>
                {bot.name[0]}
              </div>
              <div>
                <p className="font-bold">{bot.name}</p>
                <p className="text-xs text-muted-foreground">{bot.difficulty} • Nível {bot.level}</p>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground" />
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

function Challenge({ bot, onExit }: { bot: any, onExit: () => void }) {
  const [playerPushups, setPlayerPushups] = useState(0);
  const [botPushups, setBotPushups] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
        if (bot) setBotPushups(b => b + Math.floor(Math.random() * 2));
      }, 1000);
      return () => clearInterval(timer);
    } else {
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.8 } });
    }
  }, [timeLeft, bot]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 flex flex-col items-center gap-6">
      <div className="w-full flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/10">
        <div className="text-center font-black">
          <p className="text-sm">VOCÊ</p>
          <p className="text-3xl">{playerPushups}</p>
        </div>
        <div className="text-4xl font-black tabular-nums text-energy-red">{timeLeft}s</div>
        <div className="text-center font-black">
          <p className="text-sm">{bot?.name || 'BOT'}</p>
          <p className="text-3xl">{botPushups}</p>
        </div>
      </div>
      
      <PushUpCounter isActive={timeLeft > 0} onCount={setPlayerPushups} />
      
      {timeLeft === 0 && (
        <div className="text-center space-y-4 animate-bounce">
            <h2 className="text-4xl font-black">{playerPushups >= botPushups ? "VITÓRIA!" : "DERROTA!"}</h2>
            <Button onClick={onExit} className="game-button bg-primary">VOLTAR</Button>
        </div>
      )}
    </motion.div>
  );
}

function Profile({ setView }: { setView: (v: View) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} className="p-6 space-y-6">
        <h2 className="text-2xl font-black">Perfil</h2>
        <div className="glass-panel p-6 flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-secondary rounded-full border-4 border-gold" />
            <input className="bg-transparent text-center font-bold text-xl" defaultValue="Guerreiro Alpha" />
            <div className="grid grid-cols-2 gap-4 w-full text-center">
                <div className="bg-white/5 p-3 rounded-lg"><p className="text-muted-foreground text-xs">XP</p><p className="font-bold">12,450</p></div>
                <div className="bg-white/5 p-3 rounded-lg"><p className="text-muted-foreground text-xs">VITÓRIAS</p><p className="font-bold">87</p></div>
            </div>
        </div>
    </motion.div>
  );
}

function Ranking({ setView }: { setView: (v: View) => void }) {
    return <motion.div initial={{ opacity: 0 }} className="p-6">
        <h2 className="text-2xl font-black mb-6">Ranking Global</h2>
        <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                    <span className="font-black text-gold">{i}º</span>
                    <div className="w-10 h-10 bg-secondary rounded-full" />
                    <span className="flex-1">Guerreiro {i}</span>
                    <span className="font-bold">{(1000 - i * 100) * 10} Flexões</span>
                </div>
            ))}
        </div>
    </motion.div>;
}

function Achievements({ setView }: { setView: (v: View) => void }) {
    return <motion.div initial={{ opacity: 0 }} className="p-6">
        <h2 className="text-2xl font-black mb-6">Conquistas</h2>
        <div className="grid grid-cols-2 gap-4">
            {['Primeira Vitória', '100 Flexões', 'Semana Ativa', 'Elite Rank'].map(ach => (
                <div key={ach} className="glass-panel p-4 flex flex-col items-center gap-2">
                    <Medal className="w-8 h-8 text-gold" />
                    <p className="text-xs font-bold text-center">{ach}</p>
                </div>
            ))}
        </div>
    </motion.div>;
}

