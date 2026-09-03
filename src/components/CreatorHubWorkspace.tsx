import React, { useState } from "react";
import { 
  User, 
  Cpu, 
  Sparkles, 
  Code2, 
  Globe, 
  ShieldCheck, 
  Heart, 
  MapPin, 
  Mail, 
  Award,
  Zap,
  CheckCircle2, 
  HelpCircle,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Send
} from "lucide-react";
import { PolicyTab } from "./PolicyModal";

interface CreatorHubWorkspaceProps {
  onOpenPolicy?: (tab: PolicyTab) => void;
}

export const CreatorHubWorkspace: React.FC<CreatorHubWorkspaceProps> = ({ onOpenPolicy }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  const capabilities = [
    { title: "इंसानों जैसी प्राकृतिक बातचीत", desc: "Human-like natural multi-turn conversations in Hindi, English & global languages." },
    { title: "लंबी मेमोरी (User Consent)", desc: "Consensual session context & long-term memory configuration." },
    { title: "Voice Chat (STT + TTS)", desc: "Speech-to-Text & Text-to-Speech in Male & Female realistic voices." },
    { title: "Multi-modal Vision & OCR", desc: "Read documents, extract handwritten text, charts, screenshots, objects & locations." },
    { title: "Image, Logo & Banner Studio", desc: "Generate professional vector logos, banners, posters, background removal & 4K upscaling." },
    { title: "Live Grounded Web Search", desc: "Real-time news summaries, weather reports, stock/crypto updates & sports scores." },
    { title: "Math, Coding & Learning Lab", desc: "Step-by-step calculus/algebra solver, code diagnosis, science explainer & quiz generator." },
  ];

  const faqs = [
    {
      q: "HK Nexus AI क्या है और इसका मुख्य उद्देश्य क्या है?",
      a: "HK Nexus AI एक ऑल-इन-वन नेक्स्ट जेनरेशन मल्टीमॉडल AI असिस्टेंट है, जिसे हरिओम कुशवाहा (HK Tech World) द्वारा विकसित किया गया है। इसका उद्देश्य भारतीय छात्रों, कोडर्स, शोधकर्ताओं और आम नागरिकों को विश्वस्तरीय AI तकनीक बिना किसी शुल्क के हिंदी और अंग्रेज़ी में उपलब्ध कराना है।"
    },
    {
      q: "क्या HK Nexus AI का उपयोग करने के लिए कोई सब्सक्रिप्शन शुल्क देना पड़ता है?",
      a: "बिल्कुल नहीं! HK Nexus AI 100% फ्री टू यूज़ (Free to use) प्लेटफ़ॉर्म है। आप बिना किसी क्रेडिट कार्ड या पेड प्लान के चैट, इमेज जनरेशन, विज़न OCR और मैथ लैब का असीमित लाभ उठा सकते हैं।"
    },
    {
      q: "Vision OCR टूल से क्या-क्या स्कैन किया जा सकता है?",
      a: "Vision OCR टूल किसी भी किताब के पन्ने, हाथ से लिखे नोट्स, बिल, रसीद, आरेख, स्क्रीनशॉट या प्राकृतिक दृश्यों का विश्लेषण कर सकता है और उसमें से टेक्स्ट निकाल कर तुरंत हिंदी या अंग्रेज़ी में अनुवाद व सारांश प्रदान कर सकता है।"
    },
    {
      q: "क्या मेरा डेटा और बातचीत इस प्लेटफॉर्म पर सुरक्षित हैं?",
      a: "हाँ, हम आपकी निजता को सर्वोच्च प्राथमिकता देते हैं। बातचीत का डेटा केवल उत्तर तैयार करने के लिए प्रोसेस किया जाता है और इसे किसी विज्ञापनदाता या तीसरे पक्ष को नहीं बेचा जाता। उपयोगकर्ता जब चाहें अपनी चैट हिस्ट्री डिलीट कर सकते हैं।"
    },
    {
      q: "वेबसाइट पर विज्ञापन (Google AdSense) क्यों दिखाए जाते हैं?",
      a: "क्लाउड सर्वर के भारी कंप्यूटेशनल खर्च और इस प्लेटफ़ॉर्म को हमेशा मुफ़्त बनाए रखने के लिए हम Google AdSense के गैर-दखलंदाज़ी वाले विज्ञापनों का सहारा लेते हैं। यह विज्ञापन Google की सख्त नीतियों और DoubleClick DART कुकी के तहत दिखाए जाते हैं।"
    },
    {
      q: "क्या मैं इसे अपने मोबाइल में ऐप की तरह इंस्टॉल कर सकता हूँ?",
      a: "हाँ! HK Nexus AI एक प्रोग्रेसिव वेब ऐप (PWA) है। मोबाइल में अपने ब्राउज़र के मेनू (तीन बिंदु) पर क्लिक करें और 'Add to Home Screen' या 'ऐप इंस्टॉल करें' चुनें।"
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    const mailtoUrl = `mailto:hkdeveloperh@gmail.com?subject=Contact from ${encodeURIComponent(contactName)}&body=${encodeURIComponent(contactMessage)}%0A%0AEmail: ${encodeURIComponent(contactEmail)}`;
    window.location.href = mailtoUrl;
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-8 overflow-y-auto">
      
      {/* Creator Profile Card */}
      <div className="relative overflow-hidden bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-cyan-500/40 p-1 shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-[14px] flex items-center justify-center">
                <User className="w-12 h-12 text-cyan-400" />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-cyan-600 text-white text-[10px] font-bold shadow-md">
              Creator
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Creator Profile & Headquarters</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hariom Kushwaha
            </h1>

            <p className="text-sm font-semibold text-cyan-400 flex items-center justify-center md:justify-start gap-2">
              <span>HK Tech World</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" /> Mauranipur, Jhansi, UP, India
              </span>
            </p>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Founder & Lead Developer of <strong>HK Nexus AI</strong>. Passionate about bringing world-class artificial intelligence ecosystems to India that democratize multi-modal creation, coding, OCR vision, and natural multilingual conversation for students, creators, and innovators.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-xl bg-orange-950/70 text-orange-300 border border-orange-700/50 font-bold flex items-center gap-1.5 shadow-sm">
                <span>🇮🇳</span>
                <span>100% Made in India</span>
              </span>
              <a 
                href="mailto:hkdeveloperh@gmail.com" 
                className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> hkdeveloperh@gmail.com
              </a>
              <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-slate-300">
                <Award className="w-3.5 h-3.5 text-amber-400" /> HK Nexus AI v3.6
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE EDITORIAL ARTICLE (500-600+ WORDS FOR ADSENSE VALUE) */}
      <section className="bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5 text-slate-300 leading-relaxed shadow-lg">
        <div className="border-b border-slate-800 pb-4">
          <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Info className="w-4 h-4" /> संपूर्ण परिचय एवं गाइड
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            HK Nexus AI क्या है, इसे कैसे इस्तेमाल करें और इसके क्या फ़ायदे हैं?
          </h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300">
          <div>
            <h3 className="text-base font-bold text-white mb-1.5 text-cyan-300">
              1. परिचय: HK Nexus AI क्या है? (What is HK Nexus AI?)
            </h3>
            <p className="leading-relaxed">
              <strong>HK Nexus AI</strong> एक आधुनिक, मुफ़्त और बहुभाषी (Multimodal) आर्टिफिशियल इंटेलिजेंस प्लेटफ़ॉर्म है। इसे मऊरानीपुर (झांसी, उत्तर प्रदेश) के युवा डेवलपर <strong>हरिओम कुशवाहा (HK Tech World)</strong> द्वारा विकसित किया गया है। इस टूल को तैयार करने का मुख्य उद्देश्य हर भारतीय विद्यार्थी, शिक्षक, सॉफ्टवेयर इंजीनियर और आम उपभोक्ता तक दुनिया की सबसे आधुनिक AI क्षमताओं को उनकी अपनी भाषा (हिंदी, हिंग्लिश एवं अंग्रेज़ी) में मुफ़्त पहुंचाना है।
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-1.5 text-cyan-300">
              2. इसे कैसे इस्तेमाल करें? (Step-by-Step User Guide)
            </h3>
            <p className="mb-2">
              HK Nexus AI का उपयोग करना बेहद सरल और सहज है। इसके लिए किसी तकनीकी ज्ञान की आवश्यकता नहीं है:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5 text-indigo-400">
                  <CheckCircle2 className="w-4 h-4" /> AI Chat (बातचीत एवं सहायता)
                </h4>
                <p className="text-xs text-slate-400">
                  होम स्क्रीन पर चैट बॉक्स में अपना सवाल टाइप करें या माइक बटन दबाकर बोलें। यह निबंध, आवेदन पत्र, सारांश, अनुवाद और ईमेल सेकंडों में तैयार कर देता है।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Vision OCR (दस्तावेज़ स्कैनिंग)
                </h4>
                <p className="text-xs text-slate-400">
                  'Vision' टैब पर जाएं और किसी भी किताब, नोट्स या बिल की फ़ोटो अपलोड करें। AI तुरंत उस तस्वीर के सारे अक्षरों को पढ़कर उनका सटीक विवरण प्रस्तुत कर देगा।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5 text-pink-400">
                  <CheckCircle2 className="w-4 h-4" /> Image AI (आर्ट व लोगो जनरेशन)
                </h4>
                <p className="text-xs text-slate-400">
                  'Image AI' टैब में अपने विचार का विवरण लिखें (जैसे: "A 3D futuristic gold logo of HK"). सिस्टम तुरंत आकर्षक और हाई-रिज़ॉल्यूशन छवि तैयार करेगा।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5 text-amber-400">
                  <CheckCircle2 className="w-4 h-4" /> Math & Code Lab (गणित व प्रोग्रामिंग)
                </h4>
                <p className="text-xs text-slate-400">
                  कठिन गणितीय समीकरणों, बीजगणित, कैलकुलस या पायथन/जावास्क्रिप्ट के कोड बग्स को स्टेप-बाय-स्टेप समझें और उनका सटीक हल प्राप्त करें।
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-1.5 text-cyan-300">
              3. HK Nexus AI के मुख्य फायदे (Key Benefits)
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-300 ml-1">
              <li><strong>100% मुफ़्त एवं बिना रुकावट:</strong> कोई छिपा हुआ सब्सक्रिप्शन शुल्क या अनिवार्य क्रेडिट कार्ड आवश्यकता नहीं।</li>
              <li><strong>उत्कृष्ट भाषा समर्थन:</strong> हिंदी, हिंग्लिश और अंग्रेज़ी में सहज मानवीय संवाद की सुविधा।</li>
              <li><strong>समय की बचत:</strong> शोध, पढ़ाई, होमवर्क और व्यावसायिक ड्राफ्टिंग के काम जो घंटों लेते थे, अब सेकंडों में पूरे होते हैं।</li>
              <li><strong>डेटा सुरक्षा एवं निजता:</strong> आपका व्यक्तिगत डेटा सुरक्षित रहता है और किसी तीसरे पक्ष के साथ साझा नहीं किया जाता।</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ SECTION (ACCORDION) */}
      <section className="bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-5 shadow-lg">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <HelpCircle className="w-4 h-4" /> अक्सर पूछे जाने वाले प्रश्न
            </div>
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions (FAQ)</h2>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 text-left font-semibold text-xs sm:text-sm text-slate-200 flex items-center justify-between gap-3 hover:bg-slate-800/40"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-cyan-950 text-cyan-400 text-xs flex items-center justify-center shrink-0 border border-cyan-800/60 font-bold">
                      {idx + 1}
                    </span>
                    <span>{item.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/40">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ESSENTIAL LEGAL & POLICY ACCESS (GOOGLE ADSENSE COMPLIANCE) */}
      <section className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>कानूनी नीतियां और प्राइवेसी मानक (Compliance & Legal Policies)</span>
        </h3>
        <p className="text-xs text-slate-400">
          HK Nexus AI पूर्ण रूप से Google AdSense, GDPR और इंटरनेट सुरक्षा दिशानिर्देशों का पालन करता है। आप नीचे दिए गए बटनों पर क्लिक करके हमारी आधिकारिक नीतियां पढ़ सकते हैं:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => onOpenPolicy?.("privacy")}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform mb-1.5" />
            <p className="text-xs font-bold text-white">Privacy Policy</p>
            <p className="text-[10px] text-slate-400">कुकीज़ व डेटा सुरक्षा</p>
          </button>

          <button
            onClick={() => onOpenPolicy?.("terms")}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-left transition-all group"
          >
            <FileText className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform mb-1.5" />
            <p className="text-xs font-bold text-white">Terms of Service</p>
            <p className="text-[10px] text-slate-400">नियम और शर्तें</p>
          </button>

          <button
            onClick={() => onOpenPolicy?.("disclaimer")}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform mb-1.5" />
            <p className="text-xs font-bold text-white">Disclaimer</p>
            <p className="text-[10px] text-slate-400">AI सामग्री अस्वीकरण</p>
          </button>

          <button
            onClick={() => onOpenPolicy?.("contact")}
            className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
          >
            <Mail className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform mb-1.5" />
            <p className="text-xs font-bold text-white">Contact Us</p>
            <p className="text-[10px] text-slate-400">संपर्क एवं सहायता</p>
          </button>
        </div>
      </section>

      {/* CONTACT FORM DIRECTLY ON PAGE */}
      <section className="bg-slate-900/90 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-cyan-400" />
          <span>हमसे सीधे संपर्क करें (Get in Touch)</span>
        </h3>
        <p className="text-xs text-slate-400">
          HK Nexus AI से संबंधित किसी भी सहायता, शिकायत या सुझाव के लिए नीचे दिया गया फॉर्म भरें:
        </p>

        {sentSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>आपका संदेश सफलतापूर्वक तैयार हो गया है!</span>
          </div>
        )}

        <form onSubmit={handleContactSubmit} className="space-y-3 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">आपका नाम</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="उदा. राहुल शर्मा"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">ईमेल पता</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">संदेश</label>
            <textarea
              required
              rows={3}
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="अपनी प्रतिक्रिया या प्रश्न लिखें..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>संदेश भेजें (Send Email)</span>
          </button>
        </form>
      </section>

      {/* Made With Love Footer Banner */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 text-center space-y-2 shadow-lg">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
          <span>HK Tech World</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-normal">Made with</span>
          <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
          <span className="text-slate-300 font-normal">by</span>
          <span className="text-cyan-400 font-bold">Hariom Kushwaha Mauranipur</span>
        </h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          HK Nexus AI को आधुनिक आर्किटेक्चर, उच्च क्षमता और शत-प्रतिशत भारतीय भावना के साथ विकसित किया गया है।
        </p>
      </div>

    </div>
  );
};
