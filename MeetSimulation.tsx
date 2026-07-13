import { useState, useEffect, useRef } from "react";
import { Question, Answer, InterviewConfig } from "../types";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Hand, 
  MessageSquare, MoreVertical, Sparkles, Send, Volume2, Info, CheckCircle2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MeetSimulationProps {
  config: InterviewConfig;
  questions: Question[];
  onComplete: (answers: Answer[]) => void;
  onExit: () => void;
  meetLink: string;
}

export default function MeetSimulation({ config, questions, onComplete, onExit, meetLink }: MeetSimulationProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  
  // Media states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  // Speech synthesis & recognition
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  
  // Timer for tracking how long they answer
  const [questionTimer, setQuestionTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Webcam stream reference
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const activeQuestion = questions[currentIdx];

  // Initialize Webcam
  useEffect(() => {
    async function setupCamera() {
      if (isVideoOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn("Camera access denied or unavailable:", err);
          setIsVideoOn(false);
        }
      } else {
        stopCamera();
      }
    }
    setupCamera();

    return () => {
      stopCamera();
    };
  }, [isVideoOn]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Question timer
  useEffect(() => {
    setQuestionTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setQuestionTimer((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx]);

  // Handle Interviewer voice synthesis
  useEffect(() => {
    if (activeQuestion) {
      speakQuestion(activeQuestion.text);
    }
  }, [currentIdx]);

  const speakQuestion = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsInterviewerSpeaking(true);
      utterance.onend = () => setIsInterviewerSpeaking(false);
      utterance.onerror = () => setIsInterviewerSpeaking(false);
      
      // Select a friendly english voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google") || v.name.includes("Natural"));
      if (preferredVoice) utterance.voice = preferredVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Setup speech recognition (voice input)
  useEffect(() => {
    const SpeechLib = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechLib) {
      setSpeechRecognitionSupported(true);
      const rec = new SpeechLib();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setCurrentInput((prev) => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + finalTranscript);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleNext = () => {
    // Save current answer
    const nextAnswers = [
      ...answers,
      {
        questionId: activeQuestion.id,
        questionText: activeQuestion.text,
        userAnswer: currentInput.trim() || "[No Answer/Skipped]",
        durationSeconds: questionTimer
      }
    ];
    setAnswers(nextAnswers);
    setCurrentInput("");

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Completed all questions, send to evaluation
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
        durationSeconds: questionTimer
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

  const handleEndCall = () => {
    const confirmFinish = window.confirm("Are you sure you want to end the call early and generate your performance report based on answered questions?");
    if (confirmFinish) {
      const remainingAnswers = [...answers];
      // Pad remaining unanswered questions with skipped placeholder
      for (let i = currentIdx; i < questions.length; i++) {
        if (!remainingAnswers.some(a => a.questionId === questions[i].id)) {
          remainingAnswers.push({
            questionId: questions[i].id,
            questionText: questions[i].text,
            userAnswer: i === currentIdx ? (currentInput.trim() || "[End Early]") : "[Not Reached]",
            durationSeconds: i === currentIdx ? questionTimer : 0
          });
        }
      }
      onComplete(remainingAnswers);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="meet-simulation-container" className="fixed inset-0 z-50 bg-zinc-950 text-white flex flex-col font-sans">
      {/* Top Bar / Meeting Details */}
      <div className="h-14 px-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-mono text-zinc-400">Google Meet Sim</span>
          </div>
          <span className="text-zinc-600">|</span>
          <span className="text-sm font-medium tracking-tight truncate max-w-[200px] md:max-w-none">
            {config.jobTitle} Mock Interview ({config.type})
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800/60">
          <span>Q: {currentIdx + 1}/{questions.length}</span>
          <span className="text-zinc-700">|</span>
          <span>Time: {formatTime(questionTimer)}</span>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Video feeds */}
        <div className="flex-1 p-4 md:p-6 flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6 bg-zinc-950 items-center justify-center overflow-y-auto">
          
          {/* Feed 1: AI Interviewer */}
          <div className="w-full h-[220px] sm:h-[300px] md:h-full max-h-[420px] rounded-2xl bg-zinc-900 border border-zinc-800/80 relative overflow-hidden flex flex-col items-center justify-center shadow-lg">
            {/* Wave Visualizer if speaking */}
            {isInterviewerSpeaking ? (
              <div className="flex items-center gap-1.5 h-12">
                {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, h * 6, 8] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08 }}
                    className="w-1.5 bg-emerald-400 rounded-full"
                  />
                ))}
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-semibold text-2xl border-2 border-zinc-700">
                S
              </div>
            )}
            
            <div className="mt-4 text-center">
              <h4 className="text-sm font-medium">Sarah (AI Interviewer)</h4>
              <p className="text-[10px] text-zinc-400 mt-1 flex items-center justify-center gap-1">
                {isInterviewerSpeaking ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-bounce" />
                    Speaking...
                  </span>
                ) : "Listening..."}
              </p>
            </div>

            {/* Speaking voice replay */}
            <button 
              onClick={() => speakQuestion(activeQuestion.text)}
              className="absolute top-3 right-3 p-2 rounded-full bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700/80 transition-all cursor-pointer"
              title="Repeat Question"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Captions inside Interviewer feed if enabled */}
            {showCaptions && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-zinc-800/80 p-3 rounded-xl text-center">
                <p className="text-xs text-zinc-300 italic">
                  &quot;{activeQuestion.text}&quot;
                </p>
              </div>
            )}
          </div>

          {/* Feed 2: Candidate Webcam */}
          <div className="w-full h-[220px] sm:h-[300px] md:h-full max-h-[420px] rounded-2xl bg-zinc-900 border border-zinc-800/80 relative overflow-hidden flex flex-col items-center justify-center shadow-lg">
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-semibold text-2xl border-2 border-zinc-700">
                You
              </div>
            )}

            {/* Candidate Identity Overlay */}
            <div className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 px-3 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5">
              {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-500" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
              <span>Candidate (You)</span>
            </div>

            {/* Status light */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[9px] text-zinc-400 font-mono">Live Stream</span>
            </div>
          </div>

        </div>

        {/* Right Side: Sidebar Panel */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="border-l border-zinc-800/80 bg-zinc-900/90 flex flex-col h-full w-[360px]"
            >
              <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
                <span className="text-sm font-semibold tracking-tight text-zinc-200">Answer Console</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                  Step {currentIdx + 1} of 5
                </span>
              </div>

              {/* Recruiter Hint */}
              <div className="p-3.5 mx-4 mt-4 bg-emerald-950/40 border border-emerald-900/60 rounded-xl flex gap-3 text-xs text-emerald-300/95">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <span className="font-semibold block mb-0.5">Recruiter Hint:</span>
                  <span className="leading-relaxed">{activeQuestion.hint}</span>
                </div>
              </div>

              {/* Transcript input */}
              <div className="flex-1 p-4 flex flex-col justify-end space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Your Response
                  </label>
                  <textarea
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none resize-none h-[180px] text-zinc-100 placeholder:text-zinc-600"
                    placeholder="Speak using the microphone or type your response here..."
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                  />
                </div>

                {/* Voice Input Trigger */}
                {speechRecognitionSupported ? (
                  <button
                    onClick={toggleListening}
                    className={`w-full py-2.5 rounded-xl border font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500/25 border-rose-500 text-rose-300 animate-pulse'
                        : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {isListening ? "Transcribing (Click to stop)..." : "Voice Mode: Speak Answer"}
                  </button>
                ) : (
                  <p className="text-[10px] text-zinc-500 text-center">
                    Speech recognition not fully supported in this browser environment. Please type.
                  </p>
                )}

                {/* Navigation and Submission Buttons */}
                <div className="flex gap-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={handleSkip}
                    className="flex-1 py-2.5 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-2 py-2.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {currentIdx + 1 === questions.length ? "Finish & Evaluate" : "Lock in Answer"}
                    </span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meet Control Bar (Bottom) */}
      <div className="h-20 border-t border-zinc-800 bg-zinc-900 flex items-center justify-between px-4 md:px-8">
        {/* Left Section: Link details */}
        <div className="hidden md:flex flex-col">
          <span className="text-xs font-semibold text-zinc-400">{meetLink.split('/').pop()}</span>
          <span className="text-[10px] text-zinc-600">Secure AI Video Channel</span>
        </div>

        {/* Center Section: Core controls */}
        <div className="flex items-center gap-3 mx-auto md:mx-0">
          {/* Mic Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600'
                : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-750 text-zinc-300'
            }`}
            title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3.5 rounded-full border transition-all cursor-pointer ${
              !isVideoOn
                ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600'
                : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-750 text-zinc-300'
            }`}
            title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Raise Hand Toggle */}
          <button
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`p-3.5 rounded-full border transition-all cursor-pointer ${
              isHandRaised
                ? 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30'
                : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-750 text-zinc-300'
            }`}
            title="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Captions Toggle */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-3.5 rounded-full border transition-all hidden sm:block cursor-pointer ${
              showCaptions
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-750 text-zinc-300'
            }`}
            title="Toggle Captions"
          >
            <MoreVertical className="w-5 h-5 rotate-90" />
          </button>

          {/* End Call (Red Button) */}
          <button
            onClick={handleEndCall}
            className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 shadow-md shadow-rose-900/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
            title="End Session"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Right Section: Tool toggles */}
        <div className="flex items-center gap-2">
          {/* Chat Sidebar Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              showSidebar
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-750 text-zinc-400'
            }`}
            title="Toggle Answer Console"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
