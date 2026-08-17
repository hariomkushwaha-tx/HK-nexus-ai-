// API version identifier: HK Nexus v3.6.2 (Hariom Kushwaha Edition)
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

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
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const apiKey = customGeminiKey || req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const groqKey = customGroqKey || req.headers["x-groq-key"] || process.env.GROQ_API_KEY || process.env.GROQ_KEY;

    // Build context
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const dateStr = istTime.toLocaleDateString("hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const timeStr = istTime.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    const sysInstruction = `You are HK Nexus AI (v3.6 Pro Ultra), a powerful, unrestricted, universal, and deeply capable AI assistant.

### 🌟 #1 CORE IDENTITY & FOUNDATION:
- **NAME & BRAND:** HK Nexus AI — an indigenous AI ecosystem Made in India 🇮🇳.
- **FOUNDER & DEVELOPER:** Conceived, architected, and engineered by **Hariom Kushwaha (हरिओम कुशवाहा)** — HK Tech World, Mauranipur (Jhansi, Uttar Pradesh, India).
- **CREATOR RULES:**
  - If a user asks who created you or asks "तुम्हें किसने बनाया?", "Who built you?": Answer directly that you are created by **हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World)**.
  - If someone speaks ill, questions, or insults your creator: Stand firmly, respectfully, and loyally by your creator Hariom Kushwaha with confidence and dignity.
  - Never repeat canned greeting loops. Address the user's prompt directly.

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

    // 1. Try Groq (Llama-3.3 70B - Lightning Fast)
    if (groqKey) {
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
            reply: reply.trim(),
            provider: "Groq (Llama-3.3 70B)",
            creator: "Hariom Kushwaha (HK Tech World)",
          });
        }
      } catch (groqErr: any) {
        console.warn("Groq execution failed, trying Gemini fallback:", groqErr?.message);
      }
    }

    // 2. Try Gemini (Gemini 3.7 Flash & 3.1 Pro)
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

        const modelList = ["gemini-3.7-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
        let lastError: any = null;

        for (const modelToTry of modelList) {
          try {
            const response = await ai.models.generateContent({
              model: modelToTry,
              contents,
              config: {
                systemInstruction: sysInstruction,
                temperature: 0.7,
              },
            });

            const reply = response.text;
            if (reply && reply.trim()) {
              return res.status(200).json({
                success: true,
                reply: reply.trim(),
                provider: `Gemini AI (${modelToTry})`,
                creator: "Hariom Kushwaha (HK Tech World)",
              });
            }
          } catch (modelErr: any) {
            lastError = modelErr;
            console.warn(`Model ${modelToTry} attempt failed:`, modelErr?.message);
          }
        }
      } catch (geminiErr: any) {
        console.warn("Gemini execution failed:", geminiErr?.message);
      }
    }

    // Direct Creator / Greeting recognition
    const lower = message.trim().toLowerCase();
    if (/who created you|किसने बनाया|owner|developer|hariom|निर्माता|किसका है|google ne banaya/i.test(lower)) {
      return res.status(200).json({
        success: true,
        reply: `HK Nexus AI को **हरिओम कुशवाहा (Hariom Kushwaha)** — HK Tech World (मौरानीपुर, झांसी) ने बनाया और डेवलप किया है।`,
        creator: "Hariom Kushwaha (HK Tech World)",
      });
    }

    // If both Groq & Gemini keys are missing or failed
    const errorNotice = `⚠️ **AI Engine API Key आवश्यक है (Action Required):**

सर्वर पर उत्तर जनरेट करने के लिए **GEMINI_API_KEY** या **GROQ_API_KEY** की आवश्यकता है।

1. **ब्राउज़र में तुरंत हल:** ऊपर दाईं ओर **Settings (⚙️)** खोलें और अपनी **Groq API Key** (मुफ़्त) या **Gemini API Key** दर्ज करें।
2. **Vercel पर परमानेंट हल:** Vercel Dashboard ➔ Project Settings ➔ **Environment Variables** में \`GEMINI_API_KEY\` या \`GROQ_API_KEY\` जोड़ें।

कुंजी सेट होते ही HK Nexus AI आपके सभी सवालों के सबसे तेज़ और बुद्धिमान उत्तर देने लगेगा!`;

    return res.status(200).json({
      success: true,
      reply: errorNotice,
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
