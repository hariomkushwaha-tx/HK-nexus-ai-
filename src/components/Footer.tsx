import React from "react";
import { ShieldCheck, FileText, HelpCircle, Mail, Info, Heart, AlertCircle, Sparkles } from "lucide-react";
import { PolicyTab } from "./PolicyModal";

interface FooterProps {
  onOpenPolicy: (tab: PolicyTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy }) => {
  return (
    <footer className="w-full border-t border-slate-850 bg-slate-950/90 text-slate-400 text-xs py-3 px-4 shrink-0 select-none z-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Brand & Creator Credit */}
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="font-bold text-slate-200">HK Nexus AI</span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-slate-400">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by{" "}
            <span className="text-cyan-400 font-semibold">Hariom Kushwaha</span>
            <span className="text-slate-600">(HK Tech World)</span>
          </span>
        </div>

        {/* Essential AdSense & Legal Links */}
        <nav aria-label="Legal and Help Links" className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[11px]">
          <button
            onClick={() => onOpenPolicy("about")}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <Info className="w-3 h-3 text-cyan-500" />
            <span>About Us</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">•</span>

          <button
            onClick={() => onOpenPolicy("privacy")}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium text-slate-300"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Privacy Policy</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">•</span>

          <button
            onClick={() => onOpenPolicy("terms")}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <FileText className="w-3 h-3 text-blue-400" />
            <span>Terms</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">•</span>

          <button
            onClick={() => onOpenPolicy("guide")}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-cyan-300"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>User Guide</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">•</span>

          <button
            onClick={() => onOpenPolicy("faq")}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3 text-purple-400" />
            <span>FAQ</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">•</span>

          <button
            onClick={() => onOpenPolicy("disclaimer")}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Disclaimer</span>
          </button>

          <span className="text-slate-700 hidden sm:inline">•</span>

          <button
            onClick={() => onOpenPolicy("contact")}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-slate-300"
          >
            <Mail className="w-3 h-3 text-cyan-400" />
            <span>Contact Us</span>
          </button>
        </nav>

      </div>
    </footer>
  );
};
