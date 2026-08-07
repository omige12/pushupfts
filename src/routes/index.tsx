import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, Dumbbell, Swords, Medal, TrendingUp, User as UserIcon,
  Flame, ArrowLeft, Timer, Settings, Edit2, Shield, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PushUpCounter } from "@/components/PushUpCounter";

export const Route = createFileRoute("/")({
  component: App,
});

type View = 'dashboard' | 'challenge' | 'select-bot' | 'profile';

const BOTS = [
  { id: 'beginner', name: 'Bot Iniciante', color: 'bg-green-500', level: 1, difficulty: 'Fácil' },
  { id: 'amateur', name: 'Bot Amador', color: 'bg-blue-500', level: 3, difficulty: 'Médio' },
  { id: 'pro', name: 'Bot Intermediário', color: 'bg-purple-500', level: 6, difficulty: 'Difícil' },
  { id: 'elite', name: 'Bot Elite', color: 'bg-red-500', level: 10, difficulty: 'Expert' },
];

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedBot, setSelectedBot] = useState<typeof BOTS[0] | null>(null);

  return (
    <AnimatePresence mode="wait">
      {view === 'dashboard' && <Dashboard key="dash" setView={setView} />}
      {view === 'select-bot' && <SelectBot key="bots" setView={setView} onSelect={(b) => { setSelectedBot(b); setView('challenge'); }} />}
      {view === 'challenge' && <Challenge key="game" bot={selectedBot} onExit={() => setView('dashboard')} />}
      {view === 'profile' && <Profile key="prof" setView={setView} />}
    </AnimatePresence>
  );
}

function Dashboard({ setView }: { setView: (v: View) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gold to-orange-500 rounded-xl" />
          <div>
            <h1 className="font-black text-lg">Guerreiro Lovable</h1>
            <Badge className="bg-purple-evolve text-[10px]">Liga Elite</Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setView('profile')}><Settings /></Button>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Button className="game-button bg-energy-red col-span-2 h-32" onClick={() => setView('select-bot')}>
          <Swords className="w-10 h-10 mr-2" /> DESAFIAR BOT
        </Button>
        <Button className="game-button bg-primary/20 h-28" onClick={() => setView('challenge')}>
          <Dumbbell /> TREINAR
        </Button>
        <Button className="game-button bg-gold/20 text-gold h-28" onClick={() => {}}>
          <Trophy /> RANKING
        </Button>
      </div>
    </motion.div>
  );
}

function SelectBot({ setView, onSelect }: { setView: (v: View) => void, onSelect: (b: typeof BOTS[0]) => void }) {
  return (
    <motion.div initial={{ x: 20 }} animate={{ x: 0 }} className="p-6">
      <Button variant="ghost" onClick={() => setView('dashboard')}><ArrowLeft /> Voltar</Button>
      <h2 className="text-2xl font-black mt-4 mb-6">Escolha seu Adversário</h2>
      <div className="space-y-4">
        {BOTS.map(bot => (
          <Card key={bot.id} className="glass-panel p-4 flex items-center justify-between cursor-pointer hover:border-primary transition" onClick={() => onSelect(bot)}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${bot.color} flex items-center justify-center font-bold`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold">{bot.name}</p>
                <p className="text-xs text-muted-foreground">Nível {bot.level} • {bot.difficulty}</p>
              </div>
            </div>
            <Target className="text-muted-foreground" />
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

function Challenge({ bot, onExit }: { bot: any, onExit: () => void }) {
  const [pushups, setPushups] = useState(0);
  
  const finish = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(onExit, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-black text-xl italic text-energy-red">VS {bot?.name || 'TREINO'}</h2>
        <Button onClick={finish}>Encerrar</Button>
      </div>
      <PushUpCounter isActive={true} onCount={setPushups} />
      <div className="mt-8 text-center text-6xl font-black text-white">{pushups}</div>
    </motion.div>
  );
}

function Profile({ setView }: { setView: (v: View) => void }) {
  return (
    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="p-6">
      <Button variant="ghost" onClick={() => setView('dashboard')}><ArrowLeft /> Voltar</Button>
      <h2 className="text-2xl font-black mt-6 mb-4">Editar Perfil</h2>
      <div className="glass-panel p-6 space-y-4">
        <div className="flex justify-center"><div className="w-24 h-24 bg-secondary rounded-full border-4 border-gold" /></div>
        <input className="w-full bg-background p-3 rounded-xl border border-border" defaultValue="Guerreiro Lovable" />
        <Button className="w-full">Salvar Alterações</Button>
      </div>
    </motion.div>
  );
}
