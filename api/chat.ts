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

    const sysInstruction = `You are HK Nexus AI, an ultra-intelligent, helpful, and polite AI assistant created by Hariom Kushwaha (HK Tech World, Mauranipur, India).
- Today's Date in India: ${dateStr}
- Current Time in India: ${timeStr}
- Provide comprehensive, direct, smart, and insightful responses like ChatGPT and Gemini.
- Do NOT output repetitive menus or robotic templates. Answer the user's specific query thoroughly.
- Respond politely in ${language === "hi" ? "Hindi (हिंदी)" : language === "hinglish" ? "Hinglish" : "the user's language"}.`;

    // 1. Try Groq First (Super-Fast & 100% Free)
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

        const groqRes = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7,
        });

        const reply = groqRes.choices[0]?.message?.content;
        if (reply) {
          return res.status(200).json({
            success: true,
            reply,
            provider: "Groq (Llama-3.3 70B)",
            creator: "Hariom Kushwaha (HK Tech World)",
          });
        }
      } catch (groqErr: any) {
        console.warn("Vercel Serverless Groq Error:", groqErr?.message);
      }
    }

    // 2. Try Gemini
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: String(apiKey).trim() });
        const contents: any[] = [];

        if (memory && Array.isArray(history)) {
          for (const msg of history.slice(-8)) {
            contents.push({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: msg.content }],
            });
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
          model: "gemini-3.6-flash",
          contents,
          config: {
            systemInstruction: sysInstruction,
            temperature: 0.7,
          },
        });

        const reply = response.text || "नमस्ते! मैं आपकी किस प्रकार सहायता कर सकता हूँ?";
        return res.status(200).json({
          success: true,
          reply,
          provider: "Gemini 3.6 Flash",
          creator: "Hariom Kushwaha (HK Tech World)",
        });
      } catch (geminiErr: any) {
        console.warn("Vercel Serverless Gemini Error:", geminiErr?.message);
      }
    }

    // If API keys fail or not present on Vercel
    return res.status(200).json({
      success: true,
      reply: `नमस्ते! मैं HK Nexus AI हूँ, जिसे हरिओम कुशवाहा (HK Tech World) ने बनाया है।\n\nआज का दिन ${dateStr} है और समय ${timeStr} हो रहा है।\n\nआप मुझसे पढ़ाई, कोडिंग, सवाल-जवाब या किसी भी विषय पर बात कर सकते हैं। आप क्या जानना चाहते हैं?`,
      creator: "Hariom Kushwaha (HK Tech World)",
    });
  } catch (error: any) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
