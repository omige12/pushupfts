import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Shield } from "lucide-react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0E14] px-4 overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-purple-600/10 blur-[100px] rounded-full" />
      
      <div className="max-w-md w-full text-center z-10 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-4 animate-pulse">
          <Shield className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
            OPS! ALGO DEU ERRADO
          </h1>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
            A ARENA ESTÁ INSTÁVEL OU OCORREU UM ERRO DE CARREGAMENTO.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="game-button bg-primary w-full py-6 text-sm font-black italic uppercase tracking-tighter shadow-[0_6px_0_0_rgba(29,78,216,0.5)] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            TENTAR NOVAMENTE
          </button>
          
          <a
            href="/"
            className="game-button bg-white/5 border border-white/10 w-full py-6 text-sm font-black italic uppercase tracking-tighter shadow-[0_6px_0_0_rgba(0,0,0,0.3)] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            VOLTAR AO INÍCIO
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { title: "Flex Battle - Desafie seus limites" },
      { name: "description", content: "Arena competitiva de flexões com IA. Treine, duele e suba no ranking." },
      { name: "author", content: "Flex Battle Team" },
      { property: "og:title", content: "Flex Battle" },
      { property: "og:description", content: "Desafie seus limites na arena de flexões com IA" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Flex Battle" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "theme-color", content: "#0B0E14" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'apple-touch-icon', href: '/favicon.png' },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors />
      <SWRegistration />
    </QueryClientProvider>
  );
}

function SWRegistration() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('SW registered: ', registration);
      }).catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
  return null;
}
