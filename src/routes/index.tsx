import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
   Trophy, Dumbbell, Swords, Medal, TrendingUp, User as UserIcon,
   Flame, ArrowLeft, Timer, Shield, Target, ChevronRight, Home, LayoutDashboard, UserCircle, Star,
   Copy, Check, Search, Zap, Award, Sparkles, Pencil, Camera, Image as ImageIcon, Globe, Loader2, X, Plus,
   Mail, Lock, HelpCircle, Gift, AlertCircle
 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PushUpCounter } from "@/components/PushUpCounter";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/shield_logo.png.asset.json";
import quizBgAsset from "@/assets/quiz_background.png.asset.json";

export const Route = createFileRoute("/")({
  component: App,
});


type View = 'onboarding-start' | 'quiz' | 'quiz-result' | 'auth' | 'photo-upload' | 'profile-setup' | 'profile-ready' | 'dashboard' | 'challenge' | 'select-bot' | 'select-duration' | 'profile' | 'settings' | 'edit-profile' | 'multiplayer' | 'achievements' | 'support' | 'support-chat' | 'history' | 'friend-challenge' | 'ranking' | 'patents-list' | 'matchmaking' | 'pvp-battle' | 'training-setup' | 'treino' | 'daily-reward' | 'daily-missions';

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

const NeonFireWrapper = ({ children, color, onClick, className = "", intense = false }: { children: React.ReactNode, color: string, intense?: boolean, onClick?: () => void, className?: string }) => {
  const getGlowColor = () => {
    switch(color) {
      case 'gold': return 'rgba(255, 215, 0, 0.4)';
      case 'blue': return 'rgba(0, 210, 255, 0.4)';
      case 'purple': return 'rgba(168, 85, 247, 0.4)';
      case 'red': return 'rgba(255, 49, 49, 0.4)';
      case 'green': return 'rgba(34, 197, 94, 0.4)';
      default: return 'rgba(0, 210, 255, 0.4)';
    }
  };

  const glowColor = getGlowColor();

  return (
    <motion.div 
      className={`relative rounded-[1.8rem] overflow-hidden ${className}`}
      onClick={onClick}
      initial={false}
      whileTap={{ scale: 0.98 }}
      style={{ 
        '--glow-color': glowColor
      } as any}
    >
      {/* Animated Neon Border */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-[1.8rem] z-10"
        animate={{
          boxShadow: intense ? [
            `0 0 20px ${glowColor.replace('0.4', '0.3')}`,
            `0 0 40px ${glowColor.replace('0.4', '0.6')}`,
            `0 0 20px ${glowColor.replace('0.4', '0.3')}`
          ] : [
            `0 0 10px ${glowColor.replace('0.4', '0.15')}`,
            `0 0 20px ${glowColor.replace('0.4', '0.3')}`,
            `0 0 10px ${glowColor.replace('0.4', '0.15')}`
          ],
          borderColor: intense ? [
            glowColor.replace('0.4', '0.4'),
            glowColor.replace('0.4', '0.8'),
            glowColor.replace('0.4', '0.4')
          ] : [
            glowColor.replace('0.4', '0.2'),
            glowColor.replace('0.4', '0.4'),
            glowColor.replace('0.4', '0.2')
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          border: '1.5px solid',
          borderColor: glowColor.replace('0.4', '0.2')
        }}
      />
      
      {/* Tap Interaction Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-20"
        whileTap={{ 
          boxShadow: `inset 0 0 40px ${glowColor.replace('0.4', '0.6')}, 0 0 35px ${glowColor.replace('0.4', '0.8')}`,
          borderColor: glowColor.replace('0.4', '0.9')
        }}
        transition={{ duration: 0.1 }}
      />

      {children}
    </motion.div>
  );
};

function App() {
  const [view, setView] = useState<View>('onboarding-start');
  const [navigationHistory, setNavigationHistory] = useState<View[]>([]);
  
  const handleSetView = useCallback((newView: View, replace: boolean = false) => {
    setView(prev => {
      if (!replace) {
        setNavigationHistory(history => [...history, prev]);
      }
      return newView;
    });
  }, []);

  const goBack = useCallback(() => {
    setNavigationHistory(history => {
      if (history.length === 0) {
        setView('dashboard');
        return [];
      }
      const newHistory = [...history];
      const previousView = newHistory.pop()!;
      setView(previousView);
      return newHistory;
    });
  }, []);

  const [selectedBot, setSelectedBot] = useState<any | null>(null);
  const [opponent, setOpponent] = useState<any | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [duration, setDuration] = useState(60);
  const [levelUpData, setLevelUpData] = useState<{old: string, new: string} | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [incomingChallenge, setIncomingChallenge] = useState<any>(null);

  useEffect(() => {
    const handleChallenge = (e: any) => {
      setIncomingChallenge(e.detail);
    };
    window.addEventListener('challenge-received', handleChallenge);
    return () => window.removeEventListener('challenge-received', handleChallenge);
  }, []);

  const acceptChallenge = (challenge: any) => {
    setOpponent({
      id: challenge.challenger_id,
      name: "DESAFIANTE",
      avatar: null,
      record: 0,
      patent: "Bronze"
    });
    setDuration(challenge.duration);
    setIsTraining(false);
    setSelectedBot(null);
    setIncomingChallenge(null);
    setView('challenge');
  };


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
      
      // Update missions progress
      await supabase.rpc('increment_mission_progress', { p_user_id: session.user.id, p_type: 'pushups', p_amount: pushups } as any);
      await supabase.rpc('increment_mission_progress', { p_user_id: session.user.id, p_type: 'matches', p_amount: 1 } as any);
      await supabase.rpc('increment_mission_progress', { p_user_id: session.user.id, p_type: 'battles', p_amount: 1 } as any);
      if (won) await supabase.rpc('increment_mission_progress', { p_user_id: session.user.id, p_type: 'wins', p_amount: 1 } as any);
      await supabase.rpc('increment_mission_progress', { p_user_id: session.user.id, p_type: 'xp', p_amount: xpGained } as any);
    }
  };

  // Add real-time subscription for rankings and points
  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Heartbeat for online status
      const heartbeat = setInterval(async () => {
        await supabase
          .from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', session.user.id);
      }, 30000);

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

      // Channel for friend requests and challenges
      const socialChannel = supabase
        .channel('social-interactions')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friendships',
            filter: `friend_id=eq.${session.user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT' && payload.new.status === 'pending') {
              toast.info("Nova solicitação de amizade!");
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'challenges',
            filter: `challenged_id=eq.${session.user.id}`
          },
          (payload) => {
            if (payload.new.status === 'pending') {
              // We'll handle showing the challenge invite modal here via global state if needed
              // For now, let's just trigger a custom event that the Dashboard or other components can listen to
              window.dispatchEvent(new CustomEvent('challenge-received', { detail: payload.new }));
            }
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
            window.dispatchEvent(new CustomEvent('ranking-updated'));
          }
        )
        .subscribe();

      return () => {
        clearInterval(heartbeat);
        supabase.removeChannel(profileChannel);
        supabase.removeChannel(rankingChannel);
        supabase.removeChannel(socialChannel);
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
      case 'onboarding-start': return <OnboardingStart setView={handleSetView} />;
      case 'quiz': return <Quiz setView={handleSetView} user={user} setUser={setUser} />;
      case 'quiz-result': return <QuizResult setView={handleSetView} user={user} />;
      case 'auth': return <AuthView setView={handleSetView} user={user} />;
      case 'photo-upload': return <PhotoUpload setView={handleSetView} user={user} setUser={setUser} />;
      case 'profile-setup': return <ProfileSetup setView={handleSetView} user={user} setUser={setUser} />;
      case 'profile-ready': return <ProfileReady setView={handleSetView} user={user} />;
      case 'dashboard': return <Dashboard setView={handleSetView} user={user} setSelectedBot={setSelectedBot} setIsTraining={setIsTraining} />;
      case 'treino': return <SelectDuration setView={handleSetView} onSelect={(d) => setDuration(d)} isTraining={true} onStartTraining={() => { setIsTraining(true); setSelectedBot(null); setOpponent(null); setView('challenge'); }} />;
      case 'select-bot': return <SelectBot setView={handleSetView} onSelect={(b) => { setSelectedBot(b); setIsTraining(false); setView('select-duration'); }} />;
      case 'select-duration': return <SelectDuration setView={handleSetView} onSelect={(d) => setDuration(d)} selectedBot={selectedBot} isTraining={isTraining} onStartMatchmaking={() => setView('matchmaking')} />;
      case 'training-setup': return <SelectDuration setView={handleSetView} onSelect={(d) => setDuration(d)} isTraining={true} onStartTraining={() => { setIsTraining(true); setSelectedBot(null); setOpponent(null); setView('challenge'); }} />;
      case 'challenge': return <Challenge bot={selectedBot} opponent={opponent} duration={duration} user={user} isTraining={isTraining} onExit={() => { setView('dashboard'); setSelectedBot(null); setOpponent(null); setIsTraining(false); }} onComplete={updateStats} />;
      case 'matchmaking': return <Matchmaking user={user} onMatchFound={(opp: any) => { setOpponent(opp); setView('challenge'); }} onCancel={() => setView('select-duration')} duration={duration} />;
      case 'profile': return <Profile setView={handleSetView} user={user} setUser={setUser} goBack={goBack} />;
      case 'settings': return <Profile setView={handleSetView} user={user} setUser={setUser} initialEditing={true} goBack={goBack} />;
      case 'edit-profile': return <Profile setView={handleSetView} user={user} setUser={setUser} initialEditing={true} goBack={goBack} />;
      case 'multiplayer': return <Multiplayer setView={handleSetView} user={user} onSelectBot={() => setView('select-bot')} onStartMatchmaking={(training) => { setIsTraining(training); setView('select-duration'); }} onChallengePlayer={(opp: any) => { setOpponent(opp); setIsTraining(false); setView('select-duration'); }} goBack={goBack} />;
      case 'achievements': return <Achievements setView={handleSetView} user={user} goBack={goBack} />;
      case 'support': return <Support setView={handleSetView} goBack={goBack} />;
      case 'support-chat': return <SupportChat setView={handleSetView} goBack={goBack} />;
      case 'history': return <FullHistory setView={handleSetView} user={user} goBack={goBack} />;
      case 'friend-challenge': return <FriendChallenge setView={handleSetView} user={user} onChallengePlayer={(opp: any) => { setOpponent(opp); setIsTraining(false); setView('select-duration'); }} goBack={goBack} />;
      case 'ranking': return <Ranking setView={handleSetView} user={user} goBack={goBack} />;
      case 'patents-list': return <PatentsList setView={handleSetView} user={user} goBack={goBack} />;
      case 'daily-reward': return <DailyReward setView={handleSetView} user={user} setUser={setUser} goBack={goBack} />;
      case 'daily-missions': return <DailyMissions setView={handleSetView} user={user} setUser={setUser} goBack={goBack} />;
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

      {/* Challenge Invitation Modal */}
      <AnimatePresence>
        {incomingChallenge && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          >
            <div className="w-full max-w-sm bg-[#1A1F26] border-2 border-electric-blue rounded-[2.5rem] p-8 space-y-8 premium-glow-blue relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-electric-blue to-transparent animate-pulse" />
              
              <div className="text-center space-y-4">
                <div className="w-24 h-24 mx-auto relative">
                  <div className="absolute inset-0 bg-electric-blue/20 rounded-full animate-ping" />
                  <div className="relative w-full h-full bg-[#0B0E14] rounded-full border-2 border-electric-blue flex items-center justify-center overflow-hidden">
                    <Swords className="w-12 h-12 text-electric-blue animate-bounce" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase leading-none">NOVO DESAFIO!</h2>
                  <p className="text-[10px] font-black text-electric-blue uppercase tracking-[0.2em] mt-2 animate-pulse">ALGUÉM QUER TE ENCARAR</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-white/40" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">DURAÇÃO</p>
                  <p className="text-xl font-black text-white italic">{incomingChallenge.duration} SEGUNDOS</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  className="game-button bg-electric-blue py-7 text-lg"
                  onClick={() => acceptChallenge(incomingChallenge)}
                >
                  ACEITAR DESAFIO
                </Button>
                <Button 
                  variant="ghost" 
                  className="py-6 text-energy-red font-black italic uppercase tracking-widest hover:bg-energy-red/10"
                  onClick={() => setIncomingChallenge(null)}
                >
                  RECUSAR
                </Button>
              </div>
            </div>
          </motion.div>
        )}
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

      <AnimatePresence>
        {incomingChallenge && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-4 bottom-24 z-[60] bg-[#0B0E14] border-2 border-electric-blue rounded-[2rem] p-6 shadow-[0_0_50px_rgba(0,210,255,0.3)]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-electric-blue/20 flex items-center justify-center border border-electric-blue/30">
                <Swords className="w-8 h-8 text-electric-blue" />
              </div>
              <div>
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">DESAFIO RECEBIDO!</h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-0.5">ALGUÉM TE DESAFIOU PARA UMA BATALHA</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                className="flex-1 h-14 rounded-2xl bg-white/5 text-white/60 hover:text-white"
                onClick={() => setIncomingChallenge(null)}
              >
                RECUSAR
              </Button>
              <Button 
                className="flex-1 h-14 rounded-2xl bg-electric-blue text-white shadow-[0_0_20px_rgba(0,210,255,0.4)]"
                onClick={() => acceptChallenge(incomingChallenge)}
              >
                ACEITAR
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isBattleActive && !['onboarding-start', 'quiz', 'quiz-result', 'auth', 'photo-upload', 'profile-setup', 'profile-ready'].includes(view) && (
        <nav className="fixed bottom-6 left-4 right-4 bg-[#0B0E14]/80 backdrop-blur-xl border border-white/10 px-2 py-3 flex justify-around items-center z-50 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
          {[
            { id: 'dashboard', label: 'Início', icon: Home, aliases: [] },
            { id: 'achievements', label: 'Conquistas', icon: Award, aliases: [] },
            { id: 'multiplayer', label: 'Batalha', icon: Swords, aliases: ['select-bot', 'select-duration', 'matchmaking', 'challenge'] },
            { id: 'ranking', label: 'Ranking', icon: Trophy, aliases: [] },
            { id: 'profile', label: 'Perfil', icon: UserCircle, aliases: ['history', 'support', 'settings', 'edit-profile'] }
          ].map((item) => {
            const isActive = view === item.id || item.aliases?.includes(view);
            
            return (
              <Button 
                key={item.id}
                variant="ghost" 
                aria-label={`Ir para ${item.label}`}
                className={`flex flex-col items-center gap-1.5 h-auto py-2.5 px-1 flex-1 transition-all duration-75 active:scale-[0.85] active:brightness-125 btn-respond-fast relative rounded-2xl ${isActive ? 'text-electric-blue' : 'text-white/40 hover:text-white/60'}`}
                onClick={() => setView(item.id as View)}
              >
                <div className="relative">
                  <item.icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,210,255,0.8)]' : ''}`} />
                  {isActive && (
                    <motion.div 
                      layoutId="nav-glow-icon"
                      className="absolute inset-0 bg-electric-blue/20 blur-md rounded-full -z-10"
                    />
                  )}
                </div>
                
                <span className={`text-[8px] font-black uppercase tracking-[0.1em] leading-none transition-colors duration-300 ${isActive ? 'neon-text-blue' : ''}`}>
                  {item.label}
                </span>

                {isActive && (
                  <>
                    <motion.div 
                      layoutId="nav-indicator-line"
                      className="absolute -bottom-1 w-5 h-1 bg-electric-blue rounded-full shadow-[0_0_10px_rgba(0,210,255,0.8)]"
                    />
                    <motion.div 
                      layoutId="nav-bg-glow"
                      className="absolute inset-0 bg-electric-blue/5 rounded-2xl -z-20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  </>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-5 pb-32">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div 
            className="relative w-14 h-14 rounded-full border-2 border-gold shadow-[0_0_15px_rgba(234,179,8,0.4)] p-0.5 cursor-pointer active:scale-95 btn-respond-fast transition-transform"
            onClick={() => setView('profile')}
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
        
        <motion.div 
          whileTap={{ scale: 0.95 }}
          className="bg-purple-evolve/10 border border-purple-evolve/20 rounded-2xl p-2.5 flex items-center gap-3 cursor-pointer transition-all hover:bg-purple-evolve/20 active:border-purple-evolve/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          onClick={() => setView('daily-reward')}
        >
          <div className="bg-gold/20 p-1.5 rounded-xl">
            <Trophy className="w-5 h-5 text-gold filter drop-shadow-[0_0_8px_gold]" />
          </div>
          <div className="flex flex-col pr-2">
            <span className="text-[10px] font-black text-white leading-none uppercase tracking-tighter">RECOMPENSAS</span>
            <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Resgate prêmios</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20" />
        </motion.div>
      </header>

      {/* Patent Progress Card */}
      <NeonFireWrapper 
        color="gold" 
        className="mb-4"
        onClick={() => setView('patents-list')}
      >
        <div 
          className="relative p-6 rounded-[1.8rem] border-2 border-gold bg-[#151921] shadow-[0_0_30px_rgba(234,179,8,0.15)] overflow-hidden transition-all group"
        >
          <div className="flex justify-between items-start mb-6 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border-2 border-gold/30 flex items-center justify-center shadow-[inset_0_0_20px_rgba(234,179,8,0.2)] shrink-0">
                <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">{rank.emoji}</div>
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none truncate">{rank.rankName.toUpperCase()}</h2>
                <p className="text-[10px] font-black text-gold uppercase tracking-[0.2em] mt-1 opacity-70">SUA PATENTE ATUAL</p>
                <div className="mt-2 flex flex-col">
                  <span className="text-2xl font-black text-white italic tracking-tighter leading-none">{rank.xpInLevel}</span>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-0.5">/ {rank.xpForNext} XP</span>
                </div>
              </div>
            </div>
            
            {/* Background pattern decoration */}
            <div className="shrink-0 opacity-20 pointer-events-none w-20 h-20 -mr-2 flex items-center justify-center">
              <Shield className="w-full h-full text-gold" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${rank.progress}%` }}
                className="h-full bg-gradient-to-r from-gold to-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)] rounded-full"
              />
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">
                PRÓXIMO NÍVEL EM {rank.xpForNext - rank.xpInLevel} XP
              </p>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">RANK {rank.level}</span>
              </div>
            </div>
          </div>
        </div>
      </NeonFireWrapper>

      {/* Action Grid - Redesigned for Premium Neon Feel */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="h-full"
        >
          <NeonFireWrapper 
            color="blue"
            onClick={() => setView('multiplayer')}
            className="h-full"
          >
            <div 
              className="h-full bg-electric-blue/5 border border-electric-blue/30 rounded-[2rem] p-6 flex flex-col items-center justify-between min-h-[180px] transition-all shadow-[0_0_20px_rgba(59,130,246,0.15)] group"
            >
              <div className="w-16 h-16 rounded-2xl bg-electric-blue/10 flex items-center justify-center mb-4 border border-electric-blue/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
                <Swords className="w-10 h-10 text-electric-blue filter drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">PARTIDA</h3>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-tight">ARENA ONLINE</p>
              </div>
              <div className="mt-4 bg-electric-blue/20 p-2.5 rounded-full group-hover:translate-x-1 transition-transform">
                <ArrowLeft className="w-4 h-4 text-electric-blue rotate-180" />
              </div>
            </div>
          </NeonFireWrapper>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="h-full"
        >
          <NeonFireWrapper 
            color="purple"
            onClick={() => setView('daily-missions')}
            className="h-full"
          >
            <div 
              className="h-full bg-purple-evolve/5 border border-purple-evolve/30 rounded-[2rem] p-6 flex flex-col items-center justify-between min-h-[180px] transition-all shadow-[0_0_20px_rgba(139,92,246,0.15)] group"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-evolve/10 flex items-center justify-center mb-4 border border-purple-evolve/20 shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-10 h-10 text-purple-evolve filter drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">MISSÕES</h3>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-tight">DIÁRIAS</p>
              </div>
              <div className="mt-4 bg-purple-evolve/20 p-2.5 rounded-full group-hover:translate-x-1 transition-transform">
                <ArrowLeft className="w-4 h-4 text-purple-evolve rotate-180" />
              </div>
            </div>
          </NeonFireWrapper>
        </motion.div>
      </div>

      {/* Workout Banner - Redesigned */}
      <motion.div
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <NeonFireWrapper 
          color="red"
          onClick={() => setView('treino')}
        >
          <div 
            className="bg-energy-red/5 border border-energy-red/30 rounded-[2rem] p-6 flex items-center justify-between transition-all shadow-[0_0_25px_rgba(239,68,68,0.15)] group"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-energy-red/10 flex items-center justify-center border border-energy-red/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] group-hover:scale-110 transition-transform">
                <Dumbbell className="w-9 h-9 text-energy-red filter drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
              </div>
              <div>
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">MODO TREINO</h3>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1.5">Aperfeiçoe suas habilidades</p>
              </div>
            </div>
            <div className="bg-energy-red/20 p-3 rounded-full group-hover:translate-x-2 transition-transform shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <ChevronRight className="w-6 h-6 text-energy-red" />
            </div>
          </div>
        </NeonFireWrapper>
      </motion.div>

      {/* Bottom Stats Footer - Adjusted */}
      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/5 -mt-2 pb-2">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-2xl bg-gold/10 flex items-center justify-center mb-1 border border-gold/30 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
            <Trophy className="w-5 h-5 text-gold neon-text-gold" />
          </div>
          <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.1em] leading-none mb-1">VITÓRIAS</span>
          <span className="text-xl font-black text-white italic">{stats.wins ?? 0}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-2xl bg-electric-blue/10 flex items-center justify-center mb-1 border border-electric-blue/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Target className="w-5 h-5 text-electric-blue neon-text-blue" />
          </div>
          <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.1em] leading-none mb-1">RECORDE</span>
          <span className="text-xl font-black text-white italic">{stats.record ?? 0}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-2xl bg-energy-red/10 flex items-center justify-center mb-1 border border-energy-red/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <Flame className="w-5 h-5 text-energy-red neon-text-red" />
          </div>
          <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.1em] leading-none mb-1">OFENSIVA</span>
          <span className="text-xl font-black text-white italic">{stats.streak ?? 0}</span>
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-2xl bg-purple-evolve/10 flex items-center justify-center mb-1 border border-purple-evolve/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <Zap className="w-5 h-5 text-purple-evolve neon-text-purple" />
          </div>
          <span className="text-[7px] font-black text-white/40 uppercase tracking-[0.1em] leading-none mb-1">TOTAL</span>
          <span className="text-xl font-black text-white italic">{stats.totalPushups ?? 0}</span>
        </div>
      </div>
    </motion.div>
  );
}



function SelectBot({ setView, onSelect }: { setView: (v: View) => void, onSelect: (b: typeof BOTS[0]) => void }) {
  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="p-6 pb-32">
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
    { label: '30 segundos', value: 30 },
    { label: '1 minuto', value: 60 },
    { label: '2 minutos', value: 120 },
    { label: '3 minutos', value: 180 },
    { label: '5 minutos', value: 300 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 bg-[#0B0E14] flex flex-col p-6 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-2xl bg-white/5 border border-white/10 w-12 h-12 active:scale-90 transition-transform" 
          onClick={() => setView(isTraining ? 'dashboard' : (selectedBot ? 'select-bot' : 'multiplayer'))}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </Button>
        <div className="text-right">
          <h2 className="text-2xl font-black italic text-white tracking-tighter uppercase leading-none">
            {isTraining ? 'MODO TREINO' : 'DUELO REAL'}
          </h2>
          <p className="text-[10px] font-black text-electric-blue uppercase tracking-[0.2em] mt-1 italic">
            DEFINA O TEMPO
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-4">
        {durations.map(d => (
          <motion.button 
            key={d.value} 
            whileTap={{ scale: 0.97 }}
            className={`w-full h-16 rounded-2xl flex items-center justify-between px-6 border-2 transition-all duration-200 group relative overflow-hidden ${
              localDuration === d.value 
                ? 'bg-electric-blue/20 border-electric-blue shadow-[0_0_25px_rgba(0,210,255,0.4)]' 
                : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
            onClick={() => {
              setLocalDuration(d.value);
              onSelect(d.value);
            }}
          >
            {localDuration === d.value && (
              <motion.div 
                layoutId="duration-glow"
                className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 via-transparent to-transparent pointer-events-none"
              />
            )}
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl transition-colors ${localDuration === d.value ? 'bg-electric-blue text-[#0B0E14]' : 'bg-white/5 text-white/40'}`}>
                <Timer className="w-5 h-5" />
              </div>
              <span className={`text-lg font-black italic uppercase tracking-tight ${localDuration === d.value ? 'text-white' : 'text-white/40'}`}>
                {d.label}
              </span>
            </div>
            {localDuration === d.value && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="w-6 h-6 rounded-full bg-electric-blue flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-[#0B0E14] stroke-[4px]" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <Button 
          className={`game-button w-full h-20 text-2xl font-black italic uppercase tracking-tighter rounded-[2rem] transition-all active:scale-95 ${
            isTraining ? 'bg-gold text-black shadow-[0_0_30px_rgba(234,179,8,0.4)]' : 'bg-electric-blue text-black shadow-[0_0_30px_rgba(0,210,255,0.4)]'
          }`}
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
          <span className="flex items-center gap-3">
            {isTraining ? "COMEÇAR TREINO" : "COMEÇAR BATALHA"}
            <ChevronRight className="w-6 h-6" />
          </span>
        </Button>
      </div>
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
  const [trainingStep, setTrainingStep] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [cameraTimeout, setCameraTimeout] = useState(false);

  const trainingTips = [
    { title: "POSICIONE-SE", text: "Fique de lado para a câmera para que o scanner veja seu corpo inteiro.", icon: <Camera className="w-5 h-5" /> },
    { title: "COSTAS RETAS", text: "Mantenha o corpo alinhado. Quadril nem muito alto, nem muito baixo.", icon: <Shield className="w-5 h-5" /> },
    { title: "DESCIDA TOTAL", text: "Desça até que seus cotovelos formem um ângulo de 90 graus.", icon: <Target className="w-5 h-5" /> },
    { title: "EXTENSÃO", text: "Suba totalmente esticando os braços para validar a repetição.", icon: <Zap className="w-5 h-5" /> }
  ];

  // Auto-start timeout for camera
  useEffect(() => {
    let timeoutId: any;
    if (gameState === 'loading') {
      timeoutId = setTimeout(() => {
        if (!isCameraReady) {
          setCameraTimeout(true);
        }
      }, 15000); // 15 seconds safety timeout
    }
    return () => clearTimeout(timeoutId);
  }, [gameState, isCameraReady]);


  const handlePlayerCount = useCallback((count: number) => {
    setPlayerPushups(count);
  }, []);

  const handleCameraReady = useCallback(() => {
    if (gameState === 'loading') {
      setIsCameraReady(true);
      setCameraTimeout(false);
      setGameState('countdown');
    }
  }, [gameState]);


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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black flex flex-col overflow-hidden">
      {/* HUD Superior — Mobile Optimized Premium HUD */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="max-w-md mx-auto relative">
          {/* Header Title */}
          <div className="flex justify-center mb-6">
            <span className="text-[10px] font-black text-gold uppercase tracking-[0.4em] italic drop-shadow-md">RANKED MATCH</span>
          </div>

          {/* Profiles and Timer Container */}
          <div className="grid grid-cols-3 items-center gap-2">
            {/* User Profile */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 clip-path-hexagon bg-electric-blue/30 p-0.5 shadow-[0_0_20px_rgba(0,210,255,0.3)] border border-electric-blue/40">
                  <div className="w-full h-full clip-path-hexagon overflow-hidden bg-slate-900 flex items-center justify-center">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon className="w-7 h-7 text-electric-blue" />}
                  </div>
                </div>
                {/* Rank Badge */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center text-[10px] shadow-lg">
                  {getRankInfo(user.xp || 0).emoji}
                </div>
              </div>
              <div className="mt-2 text-center">
                <p className="text-[10px] font-black italic text-white uppercase tracking-tighter truncate max-w-[80px]">Você</p>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">{user.xp || 0} ELO</p>
              </div>
            </div>

            {/* Timer Central */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">TIME</span>
              <div className="relative">
                <span className={`text-4xl font-black italic tabular-nums leading-none tracking-tighter drop-shadow-lg ${timeLeft <= 5 ? 'text-energy-red animate-pulse' : 'text-white'}`}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Opponent Profile */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-16 h-16 clip-path-hexagon bg-energy-red/30 p-0.5 shadow-[0_0_20px_rgba(255,49,49,0.3)] border border-energy-red/40">
                  <div className="w-full h-full clip-path-hexagon overflow-hidden bg-slate-900 flex items-center justify-center">
                    {!isTraining ? (
                      <img src={activeOpponent?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeOpponent?.id || 'bot'}`} className="w-full h-full object-cover" />
                    ) : (
                      <Trophy className="w-7 h-7 text-gold" />
                    )}
                  </div>
                </div>
                {/* Rank Badge */}
                {!isTraining && (
                  <div className="absolute -bottom-1 -left-1 w-7 h-7 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center text-[10px] shadow-lg">
                    {bot?.league === 'LENDA' ? '🌟' : '🛡️'}
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-[10px] font-black italic text-white uppercase tracking-tighter truncate max-w-[80px]">
                  {isTraining ? 'OBJETIVO' : (activeOpponent?.name || 'ADVERSÁRIO')}
                </p>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">
                  {isTraining ? 'PRÁTICA' : `${activeOpponent?.record || 400} ELO`}
                </p>
              </div>
            </div>
          </div>

          {/* Scores and Progress Bar */}
          <div className="mt-6 px-2">
             <div className="flex justify-between items-end mb-2">
                <motion.span 
                  key={playerPushups}
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className="text-4xl font-black italic text-white drop-shadow-[0_0_15px_rgba(0,210,255,0.5)]"
                >
                  {playerPushups}
                </motion.span>
                
                <motion.span 
                  key={oppPushups}
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  className="text-4xl font-black italic text-white drop-shadow-[0_0_15px_rgba(255,49,49,0.5)]"
                >
                  {isTraining ? user.record : oppPushups}
                </motion.span>
             </div>

             {/* Dynamic Progress Bar */}
             <div className="h-4 w-full bg-slate-900/50 backdrop-blur-md rounded-full overflow-hidden border border-white/10 p-[2px] relative shadow-inner">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full relative"
                  initial={{ width: '50%' }}
                  animate={{ 
                    width: `${(playerPushups / (playerPushups + (isTraining ? user.record : oppPushups) || 1)) * 100}%` 
                  }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                   {/* Glow diamond indicator at the edge */}
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 bg-white shadow-[0_0_10px_#fff] z-10" />
                </motion.div>
             </div>
          </div>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-4 right-4 z-40">
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/50" onClick={onExit}>
             <X className="w-5 h-5" />
          </Button>
        </div>
      </div>


      {/* Main Camera View - Occupying full screen height */}
      <div className="flex-1 relative bg-black">
        <PushUpCounter 
          isActive={true} 
          onCount={handlePlayerCount} 
          onReady={handleCameraReady}
          soundEnabled={true}
          showSkeleton={true}
        />
        
        {/* Large Centered Counter at Bottom */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center z-30 pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring on count change */}
            <motion.div
              key={playerPushups}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute w-32 h-32 border-4 border-gold/60 rounded-full"
            />
            
            {/* The Medal/Circle Counter */}
            <div className="bg-gold p-1 rounded-full shadow-[0_0_40px_rgba(234,179,8,0.5)] border-4 border-gold/20">
              <div className="bg-[#0B0E14] w-28 h-28 rounded-full border-4 border-gold/40 flex items-center justify-center">
                <motion.span 
                  key={playerPushups}
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-6xl font-black italic text-gold drop-shadow-2xl tabular-nums"
                >
                  {playerPushups}
                </motion.span>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {battleMessage && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-1/2 left-0 right-0 flex justify-center z-20 pointer-events-none -translate-y-24"
            >
              <div className={`backdrop-blur-3xl px-8 py-3 rounded-2xl border-2 shadow-2xl transition-colors duration-500 ${lastWhoIsAhead === 'player' ? 'bg-electric-blue/20 border-electric-blue/50 text-electric-blue' : lastWhoIsAhead === 'opponent' ? 'bg-energy-red/20 border-energy-red/50 text-energy-red' : 'bg-black/60 border-white/10 text-white'}`}>
                <p className="text-sm font-black italic uppercase tracking-widest drop-shadow-md">{battleMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guided Training Tips Overlay (Side) */}
        {isTraining && gameState === 'playing' && (
          <AnimatePresence>
            {showTip && (
              <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="absolute top-1/2 right-4 -translate-y-32 z-40 w-44 pointer-events-none"
              >
                <div className="bg-black/60 backdrop-blur-xl p-3 rounded-2xl border border-gold/30 shadow-lg">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-gold/20 text-gold">
                      {trainingTips[trainingStep].icon}
                    </div>
                    <span className="text-[8px] font-black italic text-gold uppercase tracking-tighter">COACH</span>
                  </div>
                  <h4 className="text-[10px] font-black text-white uppercase italic mb-0.5">{trainingTips[trainingStep].title}</h4>
                  <p className="text-[8px] font-medium text-white/50 leading-tight uppercase">{trainingTips[trainingStep].text}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
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
            className="fixed inset-0 flex flex-col items-center justify-center z-[120] bg-[#0B0E14] p-6"
          >
            {!cameraTimeout ? (
              <>
                <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-electric-blue/20 rounded-full" />
                  <div className="absolute inset-0 w-24 h-24 border-4 border-electric-blue border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,210,255,0.3)]" />
                  <Camera className="absolute inset-0 m-auto w-8 h-8 text-electric-blue animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-black italic text-white tracking-[0.3em] text-xs uppercase">📷 PREPARANDO CÂMERA...</p>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Aguardando sinal de vídeo</p>
                </div>
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 max-w-xs"
              >
                <div className="w-20 h-20 bg-energy-red/10 rounded-full flex items-center justify-center mx-auto border border-energy-red/20 shadow-[0_0_30px_rgba(255,49,49,0.1)]">
                  <AlertCircle className="w-10 h-10 text-energy-red" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">OPS! A CÂMERA FALHOU</h3>
                  <p className="text-xs font-bold text-white/50 leading-relaxed uppercase tracking-wide">
                    Não conseguimos acessar sua câmera a tempo. Verifique as permissões do navegador e tente novamente.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    className="game-button bg-electric-blue text-black h-16 text-lg rounded-2xl"
                    onClick={() => {
                      setCameraTimeout(false);
                      setGameState('loading'); 
                    }}
                  >
                    TENTAR NOVAMENTE
                  </Button>
                  <Button 
                    variant="ghost"
                    className="h-12 text-white/40 font-black uppercase tracking-widest text-[10px]"
                    onClick={onExit}
                  >
                    VOLTAR
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}



function Profile({ setView, user, setUser, initialEditing = false, goBack }: { setView: (v: View) => void, user: any, setUser: any, initialEditing?: boolean, goBack: () => void }) {
  const [editing, setEditing] = useState(initialEditing);
  const [formData, setFormData] = useState({ 
    name: user?.name || '',
    age: user?.age || 0,
    weight: user?.weight || 0,
    height: user?.height || 0,
    goal: user?.goal || 'Ganhar força',
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
        goal: user?.goal || 'Ganhar força',
        avatar: user?.avatar || null
      });
    }
  }, [initialEditing, user]);

  const stats = user;
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    // Validação estrita
    const numericAge = parseInt(String(formData.age), 10);
    const numericWeight = parseFloat(String(formData.weight));
    const numericHeight = parseInt(String(formData.height), 10);

    if (!formData.name.trim()) {
      toast.error("⚠️ O nome do atleta não pode estar vazio.");
      return;
    }
    if (isNaN(numericAge) || isNaN(numericWeight) || isNaN(numericHeight)) {
      toast.error("⚠️ Verifique os valores numéricos de idade, peso e altura.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fallback para ambiente de desenvolvimento ou sessão temporária
      const userId = session?.user?.id || (user.id !== "PUSH-USER" ? user.id : null);
      
      if (!userId && user.id === "PUSH-USER") {
        throw new Error("Usuário não autenticado. Faça login para salvar.");
      }

      const updateData = {
        name: formData.name.trim().toUpperCase(),
        age: numericAge,
        weight: numericWeight,
        height: numericHeight,
        avatar_url: formData.avatar,
        goal: formData.goal,
        updated_at: new Date().toISOString()
      };

      if (session?.user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', session.user.id);

        if (error) throw error;
      } else {
        // Se não houver sessão, apenas simulamos o sucesso no estado local para permitir testes/uso offline
        console.warn("Sem sessão ativa no Supabase. Salvando apenas localmente.");
      }

      setUser((prev: any) => ({ ...prev, ...updateData, avatar: updateData.avatar_url }));
      
      setEditing(false);
      // Forçar atualização do estado e garantir que a visualização seja 'profile'
      setTimeout(() => {
        setView('profile');
        // Opcional: Recarregar dados se houver sessão para garantir sincronia total
        if (session?.user?.id) {
          window.dispatchEvent(new CustomEvent('profile-changes'));
        }
      }, 100);
      toast.success("✅ Perfil atualizado!");
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      toast.error("❌ Erro ao salvar", { description: err.message || "Tente novamente." });
    } finally {
      setIsSaving(false);
    }
  };

  if (editing) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 20 }}
        className="p-6 space-y-6 pb-32 min-h-screen overflow-y-auto"
      >
        <div className="flex items-center gap-4 mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl bg-white/5 active:scale-90 btn-respond-fast" 
            onClick={() => setEditing(false)}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">EDITAR PERFIL</h2>
        </div>

        <div className="glass-panel p-6 space-y-8 border-electric-blue/20 relative shadow-[0_0_20px_rgba(0,210,255,0.05)]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 bg-[#0F131A] rounded-full border-4 border-electric-blue p-1 shadow-[0_0_20px_rgba(0,210,255,0.2)] overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-white/20" />
                  </div>
                )}
              </div>
              
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-10 h-10 rounded-full bg-primary border-primary shadow-lg hover:bg-primary/90"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (re) => setFormData({ ...formData, avatar: re.target?.result as string });
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <ImageIcon className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
            
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">CLIQUE NO ÍCONE PARA ALTERAR FOTO</p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">NOME DE ATLETA</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black italic text-white focus:outline-none focus:border-electric-blue transition-all text-lg uppercase"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                placeholder="EX: GUERREIRO ALPHA"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-purple-evolve uppercase tracking-widest text-center block">IDADE</label>
                <input 
                  type="number"
                  inputMode="numeric"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black italic text-white focus:outline-none focus:border-electric-blue text-center text-lg"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-electric-blue uppercase tracking-widest text-center block">PESO (KG)</label>
                <input 
                  type="number"
                  inputMode="decimal"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black italic text-white focus:outline-none focus:border-electric-blue text-center text-lg"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gold uppercase tracking-widest ml-1">ALTURA (CM)</label>
              <input 
                type="number"
                inputMode="numeric"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-black italic text-white focus:outline-none focus:border-electric-blue text-center text-lg"
                value={formData.height || ''}
                onChange={(e) => setFormData({ ...formData, height: e.target.value === '' ? 0 : parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">OBJETIVO FITNESS</label>
              <div className="relative">
                <select 
                  className="w-full bg-[#0F131A] border border-white/10 rounded-2xl p-4 font-black text-white focus:outline-none focus:border-electric-blue appearance-none italic"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                >
                  <option value="Ganhar força">GANHAR FORÇA</option>
                  <option value="Perder peso">PERDER PESO</option>
                  <option value="Condicionamento">CONDICIONAMENTO</option>
                  <option value="Massa muscular">MASSA MUSCULAR</option>
                  <option value="Melhorar minhas flexões">MELHORAR FLEXÕES</option>
                  <option value="Bater recordes">BATER RECORDES</option>
                  <option value="Vencer outras pessoas">VENCER PESSOAS</option>
                  <option value="Chegar ao topo do ranking">TOPO DO RANKING</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 rotate-90 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="game-button bg-primary w-full py-7 text-xl italic uppercase tracking-tighter shadow-[0_6px_0_0_rgba(29,78,216,0.5)] active:translate-y-[6px] active:shadow-none transition-all"
            >
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "SALVAR ALTERAÇÕES"}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => setEditing(false)}
              className="w-full text-white/30 uppercase text-[10px] font-black tracking-widest hover:text-white"
            >
              CANCELAR
            </Button>
          </div>
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6 pb-32">
      <div className="flex justify-between items-center w-full mb-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 active:scale-90 btn-respond-fast" onClick={() => goBack()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-tight">PERFIL</h2>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl bg-electric-blue/10 border border-electric-blue/20 shadow-[0_0_15px_rgba(0,210,255,0.2)] active:scale-85 active:brightness-125 btn-respond-fast" 
          onClick={() => setEditing(true)}
        >
          <Pencil className="w-5 h-5 text-electric-blue" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-6 relative py-4">
        {/* Avatar and Info Header */}
        <div className="relative group">
          <div className="w-36 h-36 bg-[#0F131A] rounded-full border-[3px] border-electric-blue p-1 shadow-[0_0_35px_rgba(0,210,255,0.4),inset_0_0_15px_rgba(0,210,255,0.1)] group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
            <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center relative">
              {stats.avatar ? (
                <img src={stats.avatar} className="w-full h-full object-cover" alt={stats.name} />
              ) : (
                <UserIcon className="w-16 h-16 text-muted-foreground" />
              )}
              {/* Metallic Ring Detail */}
              <div className="absolute inset-0 rounded-full border-[6px] border-white/5 pointer-events-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]" />
            </div>
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            >
              <Camera className="w-8 h-8 text-white/40" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-electric-blue p-2 rounded-full border-[3px] border-[#05070A] shadow-[0_0_15px_rgba(0,210,255,0.5)]">
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

          {/* Physical info capsule - Neon design */}
          <div className="inline-flex items-center gap-3 bg-[#0F131A] backdrop-blur-md px-5 py-2 rounded-full border border-electric-blue/30 mt-2 shadow-[0_0_15px_rgba(0,210,255,0.1)]">
            <span className="text-[10px] font-black text-electric-blue uppercase tracking-widest">{stats?.weight || 0}KG</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-black text-purple-evolve uppercase tracking-widest">{stats?.age || 0} ANOS</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-black text-gold uppercase tracking-widest">{stats?.height || 0}CM</span>
          </div>
        </div>

        {/* Progress Card */}
        <motion.div 
          whileTap={{ scale: 0.9, opacity: 0.8 }}
          transition={{ type: "spring", stiffness: 600, damping: 20 }}
          className="w-full bg-[#0F131A] rounded-[2rem] p-6 space-y-4 cursor-pointer border border-purple-evolve/20 shadow-[0_0_20px_rgba(168,85,247,0.1),inset_0_1px_1px_rgba(255,255,255,0.05)]"
          onClick={() => setView('patents-list')}
        >
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">EVOLUÇÃO</span>
              <span className="text-lg font-black italic text-white leading-none uppercase neon-text-purple">Nível {getRankInfo(stats?.xp || 0).level}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black italic text-purple-evolve leading-none drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">{getRankInfo(stats?.xp || 0).xpInLevel}</span>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">/ {XP_PER_DIVISION} XP</span>
            </div>
          </div>
          
          <div className="relative h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${getRankInfo(stats?.xp || 0).progress}%` }}
              className="absolute top-0.5 left-0.5 bottom-0.5 bg-gradient-to-r from-purple-evolve to-purple-600 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            />
          </div>
          
          <div className="flex justify-center">
            <span className="text-[8px] font-black text-purple-evolve/60 uppercase tracking-[0.3em] animate-pulse">TOQUE PARA VER PATENTES</span>
          </div>
        </motion.div>

        {/* Stats Grid - Premium Neon Visual */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="bg-[#0F131A] p-5 rounded-[2rem] text-center border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-electric-blue/30 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-electric-blue/10 flex items-center justify-center mx-auto mb-3 border border-electric-blue/20">
              <Trophy className="w-4 h-4 text-electric-blue" />
            </div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">VITÓRIAS</p>
            <p className="text-2xl font-black text-white italic drop-shadow-[0_0_8px_rgba(0,210,255,0.3)]">{stats.wins ?? 0}</p>
          </div>
          
          <div className="bg-[#0F131A] p-5 rounded-[2rem] text-center border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-electric-blue/30 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-electric-blue/10 flex items-center justify-center mx-auto mb-3 border border-electric-blue/20">
              <Target className="w-4 h-4 text-electric-blue" />
            </div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">RECORDE</p>
            <p className="text-2xl font-black text-white italic drop-shadow-[0_0_8px_rgba(0,210,255,0.3)]">{stats.record ?? 0}</p>
          </div>
          
          <div className="bg-[#0F131A] p-5 rounded-[2rem] text-center border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-purple-evolve/30 transition-all group">
            <div className="w-8 h-8 rounded-xl bg-purple-evolve/10 flex items-center justify-center mx-auto mb-3 border border-purple-evolve/20">
              <Zap className="w-4 h-4 text-purple-evolve" />
            </div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">TOTAL</p>
            <p className="text-2xl font-black text-white italic drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">{stats.totalPushups ?? 0}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4 w-full pt-4">
          <Button 
            variant="ghost" 
            aria-label="Ver Histórico de Partidas"
            className="bg-[#0F131A] p-6 h-auto flex justify-between items-center rounded-[2rem] border border-white/5 hover:border-purple-evolve/30 transition-all active:scale-[0.98] btn-respond-fast shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] group"
            onClick={() => setView('history')}
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-evolve/10 flex items-center justify-center border border-purple-evolve/20 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                <LayoutDashboard className="w-6 h-6 text-purple-evolve" />
              </div>
              <div className="text-left">
                <p className="text-xl font-black text-white italic tracking-tighter leading-none uppercase">HISTÓRICO</p>
                <p className="text-[10px] text-purple-evolve/60 font-black uppercase tracking-widest mt-1">
                  {stats?.history?.length > 0 ? "PARTIDAS ANTERIORES" : "JOGADOR SEM PARTIDA"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-purple-evolve transition-colors" />
          </Button>

          <Button 
            variant="ghost" 
            aria-label="Acessar Suporte e Atendimento"
            className="bg-[#0F131A] p-6 h-auto flex justify-between items-center rounded-[2rem] border border-white/5 hover:border-green-400/30 transition-all active:scale-[0.98] btn-respond-fast shadow-[0_4px_20px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] group"
            onClick={() => setView('support')}
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-green-400/10 flex items-center justify-center border border-green-400/20 group-hover:shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-xl font-black text-white italic tracking-tighter leading-none uppercase">SUPORTE</p>
                <p className="text-[10px] text-green-400/60 font-black uppercase tracking-widest mt-1">AJUDA E ATENDIMENTO</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-green-400 transition-colors" />
          </Button>

          <Button 
            variant="ghost" 
            className="text-[10px] font-black text-energy-red/40 uppercase tracking-[0.4em] hover:text-energy-red/60 transition-colors py-8 hover:neon-text-red active:scale-95 btn-respond-fast"
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

function FullHistory({ setView, user, goBack }: { setView: (v: View) => void, user: any, goBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-6 pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => goBack()}><ArrowLeft className="w-5 h-5" /></Button>
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

function Support({ setView, goBack }: { setView: (v: View) => void, goBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => goBack()}><ArrowLeft className="w-5 h-5" /></Button>
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

function SupportChat({ setView, goBack }: { setView: (v: View) => void, goBack: () => void }) {
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
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => goBack()}><ArrowLeft className="w-5 h-5" /></Button>
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
        id: Math.floor(Math.random() * 90000000 + 10000000).toString(),
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
                 {matchedOpponent?.avatar ? <img src={matchedOpponent.avatar} className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-energy-red" />}
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

function Multiplayer({ setView, user, onSelectBot, onStartMatchmaking, onChallengePlayer, goBack }: { setView: (v: View) => void, user: any, onSelectBot: () => void, onStartMatchmaking: (isTraining: boolean) => void, onChallengePlayer: (opp: any) => void, goBack: () => void }) {
  const [searchId, setSearchId] = useState('');
  const [foundPlayer, setFoundPlayer] = useState<any>(null);

  const handleSearch = async () => {
    if (!/^\d+$/.test(searchId)) {
      toast.error("O ID deve conter apenas números.");
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, xp, record, avatar_url, level, player_id, last_seen_at')
      .eq('player_id', searchId)
      .neq('id', user.id)
      .maybeSingle();

    if (profile) {
      setFoundPlayer({
        id: profile.id,
        name: profile.name,
        level: profile.level,
        patent: getRankInfo(profile.xp).patentName,
        record: profile.record,
        avatar: profile.avatar_url,
        last_seen_at: profile.last_seen_at
      });
      toast.success("Jogador encontrado!");
    } else {
      setFoundPlayer(null);
      toast.error("Jogador não encontrado");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 space-y-6 pb-32">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-tight">MULTIJOGADOR</h2>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">COMPITA. VENÇA. DOMINE.</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5 w-10 h-10" onClick={() => goBack()}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Partida Rápida (Large Card) */}
        <NeonFireWrapper 
          color="blue"
          onClick={() => onStartMatchmaking(false)}
          className="w-full"
        >
          <div 
            className="relative h-48 rounded-[2rem] border border-electric-blue/20 bg-gradient-to-br from-electric-blue/20 to-electric-blue/5 p-6 flex flex-col justify-center gap-2 cursor-pointer active:scale-[0.95] btn-respond-fast transition-all glow-primary group"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-electric-blue/20 flex items-center justify-center border border-electric-blue/30 shadow-[0_0_20px_rgba(0,210,255,0.3)]">
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
        </NeonFireWrapper>

        <div className="grid grid-cols-2 gap-4">
          <NeonFireWrapper 
            color="gold"
            onClick={onSelectBot}
            className="h-full"
          >
            <div 
              className="h-full bg-gold/5 border border-gold/20 rounded-[1.8rem] p-6 flex flex-col gap-4 min-h-[160px] cursor-pointer active:scale-[0.95] btn-respond-fast transition-all group"
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
          </NeonFireWrapper>

          <NeonFireWrapper 
            color="red"
            onClick={() => setView('treino')}
            className="h-full"
          >
            <div 
              className="h-full bg-energy-red/5 border border-energy-red/20 rounded-[1.8rem] p-6 flex flex-col gap-4 min-h-[160px] cursor-pointer active:scale-[0.95] btn-respond-fast transition-all glow-red group"
            >
              <div className="w-12 h-12 rounded-2xl bg-energy-red/10 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-energy-red filter drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              </div>
              <div>
                <h3 className="text-lg font-black italic text-white uppercase tracking-tighter leading-none">MODO TREINO</h3>
                <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest mt-2">Aperfeiçoe suas habilidades com a IA</p>
              </div>
              <div className="self-end bg-energy-red/20 p-1.5 rounded-full mt-auto">
                <ArrowLeft className="w-4 h-4 text-energy-red rotate-180" />
              </div>
            </div>
          </NeonFireWrapper>
        </div>

        {/* Jogar com Amigos (Full Width) */}
        <NeonFireWrapper 
          color="blue"
          onClick={() => setView('friend-challenge')}
          className="w-full"
        >
          <div className="bg-[#1A1F26]/30 border border-white/5 rounded-[1.8rem] p-6 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all group">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-electric-blue/10 flex items-center justify-center border border-electric-blue/20">
                <UserIcon className="w-8 h-8 text-electric-blue" />
              </div>
              <div>
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">JOGAR COM AMIGOS</h3>
                <p className="text-xs font-medium text-white/40 uppercase tracking-widest mt-2">CONVIDE SEUS AMIGOS E JOGUEM JUNTOS</p>
              </div>
            </div>
            <div className="bg-white/5 p-2 rounded-full group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white rotate-180" />
            </div>
          </div>
        </NeonFireWrapper>
      </div>
    </motion.div>
  );
}

function FriendChallenge({ setView, user, onChallengePlayer, goBack }: { setView: (v: View) => void, user: any, onChallengePlayer: (opp: any) => void, goBack: () => void }) {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(user.player_id || user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchFriends = async () => {
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          status,
          user_id,
          friend_id,
          profiles_user:profiles!friendships_user_id_fkey(id, player_id, name, xp, avatar_url, last_seen_at),
          profiles_friend:profiles!friendships_friend_id_fkey(id, player_id, name, xp, avatar_url, last_seen_at)
        `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');
      
      if (friendships) {
        setFriends(friendships.map((f: any) => 
          f.user_id === user.id ? f.profiles_friend : f.profiles_user
        ));
      }
    };
    fetchFriends();
  }, [user.id]);

  const searchFriend = async () => {
    if (!/^\d+$/.test(searchQuery)) {
      toast.error("O ID deve conter apenas números.");
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, player_id, name, xp, avatar_url, level, last_seen_at')
      .eq('player_id', searchQuery)
      .neq('id', user.id)
      .maybeSingle();

    if (profile) setFoundUser(profile);
    else {
      setFoundUser(null);
      toast.error("Nenhum jogador encontrado.");
    }
  };

  const addFriend = async (friendId: string) => {
    const { error } = await supabase.from('friendships').insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending'
    });
    if (!error) toast.success("Solicitação enviada!");
    else toast.error("Erro ao enviar solicitação.");
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => goBack()}><ArrowLeft className="w-5 h-5" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter">SOCIAL</h2>
      </div>

      {/* ID Section */}
      <div className="glass-panel p-6 border-blue-500/20 space-y-4">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest">SEU ID DE JOGADOR</h3>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/10 font-mono text-xl font-black text-white tracking-[0.2em] overflow-hidden truncate">
            {user.player_id || user.id.substring(0, 8).toUpperCase()}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-full w-14 rounded-xl transition-all ${copied ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`} 
            onClick={copyId}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest px-1">ADICIONAR AMIGO</h3>
        <div className="flex gap-2">
          <input 
            className="flex-1 bg-[#1A1F26] border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 font-mono"
            placeholder="Digite o ID numérico (Ex: 48291736)"
            type="tel"
            pattern="[0-9]*"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.replace(/\D/g, ''))}
          />
          <Button className="h-14 w-14 rounded-2xl bg-primary" onClick={searchFriend}><Search className="w-6 h-6" /></Button>
        </div>
        
        {foundUser && (
          <div className="bg-[#151921] p-4 rounded-2xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/5 rounded-full overflow-hidden">
                {foundUser.avatar_url && <img src={foundUser.avatar_url} className="w-full h-full object-cover" />}
              </div>
              <div>
                <p className="font-black text-white italic">{foundUser.name}</p>
                <p className="text-[10px] text-white/40 uppercase">{getRankInfo(foundUser.xp).patentName}</p>
              </div>
            </div>
            <Button className="bg-primary text-xs" onClick={() => addFriend(foundUser.id)}>ADICIONAR</Button>
          </div>
        )}
      </div>

      {/* Friends List */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-white/40 uppercase tracking-widest px-1">AMIGOS ({friends.length})</h3>
        {friends.map(friend => {
          const lastSeen = new Date(friend.last_seen_at).getTime();
          const isOnline = Date.now() - lastSeen < 60000;
          return (
            <motion.div 
              key={friend.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#151921] p-4 rounded-[1.8rem] flex items-center justify-between border border-white/5 premium-glow-blue group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#151921] ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-white/20'}`} />
                </div>
                <div>
                  <p className="font-black text-white italic tracking-tighter uppercase leading-none">{friend.name}</p>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">
                    {getRankInfo(friend.xp).patentName}
                  </p>
                </div>
              </div>
              <Button 
                disabled={!isOnline}
                className={`h-10 px-6 rounded-xl font-black italic text-[10px] tracking-widest transition-all ${isOnline ? 'bg-electric-blue text-white shadow-[0_0_15px_rgba(0,210,255,0.3)]' : 'bg-white/5 text-white/20'}`} 
                onClick={() => onChallengePlayer(friend)}
              >
                {isOnline ? 'DESAFIAR' : 'OFFLINE'}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}


function Ranking({ setView, user, goBack }: { setView: (v: View) => void, user: any, goBack: () => void }) {
  const [tab, setTab] = useState<'local' | 'friends'>('local');
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('profiles')
          .select('id, name, xp, record, wins, streak, avatar_url, player_id');

        if (tab === 'friends') {
          // Get all friend IDs
          const { data: friendships } = await supabase
            .from('friendships')
            .select('user_id, friend_id')
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
            .eq('status', 'accepted');
          
          const friendIds = friendships ? friendships.map((f: any) => 
            f.user_id === user.id ? f.friend_id : f.user_id
          ) : [];
          
          // Filter by these IDs plus the user's ID
          query = query.in('id', [...friendIds, user.id]);
        }

        const { data, error } = await query
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
            isUser: p.id === user.id,
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
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 pb-32">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
          <h2 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">RANKING</h2>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/5 w-10 h-10" onClick={() => goBack()}>
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

function Achievements({ setView, user, goBack }: { setView: (v: View) => void, user: any, goBack: () => void }) {
  const achievements = useMemo(() => [
    { 
      id: 'flexoes', 
      label: 'Flexões', 
      icon: Dumbbell,
      items: [
        { title: "Primeira Flexão", desc: "Comece sua jornada", req: 1, current: user.totalPushups, reward: "XP +50", icon: Zap },
        { title: "10 Flexões", desc: "Aquecendo os motores", req: 10, current: user.totalPushups, reward: "XP +100", icon: Zap },
        { title: "50 Flexões", desc: "Já é um começo", req: 50, current: user.totalPushups, reward: "XP +250", icon: Dumbbell },
        { title: "100 Flexões", desc: "Mostre consistência", req: 100, current: user.totalPushups, reward: "Medalha Bronze", icon: Award },
        { title: "500 Flexões", desc: "Resistência pura", req: 500, current: user.totalPushups, reward: "XP +1000", icon: Target },
        { title: "1.000 Flexões", desc: "Guerreiro Mil", req: 1000, current: user.totalPushups, reward: "Moldura Mil", icon: Shield },
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
        { title: "20 Vitórias", desc: "Guerreiro de Elite", req: 20, current: user.wins, reward: "XP +1000", icon: Swords },
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
        { title: "15 Dias Seguidos", desc: "Hábito formado", req: 15, current: user.streak, reward: "Medalha Fogo", icon: Award },
        { title: "30 Dias Seguidos", desc: "Mês da superação", req: 30, current: user.streak, reward: "XP +2000", icon: Target },
      ]
    },
  ], [user]);

  const [activeCat, setActiveCat] = useState('flexoes');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 space-y-6 pb-32 overflow-y-auto max-h-[calc(100vh-80px)]">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase leading-tight">CONQUISTAS</h2>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Acompanhe seu progresso e conquiste tudo!</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5 w-10 h-10" onClick={() => goBack()}>
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
          { label: 'ÚLTIMO RANK', val: getRankInfo(user.xp).rankName, sub: 'PATENTE', icon: Medal, color: 'text-purple-evolve', border: 'border-purple-evolve/20' },
        ].map((item, i) => (
          <div key={i} className={`bg-[#151921] border ${item.border} rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center h-32`}>
            <item.icon className={`w-6 h-6 ${item.color}`} />
            <div className="space-y-0.5">
              <p className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-tight">{item.label}</p>
              <div className={`font-black italic text-white leading-none ${String(item.val).length > 8 ? 'text-lg' : 'text-2xl'}`}>{item.val}</div>
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
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 ${isCompleted ? 'bg-electric-blue/20 border-electric-blue/40 text-electric-blue shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-white/5 border-white/10 text-white/20'}`}>
                <ach.icon className="w-6 h-6" />
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

function PatentsList({ setView, user, goBack }: { setView: (v: View) => void, user: any, goBack: () => void }) {
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
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 pb-32 space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5" onClick={() => goBack()}><ArrowLeft className="w-5 h-5" /></Button>
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
    name: '',
    age: '',
    weight: '',
    height: '',
    experience: '',
    quantity: '',
    frequency: '',
    objective: ''
  });
  const [isFinished, setIsFinished] = useState(false);
  
  const questions = [
    { 
      id: 'name',
      q: "QUAL O SEU NOME OU APELIDO?", 
      type: 'text',
      placeholder: "Digite seu nome",
      icon: "👤"
    },
    { 
      id: 'age',
      q: "QUAL É A SUA IDADE?", 
      type: 'number',
      placeholder: "Digite sua idade",
      icon: "🎂"
    },
    { 
      id: 'weight',
      q: "QUAL É O SEU PESO (KG)?", 
      type: 'number',
      placeholder: "Digite seu peso",
      icon: "⚖️"
    },
    { 
      id: 'height',
      q: "QUAL É A SUA ALTURA (CM)?", 
      type: 'number',
      placeholder: "Digite sua altura",
      icon: "📏"
    },
    { 
      id: 'experience',
      q: "VOCÊ JÁ FAZ FLEXÕES?", 
      type: 'select',
      opts: ["Sim", "Não"],
      icon: "💪"
    },
    { 
      id: 'quantity',
      q: "QUANTAS FLEXÕES VOCÊ CONSEGUE FAZER COM BOA TÉCNICA?", 
      type: 'number',
      placeholder: "Digite a quantidade",
      icon: "🔢"
    },
    { 
      id: 'frequency',
      q: "COM QUE FREQUÊNCIA VOCÊ COSTUMA TREINAR?", 
      type: 'select',
      opts: ["Nunca", "1-2 vezes por semana", "3-4 vezes por semana", "5+ vezes por semana"],
      icon: "⏱️"
    },
    { 
      id: 'objective',
      q: "QUAL É O SEU OBJETIVO NO APP?", 
      type: 'select',
      opts: ["Participar de batalhas", "Melhorar minha técnica", "Acompanhar minha evolução", "Apenas me divertir"],
      icon: "🎯"
    }
  ];

  const current = questions[step - 1];

  const next = () => {
    if (step < questions.length) {
      setStep(s => s + 1);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00D2FF', '#FFFFFF', '#3B82F6']
      });

      // Save data and redirect
      const goalMap: Record<string, string> = {
        "Participar de batalhas": "Vencer outras pessoas",
        "Melhorar minha técnica": "Melhorar minhas flexões",
        "Acompanhar minha evolução": "Bater recordes",
        "Apenas me divertir": "Condicionamento"
      };

      setUser({
        ...user,
        name: answers.name || user.name,
        goal: goalMap[answers.objective] || 'Condicionamento',
        height: parseInt(String(answers.height)) || 0,
        weight: parseInt(String(answers.weight)) || 0,
        age: parseInt(String(answers.age)) || 0
      });

      localStorage.setItem('quiz_answers', JSON.stringify(answers));
      localStorage.setItem('onboarding_registration', 'true');
      
      setTimeout(() => {
        setView('auth');
      }, 3000);
    }
  };

  const select = (opt: string) => {
    setAnswers({ ...answers, [current.id]: opt });
    // Instant feedback then fast transition
    requestAnimationFrame(() => {
      setTimeout(next, 150);
    });
  };

  const handleInput = (val: string) => {
    setAnswers({ ...answers, [current.id]: val });
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[#0B0E14] text-center space-y-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        >
          <Check className="w-12 h-12 text-primary" />
        </motion.div>
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black italic text-white uppercase tracking-tighter"
        >
          🔥 TUDO PRONTO!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]"
        >
          PREPARANDO SUA ARENA...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#05070A] relative overflow-hidden safe-area-padding font-sans fixed inset-0 touch-none">
      {/* Background - Structured per reference image */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-blue-900/20 to-black/80 rounded-b-[3.5rem] border-b border-electric-blue/20 overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-electric-blue/10" />
        </div>
        <div className="absolute inset-0 bg-[#05070A] -z-10" />
        <div className="absolute top-[20%] left-[-10%] w-[60%] h-[40%] bg-electric-blue/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-between z-10 w-full max-w-sm mx-auto px-6 py-8 overflow-hidden">
        {/* Logo and Progress Area */}
        <div className="w-full flex flex-col items-center gap-4">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 relative p-2 bg-[#0B0E14] border border-electric-blue/30 rounded-2xl shadow-[0_0_20px_rgba(0,210,255,0.1)]">
              <img src={logoAsset.url} className="w-full h-full object-contain" alt="Logo" />
            </div>
            <h1 className="text-lg font-black italic tracking-tighter text-white uppercase leading-none">
              FLEX<span className="text-electric-blue">BATTLE</span>
            </h1>
          </motion.div>

          <div className="w-full space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-black uppercase text-white/50 tracking-[0.2em] italic">
                Pergunta {step} de {questions.length}
              </span>
              <span className="text-[9px] font-black uppercase text-electric-blue tabular-nums tracking-widest">
                {Math.round((step/questions.length)*100)}%
              </span>
            </div>
            
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1.5px] shadow-inner relative">
              <motion.div 
                className="h-full bg-gradient-to-r from-electric-blue to-blue-500 rounded-full relative" 
                initial={{ width: 0 }}
                animate={{ width: `${(step / questions.length) * 100}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="absolute inset-0 shadow-[0_0_15px_rgba(0,210,255,0.8)] rounded-full animate-pulse" />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20 rounded-full" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="w-full flex-1 flex flex-col justify-center min-h-0 py-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "circOut" }}
              className="w-full"
            >
              <div className="bg-[#0F131A]/90 backdrop-blur-xl border-2 border-electric-blue/30 rounded-[2.5rem] p-6 sm:p-8 space-y-4 sm:space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(0,210,255,0.15)] flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-xl shadow-lg">
                  <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{current.icon}</span>
                </div>

                <h2 className={`font-black italic text-white uppercase leading-tight tracking-tighter ${current.q.length > 40 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>
                  {current.q}
                </h2>

                <div className="w-full">
                  {current.type === 'select' ? (
                    <div className="flex flex-col gap-2 w-full">
                      {current.opts?.map((opt) => (
                        <Button 
                          key={opt}
                          variant="ghost" 
                          className={`w-full h-12 sm:h-14 text-[9px] font-black uppercase transition-all rounded-2xl active:scale-[0.97] active:brightness-125 neon-border-animated ${answers[current.id] === opt ? 'bg-electric-blue/20 text-white shadow-[0_0_20px_rgba(0,210,255,0.4)]' : 'bg-white/5 text-white/60'}`} 
                          onClick={() => select(opt)}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <input 
                        type={current.type === 'number' ? 'number' : 'text'}
                        pattern={current.type === 'number' ? '[0-9]*' : undefined}
                        inputMode={current.type === 'number' ? 'numeric' : undefined}
                        placeholder={current.placeholder || (current.type === 'number' ? 'Ex: 70' : '')}
                        className="w-full bg-black/40 border-2 border-electric-blue/30 rounded-2xl p-4 sm:p-5 text-lg sm:text-xl font-black italic text-center text-white focus:outline-none focus:border-electric-blue focus:bg-black/60 transition-all shadow-inner placeholder:text-white/10"
                        value={answers[current.id]}
                        onChange={(e) => handleInput(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && answers[current.id]) next();
                        }}
                      />
                      {current.id === 'weight' && (
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black italic text-white/20 uppercase">kg</span>
                      )}
                      {current.id === 'height' && (
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black italic text-white/20 uppercase">cm</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Actions & Footer */}
        <div className="w-full mt-auto pt-2 space-y-3 flex flex-col items-center">
          {current.type !== 'select' && (
            <div className="w-full flex flex-col gap-2">
              <Button 
                className="game-button w-full h-14 sm:h-16 text-lg italic uppercase neon-border-animated bg-electric-blue/10 text-white shadow-[0_0_25px_rgba(0,210,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                onClick={next}
                disabled={!answers[current.id]}
              >
                <span>CONTINUAR</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full h-12 sm:h-14 text-[11px] font-black uppercase text-white tracking-widest border-2 border-electric-blue/40 bg-white/5 hover:bg-white/10 hover:border-electric-blue/60 transition-all rounded-2xl shadow-[0_0_10px_rgba(0,210,255,0.1)] animate-[neon-border-pulse_3s_ease-in-out_infinite] active:scale-95 active:shadow-[0_0_20px_rgba(0,210,255,0.4)]"
                onClick={() => step > 1 && setStep(step - 1)}
                disabled={step === 1}
              >
                VOLTAR
              </Button>
            </div>
          )}
          
          {current.type === 'select' && step > 1 && (
            <Button 
              variant="ghost" 
              className="w-full h-12 sm:h-14 text-[11px] font-black uppercase text-white tracking-widest border-2 border-electric-blue/40 bg-white/5 hover:bg-white/10 hover:border-electric-blue/60 transition-all rounded-2xl shadow-[0_0_10px_rgba(0,210,255,0.1)] animate-[neon-border-pulse_3s_ease-in-out_infinite] active:scale-95 active:shadow-[0_0_20px_rgba(0,210,255,0.4)]"
              onClick={() => setStep(step - 1)}
            >
              VOLTAR
            </Button>
          )}

          <div className="flex flex-col items-center gap-1 opacity-60">
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-electric-blue" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">SEUS DADOS ESTÃO SEGUROS</span>
            </div>
            <p className="text-[7px] text-white/40 uppercase tracking-widest text-center">Suas informações são confidenciais</p>
          </div>
        </div>
      </div>
    </div>
  );
};



const QuizResult = ({ setView, user }: { setView: (v: View) => void, user: any }) => null;


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
    <div className="flex flex-col min-h-screen bg-[#05070A] p-6 relative safe-area-padding">
      {/* Background - Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-electric-blue/5 blur-[100px] rounded-full" />
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto gap-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-24 h-24 relative p-3 bg-[#0B0E14] border-2 border-electric-blue rounded-[2rem] shadow-[0_0_30px_rgba(0,210,255,0.3)]"
        >
          <img src={logoAsset.url} className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,210,255,0.5)]" alt="Logo" />
        </motion.div>

        <div className="w-full space-y-2 text-center">
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none flex flex-col items-center">
            <span className="text-electric-blue">FLEX</span>
            <span>BATTLE</span>
          </h2>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
            {isLogin ? "DE VOLTA À ARENA" : "INICIE SUA JORNADA"}
          </p>
        </div>

        <div className="w-full space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-5 flex items-center gap-2">
                <UserIcon className="w-3 h-3 text-electric-blue" /> NOME DE USUÁRIO
              </label>
              <input 
                className="w-full bg-[#0F131A] p-6 rounded-2xl text-white border-2 border-electric-blue/30 focus:border-electric-blue outline-none transition-all font-black italic tracking-tight placeholder:text-white/10" 
                placeholder="Ex: GUERREIRO" 
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-5 flex items-center gap-2">
              <Mail className="w-3 h-3 text-electric-blue" /> E-MAIL
            </label>
            <input 
              className="w-full bg-[#0F131A] p-6 rounded-2xl text-white border-2 border-electric-blue/30 focus:border-electric-blue outline-none transition-all font-black italic tracking-tight placeholder:text-white/10" 
              placeholder="seu@email.com" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-5 flex items-center gap-2">
              <Lock className="w-3 h-3 text-electric-blue" /> SENHA
            </label>
            <input 
              className="w-full bg-[#0F131A] p-6 rounded-2xl text-white border-2 border-electric-blue/30 focus:border-electric-blue outline-none transition-all font-black italic tracking-tight placeholder:text-white/10" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {isLogin && (
            <button className="text-[9px] font-black text-electric-blue/60 uppercase tracking-[0.2em] ml-5 hover:text-electric-blue transition-colors">
              ESQUECI MINHA SENHA
            </button>
          )}
        </div>

        <div className="w-full space-y-4 pt-4">
          <Button 
            className="game-button w-full h-20 text-xl italic uppercase neon-border-animated bg-electric-blue/10 shadow-[0_0_25px_rgba(0,210,255,0.4)] active:scale-95 transition-all" 
            onClick={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>PROCESSANDO...</span>
              </div>
            ) : (isLogin ? "ENTRAR" : "CRIAR CONTA")}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full h-16 text-[10px] font-black uppercase text-white/30 border border-white/5 hover:text-white transition-all rounded-2xl"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "AINDA NÃO TEM CONTA? CRIAR" : "JÁ POSSUI UMA CONTA? ENTRAR"}
          </Button>
        </div>
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
    <div className="flex flex-col min-h-screen bg-[#05070A] p-6 relative safe-area-padding">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full -z-10" />
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto gap-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">📸 FOTO DE ATLETA</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">IDENTIDADE DE GUERRA</p>
        </div>

        <div className="relative mx-auto group">
          <div className="w-56 h-56 rounded-full bg-[#0F131A] border-4 border-dashed border-electric-blue/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-electric-blue/50 group-hover:bg-electric-blue/5 shadow-[0_0_30px_rgba(0,210,255,0.1)]">
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/20">
                <Plus className="w-16 h-16" />
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
          <Button variant="ghost" className="h-16 bg-white/5 border border-white/10 uppercase font-black relative overflow-hidden rounded-2xl active:scale-95 transition-all text-[11px]">
            <Camera className="w-4 h-4 mr-2 text-electric-blue" /> Câmera
            <input type="file" accept="image/*" capture="user" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} />
          </Button>
          <Button variant="ghost" className="h-16 bg-white/5 border border-white/10 uppercase font-black relative overflow-hidden rounded-2xl active:scale-95 transition-all text-[11px]">
            <ImageIcon className="w-4 h-4 mr-2 text-electric-blue" /> Galeria
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFile} />
          </Button>
        </div>
        
        <div className="w-full space-y-4 pt-4">
          <Button 
            className="game-button w-full h-20 text-xl italic uppercase neon-border-animated bg-electric-blue/10 shadow-[0_0_25px_rgba(0,210,255,0.4)] active:scale-95 transition-all" 
            onClick={() => setView('profile-setup')}
            disabled={!preview}
          >
            PRÓXIMO PASSO →
          </Button>
        </div>
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
          goal: (user.goal && ['Ganhar força', 'Perder peso', 'Condicionamento', 'Massa muscular', 'Melhorar minhas flexões', 'Bater recordes', 'Vencer outras pessoas', 'Chegar ao topo do ranking'].includes(user.goal) ? user.goal : 'Ganhar força') as any,
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
    <div className="flex flex-col min-h-screen bg-[#05070A] p-6 relative safe-area-padding">
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full -z-10" />
      
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto gap-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter leading-none">💪 DADOS DO ATLETA</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">QUASE LÁ, GUERREIRO!</p>
        </div>

        <div className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-5">Nome de Atleta</label>
            <input 
              className="w-full bg-[#0F131A] border-2 border-electric-blue/30 rounded-2xl p-6 font-black italic text-white focus:outline-none focus:border-electric-blue transition-all text-xl uppercase tracking-tight"
              placeholder="EX: GUERREIRO"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: (e.target.value || '').toUpperCase()})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center block">Idade</label>
              <input 
                type="number"
                className="w-full bg-[#0F131A] border-2 border-electric-blue/30 rounded-2xl p-6 font-black italic text-white focus:outline-none focus:border-electric-blue transition-all text-center text-2xl"
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
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center block">Peso (kg)</label>
              <input 
                type="number"
                className="w-full bg-[#0F131A] border-2 border-electric-blue/30 rounded-2xl p-6 font-black italic text-white focus:outline-none focus:border-electric-blue transition-all text-center text-2xl"
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
        
        <div className="w-full space-y-4 pt-4">
          <Button 
            className={`game-button w-full h-20 text-xl italic uppercase transition-all neon-border-animated ${
              status === 'success' ? 'bg-green-600' : 
              status === 'error' ? 'bg-red-600' : 'bg-electric-blue/10 text-white shadow-[0_0_25px_rgba(0,210,255,0.4)]'
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
              "FINALIZAR CADASTRO →"
            )}
          </Button>
        </div>
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

function DailyReward({ setView, user, setUser, goBack }: { setView: (v: View) => void, user: any, setUser: any, goBack: () => void }) {
  const [rewardData, setRewardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const REWARDS = [
    { day: 1, type: 'XP', amount: 100, label: '100 XP' },
    { day: 2, type: 'Moedas', amount: 50, label: '50 MOEDAS' },
    { day: 3, type: 'Misto', amount: 150, label: 'XP + MOEDAS' },
    { day: 4, type: 'XP', amount: 500, label: '500 XP' },
    { day: 5, type: 'Especial', amount: 1, label: 'BAÚ ESPECIAL' },
    { day: 6, type: 'Misto', amount: 300, label: 'XP + MOEDAS' },
    { day: 7, type: 'Premium', amount: 1, label: 'RECOMPENSA PREMIUM' },
  ];

  useEffect(() => {
    const fetchRewardStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('daily_rewards')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data) {
        setRewardData(data);
      } else {
        const { data: newReward } = await supabase
          .from('daily_rewards')
          .insert({ user_id: session.user.id, streak_count: 0 } as any)
          .select()
          .single();
        setRewardData(newReward);
      }
      setLoading(false);
    };

    fetchRewardStatus();
  }, []);

  const claimReward = async () => {
    if (!rewardData || claiming) return;
    
    const lastClaimed = rewardData.last_claimed_at ? new Date(rewardData.last_claimed_at) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (lastClaimed) {
      const lastClaimedDate = new Date(lastClaimed);
      lastClaimedDate.setHours(0, 0, 0, 0);
      if (lastClaimedDate.getTime() === today.getTime()) {
        toast.error("Recompensa já resgatada!");
        return;
      }
    }

    setClaiming(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let newStreak = (rewardData.streak_count || 0) + 1;
      if (lastClaimed) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastClaimedDate = new Date(lastClaimed);
        lastClaimedDate.setHours(0, 0, 0, 0);
        
        if (lastClaimedDate.getTime() < yesterday.getTime()) {
          newStreak = 1;
        }
      }

      if (newStreak > 7) newStreak = 1;

      const { data: updated, error } = await supabase
        .from('daily_rewards')
        .update({
          streak_count: newStreak,
          last_claimed_at: new Date().toISOString()
        } as any)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) throw error;

      setRewardData(updated);
      
      const reward = REWARDS[newStreak - 1];
      const xpAmount = reward.amount;
      const newTotalXp = (user.xp || 0) + xpAmount;
      
      await supabase.from('profiles').update({ 
        xp: newTotalXp,
        last_login_at: new Date().toISOString()
      } as any).eq('id', session.user.id);
      
      setUser((prev: any) => ({ ...prev, xp: newTotalXp }));

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00D2FF', '#FFD700', '#FF3131']
      });

      toast.success(`Parabéns! Você resgatou: ${reward.label}`);
      
      // Trigger daily login mission and update last_login_at
      await supabase.rpc('track_daily_login', { user_id_param: session.user.id } as any);

    } catch (err) {
      console.error(err);
      toast.error("Erro ao resgatar recompensa");
    } finally {
      setClaiming(false);
    }
  };

  const isClaimedToday = () => {
    if (!rewardData?.last_claimed_at) return false;
    const lastClaimed = new Date(rewardData.last_claimed_at);
    const today = new Date();
    return lastClaimed.getFullYear() === today.getFullYear() && 
           lastClaimed.getMonth() === today.getMonth() && 
           lastClaimed.getDate() === today.getDate();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;

  const currentStreak = rewardData?.streak_count || 0;
  const claimedToday = isClaimedToday();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#0B0E14] p-6 pb-32">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 active:scale-90" onClick={goBack}><ArrowLeft className="w-5 h-5 text-white" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">RECOMPENSA DIÁRIA</h2>
      </div>

      <div className="space-y-6">
        {/* Streak Header */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center premium-glow-blue">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-electric-blue/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-[#0B0E14] rounded-full border-2 border-electric-blue flex items-center justify-center">
                <Flame className={`w-10 h-10 ${currentStreak > 0 ? 'text-energy-red fill-energy-red' : 'text-white/20'}`} />
              </div>
            </div>
          </div>
          <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">{currentStreak} DIAS SEGUIDOS</h3>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-2">MANTENHA A CONSTÂNCIA</p>
        </div>

        {/* Rewards Calendar */}
        <div className="grid grid-cols-7 gap-2">
          {REWARDS.map((reward, index) => {
            const isToday = index === currentStreak && !claimedToday;
            const isCompleted = index < currentStreak || (index === currentStreak - 1 && claimedToday);
            const isFuture = index > currentStreak || (index === currentStreak && claimedToday);

            return (
              <div key={reward.day} className="flex flex-col items-center gap-2">
                <motion.div
                  whileHover={!isCompleted ? { scale: 1.05 } : {}}
                  className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center relative overflow-hidden transition-all ${
                    isCompleted ? 'bg-electric-blue/20 border-electric-blue shadow-[0_0_10px_rgba(0,210,255,0.3)]' :
                    isToday ? 'bg-gold/10 border-gold animate-pulse shadow-[0_0_15px_rgba(255,215,0,0.4)]' :
                    'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  {isCompleted ? <Check className="w-6 h-6 text-electric-blue" /> : 
                   reward.type === 'XP' ? <Zap className="w-6 h-6 text-gold" /> :
                   reward.type === 'Moedas' ? <Trophy className="w-6 h-6 text-yellow-500" /> :
                   reward.type === 'Premium' ? <Star className="w-6 h-6 text-purple-evolve" /> :
                   <Sparkles className="w-6 h-6 text-white/40" />}
                  
                  {isToday && <div className="absolute top-0 right-0 p-1"><div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_5px_gold]" /></div>}
                </motion.div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${isToday ? 'text-gold' : 'text-white/40'}`}>DIA {reward.day}</span>
              </div>
            );
          })}
        </div>

        {/* Claim Button */}
        <div className="pt-4">
          <NeonFireWrapper color={claimedToday ? 'blue' : 'gold'} onClick={claimedToday ? undefined : claimReward} intense={!claimedToday}>
            <Button 
              disabled={claimedToday || claiming}
              className={`w-full py-8 text-xl font-black italic uppercase transition-all ${
                claimedToday 
                  ? 'bg-white/5 text-white/40 border-white/10 cursor-default' 
                  : 'bg-gold text-black shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:scale-[1.02]'
              }`}
            >
              {claiming ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
              {claimedToday ? 'RESGATADO HOJE ✓' : 'RESGATAR RECOMPENSA'}
            </Button>
          </NeonFireWrapper>
        </div>

        {/* Next Reward Info */}
        {!claimedToday && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
              <Gift className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">HOJE VOCÊ GANHA:</p>
              <p className="text-lg font-black text-white italic">{REWARDS[currentStreak]?.label || 'RECOMPENSA'}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DailyMissions({ setView, user, setUser, goBack }: { setView: (v: View) => void, user: any, setUser: any, goBack: () => void }) {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      // If it reaches midnight, refresh
      if (hours === 0 && minutes === 0 && seconds === 0) {
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchMissions = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('mission_date', new Date().toISOString().split('T')[0]);

      if (data && data.length > 0) {
        setMissions(data);
      } else {
        // Generate new missions for today
        const newMissions: any[] = [
          { user_id: session.user.id, type: 'login', title: '📱 ENTRAR NO APP', goal: 1, xp_reward: 50 },
          { user_id: session.user.id, type: 'pushups', title: '🏋️ FAZER 50 FLEXÕES', goal: 50, xp_reward: 100 },
          { user_id: session.user.id, type: 'matches', title: '⚔️ COMPLETAR 3 PARTIDAS', goal: 3, xp_reward: 150 },
          { user_id: session.user.id, type: 'wins', title: '🏆 VENCER 1 BATALHA', goal: 1, xp_reward: 200 },
          { user_id: session.user.id, type: 'xp', title: '⭐ GANHAR 500 XP', goal: 500, xp_reward: 250 }
        ];

        const { data: inserted } = await supabase
          .from('daily_missions')
          .insert(newMissions as any)
          .select();
        
        if (inserted) setMissions(inserted);
      }
      setLoading(false);
    };

    fetchMissions();
    
    // Subscribe to progress changes
    const channel = supabase
      .channel('mission-updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'daily_missions' 
      }, (payload) => {
        setMissions(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const claimMission = async (mission: any) => {
    if (mission.current_progress < mission.goal || mission.claimed || claimingId) return;

    setClaimingId(mission.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('daily_missions')
        .update({ claimed: true })
        .eq('id', mission.id);

      if (error) throw error;

      const newTotalXp = user.xp + mission.xp_reward;
      await supabase.from('profiles').update({ xp: newTotalXp }).eq('id', session.user.id);
      
      setUser((prev: any) => ({ ...prev, xp: newTotalXp }));
      
      confetti({
        particleCount: 100,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#A855F7', '#60A5FA']
      });

      toast.success(`Missão concluída! +${mission.xp_reward} XP`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao resgatar missão");
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#0B0E14] p-6 pb-32">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 active:scale-90" onClick={goBack}><ArrowLeft className="w-5 h-5 text-white" /></Button>
        <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase">MISSÕES DIÁRIAS</h2>
      </div>

      <div className="space-y-4">
        {missions.map((mission) => {
          const progress = Math.min(100, (mission.current_progress / mission.goal) * 100);
          const isCompleted = mission.current_progress >= mission.goal;
          const isClaimed = mission.claimed;

          return (
            <NeonFireWrapper key={mission.id} color={isClaimed ? 'blue' : isCompleted ? 'gold' : 'purple'} className="group" intense={isCompleted && !isClaimed}>
              <div className={`p-5 rounded-[1.8rem] bg-[#151921] border-2 transition-all ${
                isClaimed ? 'opacity-60 border-white/5' : 
                isCompleted ? 'border-gold shadow-[0_0_20px_rgba(255,215,0,0.1)]' : 
                'border-white/10'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-black italic text-white uppercase tracking-tight">{mission.title}</h3>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">+{mission.xp_reward} XP</p>
                  </div>
                  {isClaimed ? (
                    <Badge className="bg-white/10 text-white/40 border-none font-black italic text-[9px]">CONCLUÍDA</Badge>
                  ) : isCompleted ? (
                    <Button 
                      size="sm" 
                      className="h-8 bg-gold text-black font-black italic text-[10px] rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.4)] animate-bounce active:scale-95 transition-all"
                      onClick={() => claimMission(mission)}
                      disabled={!!claimingId}
                    >
                      {claimingId === mission.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'RESGATAR'}
                    </Button>
                  ) : (
                    <span className="text-[10px] font-black text-white/20 italic">{mission.current_progress} / {mission.goal}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isClaimed ? 'bg-white/20' : 
                        isCompleted ? 'bg-gold shadow-[0_0_10px_gold]' : 
                        'bg-purple-evolve shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </NeonFireWrapper>
          );
        })}
      </div>

      <NeonFireWrapper color="blue" className="mt-8">
        <div className="text-center p-6 bg-white/5 rounded-[2rem] border border-white/10">
          <Timer className="w-8 h-8 text-electric-blue mx-auto mb-2 drop-shadow-[0_0_8px_rgba(0,210,255,0.5)]" />
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">MISSÕES ATUALIZAM EM</p>
          <p className="text-4xl font-black text-white italic mt-2 tabular-nums tracking-tighter shadow-text-neon">{timeLeft || '00:00:00'}</p>
        </div>
      </NeonFireWrapper>
    </motion.div>
  );
}




