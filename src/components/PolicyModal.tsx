import React, { useState } from "react";
import { 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  Mail, 
  AlertCircle, 
  Info, 
  X, 
  CheckCircle2, 
  Send,
  Heart,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export type PolicyTab = "about" | "privacy" | "terms" | "contact" | "disclaimer" | "faq" | "guide";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, initialTab = "privacy" }) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);

  // Keep state in sync if initialTab changes
  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    // Mailto fallback
    const mailtoUrl = `mailto:hkdeveloperh@gmail.com?subject=Inquiry from ${encodeURIComponent(contactName)}&body=${encodeURIComponent(contactMessage)}%0A%0AContact Email: ${encodeURIComponent(contactEmail)}`;
    window.location.href = mailtoUrl;
    setContactSent(true);
    setTimeout(() => setContactSent(false), 5000);
  };

  const faqs = [
    {
      q: "HK Nexus AI क्या है और इसे किसने बनाया है?",
      a: "HK Nexus AI एक आधुनिक, मुफ़्त और बहुभाषी (Multimodal) AI सहायक है, जिसे हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World), मऊरानीपुर, उत्तर प्रदेश द्वारा डिज़ाइन और विकसित किया गया है। यह टेक्स्ट चैट, कोड डिबगिंग, गणितीय समीकरणों को हल करने, फ़ोटो से टेक्स्ट निकालने (OCR) और लाइव वेब सर्च की सुविधा प्रदान करता है।"
    },
    {
      q: "क्या HK Nexus AI का इस्तेमाल पूरी तरह से मुफ़्त है?",
      a: "हाँ, HK Nexus AI का मुख्य उद्देश्य छात्रों, डेवलपर्स और आम उपयोगकर्ताओं को मुफ़्त में उच्च गुणवत्ता वाले AI टूल्स उपलब्ध कराना है। इसके बुनियादी और उन्नत दोनों फीचर्स बिना किसी अनिवार्य सदस्यता शुल्क के उपलब्ध हैं।"
    },
    {
      q: "क्या मेरी बातचीत और निजी डेटा सुरक्षित हैं?",
      a: "हाँ, HK Nexus AI आपकी गोपनीयता (Privacy) का पूरा सम्मान करता है। हम उपयोगकर्ता की व्यक्तिगत बातचीत को किसी तीसरे पक्ष के साथ नहीं बेचते हैं। ब्राउज़र सेटिंग्स और मेमोरी केवल आपके लोकल स्टोरेज में सुरक्षित रखी जाती है जिसे आप कभी भी साफ़ (Clear) कर सकते हैं।"
    },
    {
      q: "वेबसाइट पर विज्ञापन (Google AdSense) क्यों दिखाए जाते हैं?",
      a: "HK Nexus AI को निःशुल्क बनाए रखने और उच्च-प्रदर्शन वाले सर्वर लागत (Server Hosting & Compute) को वहन करने के लिए Google AdSense के गैर-दखलंदाज़ी वाले विज्ञापन प्रदर्शित किए जाते हैं।"
    },
    {
      q: "Vision OCR और Math Solver का उपयोग कैसे करें?",
      a: "नेविगेशन बार से 'Vision' टैब पर क्लिक करें और अपनी किसी भी फ़ोटो या दस्तावेज़ को अपलोड करें। हमारा AI मॉडल तुरंत उस छवि का विश्लेषण करके सारा टेक्स्ट और महत्वपूर्ण जानकारी निकाल देगा। इसी तरह 'Math & Code' टैब में जटिल समीकरणों का चरण-दर-चरण समाधान प्राप्त किया जा सकता है।"
    },
    {
      q: "क्या HK Nexus AI मोबाइल और कंप्यूटर दोनों पर काम करता है?",
      a: "बिल्कुल! HK Nexus AI को 100% रिस्पॉन्सिव वेब डिज़ाइन और PWA (Progressive Web App) सपोर्ट के साथ तैयार किया गया है। आप इसे अपने एंड्रॉइड, आईफोन या डेस्कटॉप ब्राउज़र पर 'Add to Home Screen' करके एक ऐप की तरह चला सकते हैं।"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black text-sm">
              HK
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">HK Nexus AI</h2>
              <p className="text-xs text-cyan-400/90 mt-0.5">कानूनी नीतियां, दिशानिर्देश और सहायता केंद्र</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-4 py-2 bg-slate-950/50 border-b border-slate-800 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab("about")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "about"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About Us (परिचय)</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "privacy"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy (गोपनीयता)</span>
          </button>

          <button
            onClick={() => setActiveTab("terms")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "terms"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service (शर्तें)</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "guide"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>User Guide (उपयोग गाइड)</span>
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "faq"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ (सवाल-जवाब)</span>
          </button>

          <button
            onClick={() => setActiveTab("disclaimer")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "disclaimer"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Disclaimer (अस्वीकरण)</span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "contact"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Us (संपर्क करें)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-slate-300 text-sm leading-relaxed space-y-5">
          
          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-200">
                <h3 className="text-lg font-bold text-white mb-1">हमारे बारे में (About HK Nexus AI)</h3>
                <p className="text-xs text-cyan-300 leading-normal">
                  <strong>HK Nexus AI</strong> को <strong>हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World)</strong> द्वारा विकसित किया गया है। हमारा उद्देश्य हर भारतीय छात्र, शोधकर्ता और पेशेवर तक दुनिया की सबसे आधुनिक AI तकनीक को मुफ़्त में पहुंचाना है।
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">1. हमारी दृष्टि (Our Mission & Vision)</h4>
                <p className="text-xs text-slate-300">
                  इंटरनेट के इस आधुनिक युग में आर्टिफिशियल इंटेलिजेंस (AI) केवल कुछ चुनिंदा लोगों तक सीमित नहीं रहना चाहिए। HK Nexus AI हिंदी, अंग्रेज़ी और क्षेत्रीय भाषाओं में सहज, तीव्र और सटीक संवाद प्रदान करता है ताकि भाषा कभी भी ज्ञान के रास्ते में बाधा न बने।
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">2. प्रमुख क्षमताएं (Core Architecture)</h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 ml-1">
                  <li><strong>स्वाभाविक बातचीत (Natural Dialogue):</strong> प्रश्नों के सटीक, संदर्भ-आधारित और मानवीय उत्तर।</li>
                  <li><strong>मल्टीमॉडल विज़न (Vision OCR):</strong> फ़ोटो, हस्तलिखित नोट्स और दस्तावेज़ों को स्कैन करके टेक्स्ट निकालना।</li>
                  <li><strong>क्रिएटिव स्टूडियो (Image Generation):</strong> उच्च-रिज़ॉल्यूशन वेक्टर लोगो, बैनर और कलात्मक चित्र तैयार करना।</li>
                  <li><strong>लाइव वेब सर्च (Real-time Grounding):</strong> ताज़ा समाचार, मौसम और खेल स्कोर की सटीक जानकारी।</li>
                  <li><strong>गणित और कोडिंग प्रयोगशाला (Math & Code Lab):</strong> पाइथन, जावास्क्रिप्ट, रीएक्ट और गणितीय प्रश्नों का चरण-दर-चरण समाधान।</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">3. संस्थापक एवं संपर्क (Founder & Headquarters)</h4>
                <p className="text-xs text-slate-300">
                  <strong>संस्थापक:</strong> हरिओम कुशवाहा (Hariom Kushwaha)<br />
                  <strong>कंपनी/ब्रांड:</strong> HK Tech World<br />
                  <strong>स्थान:</strong> मऊरानीपुर, झांसी, उत्तर प्रदेश - 284204, भारत<br />
                  <strong>आधिकारिक ईमेल:</strong> <a href="mailto:hkdeveloperh@gmail.com" className="text-cyan-400 hover:underline">hkdeveloperh@gmail.com</a>
                </p>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY TAB (Google AdSense Compliant) */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200">
                <h3 className="text-lg font-bold text-white mb-1">गोपनीयता नीति (Privacy Policy)</h3>
                <p className="text-xs text-slate-400">अंतिम अपडेट: सितंबर 2026 | HK Nexus AI & HK Tech World</p>
                <p className="text-xs text-slate-300 mt-2">
                  आपकी गोपनीयता हमारे लिए अत्यंत महत्वपूर्ण है। यह नीति स्पष्ट करती है कि जब आप <strong>https://hk-nexus-ai.vercel.app</strong> पर आते हैं, तो हम किस प्रकार की जानकारी एकत्र, उपयोग और सुरक्षित करते हैं।
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">1. कुकीज़ और वेब बीकन (Cookies & Web Beacons)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  अन्य पेशेवर वेबसाइटों की तरह, HK Nexus AI उपयोगकर्ता की प्राथमिकताओं (जैसे चुनी गई भाषा, वॉइस स्पीड और थीम सेटिंग्स) को सहेजने के लिए कुकीज़ का उपयोग करता है। यह डेटा आपके व्यक्तिगत ब्राउज़र में ही रहता है।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-200">
                <h4 className="text-xs font-bold text-amber-300 mb-1">Google AdSense और तृतीय पक्ष विज्ञापन नीति (Google AdSense Compliance)</h4>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  • <strong>DoubleClick DART Cookie:</strong> Google एक तृतीय-पक्ष विक्रेता के रूप में हमारी साइट पर विज्ञापन प्रदर्शित करने के लिए कुकीज़ का उपयोग करता है। Google द्वारा DART कुकी का उपयोग इसे हमारे उपयोगकर्ताओं को इंटरनेट पर उनकी पिछली यात्राओं के आधार पर विज्ञापन देने में सक्षम बनाता है।<br />
                  • उपयोगकर्ता Google विज्ञापन और सामग्री नेटवर्क गोपनीयता नीति पृष्ठ पर जाकर DART कुकी के उपयोग से ऑप्ट-आउट कर सकते हैं: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">Google Ads Privacy Policy <ExternalLink className="w-3 h-3" /></a><br />
                  • हमारे विज्ञापन भागीदार (जैसे Google AdSense) कुकीज़ और जावास्क्रिप्ट का उपयोग अपने विज्ञापनों की प्रभावशीलता मापने और सामग्री को प्रासंगिक बनाने के लिए कर सकते हैं।
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">2. उपयोगकर्ता डेटा एवं चैट गोपनीयता (User Data & Chat Privacy)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  उपयोगकर्ता द्वारा चैट या विज़न में भेजे गए इनपुट्स का उपयोग केवल उसी समय उत्तर उत्पन्न करने के लिए किया जाता है। हम आपकी बातचीत या अपलोड की गई तस्वीरों को किसी भी तीसरे पक्ष के साथ व्यावसायिक रूप से साझा नहीं करते हैं और न ही किसी स्पैम उद्देश्य के लिए बेचते हैं।
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">3. बच्चों की ऑनलाइन गोपनीयता सुरक्षा (COPPA)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  HK Nexus AI 13 वर्ष से कम आयु के बच्चों से जानबूझकर कोई भी व्यक्तिगत पहचान योग्य जानकारी एकत्र नहीं करता है। यदि किसी अभिभावक को लगता है कि उनके बच्चे ने हमारे सिस्टम पर कोई व्यक्तिगत जानकारी दर्ज की है, तो कृपया तुरंत हमसे संपर्क करें।
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">4. सहमति (Consent)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  हमारी वेबसाइट का उपयोग करके, आप हमारी गोपनीयता नीति के नियमों से अपनी सहमति व्यक्त करते हैं।
                </p>
              </div>
            </div>
          )}

          {/* TERMS OF SERVICE TAB */}
          {activeTab === "terms" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">नियम और शर्तें (Terms of Service)</h3>
              
              <div>
                <h4 className="text-sm font-bold text-white mb-1">1. सेवा की शर्तें और स्वीकृति</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  HK Nexus AI पर आने या इसका उपयोग करने पर आप इन नियमों और शर्तों का पालन करने के लिए बाध्य हैं। यदि आप इन शर्तों से असहमत हैं, तो आप इस प्लेटफ़ॉर्म का उपयोग न करें।
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">2. स्वीकार्य उपयोग (Acceptable Use Policy)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  उपयोगकर्ता इस बात से सहमत हैं कि वे HK Nexus AI का उपयोग किसी भी गैर-कानूनी, अश्लील, भड़काऊ, हानिकारक, हैकिंग, या किसी के बौद्धिक संपदा अधिकारों का उल्लंघन करने वाली सामग्री तैयार करने के लिए नहीं करेंगे। किसी भी दुरुपयोग की स्थिति में संबंधित IP या एक्सेस को ब्लॉक करने का पूर्ण अधिकार हमारे पास सुरक्षित है।
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">3. बौद्धिक संपदा (Intellectual Property)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  HK Nexus AI का नाम, लोगो, इंटरफ़ेस डिज़ाइन और संबंधित कोड <strong>हरिओम कुशवाहा (HK Tech World)</strong> की संपत्ति हैं। AI द्वारा उत्पन्न सामग्री का उपयोग उपयोगकर्ता अपने व्यक्तिगत या व्यावसायिक प्रोजेक्ट्स के लिए स्वतंत्र रूप से कर सकते हैं।
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">4. सेवा में बदलाव व उपलब्धता</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  हम बिना किसी पूर्व सूचना के किसी भी समय अपनी सेवाओं को संशोधित, निलंबित या समाप्त करने का अधिकार सुरक्षित रखते हैं।
                </p>
              </div>
            </div>
          )}

          {/* USER GUIDE & EXPLANATION (500-600+ WORDS) */}
          {activeTab === "guide" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-200">
                <h3 className="text-lg font-bold text-white mb-1">HK Nexus AI का संपूर्ण उपयोग गाइड (Comprehensive User Guide)</h3>
                <p className="text-xs text-cyan-300">यह टूल क्या है, इसे कैसे उपयोग करें और इसके क्या फ़ायदे हैं — पूरी जानकारी विस्तार से।</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">भाग 1: HK Nexus AI क्या है? (What is HK Nexus AI?)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  HK Nexus AI एक ऑल-इन-वन नेक्स्ट-जेनरेशन मल्टीमॉडल AI असिस्टेंट है। इसे हरिओम कुशवाहा (HK Tech World) द्वारा विशेष रूप से भारतीय यूज़र्स और वैश्विक छात्रों, क्रिएटर्स और डेवलपर्स की ज़रूरतों को ध्यान में रखकर तैयार किया गया है। यह प्लेटफ़ॉर्म प्राकृतिक भाषा प्रसंस्करण (NLP), कंप्यूटर विज़न (OCR), न्यूरल इमेज सिंथेसिस और रियल-टाइम वेब सर्फिंग जैसी अत्याधुनिक तकनीकों को एक ही सरल इंटरफ़ेस में जोड़ता है।
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">भाग 2: इसे कैसे इस्तेमाल करें? (Step-by-Step How to Use)</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <strong className="text-cyan-400">1. AI चैट (AI Chat):</strong> होम स्क्रीन पर टेक्स्ट बॉक्स में अपना सवाल टाइप करें या माइक बटन दबाकर बोलें। आप हिंदी, हिंग्लिश या अंग्रेज़ी में सवाल पूछ सकते हैं। निबंध, सारांश, अनुवाद, ईमेल या करियर सलाह कुछ ही सेकंडों में प्राप्त करें।
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <strong className="text-cyan-400">2. विज़न और दस्तावेज़ स्कैन (Vision OCR):</strong> 'Vision' टैब चुनें, अपनी फ़ोटो अपलोड करें। यह किताब के पन्ने, हाथ से लिखे नोट्स, बिल, रसीद या स्क्रीनशॉट से सारा टेक्स्ट तुरंत पढ़कर निकाल देता है।
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <strong className="text-cyan-400">3. इमेज व लोगो जनरेटर (Creative Studio):</strong> 'Image AI' टैब पर जाएं, जो फोटो या लोगो चाहिए उसका विवरण लिखें (जैसे: "3D Cyberpunk lion logo") और सेकंडों में आश्चर्यजनक आर्ट प्राप्त करें।
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <strong className="text-cyan-400">4. लाइव सर्च (Live Search):</strong> इंटरनेट के ताज़ा समाचार, शेयर बाज़ार, मौसम और क्रिकेट स्कोर के लाइव अपडेट्स सीधे प्राप्त करें।
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                    <strong className="text-cyan-400">5. गणित और कोडिंग (Math & Code Lab):</strong> गणित के कठिन सवालों के चरण-दर-चरण उत्तर और पाइथन/वेब कोडिंग के बग्स को चुटकियों में ठीक करें।
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">भाग 3: HK Nexus AI के क्या-क्या फायदे हैं? (Key Benefits)</h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 ml-1">
                  <li><strong>समय की भारी बचत:</strong> जटिल गणनाएं, कोडिंग समाधान और शोध कार्य मिनटों में पूरे हो जाते हैं।</li>
                  <li><strong>100% निःशुल्क और सुलभ:</strong> किसी महंगे सब्सक्रिप्शन के बिना सभी शक्तिशाली फीचर्स का मुफ्त आनंद।</li>
                  <li><strong>द्विभाषी दक्षता (Hindi & English):</strong> अपनी पसंदीदा भाषा में सहज बातचीत की पूरी आज़ादी।</li>
                  <li><strong>सुरक्षित और पारदर्शी:</strong> कोई अप्रत्याशित शुल्क नहीं और उपयोगकर्ता की निजता का पूर्ण सम्मान।</li>
                </ul>
              </div>
            </div>
          )}

          {/* FAQ TAB */}
          {activeTab === "faq" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-1">अक्सर पूछे जाने वाले प्रश्न (Frequently Asked Questions)</h3>
              <div className="space-y-2.5">
                {faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full px-4 py-3 text-left font-semibold text-xs sm:text-sm text-slate-200 flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 text-xs flex items-center justify-center shrink-0 border border-cyan-800/60">
                            {index + 1}
                          </span>
                          <span>{faq.q}</span>
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-900/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DISCLAIMER TAB */}
          {activeTab === "disclaimer" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">अस्वीकरण (Disclaimer)</h3>
              
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs leading-relaxed space-y-2">
                <p>
                  <strong>AI जनरेटेड सामग्री सूचना:</strong> HK Nexus AI द्वारा दिए गए सभी उत्तर आधुनिक आर्टिफिशियल इंटेलिजेंस एल्गोरिदम द्वारा स्वचालित रूप से तैयार किए जाते हैं। यद्यपि हम सटीकता बनाए रखने का सर्वोत्तम प्रयास करते हैं, फिर भी किसी भी उत्तर में अनजाने में तथ्यात्मक त्रुटियां या अधूरी जानकारी हो सकती है।
                </p>
                <p>
                  <strong>चिकित्सीय, कानूनी और वित्तीय सलाह नहीं:</strong> इस वेबसाइट पर उपलब्ध जानकारी केवल सामान्य ज्ञान, अध्ययन और रचनात्मक उद्देश्यों के लिए है। किसी भी गंभीर स्वास्थ्य, कानूनी या वित्तीय निर्णय से पहले संबंधित प्रमाणित विशेषज्ञ से परामर्श अवश्य लें।
                </p>
                <p>
                  <strong>तृतीय पक्ष लिंक व विज्ञापन:</strong> हमारी वेबसाइट पर दिखने वाले बाहरी विज्ञापनों या लिंक्स की सामग्री के लिए HK Nexus AI ज़िम्मेदार नहीं है। उपयोगकर्ता अपने विवेक से इन लिंक्स का उपयोग करें।
                </p>
              </div>
            </div>
          )}

          {/* CONTACT US TAB */}
          {activeTab === "contact" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200">
                <h3 className="text-lg font-bold text-white mb-1">हमसे संपर्क करें (Contact Us)</h3>
                <p className="text-xs text-slate-300">
                  यदि आपके पास कोई प्रश्न, सुझाव, विज्ञापन संबंधी पूछताछ या प्रतिक्रिया है, तो आप सीधे हमसे संपर्क कर सकते हैं।
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-slate-400 font-medium">आधिकारिक ईमेल:</p>
                    <p className="text-sm font-bold text-cyan-400 mt-0.5">
                      <a href="mailto:hkdeveloperh@gmail.com" className="hover:underline">hkdeveloperh@gmail.com</a>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-slate-400 font-medium">डेवलपर / संस्थापक:</p>
                    <p className="text-sm font-bold text-white mt-0.5">हरिओम कुशवाहा (Hariom Kushwaha)</p>
                    <p className="text-[11px] text-slate-400">संस्थापक, HK Tech World</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <p className="text-slate-400 font-medium">पता / मुख्यालय:</p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      मऊरानीपुर, जनपद झांसी, उत्तर प्रदेश - 284204, भारत
                    </p>
                  </div>
                </div>

                {/* Contact Form */}
                <form onSubmit={handleContactSubmit} className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-white">संदेश भेजें (Send a Message)</h4>

                  {contactSent && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>आपका संदेश तैयार हो गया है। धन्यवाद!</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">आपका नाम</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">ईमेल पता</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">संदेश</label>
                    <textarea
                      required
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="अपना संदेश या प्रश्न यहाँ लिखें..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ईमेल द्वारा भेजें</span>
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>HK Nexus AI</span>
            <span>•</span>
            <span className="text-slate-500">Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span className="text-slate-500">by Hariom Kushwaha</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab("privacy")} className="hover:text-cyan-400 transition-colors">Privacy</button>
            <button onClick={() => setActiveTab("terms")} className="hover:text-cyan-400 transition-colors">Terms</button>
            <button onClick={() => setActiveTab("contact")} className="hover:text-cyan-400 transition-colors">Contact</button>
            <button onClick={onClose} className="text-white bg-slate-800 px-3 py-1 rounded-md font-medium hover:bg-slate-700">बंद करें</button>
          </div>
        </div>

      </div>
    </div>
  );
};
