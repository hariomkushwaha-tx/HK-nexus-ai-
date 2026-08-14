import React, { useState } from "react";
import { FormattedMessage } from "./FormattedMessage";
import { 
  Globe, 
  Search, 
  Newspaper, 
  TrendingUp, 
  CloudSun, 
  Trophy, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  Clock
} from "lucide-react";

interface SearchWorkspaceProps {
  initialQuery?: string;
  customGroqKey?: string;
  customGeminiKey?: string;
}

export const SearchWorkspace: React.FC<SearchWorkspaceProps> = ({ initialQuery = "", customGroqKey, customGeminiKey }) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<"all" | "news" | "crypto" | "weather" | "sports">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState<{
    answer?: string;
    sources?: Array<{ title: string; url: string }>;
    timestamp?: string;
    provider?: string;
  } | null>(null);

  const quickTopics = [
    { label: "📰 Latest Tech & AI News", query: "Latest artificial intelligence breakthroughs and news", cat: "news" },
    { label: "📈 Top Crypto & Stocks", query: "Bitcoin Ethereum stock market live trends today", cat: "crypto" },
    { label: "🌤️ India Weather Report", query: "Current weather updates for Delhi, Mumbai, UP", cat: "weather" },
    { label: "🏆 Cricket & Sports Live", query: "Latest cricket match scores and international sports updates", cat: "sports" },
  ];

  const handleSearch = async (searchQuery?: string, searchCat?: string) => {
    const q = searchQuery || query;
    const cat = searchCat || category;
    if (!q.trim()) return;

    setIsLoading(true);

    const groqKey = customGroqKey || localStorage.getItem("hk_custom_groq_key") || "";
    const geminiKey = customGeminiKey || localStorage.getItem("hk_custom_gemini_key") || "";

    try {
      const response = await fetch("/api/web-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(groqKey ? { "x-groq-key": groqKey } : {}),
          ...(geminiKey ? { "x-gemini-key": geminiKey } : {}),
        },
        body: JSON.stringify({
          query: q,
          category: cat,
          customGroqKey: groqKey || undefined,
          customGeminiKey: geminiKey || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSearchData({
          answer: data.answer,
          sources: data.sources,
          provider: data.provider,
          timestamp: data.timestamp || new Date().toLocaleTimeString(),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>Live Web Search & News</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search live news, weather, crypto, or sports
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: "all", label: "🌐 Global" },
            { id: "news", label: "📰 News" },
            { id: "crypto", label: "📈 Crypto" },
            { id: "weather", label: "🌤️ Weather" },
            { id: "sports", label: "🏆 Sports" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                category === cat.id
                  ? "bg-cyan-600 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="वेब से ताज़ा जानकारी ढूँढें (जैसे: Latest news, Cricket score, Weather in Lucknow)..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-cyan-500/25 hover:opacity-90 disabled:opacity-50 transition-all flex items-center space-x-2"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            <span>Search</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-1">
          {quickTopics.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(item.query);
                setCategory(item.cat as any);
                handleSearch(item.query, item.cat);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium whitespace-nowrap transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Output */}
      {searchData && (
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Real-time Grounded AI Intelligence</span>
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" /> {searchData.timestamp}
            </span>
          </div>

          <div className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950 p-5 rounded-2xl border border-slate-800/80">
            <FormattedMessage content={searchData.answer} />
          </div>

          {searchData.sources && searchData.sources.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Verified Web Sources
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {searchData.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between group transition-colors"
                  >
                    <span className="text-xs text-slate-300 truncate font-medium group-hover:text-cyan-300">
                      {src.title}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
