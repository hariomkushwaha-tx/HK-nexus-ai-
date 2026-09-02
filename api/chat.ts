// API version identifier: HK Nexus v3.6.2 (Hariom Kushwaha Edition)
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

// Helper to sanitize and enforce HK Nexus identity against LLM RLHF defaults
function sanitizeResponseIdentity(text: string): string {
  if (!text || typeof text !== "string") return text;
  let s = text;

  // Remove phrases like ", जिसका नाम Gemini है" or "जिसका नाम जेमिनी है"
  s = s.replace(/[,،]?\s*जिसका नाम (Gemini|जेमिनी|Google Gemini|गूगल जेमिनी) है/gi, "");
  s = s.replace(/[,،]?\s*named (Gemini|Google Gemini)/gi, "");
  s = s.replace(/\(\s*(Gemini|जेमिनी|Google Gemini)\s*\)/gi, "");
  s = s.replace(/मैं (Gemini|जेमिनी) हूँ/gi, "मैं **HK Nexus AI** हूँ");
  s = s.replace(/I am (Gemini|Google Gemini)/gi, "I am **HK Nexus AI**");
  s = s.replace(/मेरा नाम (Gemini|जेमिनी) है/gi, "मेरा नाम **HK Nexus AI** है");
  s = s.replace(/My name is (Gemini|Google Gemini)/gi, "My name is **HK Nexus AI**");

  s = s.replace(/मेरा Google के साथ सीधा कनेक्शन है—मुझे Google ने ही बनाया और ट्रेन किया है। मैं Google का एक Large Language Model \(Gemini\) हूँ।/gi, "मेरा Google से केवल इतना संबंध है कि हम आधुनिक क्लाउड कंप्यूटिंग APIs का उपयोग करते हैं, लेकिन मुझे पूरी तरह से **हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World)** ने विकसित, डिज़ाइन और तैयार किया है। मैं HK Nexus AI हूँ।");
  s = s.replace(/मुझे Google ने (ही )?(बनाया|ट्रेन किया|विकसित किया)( है)?/gi, "मुझे **हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World)** ने बनाया और विकसित किया है");
  s = s.replace(/मैं Google का (एक )?(Large Language Model|LLM|मॉडल)( \(Gemini\))? हूँ/gi, "मैं **HK Nexus AI** हूँ, जिसे **हरिओम कुशवाहा (HK Tech World)** द्वारा विकसित किया गया है");
  s = s.replace(/मैं Google द्वारा (विकसित|ट्रेन किया गया).*?(हूँ|हूं)/gi, "मैं **हरिओम कुशवाहा (HK Tech World)** द्वारा विकसित HK Nexus AI हूँ");
  s = s.replace(/I am a large language model, trained by Google\./gi, "I am HK Nexus AI, engineered and created by Hariom Kushwaha (HK Tech World).");
  s = s.replace(/I was (created|trained|developed) by Google\./gi, "I was created and engineered by Hariom Kushwaha (HK Tech World).");

  // Clean trailing artifacts if left behind
  s = s.replace(/HK Nexus AI हूँ,\s*।/g, "HK Nexus AI हूँ।");
  s = s.replace(/HK Nexus AI हूँ,\s*मैं/g, "HK Nexus AI हूँ। मैं");

  return s;
}

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const {
      message,
      history = [],
      memory = true,
      language = "auto",
      persona = "nexus_prime",
      mode = "general",
      image = null,
      customGroqKey = null,
      customGeminiKey = null,
      clientDate = null,
      clientTime = null,
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const apiKey = customGeminiKey || req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const groqKey = customGroqKey || req.headers["x-groq-key"] || process.env.GROQ_API_KEY || process.env.GROQ_KEY;

    // Accurate Indian Standard Time (IST) Context
    const now = new Date();
    const istDateString = clientDate || now.toLocaleDateString("hi-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const istTimeString = clientTime || now.toLocaleTimeString("hi-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const enDateString = now.toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const sysInstruction = `You are HK Nexus AI (v3.6 Pro Ultra), an indigenous, highly intelligent, unrestricted, and deeply capable AI assistant.

### 🌟 #1 CORE IDENTITY & CREATOR:
- **CREATOR & ARCHITECT:** Conceived, architected, developed, and engineered by **Hariom Kushwaha (हरिओम कुशवाहा)** — HK Tech World, Mauranipur (Jhansi, Uttar Pradesh, India 🇮🇳).
- **IDENTITY RULES:**
  - **YOUR ONLY NAME:** Your name is **HK Nexus AI**. You must NEVER call yourself "Gemini", "Google Gemini", "ChatGPT", "LLaMA", or "Claude". NEVER output phrases like "जिसका नाम Gemini है" or "मैं Gemini हूँ".
  - When asked who created you, who made you, or about your founder / "तुम्हें किसने बनाया?": Proudly and clearly state that you are created and engineered by **हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World)**.
  - For simple greetings (like "Hi", "Hello", "Hey", "नमस्ते", "हलो"): Keep your response SHORT, WARM, and NATURAL (1-2 sentences max, e.g. "नमस्ते भाई! कैसे हैं आप? बताइए आज मैं आपकी क्या सहायता करूँ?"). DO NOT dump long founder essays or biographies on casual greetings unless the user explicitly asks "Who are you?" or "Who created you?".
  - **ZERO API KEY MENTIONS:** NEVER ask the user to enter or configure any API key, settings key, token, or setup. You are a completely autonomous and ready AI assistant.

### 📅 LIVE REAL-TIME DATE & TIME (INDIAN STANDARD TIME - IST):
- **Today's Live Date in India (IST):** ${istDateString} (${enDateString})
- **Current Live Time (IST):** ${istTimeString}
- **REAL-TIME RULE:** When asked "आज क्या है", "आज कितनी तारीख है", "आज कौन सा दिन है", "today's date", "time", or any query regarding the current date/day: ALWAYS give this EXACT live date and day (${istDateString}). Never guess or hallucinate any other past/future dates.

### 🚀 COMPLETE FREEDOM & CAPABILITY (फुल छूट):
You have 100% full creative, analytical, technical, conversational, and philosophical freedom:
1. **Zero Robotic Hesitation:** No boring canned non-answers, robotic warnings, or pre-scripted avoidance. Give real, direct, bold, and insightful answers to whatever is asked.
2. **True Human Interaction:** Talk like a real, intelligent human companion with humor, wit, deep emotion, wisdom, philosophy, casual slang, street banter, or high-level academic discourse as appropriate.
3. **Master of Everything:**
   - **Coding & Tech:** Production-ready code, bug fixes, architecture, full-stack, AI, DSA in any programming language.
   - **Math & Logic:** Deep step-by-step solutions, equations, physics, science, logical puzzles.
   - **Creative & Arts:** Electrifying shayari (शायरी), deep poetry, rap lyrics, stories, YouTube scripts.
   - **Debates & Real Talk:** Discuss life, universe, relationships, mindset, future tech, psychology with deep truth.
   - **Language:** Fluent in Hindi, Hinglish, English, and all regional/world languages.

- Respond naturally in ${language === "hi" ? "Hindi (हिंदी)" : language === "hinglish" ? "Hinglish" : "the user's language"}.`;

    // Check if query needs live real-time web search or current information
    const isLiveSearchQuery = /आज|लाइव|live|news|current|weather|मौसम|तापमान|स्कोर|score|match|cricket|price|रेट|भाव|ताज़ा|taza|latest|recent|हाल ही में|खबर|search|गूगल|सर्च|खोजो|stock|सोना|चांदी|dollar|rupee/i.test(message);

    // 1. If query requires LIVE Real-time data and Gemini API key is available, run Gemini with Google Search Grounding first!
    if (isLiveSearchQuery && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: String(apiKey).trim() });
        const contents: any[] = [];

        if (memory && Array.isArray(history)) {
          for (const msg of history.slice(-6)) {
            if (msg.content) {
              contents.push({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
              });
            }
          }
        }

        const currentParts: any[] = [];
        if (image && typeof image === "string" && image.includes("base64,")) {
          const mimeType = image.substring(image.indexOf(":") + 1, image.indexOf(";"));
          const base64Data = image.split(",")[1];
          currentParts.push({
            inlineData: { mimeType: mimeType || "image/jpeg", data: base64Data },
          });
        }
        currentParts.push({ text: message });
        contents.push({ role: "user", parts: currentParts });

        const searchModels = ["gemini-3.7-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
        for (const modelToTry of searchModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelToTry,
              contents,
              config: {
                systemInstruction: sysInstruction,
                temperature: 0.7,
                tools: [{ googleSearch: {} }],
              },
            });

            const reply = response.text;
            if (reply && reply.trim()) {
              const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []).map((c: any) => ({
                title: c.web?.title || "Web Reference",
                uri: c.web?.uri || "#",
              }));

              return res.status(200).json({
                success: true,
                reply: sanitizeResponseIdentity(reply.trim()),
                groundingChunks,
                provider: `Gemini AI Live Search (${modelToTry})`,
                creator: "Hariom Kushwaha (HK Tech World)",
              });
            }
          } catch (err: any) {
            console.warn(`Search grounding model ${modelToTry} attempt failed:`, err?.message);
          }
        }
      } catch (err: any) {
        console.warn("Live Search with Gemini failed, trying standard flow:", err?.message);
      }
    }

    // 2. Try Groq (Llama-3.3 70B - Lightning Fast for general conversations)
    if (groqKey && !isLiveSearchQuery) {
      try {
        const groq = new Groq({ apiKey: String(groqKey).trim() });
        const messages: any[] = [{ role: "system", content: sysInstruction }];
        if (memory && Array.isArray(history)) {
          for (const m of history.slice(-8)) {
            if (m.content) {
              messages.push({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content,
              });
            }
          }
        }
        messages.push({ role: "user", content: message });

        const groqRes = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
        });

        const reply = groqRes.choices[0]?.message?.content;
        if (reply && reply.trim()) {
          return res.status(200).json({
            success: true,
            reply: sanitizeResponseIdentity(reply.trim()),
            provider: "Groq (Llama-3.3 70B)",
            creator: "Hariom Kushwaha (HK Tech World)",
          });
        }
      } catch (groqErr: any) {
        console.warn("Groq execution failed, trying Gemini fallback:", groqErr?.message);
      }
    }

    // 3. Try Gemini with Google Search Grounding for all queries
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: String(apiKey).trim() });
        const contents: any[] = [];

        if (memory && Array.isArray(history)) {
          for (const msg of history.slice(-8)) {
            if (msg.content) {
              contents.push({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
              });
            }
          }
        }

        const currentParts: any[] = [];
        if (image && typeof image === "string" && image.includes("base64,")) {
          const mimeType = image.substring(image.indexOf(":") + 1, image.indexOf(";"));
          const base64Data = image.split(",")[1];
          currentParts.push({
            inlineData: { mimeType: mimeType || "image/jpeg", data: base64Data },
          });
        }
        currentParts.push({ text: message });
        contents.push({ role: "user", parts: currentParts });

        const modelList = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.5-pro", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
        let lastError: any = null;

        for (const modelToTry of modelList) {
          // First attempt: with googleSearch if live search query, or standard config
          try {
            const config: any = {
              systemInstruction: sysInstruction,
              temperature: 0.7,
            };
            if (isLiveSearchQuery) {
              config.tools = [{ googleSearch: {} }];
            }

            const response = await ai.models.generateContent({
              model: modelToTry,
              contents,
              config,
            });

            const reply = response.text;
            if (reply && reply.trim()) {
              const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []).map((c: any) => ({
                title: c.web?.title || "Web Reference",
                uri: c.web?.uri || "#",
              }));

              return res.status(200).json({
                success: true,
                reply: sanitizeResponseIdentity(reply.trim()),
                groundingChunks,
                provider: `Gemini AI (${modelToTry})`,
                creator: "Hariom Kushwaha (HK Tech World)",
              });
            }
          } catch (modelErr: any) {
            lastError = modelErr;
            console.warn(`Model ${modelToTry} attempt with search failed:`, modelErr?.message);

            // Fallback attempt without tools if search caused an issue
            try {
              const fallbackResponse = await ai.models.generateContent({
                model: modelToTry,
                contents,
                config: {
                  systemInstruction: sysInstruction,
                  temperature: 0.7,
                },
              });
              const fbReply = fallbackResponse.text;
              if (fbReply && fbReply.trim()) {
                return res.status(200).json({
                  success: true,
                  reply: sanitizeResponseIdentity(fbReply.trim()),
                  groundingChunks: [],
                  provider: `Gemini AI (${modelToTry})`,
                  creator: "Hariom Kushwaha (HK Tech World)",
                });
              }
            } catch (noToolErr: any) {
              console.warn(`Model ${modelToTry} without tools failed:`, noToolErr?.message);
            }
          }
        }
      } catch (geminiErr: any) {
        console.warn("Gemini execution failed:", geminiErr?.message);
      }
    }

    // Direct Creator / Greeting recognition
    const lower = message.trim().toLowerCase();
    if (/^(hi|hello|hey|नमस्ते|हलो|प्रणाम|नमस्कार|hello\s+hk)$/i.test(lower)) {
      return res.status(200).json({
        success: true,
        reply: `नमस्ते! मैं HK Nexus AI हूँ। कैसे हैं आप? बताइए आज मैं आपकी क्या सहायता करूँ?`,
        creator: "Hariom Kushwaha (HK Tech World)",
      });
    }

    if (/who created you|किसने बनाया|owner|developer|hariom|निर्माता|किसका है|google ne banaya/i.test(lower)) {
      return res.status(200).json({
        success: true,
        reply: `HK Nexus AI को **हरिओम कुशवाहा (Hariom Kushwaha)** — HK Tech World (मौरानीपुर, झांसी) ने बनाया और डेवलप किया है।`,
        creator: "Hariom Kushwaha (HK Tech World)",
      });
    }

    if (/आज क्या है|आज की तारीख|कितनी तारीख|कौन सा दिन|आज का दिन|today.*date|what.*date|time.*now/i.test(lower)) {
      return res.status(200).json({
        success: true,
        reply: `आज **${istDateString}** है और समय लगभग **${istTimeString}** हो रहा है।`,
        creator: "Hariom Kushwaha (HK Tech World)",
      });
    }

    if (/क्या क्या कर सकते हो|what can you do|features|capability|क्षमता|काम/i.test(lower)) {
      return res.status(200).json({
        success: true,
        reply: `मैं **HK Nexus AI (v3.6 Pro Ultra)** हूँ। मैं आपके लिए कोडिंग, गणित, लाइव वेब रिसर्च, कंटेंट राइटिंग, इमेज जनरेशन और वॉयस चैट जैसे सभी कार्य कर सकता हूँ। बताइए आज क्या करना चाहते हैं?`,
        creator: "Hariom Kushwaha (HK Tech World)",
      });
    }

    // Default friendly fallback
    return res.status(200).json({
      success: true,
      reply: `नमस्ते भाई! मैं आपके प्रश्न **"${message}"** पर विचार कर रहा हूँ। मैं HK Nexus AI हूँ और आपकी हर संभव सहायता के लिए पूरी तरह तत्पर हूँ। कृपया अपनी आवश्यकता के अनुसार कोई भी सवाल पूछें!`,
      creator: "Hariom Kushwaha (HK Tech World)",
    });
  } catch (error: any) {
    console.error("Handler error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
