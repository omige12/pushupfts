import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, Dumbbell, Swords, Medal, TrendingUp, User as UserIcon,
  Flame, ArrowLeft, Timer, Shield, Target, ChevronRight, Home, LayoutDashboard, UserCircle, Star,
  Copy, Check, Search, Zap, Award, Sparkles, Pencil, Camera, Image as ImageIcon, Globe, Loader2, X, Plus,
  Mail, Lock, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PushUpCounter } from "@/components/PushUpCounter";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/")({
  component: App,
});


type View = 'onboarding-start' | 'quiz' | 'quiz-result' | 'auth' | 'photo-upload' | 'profile-setup' | 'profile-ready' | 'dashboard' | 'challenge' | 'select-bot' | 'select-duration' | 'profile' | 'settings' | 'edit-profile' | 'multiplayer' | 'achievements' | 'support' | 'support-chat' | 'history' | 'friend-challenge' | 'ranking' | 'patents-list' | 'matchmaking' | 'pvp-battle' | 'training-setup' | 'treino';

const RANKS = [
  "Bronze III", "Bronze II", "Bronze I",
  "Prata III", "Prata II", "Prata I",
  "Ouro III", "Ouro II", "Ouro I",
  "Platina III", "Platina II", "Platina I",
  "Diamante III", "Diamante II", "Diamante I",
  "Pro III", "Pro II", "Pro I",
  "Mestre III", "Mestre II", "Mestre I",
  "Lendário III", "Lendário II", "Lendário I"
];

const XP_PER_DIVISION = 500;

const getRankInfo = (totalXp: number) => {
  const rankIndex = Math.min(RANKS.length - 1, Math.floor(totalXp / XP_PER_DIVISION));
  const currentRankName = RANKS[rankIndex];
  const [patentName, subRank] = currentRankName.split(' ');
  
  const xpInLevel = totalXp % XP_PER_DIVISION;
  const isMax = rankIndex === RANKS.length - 1;
  const progress = isMax ? 100 : (xpInLevel / XP_PER_DIVISION) * 100;
  
  const patentColors: Record<string, string> = {
    "Bronze": "from-orange-700 to-orange-400",
    "Prata": "from-slate-400 to-slate-200",
    "Ouro": "from-yellow-600 to-yellow-300",
    "Platina": "from-cyan-600 to-blue-400",
    "Diamante": "from-blue-600 to-cyan-300",
    "Pro": "from-red-600 to-orange-500",
    "Mestre": "from-purple-600 to-pink-500",
    "Lendário": "from-gold to-white"
  };

  const patentEmojis: Record<string, string> = {
    "Bronze": "🥉",
    "Prata": "🥈",
    "Ouro": "🥇",
    "Platina": "💠",
    "Diamante": "💎",
    "Pro": "🔥",
    "Mestre": "👑",
    "Lendário": "🌟"
  };

  return {
    rankName: currentRankName,
    patentName,
    subRank,
    xpInLevel,
    xpForNext: XP_PER_DIVISION,
    progress,
    isMax,
    color: patentColors[patentName] || "from-primary to-primary/50",
    emoji: patentEmojis[patentName] || "🥉",
    totalXp: totalXp,
    level: rankIndex + 1
  };
};


const getPatentEmoji = (patent: string) => {
  const emojis: Record<string, string> = {
    "Bronze": "🥉",
    "Prata": "🥈",
    "Ouro": "🥇",
    "Diamante": "💎",
    "Pro": "🔥",
    "Mestre": "👑",
    "Lendário": "🌟"
  };
  return emojis[patent] || "🥉";
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
  const [view, setView] = useState<View>('onboarding-start');
  const [selectedBot, setSelectedBot] = useState<any | null>(null);
  const [opponent, setOpponent] = useState<any | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [duration, setDuration] = useState(60);
  const [levelUpData, setLevelUpData] = useState<{old: string, new: string} | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);


  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    age: number;
    weight: number;
    height: number;
    goal: string;
    level: number;
    patent: string;
    subRank: string;
    xp: number;
    maxXp: number;
    wins: number;
    losses: number;
    record: number;
    totalPushups: number;
    streak: number;
    avatar: string | null;
    frame: string;
    achievements: string[];
    history: any[];
  }>({
    id: "PUSH-USER",
    name: "GUERREIRO ALPHA",
    age: 25,
    weight: 75,
    height: 175,
    goal: "Ganhar força",
    level: 1,
    patent: "Bronze",
    subRank: "III",
    xp: 0,
    maxXp: XP_PER_DIVISION,
    wins: 0,
    losses: 0,
    record: 0,
    totalPushups: 0,
    streak: 0,
    avatar: null,
    frame: "basic",
    achievements: [],
    history: []
  });


  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || localStorage.getItem('pwa-installed') === 'true';

    const handleBeforeInstallPrompt = (e: any) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      // O banner está desativado conforme solicitação do usuário
      setShowInstallBanner(false);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowInstallBanner(false);
      localStorage.setItem('pwa-installed', 'true');
      toast.success("✅ Flex Battle instalado com sucesso!");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (isInstalled) {
      setIsStandalone(true);
      setShowInstallBanner(false);
    } else {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      console.log('PWA: Prompting user with deferredPrompt');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA: User choice outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } else {
      console.log('PWA: No deferredPrompt available');
      // No tutorial: if prompt is missing, we still try to trigger the installable state or do nothing
      // Browsers often need a user gesture to show the prompt, which this is.
      // If deferredPrompt is null, we can't "force" a download, but we remove the tutorial toast.
    }
  };

  // Load user data from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile) {
            setUser(prev => ({
              ...prev,
              id: profile.player_id,
              name: profile.name,
              age: profile.age || prev.age,
              weight: profile.weight || prev.weight,
              height: profile.height || prev.height,
              goal: profile.goal || prev.goal,
              level: profile.level,
              xp: Number(profile.xp),
              wins: profile.wins,
              losses: profile.losses,
              record: profile.record,
              totalPushups: profile.total_pushups,
              streak: profile.streak,
              avatar: profile.avatar_url,
              achievements: profile.achievements || [],
            }));

            // Fetch match history
            const { data: matches } = await supabase
              .from('matches')
              .select('*')
              .eq('player_id', session.user.id)
              .order('created_at', { ascending: false })
              .limit(15);
            
            if (matches) {
              setUser(prev => ({
                ...prev,
                history: matches.map(m => ({
                  id: m.id,
                  opp: m.opponent_name,
                  res: m.result === 'win' ? "Vitória" : m.result === 'loss' ? "Derrota" : "Empate",
                  score: `${m.player_score}-${m.opponent_score}`,
                  xp: `+${m.xp_gained}`,
                  date: new Date(m.created_at || Date.now()).toISOString().split('T')[0]
                }))
              }));
            }
            
            // Check if there's a view in the URL (from PWA shortcuts)
            const urlParams = new URLSearchParams(window.location.search);
            const initialView = urlParams.get('view') as View;
            
            if (initialView && ['dashboard', 'multiplayer', 'treino', 'profile', 'ranking'].includes(initialView)) {
              setView(initialView);
            } else {
              setView('dashboard');
            }

            // PWA logic here if needed for state tracking, but banner is removed
            if (!window.matchMedia('(display-mode: standalone)').matches) {
              // Banner removed by user request
            }
          } else {
            console.log("Profile not found, staying in onboarding");
            setView('onboarding-start');
          }
        } else {
          console.log("No active session, checking if we should show auth first");
          setView('onboarding-start');
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setView('onboarding-start');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);



  const updateStats = async (won: boolean, pushups: number, xpGained: number, oppName: string, oppPushups: number) => {
    const newTotalXp = user.xp + xpGained;
    const oldRank = getRankInfo(user.xp);
    const newRank = getRankInfo(newTotalXp);
    
    if (newRank.rankName !== oldRank.rankName) {
      setLevelUpData({ 
        old: oldRank.rankName, 
        new: newRank.rankName 
      });
      confetti({ 
        particleCount: 200, 
        spread: 70, 
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFFFFF', '#60A5FA']
      });
    }

    const { data: { session } } = await supabase.auth.getSession();

    // Save match to database
    if (session?.user) {
      const matchResult = won ? 'win' : (pushups === oppPushups ? 'draw' : 'loss');
      
      await supabase.from('matches').insert({
        player_id: session.user.id,
        opponent_name: oppName,
        duration: duration,
        player_score: pushups,
        opponent_score: oppPushups,
        status: 'completed',
        result: matchResult,
        xp_gained: xpGained
      });

      // Update profile
      const newWins = won ? user.wins + 1 : user.wins;
      const newLosses = matchResult === 'loss' ? user.losses + 1 : user.losses;
      const newRecord = Math.max(user.record, pushups);
      const newTotalPushups = user.totalPushups + pushups;

      await supabase.from('profiles').update({
        xp: newTotalXp,
        wins: newWins,
        losses: newLosses,
        record: newRecord,
        total_pushups: newTotalPushups,
        updated_at: new Date().toISOString()
      }).eq('id', session.user.id);

      // Update local state to match DB
      setUser(prev => {
        const newMatch = {
          id: Math.random().toString(36).substr(2, 9),
          opp: oppName,
          res: won ? "Vitória" : (pushups === oppPushups ? "Empate" : "Derrota"),
          score: `${pushups}-${oppPushups}`,
          xp: `+${xpGained}`,
          date: new Date().toISOString().split('T')[0]
        };

        return {
          ...prev,
          wins: newWins,
          losses: newLosses,
          record: newRecord,
          totalPushups: newTotalPushups,
          xp: newTotalXp,
          patent: newRank.patentName,
          subRank: newRank.subRank,
          level: newRank.level,
          history: [newMatch, ...prev.history].slice(0, 15)
        };
      });
    }
  };

  // Add real-time subscription for rankings and points
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Channel for personal profile updates
      const profileChannel = supabase
        .channel('profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${session.user.id}`
          },
          (payload) => {
            const profile = payload.new;
            const newRank = getRankInfo(Number(profile.xp));
            setUser(prev => ({
              ...prev,
              name: profile.name,
              level: profile.level,
              xp: Number(profile.xp),
              wins: profile.wins,
              losses: profile.losses,
              record: profile.record,
              totalPushups: profile.total_pushups,
              streak: profile.streak,
              avatar: profile.avatar_url,
              achievements: profile.achievements || [],
              patent: newRank.patentName,
              subRank: newRank.subRank,
            }));
          }
        )
        .subscribe();

      // Channel for global ranking updates
      const rankingChannel = supabase
        .channel('ranking-global')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles'
          },
          () => {
            // Signal to ranking components that data has changed
            // This is handled by the useEffect in Ranking component which now needs to listen for changes
            window.dispatchEvent(new CustomEvent('ranking-updated'));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(profileChannel);
        supabase.removeChannel(rankingChannel);
      };
    };

    setupSubscription();
  }, []);

  const renderView = () => {
    if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );

    switch (view) {
      case 'onboarding-start': return <OnboardingStart setView={setView} />;
      case 'quiz': return <Quiz setView={setView} user={user} setUser={setUser} />;
      case 'quiz-result': return <QuizResult setView={setView} user={user} />;
      case 'auth': return <AuthView setView={setView} user={user} />;
      case 'photo-upload': return <PhotoUpload setView={setView} user={user} setUser={setUser} />;
      case 'profile-setup': return <ProfileSetup setView={setView} user={user} setUser={setUser} />;
      case 'profile-ready': return <ProfileReady setView={setView} user={user} />;
      case 'dashboard': return <Dashboard setView={setView} user={user} setSelectedBot={setSelectedBot} setIsTraining={setIsTraining} />;
      case 'treino': return <SelectDuration setView={setView} onSelect={(d) => setDuration(d)} isTraining={true} onStartTraining={() => { setIsTraining(true); setSelectedBot(null); setOpponent(null); setView('challenge'); }} />;
      case 'select-bot': return <SelectBot setView={setView} onSelect={(b) => { setSelectedBot(b); setIsTraining(false); setView('select-duration'); }} />;
      case 'select-duration': return <SelectDuration setView={setView} onSelect={(d) => setDuration(d)} selectedBot={selectedBot} isTraining={isTraining} onStartMatchmaking={() => setView('matchmaking')} />;
      case 'training-setup': return <SelectDuration setView={setView} onSelect={(d) => setDuration(d)} isTraining={true} onStartTraining={() => { setIsTraining(true); setSelectedBot(null); setOpponent(null); setView('challenge'); }} />;
      case 'challenge': return <Challenge bot={selectedBot} opponent={opponent} duration={duration} user={user} isTraining={isTraining} onExit={() => { setView('dashboard'); setSelectedBot(null); setOpponent(null); setIsTraining(false); }} onComplete={updateStats} />;
      case 'matchmaking': return <Matchmaking user={user} onMatchFound={(opp: any) => { setOpponent(opp); setView('challenge'); }} onCancel={() => setView('select-duration')} duration={duration} />;
      case 'profile': return <Profile setView={setView} user={user} setUser={setUser} />;
      case 'settings': return <Profile setView={setView} user={user} setUser={setUser} initialEditing={true} />;
      case 'edit-profile': return <Profile setView={setView} user={user} setUser={setUser} initialEditing={true} />;
      case 'multiplayer': return <Multiplayer setView={setView} user={user} onSelectBot={() => setView('select-bot')} onStartMatchmaking={(training) => { setIsTraining(training); setView('select-duration'); }} />;
      case 'achievements': return <Achievements setView={setView} user={user} />;
      case 'support': return <Support setView={setView} />;
      case 'support-chat': return <SupportChat setView={setView} />;
      case 'history': return <FullHistory setView={setView} user={user} />;
      case 'friend-challenge': return <FriendChallenge setView={setView} user={user} onChallengePlayer={(opp: any) => { setOpponent(opp); setIsTraining(false); setView('select-duration'); }} />;
      case 'ranking': return <Ranking setView={setView} user={user} />;
      case 'patents-list': return <PatentsList setView={setView} user={user} />;
      default: return <OnboardingStart setView={setView} />;
    }

  };


  const isBattleActive = view === 'challenge' && (selectedBot || opponent || isTraining);
  
  useEffect(() => {
    if (isBattleActive) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isBattleActive]);


  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>

      {/* PWA Banner removido a pedido do usuário */}


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
              <Button className="game-button bg-primary w-full py-8 text-xl italic uppercase" onClick={() => setLevelUpData(null)}>CONTINUAR JORNADA</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isBattleActive && !['onboarding-start', 'quiz', 'quiz-result', 'auth', 'photo-upload', 'profile-setup', 'profile-ready'].includes(view) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0B0E14]/95 backdrop-blur-2xl border-t border-white/10 px-4 pb-8 pt-4 flex justify-around items-center z-50">
          {[
            { id: 'dashboard', label: 'Início', icon: Home, color: 'blue' },
            { id: 'achievements', label: 'Conquistas', icon: Award, color: 'purple' },
            { id: 'multiplayer', label: 'Batalha', icon: Swords, color: 'red', aliases: ['select-bot', 'select-duration', 'matchmaking', 'challenge'] },
            { id: 'ranking', label: 'Ranking', icon: Trophy, color: 'blue' },
            { id: 'profile', label: 'Perfil', icon: UserCircle, color: 'orange', aliases: ['history', 'support', 'settings', 'edit-profile'] }
          ].map((item) => {
            const isActive = view === item.id || item.aliases?.includes(view);
            const colorClass = item.color === 'blue' ? 'text-electric-blue' : 
                               item.color === 'purple' ? 'text-purple-evolve' :
                               item.color === 'red' ? 'text-energy-red' : 'text-gold';
            
            const glowClass = item.color === 'blue' ? 'bg-electric-blue/20' : 
                              item.color === 'purple' ? 'bg-purple-evolve/20' :
                              item.color === 'red' ? 'bg-energy-red/20' : 'bg-gold/20';

            return (
              <Button 
                key={item.id}
                variant="ghost" 
                aria-label={`Ir para ${item.label}`}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-75 active:scale-90 btn-respond-fast relative ${isActive ? colorClass : 'text-white/30'}`}
                onClick={() => setView(item.id as View)}
              >
                <item.icon className={`w-6 h-6 transition-all duration-200 ${isActive ? `drop-shadow-[0_0_10px_rgba(var(--${item.color}-rgb),0.5)] fill-current/10` : ''}`} />
                <span className={`text-[8px] font-black uppercase tracking-[0.15em] leading-none mt-1`}>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className={`absolute -bottom-1 w-1 h-1 rounded-full ${glowClass} shadow-[0_0_10px_currentColor]`}
                  />
                )}
                {isActive && (
                  <motion.div 
                    layoutId="nav-glow" 
                    className={`absolute inset-0 ${glowClass} blur-xl rounded-full -z-10`} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                  />
                )}
              </Button>
            );
          })}
        </nav>
      )}
    </div>
  );
}



function Dashboard({ setView, user, setSelectedBot, setIsTraining }: { setView: (v: View) => void, user: any, setSelectedBot: (b: any) => void, setIsTraining: (t: boolean) => void }) {
  const stats = user;
  const rank = getRankInfo(user.xp);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-5 pb-10">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div 
            className="relative w-14 h-14 rounded-full border-2 border-gold shadow-[0_0_15px_rgba(234,179,8,0.4)] p-0.5 cursor-pointer active:scale-95 btn-respond-fast transition-transform"
            onClick={() => setView('edit-profile')}
          >
            <div className="w-full h-full rounded-full overflow-hidden">
              {stats.avatar ? (
                <img src={stats.avatar} className="w-full h-full object-cover" alt={stats.name} />
              ) : (
                <div className="w-full h-full bg-[#1A1F26] flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white/40" />
                </div>
              )}
            </div>
          </div>
          <div>
            <h1 className="font-black text-xl italic text-white tracking-tight leading-none">{(stats.name || 'ATLETA').toUpperCase()}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="bg-purple-evolve/20 border border-purple-evolve/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="text-[10px]">{getRankInfo(user.xp).emoji}</span>
                <span className="text-[9px] font-black text-purple-evolve uppercase tracking-widest">{(rank.patentName || '').toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-1 text-gold">
                <Flame className="w-3 h-3 fill-gold" />
                <span className="text-[11px] font-black">{stats.streak ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div 
          className="bg-purple-evolve/10 border border-purple-evolve/20 rounded-2xl p-2.5 flex items-center gap-3 cursor-pointer active:scale-95 btn-respond-fast transition-all glow-purple"
          onClick={() => toast.info("Recompensas em breve!")}
        >
          <div className="bg-gold/20 p-1.5 rounded-xl">
            <Trophy className="w-5 h-5 text-gold" />
          </div>
          <div className="flex flex-col pr-2">
            <span className="text-[10px] font-black text-white leading-none uppercase tracking-tighter">RECOMPENSAS</span>
            <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Resgate prêmios</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20" />
        </div>
      </header>

      {/* Patent Progress Card */}
      <div 
        className="relative p-6 rounded-[1.8rem] border-2 border-gold bg-[#151921] shadow-[0_0_30px_rgba(234,179,8,0.15)] overflow-hidden cursor-pointer active:scale-[0.95] btn-respond-fast transition-all"
        onClick={() => setView('patents-list')}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-gold/30 flex items-center justify-center bg-gold/5 shadow-[inset_0_0_20px_rgba(234,179,8,0.2)]">
               <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">{rank.emoji}</div>
            </div>
            <div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">{rank.rankName.toUpperCase()}</h2>
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mt-1 opacity-70">SUA PATENTE ATUAL</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-white italic tracking-tighter leading-none">{rank.xpInLevel} / {rank.xpForNext} XP</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${rank.progress}%` }}
              className="h-full bg-gold shadow-[0_0_10px_rgba(234,179,8,0.5)]"
            />
          </div>
          
          <div className="flex justify-between items-center pt-1">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">
              FALTAM {XP_PER_DIVISION - rank.xpInLevel} XP PARA O PRÓXIMO NÍVEL
            </p>
            <button className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors">
              <Star className="w-3.5 h-3.5 text-gold fill-gold" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">VER TRILHAS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          className="bg-electric-blue/5 border border-electric-blue/20 rounded-[1.8rem] p-6 flex flex-col items-center justify-between min-h-[160px] cursor-pointer active:scale-[0.95] btn-respond-fast transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)] border-electric-blue/30"
          onClick={() => setView('multiplayer')}
        >
          <div className="w-14 h-14 rounded-2xl bg-electric-blue/10 flex items-center justify-center mb-4">
            <Swords className="w-8 h-8 text-electric-blue filter drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">PARTIDA RÁPIDA</h3>
            <p className="text-[9px] font-medium text-white/40 leading-tight">Entre em uma partida com jogadores online</p>
          </div>
          <div className="mt-4 bg-electric-blue/20 p-2 rounded-full">
            <ArrowLeft className="w-4 h-4 text-electric-blue rotate-180" />
          </div>
        </div>

        <div 
          className="bg-purple-evolve/5 border border-purple-evolve/20 rounded-[1.8rem] p-6 flex flex-col items-center justify-between min-h-[160px] cursor-pointer active:scale-[0.95] btn-respond-fast transition-all shadow-[0_0_20px_rgba(139,92,246,0.1)] border-purple-evolve/30"
          onClick={() => toast.info("Missões em breve!")}
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-evolve/10 flex items-center justify-center mb-4">
            <LayoutDashboard className="w-8 h-8 text-purple-evolve filter drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">MISSÕES DIÁRIAS</h3>
            <p className="text-[9px] font-medium text-white/40 leading-tight">Complete missões e ganhe recompensas</p>
          </div>
          <div className="mt-4 bg-purple-evolve/20 p-2 rounded-full">
            <ArrowLeft className="w-4 h-4 text-purple-evolve rotate-180" />
          </div>
        </div>
      </div>

      {/* Workout Banner */}
      <div 
        className="bg-energy-red/5 border border-energy-red/20 rounded-[1.8rem] p-5 flex items-center justify-between cursor-pointer active:scale-[0.95] btn-respond-fast transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)] border-energy-red/30"
        onClick={() => setView('treino')}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-energy-red/10 flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-energy-red filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          </div>
          <div>
            <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">MODO TREINO</h3>
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">Aperfeiçoe suas habilidades</p>
          </div>
        </div>
        <div className="bg-energy-red/20 p-2.5 rounded-full">
          <ArrowLeft className="w-5 h-5 text-energy-red rotate-180" />
        </div>
      </div>

      {/* Bottom Stats Footer */}
      {/* Bottom Stats Footer - Recreating WA0087.jpg */}
      <div className="grid grid-cols-4 gap-2 pt-6 border-t border-white/5 mt-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-2 border border-gold/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <Trophy className="w-6 h-6 text-gold neon-text-gold" />
          </div>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">VITÓRIAS</span>
          <span className="text-2xl font-black text-white italic drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{stats.wins ?? 0}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-electric-blue/10 flex items-center justify-center mb-2 border border-electric-blue/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Target className="w-6 h-6 text-electric-blue neon-text-blue" />
          </div>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">RECORDE</span>
          <span className="text-2xl font-black text-white italic drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{stats.record ?? 0}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-energy-red/10 flex items-center justify-center mb-2 border border-energy-red/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <Flame className="w-6 h-6 text-energy-red neon-text-red" />
          </div>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">OFENSIVA</span>
          <span className="text-2xl font-black text-white italic drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{stats.streak ?? 0}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-evolve/10 flex items-center justify-center mb-2 border border-purple-evolve/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <Zap className="w-6 h-6 text-purple-evolve neon-text-purple" />
          </div>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">TOTAL</span>
          <span className="text-2xl font-black text-white italic drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{stats.totalPushups ?? 0}</span>
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
                  <p className="font-black text-lg italic text-white tracking-tight leading-tight">{(bot.name || '').toUpperCase()}</p>
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

function SelectDuration({ setView, onSelect, selectedBot, onStartMatchmaking, isTraining, onStartTraining }: { setView: (v: View) => void, onSelect: (d: number) => void, selectedBot?: any, onStartMatchmaking?: () => void, isTraining?: boolean, onStartTraining?: () => void }) {
  const [localDuration, setLocalDuration] = useState(60);
  const durations = [
    { label: '30 seg', value: 30 },
    { label: '1 min', value: 60 },
    { label: '2 min', value: 120 },
    { label: '3 min', value: 180 },
    { label: '5 min', value: 300 },
  ];

  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-6 flex flex-col min-h-screen pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView(isTraining ? 'dashboard' : (selectedBot ? 'select-bot' : 'multiplayer'))}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">{isTraining ? '⏱️ ESCOLHA O TEMPO' : '⚔️ ESCOLHA A DURAÇÃO'}</h2>
      </div>


      <div className="grid gap-4 flex-1">
        {durations.map(d => (
          <Button 
            key={d.value} 
            variant="ghost"
            className={`game-button h-20 text-xl tracking-tighter italic border-2 transition-all ${localDuration === d.value ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/5 text-white'}`}
            onClick={() => {
              setLocalDuration(d.value);
              onSelect(d.value);
            }}
          >
            <div className="flex items-center justify-between w-full px-4">
              <span className="flex items-center gap-3">
                <Timer className={`w-6 h-6 ${localDuration === d.value ? 'text-primary' : 'text-white/40'}`} />
                {(d.label || '').toUpperCase()}
              </span>
              {localDuration === d.value && <Check className="w-6 h-6" />}
            </div>
          </Button>
        ))}
      </div>

      <Button 
        className="game-button bg-primary w-full py-8 text-xl italic uppercase mt-8 shadow-[0_8px_0_0_rgba(29,78,216,0.5)] active:translate-y-[8px] active:shadow-none transition-all"
        onClick={() => {
          if (isTraining && onStartTraining) {
            onStartTraining();
          } else if (selectedBot) {
            setView('challenge');
          } else if (onStartMatchmaking) {
            onStartMatchmaking();
          }
        }}
      >
        {isTraining ? "💪 COMEÇAR TREINO" : (selectedBot ? "⚔️ INICIAR DESAFIO" : "⚔️ ENCONTRAR ADVERSÁRIO")}
      </Button>

    </motion.div>
  );
}


function Challenge({ bot, opponent, duration, user, onExit, onComplete, isTraining }: { bot: any, opponent?: any, duration: number, user: any, onExit: () => void, onComplete: (won: boolean, pushups: number, xpGained: number, oppName: string, oppPushups: number) => void, isTraining?: boolean }) {
  const activeOpponent = bot || opponent;
  const [playerPushups, setPlayerPushups] = useState(0);
  const [oppPushups, setOppPushups] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [gameState, setGameState] = useState<'loading' | 'countdown' | 'playing' | 'finished'>('loading');
  const [countdown, setCountdown] = useState(5);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [lastWhoIsAhead, setLastWhoIsAhead] = useState<'player' | 'opponent' | null>(null);

  const handlePlayerCount = useCallback((count: number) => {
    setPlayerPushups(count);
  }, []);

  const handleCameraReady = () => {
    setIsCameraReady(true);
    setGameState('countdown');
  };

  const battleMessage = useMemo(() => {
    if (gameState !== 'playing' || isTraining) return "";
    const diff = playerPushups - oppPushups;
    if (diff > 5 && lastWhoIsAhead !== 'player') {
      setLastWhoIsAhead('player');
      return "🔥 VOCÊ ESTÁ DOMINANDO!";
    }
    if (diff < -5 && lastWhoIsAhead !== 'opponent') {
      setLastWhoIsAhead('opponent');
      return `⚠️ ${activeOpponent?.name || 'ADVERSÁRIO'} ACELEROU!`;
    }
    if (Math.abs(diff) <= 2 && lastWhoIsAhead !== null) {
      setLastWhoIsAhead(null);
      return "⚔️ DISPUTA ACIRRADA!";
    }
    return "";
  }, [playerPushups, oppPushups, gameState, lastWhoIsAhead, activeOpponent, isTraining]);

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
        
        if (!isTraining) {
          let increment = 0;
          if (bot) {
            const baseRate = bot.pushupRate || 0.1;
            const adaptiveFactor = playerPushups > oppPushups ? 1.3 : 0.7;
            const rate = baseRate * adaptiveFactor;
            
            const guaranteed = Math.floor(rate);
            const chance = rate - guaranteed;
            increment = guaranteed + (Math.random() < chance ? 1 : 0);
          } else if (opponent) {
            const baseRate = (opponent.record / 60) * 0.9; 
            increment = Math.random() < baseRate ? 1 : 0;
          }

          if (increment > 0) {
            setOppPushups(b => b + increment);
          }
        }
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('finished');
      const won = isTraining ? true : playerPushups >= oppPushups;
      
      if (won) {
        confetti({ 
          particleCount: 250, 
          spread: 80, 
          origin: { y: 0.6 },
          colors: ['#FFD700', '#60A5FA', '#F43F5E']
        });
        onComplete(true, playerPushups, isTraining ? playerPushups * 2 : 150 + playerPushups, activeOpponent?.name || 'TREINO', oppPushups);
      } else {
        onComplete(false, playerPushups, 45 + playerPushups, activeOpponent?.name || 'BOT', oppPushups);
      }
    }
  }, [timeLeft, bot, opponent, activeOpponent, gameState, countdown, playerPushups, oppPushups, onComplete, isTraining]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-[#0A0F1E] flex flex-col overflow-hidden">
      {/* HUD Superior — Mobile Optimized */}
      <div className="relative pt-8 px-4 pb-4 bg-gradient-to-b from-black/80 to-transparent z-20">
        <div className="max-w-md mx-auto">
          {/* Side-by-side Profiles */}
          <div className="flex justify-between items-center px-6">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-0.5 shadow-lg border border-white/20">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 flex items-center justify-center">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-primary" />}
                </div>
              </div>
              <span className="text-[9px] font-black italic text-white uppercase mt-1 tracking-tighter truncate max-w-[70px]">{user.name}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-0.5">TEMPO</span>
              <div className="bg-black/60 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/10 shadow-2xl">
                <span className={`text-3xl font-black italic tabular-nums leading-none tracking-tighter ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            </div>

            {!isTraining ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-energy-red to-red-800 p-0.5 shadow-lg border border-white/20">
                  <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 flex items-center justify-center">
                    <img src={activeOpponent?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeOpponent?.id || 'bot'}`} className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-[9px] font-black italic text-white uppercase mt-1 tracking-tighter truncate max-w-[70px]">{activeOpponent?.name || 'ADVERSÁRIO'}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 p-0.5 shadow-lg border border-dashed border-yellow-500/40 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-gold" />
                </div>
                <span className="text-[9px] font-black italic text-gold uppercase mt-1 tracking-tighter">RECORDE</span>
              </div>
            )}
          </div>

          {/* Large Flexões Label and Counters */}
          <div className="mt-6 text-center">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic">FLEXÕES</span>
            <div className={`flex ${isTraining ? 'justify-center gap-12' : 'justify-between px-10'} items-center mt-2`}>
              <div className="flex flex-col items-center">
                <motion.span 
                  key={playerPushups}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-7xl font-black italic text-white leading-none drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                >
                  {playerPushups}
                </motion.span>
                {isTraining && <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest mt-1">ATUAIS</span>}
              </div>

              {!isTraining && (
                <motion.span 
                  key={oppPushups}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-7xl font-black italic text-white leading-none drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                >
                  {oppPushups}
                </motion.span>
              )}

              {isTraining && (
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black italic text-gold/60 leading-none mt-4">{user.record}</span>
                  <span className="text-[8px] font-black text-gold/40 uppercase tracking-widest mt-1">MELHOR</span>
                </div>
              )}
            </div>
          </div>

          {/* Battle Bar */}
          {!isTraining && (
            <div className="px-6">
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10 flex p-[1.5px] shadow-inner">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                  initial={{ width: '50%' }}
                  animate={{ 
                    width: `${(playerPushups / (playerPushups + oppPushups || 1)) * 100}%` 
                  }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Camera View */}
      <div className="flex-1 relative bg-black">
        <PushUpCounter 
          isActive={true} 
          onCount={handlePlayerCount} 
          onReady={handleCameraReady}
          soundEnabled={true}
        />
        
        <AnimatePresence>
          {battleMessage && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="absolute bottom-12 left-0 right-0 flex justify-center z-20 pointer-events-none"
            >
              <div className={`backdrop-blur-3xl px-10 py-4 rounded-3xl border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors duration-500 ${lastWhoIsAhead === 'player' ? 'bg-primary/20 border-primary/50 text-primary' : lastWhoIsAhead === 'opponent' ? 'bg-energy-red/20 border-energy-red/50 text-energy-red' : 'bg-black/60 border-white/10 text-white'}`}>
                <p className="text-xl font-black italic uppercase tracking-tighter">{battleMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons Overlay */}
        <div className="absolute top-4 right-4 z-30">
          <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/50" onClick={onExit}>
             <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {gameState === 'countdown' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[110] bg-black/60 backdrop-blur-xl pointer-events-none"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
              animate={{ scale: 1.5, rotate: 0, opacity: 1 }}
              exit={{ scale: 4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex flex-col items-center"
            >
              <span className="text-[180px] font-black italic text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.8)] leading-none">
                {countdown === 0 ? "🔥 VAI!" : countdown}
              </span>

              <p className="text-white/40 font-black italic tracking-[0.5em] mt-8 uppercase animate-pulse">
                PREPARE-SE
              </p>
            </motion.div>
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
                <Trophy className={`w-20 h-20 mx-auto ${isTraining || playerPushups >= oppPushups ? 'text-gold' : 'text-muted-foreground opacity-50'}`} />
                <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase">
                  {isTraining ? "CONCLUÍDO!" : (playerPushups >= oppPushups ? "VITÓRIA!" : "DERROTA!")}
                </h2>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest italic">
                  {isTraining ? `TOTAL DE FLEXÕES: ${playerPushups}` : `RESULTADO FINAL: ${playerPushups} vs ${oppPushups}`}
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
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">XP Ganho</p>
                  <p className="text-xl font-black text-primary">+{isTraining ? playerPushups * 2 : (playerPushups >= oppPushups ? 150 + playerPushups : 45 + playerPushups)}</p>
                </div>
                {!isTraining && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Rival</p>
                    <p className="text-xl font-black text-energy-red">{oppPushups}</p>
                  </div>
                )}
              </div>

              <Button onClick={onExit} className="game-button bg-primary w-full py-8 text-xl italic uppercase">SAIR DO DUELO</Button>
            </div>
          </motion.div>
        )}

        {gameState === 'loading' && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-[120] bg-[#0B0E14]"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Camera className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="font-black italic text-white tracking-[0.3em] text-[10px] mt-8 uppercase tracking-widest">📷 PREPARANDO CAMERAS...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


function Profile({ setView, user, setUser, initialEditing = false }: { setView: (v: View) => void, user: any, setUser: any, initialEditing?: boolean }) {
  const [editing, setEditing] = useState(initialEditing);
  const [formData, setFormData] = useState({ 
    name: user?.name || '',
    age: user?.age || 0,
    weight: user?.weight || 0,
    height: user?.height || 0,
    goal: user?.goal || 'Bater recordes',
    avatar: user?.avatar || null
  });

  useEffect(() => {
    if (initialEditing) {
      setEditing(true);
      // Sync formData when entering edit mode to ensure we have latest data
      setFormData({ 
        name: user?.name || '',
        age: user?.age || 0,
        weight: user?.weight || 0,
        height: user?.height || 0,
        goal: user?.goal || 'Bater recordes',
        avatar: user?.avatar || null
      });
    }
  }, [initialEditing, user]);

  const stats = user;
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("⚠️ O nome do atleta não pode estar vazio.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("⚠️ Sessão não encontrada. Faça login novamente.");
        setIsSaving(false);
        return;
      }

      // Prepare data for Supabase
      const updateData: any = {
        name: (formData.name || '').toUpperCase().trim(),
        age: parseInt(String(formData.age)) || 0,
        weight: parseInt(String(formData.weight)) || 0,
        height: parseInt(String(formData.height)) || 0,
        avatar_url: formData.avatar,
        goal: (['Ganhar força', 'Perder peso', 'Condicionamento', 'Massa muscular', 'Melhorar minhas flexões', 'Bater recordes', 'Vencer outras pessoas', 'Chegar ao topo do ranking'].includes(formData.goal) ? formData.goal : 'Bater recordes'),
        updated_at: new Date().toISOString()
      };

      console.log("Updating profile for user:", session.user.id, updateData);

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', session.user.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      // Update global state
      setUser((prev: any) => ({
        ...prev,
        name: updateData.name,
        age: updateData.age,
        weight: updateData.weight,
        height: updateData.height,
        goal: updateData.goal,
        avatar: updateData.avatar_url
      }));

      setEditing(false);
      setView('profile'); // Force view back to profile just in case

      toast.success("✅ Perfil atualizado com sucesso!", {
        className: "font-black italic text-xs uppercase tracking-widest bg-card border-green-500/50 text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]"
      });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast.error("❌ Erro ao atualizar perfil", {
        description: err.message || "Verifique sua conexão e tente novamente."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (editing) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 space-y-6 pb-10">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setEditing(false)}><ArrowLeft className="w-5 h-5" /></Button>
          <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">EDITAR DADOS</h2>
        </div>

        <div className="glass-panel p-6 space-y-6 border-gold/20 relative overflow-hidden">
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
                <div className="flex flex-col items-center gap-1">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Alterar Foto</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-[10px] font-black uppercase h-8 px-4" onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'user';
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
                 <Camera className="w-3 h-3 mr-1" /> Câmera
               </Button>
               <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-[10px] font-black uppercase h-8 px-4" onClick={() => {
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
                 <ImageIcon className="w-3 h-3 mr-1" /> Galeria
               </Button>
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Objetivo Fitness</label>
              <div className="relative">
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black text-white focus:outline-none focus:border-primary appearance-none h-[58px] italic"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                >
                  <option value="Ganhar força" className="bg-[#1A1F2C] text-white uppercase">GANHAR FORÇA</option>
                  <option value="Perder peso" className="bg-[#1A1F2C] text-white uppercase">PERDER PESO</option>
                  <option value="Condicionamento" className="bg-[#1A1F2C] text-white uppercase">CONDICIONAMENTO</option>
                  <option value="Massa muscular" className="bg-[#1A1F2C] text-white uppercase">MASSA MUSCULAR</option>
                  <option value="Melhorar minhas flexões" className="bg-[#1A1F2C] text-white uppercase">MELHORAR FLEXÕES</option>
                  <option value="Bater recordes" className="bg-[#1A1F2C] text-white uppercase">BATER RECORDES</option>
                  <option value="Vencer outras pessoas" className="bg-[#1A1F2C] text-white uppercase">VENCER PESSOAS</option>
                  <option value="Chegar ao topo do ranking" className="bg-[#1A1F2C] text-white uppercase">TOPO DO RANKING</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="game-button bg-primary w-full py-8 mt-4 text-xl italic uppercase tracking-tighter shadow-[0_8px_0_0_rgba(29,78,216,0.5)] active:translate-y-[8px] active:shadow-none transition-all">
            {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Salvar"}
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView('dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-tight">PERFIL</h2>
      </div>

      <div className="flex flex-col items-center gap-6 relative py-4">
        {/* Avatar and Info Header */}
        <div className="relative group">
          <div className="w-36 h-36 bg-secondary rounded-full border-[3px] border-gold p-1 shadow-[0_0_30px_rgba(234,179,8,0.2)] group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
            <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {stats.avatar ? (
                <img src={stats.avatar} className="w-full h-full object-cover" alt={stats.name} />
              ) : (
                <UserIcon className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
            <div 
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => setEditing(true)}
            >
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-gold p-2 rounded-full border-[3px] border-[#05070A] shadow-lg">
            <Star className="w-5 h-5 text-[#05070A]" />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h3 className="font-black text-4xl text-white tracking-tighter italic uppercase leading-none">
            {(stats?.name || 'ATLETA').toUpperCase()}
          </h3>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors" onClick={copyId}>
              <span className="text-[10px] font-mono text-white/60 tracking-wider">ID: {stats?.id || '---'}</span>
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-white/40" />}
            </div>
            
            <Badge 
              className="bg-gold/10 text-gold border-gold/20 px-4 py-1.5 font-black italic tracking-widest text-[10px] uppercase cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setView('patents-list')}
            >
              {getRankInfo(stats?.xp || 0).emoji} {getRankInfo(stats?.xp || 0).rankName.toUpperCase()}
            </Badge>
          </div>

          {/* Physical info capsule */}
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 mt-2">
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{stats?.weight || 0}KG</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{stats?.age || 0} ANOS</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{stats?.height || 0}CM</span>
          </div>
        </div>

        {/* Progress Card */}
        <div 
          className="w-full glass-panel p-6 space-y-4 cursor-pointer active:scale-[0.95] btn-respond-fast transition-all premium-glow-gold"
          onClick={() => setView('patents-list')}
        >
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">EVOLUÇÃO</span>
              <span className="text-lg font-black italic text-white leading-none uppercase">Nível {getRankInfo(stats?.xp || 0).level}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black italic text-gold leading-none">{getRankInfo(stats?.xp || 0).xpInLevel}</span>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">/ {XP_PER_DIVISION} XP</span>
            </div>
          </div>
          
          <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${getRankInfo(stats?.xp || 0).progress}%` }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-gold to-yellow-600 rounded-full"
            />
          </div>
          
          <div className="flex justify-center">
            <span className="text-[8px] font-black text-gold/60 uppercase tracking-[0.3em] animate-pulse">TOQUE PARA VER PATENTES</span>
          </div>
        </div>

        {/* Stats Grid - Premium Neon Visual */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="bg-[#0A0D14] p-5 rounded-3xl text-center border border-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.05)] hover:bg-green-500/5 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3 border border-green-500/20">
              <Trophy className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">VITÓRIAS</p>
            <p className="text-2xl font-black text-white italic">{stats.wins ?? 0}</p>
          </div>
          
          <div className="bg-[#0A0D14] p-5 rounded-3xl text-center border border-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.05)] hover:bg-blue-500/5 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">RECORDE</p>
            <p className="text-2xl font-black text-white italic">{stats.record ?? 0}</p>
          </div>
          
          <div className="bg-[#0A0D14] p-5 rounded-3xl text-center border border-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.05)] hover:bg-purple-500/5 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3 border border-purple-500/20">
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">TOTAL</p>
            <p className="text-2xl font-black text-white italic">{stats.totalPushups ?? 0}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4 w-full pt-4">
          <Button 
            variant="ghost" 
            aria-label="Ver Histórico de Partidas"
            className="premium-glow-blue bg-[#0F131A] p-6 h-auto flex justify-between items-center rounded-[2rem] hover:bg-blue-500/5 transition-all active:scale-[0.95] btn-respond-fast focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => setView('history')}
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <LayoutDashboard className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-xl font-black text-white italic tracking-tighter leading-none uppercase">HISTÓRICO</p>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">
                  {stats?.history?.length > 0 ? "PARTIDAS ANTERIORES" : "JOGADOR SEM PARTIDA"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/20" />
          </Button>

          <Button 
            variant="ghost" 
            aria-label="Acessar Suporte e Atendimento"
            className="premium-glow-green bg-[#0F131A] p-6 h-auto flex justify-between items-center rounded-[2rem] hover:bg-green-500/5 transition-all active:scale-[0.95] btn-respond-fast focus-visible:ring-2 focus-visible:ring-green-500"
            onClick={() => setView('support')}
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-left">
                <p className="text-xl font-black text-white italic tracking-tighter leading-none uppercase">SUPORTE</p>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest mt-1">AJUDA E ATENDIMENTO</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/20" />
          </Button>

          <Button 
            variant="ghost" 
            className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white/40 transition-colors py-8"
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) {
                toast.error("Erro ao sair");
              } else {
                window.location.reload();
              }
            }}
          >
            SAIR DA CONTA
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function FullHistory({ setView, user }: { setView: (v: View) => void, user: any }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6 pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => setView('profile')}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter">HISTÓRICO</h2>
      </div>

      <div className="space-y-4">
        {user.history && user.history.length > 0 ? (
          user.history.map((match: any) => (
            <div key={match.id} className="glass-panel p-5 flex items-center justify-between border-white/5 active:scale-[0.95] btn-respond-fast transition-all" role="article" aria-label={`Partida contra ${match.opp}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg border-2 border-white/20 overflow-hidden ${match.res === 'Vitória' ? 'bg-green-500' : 'bg-energy-red'}`}>
                  {BOTS.find(b => b.name === match.opp || b.name + ' "Lendário"' === match.opp) ? (
                    <img src={BOTS.find(b => b.name === match.opp || b.name + ' "Lendário"' === match.opp)?.avatar} className="w-full h-full object-cover" alt={`Avatar de ${match.opp}`} />
                  ) : (
                    match.opp[0]
                  )}
                </div>
                <div>
                  <p className="font-black text-lg italic text-white tracking-tight">{(match.opp || '').toUpperCase()}</p>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{match.score} • {match.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black italic ${match.res === 'Vitória' ? 'text-green-500' : 'text-energy-red'}`}>{(match.res || '').toUpperCase()}</p>
                <p className="text-[10px] text-gold font-black italic">{match.xp} XP</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 glass-panel p-8 border-white/5 bg-[#0F131A]/50">
            <LayoutDashboard className="w-16 h-16 text-white/10 mx-auto mb-6" />
            <p className="text-xl font-black text-white/40 uppercase italic tracking-tighter">Jogador sem partida</p>
            <p className="text-xs text-white/20 mt-2 uppercase tracking-widest">COMECE UMA BATALHA AGORA!</p>
          </div>
        )}
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
        app: "O Flex Battle é a arena definitiva para competidores de flexões. Temos sistema de patentes (Bronze a Lendário), bots profissionais e multiplayer online real.",
        treino: "No modo treino, nossa IA de postura analisa cada movimento seu. É o lugar perfeito para aperfeiçoar sua forma antes de ir para a batalha.",
        duelo: "Os duelos são o coração do app. Você pode enfrentar bots ou jogadores reais. Quem fizer mais flexões válidas no tempo escolhido vence.",
        conta: "Seu progresso é sagrado. Nível, XP, patentes e conquistas são salvos na sua conta e exibidos no seu Card de Atleta.",
        patentes: "Nosso sistema competitivo: Bronze, Prata, Ouro, Platina, Diamante, Pro, Mestre e Lendário. Cada patente tem 3 divisões.",
        xp: "Ganhe XP vencendo duelos, completando treinos e desbloqueando conquistas. Mais XP significa patentes maiores.",
        conquistas: "Medalhas e troféus são dados por marcos como '100 flexões em um dia' ou '10 vitórias seguidas'.",
        bots: "Desafie 5 níveis: Iniciante, Determinado, Guerreiro, Máquina e o lendário David Goggins. Eles não cansam, e você?",
        multiplayer: "Jogue contra o mundo no Matchmaking Aleatório ou desafie amigos diretamente usando o ID único do jogador.",
        perfil: "Seu perfil mostra sua evolução. Você pode ver seu score, recordes e estatísticas detalhadas de cada treino.",
        ajuda: "Sou a Arena AI, seu suporte 24h. Posso falar sobre treinos, tecnologia, estudos ou qualquer curiosidade! Como posso te motivar hoje?",
      };

      // IA mais flexível e abrangente
      if (lower.includes('exercício') || lower.includes('flexão') || lower.includes('treinar')) {
        response = knowledge.treino + " " + knowledge.bots;
      } else if (lower.includes('patente') || lower.includes('rank') || lower.includes('bronze') || lower.includes('lendário')) {
        response = knowledge.patentes;
      } else if (lower.includes('estudar') || lower.includes('aprendizado') || lower.includes('conhecimento')) {
        response = "O conhecimento é como o músculo: cresce com a repetição e o desafio. No Flex Battle, focamos no corpo, mas a mente disciplinada é o que te leva ao topo. O que você quer aprender hoje?";
      } else if (lower.includes('tecnologia') || lower.includes('programação') || lower.includes('ia')) {
        response = "Utilizo Visão Computacional de ponta com MediaPipe para analisar seu corpo em tempo real. A tecnologia está aqui para potencializar seu esforço humano!";
      } else if (lower.includes('ajuda') || lower.includes('socorro') || lower.includes('como funciona')) {
        response = knowledge.ajuda;
      } else {
        // Resposta genérica mas contextualizada para IA
        response = "Interessante! Como sua Arena AI, estou sempre aprendendo. " + 
                  (lower.length > 5 ? `Sobre "${userMsg}", posso dizer que a disciplina que você aplica nas flexões serve para qualquer área da vida. ` : "") +
                  "Quer saber mais sobre o Flex Battle ou quer conversar sobre outro desafio?";
      }

      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 800);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] bg-[#0B0E14] flex flex-col p-6 gap-6">
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

      <div className="flex-1 glass-panel p-4 flex flex-col gap-4 overflow-y-auto no-scrollbar bg-black/40">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium shadow-xl ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none border-b-4 border-blue-700' 
                  : 'bg-white/10 text-white/90 rounded-tl-none border border-white/10 backdrop-blur-md'
              }`}
            >
              {msg.text}
            </motion.div>
          </div>
        ))}
        {input && input.length > 0 && (
           <div className="flex justify-start">
             <div className="bg-white/5 p-3 rounded-2xl flex gap-1 items-center">
               <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
           </div>
        )}
      </div>

      <div className="flex gap-2 pb-2">
        <input 
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 font-bold text-white focus:outline-none focus:border-primary transition-all placeholder:text-white/20"
          placeholder="Pergunte qualquer coisa..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} className="game-button bg-primary w-14 h-14 p-0 flex items-center justify-center rounded-2xl shadow-[0_4px_0_0_rgba(29,78,216,1)]">
          <Target className="w-6 h-6 rotate-90" />
        </Button>
      </div>
    </motion.div>
  );
}

function Matchmaking({ user, onMatchFound, onCancel, duration }: { user: any, onMatchFound: (opp: any) => void, onCancel: () => void, duration: number }) {
  const [status, setStatus] = useState('searching');
  const [dots, setDots] = useState('');
  const [matchedOpponent, setMatchedOpponent] = useState<any>(null);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    // Simulate matchmaking
    const timer = setTimeout(() => {
      setStatus('found');
      const opp = {
        id: 'PUSH-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        name: ['BRUNO FERRAZ', 'ANA BEAST', 'MARCOS PUSH', 'LUCAS ELITE', 'CARLA FORÇA'][Math.floor(Math.random() * 5)],
        level: user.level + Math.floor(Math.random() * 3) - 1,
        patent: user.patent,
        record: user.record + Math.floor(Math.random() * 10) - 5,
        avatar: null
      };
      setMatchedOpponent(opp);
      
      // Auto-start after showing opponent
      setTimeout(() => {
        onMatchFound(opp);
      }, 3000);
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(timer);
    };
  }, [user, onMatchFound]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 text-center">
      {status === 'searching' ? (
        <div className="space-y-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center">
              <Globe className="w-16 h-16 text-primary animate-pulse" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-t-primary border-transparent rounded-full"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">Encontrando adversário{dots}</h2>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Buscando oponentes com nível e patente semelhantes</p>
          </div>
          <Button variant="ghost" onClick={onCancel} className="text-energy-red font-black uppercase tracking-widest italic">Cancelar Busca</Button>
        </div>
      ) : (
        <div className="w-full max-w-sm space-y-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase">OPONENTE ENCONTRADO!</h2>
            <p className="text-xs font-black text-primary uppercase tracking-widest animate-pulse">A PARTIDA VAI COMEÇAR EM {duration / 60 >= 1 ? `${duration / 60} MIN` : `${duration} SEG`}</p>
          </div>
          
          <div className="flex items-center justify-center gap-4">
             {/* Player */}
             <div className="flex-1 space-y-3">
               <div className="w-20 h-20 mx-auto bg-primary/20 rounded-2xl border-2 border-primary flex items-center justify-center overflow-hidden">
                 {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-primary" />}
               </div>
               <div>
                 <p className="text-xs font-black text-white italic truncate">{user.name}</p>
                 <Badge className="bg-primary/20 text-[8px] h-3 border-none">{user.patent}</Badge>
               </div>
             </div>
             
             <div className="text-4xl font-black italic text-white opacity-20">VS</div>
             
             {/* Opponent */}
             <div className="flex-1 space-y-3">
               <div className="w-20 h-20 mx-auto bg-energy-red/20 rounded-2xl border-2 border-energy-red flex items-center justify-center overflow-hidden">
                 <UserIcon className="w-10 h-10 text-energy-red" />
               </div>
               <div>
                 <p className="text-xs font-black text-white italic truncate">{matchedOpponent?.name}</p>
                 <Badge className="bg-energy-red/20 text-[8px] h-3 border-none">{matchedOpponent?.patent}</Badge>
               </div>
             </div>
          </div>

          <div className="glass-panel p-4 bg-white/5 border-white/5 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase">Nível</p>
              <p className="text-lg font-black text-white">{matchedOpponent?.level}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-muted-foreground uppercase">Recorde</p>
              <p className="text-lg font-black text-gold">{matchedOpponent?.record}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Multiplayer({ setView, user, onSelectBot, onStartMatchmaking }: { setView: (v: View) => void, user: any, onSelectBot: () => void, onStartMatchmaking: (isTraining: boolean) => void }) {
  const [searchId, setSearchId] = useState('');
  const [foundPlayer, setFoundPlayer] = useState<any>(null);

  const handleSearch = () => {
    if (searchId.trim().toUpperCase().startsWith('PUSH-')) {
      setFoundPlayer({
        id: searchId.toUpperCase(),
        name: 'JOGADOR ENCONTRADO',
        level: 12,
        patent: 'Prata',
        record: 45,
        avatar: null
      });
    } else {
      setFoundPlayer(null);
      toast.error("Jogador não encontrado");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 space-y-6 pb-10">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-tight">MULTIJOGADOR</h2>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">COMPITA. VENÇA. DOMINE.</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5 w-10 h-10" onClick={() => setView('dashboard')}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Partida Rápida (Large Card) */}
        <div 
          className="relative h-48 rounded-[2rem] border border-energy-red/20 bg-gradient-to-br from-energy-red/20 to-energy-red/5 p-6 flex flex-col justify-center gap-2 cursor-pointer active:scale-[0.95] btn-respond-fast transition-all glow-red group"
          onClick={() => onStartMatchmaking(false)}
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-energy-red/20 flex items-center justify-center border border-energy-red/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">PARTIDA RÁPIDA</h3>
              <p className="text-xs font-medium text-white/60 uppercase tracking-widest mt-2">ENTRE EM UMA PARTIDA ALEATÓRIA</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">COMPETIÇÃO ONLINE REAL</span>
              </div>
            </div>
            <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white rotate-180" />
            </div>
          </div>
        </div>

        {/* Small Cards Row */}
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="bg-electric-blue/5 border border-electric-blue/10 rounded-[1.8rem] p-6 flex flex-col gap-4 min-h-[160px] cursor-pointer active:scale-[0.95] btn-respond-fast transition-all glow-primary group"
            onClick={() => setView('friend-challenge')}
          >
            <div className="w-12 h-12 rounded-2xl bg-electric-blue/10 flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-electric-blue" />
            </div>
            <div>
              <h3 className="text-lg font-black italic text-white uppercase tracking-tighter leading-none">JOGAR COM AMIGOS</h3>
              <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest mt-2">CONVITE SEUS AMIGOS E JOGUEM JUNTOS</p>
            </div>
            <div className="self-end bg-white/5 p-1.5 rounded-full mt-auto">
              <ArrowLeft className="w-4 h-4 text-white rotate-180" />
            </div>
          </div>

          <div 
            className="bg-card border border-white/5 rounded-[1.8rem] p-6 flex flex-col gap-4 min-h-[160px] cursor-pointer active:scale-[0.95] btn-respond-fast transition-all group"
            onClick={onSelectBot}
          >
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h3 className="text-lg font-black italic text-white uppercase tracking-tighter leading-none">TREINO VS BOTS</h3>
              <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest mt-2">APRIMORE SUAS HABILIDADES CONTRA BOTS</p>
            </div>
            <div className="self-end bg-white/5 p-1.5 rounded-full mt-auto">
              <ArrowLeft className="w-4 h-4 text-white rotate-180" />
            </div>
          </div>
        </div>

        {/* Search Player (Full Width) */}
        <div className="bg-[#1A1F26]/30 border border-white/5 rounded-[1.8rem] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-white/40" />
            <div>
              <h3 className="text-sm font-black italic text-white uppercase tracking-tighter leading-none">BUSCAR JOGADOR</h3>
              <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest mt-1">ENCONTRE E DESAFIE QUALQUER JOGADOR</p>
            </div>
          </div>
          <div className="flex gap-3">
            <input 
              className="flex-1 bg-[#0B0E14] border border-white/10 rounded-2xl px-5 h-14 font-mono text-sm text-white focus:outline-none focus:border-electric-blue transition-all"
              placeholder="ID do jogador"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            />
            <Button 
              onClick={handleSearch} 
              className="premium-challenge-btn h-14 px-8 flex items-center justify-center gap-3"
            >
              <Swords className="w-5 h-5 neon-text-blue" />
              <span className="text-sm">DESAFIAR</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FriendChallenge({ setView, user, onChallengePlayer }: { setView: (v: View) => void, user: any, onChallengePlayer: (opp: any) => void }) {
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
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, xp, record, wins, streak, avatar_url, player_id')
          .order('xp', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (data) {
          setRankingData(data.map(p => ({
            id: p.id,
            name: p.name,
            count: Number(p.xp),
            avatar: p.name.substring(0, 2).toUpperCase(),
            avatarUrl: p.avatar_url,
            isUser: p.player_id === user.id,
            record: p.record,
            wins: p.wins,
            streak: p.streak,
            patent: getRankInfo(Number(p.xp)).patentName
          })));
        }
      } catch (err) {
        console.error("Error fetching ranking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();

    // Listen for real-time updates
    const handleUpdate = () => fetchRanking();
    window.addEventListener('ranking-updated', handleUpdate);

    return () => {
      window.removeEventListener('ranking-updated', handleUpdate);
    };
  }, [user.id, tab]);
  
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 pb-20">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">RANKING</h2>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/5 w-10 h-10" onClick={() => setView('dashboard')}>
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
        </div>
        
        <div className="flex p-1.5 bg-[#0A0D14] rounded-full border border-white/5">
          <button 
            onClick={() => setTab('local')}
            className={`flex-1 py-3 text-xs font-black italic rounded-full transition-all tracking-widest ${tab === 'local' ? 'bg-electric-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-white/40 hover:text-white'}`}
          >
            🇧🇷 BRASIL
          </button>
          <button 
            onClick={() => setTab('friends')}
            className={`flex-1 py-3 text-xs font-black italic rounded-full transition-all tracking-widest ${tab === 'friends' ? 'bg-electric-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-white/40 hover:text-white'}`}
          >
            👥 AMIGOS
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-electric-blue animate-spin" />
          </div>
        ) : rankingData.length === 0 ? (
          <div className="text-center py-20 glass-panel p-8 border-white/5 bg-[#0F131A]/50">
            <Trophy className="w-16 h-16 text-white/10 mx-auto mb-6" />
            <p className="text-xl font-black text-white/40 uppercase italic tracking-tighter">O Ranking está vazio.</p>
            <p className="text-xs text-white/20 mt-2 uppercase tracking-widest">SEJA O PRIMEIRO A PONTUAR!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankingData.map((player: any, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={player.id} 
                className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all premium-glow-blue relative overflow-hidden ${player.isUser ? 'bg-electric-blue/10 border-electric-blue/30 scale-[1.02] z-10' : 'bg-[#0F131A] border-white/5'}`}
              >
                <div className={`w-10 flex justify-center items-center font-black text-2xl italic ${i === 0 ? 'text-gold' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-white/20'}`}>
                  {i + 1}º
                </div>
                
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-white text-xl overflow-hidden border-2 ${player.isUser ? 'border-electric-blue/40' : 'border-white/10'} bg-muted shadow-lg`}>
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} className="w-full h-full object-cover" alt={player.name} />
                  ) : (
                    <span className="opacity-40">{player.avatar}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-white text-lg tracking-tighter italic truncate uppercase leading-none">
                      {player.name}
                    </span>
                    <span className="text-lg">{getPatentEmoji(player.patent)}</span>
                    {player.isUser && (
                      <Badge className="bg-electric-blue text-[8px] h-4 py-0 font-black italic rounded-full border-none px-2">VOCÊ</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-[9px] font-black text-white/40 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Target className="w-3 h-3 text-gold/60" /> {player.record}</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-electric-blue/60" /> {player.wins}W</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-energy-red/60" /> {player.streak}D</span>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-white italic tracking-tighter leading-none">{player.count.toLocaleString()}</span>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">PONTOS</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Achievements({ setView, user }: { setView: (v: View) => void, user: any }) {
  const achievements = useMemo(() => [
    { 
      id: 'flexoes', 
      label: 'Flexões', 
      icon: Dumbbell,
      items: [
        { title: "Primeira Flexão", desc: "Comece sua jornada", req: 1, current: user.totalPushups, reward: "XP +50", icon: Zap },
        { title: "10 Flexões", desc: "Aquecendo os motores", req: 10, current: user.totalPushups, reward: "XP +100", icon: Zap },
        { title: "25 Flexões", desc: "Já é um começo", req: 25, current: user.totalPushups, reward: "XP +150", icon: Dumbbell },
        { title: "50 Flexões", desc: "Metade de cem", req: 50, current: user.totalPushups, reward: "XP +250", icon: Dumbbell },
        { title: "100 Flexões", desc: "Mostre consistência", req: 100, current: user.totalPushups, reward: "Medalha Bronze", icon: Award },
        { title: "250 Flexões", desc: "Atleta em formação", req: 250, current: user.totalPushups, reward: "XP +500", icon: Award },
        { title: "500 Flexões", desc: "Resistência pura", req: 500, current: user.totalPushups, reward: "XP +1000", icon: Target },
        { title: "1.000 Flexões", desc: "Guerreiro Mil", req: 1000, current: user.totalPushups, reward: "Moldura Mil", icon: Shield },
        { title: "2.500 Flexões", desc: "Força bruta", req: 2500, current: user.totalPushups, reward: "XP +2500", icon: Shield },
        { title: "5.000 Flexões", desc: "Máquina de guerra", req: 5000, current: user.totalPushups, reward: "XP +5000", icon: Star },
        { title: "10.000 Flexões", desc: "Lenda da Arena", req: 10000, current: user.totalPushups, reward: "Avatar Lendário", icon: Sparkles },
      ]
    },
    { 
      id: 'multiplayer', 
      label: 'Multiplayer', 
      icon: Swords,
      items: [
        { title: "Primeira Partida Online", desc: "Entre no campo de batalha", req: 1, current: user.wins + user.losses, reward: "XP +100", icon: Globe },
        { title: "Primeira Vitória", desc: "Vença um duelo real", req: 1, current: user.wins, reward: "XP +200", icon: Trophy },
        { title: "5 Vitórias", desc: "Início promissor", req: 5, current: user.wins, reward: "XP +500", icon: Trophy },
        { title: "10 Vitórias", desc: "Competidor Nato", req: 10, current: user.wins, reward: "Medalha Prata", icon: Medal },
        { title: "25 Vitórias", desc: "Veterano de Combate", req: 25, current: user.wins, reward: "XP +1500", icon: Swords },
        { title: "50 Vitórias", desc: "Elite da Arena", req: 50, current: user.wins, reward: "Título Mestre", icon: Star },
        { title: "100 Vitórias", desc: "Imbatível", req: 100, current: user.wins, reward: "Moldura Diamante", icon: Sparkles },
      ]
    },
    { 
      id: 'ofensiva', 
      label: 'Ofensiva', 
      icon: Flame,
      items: [
        { title: "3 Dias Seguidos", desc: "Foco inicial", req: 3, current: user.streak, reward: "XP +150", icon: Flame },
        { title: "7 Dias Seguidos", desc: "Uma semana de aço", req: 7, current: user.streak, reward: "XP +400", icon: Flame },
        { title: "14 Dias Seguidos", desc: "Hábito formado", req: 14, current: user.streak, reward: "Medalha Fogo", icon: Award },
        { title: "30 Dias Seguidos", desc: "Mês da superação", req: 30, current: user.streak, reward: "XP +2000", icon: Target },
      ]
    },
  ], [user]);

  const [activeCat, setActiveCat] = useState('flexoes');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 space-y-6 pb-20 overflow-y-auto max-h-[calc(100vh-80px)]">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-tight">CONQUISTAS</h2>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Acompanhe seu progresso e conquiste tudo!</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5 w-10 h-10" onClick={() => setView('dashboard')}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'MELHOR RECORDE', val: user.record, sub: 'FLEXÕES', icon: Target, color: 'text-gold', border: 'border-gold/20' },
          { label: 'TOTAL FLEXÕES', val: user.totalPushups, sub: 'FLEXÕES', icon: Dumbbell, color: 'text-electric-blue', border: 'border-electric-blue/20' },
          { label: 'SEQUÊNCIA DIAS', val: user.streak, sub: 'DIAS 🔥', icon: Flame, color: 'text-energy-red', border: 'border-energy-red/20' },
          { label: 'SEQUÊNCIA VITÓRIAS', val: user.wins, sub: 'VITÓRIAS', icon: Swords, color: 'text-electric-blue', border: 'border-electric-blue/20' },
          { label: 'MELHOR DESEMPENHO', val: user.record, sub: 'RECENTE', icon: TrendingUp, color: 'text-green-400', border: 'border-green-400/20' },
          { label: 'ÚLTIMA CONQUISTA', val: 'Elite', sub: 'RANK PRO', icon: Medal, color: 'text-purple-evolve', border: 'border-purple-evolve/20' },
        ].map((item, i) => (
          <div key={i} className={`bg-[#151921] border ${item.border} rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center h-32`}>
            <item.icon className={`w-6 h-6 ${item.color}`} />
            <div className="space-y-0.5">
              <p className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-tight">{item.label}</p>
              <div className="text-2xl font-black italic text-white leading-none">{item.val}</div>
              <p className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-tight">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Toggle */}
      <div className="flex bg-[#151921] p-1.5 rounded-2xl border border-white/5" role="tablist" aria-label="Categorias de Conquistas">
        {achievements.map((cat: any) => (
          <Button 
            key={cat.id} 
            role="tab"
            aria-selected={activeCat === cat.id}
            aria-controls={`achievement-panel-${cat.id}`}
            aria-label={`Ver conquistas de ${cat.label}`}
            onClick={() => setActiveCat(cat.id)}
            className={`flex-1 h-12 rounded-xl transition-all border-none shadow-none font-black text-[10px] uppercase tracking-tighter italic focus-visible:ring-2 focus-visible:ring-electric-blue ${activeCat === cat.id ? 'bg-electric-blue text-white glow-primary' : 'bg-transparent text-white/40 hover:text-white'}`}
          >
            <cat.icon className="w-4 h-4 mr-2" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Achievement List */}
      <div 
        className="space-y-3 pb-20" 
        id={`achievement-panel-${activeCat}`}
        role="tabpanel"
        aria-label={`Lista de conquistas: ${achievements.find(c => c.id === activeCat)?.label}`}
      >
        {achievements.find((c: any) => c.id === activeCat)?.items.map((ach: any, i: number) => {
          const isCompleted = ach.current >= ach.req;
          const progress = Math.min((ach.current / ach.req) * 100, 100);

          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#151921] rounded-[1.8rem] p-5 border border-white/5 flex items-center gap-4 active:scale-[0.95] btn-respond-fast transition-all group focus-within:ring-2 focus-within:ring-electric-blue h-auto min-h-[120px]"
              role="group"
              aria-label={`Conquista: ${ach.title}. Status: ${isCompleted ? 'Concluída' : 'Em progresso'}. Requisito: ${ach.req}. Atual: ${ach.current}. Recompensa: ${ach.reward}.`}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 ${isCompleted ? 'bg-electric-blue/20 border-electric-blue/40 text-electric-blue' : 'bg-white/5 border-white/10 text-white/20'}`}>
                <Zap className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-black italic text-white uppercase tracking-tighter leading-tight truncate">{ach.title.toUpperCase()}</h4>
                    <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest mt-1 break-words">{ach.desc.toUpperCase()}</p>
                  </div>
                  <div className="text-[9px] font-black text-electric-blue uppercase tracking-widest shrink-0">
                    {ach.reward}
                  </div>
                </div>
                
                <div className="mt-4 space-y-1.5">
                  <div className="h-1.5 w-full bg-[#0B0E14] rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full ${isCompleted ? 'bg-electric-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}
                    />
                  </div>
                  <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] flex justify-between">
                    <span>{ach.current} / {ach.req}</span>
                    {isCompleted && <span className="text-electric-blue font-black">CONCLUÍDO</span>}
                  </div>
                </div>
              </div>
              
              <ChevronRight className="w-4 h-4 text-white/10 shrink-0" />
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
    { name: "Prata", min: 1500, emoji: "🥈", color: "from-slate-400 to-slate-200", rewards: ["Moldura Prateada", "XP +10%"], divisions: ["III", "II", "I"] },
    { name: "Ouro", min: 3000, emoji: "🥇", color: "from-yellow-600 to-yellow-300", rewards: ["Moldura Dourada", "XP +25%"], divisions: ["III", "II", "I"] },
    { name: "Platina", min: 4500, emoji: "💠", color: "from-cyan-600 to-blue-400", rewards: ["Efeito Ciano", "XP +40%"], divisions: ["III", "II", "I"] },
    { name: "Diamante", min: 6000, emoji: "💎", color: "from-blue-600 to-cyan-300", rewards: ["Moldura Diamante", "XP +60%"], divisions: ["III", "II", "I"] },
    { name: "Pro", min: 7500, emoji: "🔥", color: "from-red-600 to-orange-500", rewards: ["Efeito de Fogo", "XP +100%"], divisions: ["III", "II", "I"] },
    { name: "Mestre", min: 9000, emoji: "👑", color: "from-purple-600 to-pink-500", rewards: ["Coroa Especial", "XP +150%"], divisions: ["III", "II", "I"] },
    { name: "Lendário", min: 10500, emoji: "🌟", color: "from-gold to-white", rewards: ["Aura Lendária", "XP +200%"], divisions: ["III", "II", "I"] }

  ];

  const currentInfo = getRankInfo(user.xp);
  
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 pb-10 space-y-6">
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
            <h3 className="font-black text-2xl italic text-white uppercase tracking-tighter leading-none mb-1">{currentInfo.rankName}</h3>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">PATENTE ATUAL</p>
          </div>
        </div>
        
        <div className="space-y-3 relative">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span>XP Atual: {currentInfo.xpInLevel}</span>
            <span>Meta: {currentInfo.xpForNext} XP</span>
          </div>
          <Progress 
            value={currentInfo.progress} 
            className="h-3 bg-white/5 border border-white/5" 
          />
          {!currentInfo.isMax && (
             <p className="text-[10px] font-black text-gold italic text-center uppercase tracking-wider animate-pulse mt-2">
               Faltam {currentInfo.xpForNext - currentInfo.xpInLevel} XP para a próxima divisão
             </p>
          )}
        </div>
      </div>


      <div className="space-y-6 relative mt-10">
        <div className="absolute left-[39px] top-10 bottom-10 w-1 bg-gradient-to-b from-primary/50 via-white/5 to-transparent z-0" />
        
        {patents.map((p, i) => {
          const isUnlocked = currentInfo.totalXp >= p.min;
          const isCurrent = currentInfo.patentName === p.name;
          const isNext = !isUnlocked && (i === 0 || currentInfo.totalXp >= patents[i-1].min);


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
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{p.min} XP</span>
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

const OnboardingStart = ({ setView }: { setView: (v: View) => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#0B0E14] relative overflow-hidden">
    {/* Background Glows */}
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-600/20 blur-[100px] rounded-full" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-red-600/20 blur-[100px] rounded-full" />
    
    <div className="flex flex-col items-center justify-center z-10 w-full max-w-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-48 h-48 mb-2"
      >
        <img src={logoAsset.url} className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" alt="Flex Battle Logo" />
      </motion.div>

      <div className="space-y-1 text-center mb-8">
        <h1 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none text-shadow-lg flex flex-col items-center">
          <span className="text-primary">FLEX</span>
          <span>BATTLE</span>
        </h1>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.3em] leading-relaxed">
          "Desafie seus limites."
        </p>
      </div>

      <div className="w-full space-y-4 max-w-[280px]">
        <Button 
          className="game-button bg-primary w-full py-7 text-xl italic uppercase shadow-[0_6px_0_0_rgba(29,78,216,0.5)] active:translate-y-[6px] active:shadow-none transition-all" 
          onClick={() => setView('quiz')}
        >
          🔥 COMEÇAR
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full text-white/30 uppercase text-[9px] font-black tracking-[0.2em] hover:text-white"
          onClick={() => setView('auth')}
        >
          JÁ TENHO UMA CONTA
        </Button>
      </div>
    </div>
  </motion.div>
);

const Quiz = ({ setView, user, setUser }: { setView: (v: View) => void, user: any, setUser: (u: any) => void }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<any>({
    age: '',
    weight: '',
    height: '',
    level: '',
    objective: '',
    time: '',
    motivation: ''
  });
  
  const questions = [
    { 
      id: 'age',
      q: "🎂 QUAL É A SUA IDADE?", 
      type: 'select',
      opts: ["-18", "18–25", "26–35", "36–45", "46–55", "55+"] 
    },
    { 
      id: 'weight',
      q: "⚖️ QUAL É O SEU PESO (KG)?", 
      type: 'number',
      placeholder: "Ex: 75"
    },
    { 
      id: 'height',
      q: "📏 QUAL É A SUA ALTURA (CM)?", 
      type: 'number',
      placeholder: "Ex: 175"
    },
    { 
      id: 'level',
      q: "💪 QUAL O SEU NÍVEL ATUAL?", 
      type: 'select',
      opts: ["Iniciante (0-10)", "Intermediário (11-30)", "Avançado (31-50)", "Elite (50+)"] 
    },
    { 
      id: 'objective',
      q: "🎯 QUAL É O SEU OBJETIVO?", 
      type: 'select',
      opts: ["Ganhar Massa", "Perder Peso", "Resistência", "Competir no Topo"] 
    },
    { 
      id: 'time',
      q: "⏱️ QUANTO TEMPO POR DIA?", 
      type: 'select',
      opts: ["15 min", "30 min", "1 hora", "Mais de 1 hora"] 
    }
  ];

  const current = questions[step - 1];

  const next = () => {
    if (step < questions.length) {
      setStep(s => s + 1);
    } else {
      const goalMap: Record<string, string> = {
        "Ganhar Massa": "Massa muscular",
        "Perder Peso": "Perder peso",
        "Resistência": "Condicionamento",
        "Competir no Topo": "Chegar ao topo do ranking"
      };
      
      setUser({
        ...user,
        goal: goalMap[answers.objective] || 'Bater recordes',
        height: parseInt(String(answers.height)) || 0,
        weight: parseInt(String(answers.weight)) || 0,
        age: answers.age
      });
      
      // Salvar respostas temporárias para o cadastro
      localStorage.setItem('quiz_answers', JSON.stringify(answers));
      localStorage.setItem('onboarding_registration', 'true');
      setView('auth');
    }
  };

  const select = (opt: string) => {
    setAnswers({ ...answers, [current.id]: opt });
    setTimeout(next, 300);
  };

  const handleNumberInput = (val: string) => {
    setAnswers({ ...answers, [current.id]: val });
    
    // Update local user state
    if (current.id === 'weight') {
      setUser((prev: any) => ({ ...prev, weight: parseInt(val) || 0 }));
    } else if (current.id === 'height') {
      setUser((prev: any) => ({ ...prev, height: parseInt(val) || 0 }));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14] relative overflow-hidden">
      <div className="pt-12 px-6 space-y-4 z-20">
        <div className="flex justify-between items-end">
          <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">ETAPA {step} / {questions.length}</p>
          <p className="text-[10px] font-black uppercase text-muted-foreground">{Math.round((step/questions.length)*100)}%</p>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
            initial={{ width: 0 }}
            animate={{ width: `${(step / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 justify-center z-10 w-full max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-black italic text-white uppercase leading-tight tracking-tighter text-center">
              {current.q}
            </h2>

            {current.type === 'select' ? (
              <div className="grid gap-3">
                {current.opts?.map((opt, i) => (
                  <motion.div
                    key={opt}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Button 
                      variant="outline" 
                      className={`w-full h-16 text-sm font-black uppercase border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary transition-all justify-between px-6 rounded-2xl group shadow-lg active:scale-[0.95] btn-respond-fast relative overflow-hidden ${answers[current.id] === opt ? 'border-primary bg-primary/20' : ''}`} 
                      onClick={() => select(opt)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 text-muted-foreground group-hover:text-primary transition-colors font-mono text-xs">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="flex-1 text-left">{opt}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${answers[current.id] === opt ? 'border-primary bg-primary' : 'border-white/10 group-hover:border-primary'}`}>
                        <Check className={`w-4 h-4 text-white ${answers[current.id] === opt ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <input 
                    type="number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder={current.placeholder}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-6 text-4xl font-black italic text-center text-white focus:outline-none focus:border-primary focus:bg-primary/5 transition-all"
                    value={answers[current.id]}
                    onChange={(e) => handleNumberInput(e.target.value)}
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none">
                    <span className="text-white/20 font-black italic text-xl uppercase">{current.id === 'weight' ? 'KG' : 'CM'}</span>
                  </div>
                </div>
                <Button 
                  className="game-button w-full py-8 text-2xl italic uppercase shadow-[0_8px_0_0_rgba(29,78,216,0.5)] active:translate-y-[8px] active:shadow-none transition-all"
                  onClick={next}
                  disabled={!answers[current.id]}
                >
                  PRÓXIMO →
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="absolute top-1/2 left-[-20%] w-[60%] h-[40%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[40%] h-[30%] bg-energy-red/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
};

const QuizResult = ({ setView, user }: { setView: (v: View) => void, user: any }) => {
  useEffect(() => {
    // Redireciona automaticamente para o cadastro após o quiz, removendo passos extras
    localStorage.setItem('onboarding_registration', 'true');
    setView('auth');
  }, [setView]);

  return (
    <div className="p-6 space-y-8 text-center flex flex-col items-center justify-center min-h-screen bg-[#0B0E14]">
      <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">PREPARANDO SUA ARENA...</h2>
    </div>
  );
};

const AuthView = ({ setView, user }: { setView: (v: View) => void, user: any }) => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(() => {
    const isReg = localStorage.getItem('onboarding_registration') === 'true';
    if (isReg) localStorage.removeItem('onboarding_registration');
    return !isReg;
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user.name === "GUERREIRO ALPHA" ? "" : user.name);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      toast.error("⚠️ Preencha todos os campos corretamente.");
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user) {
          toast.success("✅ Login realizado com sucesso!");
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (profile) {
            window.location.reload();
          } else {
            setView('photo-upload');
          }
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });
        if (error) throw error;
        toast.success("✅ Conta criada!");
        setView('photo-upload');
      }
    } catch (err: any) {
      console.error("Erro na autenticação:", err);
      toast.error(err.message || "❌ Erro ao processar autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14] p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />
      
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 z-10 w-full max-w-md mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-32 h-32 relative mb-0"
        >
          <img src={logoAsset.url} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" alt="Logo" />
        </motion.div>

        <div className="w-full space-y-1 text-center">
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none flex flex-col items-center">
            <span className="text-primary">FLEX</span>
            <span>BATTLE</span>
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
            {isLogin ? "DE VOLTA À ARENA" : "INICIE SUA JORNADA"}
          </p>
        </div>

        <div className="w-full space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 flex items-center gap-2">
                <UserIcon className="w-3 h-3" /> NOME DE USUÁRIO
              </label>
              <input 
                className="w-full bg-white/5 p-5 rounded-2xl text-white border border-white/10 focus:border-primary focus:bg-primary/5 outline-none transition-all font-bold italic tracking-tight" 
                placeholder="Ex: GUERREIRO" 
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
              />
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 flex items-center gap-2">
              <Mail className="w-3 h-3" /> E-MAIL
            </label>
            <input 
              className="w-full bg-white/5 p-5 rounded-2xl text-white border border-white/10 focus:border-primary focus:bg-primary/5 outline-none transition-all font-bold italic tracking-tight" 
              placeholder="seu@email.com" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 flex items-center gap-2">
              <Lock className="w-3 h-3" /> SENHA
            </label>
            <input 
              className="w-full bg-white/5 p-5 rounded-2xl text-white border border-white/10 focus:border-primary focus:bg-primary/5 outline-none transition-all font-bold italic tracking-tight" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {isLogin && (
            <button className="text-[10px] font-black text-primary uppercase tracking-widest ml-4 hover:text-white transition-colors">
              ESQUECI MINHA SENHA
            </button>
          )}
        </div>

        <Button 
          className="game-button w-full py-8 text-2xl italic uppercase shadow-[0_8px_0_0_rgba(29,78,216,0.5)] active:translate-y-[8px] active:shadow-none transition-all mt-4" 
          onClick={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>{isLogin ? "ENTRANDO..." : "CRIANDO CONTA..."}</span>
            </div>
          ) : (isLogin ? "ENTRAR" : "CRIAR CONTA")}
        </Button>

        <Button 
          variant="ghost" 
          className="w-full text-white/40 uppercase text-[10px] font-black tracking-[0.2em] hover:text-white"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Ainda não possui uma conta? Criar conta" : "Já possui uma conta? Entrar"}
        </Button>
      </div>
    </div>
  );
};


const PhotoUpload = ({ setView, user, setUser }: { setView: (v: View) => void, user: any, setUser: (u: any) => void }) => {
  const [preview, setPreview] = useState<string | null>(user.avatar || null);
  
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        const result = re.target?.result as string;
        setPreview(result);
        setUser({ ...user, avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14] p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full" />
      
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 z-10 w-full max-w-md mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">📸 FOTO DE ATLETA</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">IDENTIDADE DE GUERRA</p>
        </div>

        <div className="relative mx-auto group">
          <div className="w-48 h-48 rounded-full bg-white/5 border-4 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-primary/5 shadow-2xl">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Plus className="w-12 h-12" />
                <span className="text-[10px] font-black uppercase tracking-widest">Adicionar</span>
              </div>
            )}
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            onChange={handleFile}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <Button variant="outline" className="h-16 border-white/10 bg-white/5 uppercase font-black relative overflow-hidden rounded-2xl active:scale-95 btn-respond-fast">
            <Camera className="w-4 h-4 mr-2" /> Câmera
            <input type="file" accept="image/*" capture="user" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} />
          </Button>
          <Button variant="outline" className="h-16 border-white/10 bg-white/5 uppercase font-black relative overflow-hidden rounded-2xl active:scale-95 btn-respond-fast">
            <ImageIcon className="w-4 h-4 mr-2" /> Galeria
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} />
          </Button>
        </div>

        <div className="flex-1" />
        
        <Button 
          className="game-button w-full py-8 text-2xl italic uppercase shadow-[0_8px_0_0_rgba(29,78,216,0.5)] active:translate-y-[8px] active:shadow-none transition-all" 
          onClick={() => setView('profile-setup')}
          disabled={!preview}
        >
          PRÓXIMO PASSO →
        </Button>
      </div>
    </div>
  );
};

const ProfileSetup = ({ setView, user, setUser }: { setView: (v: View) => void, user: any, setUser: (u: any) => void }) => {
  const [formData, setFormData] = useState({
    name: user.name === "GUERREIRO ALPHA" ? "" : (user.name || ""),
    age: user.age || '',
    weight: user.weight || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const save = async () => {
    // Validação
    if (!formData.name.trim() || !formData.age || !formData.weight) {
      toast.error("⚠️ Complete seu perfil antes de continuar.", {
        description: "Preencha nome, idade e peso corretamente."
      });
      return;
    }

    setIsSaving(true);
    setStatus('saving');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Sessão não encontrada");

      const updatedUser = {
        ...user,
        name: (formData.name || '').toUpperCase().trim(),
        age: parseInt(String(formData.age)) || 0,
        weight: parseInt(String(formData.weight)) || 0
      };

      // Garantir que temos um player_id válido
      const playerId = user.id && user.id.startsWith('PLAYER-') 
        ? user.id 
        : `PLAYER-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      console.log("Saving profile for user:", session.user.id, "with player_id:", playerId);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          player_id: playerId,
          name: updatedUser.name || user.name,
          age: updatedUser.age,
          weight: updatedUser.weight,
          height: parseInt(String(user.height)) || 0,
          avatar_url: user.avatar,
          goal: (user.goal && ['Ganhar força', 'Perder peso', 'Condicionamento', 'Massa muscular', 'Melhorar minhas flexões', 'Bater recordes', 'Vencer outras pessoas', 'Chegar ao topo do ranking'].includes(user.goal) ? user.goal : 'Bater recordes') as any,
          level: user.level || 1,
          xp: user.xp || 0,
          total_pushups: user.totalPushups || 0,
          wins: user.wins || 0,
          losses: user.losses || 0,
          record: user.record || 0,
          streak: user.streak || 0,
          updated_at: new Date().toISOString()
        } as any, { 
          onConflict: 'id'
        });

      if (error) {
        console.error("Supabase upsert error:", error);
        throw error;
      }

      // Verificação dupla com delay curto para garantir propagação
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: verify, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (verifyError) {
        console.error("Verification error:", verifyError);
        throw verifyError;
      }
      
      if (!verify) {
        console.error("Profile not found after save");
        throw new Error("Erro na verificação do perfil: não encontrado após salvar");
      }

      console.log("Profile saved and verified successfully:", verify);

      setUser({
        ...updatedUser,
        id: verify.player_id,
        xp: Number(verify.xp),
        level: verify.level,
        wins: verify.wins,
        losses: verify.losses,
        record: verify.record,
        totalPushups: verify.total_pushups,
        streak: verify.streak,
        avatar: verify.avatar_url
      });
      
      setStatus('success');
      
      setTimeout(() => {
        setView('dashboard');
      }, 1500);

    } catch (err: any) {
      console.error("Erro fatal ao salvar perfil:", err);
      setStatus('error');
      setIsSaving(false);
      toast.error("❌ Não conseguimos salvar seu perfil.", {
        description: err.message || "Tente novamente em instantes."
      });
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14] p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full" />
      
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 z-10 w-full max-w-md mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">💪 INFORMAÇÕES FINAIS</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">QUASE LÁ, ATLETA</p>
        </div>
        
        <div className="w-full space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4">Nome de Atleta</label>
            <input 
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-black italic text-white focus:outline-none focus:border-primary transition-all text-xl uppercase tracking-tight"
              placeholder="EX: GUERREIRO"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: (e.target.value || '').toUpperCase()})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 text-center block">Idade</label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-black italic text-white focus:outline-none focus:border-primary transition-all text-center text-xl"
                placeholder="00"
                value={formData.age}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 120)) {
                    setFormData({...formData, age: val});
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-4 text-center block">Peso (kg)</label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 font-black italic text-white focus:outline-none focus:border-primary transition-all text-center text-xl"
                placeholder="00"
                value={formData.weight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 500)) {
                    setFormData({...formData, weight: val});
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1" />
        
        <Button 
          className={`game-button w-full py-8 text-2xl italic uppercase transition-all shadow-[0_8px_0_0_rgba(0,0,0,0.3)] active:translate-y-[8px] active:shadow-none ${
            status === 'success' ? 'bg-green-600' : 
            status === 'error' ? 'bg-red-600' : 'bg-primary shadow-[0_8px_0_0_rgba(29,78,216,0.5)]'
          }`} 
          onClick={save}
          disabled={isSaving || status === 'success'}
        >
          {status === 'saving' ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" /> ⏳ CRIANDO CONTA...
            </span>
          ) : status === 'success' ? (
            "✅ CONTA CRIADA!"
          ) : status === 'error' ? (
            "❌ TENTAR NOVAMENTE"
          ) : (
            "CRIAR CONTA →"
          )}
        </Button>
      </div>
    </div>
  );
};

const ProfileReady = ({ setView, user }: { setView: (v: View) => void, user: any }) => (
  <div className="p-6 text-center space-y-8 flex flex-col items-center justify-center min-h-screen">
    <h2 className="text-4xl font-black italic text-primary">🎉 PERFIL CRIADO!</h2>
    <p className="text-muted-foreground">"Agora sua jornada começa."</p>
    <Button className="game-button w-full" onClick={() => setView('dashboard')}>🔥 COMEÇAR</Button>
  </div>
);



