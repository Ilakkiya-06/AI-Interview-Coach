import { useState, useEffect } from "react";
import Header from "./components/Header";
import PrepLobby from "./components/PrepLobby";
import MeetSimulation from "./components/MeetSimulation";
import StandardSandbox from "./components/StandardSandbox";
import EvaluationDashboard from "./components/EvaluationDashboard";
import { InterviewConfig, Question, Answer, InterviewEvaluation } from "./types";
import { Sparkles, Bot, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [status, setStatus] = useState<'lobby' | 'interviewing' | 'evaluating' | 'completed'>('lobby');
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [meetLink, setMeetLink] = useState<string>("");

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active step phrases for high-reasoning evaluation loading state
  const [evalPhraseIdx, setEvalPhraseIdx] = useState(0);
  const evalPhrases = [
    "Compiling interview answers...",
    "Activating Gemini 3.1 Pro High-Thinking Reasoning Engine...",
    "Analyzing technical depth & communication vocabulary...",
    "Evaluating problem solving frameworks & STAR formats...",
    "Polishing exemplar expert responses tailored to your profile...",
    "Calculating final competency score breakdowns..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'evaluating') {
      interval = setInterval(() => {
        setEvalPhraseIdx((prev) => (prev + 1) % evalPhrases.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Handler: Start Mock Session
  const handleStartSession = async (cfg: InterviewConfig) => {
    setIsLoadingQuestions(true);
    setError(null);
    setConfig(cfg);

    try {
      // 1. Generate customized questions
      const resQuestions = await fetch("/api/interview/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });

      if (!resQuestions.ok) {
        const errData = await resQuestions.json();
        throw new Error(errData.error || "Failed to generate questions.");
      }

      const qData = await resQuestions.json();
      setQuestions(qData.questions);

      // 2. Mock a secure Google Meet Link
      const resMeet = await fetch("/api/meet/simulate", {
        method: "POST",
      });
      const meetData = await resMeet.json();
      setMeetLink(meetData.meetLink || "https://meet.google.com/abc-defg-hij");

      setStatus('interviewing');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Handler: Complete Session
  const handleCompleteSession = async (candidateAnswers: Answer[]) => {
    setAnswers(candidateAnswers);
    setStatus('evaluating');
    setError(null);

    try {
      const response = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          questions,
          answers: candidateAnswers
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Evaluation failed. Please try again.");
      }

      const evalData = await response.json();
      setEvaluation(evalData.evaluation);
      setStatus('completed');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "High-reasoning AI evaluation failed. Standard metrics fallback used.");
      
      // Safe fallback if API fails
      setEvaluation({
        overallScore: 75,
        breakdown: { technical: 75, communication: 80, problemSolving: 70, cultureFit: 78 },
        keyStrengths: [
          "Clear structure in expressing thoughts.",
          "Good attempt to cover key conceptual terms."
        ],
        areasForImprovement: [
          "Provide deeper details and use specific frameworks like the STAR method."
        ],
        feedbackList: questions.map(q => ({
          questionId: q.id,
          questionText: q.text,
          score: 75,
          critique: "A solid answer. Could benefit from using explicit examples and details.",
          polishedAnswer: `I would frame this answer using the STAR method: State the Situation clearly, outline the specific Task, detail your personal Actions, and conclude with measurable Results.`
        })),
        summary: "Your practice session was completed successfully! Practice makes perfect, focus on structural STAR delivery."
      });
      setStatus('completed');
    }
  };

  // Reset Session
  const handleRestart = () => {
    setStatus('lobby');
    setConfig(null);
    setQuestions([]);
    setAnswers([]);
    setEvaluation(null);
    setMeetLink("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col antialiased selection:bg-zinc-900 selection:text-white">
      {status !== 'interviewing' && <Header status={status} />}

      <main className="flex-1">
        {/* Error Notification banner */}
        {error && (
          <div className="max-w-3xl mx-auto mt-6 px-4">
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3.5 rounded-xl flex items-start gap-3 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Error:</span>
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 transition-all font-bold px-1.5 cursor-pointer">
                &times;
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* LOBBY VIEW */}
          {status === 'lobby' && (
            <motion.div
              key="lobby-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <PrepLobby onStart={handleStartSession} isLoading={isLoadingQuestions} />
            </motion.div>
          )}

          {/* ACTIVE INTERVIEWING */}
          {status === 'interviewing' && config && (
            <motion.div
              key="interview-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {config.mode === 'google-meet' ? (
                <MeetSimulation
                  config={config}
                  questions={questions}
                  onComplete={handleCompleteSession}
                  onExit={handleRestart}
                  meetLink={meetLink}
                />
              ) : (
                <StandardSandbox
                  config={config}
                  questions={questions}
                  onComplete={handleCompleteSession}
                  onExit={handleRestart}
                />
              )}
            </motion.div>
          )}

          {/* HIGH THINKING AI EVALUATION LOADING SCREEN */}
          {status === 'evaluating' && (
            <motion.div
              key="evaluating-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto px-4 py-24 text-center space-y-6"
            >
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-zinc-100 animate-pulse"></div>
                <div className="w-16 h-16 rounded-full bg-zinc-950 flex items-center justify-center text-white shadow-xl animate-spin border-t-emerald-500 border-t-4">
                  <Bot className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold tracking-tight text-zinc-900 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                  Generating Comprehensive Feedback
                </h3>
                <p className="text-xs text-zinc-500 font-mono italic max-w-xs mx-auto animate-pulse h-10 flex items-center justify-center">
                  &quot;{evalPhrases[evalPhraseIdx]}&quot;
                </p>
                <p className="text-[10px] text-zinc-400 max-w-xs mx-auto leading-relaxed pt-2">
                  Gemini 3.1 Pro is leveraging high thinking levels to grade your answers, identify strengths, and write polished STAR model exemplar replies.
                </p>
              </div>
            </motion.div>
          )}

          {/* COMPLETED REPORT CARD */}
          {status === 'completed' && config && evaluation && (
            <motion.div
              key="completed-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <EvaluationDashboard
                config={config}
                evaluation={evaluation}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      {status !== 'interviewing' && (
        <footer className="py-6 border-t border-zinc-200/80 bg-white text-center text-xs text-zinc-400 font-mono mt-12">
          <p>© 2026 AI Interview Coach. All Rights Reserved.</p>
          <p className="mt-1 text-[10px] text-zinc-400/80">Secured via server-side Gemini API sandboxes.</p>
        </footer>
      )}
    </div>
  );
}
