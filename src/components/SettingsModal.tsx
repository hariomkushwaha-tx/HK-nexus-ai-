import React, { useState } from "react";
import { UserSettings } from "../types";
import { 
  X, 
  BrainCircuit, 
  Globe, 
  Volume2, 
  Mic, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  Play,
  Loader2,
  Check,
  Trash2
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

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings
}) => {
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [testAudio, setTestAudio] = useState<HTMLAudioElement | null>(null);

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

  const selectedVoice = settings.selectedVoice || (settings.voiceGender === "male" ? "Puck" : "Kore");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">HK Nexus AI Settings & Memory</h3>
              <p className="text-xs text-slate-400">Created by Hariom Kushwaha (HK Tech World)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="space-y-4 text-xs">
          {/* Long Memory Consent Toggle */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">लंबी मेमोरी (User Permission Consent)</span>
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
            <p className="text-[11px] text-slate-400">
              जब यह ऑन रहेगा, HK Nexus Studio AI आपकी बातचीत के संदर्भ को याद रखेगा। यूज़र की अनुमति के बिना डाटा सेव नहीं होता।
            </p>
          </div>

          {/* Primary Language */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="block font-bold text-white flex items-center space-x-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Preferred Language (हर भाषा में बात करना)</span>
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="auto">Auto-Detect (हिंदी / English / Hinglish)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="en">English (US/UK)</option>
              <option value="es">Spanish (Español)</option>
              <option value="fr">French (Français)</option>
            </select>
          </div>

          {/* Voice Settings (Voice Chat & TTS) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-white flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>नेचुरल इंसानी आवाज़ें (Human AI Voices)</span>
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800">
                Studio HD
              </span>
            </h4>

            {/* Voices List */}
            <div className="space-y-2">
              <label className="block text-[11px] text-slate-400">अपनी पसंदीदा इंसानी आवाज़ चुनें:</label>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
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
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "bg-cyan-950/80 border-cyan-500 text-white shadow-md shadow-cyan-950/50"
                          : "bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-base">{v.icon}</span>
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
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 border transition-all ${
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
            </div>

            {/* Voice Speed */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>बोलने की गति (Speech Speed Rate)</span>
                <span className="text-cyan-400 font-bold">{settings.voiceSpeed}x</span>
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
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300 text-[11px]">हर जवाब को अपने-आप बोलकर सुनाए (Auto Read)</span>
              <input
                type="checkbox"
                checked={settings.autoReadResponse}
                onChange={(e) => setSettings((s) => ({ ...s, autoReadResponse: e.target.checked }))}
                className="accent-cyan-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Delete All History Card */}
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-400">
                <Trash2 className="w-4 h-4" />
                <span className="font-bold text-white">चैट व मेमोरी डिलीट करें (Delete All History)</span>
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
                className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Clear History
              </button>
            </div>
            <p className="text-[11px] text-red-300/80">
              इस बटन से आपकी सारी पुरानी बातचीत और सेव्ड मैसेज पूरी तरह डिलीट हो जाएंगे।
            </p>
          </div>
        </div>

        {/* Footer button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all"
        >
          Save & Apply Settings
        </button>
      </div>
    </div>
  );
};
