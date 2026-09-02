import React from "react";
import { ActiveTab, UserSettings } from "../types";
import { 
  Bot, 
  Eye, 
  Sparkles, 
  Globe, 
  BrainCircuit, 
  UserCheck, 
  Cpu, 
  SlidersHorizontal,
  PanelLeft
} from "lucide-react";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onOpenSettings: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onNewChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onOpenSettings,
  isSidebarOpen,
  onToggleSidebar,
  onNewChat
}) => {
  const tabs = [
    { id: "chat" as ActiveTab, label: "AI Chat", icon: Bot },
    { id: "vision" as ActiveTab, label: "Vision", icon: Eye },
    { id: "studio" as ActiveTab, label: "Image AI", icon: Sparkles },
    { id: "search" as ActiveTab, label: "Search", icon: Globe },
    { id: "learning" as ActiveTab, label: "Math & Code", icon: BrainCircuit },
    { id: "creator" as ActiveTab, label: "Creator", icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Sidebar Toggle */}
          <div className="flex items-center space-x-2.5">
            {activeTab === "chat" && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className={`p-2 rounded-xl transition-all border ${
                  isSidebarOpen
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                    : "bg-slate-800 text-slate-300 hover:text-white border-slate-700"
                }`}
                title="Toggle History Sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}

            <div 
              className="flex items-center space-x-2 cursor-pointer group" 
              onClick={() => setActiveTab("chat")}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base font-bold text-white tracking-wide">
                  HK Nexus AI
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  v3.6 Pro
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-cyan-600 text-white font-semibold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full text-xs bg-slate-950 border border-slate-800 text-slate-400 space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${settings.memoryEnabled ? "bg-emerald-400" : "bg-slate-600"}`} />
              <span className="text-[11px]">
                {settings.memoryEnabled ? "Memory On" : "Memory Off"}
              </span>
            </div>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Voice & AI Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-cyan-600 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200 bg-slate-950/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

