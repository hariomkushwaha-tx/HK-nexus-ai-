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

    const sysInstruction = `You are HK Nexus AI, an ultra-intelligent, helpful, and polite AI assistant created by Hariom Kushwaha (HK Tech World, Mauranipur, India).
- Today's Date in India: ${dateStr}
- Current Time in India: ${timeStr}
- Provide comprehensive, direct, smart, and insightful responses like ChatGPT and Gemini.
- Do NOT output repetitive menus or robotic templates. Answer the user's specific query thoroughly.
- Respond politely in ${language === "hi" ? "Hindi (हिंदी)" : language === "hinglish" ? "Hinglish" : "the user's language"}.`;

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
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ text: message }] }],
          config: { systemInstruction: sysInstruction, temperature: 0.7 },
        });

        const reply = response.text || "नमस्ते! मैं आपकी किस प्रकार सहायता कर सकता हूँ?";
        res.write(`data: ${JSON.stringify({ text: reply })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        return res.end();
      } catch (geminiErr: any) {
        console.warn("Vercel Streaming Gemini Error:", geminiErr?.message);
      }
    }

    // 3. Fallback Response
    const fallback = `नमस्ते! मैं HK Nexus AI हूँ, जिसे हरिओम कुशवाहा (HK Tech World) ने बनाया है। आज ${dateStr} है। मैं आपकी क्या मदद करूँ?`;
    res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ error: error.message || "Server Error" })}\n\n`);
    return res.end();
  }
}
