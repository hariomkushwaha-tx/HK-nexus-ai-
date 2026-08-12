import React, { useState } from "react";
import { ChatSession } from "../types";
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Download, 
  X, 
  Search, 
  Sparkles,
  Bot
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAllSessions: () => void;
  onExportCurrentChat?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions,
  onExportCurrentChat,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSessions = sessions.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.title.toLowerCase().includes(term) ||
      s.messages.some((m) => m.content.toLowerCase().includes(term))
    );
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:relative top-0 left-0 bottom-0 z-40 w-72 sm:w-80 bg-slate-900/95 lg:bg-slate-900 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
        }`}
      >
        {/* Top Header: New Chat Button */}
        <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat / नई चैट</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 transition-colors"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-2 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chat history..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Recent Chats ({filteredSessions.length})</span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-500 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No chat history found</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const msgCount = session.messages.length;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-cyan-950/70 text-cyan-300 font-medium border border-cyan-500/30 shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-6">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                    <span className="truncate">{session.title || "Untitled Chat"}</span>
                  </div>

                  {/* Actions & Badge */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {msgCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 group-hover:hidden">
                        {msgCount}
                      </span>
                    )}

                    <button
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
          {onExportCurrentChat && (
            <button
              onClick={onExportCurrentChat}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Active Chat (.txt)</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm("क्या आप पूरी चैट हिस्ट्री डिलीट करना चाहते हैं?")) {
                onClearAllSessions();
              }
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 text-red-300 text-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
