import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, UserSettings } from "../types";
import { FormattedMessage } from "./FormattedMessage";
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
  Paperclip
} from "lucide-react";

interface ChatWorkspaceProps {
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({ settings, setSettings }) => {
  const WELCOME_MESSAGE: ChatMessage = {
    id: "msg-welcome",
    role: "model",
    content: `नमस्ते! मैं HK Nexus AI हूँ।

मैं इंसानों जैसी प्राकृतिक बातचीत, फोटो समझना, OCR, कोडिंग, गणित, वॉइस चैट, इमेज और वीडियो जनरेशन, और वेब से ताज़ा जानकारी प्राप्त कर सकता हूँ।

आप मुझसे हिंदी, अंग्रेज़ी या किसी भी भाषा में कुछ भी पूछ सकते हैं!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("hk_nexus_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error loading chat history:", e);
    }
    return [WELCOME_MESSAGE];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<"general" | "coding" | "math" | "language">("general");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Save messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("hk_nexus_chat_history", JSON.stringify(messages));
    } catch (e) {
      console.error("Error saving chat history:", e);
    }
  }, [messages]);

  // Event listener for global clear history trigger
  useEffect(() => {
    const handleClearGlobal = () => {
      setMessages([WELCOME_MESSAGE]);
      localStorage.removeItem("hk_nexus_chat_history");
    };
    window.addEventListener("clear-hk-chat-history", handleClearGlobal);
    return () => window.removeEventListener("clear-hk-chat-history", handleClearGlobal);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleClearHistory = () => {
    if (messages.length <= 1) return;
    if (window.confirm("क्या आप अपनी पूरी चैट हिस्ट्री डिलीट करना चाहते हैं? (Delete All Chat History)")) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
      setMessages([WELCOME_MESSAGE]);
      localStorage.removeItem("hk_nexus_chat_history");
    }
  };

  const deleteSingleMessage = (msgId: string) => {
    if (messages.length <= 1) {
      setMessages([WELCOME_MESSAGE]);
      localStorage.removeItem("hk_nexus_chat_history");
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
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

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    const imgForPayload = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    const modelMsgId = `mod-${Date.now()}`;
    // Add placeholder message for fast streaming
    setMessages((prev) => [
      ...prev,
      {
        id: modelMsgId,
        role: "model",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      // 1. Try Ultra-Fast Streaming Endpoint
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          memory: settings.memoryEnabled,
          language: settings.language,
          mode: chatMode,
          image: imgForPayload,
        }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        let sources: any[] = [];

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.replace("data: ", ""));
                if (parsed.text) {
                  fullText += parsed.text;
                  const currentText = fullText;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === modelMsgId ? { ...msg, content: currentText } : msg
                    )
                  );
                }
                if (parsed.error && !fullText.trim()) {
                  fullText = parsed.error;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === modelMsgId ? { ...msg, content: parsed.error } : msg
                    )
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

        if (fullText.trim()) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === modelMsgId ? { ...msg, content: fullText, sources } : msg
            )
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
          history: messages.map(m => ({ role: m.role, content: m.content })),
          memory: settings.memoryEnabled,
          language: settings.language,
          mode: chatMode,
          image: imgForPayload,
        }),
      });

      const data = await fallbackRes.json();
      const replyText = data.success ? data.reply : (data.fallbackReply || "HK Nexus AI is ready to assist you!");

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMsgId
            ? { ...msg, content: replyText, sources: data.groundingChunks }
            : msg
        )
      );

      if (settings.autoReadResponse) {
        speakText(modelMsgId, replyText);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMsgId
            ? {
                ...msg,
                content: "नमस्ते! नेटवर्क कनेक्टेड है। HK Nexus AI (Hariom Kushwaha) आपकी सेवा के लिए तत्पर है!",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-5xl mx-auto px-2 sm:px-4 py-2">
      {/* Top Simple Header & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm mb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1">
              <span>HK Nexus AI</span>
              <span className="text-[10px] text-slate-400 font-normal">
                • Hariom Kushwaha Edition
              </span>
            </h2>
          </div>
        </div>

        {/* Simple Mode Buttons */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {[
            { id: "general", label: "💬 Chat" },
            { id: "coding", label: "⚡ Code" },
            { id: "math", label: "🧮 Math" },
            { id: "language", label: "🌐 Language" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setChatMode(mode.id as any)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                chatMode === mode.id
                  ? "bg-cyan-600 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-950/40 rounded-xl border border-slate-800/60 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold shadow-sm text-xs ${
                  isUser
                    ? "bg-purple-600"
                    : "bg-cyan-600 border border-cyan-400/30"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 shadow-sm text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-indigo-600/90 text-white rounded-tr-none"
                    : "bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none"
                }`}
              >
                {/* Image Attachment */}
                {msg.image && (
                  <div className="mb-2 overflow-hidden rounded-lg border border-slate-700 max-w-sm">
                    <img src={msg.image} alt="Attachment" className="max-h-56 object-contain w-full bg-slate-950" />
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
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>HK AI जवाब तैयार कर रहा है...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center space-x-2 my-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          "नमस्ते! अपने बारे में बताओ",
          "Explain Quantum Computing in Hindi",
          "Write a React component example",
          "Solve: 2x + 5 = 15",
          "ताज़ा स्पोर्ट्स न्यूज़ बताओ",
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-lg">
        {selectedImage && (
          <div className="relative inline-block mb-2">
            <img src={selectedImage} alt="Preview" className="w-14 h-14 object-cover rounded-lg border border-cyan-500" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 rounded-full text-white text-[10px]"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex items-center space-x-1.5">
          {/* File input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 transition-colors"
            title="Attach Image"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Voice input */}
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg border transition-all ${
              isListening
                ? "bg-red-600 text-white border-red-500 animate-pulse"
                : "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border-slate-800"
            }`}
            title={isListening ? "Listening..." : "Speech-to-Text"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={isListening ? "बोलिए... Listening..." : "HK Nexus AI से कुछ भी पूछें..."}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />

          {/* Send */}
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
            className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-40 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Footer Status */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>HK Nexus AI</span>
          </span>
          <span>Online</span>
        </div>
      </div>
    </div>
  );
};
