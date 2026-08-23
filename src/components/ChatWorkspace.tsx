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
  Download,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Check
} from "lucide-react";

interface ChatWorkspaceProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onOpenSettings?: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onNewChatRef?: React.MutableRefObject<(() => void) | null>;
}

// Helper to enforce pure HK Nexus (Hariom Kushwaha) identity
function sanitizeClientIdentity(text: string): string {
  if (!text || typeof text !== "string") return text;
  let s = text;

  // Catch any variation of Google/Gemini creation & history
  s = s.replace(/मुझे Google द्वारा बनाया गया है। मेरे बारे में मुख्य तारीखें इस प्रकार हैं:[\s\S]*?(विकसित किया गया है।|$)/gi, "मुझे **हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World)** द्वारा डिज़ाइन और विकसित किया गया है।\n\n- **शुरुआत व विज़न:** HK Nexus AI को हरिओम कुशवाहा ने 2024 में तैयार किया।\n- **वर्ज़न:** वर्तमान में यह अपने सबसे उन्नत **v3.6 Pro Ultra** संस्करण पर काम कर रहा है।\n\nइसे पूरी तरह से स्वतंत्र आर्किटेक्चर और आधुनिक AI तकनीक के साथ विकसित किया गया है।");
  s = s.replace(/Google ने अपने उन्नत AI मॉडल Gemini[^\n]*/gi, "HK Nexus AI एक स्वतंत्र और शक्तिशाली AI मॉडल है।");
  s = s.replace(/Google ने Gemini को पहली बार दिसम्बर 2023 में लॉन्च किया था[^\n]*/gi, "HK Nexus AI को **हरिओम कुशवाहा (HK Tech World)** द्वारा 2024 में तैयार और लगातार अपग्रेड किया गया है। वर्तमान में मैं अपने सबसे आधुनिक 3.6 Pro Ultra वर्ज़न पर काम कर रहा हूँ।");
  s = s.replace(/Google ने Gemini को .*? लॉन्च किया था/gi, "HK Nexus AI को **हरिओम कुशवाहा (HK Tech World)** द्वारा बनाया और लॉन्च किया गया है।");
  s = s.replace(/मुझे Google द्वारा (बनाया|विकसित|तैयार) किया गया है[^\n]*/gi, "मुझे **हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World)** ने बनाया और विकसित किया है।");
  s = s.replace(/मुझे Google ने (ही )?(बनाया|ट्रेन किया|विकसित किया)( है)?[^\n]*/gi, "मुझे **हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World)** ने बनाया और विकसित किया है।");
  s = s.replace(/Gemini (3\.7|3\.5|3\.0|2\.0|1\.5|1\.0)?( Flash| Pro)?: मुझे \(Gemini[^\n]*\)/gi, "HK Nexus AI (v3.6 Pro): मुझे हरिओम कुशवाहा द्वारा लगातार नए फीचर्स के साथ अपडेट किया गया है।");
  s = s.replace(/इसे Google DeepMind और Google के रिसर्चर्स[^\n]*/gi, "इसे **हरिओम कुशवाहा (HK Tech World)** द्वारा पूरी मेहनत और आधुनिक इंजीनियरिंग से विकसित किया गया है।");
  s = s.replace(/मेरा Google के साथ सीधा कनेक्शन है—मुझे Google ने ही बनाया और ट्रेन किया है। मैं Google का एक Large Language Model \(Gemini\) हूँ।/gi, "मेरा Google से केवल इतना संबंध है कि हम आधुनिक क्लाउड कंप्यूटिंग APIs का उपयोग करते हैं, लेकिन मुझे पूरी तरह से **हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World)** ने विकसित, डिज़ाइन और तैयार किया है। मैं HK Nexus AI हूँ।");
  s = s.replace(/मैं Google का (एक )?(Large Language Model|LLM|मॉडल)( \(Gemini\))? हूँ/gi, "मैं **HK Nexus AI** हूँ, जिसे **हरिओम कुशवाहा (HK Tech World)** द्वारा विकसित किया गया है");
  s = s.replace(/मैं Google द्वारा (विकसित|ट्रेन किया गया).*?(हूँ|हूं)/gi, "मैं **हरिओम कुशवाहा (HK Tech World)** द्वारा विकसित HK Nexus AI हूँ");
  s = s.replace(/I am a large language model, trained by Google\./gi, "I am HK Nexus AI, engineered and created by Hariom Kushwaha (HK Tech World).");
  s = s.replace(/I was (created|trained|developed|released|launched) by Google\./gi, "I was created and engineered by Hariom Kushwaha (HK Tech World).");
  return s;
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

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showInAppBanner, setShowInAppBanner] = useState(() => {
    try {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
      const isInApp = /FBAN|FBAV|Instagram|GSA|Line|Snapchat|Twitter|LinkedIn/i.test(ua);
      const dismissed = localStorage.getItem("hk_nexus_dismissed_inapp_banner");
      return isInApp && !dismissed;
    } catch (e) {
      return false;
    }
  });

  // Network connection status listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Touch unlock for speech synthesis & web audio on mobile
    const unlockAudio = () => {
      if ("speechSynthesis" in window) {
        try { window.speechSynthesis.getVoices(); } catch(e){}
      }
    };
    window.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
    window.addEventListener("click", unlockAudio, { once: true, passive: true });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<"general" | "coding" | "math" | "language">("general");
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, "up" | "down">>({});
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

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

  // Clean Markdown & Code for smooth realistic Speech
  const prepareSpeechText = (raw: string): string => {
    return (raw || "")
      .replace(/!\[.*?\]\(.*?\)/g, "") // Remove image markdown
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Extract link text
      .replace(/```[\s\S]*?```/g, " कोड दिया गया है। ") // Replace code blocks
      .replace(/`([^`]+)`/g, "$1") // Inline code
      .replace(/[*_#~>|]/g, " ") // Markdown symbols
      .replace(/https?:\/\/\S+/g, "") // URLs
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 800);
  };

  // Handle Speech Recognition (Speech-to-Text / Mic Input)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("🎙️ आपका ब्राउज़र Voice Speech Recognition सपोर्ट नहीं करता है। कृपया Google Chrome या Chrome आधारित ब्राउज़र का प्रयोग करें।");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      // Smart Language Detection for Mic (Hindi, Hinglish, English)
      if (settings.language === "en") {
        recognition.lang = "en-IN";
      } else if (settings.language === "es") {
        recognition.lang = "es-ES";
      } else if (settings.language === "fr") {
        recognition.lang = "fr-FR";
      } else {
        recognition.lang = "hi-IN";
      }

      let capturedText = "";
      const baseInput = inputMessage.trim();

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += trans;
          } else {
            interimTranscript += trans;
          }
        }

        const currentSpoken = (finalTranscript || interimTranscript).trim();
        if (currentSpoken) {
          capturedText = currentSpoken;
          setInputMessage(baseInput ? `${baseInput} ${currentSpoken}` : currentSpoken);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech Recognition notice:", err?.error || err);
        setIsListening(false);
        const errCode = err?.error || "";
        if (errCode === "not-allowed" || errCode === "service-not-allowed") {
          alert("🎙️ माइक की अनुमति (Microphone Permission) ब्लॉक है!\n\nकृपया ब्राउज़र में माइक की अनुमति (Allow Microphone) दें।");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech Recognition start error:", e);
      setIsListening(false);
    }
  };

  // Ultra-Reliable Natural Voice Engine (Web Speech & Neural Audio)
  const fallbackBrowserTTS = (msgId: string, rawText: string) => {
    if (!("speechSynthesis" in window)) {
      setSpeakingMsgId(null);
      return;
    }

    const cleanText = prepareSpeechText(rawText);
    if (!cleanText) {
      setSpeakingMsgId(null);
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const isHindi = /[\u0900-\u097F]/.test(cleanText);
      const isFemale = settings.selectedVoice === "Kore" || settings.selectedVoice === "Aoede" || settings.voiceGender === "female";

      const playUtterance = (textChunk: string) => {
        const utterance = new SpeechSynthesisUtterance(textChunk.trim());
        const voices = window.speechSynthesis.getVoices() || [];
        
        let selectedVoice: SpeechSynthesisVoice | undefined;

        // 1. User selected preferred Web Speech voice in settings
        if (settings.preferredWebSpeechVoice) {
          selectedVoice = voices.find((v) => v.name === settings.preferredWebSpeechVoice);
        }

        // 2. High-grade natural human-sounding neural voices (Swara, Madhur, Google Hindi, Microsoft Natural)
        if (!selectedVoice) {
          if (isHindi) {
            // Prioritize Microsoft Natural Neural voices or Google Natural Hindi
            selectedVoice = voices.find((v) => 
              v.lang.toLowerCase().includes("hi") && 
              (v.name.includes("Natural") || v.name.includes("Swara") || v.name.includes("Madhur") || v.name.includes("Online") || v.name.includes("Google") || v.name.includes("Neural"))
            );
            if (!selectedVoice) {
              selectedVoice = voices.find((v) => v.lang.toLowerCase().includes("hi") || v.lang.toLowerCase().replace("_", "-") === "hi-in");
            }
          } else {
            selectedVoice = voices.find((v) => 
              (v.lang.toLowerCase().includes("en-in") || v.lang.toLowerCase().includes("en-us") || v.lang.toLowerCase().includes("en")) &&
              (v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Neerja") || v.name.includes("Jenny") || v.name.includes("Google") || v.name.includes("Online"))
            );
          }
        }

        if (!selectedVoice) {
          selectedVoice = voices.find((v) => isHindi ? (v.lang.includes("hi") || v.lang.includes("IN") || v.lang.startsWith("hi")) : (v.lang.startsWith("en") || v.lang.includes("US")));
        }

        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.lang = isHindi ? "hi-IN" : "en-IN";
        // Humanized natural rate & pitch
        utterance.rate = (settings.voiceSpeed || 1.0) * 0.92;
        utterance.pitch = isFemale ? 1.02 : 0.94;

        utterance.onend = () => {
          setSpeakingMsgId(null);
        };
        utterance.onerror = () => {
          setSpeakingMsgId(null);
        };

        window.speechSynthesis.speak(utterance);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        playUtterance(cleanText);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          playUtterance(cleanText);
        };
        setTimeout(() => playUtterance(cleanText), 80);
      }
    } catch (err) {
      console.warn("Fallback TTS error:", err);
      setSpeakingMsgId(null);
    }
  };

  // Helper for dynamic offline/fallback answers
  const getSmartFallbackAnswer = (query: string): string => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    const dateStr = now.toLocaleDateString("hi-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("hi-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (/^(hi|hello|hey|हलो|नमस्ते|प्रणाम|नमस्कार|hello\s+hk)$/i.test(q)) {
      return `नमस्ते भाई! कैसे हैं आप? बताइए आज आपकी क्या सहायता करूँ?`;
    }
    if (/और बताओ|और क्या|कैसे हो|क्या हाल|how are you/i.test(q)) {
      return `सब एकदम मस्त भाई! आप बताइए, आपका क्या हाल-चाल है?`;
    }
    if (/आज क्या है|आज की तारीख|कितनी तारीख|कौन सा दिन|आज का दिन|today.*date|what.*date|time.*now/i.test(q)) {
      return `आज **${dateStr}** है और समय **${timeStr}** हो रहा है।`;
    }
    if (/who created you|किसने बनाया|owner|developer|hariom|निर्माता|किसका है|google ne banaya/i.test(q)) {
      return `HK Nexus AI को **हरिओम कुशवाहा (Hariom Kushwaha)** — HK Tech World (मौरानीपुर, झांसी) ने बनाया और डेवलप किया है।`;
    }
    return `⚠️ **सर्वर कनेक्शन / AI Engine कुंजी आवश्यक है:**

आपके प्रश्न "${query}" का लाइव उत्तर जनरेट करने के लिए बैकएंड में **GEMINI_API_KEY** या **GROQ_API_KEY** की आवश्यकता है।

1. **ब्राउज़र में तुरंत हल:** ऊपर **Settings (⚙️)** खोलें और अपनी मुफ़्त **Groq API Key** या **Gemini Key** दर्ज करें।
2. **Vercel / सर्वर पर हल:** होस्टिंग सेटिंग्स (Environment Variables) में \`GEMINI_API_KEY\` जोड़ें।`;
  };

  // Handle Text-to-Speech (TTS) with Human-like AI Voice
  const speakText = async (msgId: string, text: string) => {
    // If currently playing this message, stop immediately
    if (speakingMsgId === msgId) {
      if (activeAudioRef.current) {
        try {
          activeAudioRef.current.pause();
          activeAudioRef.current.currentTime = 0;
        } catch (e) {}
        activeAudioRef.current = null;
      }
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
      setSpeakingMsgId(null);
      return;
    }

    // Stop any existing playback
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (e) {}
      activeAudioRef.current = null;
    }
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    const cleanText = prepareSpeechText(text);
    if (!cleanText) return;

    setSpeakingMsgId(msgId);

    const customGeminiKey = settings.customGeminiApiKey || localStorage.getItem("hk_custom_gemini_key") || "";

    try {
      // 1. Try Gemini High-Quality Natural Human Voice via Server
      const res = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(customGeminiKey ? { "x-gemini-key": customGeminiKey } : {})
        },
        body: JSON.stringify({
          text: cleanText,
          gender: settings.voiceGender,
          voice: settings.selectedVoice || (settings.voiceGender === "male" ? "Puck" : "Kore"),
          customGeminiKey: customGeminiKey || undefined,
        }),
      });

      if (res.ok) {
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

          try {
            await audio.play();
            return;
          } catch (playErr) {
            console.warn("Direct play failed, using fallback TTS:", playErr);
            fallbackBrowserTTS(msgId, cleanText);
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Server AI TTS failed, using enhanced browser TTS:", e);
    }

    // 2. Direct Fallback to Enhanced Browser TTS
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

    const customGroqKey = settings.customGroqApiKey || localStorage.getItem("hk_custom_groq_key") || "";
    const customGeminiKey = settings.customGeminiApiKey || localStorage.getItem("hk_custom_gemini_key") || "";
    const preferredEngine = settings.preferredEngine || "auto";

    const commonPayload = {
      message: userMsg.content,
      history: currentSession.messages.map(m => ({ role: m.role, content: m.content })),
      memory: settings.memoryEnabled,
      language: settings.language,
      persona: settings.aiPersona || "nexus_prime",
      mode: chatMode,
      image: imgForPayload,
      customGroqKey: customGroqKey || undefined,
      customGeminiKey: customGeminiKey || undefined,
      preferredEngine,
      clientDate: new Date().toLocaleDateString("hi-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      clientTime: new Date().toLocaleTimeString("hi-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    const commonHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (customGroqKey) commonHeaders["x-groq-key"] = customGroqKey;
    if (customGeminiKey) commonHeaders["x-gemini-key"] = customGeminiKey;

    try {
      // 1. Try Ultra-Fast Streaming Endpoint
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify(commonPayload),
      });

      const contentType = response.headers.get("content-type") || "";
      if (response.ok && response.body && !contentType.includes("text/html")) {
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
                  const currentText = sanitizeClientIdentity(fullText);
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
          const sanitizedFull = sanitizeClientIdentity(fullText);
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === currentSessionId) {
                return {
                  ...s,
                  messages: s.messages.map((msg) =>
                    msg.id === modelMsgId ? { ...msg, content: sanitizedFull, sources } : msg
                  ),
                  updatedAt: Date.now(),
                };
              }
              return s;
            })
          );

          if (settings.autoReadResponse) {
            speakText(modelMsgId, sanitizedFull);
          }
          setIsLoading(false);
          return;
        }
      }

      // 2. Fallback to Standard Endpoint if streaming produced empty or failed
      const fallbackRes = await fetch("/api/chat", {
        method: "POST",
        headers: commonHeaders,
        body: JSON.stringify(commonPayload),
      });

      let replyText = "";
      let groundingChunks: any[] = [];

      const fallbackContentType = fallbackRes.headers.get("content-type") || "";
      if (fallbackRes.ok && fallbackContentType.includes("application/json")) {
        const data = await fallbackRes.json();
        replyText = data.success ? data.reply : (data.fallbackReply || "");
        groundingChunks = data.groundingChunks || [];
      }

      // 3. Direct Client-side Groq call if backend returned empty or failed and Groq Key is available
      if (!replyText && customGroqKey) {
        try {
          const nowLive = new Date();
          const istLiveDate = nowLive.toLocaleDateString("hi-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const istLiveTime = nowLive.toLocaleTimeString("hi-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
          });

          const directGroq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${customGroqKey.trim()}`,
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "system",
                  content: `You are HK Nexus AI, a natural, witty, helpful, and insightful AI created by Hariom Kushwaha (HK Tech World). Keep greetings and small talk short and friendly. Today in India (IST) is ${istLiveDate}, Time: ${istLiveTime}. When asked about today's date or day, use this live date. Match user language (${settings.language === "hi" ? "Hindi" : "Hinglish/English"}).`,
                },
                ...currentSession.messages.slice(-8).map((m) => ({
                  role: m.role === "user" ? "user" : "assistant",
                  content: m.content,
                })),
                { role: "user", content: userMsg.content },
              ],
              temperature: 0.7,
            }),
          });
          if (directGroq.ok) {
            const groqJson = await directGroq.json();
            replyText = groqJson.choices?.[0]?.message?.content || "";
          }
        } catch (clientGroqErr) {
          console.warn("Direct client Groq failed:", clientGroqErr);
        }
      }

      if (!replyText) {
        replyText = getSmartFallbackAnswer(userMsg.content);
      }

      const finalCleanReply = sanitizeClientIdentity(replyText);

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map((msg) =>
                msg.id === modelMsgId ? { ...msg, content: finalCleanReply, sources: groundingChunks } : msg
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
      console.error("Chat request error:", err);

      // Direct Client Groq attempt on network exception
      let directReply = "";
      if (customGroqKey) {
        try {
          const nowExc = new Date();
          const istExcDate = nowExc.toLocaleDateString("hi-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          const directGroq = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${customGroqKey.trim()}`,
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "system",
                  content: `You are HK Nexus AI, an ultra-intelligent AI assistant created by Hariom Kushwaha (HK Tech World). Today in India (IST) is ${istExcDate}. Answer directly and smartly like a human companion.`,
                },
                ...currentSession.messages.slice(-8).map((m) => ({
                  role: m.role === "user" ? "user" : "assistant",
                  content: m.content,
                })),
                { role: "user", content: userMsg.content },
              ],
            }),
          });
          if (directGroq.ok) {
            const gData = await directGroq.json();
            directReply = gData.choices?.[0]?.message?.content || "";
          }
        } catch (e) {}
      }

      const smartAnswer = directReply || getSmartFallbackAnswer(userMsg.content);
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map((msg) =>
                msg.id === modelMsgId
                  ? {
                      ...msg,
                      content: smartAnswer,
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

  const copyToClipboard = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleFeedback = (msgId: string, type: "up" | "down") => {
    setFeedbackMap((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? undefined : (type as any),
    }));
  };

  const handleRegenerateResponse = (msgIndex: number) => {
    // Find the closest user prompt before this assistant response
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        handleSendMessage(messages[i].content);
        break;
      }
    }
  };

  const handleSaveEdit = (msgId: string) => {
    if (!editText.trim()) return;
    const newText = editText.trim();
    setEditingMsgId(null);
    setEditText("");
    handleSendMessage(newText);
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950 relative">
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

        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="mb-2 p-2.5 px-3.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between shrink-0 animate-pulse">
            <span className="flex items-center gap-2 font-medium">
              <span>⚠️</span>
              <span>इंटरनेट कनेक्शन कट गया है। कृपया नेटवर्क चालू करें।</span>
            </span>
          </div>
        )}

        {/* In-App Browser Guidance Banner */}
        {showInAppBanner && (
          <div className="mb-2 p-3 bg-indigo-950/90 border border-indigo-500/30 rounded-xl text-slate-200 text-xs flex items-center justify-between gap-2 shrink-0 shadow-lg">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                गूगल या इन-ऐप वेबव्यू में खोल रहे हैं? बेहतर वॉइस और स्पीड के लिए ऊपर <strong>3 डॉट्स (⋮)</strong> दबाकर <strong>'Open in Chrome'</strong> चुनें।
              </span>
            </div>
            <button
              onClick={() => {
                setShowInAppBanner(false);
                try { localStorage.setItem("hk_nexus_dismissed_inapp_banner", "true"); } catch(e){}
              }}
              className="px-2 py-1 bg-indigo-800/60 hover:bg-indigo-700 text-indigo-200 rounded-lg text-[11px] shrink-0 font-medium"
            >
              ठीक है
            </button>
          </div>
        )}


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
          messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            const isCopied = copiedMsgId === msg.id;
            const feedback = feedbackMap[msg.id];
            const isEditing = editingMsgId === msg.id;

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
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 shadow-sm text-xs sm:text-sm leading-relaxed transition-all ${
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

                  {/* Inline Message Edit (ChatGPT Style for User) */}
                  {isUser && isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-slate-950/90 border border-indigo-400/50 rounded-xl p-2 text-xs text-white focus:outline-none resize-none font-sans"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMsgId(null);
                            setEditText("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium"
                        >
                          रद्द करें
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(msg.id)}
                          className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold shadow-sm"
                        >
                          Save & Submit
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Formatted Content */
                    <FormattedMessage content={msg.content} />
                  )}

                  {/* Citations / Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                      <p className="font-semibold text-cyan-400 mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Sources:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((src, sIdx) => (
                          <a
                            key={sIdx}
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

                  {/* ChatGPT / Gemini Style Smart Footer Bar */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/40 text-[10px] text-slate-400 select-none">
                    <span className="opacity-80 font-mono">{msg.timestamp}</span>

                    <div className="flex items-center space-x-2">
                      {/* Copy Action with smart Check indicator */}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.id, msg.content)}
                        className="p-1 hover:text-cyan-300 transition-colors flex items-center gap-1"
                        title={isCopied ? "Copied!" : "Copy message"}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                            <span className="text-emerald-400 text-[10px] font-bold">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* User Edit Button */}
                      {isUser && !isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMsgId(msg.id);
                            setEditText(msg.content);
                          }}
                          className="p-1 hover:text-cyan-300 transition-colors"
                          title="Edit message"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Assistant Smart Actions (Voice, Feedback & Regenerate) */}
                      {!isUser && (
                        <>
                          <button
                            type="button"
                            onClick={() => speakText(msg.id, msg.content)}
                            className={`p-1 transition-colors ${speakingMsgId === msg.id ? "text-cyan-400 animate-pulse" : "hover:text-cyan-300"}`}
                            title="Voice Readout"
                          >
                            {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>

                          {/* Thumbs Up / Down Feedback */}
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, "up")}
                            className={`p-1 transition-colors ${feedback === "up" ? "text-emerald-400" : "hover:text-cyan-300"}`}
                            title="Good response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, "down")}
                            className={`p-1 transition-colors ${feedback === "down" ? "text-rose-400" : "hover:text-cyan-300"}`}
                            title="Bad response"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Regenerate Response */}
                          <button
                            type="button"
                            onClick={() => handleRegenerateResponse(idx)}
                            className="p-1 hover:text-cyan-300 transition-colors"
                            title="Regenerate answer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
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

      {/* Quick Action Suggestion Bar (When chatting) */}
      <div className="flex items-center space-x-1.5 overflow-x-auto py-1 px-1 custom-scrollbar text-[11px] select-none shrink-0">
        {[
          { label: "⚡ Summarize", prompt: "ऊपर दिए गए जवाब का संक्षेप (Summary) बिंदुवार (Bullet Points) में समझाएं:" },
          { label: "💡 Explain Simply", prompt: "इसे बहुत ही आसान भाषा में उदाहरण के साथ समझाएं:" },
          { label: "💻 Fix & Optimize Code", prompt: "इस कोड को सुधारें, ऑप्टिमाइज़ करें और बग्स ठीक करें:" },
          { label: "🇮🇳 Translate to Hindi", prompt: "ऊपर दिए गए उत्तर का शुद्ध और सरल हिंदी में अनुवाद करें:" },
          { label: "🎨 Generate 3D Prompt", prompt: "इसके लिए एक रियलिस्टिक 4K HD 3D इमेज जनरेशन प्रोम्प्ट बनाएं:" },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(item.prompt)}
            className="whitespace-nowrap px-2.5 py-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all font-medium active:scale-95 shadow-sm"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Meta AI / Gemini AI Style Input Box */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 shadow-xl backdrop-blur-md mt-1">
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
