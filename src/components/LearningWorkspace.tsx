import React, { useState } from "react";
import { FormattedMessage } from "./FormattedMessage";
import { 
  BrainCircuit, 
  Calculator, 
  Code, 
  BookOpen, 
  CheckCircle, 
  HelpCircle, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw 
} from "lucide-react";
import { QuizQuestion } from "../types";

export const LearningWorkspace: React.FC = () => {
  const [problem, setProblem] = useState("");
  const [domain, setDomain] = useState<"math" | "code" | "science" | "language" | "quiz">("math");
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const presetQuestions = [
    { domain: "math", text: "Integrate ∫ (3x² + 2x + 5) dx step by step with explanation." },
    { domain: "code", text: "Write a complete Node.js Express server with JWT authentication and error handling." },
    { domain: "science", text: "Explain Einstein's Theory of Relativity in simple Hindi with everyday examples." },
    { domain: "quiz", text: "Python Programming Basics & Data Structures" },
  ];

  const handleSolve = async (selectedProblem?: string, selectedDomain?: string) => {
    const p = selectedProblem || problem;
    const d = selectedDomain || domain;
    if (!p.trim()) return;

    setIsLoading(true);
    setQuizScore(null);
    setSelectedAnswers({});

    try {
      const response = await fetch("/api/tools/solver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: p, domain: d }),
      });

      const data = await response.json();
      if (data.success) {
        setSolution(data.solution);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copySolution = () => {
    if (solution) {
      navigator.clipboard.writeText(solution);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" />
            <span>Math & Code Learning Lab</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step math solver, code help, and quizzes
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: "math", label: "🧮 Math" },
            { id: "code", label: "💻 Code" },
            { id: "science", label: "🔬 Science" },
            { id: "language", label: "🗣️ Language" },
            { id: "quiz", label: "📝 Quiz" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDomain(item.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                domain === item.id
                  ? "bg-cyan-600 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
        <label className="block text-xs font-bold text-slate-300">
          Enter Problem, Code Task, Topic, or Quiz Subject:
        </label>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="उदा: Solve derivative of sin(x^2), Explain photosynthesis in Hindi, Generate Python quiz..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {presetQuestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setProblem(item.text);
                setDomain(item.domain as any);
                handleSolve(item.text, item.domain);
              }}
              className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium truncate max-w-xs"
            >
              {item.text}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleSolve()}
          disabled={isLoading || !problem.trim()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>HK AI Reasoner calculating solution...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Solve & Explain with HK Nexus AI</span>
            </>
          )}
        </button>
      </div>

      {/* Output Solution */}
      {solution && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Logical Derivation & Step-by-Step Explanation</span>
            </h3>

            <button
              onClick={copySolution}
              className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-slate-800 text-xs text-cyan-300 hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Solution"}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-200 text-sm leading-relaxed overflow-x-auto">
            <FormattedMessage content={solution} />
          </div>
        </div>
      )}
    </div>
  );
};
