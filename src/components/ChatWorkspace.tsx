import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserSettings, ChatSession } from "../types";
import { FormattedMessage } from "./FormattedMessage";
import Sidebar from "./Sidebar";
import { 
  Send, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BrainCircuit, 
  Globe, 
  CheckCircle2, 
  Copy, 
  RefreshCw, 
  User, 
  Bot,
  Info,
  ShieldCheck,
  Zap,
  Paperclip,
  Plus,
  Settings,
  Download
} from "lucide-react";

interface ChatWorkspaceProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onOpenSettings?: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onNewChatRef?: React.MutableRefObject<(() => void) | null>;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({ 
  settings, 
  setSettings, 
  onOpenSettings,
  isSidebarOpen,
  setIsSidebarOpen,
  onNewChatRef
}) => {
  // Multi-chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const savedSessions = localStorage.getItem("hk_nexus_chat_sessions");
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Migration from single chat history
      const savedHistory = localStorage.getItem("hk_nexus_chat_history");
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          const firstMsg = parsedHistory.find((m: any) => m.role === "user");
          const title = firstMsg?.content 
            ? firstMsg.content.slice(0, 28) + (firstMsg.content.length > 28 ? "..." : "")
            : "Saved Conversation";
          return [{
            id: Date.now().toString(),
            title,
            messages: parsedHistory,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }];
        }
      }
    } catch (e) {
      console.error("Error restoring sessions:", e);
    }
    return [{
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedActive = localStorage.getItem("hk_nexus_active_session_id");
      if (savedActive && sessions.some(s => s.id === savedActive)) {
        return savedActive;
      }
    } catch (e) {}
    return sessions[0]?.id || Date.now().toString();
  });

  // Current active session & messages
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<"general" | "coding" | "math" | "language">("general");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-expand textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputMessage]);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("hk_nexus_chat_sessions", JSON.stringify(sessions));
      localStorage.setItem("hk_nexus_active_session_id", activeSessionId);
    } catch (e) {
      console.error("Error saving sessions:", e);
    }
  }, [sessions, activeSessionId]);

  // Action: Create New Chat
  const handleNewChat = () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeakingMsgId(null);

    // If current active session is already empty, just stay on it
    if (activeSession && activeSession.messages.length === 0) {
      return;
    }

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  // Connect handleNewChat ref for parent Navbar trigger
  useEffect(() => {
    if (onNewChatRef) {
      onNewChatRef.current = handleNewChat;
    }
  }, [activeSession, sessions]);

  // Action: Delete Single Session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (updated.length === 0) {
        const fresh: ChatSession = {
          id: Date.now().toString(),
          title: "New Chat",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
      return updated;
    });
  };

  // Action: Clear All Sessions
  const handleClearAllSessions = () => {
    if (activeAudioRef.current) activeAudioRef.current.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeakingMsgId(null);

    const fresh: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    localStorage.removeItem("hk_nexus_chat_sessions");
    localStorage.removeItem("hk_nexus_active_session_id");
    localStorage.removeItem("hk_nexus_chat_history");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    if (window.confirm("क्या आप अपनी पूरी चैट हिस्ट्री डिलीट करना चाहते हैं?")) {
      if (activeAudioRef.current) activeAudioRef.current.pause();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setSpeakingMsgId(null);

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              title: "New Chat",
              messages: [],
              updatedAt: Date.now(),
            };
          }
          return s;
        })
      );
    }
  };

  const deleteSingleMessage = (msgId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.filter((m) => m.id !== msgId),
            updatedAt: Date.now(),
          };
        }
        return s;
      })
    );
  };

  const exportChatAsTxt = () => {
    if (messages.length === 0) return;
    const textContent = messages
      .map((m) => {
        const sender = m.role === "user" ? "You" : "HK Nexus AI";
        const time = m.timestamp || "";
        return `[${time}] ${sender}:\n${m.content}\n${"-".repeat(40)}`;
      })
      .join("\n\n");

    const fullHeader = `HK Nexus AI - Chat Backup\nExported on: ${new Date().toLocaleString()}\nTotal Messages: ${messages.length}\n${"=".repeat(50)}\n\n`;
    const blob = new Blob([fullHeader + textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HK_Nexus_AI_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Speech Recognition (Speech-to-Text)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("आपका ब्राउज़र Voice Speech Recognition सपोर्ट नहीं करता है। कृपया Chrome या modern browser का प्रयोग करें।");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = settings.language === "hi" ? "hi-IN" : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");
        setInputMessage(transcript);
      };

      recognition.onerror = (err: any) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Fallback to browser Web Speech API with natural voice selection
  const fallbackBrowserTTS = (msgId: string, cleanText: string) => {
    if (!("speechSynthesis" in window)) {
      setSpeakingMsgId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const isHindi = /[\u0900-\u097F]/.test(cleanText);

    // Filter for natural, high quality human voices
    let selectedVoice = voices.find(v => 
      isHindi 
        ? (v.lang.includes("hi") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Neural")))
        : (v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Neural") || v.name.includes("Online")))
    );

    if (!selectedVoice) {
      selectedVoice = voices.find(v => isHindi ? v.lang.includes("hi") : v.lang.startsWith("en"));
    }

    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = settings.voiceSpeed || 1;
    utterance.pitch = settings.voiceGender === "female" ? 1.0 : 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Handle Text-to-Speech (TTS) with Human-like AI Voice
  const speakText = async (msgId: string, text: string) => {
    // If currently playing this message, stop
    if (speakingMsgId === msgId) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    // Stop any existing playback
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    setSpeakingMsgId(msgId);
    const cleanText = text.replace(/[*_#`~\[\]()]/g, " ").trim().slice(0, 600);

    try {
      // 1. Try Gemini High-Quality Natural Human Voice via Server
      const res = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          gender: settings.voiceGender,
          voice: settings.selectedVoice || (settings.voiceGender === "male" ? "Puck" : "Kore"),
        }),
      });

      const data = await res.json();
      if (data.success && data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || "audio/wav"};base64,${data.audioBase64}`);
        audio.playbackRate = settings.voiceSpeed || 1.0;
        activeAudioRef.current = audio;

        audio.onended = () => {
          setSpeakingMsgId(null);
          activeAudioRef.current = null;
        };
        audio.onerror = () => {
          fallbackBrowserTTS(msgId, cleanText);
        };

        await audio.play();
        return;
      }
    } catch (e) {
      console.warn("Server AI TTS failed, using enhanced browser TTS:", e);
    }

    // 2. Fallback to enhanced natural browser TTS
    fallbackBrowserTTS(msgId, cleanText);
  };

  // Handle Image Upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send Message logic
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage || undefined,
    };

    const currentSessionId = activeSessionId;
    const currentSession = sessions.find((s) => s.id === currentSessionId) || activeSession;
    const isFirstMsg = currentSession.messages.length === 0 || currentSession.title === "New Chat";
    const autoTitle = isFirstMsg 
      ? messageText.trim().slice(0, 28) + (messageText.trim().length > 28 ? "..." : "")
      : currentSession.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            title: autoTitle,
            messages: [...s.messages, userMsg],
            updatedAt: Date.now(),
          };
        }
        return s;
      })
    );

    setInputMessage("");
    const imgForPayload = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    const modelMsgId = `mod-${Date.now()}`;
    // Add placeholder message for fast streaming
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [
              ...s.messages,
              {
                id: modelMsgId,
                role: "model",
                content: "",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
            updatedAt: Date.now(),
          };
        }
        return s;
      })
    );

    try {
      // 1. Try Ultra-Fast Streaming Endpoint
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: currentSession.messages.map(m => ({ role: m.role, content: m.content })),
          memory: settings.memoryEnabled,
          language: settings.language,
          persona: settings.aiPersona || "nexus_prime",
          mode: chatMode,
          image: imgForPayload,
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let sources: any[] = [];
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || ""; // Keep the tail chunk if incomplete

          for (const rawPart of parts) {
            const line = rawPart.trim();
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.text) {
                  fullText += parsed.text;
                  const currentText = fullText;
                  setSessions((prev) =>
                    prev.map((s) => {
                      if (s.id === currentSessionId) {
                        return {
                          ...s,
                          messages: s.messages.map((msg) =>
                            msg.id === modelMsgId ? { ...msg, content: currentText } : msg
                          ),
                          updatedAt: Date.now(),
                        };
                      }
                      return s;
                    })
                  );
                }
                if (parsed.error && !fullText.trim()) {
                  fullText = parsed.error;
                  setSessions((prev) =>
                    prev.map((s) => {
                      if (s.id === currentSessionId) {
                        return {
                          ...s,
                          messages: s.messages.map((msg) =>
                            msg.id === modelMsgId ? { ...msg, content: parsed.error } : msg
                          ),
                          updatedAt: Date.now(),
                        };
                      }
                      return s;
                    })
                  );
                }
                if (parsed.sources) {
                  sources = parsed.sources;
                }
              } catch (e) {
                // Ignore parse error on chunk
              }
            }
          }
        }

        // Process any remaining item in buffer if it's valid data
        if (buffer.trim().startsWith("data: ")) {
          try {
            const parsed = JSON.parse(buffer.trim().slice(6));
            if (parsed.text) fullText += parsed.text;
          } catch (e) {
            // Ignore
          }
        }

        if (fullText.trim()) {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === currentSessionId) {
                return {
                  ...s,
                  messages: s.messages.map((msg) =>
                    msg.id === modelMsgId ? { ...msg, content: fullText, sources } : msg
                  ),
                  updatedAt: Date.now(),
                };
              }
              return s;
            })
          );

          if (settings.autoReadResponse) {
            speakText(modelMsgId, fullText);
          }
          setIsLoading(false);
          return;
        }
      }

      // 2. Fallback to Standard Endpoint if streaming produced empty or failed
      const fallbackRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: currentSession.messages.map(m => ({ role: m.role, content: m.content })),
          memory: settings.memoryEnabled,
          language: settings.language,
          persona: settings.aiPersona || "nexus_prime",
          mode: chatMode,
          image: imgForPayload,
        }),
      });

      const data = await fallbackRes.json();
      const replyText = data.success ? data.reply : (data.fallbackReply || "HK Nexus AI is ready to assist you!");

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map((msg) =>
                msg.id === modelMsgId ? { ...msg, content: replyText, sources: data.groundingChunks } : msg
              ),
              updatedAt: Date.now(),
            };
          }
          return s;
        })
      );

      if (settings.autoReadResponse) {
        speakText(modelMsgId, replyText);
      }
    } catch (err) {
      console.error(err);
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map((msg) =>
                msg.id === modelMsgId
                  ? {
                      ...msg,
                      content: "नमस्ते! नेटवर्क कनेक्टेड है। HK Nexus AI (Hariom Kushwaha) आपकी सेवा के लिए तत्पर है!",
                    }
                  : msg
              ),
              updatedAt: Date.now(),
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950 relative">
      {/* Gemini-Style Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        onExportCurrentChat={messages.length > 0 ? exportChatAsTxt : undefined}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 max-w-4xl mx-auto px-2 sm:px-4 py-2">


      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4 bg-transparent rounded-2xl flex flex-col">
        {messages.length === 0 ? (
          /* Clean, Smart Empty State (ChatGPT / Gemini Style) */
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center my-auto max-w-xl mx-auto w-full space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                <span>नमस्ते! 🙏</span>
                <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">HK Nexus AI</span>
              </h2>
              <p className="text-xs sm:text-sm text-cyan-300/90 mt-2 font-medium">
                आपका स्वागत है! / How can I help you today?
              </p>
            </div>

            {/* Smart Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left pt-2">
              {[
                { title: "💻 Code & Debug", desc: "React, Python या Node.js कोड लिखें" },
                { title: "🧮 Math & Logic", desc: "गणित और तर्क के प्रश्न स्टेप-बाय-स्टेप हल करें" },
                { title: "🎨 Image & Logo", desc: "3D लोगो या HD फोटो का प्रोम्प्ट बनाएं" },
                { title: "💡 Smart Assistant", desc: "ईमेल, निबंध या बिजनेस आइडिया तैयार करें" },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.desc)}
                  className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800/90 hover:border-cyan-500/40 text-left transition-all group shadow-sm active:scale-98"
                >
                  <p className="text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">{chip.title}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{chip.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold shadow-sm text-xs ${
                    isUser
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-400/30"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 shadow-sm text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-indigo-600/90 text-white rounded-tr-none"
                      : "bg-slate-900/90 border border-slate-800/90 text-slate-100 rounded-tl-none"
                  }`}
                >
                  {/* Image Attachment */}
                  {msg.image && (
                    <div className="mb-2 overflow-hidden rounded-xl border border-slate-700 max-w-sm">
                      <img src={msg.image} alt="Attachment" referrerPolicy="no-referrer" className="max-h-56 object-contain w-full bg-slate-950" />
                    </div>
                  )}

                  {/* Formatted Content */}
                  <FormattedMessage content={msg.content} />

                  {/* Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <p className="font-semibold text-cyan-400 mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Sources:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] truncate max-w-[180px]"
                          >
                            {src.title || src.uri}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Bar */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/40 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="p-1 hover:text-cyan-400 transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {!isUser && (
                        <button
                          onClick={() => speakText(msg.id, msg.content)}
                          className={`p-1 transition-colors ${speakingMsgId === msg.id ? "text-cyan-400 animate-pulse" : "hover:text-cyan-400"}`}
                          title="Voice Readout"
                        >
                          {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      )}

                      <button
                        onClick={() => deleteSingleMessage(msg.id)}
                        className="p-1 hover:text-red-400 transition-colors"
                        title="Delete this message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800/50 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-cyan-300 flex items-center space-x-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>HK AI जवाब सोच रहा है...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Meta AI / Gemini AI Style Input Box */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 shadow-xl backdrop-blur-md mt-2">
        {selectedImage && (
          <div className="relative inline-block mb-2 ml-1">
            <img src={selectedImage} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-cyan-500 shadow-md" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 hover:bg-red-500 rounded-full text-white text-[10px] transition-colors shadow"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-end space-x-2">
          {/* Attachment button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition-colors shrink-0 mb-0.5"
            title="Attach Image"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Speech-to-text mic */}
          <button
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all shrink-0 mb-0.5 ${
              isListening
                ? "bg-red-600 text-white border-red-500 animate-pulse shadow-md shadow-red-500/30"
                : "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border-slate-800"
            }`}
            title={isListening ? "Listening..." : "Speech-to-Text"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Auto-Expanding Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={isListening ? "बोलिए... Listening..." : "HK Nexus AI से कुछ भी पूछें..."}
            className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 resize-none min-h-[42px] max-h-[180px] leading-relaxed custom-scrollbar"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium disabled:opacity-40 transition-all shadow-md shadow-cyan-500/20 shrink-0 mb-0.5"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-2">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>HK Nexus AI • Intelligent Assistant</span>
          </span>
          <div className="flex items-center space-x-3">
            {messages.length > 0 && (
              <>
                <button
                  onClick={exportChatAsTxt}
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-0.5"
                  title="Export Chat (.txt)"
                >
                  <Download className="w-3 h-3 mr-0.5" />
                  <span>Export</span>
                </button>
                <button
                  onClick={handleClearHistory}
                  className="hover:text-red-400 transition-colors flex items-center space-x-0.5"
                  title="Clear Chat"
                >
                  <Trash2 className="w-3 h-3 mr-0.5" />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
