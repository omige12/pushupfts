import { createFileRoute } from "@tanstack/react-router";
import { ChessGame } from "@/components/ChessGame";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Xadrez — Jogue contra a IA" },
      {
        name: "description",
        content:
          "Jogue xadrez no navegador contra uma IA com 4 níveis de dificuldade: fácil, médio, difícil e especialista.",
      },
      { property: "og:title", content: "Xadrez — Jogue contra a IA" },
      {
        property: "og:description",
        content: "Partidas de xadrez com 4 níveis de dificuldade.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-8 sm:py-12">
      <header className="max-w-6xl mx-auto mb-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
          ♚ Xadrez
        </h1>
        <p className="mt-2 text-muted-foreground">
          Jogue contra a IA — escolha o seu nível
        </p>
      </header>
      <div className="flex justify-center">
        <ChessGame />
      </div>
    </main>
  );
}
