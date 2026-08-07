import { createFileRoute } from "@tanstack/react-router";
import { 
  Trophy, 
  Dumbbell, 
  Swords, 
  Medal, 
  TrendingUp,
  User as UserIcon,
  ChevronRight,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PushUp Arena - Competição de Flexões" },
      {
        name: "description",
        content: "Desafie seus limites no PushUp Arena. Competição de flexões com contagem por IA e rankings globais.",
      },
      { property: "og:title", content: "PushUp Arena - Domine o Ranking" },
      { property: "og:image", content: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1200" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const user = {
    name: "Guerreiro Lovable",
    level: 12,
    league: "Elite",
    xp: 65,
    streak: 7,
    record: 58,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guerreiro",
    title: "Mestre das Flexões"
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-evolve/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Header Profile Section */}
      <div className="p-6 pt-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl border-2 border-gold p-0.5 bg-gradient-to-br from-gold to-orange-500 overflow-hidden">
                <img src={user.avatar} alt="Avatar" className="w-full h-full bg-secondary rounded-[14px]" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-purple-evolve text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                NV {user.level}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                {user.name}
                <Badge variant="outline" className="text-[10px] border-gold/50 text-gold uppercase bg-gold/10">
                  {user.league}
                </Badge>
              </h2>
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">
                {user.title}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-energy-red font-black text-xl italic">
              <Flame className="w-5 h-5 fill-current" />
              {user.streak}
            </div>
            <span className="text-[10px] uppercase text-muted-foreground font-bold">Sequência</span>
          </div>
        </header>

        {/* XP Progress */}
        <div className="glass-panel p-4 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">Experiência (XP)</span>
            <span className="text-xs font-black text-purple-evolve">650 / 1000</span>
          </div>
          <Progress value={user.xp} className="h-3 bg-white/5" indicatorClassName="bg-gradient-to-r from-purple-evolve to-indigo-500" />
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Button 
            className="game-button bg-energy-red hover:bg-energy-red/90 h-32 flex-col gap-2 col-span-2"
            onClick={() => console.log('Desafiar')}
          >
            <Swords className="w-10 h-10 mb-1" />
            <span className="text-xl">Desafiar</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="game-button bg-primary/20 border border-primary/30 h-28 flex-col gap-1"
          >
            <Dumbbell className="w-7 h-7" />
            <span className="text-sm">Treinar</span>
          </Button>

          <Button 
            variant="secondary" 
            className="game-button bg-gold/20 border border-gold/30 h-28 flex-col gap-1 text-gold"
          >
            <Trophy className="w-7 h-7" />
            <span className="text-sm">Ranking</span>
          </Button>

          <Button 
            variant="secondary" 
            className="game-button bg-purple-evolve/20 border border-purple-evolve/30 h-28 flex-col gap-1 text-purple-evolve"
          >
            <Medal className="w-7 h-7" />
            <span className="text-sm">Conquistas</span>
          </Button>

          <Button 
            variant="secondary" 
            className="game-button bg-white/5 border border-white/10 h-28 flex-col gap-1"
          >
            <TrendingUp className="w-7 h-7 text-green-500" />
            <span className="text-sm text-white">Evolução</span>
          </Button>
        </div>

        {/* Stats Summary */}
        <Card className="glass-panel p-6 border-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold uppercase tracking-wider text-sm">Resumo da Temporada</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Recorde Pessoal</p>
              <p className="text-2xl font-black italic">{user.record}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Taxa de Vitórias</p>
              <p className="text-2xl font-black italic text-green-500">74%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation (Modern Floating) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] glass-panel h-16 flex items-center justify-around px-2 shadow-2xl border-white/20">
        <button className="p-3 text-primary"><Flame className="w-6 h-6 fill-current" /></button>
        <button className="p-3 text-muted-foreground"><Trophy className="w-6 h-6" /></button>
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center -mt-8 shadow-[0_0_20px_rgba(59,130,246,0.5)] border-4 border-background">
          <Swords className="w-6 h-6 text-white" />
        </div>
        <button className="p-3 text-muted-foreground"><Medal className="w-6 h-6" /></button>
        <button className="p-3 text-muted-foreground"><UserIcon className="w-6 h-6" /></button>
      </nav>
    </div>
  );
}
