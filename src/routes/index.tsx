import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, Dumbbell, Swords, Medal, TrendingUp, User as UserIcon, Flame, ArrowLeft, Timer, Settings, Shield, Target, ChevronRight, Home, UserCircle, Star, Copy, Check, Search, Zap, Award, Sparkles, LogOut, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PushUpCounter } from "@/components/PushUpCounter";
import { toast } from "sonner";
import { Toaster } from "sonner";

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
    } else break;
  }
  if (currentPatent.name === "Lenda") return { name: "Lenda", subRank: "", emoji: "🌟", score, nextThreshold: null };
  const range = nextPatent.min - currentPatent.min;
  const progress = score - currentPatent.min;
  const subRankSize = range / 3;
  let subRank = "III";
  if (progress >= subRankSize * 2) subRank = "I";
  else if (progress >= subRankSize) subRank = "II";
  return { name: currentPatent.name, subRank, emoji: currentPatent.emoji, score, nextThreshold: nextPatent.min };
};

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [user, setUser] = useState({
    id: "PUSH-1234",
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
    record: 54,
    totalPushups: 10450,
    streak: 12,
    avatar: null,
    history: []
  });

  const updateStats = (won: boolean, pushups: number, xpGained: number) => {
    setUser(prev => {
      const newXp = prev.xp + xpGained;
      const patentData = getPatentInfo(prev.wins + (won ? 1 : 0), prev.totalPushups + pushups, Math.max(prev.record, pushups), newXp);
      return { ...prev, xp: newXp % prev.maxXp, patent: patentData.name, subRank: patentData.subRank };
    });
  };

  const views: Record<View, React.ReactNode> = {
    'dashboard': <Dashboard setView={setView} user={user} />,
    'profile': <Profile setView={setView} user={user} />,
    'settings': <SettingsView setView={setView} />,
    'edit-profile': <EditProfile setView={setView} user={user} setUser={setUser} />,
    'multiplayer': <div />,
    'achievements': <Achievements setView={setView} user={user} />,
    'challenge': <div />,
    'select-bot': <div />,
    'select-duration': <div />,
    'support': <div />,
    'support-chat': <div />,
    'history': <div />,
    'friend-challenge': <div />,
    'ranking': <div />,
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Toaster />
      <AnimatePresence mode="wait">
        {views[view]}
      </AnimatePresence>
    </div>
  );
}

function Dashboard({ setView, user }: any) {
  const patent = getPatentInfo(user.wins, user.totalPushups, user.record, user.xp);
  return (
    <motion.div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic">{user.name.toUpperCase()}</h1>
          <Badge className="bg-purple-evolve">{patent.emoji} {patent.name} {patent.subRank}</Badge>
        </div>
      </header>
      <div className="glass-panel p-5 space-y-2">
        <p className="text-[10px] font-black uppercase">Faltam {user.maxXp - user.xp} XP para nível {user.level + 1}</p>
        <Progress value={(user.xp / user.maxXp) * 100} />
      </div>
      <Button className="w-full h-32" onClick={() => setView('multiplayer')}><Swords className="mr-2" /> MULTIPLAYER</Button>
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={() => setView('profile')}>PERFIL</Button>
      </div>
    </motion.div>
  );
}

function Profile({ setView }: any) {
  return (
    <motion.div className="p-6 space-y-4">
      <Button onClick={() => setView('dashboard')}><ArrowLeft /></Button>
      <h2 className="text-2xl font-black italic">PERFIL</h2>
      <Button onClick={() => setView('settings')} className="w-full">CONFIGURAÇÕES</Button>
    </motion.div>
  );
}

function SettingsView({ setView }: any) {
  return (
    <motion.div className="p-6 space-y-4">
      <Button onClick={() => setView('profile')}><ArrowLeft /></Button>
      <h2 className="text-2xl font-black italic">CONFIGURAÇÕES</h2>
      <Button onClick={() => setView('edit-profile')} className="w-full">EDITAR PERFIL</Button>
    </motion.div>
  );
}

function EditProfile({ setView, user, setUser }: any) {
  const [formData, setFormData] = useState(user);
  const handleSave = () => {
    setUser(formData);
    toast.success("✅ Perfil atualizado com sucesso");
    setView('profile');
  };
  return (
    <motion.div className="p-6 space-y-4">
      <Button onClick={() => setView('settings')}><ArrowLeft /></Button>
      <h2 className="text-2xl font-black italic">EDITAR PERFIL</h2>
      <input className="w-full p-3 bg-white/5" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      <Button onClick={handleSave} className="w-full">SALVAR</Button>
    </motion.div>
  );
}

function Achievements({ setView, user }: any) {
  const achievements = [
    { title: "Primeira Flexão", req: 1 },
    { title: "100 Flexões", req: 100 },
    { title: "Primeira Vitória", req: 1 },
  ];
  return (
    <motion.div className="p-6 space-y-4">
       <Button onClick={() => setView('dashboard')}><ArrowLeft /></Button>
       {achievements.map((a, i) => (
         <Card key={i} className="p-4">{a.title} - {user.totalPushups >= a.req ? "OK" : "PENDENTE"}</Card>
       ))}
    </motion.div>
  );
}
