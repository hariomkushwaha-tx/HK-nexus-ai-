import React, { useState } from "react";
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
  RotateCcw
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
  const [activeTab, setActiveTab] = useState<"ai" | "voice" | "memory">("ai");
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [testAudio, setTestAudio] = useState<HTMLAudioElement | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleTestVoice = async (voiceId: string) => {
    if (testAudio) {
      testAudio.pause();
      setTestAudio(null);
    }
    if (testingVoiceId === voiceId) {
      setTestingVoiceId(null);
      return;
    }

    setTestingVoiceId(voiceId);

    try {
      const res = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "नमस्ते! मैं HK Nexus Studio AI हूँ। यह मेरी नेचुरल इंसानी आवाज़ है।",
          voice: voiceId,
        }),
      });

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
          setTestingVoiceId(null);
          setTestAudio(null);
        };

        await audio.play();
      } else {
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance("नमस्ते! मैं HK Nexus Studio AI हूँ। यह मेरी नेचुरल इंसानी आवाज़ है।");
          const voices = window.speechSynthesis.getVoices();
          const isFemale = voiceId === "Kore" || voiceId === "Aoede";
          const match = voices.find(v => v.lang.includes("hi") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Online"))) || voices.find(v => v.lang.includes("hi")) || voices[0];
          if (match) utterance.voice = match;
          utterance.pitch = isFemale ? 1.0 : 0.9;
          utterance.rate = settings.voiceSpeed || 1.0;
          utterance.onend = () => setTestingVoiceId(null);
          utterance.onerror = () => setTestingVoiceId(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setTestingVoiceId(null);
        }
      }
    } catch (e) {
      console.error("Test voice failed:", e);
      setTestingVoiceId(null);
    }
  };

  const handleSaveAndClose = () => {
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 800);
  };

  const selectedVoice = settings.selectedVoice || (settings.voiceGender === "male" ? "Puck" : "Kore");

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
            className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
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
            className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === "voice"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Human Voice</span>
          </button>

          <button
            onClick={() => setActiveTab("memory")}
            className={`flex-1 py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === "memory"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Memory</span>
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
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>नेचुरल इंसानी आवाज़ें (Human Studio Voices)</span>
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
