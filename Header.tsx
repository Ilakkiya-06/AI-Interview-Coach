import { Bot, Sparkles, Video } from "lucide-react";

interface HeaderProps {
  status: 'lobby' | 'interviewing' | 'evaluating' | 'completed';
}

export default function Header({ status }: HeaderProps) {
  return (
    <header id="app-header" className="border-b border-zinc-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-md shadow-zinc-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-zinc-900">AI Interview Coach</h1>
            <p className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Gemini 3.1 Pro Powered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {status === 'interviewing' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium animate-pulse">
              <Video className="w-3.5 h-3.5" />
              Live Meet Session
            </div>
          )}
          {status === 'evaluating' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              AI High Thinking Evaluation Active
            </div>
          )}
          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-200/60 px-2 py-1 rounded">
            v1.2.0-beta
          </span>
        </div>
      </div>
    </header>
  );
}
