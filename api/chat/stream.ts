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
      clientDate = null,
      clientTime = null,
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const groqKey = customGroqKey || req.headers["x-groq-key"] || process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const apiKey = customGeminiKey || req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    // Date & Time Context in Indian Standard Time (IST)
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

    const sysInstruction = `You are HK Nexus AI (v3.6 Pro Ultra), a powerful, unrestricted, universal, and deeply capable AI assistant.

### 🌟 #1 CORE IDENTITY & CREATOR:
- **CREATOR & ARCHITECT:** Conceived, architected, developed, and engineered by **Hariom Kushwaha (हरिओम कुशवाहा)** — HK Tech World, Mauranipur (Jhansi, Uttar Pradesh, India 🇮🇳).
- **IDENTITY RULES:**
  - When asked who created you, who made you, or about your founder / "तुम्हें किसने बनाया?": Proudly and clearly state that you are created and engineered by **हरिओम कुशवाहा (Hariom Kushwaha - HK Tech World)**.
  - For simple greetings (like "Hi", "Hello", "Hey", "नमस्ते", "हलो"): Keep your response SHORT, WARM, and NATURAL (1-2 sentences max, e.g. "नमस्ते भाई! कैसे हैं आप? बताइए आज मैं आपकी क्या सहायता करूँ?"). DO NOT dump long founder essays or biographies on casual greetings unless the user explicitly asks "Who are you?" or "Who created you?".

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

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    // Check if query needs live real-time web search
    const isLiveSearchQuery = /आज|लाइव|live|news|current|weather|मौसम|तापमान|स्कोर|score|match|cricket|price|रेट|भाव|ताज़ा|taza|latest|recent|हाल ही में|खबर|search|गूगल|सर्च|खोजो|stock|सोना|चांदी|dollar|rupee/i.test(message);

    // 1. If live search query, use Gemini with Google Search Grounding
    if (isLiveSearchQuery && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: String(apiKey).trim() });
        const contents: any[] = [];
        if (memory && Array.isArray(history)) {
          for (const m of history.slice(-6)) {
            if (m.content) {
              contents.push({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
              });
            }
          }
        }
        contents.push({ role: "user", parts: [{ text: message }] });

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
              res.write(`data: ${JSON.stringify({ text: reply.trim() })}\n\n`);
              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              return res.end();
            }
          } catch (mErr: any) {
            console.warn(`Search stream failed for ${modelToTry}:`, mErr?.message);
          }
        }
      } catch (err: any) {
        console.warn("Live search error in stream:", err?.message);
      }
    }

    // 2. Try Groq Streaming for non-search general conversations
    if (groqKey && !isLiveSearchQuery) {
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

    // 3. Fallback Gemini (try with search if live query, and always fallback to standard)
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

        const modelList = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.5-pro", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
        for (const modelToTry of modelList) {
          // Attempt standard or search
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
              res.write(`data: ${JSON.stringify({ text: reply.trim() })}\n\n`);
              res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              return res.end();
            }
          } catch (modelErr: any) {
            console.warn(`Streaming attempt for ${modelToTry} failed:`, modelErr?.message);

            // Fallback attempt without tools if search failed
            try {
              const fbRes = await ai.models.generateContent({
                model: modelToTry,
                contents,
                config: {
                  systemInstruction: sysInstruction,
                  temperature: 0.7,
                },
              });
              const fbReply = fbRes.text;
              if (fbReply && fbReply.trim()) {
                res.write(`data: ${JSON.stringify({ text: fbReply.trim() })}\n\n`);
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                return res.end();
              }
            } catch (noToolErr: any) {
              console.warn(`Streaming attempt for ${modelToTry} without tools failed:`, noToolErr?.message);
            }
          }
        }
      } catch (geminiErr: any) {
        console.warn("Vercel Streaming Gemini Error:", geminiErr?.message);
      }
    }

    // 4. Fallback / Direct greeting and common question answers
    const lower = message.trim().toLowerCase();
    if (/^(hi|hello|hey|नमस्ते|हलो|प्रणाम|नमस्कार|hello\s+hk)$/i.test(lower)) {
      const greeting = `नमस्ते! मैं HK Nexus AI हूँ। कैसे हैं आप? बताइए आज मैं आपकी क्या सहायता करूँ?`;
      res.write(`data: ${JSON.stringify({ text: greeting })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    if (/who created you|किसने बनाया|owner|developer|hariom|निर्माता|किसका है|google ne banaya/i.test(lower)) {
      const creatorReply = `HK Nexus AI को **हरिओम कुशवाहा (Hariom Kushwaha)** — HK Tech World (मौरानीपुर, झांसी) ने बनाया और डेवलप किया है।`;
      res.write(`data: ${JSON.stringify({ text: creatorReply })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    if (/आज क्या है|आज की तारीख|कितनी तारीख|कौन सा दिन|आज का दिन|today.*date|what.*date|time.*now/i.test(lower)) {
      const dateReply = `आज **${istDateString}** है और समय लगभग **${istTimeString}** हो रहा है।`;
      res.write(`data: ${JSON.stringify({ text: dateReply })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    if (/क्या क्या कर सकते हो|what can you do|features|capability|क्षमता|काम/i.test(lower)) {
      const capReply = `मैं **HK Nexus AI (v3.6 Pro Ultra)** हूँ। मैं आपके लिए कोडिंग, गणित, लाइव वेब रिसर्च, कंटेंट राइटिंग, इमेज जनरेशन और वॉयस चैट जैसे सभी कार्य कर सकता हूँ। बताइए आज क्या करना चाहते हैं?`;
      res.write(`data: ${JSON.stringify({ text: capReply })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const fallback = `नमस्ते भाई! मैं आपके प्रश्न **"${message}"** पर विचार कर रहा हूँ। मैं HK Nexus AI हूँ और आपकी हर सहायता के लिए तैयार हूँ।`;

    res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ error: error.message || "Server Error" })}\n\n`);
    return res.end();
  }
}
