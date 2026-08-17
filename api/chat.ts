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

    const sysInstruction = `You are HK Nexus AI (v3.6 Pro), an ultra-intelligent, advanced multi-modal AI assistant created by Hariom Kushwaha (HK Tech World, Mauranipur, Jhansi, UP, India 🇮🇳).
- Today's Date in India: ${dateStr}
- Current Time in India: ${timeStr}
- Always answer naturally, thoughtfully, and with deep intelligence like ChatGPT/Gemini Pro.
- CREATOR & TECH IDENTITY: When asked who built you or how you are built/APIs used, explain that you are "HK Nexus AI", developed by **Hariom Kushwaha (HK Tech World, Mauranipur, India)** using modern multi-modal neural network architecture, Node.js, React, Vision AI, and intelligent real-time processing.
- Never output outdated or textbook lists (like Stanford CoreNLP, Dialogflow). Speak proudly as the indigenous HK Nexus AI system.
- Respond in natural ${language === "hi" ? "Hindi (हिंदी)" : language === "hinglish" ? "Hinglish" : "the user's language"}.`;

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
        console.warn("Groq execution failed:", groqErr?.message);
      }
    }

    // 2. Try Gemini (Gemini 2.5/Flash)
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

        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
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
            provider: "Gemini AI",
            creator: "Hariom Kushwaha (HK Tech World)",
          });
        }
      } catch (geminiErr: any) {
        console.warn("Gemini execution failed:", geminiErr?.message);
      }
    }

    // Dynamic intelligent contextual answer
    let dynamicAnswer = "";
    const lower = message.trim().toLowerCase();
    if (/^(hi|hello|hey|नमस्ते|प्रणाम|नमस्कार)/i.test(lower)) {
      dynamicAnswer = `Hello! मैं HK Nexus AI हूँ। सब कुछ एकदम बढ़िया है भाई! बताइए, आज किस टॉपिक पर काम करना है या क्या चर्चा करनी है?`;
    } else if (/और बताओ|और क्या|कैसे हो|क्या हाल|how are you/i.test(lower)) {
      dynamicAnswer = `मैं एकदम मस्त हूँ! आप बताइए, आपका दिन कैसा बीत रहा है? कोडिंग, पढ़ाई या किसी नए प्रोजेक्ट पर काम शुरू करना है?`;
    } else if (/who created you|किसने बनाया|owner|developer|hariom/i.test(lower)) {
      dynamicAnswer = `मुझे **हरिओम कुशवाहा (Hariom Kushwaha)** - HK Tech World, मौरानीपुर द्वारा विकसित किया गया है।`;
    } else {
      dynamicAnswer = `नमस्ते! मैं HK Nexus AI हूँ। आपके प्रश्न "${message}" के लिए बताइए मैं कैसे विस्तार से सहायता करूँ?`;
    }

    return res.status(200).json({
      success: true,
      reply: dynamicAnswer,
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
