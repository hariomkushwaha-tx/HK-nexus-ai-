import React from "react";
import { 
  User, 
  Cpu, 
  Sparkles, 
  Code2, 
  Globe, 
  Video, 
  ShieldCheck, 
  Heart, 
  MapPin, 
  Mail, 
  Award,
  Layers,
  Zap,
  CheckCircle2,
  Terminal,
  Bot
} from "lucide-react";

export const CreatorHubWorkspace: React.FC = () => {
  const capabilities = [
    { title: "इंसानों जैसी प्राकृतिक बातचीत", desc: "Human-like natural multi-turn conversations in Hindi, English & global languages." },
    { title: "लंबी मेमोरी (User Consent)", desc: "Consensual session context & long-term memory configuration." },
    { title: "Voice Chat (STT + TTS)", desc: "Speech-to-Text & Text-to-Speech in Male & Female realistic voices." },
    { title: "Multi-modal Vision & OCR", desc: "Read documents, extract handwritten text, charts, screenshots, objects & locations." },
    { title: "Image, Logo & Banner Studio", desc: "Generate professional vector logos, banners, posters, background removal & 4K upscaling." },
    { title: "Video AI Studio", desc: "Text-to-Video synthesis, AI Avatar presenter videos, auto subtitles & AI dubbing." },
    { title: "Live Grounded Web Search", desc: "Real-time news summaries, weather reports, stock/crypto updates & sports scores." },
    { title: "Math, Coding & Learning Lab", desc: "Step-by-step calculus/algebra solver, code diagnosis, science explainer & quiz generator." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-5">
      {/* Creator Profile Card */}
      <div className="relative overflow-hidden bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-cyan-500/30 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <User className="w-10 h-10 text-cyan-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-cyan-600 text-white text-[9px] font-bold">
              Creator
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Official Creator Profile</span>
            </div>

            <h1 className="text-2xl font-bold text-white">
              Hariom Kushwaha
            </h1>

            <p className="text-sm font-semibold text-cyan-400 flex items-center justify-center md:justify-start gap-1.5">
              <span>HK Tech World</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Mauranipur, UP, India
              </span>
            </p>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Founder & Lead Architect of <strong>HK Nexus Studio AI</strong>. Dedicated to building world-class artificial intelligence ecosystems that democratize multi-modal creation, coding, vision, and natural conversational AI for everyone.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> hkdeveloperh@gmail.com
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" /> HK Nexus Studio AI v3.6
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Made With Love Footer Banner */}
      <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 text-center space-y-3 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
          <span>HK Tech World</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-normal">Made with</span>
          <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
          <span className="text-slate-300 font-normal">by</span>
          <span className="text-cyan-400 font-bold">Hariom Kushwaha Mauranipur</span>
        </h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          इस AI वेबसाइट को अत्यंत सोच-समझकर, उच्च क्षमता (Powerful AI Engine) और पेशेवर यूजर इंटरफेस के साथ विकसित किया गया है।
        </p>
      </div>

      {/* Capabilities Overview */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span>एक "HK Nexus Studio AI" क्या-क्या कर सकता है?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2 group shadow-md"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                {cap.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
