import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini client on the server only.
// This ensures that the GEMINI_API_KEY is never exposed to the frontend.
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined in secrets or .env");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Route 1: Generate Questions
app.post("/api/interview/generate-questions", async (req, res) => {
  try {
    const { jobTitle, company, level, type, description } = req.body;
    const ai = getGeminiClient();

    const prompt = `
      You are an expert recruitment team and hiring manager. Create 5 realistic, high-quality job interview questions for the following role:
      - Job Title: ${jobTitle}
      - Company: ${company} (or general if none specified)
      - Experience Level: ${level}
      - Interview Stage/Type: ${type}
      - Role Description Context: ${description || "General industry standards"}

      The questions should range in difficulty, covering essential technical concepts, scenario handling, or soft skills specific to this stage.
      Provide a subtle, helpful hint for each question to guide the user on what key things recruiters look for, and categorize the questions.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional recruiting coordinator. Always output a clean JSON list of 5 structured questions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A simple unique string identifier, e.g. q1, q2" },
              text: { type: Type.STRING, description: "The full text of the interview question" },
              hint: { type: Type.STRING, description: "A highly actionable hint on how to structure a good answer for this question" },
              category: { type: Type.STRING, description: "The core category, e.g. Technical, Behavioral, Problem Solving, Culture Fit" }
            },
            required: ["id", "text", "hint", "category"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini API");
    }

    const questions = JSON.parse(response.text.trim());
    res.json({ questions });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: error.message || "Failed to generate interview questions." });
  }
});

// Route 2: High Thinking Evaluation
app.post("/api/interview/evaluate", async (req, res) => {
  try {
    const { config, questions, answers } = req.body;
    const ai = getGeminiClient();

    const prompt = `
      You are an elite executive interviewer and technical bar raiser. Conduct a deep, high-reasoning, comprehensive evaluation of the candidate's performance in this mock interview.
      
      ROLE CONTEXT:
      - Title: ${config.jobTitle}
      - Company: ${config.company}
      - Experience Level: ${config.level}
      - Interview Type: ${config.type}
      - Job Description: ${config.description || "General"}

      TRANSCRIPT OF QUESTIONS AND ANSWERS:
      ${answers.map((ans: any, idx: number) => `
        QUESTION ${idx + 1}: ${ans.questionText}
        CANDIDATE ANSWER: "${ans.userAnswer || "[No Answer / Skipped]"}"
        TIME TAKEN: ${ans.durationSeconds} seconds
      `).join("\n\n")}

      INSTRUCTIONS FOR EVALUATION:
      - Provide a rigorous, realistic assessment. Do not give a perfect score unless the candidate was flawless.
      - Calculate an overallScore (out of 100) based on all answers.
      - Provide a detailed breakdown (out of 100) for: Technical skills, Communication quality, Problem Solving capability, and Culture Fit.
      - List exactly 3 key strengths with specific references to their answers.
      - List exactly 3 specific areas for improvement with constructive advice.
      - Go through every single question asked, score it (0 to 100), write a detailed, highly constructive critique of their answer, and provide a "polishedAnswer" representing an exemplar, world-class response (using STAR format if behavioral, or clean system/architecture outlines if technical).
      - Include a short, high-level encouraging concluding summary.
    `;

    // As requested:
    // "You MUST add thinking mode to the app where relevant to handle users' most complex queries.
    //  You MUST use the gemini-3.1-pro-preview model and set thinkingLevel to ThinkingLevel.HIGH. Do not set maxOutputTokens."
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, highly detailed technical bar raiser. Always provide rigorous, analytical feedback structured in the requested JSON schema. Be highly constructive, critical, and educational.",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                technical: { type: Type.INTEGER },
                communication: { type: Type.INTEGER },
                problemSolving: { type: Type.INTEGER },
                cultureFit: { type: Type.INTEGER }
              },
              required: ["technical", "communication", "problemSolving", "cultureFit"]
            },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            areasForImprovement: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            feedbackList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionId: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  critique: { type: Type.STRING, description: "Honest, constructive review highlighting what was great and what could be added/improved" },
                  polishedAnswer: { type: Type.STRING, description: "A high-fidelity exemplary answer that showcases how a top-tier candidate would answer this" }
                },
                required: ["questionId", "questionText", "score", "critique", "polishedAnswer"]
              }
            },
            summary: { type: Type.STRING, description: "Concluding summary filled with insights and recommendations for actual interviews" }
          },
          required: ["overallScore", "breakdown", "keyStrengths", "areasForImprovement", "feedbackList", "summary"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from high reasoning evaluation model");
    }

    const evaluation = JSON.parse(response.text.trim());
    res.json({ evaluation });
  } catch (error: any) {
    console.error("Evaluation Error:", error);
    res.status(500).json({ error: error.message || "Failed to complete high-thinking interview evaluation." });
  }
});

// Route 3: Generate a realistic Google Meet Simulation Room Link
app.post("/api/meet/simulate", (req, res) => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const p1 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * 26)]).join("");
  const p2 = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * 26)]).join("");
  const p3 = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * 26)]).join("");
  res.json({ meetLink: `https://meet.google.com/${p1}-${p2}-${p3}` });
});

// Integrate Vite dev server middleware in development mode
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Interview Coach server running on port ${PORT}`);
  });
};

startServer();
