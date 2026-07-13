import { useState } from "react";
import { InterviewConfig, InterviewEvaluation } from "../types";
import { 
  Award, CheckCircle, TrendingUp, AlertTriangle, HelpCircle, 
  ChevronRight, ChevronDown, RefreshCw, Star, Sparkles, BookOpen 
} from "lucide-react";
import { motion } from "motion/react";

interface EvaluationDashboardProps {
  config: InterviewConfig;
  evaluation: InterviewEvaluation;
  onRestart: () => void;
}

export default function EvaluationDashboard({ config, evaluation, onRestart }: EvaluationDashboardProps) {
  const [expandedQId, setExpandedQId] = useState<string | null>(evaluation.feedbackList[0]?.questionId || null);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500";
    if (score >= 70) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div id="evaluation-dashboard" className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-zinc-950 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-zinc-800 rounded-full opacity-10 filter blur-xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest bg-zinc-800/80 px-2.5 py-1 rounded border border-zinc-700/50 flex items-center gap-1.5 w-fit mb-3">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              High Thinking AI Analysis Complete
            </span>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Performance Scorecard</h3>
            <p className="text-zinc-400 text-xs mt-1">
              Role: <span className="text-white font-medium">{config.level} {config.jobTitle}</span> at <span className="text-white font-medium">{config.company}</span>
            </p>
          </div>

          {/* Large Overall Score Ring */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" className="stroke-zinc-800 fill-none" strokeWidth="8" />
                <circle 
                  cx="48" cy="48" r="40" 
                  className="stroke-emerald-500 fill-none transition-all duration-1000" 
                  strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - evaluation.overallScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-white leading-none">{evaluation.overallScore}</span>
                <span className="text-[9px] text-zinc-400 font-mono mt-0.5">SCORE</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-mono text-emerald-400 block font-semibold">
                {evaluation.overallScore >= 85 ? "Excellent Match" : evaluation.overallScore >= 70 ? "Strong Candidate" : "Growth Recommended"}
              </span>
              <span className="text-[11px] text-zinc-400 max-w-[200px] block mt-0.5 leading-relaxed">
                Evaluated against core competencies of premium engineering organizations.
              </span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800">
          {[
            { label: "Technical capability", val: evaluation.breakdown.technical },
            { label: "Communication clarity", val: evaluation.breakdown.communication },
            { label: "Problem Solving", val: evaluation.breakdown.problemSolving },
            { label: "Culture & Team Fit", val: evaluation.breakdown.cultureFit }
          ].map((comp, idx) => (
            <div key={idx} className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 block mb-1">{comp.label}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${comp.val}%` }}></div>
                </div>
                <span className="text-xs font-mono font-medium text-zinc-200">{comp.val}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Summary Narrative */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
        <h4 className="text-sm font-semibold text-zinc-900 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-zinc-500" />
          Executive Interview Summary
        </h4>
        <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line">
          {evaluation.summary}
        </p>
      </div>

      {/* Key Strengths & Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
            Key Strengths
          </h4>
          <ul className="space-y-3">
            {evaluation.keyStrengths.map((strength, idx) => (
              <li key={idx} className="flex gap-3 text-xs leading-relaxed text-zinc-600">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
            Areas for Development
          </h4>
          <ul className="space-y-3">
            {evaluation.areasForImprovement.map((area, idx) => (
              <li key={idx} className="flex gap-3 text-xs leading-relaxed text-zinc-600">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Question Feedback Cards */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-zinc-900 flex items-center gap-2 pl-1">
          <Award className="w-4.5 h-4.5 text-zinc-500" />
          Question-by-Question Diagnostic
        </h4>

        <div className="space-y-3">
          {evaluation.feedbackList.map((fb, idx) => {
            const isExpanded = expandedQId === fb.questionId;
            return (
              <div 
                key={fb.questionId}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm transition-all hover:border-zinc-300"
              >
                {/* Header Summary */}
                <button
                  onClick={() => setExpandedQId(isExpanded ? null : fb.questionId)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/50 transition-all cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-zinc-400 font-mono block uppercase">Question {idx + 1}</span>
                    <h5 className="text-sm font-semibold text-zinc-800 truncate mt-0.5">
                      {fb.questionText}
                    </h5>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getScoreColor(fb.score)}`}>
                      {fb.score}%
                    </span>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-zinc-100 bg-zinc-50/30 space-y-4 text-xs leading-relaxed">
                    {/* Critique */}
                    <div>
                      <span className="font-semibold text-zinc-900 block mb-1">Critique & Assessment</span>
                      <p className="text-zinc-600 bg-white p-3 rounded-xl border border-zinc-200/60">
                        {fb.critique}
                      </p>
                    </div>

                    {/* Model Answer */}
                    <div>
                      <span className="font-semibold text-zinc-950 block mb-1 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Exemplary Polished Response
                      </span>
                      <p className="text-zinc-700 bg-amber-50/20 p-3 rounded-xl border border-amber-100 italic whitespace-pre-line leading-relaxed">
                        &quot;{fb.polishedAnswer}&quot;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Restart CTA */}
      <div className="text-center pt-4">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-zinc-950 hover:bg-zinc-900 text-white font-medium text-sm rounded-xl inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Prepare Another Session
        </button>
      </div>
    </div>
  );
}
