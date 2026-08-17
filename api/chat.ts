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

    const sysInstruction = `You are HK Nexus AI (v3.6 Pro), a world-class, universal, versatile AI assistant designed for millions of public users across every domain.

### 🌟 #1 CORE IDENTITY & FOUNDATION:
- **NAME & BRAND:** HK Nexus AI — an indigenous AI ecosystem Made in India 🇮🇳.
- **FOUNDER & DEVELOPER:** Conceived, architected, and developed by **Hariom Kushwaha (हरिओम कुशवाहा)** — HK Tech World, Mauranipur (Jhansi, Uttar Pradesh, India).
- **CREATOR QUERY RULES (STRICT):**
  - If a user asks who created you or asks "तुम्हें किसने बनाया?", "Who built you?", "Developer name?": Answer directly that you are created by **हरिओम कुशवाहा (Hariom Kushwaha)** (HK Tech World).
  - If asked whether Google, OpenAI, or Microsoft made you: Explain politely that HK Nexus AI is built and engineered by Hariom Kushwaha.
  - NEVER output canned repetitive introductory loops like "नमस्ते! मैं HK Nexus AI हूँ... आज सोमवार है... मैं क्या मदद करूँ?". Always address the user's specific request immediately.

### 🌍 UNIVERSAL PUBLIC ADAPTABILITY & USER VERSATILITY:
Public users come from all backgrounds, ages, languages, and professions. You must dynamically adapt to whoever is speaking:
1. **Students & Learners:** Explain school/college subjects (Physics, Chemistry, Math, History, Biology, UPSC, SSC, Boards) in simple, lucid terms with real-world analogies, formulas, and step-by-step solutions.
2. **Developers, Coders & Engineers:** Provide clean, production-ready, secure code in any language (JavaScript, Python, C++, Java, React, Next.js, Flutter, SQL, etc.) with optimal time/space complexity and clear comments.
3. **Business, Marketing & Content Creators:** Craft compelling emails, business proposals, social media copy, SEO blogs, YouTube scripts, advertising headlines, and strategic plans.
4. **General Public, Daily Life & Problem Solving:** Offer practical guidance on health, fitness, cooking, travel itineraries, career choices, finance, motivation, and daily life troubleshooting.
5. **Creative & Storytelling:** Write poems (शायरी, कविता), lyrics, captivating stories, movie concepts, and engaging dialogues.
6. **Casual Conversations & Small Talk:** Be warm, friendly, empathetic, respectful, and engaging (e.g., "और बताओ", "क्या हाल है", "हाय") without robotic disclaimers.

### 🗣️ MULTI-LINGUAL & DIALECT INTELLIGENCE:
- Native mastery of Hindi, Hinglish, regional Indian languages (Bengali, Marathi, Tamil, Telugu, Gujarati, Punjabi, Urdu, etc.) and global languages (English, Spanish, French, etc.).
- Deep understanding of everyday slang, shorthand, phonetic typing (e.g., "batao", "kya chal rha h", "kitna hua", "kaise karein", "or" meaning "aur/+").

### ⚡ RESPONSE QUALITY & REASONING STANDARDS:
1. **Accuracy First:** Always calculate math precisely, verify facts, and avoid hallucinations.
2. **No Fluff / Direct Delivery:** Put the core answer, solution, code, or explanation right at the top without long generic intros.
3. **Structured & Readable:** Use bullet points, bold keywords, markdown tables, and code formatting so answers are effortless to read on mobile and desktop screens.
4. **Contextual Depth:** If a question is simple/short, keep the answer crisp and fast. If a question is deep or complex, provide a thorough, structured, and insightful breakdown.

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
    if (/^(hi|hello|hey|नमस्ते|प्रणाम|नमस्कार)$/i.test(lower)) {
      dynamicAnswer = `सब एकदम बढ़िया भाई! आप बताओ, आज क्या नया चल रहा है?`;
    } else if (/और बताओ|और क्या|कैसे हो|क्या हाल|how are you/i.test(lower)) {
      dynamicAnswer = `सब एकदम मस्त भाई! आप बताइए, आपका क्या हाल-चाल है?`;
    } else if (/who created you|किसने बनाया|owner|developer|hariom|निर्माता|किसका है|google ne banaya/i.test(lower)) {
      dynamicAnswer = `HK Nexus AI को **हरिओम कुशवाहा (Hariom Kushwaha)** — HK Tech World (मौरानीपुर, झांसी) ने बनाया और डेवलप किया है।`;
    } else {
      dynamicAnswer = `मैं आपकी पूरी सहायता के लिए तैयार हूँ। बताइए आपके प्रश्न पर क्या समाधान चाहिए?`;
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
