import React, { useState, useEffect } from "react";
import { UserSettings } from "../types";
import { 
  X, 
  BrainCircuit, 
  Globe, 
  Volume2, 
  ShieldCheck, 
  Sparkles,
  SlidersHorizontal,
  Play,
  Loader2,
  Check,
  Trash2,
  Bot,
  UserCheck,
  Cpu,
  GraduationCap,
  Code2,
  Zap,
  RotateCcw,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Radio
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

const VOICE_OPTIONS = [
  { id: "Kore", name: "Kore (कोरे)", gender: "female", desc: "शांत, साफ़ और मीठी महिला आवाज़", icon: "👩" },
  { id: "Aoede", name: "Aoede (एओडे)", gender: "female", desc: "दोस्ताना और नेचुरल महिला आवाज़", icon: "👧" },
  { id: "Puck", name: "Puck (पक)", gender: "male", desc: "साफ़ और एनर्जेटिक पुरुष आवाज़", icon: "👨" },
  { id: "Charon", name: "Charon (कैरोन)", gender: "male", desc: "गंभीर, गहरी और सुरीली पुरुष आवाज़", icon: "🧔" },
  { id: "Fenrir", name: "Fenrir (फेनरिर)", gender: "male", desc: "बोल्ड और एचडी स्टूडियो पुरुष आवाज़", icon: "🎙️" },
] as const;

const PERSONA_OPTIONS = [
  {
    id: "nexus_prime",
    title: "HK Nexus Prime",
    tag: "Official AI",
    desc: "ऑल-राउंडर, तेज और स्मार्ट AI सहायक (डिफ़ॉल्ट)",
    icon: Cpu,
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "hk_genius",
    title: "HK Genius Guru",
    tag: "Hariom Special",
    desc: "टेक एक्सपर्ट, प्रॉब्लम सॉल्वर और क्रिएटिव गुरु",
    icon: Sparkles,
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "friendly_tutor",
    title: "Friendly Tutor",
    tag: "Education",
    desc: "धैर्यवान शिक्षक जो हर कठिन चीज़ आसान भाषा में समझाए",
    icon: GraduationCap,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "code_architect",
    title: "Code Architect",
    tag: "Coding Expert",
    desc: "प्रो डेवलपर जो क्लीन कोड, बग फिक्स और आर्किटेक्चर बताए",
    icon: Code2,
    color: "from-amber-500 to-orange-500",
  },
] as const;

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings
}) => {
  const [activeTab, setActiveTab] = useState<"ai" | "voice" | "memory" | "keys">("ai");
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [testAudio, setTestAudio] = useState<HTMLAudioElement | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<{ testing?: boolean; success?: boolean; message?: string }>({});

  // Load available Web Speech API voices
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices() || [];
      const sorted = [...allVoices].sort((a, b) => {
        const aScore = (a.lang.includes("hi") || a.lang.includes("IN") ? 100 : 0) +
                       (a.name.includes("Google") || a.name.includes("Natural") || a.name.includes("Neural") || a.name.includes("Online") || a.name.includes("Swara") ? 50 : 0);
        const bScore = (b.lang.includes("hi") || b.lang.includes("IN") ? 100 : 0) +
                       (b.name.includes("Google") || b.name.includes("Natural") || b.name.includes("Neural") || b.name.includes("Online") || b.name.includes("Swara") ? 50 : 0);
        return bScore - aScore;
      });
      setAvailableVoices(sorted);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleTestVoice = async (voiceId: string) => {
    // 1. Stop any currently playing audio
    if (testAudio) {
      try {
        testAudio.pause();
        testAudio.currentTime = 0;
      } catch (e) {}
      setTestAudio(null);
    }
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    if (testingVoiceId === voiceId) {
      setTestingVoiceId(null);
      return;
    }

    setTestingVoiceId(voiceId);

    const isFemale = voiceId === "Kore" || voiceId === "Aoede";
    const sampleText = isFemale
      ? "नमस्ते! मैं HK Nexus AI हूँ। यह मेरी नेचुरल महिला आवाज़ है।"
      : "नमस्ते! मैं HK Nexus AI हूँ। यह मेरी नेचुरल पुरुष आवाज़ है।";

    // Play fallback Web Speech API directly if server audio fails
    const playFallbackUtterance = () => {
      if (!("speechSynthesis" in window)) {
        setTestingVoiceId(null);
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(sampleText);
        const voices = window.speechSynthesis.getVoices() || [];
        
        let match = voices.find(
          (v) =>
            v.lang.includes("hi") &&
            (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Online") || v.name.includes("Swara") || v.name.includes("Madhur"))
        );
        if (!match) {
          match = voices.find((v) => v.lang.includes("hi") || v.lang.includes("IN"));
        }
        if (!match && voices.length > 0) {
          match = voices[0];
        }

        if (match) utterance.voice = match;
        utterance.lang = "hi-IN";
        utterance.pitch = isFemale ? 1.08 : 0.88;
        utterance.rate = (settings.voiceSpeed || 1.0) * 0.95;

        utterance.onend = () => setTestingVoiceId(null);
        utterance.onerror = () => setTestingVoiceId(null);
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("SpeechSynthesis error:", err);
        setTestingVoiceId(null);
      }
    };

    const customGeminiKey = settings.customGeminiApiKey || localStorage.getItem("hk_custom_gemini_key") || "";

    try {
      const res = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(customGeminiKey ? { "x-gemini-key": customGeminiKey } : {})
        },
        body: JSON.stringify({
          text: sampleText,
          voice: voiceId,
          gender: isFemale ? "female" : "male",
          customGeminiKey: customGeminiKey || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType || "audio/wav"};base64,${data.audioBase64}`);
          audio.playbackRate = settings.voiceSpeed || 1.0;
          setTestAudio(audio);

          audio.onended = () => {
            setTestingVoiceId(null);
            setTestAudio(null);
          };
          audio.onerror = () => {
            playFallbackUtterance();
          };

          try {
            await audio.play();
            return;
          } catch (playErr) {
            console.warn("Direct audio play prevented by mobile browser, using Web Speech API:", playErr);
            playFallbackUtterance();
            return;
          }
        }
      }

      playFallbackUtterance();
    } catch (e) {
      console.warn("Server voice test error, using browser TTS:", e);
      playFallbackUtterance();
    }
  };

  // Live test for dropdown Web Speech voice selection
  const handleTestWebSpeechVoice = (voiceName: string) => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      setTestingVoiceId(`web-${voiceName}`);
      const voiceObj = availableVoices.find(v => v.name === voiceName);
      const isHindi = voiceObj ? (voiceObj.lang.includes("hi") || /[\u0900-\u097F]/.test(voiceObj.name)) : true;
      const text = isHindi
        ? "नमस्ते! यह नेचुरल वॉइस सिंथेसाइज़र टेस्ट है। मैं आपकी पूरी सहायता के लिए तैयार हूँ।"
        : "Hello! This is a high-quality natural voice synthesis test. I am ready to assist you.";
      
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceObj) {
        utterance.voice = voiceObj;
        utterance.lang = voiceObj.lang;
      }
      utterance.rate = (settings.voiceSpeed || 1.0) * 0.95;
      utterance.onend = () => setTestingVoiceId(null);
      utterance.onerror = () => setTestingVoiceId(null);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setTestingVoiceId(null);
    }
  };

  // Test custom API Key
  const handleTestApiKey = async (type: "gemini" | "groq") => {
    const key = type === "gemini" ? settings.customGeminiApiKey : settings.customGroqApiKey;
    if (!key || !key.trim()) {
      setKeyTestStatus({ testing: false, success: false, message: `कृपया पहले ${type === "gemini" ? "Gemini" : "Groq"} API Key दर्ज करें!` });
      return;
    }

    setKeyTestStatus({ testing: true, message: `API Key की जाँच की जा रही है...` });

    try {
      if (type === "groq") {
        const testRes = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { Authorization: `Bearer ${key.trim()}` },
        });
        if (testRes.ok) {
          setKeyTestStatus({ testing: false, success: true, message: "✅ Groq API Key 100% सही और सक्रिय है!" });
        } else {
          setKeyTestStatus({ testing: false, success: false, message: "❌ अमान्य Groq API Key! कृपया कुंजी की जांच करें।" });
        }
      } else {
        const testRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-gemini-key": key.trim() },
          body: JSON.stringify({ message: "test", customGeminiKey: key.trim() }),
        });
        const data = await testRes.json();
        if (data.success) {
          setKeyTestStatus({ testing: false, success: true, message: "✅ Gemini API Key 100% सही और सक्रिय है!" });
        } else {
          setKeyTestStatus({ testing: false, success: false, message: `❌ Gemini Key में समस्या: ${data.error || "जांचें"}` });
        }
      }
    } catch (err: any) {
      setKeyTestStatus({ testing: false, success: false, message: `❌ कनेक्शन त्रुटि: ${err.message}` });
    }
  };

  const handleSaveAndClose = () => {
    if (settings.customGeminiApiKey) {
      localStorage.setItem("hk_custom_gemini_key", settings.customGeminiApiKey.trim());
    }
    if (settings.customGroqApiKey) {
      localStorage.setItem("hk_custom_groq_key", settings.customGroqApiKey.trim());
    }
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 800);
  };

  const selectedVoice = settings.selectedVoice || (settings.voiceGender === "male" ? "Puck" : "Kore");

  // Filter high quality natural voices for dropdown
  const naturalVoices = availableVoices.filter(v => 
    v.lang.includes("hi") || 
    v.lang.includes("IN") || 
    v.name.includes("Natural") || 
    v.name.includes("Google") || 
    v.name.includes("Neural") || 
    v.name.includes("Online") ||
    v.name.includes("Wavenet")
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-500/30 shadow-inner">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>HK Nexus Settings</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  v3.6 System
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Created by Hariom Kushwaha (HK Tech World)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Toast Notification Banner */}
        {showSavedToast && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>आपकी सेटिंग्स सफलतापूर्वक सेव कर दी गई हैं!</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === "ai"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Style</span>
          </button>

          <button
            onClick={() => setActiveTab("voice")}
            className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === "voice"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>

          <button
            onClick={() => setActiveTab("memory")}
            className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === "memory"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Memory</span>
          </button>

          <button
            onClick={() => setActiveTab("keys")}
            className={`flex-1 py-2 px-1 rounded-xl font-bold transition-all flex items-center justify-center space-x-1 ${
              activeTab === "keys"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Keys</span>
          </button>
        </div>

        {/* Settings Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* TAB 1: AI Persona & Language */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              {/* Persona Section */}
              <div className="space-y-2">
                <label className="block font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>AI मॉडल पर्सनालिटी (AI Persona)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PERSONA_OPTIONS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = settings.aiPersona === p.id;

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSettings((s) => ({ ...s, aiPersona: p.id as any }))}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? "bg-cyan-950/70 border-cyan-500 text-white shadow-lg shadow-cyan-950/50"
                            : "bg-slate-950/80 border-slate-800/90 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded-xl bg-gradient-to-r ${p.color} text-white`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-xs">{p.title}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400 stroke-[3]" />}
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Language */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <label className="block font-bold text-white flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>पसंदीदा भाषा (Preferred Chat Language)</span>
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="auto">🌐 Auto-Detect (हिंदी / English / Hinglish)</option>
                  <option value="hi">🇮🇳 Hindi (हिंदी में उत्तर दें)</option>
                  <option value="hinglish">🔤 Hinglish (हिंदी + इंग्लिश मिक्स)</option>
                  <option value="en">🇺🇸 English (US/UK)</option>
                  <option value="es">🇪🇸 Spanish (Español)</option>
                  <option value="fr">🇫🇷 French (Français)</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  HK Nexus AI इस भाषा को प्राथमिकता देकर सारे उत्तर तैयार करेगा।
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Voice & Sound */}
          {activeTab === "voice" && (
            <div className="space-y-4">
              {/* Web Speech API Natural Voice Dropdown (Google Wavenet / Edge Neural) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center space-x-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <span>नेचुरल वॉइस सेलेक्टर (Natural Wavenet & Neural Engine)</span>
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800 font-mono">
                    Web Speech
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ब्राउज़र/डिवाइस के Google Wavenet, Edge Neural या उपलब्ध हाई-क्वालिटी नेचुरल वॉइस में से चुनें:
                </p>

                <div className="flex gap-2 items-center">
                  <select
                    value={settings.preferredWebSpeechVoice || ""}
                    onChange={(e) => setSettings((s) => ({ ...s, preferredWebSpeechVoice: e.target.value || undefined }))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="">✨ ऑटो-डिटेक्ट बेस्ट नेचुरल आवाज़ (Recommended)</option>
                    {naturalVoices.length > 0 ? (
                      <optgroup label="🌟 हाई क्वालिटी नेचुरल आवाज़ें (Google / Neural / Hindi)">
                        {naturalVoices.map((v) => (
                          <option key={v.name} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                    {availableVoices.length > 0 && (
                      <optgroup label="🌐 सभी उपलब्ध सिस्टम आवाज़ें">
                        {availableVoices.map((v) => (
                          <option key={v.name} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const voiceToTest = settings.preferredWebSpeechVoice || (naturalVoices[0]?.name || availableVoices[0]?.name || "");
                      if (voiceToTest) handleTestWebSpeechVoice(voiceToTest);
                    }}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all shrink-0 ${
                      testingVoiceId?.startsWith("web-")
                        ? "bg-emerald-500 text-white border-emerald-400 animate-pulse"
                        : "bg-cyan-950 text-cyan-400 border-cyan-800 hover:bg-cyan-900 hover:text-white"
                    }`}
                  >
                    {testingVoiceId?.startsWith("web-") ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>सुन रहे हैं...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>टेस्ट करें</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Studio Voice Profiles */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>स्टूडियो टोन प्रोफाइल (Studio Tone Profiles)</span>
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-800 font-mono">
                    HD Audio
                  </span>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {VOICE_OPTIONS.map((v) => {
                    const isSelected = selectedVoice === v.id;
                    const isTesting = testingVoiceId === v.id;

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSettings((s) => ({
                          ...s,
                          selectedVoice: v.id as any,
                          voiceGender: v.gender as any
                        }))}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "bg-cyan-950/80 border-cyan-500 text-white shadow-md shadow-cyan-950/50"
                            : "bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-lg">{v.icon}</span>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-xs">{v.name}</span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">{v.desc}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestVoice(v.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center space-x-1 border transition-all ${
                            isTesting
                              ? "bg-emerald-500 text-white border-emerald-400 animate-pulse"
                              : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700"
                          }`}
                        >
                          {isTesting ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>सुन रहे हैं...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                              <span>सुनें</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Voice Speed Slider */}
                <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300 font-semibold">बोलने की गति (Speech Speed)</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-400 font-bold font-mono">{settings.voiceSpeed}x</span>
                      {settings.voiceSpeed !== 1 && (
                        <button
                          type="button"
                          onClick={() => setSettings((s) => ({ ...s, voiceSpeed: 1 }))}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Reset to 1.0x"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={settings.voiceSpeed}
                    onChange={(e) => setSettings((s) => ({ ...s, voiceSpeed: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>

                {/* Auto-read responses */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-white font-bold text-[11px] block">हर जवाब को ऑटो बोलकर सुनाएं</span>
                    <span className="text-slate-400 text-[10px]">Auto-read AI responses out loud</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoReadResponse}
                      onChange={(e) => setSettings((s) => ({ ...s, autoReadResponse: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Memory & Privacy */}
          {activeTab === "memory" && (
            <div className="space-y-4">
              {/* Long Memory Consent Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BrainCircuit className="w-4.5 h-4.5 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white block">लंबी मेमोरी (User Memory Consent)</span>
                      <span className={`text-[10px] ${settings.memoryEnabled ? "text-emerald-400 font-semibold" : "text-slate-400"}`}>
                        {settings.memoryEnabled ? "✓ स्मार्ट मेमोरी सक्रिय (Active)" : "✕ मेमोरी बंद (Disabled)"}
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.memoryEnabled}
                      onChange={(e) => setSettings((s) => ({ ...s, memoryEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600" />
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  जब यह ऑन रहता है, तो HK Nexus AI आपकी बातचीत के पिछले संदर्भ को याद रखकर उत्तर देता है। आपकी अनुमति के बिना कोई व्यक्तिगत जानकारी तीसरे पक्ष को नहीं दी जाती।
                </p>
              </div>

              {/* Data Security Info */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 text-slate-300 text-[11px] flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">100% सुरक्षित स्थानीय डेटा गोपनीयता</span>
                  <p className="text-slate-400 text-[10px]">
                    आपकी चैट हिस्ट्री केवल आपके ही डिवाइस/ब्राउज़र में एन्क्रिप्टेड रूप से सुरक्षित रहती है।
                  </p>
                </div>
              </div>

              {/* Delete All History Card */}
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-red-400">
                    <Trash2 className="w-4 h-4" />
                    <span className="font-bold text-white">चैट व मेमोरी डिलीट करें (Clear History)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("क्या आप अपनी पूरी चैट बातचीत और मेमोरी डिलीट करना चाहते हैं?")) {
                        localStorage.removeItem("hk_nexus_chat_history");
                        window.dispatchEvent(new Event("clear-hk-chat-history"));
                        alert("आपकी पूरी चैट हिस्ट्री सफलतापूर्वक डिलीट कर दी गई है!");
                      }
                    }}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    Clear History
                  </button>
                </div>
                <p className="text-[10px] text-red-300/80">
                  इस बटन से आपकी सारी पुरानी बातचीत और सेव्ड मैसेज पूरी तरह डिलीट हो जाएंगे।
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: API Keys & Engine Configuration */}
          {activeTab === "keys" && (
            <div className="space-y-4">
              {/* Important Vercel / Deployment Guidance Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-500/40 text-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>💡 Vercel / Live Deployment Guide</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  यदि आपने Vercel पर Environment Variables जोड़े हैं, तो कृपया Vercel Dashboard में <strong>Deployments ➔ 3 डॉट्स (⋮) ➔ Redeploy</strong> पर क्लिक करें ताकि नए keys लाइव सर्वर पर लोड हो सकें।
                </p>
                <p className="text-[10px] text-cyan-300/90 font-medium">
                  ✨ या फिर आप सीधे नीचे अपनी Key पेस्ट करके <strong>"Save & Apply"</strong> कर सकते हैं — यह ब्राउज़र में तुरंत काम करने लगेगी!
                </p>
              </div>

              {/* Key Test Status Banner */}
              {keyTestStatus.message && (
                <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center space-x-2 border ${
                  keyTestStatus.testing 
                    ? "bg-cyan-950/80 border-cyan-500 text-cyan-300"
                    : keyTestStatus.success
                    ? "bg-emerald-950/90 border-emerald-500 text-emerald-300"
                    : "bg-red-950/90 border-red-500 text-red-300"
                }`}>
                  {keyTestStatus.testing ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : keyTestStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{keyTestStatus.message}</span>
                </div>
              )}

              {/* Preferred AI Engine Selector */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <label className="block font-bold text-white flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>प्राथमिक AI इंजन (Preferred Engine)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "auto", label: "Auto (स्मार्ट)", desc: "सर्वोत्तम स्पीड व क्वालिटी" },
                    { id: "groq", label: "Groq Llama", desc: "बिजली जैसी तेज़ स्पीड" },
                    { id: "gemini", label: "Gemini 2.5", desc: "लाइव सर्च व डीप विज़न" },
                  ].map((engine) => {
                    const isSel = (settings.preferredEngine || "auto") === engine.id;
                    return (
                      <button
                        key={engine.id}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, preferredEngine: engine.id as any }))}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isSel
                            ? "bg-cyan-950 border-cyan-500 text-white shadow-md shadow-cyan-950/50"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="font-bold text-xs">{engine.label}</div>
                        <div className="text-[9px] text-slate-500">{engine.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Groq API Key Input */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">Groq API Key (मुफ़्त और 500 T/s तेज़)</span>
                  </div>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>मुफ़्त Key लें</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showGroqKey ? "text" : "password"}
                    placeholder="gsk_..."
                    value={settings.customGroqApiKey || ""}
                    onChange={(e) => setSettings((s) => ({ ...s, customGroqApiKey: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 pr-20 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <div className="absolute right-2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="p-1.5 text-slate-400 hover:text-white"
                      title={showGroqKey ? "Hide" : "Show"}
                    >
                      {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTestApiKey("groq")}
                      className="px-2.5 py-1 bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white rounded-lg text-[10px] font-bold border border-amber-500/40 transition-all"
                    >
                      Test
                    </button>
                  </div>
                </div>
              </div>

              {/* Gemini API Key Input */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white">Gemini API Key (Google AI Studio)</span>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>मुफ़्त Key लें</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showGeminiKey ? "text" : "password"}
                    placeholder="AIzaSy..."
                    value={settings.customGeminiApiKey || ""}
                    onChange={(e) => setSettings((s) => ({ ...s, customGeminiApiKey: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 pr-20 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                  <div className="absolute right-2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="p-1.5 text-slate-400 hover:text-white"
                      title={showGeminiKey ? "Hide" : "Show"}
                    >
                      {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTestApiKey("gemini")}
                      className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-lg text-[10px] font-bold border border-cyan-500/40 transition-all"
                    >
                      Test
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <button
          onClick={handleSaveAndClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Save & Apply Settings</span>
        </button>
      </div>
    </div>
  );
};
