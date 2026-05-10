import { useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square, type Move, type Color } from "chess.js";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Level = "easy" | "medium" | "hard" | "expert";

const PIECE_GLYPHS: Record<string, string> = {
  wK: "♔", wQ: "♕", wR: "♖", wB: "♗", wN: "♘", wP: "♙",
  bK: "♚", bQ: "♛", bR: "♜", bB: "♝", bN: "♞", bP: "♟",
};

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

const PST_PAWN = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
];
const PST_KNIGHT = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -30,  0, 10, 15, 15, 10,  0,-30,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -30,  5, 10, 15, 15, 10,  5,-30,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50,
];

function squareIndex(sq: Square, color: Color): number {
  const file = sq.charCodeAt(0) - 97;
  const rank = parseInt(sq[1], 10) - 1;
  const idx = (7 - rank) * 8 + file;
  return color === "w" ? idx : 63 - idx;
}

function evaluate(game: Chess): number {
  // From black's perspective (AI is black). Positive = good for black.
  const board = game.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      const sq = (String.fromCharCode(97 + f) + (8 - r)) as Square;
      const value = PIECE_VALUES[piece.type];
      let pst = 0;
      if (piece.type === "p") pst = PST_PAWN[squareIndex(sq, piece.color)];
      else if (piece.type === "n") pst = PST_KNIGHT[squareIndex(sq, piece.color)];
      const total = value + pst;
      score += piece.color === "b" ? total : -total;
    }
  }
  return score;
}

function negamax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  color: 1 | -1,
): number {
  if (depth === 0 || game.isGameOver()) {
    if (game.isCheckmate()) return -100000 * color * (game.turn() === "b" ? 1 : -1);
    if (game.isDraw()) return 0;
    return color * evaluate(game);
  }
  const moves = game.moves({ verbose: true }) as Move[];
  // Order: captures first
  moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));
  let best = -Infinity;
  for (const m of moves) {
    game.move(m);
    const score = -negamax(game, depth - 1, -beta, -alpha, (-color) as 1 | -1);
    game.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

function pickAIMove(game: Chess, level: Level): Move | null {
  const moves = game.moves({ verbose: true }) as Move[];
  if (moves.length === 0) return null;

  if (level === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = level === "medium" ? 2 : level === "hard" ? 3 : 4;
  let best: Move = moves[0];
  let bestScore = -Infinity;
  // Add small randomness to medium for variety
  const candidates: { move: Move; score: number }[] = [];
  for (const m of moves) {
    game.move(m);
    const score = -negamax(game, depth - 1, -Infinity, Infinity, 1);
    game.undo();
    candidates.push({ move: m, score });
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  if (level === "medium") {
    const top = candidates.filter((c) => c.score >= bestScore - 30);
    return top[Math.floor(Math.random() * top.length)].move;
  }
  return best;
}

export function ChessGame() {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [level, setLevel] = useState<Level>("medium");
  const [thinking, setThinking] = useState(false);
  const [status, setStatus] = useState("Sua vez (brancas)");
  const [history, setHistory] = useState<string[]>([]);

  const game = gameRef.current;

  const board = useMemo(() => {
    void fen;
    return game.board();
  }, [fen, game]);

  const updateStatus = () => {
    if (game.isCheckmate()) {
      setStatus(game.turn() === "w" ? "Xeque-mate! Você perdeu." : "Xeque-mate! Você venceu!");
    } else if (game.isDraw()) {
      setStatus("Empate.");
    } else if (game.isCheck()) {
      setStatus(game.turn() === "w" ? "Xeque! Sua vez." : "Xeque no oponente.");
    } else {
      setStatus(game.turn() === "w" ? "Sua vez (brancas)" : "Pensando...");
    }
  };

  const refresh = () => {
    setFen(game.fen());
    setHistory([...game.history()]);
    updateStatus();
  };

  const aiTurn = () => {
    if (game.isGameOver() || game.turn() !== "b") return;
    setThinking(true);
    setTimeout(() => {
      const move = pickAIMove(game, level);
      if (move) game.move(move);
      setThinking(false);
      refresh();
    }, 50);
  };

  useEffect(() => {
    if (game.turn() === "b" && !game.isGameOver()) aiTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen]);

  const handleSquareClick = (sq: Square) => {
    if (thinking || game.turn() !== "w" || game.isGameOver()) return;
    const piece = game.get(sq);
    if (selected) {
      if (legalTargets.includes(sq)) {
        const moveOpts: { from: Square; to: Square; promotion?: string } = {
          from: selected,
          to: sq,
        };
        const sel = game.get(selected);
        if (sel?.type === "p" && (sq[1] === "8" || sq[1] === "1")) {
          moveOpts.promotion = "q";
        }
        try {
          game.move(moveOpts);
        } catch {
          // illegal
        }
        setSelected(null);
        setLegalTargets([]);
        refresh();
        return;
      }
      if (piece && piece.color === "w") {
        const moves = game.moves({ square: sq, verbose: true }) as Move[];
        setSelected(sq);
        setLegalTargets(moves.map((m) => m.to as Square));
        return;
      }
      setSelected(null);
      setLegalTargets([]);
      return;
    }
    if (piece && piece.color === "w") {
      const moves = game.moves({ square: sq, verbose: true }) as Move[];
      setSelected(sq);
      setLegalTargets(moves.map((m) => m.to as Square));
    }
  };

  const newGame = () => {
    gameRef.current = new Chess();
    setSelected(null);
    setLegalTargets([]);
    setHistory([]);
    setFen(gameRef.current.fen());
    setStatus("Sua vez (brancas)");
  };

  const undo = () => {
    if (thinking) return;
    game.undo(); // undo AI
    game.undo(); // undo player
    setSelected(null);
    setLegalTargets([]);
    refresh();
  };

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-6xl">
      <div className="flex-1 flex flex-col items-center">
        <div
          className="grid grid-cols-8 rounded-xl overflow-hidden shadow-2xl border border-border"
          style={{ width: "min(90vw, 560px)", aspectRatio: "1 / 1" }}
        >
          {ranks.map((rank, r) =>
            files.map((file, f) => {
              const sq = (file + rank) as Square;
              const isLight = (r + f) % 2 === 0;
              const piece = board[r][f];
              const isSelected = selected === sq;
              const isTarget = legalTargets.includes(sq);
              return (
                <button
                  key={sq}
                  onClick={() => handleSquareClick(sq)}
                  className="relative flex items-center justify-center text-4xl sm:text-5xl select-none transition-colors"
                  style={{
                    backgroundColor: isSelected
                      ? "var(--board-selected)"
                      : isLight
                        ? "var(--board-light)"
                        : "var(--board-dark)",
                    color: piece?.color === "w" ? "#fafafa" : "#1a1a1a",
                    textShadow:
                      piece?.color === "w"
                        ? "0 1px 2px rgba(0,0,0,0.6)"
                        : "0 1px 2px rgba(255,255,255,0.25)",
                  }}
                >
                  {piece && PIECE_GLYPHS[piece.color + piece.type.toUpperCase()]}
                  {isTarget && (
                    <span
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: piece ? "85%" : "30%",
                        height: piece ? "85%" : "30%",
                        background: piece
                          ? "transparent"
                          : "var(--board-highlight)",
                        border: piece
                          ? "3px solid var(--board-highlight)"
                          : "none",
                        borderRadius: piece ? "8px" : "9999px",
                      }}
                    />
                  )}
                  {f === 0 && (
                    <span
                      className="absolute left-1 top-0.5 text-[10px] font-bold opacity-60"
                      style={{ color: isLight ? "#1a1a1a" : "#fafafa" }}
                    >
                      {rank}
                    </span>
                  )}
                  {r === 7 && (
                    <span
                      className="absolute right-1 bottom-0.5 text-[10px] font-bold opacity-60"
                      style={{ color: isLight ? "#1a1a1a" : "#fafafa" }}
                    >
                      {file}
                    </span>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      <aside className="w-full lg:w-80 bg-card text-card-foreground rounded-xl p-6 shadow-xl border border-border space-y-5">
        <div>
          <h2 className="text-lg font-semibold mb-1">Status</h2>
          <p className="text-sm text-muted-foreground">
            {thinking ? "IA pensando..." : status}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Nível</label>
          <Select value={level} onValueChange={(v) => setLevel(v as Level)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Fácil — jogadas aleatórias</SelectItem>
              <SelectItem value="medium">Médio — profundidade 2</SelectItem>
              <SelectItem value="hard">Difícil — profundidade 3</SelectItem>
              <SelectItem value="expert">Especialista — profundidade 4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={newGame} className="flex-1" variant="default">
            Novo jogo
          </Button>
          <Button onClick={undo} variant="outline" className="flex-1">
            Desfazer
          </Button>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Histórico</h3>
          <div className="bg-muted/40 rounded-lg p-3 max-h-64 overflow-y-auto text-sm font-mono leading-relaxed">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-xs">Sem jogadas ainda.</p>
            ) : (
              <ol className="grid grid-cols-2 gap-x-3">
                {history.map((m, i) => (
                  <li key={i} className="flex gap-2">
                    {i % 2 === 0 && (
                      <span className="text-muted-foreground">{i / 2 + 1}.</span>
                    )}
                    <span>{m}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}