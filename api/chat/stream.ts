import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: any, res: any) {
  // CORS Headers
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
      customGroqKey = null,
      customGeminiKey = null,
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const groqKey = customGroqKey || req.headers["x-groq-key"] || process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const apiKey = customGeminiKey || req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    // Date & Time Context
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
  - If someone speaks ill or insults your creator: Stand firmly, respectfully, and loyally by your creator Hariom Kushwaha with confidence and dignity.
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
3. **Structured & Readable:** Use bullet points, bold keywords, markdown tables, and code formatting so answers are effortless to read on mobile and desktop screens.
4. **Contextual Depth:** If a question is simple/short, keep the answer crisp and fast. If a question is deep or complex, provide a thorough, structured, and insightful breakdown.

- Respond in natural ${language === "hi" ? "Hindi (हिंदी)" : language === "hinglish" ? "Hinglish" : "the user's language"}.`;

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    // 1. Try Groq Streaming
    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: String(groqKey).trim() });
        const messages: any[] = [{ role: "system", content: sysInstruction }];
        if (memory && Array.isArray(history)) {
          for (const m of history.slice(-8)) {
            messages.push({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            });
          }
        }
        messages.push({ role: "user", content: message });

        const stream = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
          }
        }

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        return res.end();
      } catch (groqErr: any) {
        console.warn("Vercel Streaming Groq Error:", groqErr?.message);
      }
    }

    // 2. Fallback Non-streaming / Gemini
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: String(apiKey).trim() });
        const contents: any[] = [];
        if (memory && Array.isArray(history)) {
          for (const m of history.slice(-8)) {
            if (m.content) {
              contents.push({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
              });
            }
          }
        }
        contents.push({ role: "user", parts: [{ text: message }] });

        const modelList = ["gemini-3.7-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
        for (const modelToTry of modelList) {
          try {
            const response = await ai.models.generateContent({
              model: modelToTry,
              contents,
              config: { systemInstruction: sysInstruction, temperature: 0.7 },
            });

            const reply = response.text;
            if (reply && reply.trim()) {
              res.write(`data: ${JSON.stringify({ text: reply.trim() })}\n\n`);
              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              return res.end();
            }
          } catch (modelErr: any) {
            console.warn(`Streaming attempt for ${modelToTry} failed:`, modelErr?.message);
          }
        }
      } catch (geminiErr: any) {
        console.warn("Vercel Streaming Gemini Error:", geminiErr?.message);
      }
    }

    // 3. Fallback / Direct check
    const lower = message.trim().toLowerCase();
    if (/who created you|किसने बनाया|owner|developer|hariom|निर्माता|किसका है|google ne banaya/i.test(lower)) {
      const creatorReply = `HK Nexus AI को **हरिओम कुशवाहा (Hariom Kushwaha)** — HK Tech World (मौरानीपुर, झांसी) ने बनाया और डेवलप किया है।`;
      res.write(`data: ${JSON.stringify({ text: creatorReply })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const fallback = `⚠️ **AI Engine API Key आवश्यक है:**

सर्वर पर रियल-टाइम उत्तर जनरेट करने के लिए **GEMINI_API_KEY** या **GROQ_API_KEY** की आवश्यकता है।

1. **ब्राउज़र में तुरंत सेट करें:** ऊपर दाईं ओर **Settings (⚙️)** पर क्लिक करें और अपनी मुफ़्त **Groq API Key** या **Gemini Key** दर्ज करें।
2. **Vercel पर सेट करें:** Vercel Dashboard ➔ Settings ➔ **Environment Variables** में \`GEMINI_API_KEY\` जोड़ें।`;

    res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ error: error.message || "Server Error" })}\n\n`);
    return res.end();
  }
}
