import { useState } from "react";
import { Question, Answer, InterviewConfig } from "../types";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, HelpCircle, Send } from "lucide-react";
import { motion } from "motion/react";

interface StandardSandboxProps {
  config: InterviewConfig;
  questions: Question[];
  onComplete: (answers: Answer[]) => void;
  onExit: () => void;
}

export default function StandardSandbox({ config, questions, onComplete, onExit }: StandardSandboxProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentInput, setCurrentInput] = useState("");

  const activeQuestion = questions[currentIdx];

  const handleNext = () => {
    const nextAnswers = [
      ...answers,
      {
        questionId: activeQuestion.id,
        questionText: activeQuestion.text,
        userAnswer: currentInput.trim() || "[No Answer/Skipped]",
        durationSeconds: 0 // Not tracked in text sandbox
      }
    ];
    setAnswers(nextAnswers);
    setCurrentInput("");

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(nextAnswers);
    }
  };

  const handleSkip = () => {
    const nextAnswers = [
      ...answers,
      {
        questionId: activeQuestion.id,
        questionText: activeQuestion.text,
        userAnswer: "[Skipped]",
        durationSeconds: 0
      }
    ];
    setAnswers(nextAnswers);
    setCurrentInput("");

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(nextAnswers);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header and Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Exit Sandbox
        </button>
        <span className="text-xs font-mono text-zinc-400">
          Question {currentIdx + 1} of {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-zinc-900 transition-all duration-300" 
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Main card */}
      <motion.div
        key={activeQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
      >
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 border border-zinc-200/60 rounded uppercase">
            {activeQuestion.category}
          </span>
          <h3 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900">
            {activeQuestion.text}
          </h3>
        </div>

        {/* Recruiter hint */}
        <div className="bg-zinc-50 border border-zinc-200/80 p-4 rounded-xl flex gap-3 text-xs text-zinc-600 leading-relaxed">
          <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Focus areas:</span>
            <span>{activeQuestion.hint}</span>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider block">
            Your Prepared Answer
          </label>
          <textarea
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all outline-none min-h-[160px] resize-none"
            placeholder="Draft your answer here. Highlight key frameworks (like the STAR method for behavioral questions or clean architectural block diagrams for system design)..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
          />
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-150 rounded-lg transition-all cursor-pointer"
          >
            Skip Question
          </button>
          <button
            onClick={handleNext}
            className="px-5 py-2.5 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>
              {currentIdx + 1 === questions.length ? "Submit for Evaluation" : "Next Question"}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
