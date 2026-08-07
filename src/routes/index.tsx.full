import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, Dumbbell, Swords, Medal, TrendingUp, User as UserIcon,
  Flame, ArrowLeft, Timer, Settings, Shield, Target, ChevronRight, Home, LayoutDashboard, UserCircle, Star,
  Copy, Check, Search, Zap, Award, Sparkles, LogOut, Info
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
    achievements: ["1", "2"],
    history: []
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
          setLevelUpData({ old: `${oldPatentData.name} ${oldPatentData.subRank}`, new: `${newPatentData.name} ${newPatentData.subRank}` });
          confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFFFFF', '#60A5FA'] });
        }
      }
      return { ...prev, wins, record: newRecord, totalPushups, xp: prev.xp + xpGained, patent: newPatentData.name, subRank: newPatentData.subRank };
    });
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard setView={setView} user={user} setSelectedBot={setSelectedBot} />;
      case 'profile': return <Profile setView={setView} user={user} />;
      case 'settings': return <SettingsView setView={setView} />;
      case 'edit-profile': return <EditProfile setView={setView} user={user} setUser={setUser} />;
      case 'multiplayer': return <Multiplayer setView={setView} user={user} onSelectBot={() => setView('select-bot')} />;
      case 'achievements': return <Achievements setView={setView} user={user} />;
      // ... assume other components exist
      default: return <Dashboard setView={setView} user={user} setSelectedBot={setSelectedBot} />;
    }
  };
  
  return <div className="min-h-screen bg-background">{renderView()}</div>;
}

function Dashboard({ setView, user, setSelectedBot }: any) { /* Implementation */ return <div />; }
function Profile({ setView, user }: any) { /* Implementation */ return <div />; }
function SettingsView({ setView }: any) { /* Implementation */ return <div />; }
function EditProfile({ setView, user, setUser }: any) { /* Implementation */ return <div />; }
function Multiplayer({ setView, user, onSelectBot }: any) { /* Implementation */ return <div />; }
function Achievements({ setView, user }: any) { /* Implementation */ return <div />; }
