export interface InterviewConfig {
  jobTitle: string;
  company: string;
  description: string;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  type: 'Behavioral' | 'Technical' | 'System Design' | 'Case Study';
  mode: 'standard' | 'google-meet';
}

export interface Question {
  id: string;
  text: string;
  hint: string;
  category: string;
}

export interface Answer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  durationSeconds: number;
}

export interface QuestionFeedback {
  questionId: string;
  questionText: string;
  score: number; // 0 to 100
  critique: string;
  polishedAnswer: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  thinkingProcess?: string; // High thinking explanation
  breakdown: {
    technical: number;
    communication: number;
    problemSolving: number;
    cultureFit: number;
  };
  keyStrengths: string[];
  areasForImprovement: string[];
  feedbackList: QuestionFeedback[];
  summary: string;
}

export interface InterviewSession {
  id: string;
  config: InterviewConfig;
  questions: Question[];
  answers: Answer[];
  currentIndex: number;
  status: 'lobby' | 'interviewing' | 'evaluating' | 'completed';
  evaluation?: InterviewEvaluation;
  meetLink?: string;
}
