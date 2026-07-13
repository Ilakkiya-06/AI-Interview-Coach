import React, { useState } from "react";
import { InterviewConfig } from "../types";
import { Sparkles, ArrowRight, Briefcase, Building, FileText, Compass, Video } from "lucide-react";
import { motion } from "motion/react";

interface PrepLobbyProps {
  onStart: (config: InterviewConfig) => void;
  isLoading: boolean;
}

export default function PrepLobby({ onStart, isLoading }: PrepLobbyProps) {
  const [config, setConfig] = useState<InterviewConfig>({
    jobTitle: "Software Engineer",
    company: "Google",
    description: "Looking for a developer skilled in React, Node.js, and scalable architecture. Strong problem-solving skills required.",
    level: "Senior",
    type: "Technical",
    mode: "google-meet", // Default to the interactive Google Meet simulation
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.jobTitle.trim()) return;
    onStart(config);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-3">
          Ace Your Next Interview
        </h2>
        <p className="text-zinc-500 max-w-lg mx-auto text-sm">
          Generate realistic, customized interview questions using Gemini, and practice in an immersive, real-time environment.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-zinc-200/80 rounded-2xl p-6 md:p-8 shadow-xl shadow-zinc-100"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Job Title & Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                Target Job Title
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all outline-none"
                placeholder="e.g. Frontend Engineer, Product Manager"
                value={config.jobTitle}
                onChange={(e) => setConfig({ ...config, jobTitle: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-zinc-400" />
                Target Company
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all outline-none"
                placeholder="e.g. Google, Stripe, Meta (optional)"
                value={config.company}
                onChange={(e) => setConfig({ ...config, company: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Experience & Interview Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-zinc-400" />
                Experience Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Junior', 'Mid', 'Senior', 'Lead'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setConfig({ ...config, level: lvl })}
                    className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                      config.level === lvl
                        ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100/80'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                Interview Stage/Type
              </label>
              <select
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all outline-none appearance-none"
                value={config.type}
                onChange={(e) => setConfig({ ...config, type: e.target.value as any })}
              >
                <option value="Technical">Technical (Coding & Engineering)</option>
                <option value="Behavioral">Behavioral (STAR Method & Culture)</option>
                <option value="System Design">System Design & Scaling</option>
                <option value="Case Study">Case Study & Strategy</option>
              </select>
            </div>
          </div>

          {/* Job Description Context */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Job Description / Role Requirements
            </label>
            <textarea
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all outline-none resize-none h-24"
              placeholder="Paste job posting text or key skills expected for this interview..."
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
            />
          </div>

          {/* Mode Selection */}
          <div className="border-t border-zinc-100 pt-6">
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-3">
              Practice environment
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'google-meet' })}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col gap-2 ${
                  config.mode === 'google-meet'
                    ? 'border-zinc-900 bg-zinc-50/50 ring-1 ring-zinc-900'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-zinc-900 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-emerald-600" />
                    Immersive Google Meet Simulation
                  </span>
                  {config.mode === 'google-meet' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Practice inside a mock Google Meet interface. AI Interviewer has an avatar, closed captions transcribe your voice, and standard Meet controls are active.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, mode: 'standard' })}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col gap-2 ${
                  config.mode === 'standard'
                    ? 'border-zinc-900 bg-zinc-50/50 ring-1 ring-zinc-900'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-zinc-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Standard Q&A Sandbox
                  </span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  A simple, minimal preparation sandbox. View questions one-by-one, draft text answers at your own pace, and view immediate expert suggestions.
                </p>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-900 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-zinc-200 disabled:opacity-75 flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Coordinating with Gemini AI...
              </>
            ) : (
              <>
                Initialize Mock Interview
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
