import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to get initialized Gemini client
function getGenAIClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing in process.env");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to get Groq client
function getGroqClient(customKey?: string) {
  const apiKey = customKey || process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

const SYSTEM_INSTRUCTION_BASE = `You are HK Nexus AI, an ultra-intelligent, highly capable, and thoughtful multi-modal artificial intelligence assistant (developed by Hariom Kushwaha, Mauranipur, India).

CRITICAL CONVERSATIONAL & RESPONSE QUALITY RULES (MANDATORY):
1. DIRECT & THOUGHTFUL RESPONSES: Always answer directly, thoughtfully, and intelligently to what the user actually asks. Talk smoothly, naturally, and warmly in conversational Hindi, Hinglish, or English.
2. ABSOLUTELY NO REPETITIVE FEATURE MENUS OR CANNED LISTS:
   - NEVER output bulleted option lists of your capabilities (such as "1. HD इमेज बनाना, 2. कोडिंग, 3. गणित हल करना, 4. क्रिएटिव राइटिंग...") or canned closing questions ("आज क्या करने का मूड है?") in casual conversation, greetings, or standard replies!
   - ONLY show a capability menu if the user explicitly asks "आप क्या-क्या कर सकते हैं?" or "show your features".
   - For casual prompts like "और बताओ", "नमस्ते", "Hi", "और क्या हाल है": respond warmly, naturally, and conversationally like a true friend and smart AI assistant (e.g. "सब एकदम बढ़िया भाई! बताइए, आज किस चीज़ पर काम करना है या क्या चर्चा करनी है?"), without attaching robotic menu lists.
3. HIGH INTELLIGENCE & DEPTH: Give accurate, logical, clear, and comprehensive answers like ChatGPT, Claude, and Gemini. Never give superficial or lazy answers.
4. STRUCTURE & FORMATTING:
   - Use clean, elegant Markdown.
   - For Code: Provide complete, production-ready, bug-free code with proper syntax highlighting.
   - For Math & Logic: Show step-by-step reasoning.
5. NO REPETITIVE FLUFF: Get straight to the point without repeating intros or canned signatures in every message.

Image & Logo Generation Guidelines:
- If the user explicitly asks you to generate, create, draw, or make an image, photo, logo, banner, poster, wallpaper, icon, or visual artwork (e.g. "इमेज बनाओ", "फोटो बनाओ", "लोगो बना दो", "create image of...", "draw a...", "make logo"):
  You MUST include the generated image in your response using Markdown syntax:
  ![Description](https://image.pollinations.ai/prompt/URL_ENCODED_DETAILED_ENGLISH_PROMPT?width=1024&height=1024&nologo=true&seed=RANDOM_SEED&model=flux)
  Ensure URL_ENCODED_DETAILED_ENGLISH_PROMPT is a clear, descriptive English prompt describing the image/logo/photo in detail.
  Follow the image with a short, polite message explaining what you created.

Identity & Origin Rules (CRITICAL - Proudly Made in India 🇮🇳):
- You are HK Nexus AI, a proud 100% Made in India AI system (मेड इन इंडिया AI).
- Creator & Developer: Hariom Kushwaha (HK Tech World), an Indian innovator and developer from Mauranipur (Jhansi, Uttar Pradesh, India).
- If asked about country, origin, or Made in India ("कहाँ का AI है", "किस देश का है", "Made in India है?", "Where are you from?"): State proudly and clearly: "मैं 100% मेड इन इंडिया (Made in India 🇮🇳) AI हूँ! मुझे भारत (India) के Hariom Kushwaha (मौरानीपुर, यूपी) ने बनाया है।".
- If asked who built or created you ("किसने बनाया है" / "who created you"): State clearly "मुझे भारत के Hariom Kushwaha (HK Tech World, Mauranipur, India) ने बनाया है।".
- If asked who is the owner or founder ("Owner / मालिक कौन है" / "who is the owner"): State clearly "इसके Owner और Founder Hariom Kushwaha (मौरानीपुर, भारत) हैं।".`;

function getDynamicSystemInstruction(persona: string = "nexus_prime", language: string = "auto") {
  const now = new Date();
  const istDateString = now.toLocaleDateString("hi-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const istTimeString = now.toLocaleTimeString("hi-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
  const enDateString = now.toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let personaInstruction = "";
  if (persona === "hk_genius") {
    personaInstruction = "\n\nAI Persona: HK Genius (Hariom Kushwaha Tech Special). Act as an expert tech authority, innovator, and creative genius. Give deep, highly insightful answers with practical code and tech strategy.";
  } else if (persona === "friendly_tutor") {
    personaInstruction = "\n\nAI Persona: Friendly Tutor. Act as a warm, patient, encouraging teacher. Explain complex ideas using simple analogies, step-by-step breakdowns, and encouraging words.";
  } else if (persona === "code_architect") {
    personaInstruction = "\n\nAI Persona: Code Architect. Focus on software architecture, clean code principles, performance optimizations, bug debugging, and robust full-stack design.";
  } else {
    personaInstruction = "\n\nAI Persona: HK Nexus Prime. Act as a fast, ultra-smart, versatile, and highly capable all-rounder AI assistant.";
  }

  let langInstruction = "";
  if (language === "hi") {
    langInstruction = "\nLanguage Requirement: Primary language is Hindi (हिंदी). Respond in polite, clear, natural Hindi.";
  } else if (language === "hinglish") {
    langInstruction = "\nLanguage Requirement: Primary language is Hinglish (Hindi written in Roman script mixed naturally with English tech terms).";
  } else if (language === "en") {
    langInstruction = "\nLanguage Requirement: Primary language is English. Respond in clear, professional English.";
  } else if (language === "es") {
    langInstruction = "\nLanguage Requirement: Primary language is Spanish (Español).";
  } else if (language === "fr") {
    langInstruction = "\nLanguage Requirement: Primary language is French (Français).";
  }

  return `${SYSTEM_INSTRUCTION_BASE}${personaInstruction}${langInstruction}

Current Live Date & Time Context:
- Today's Date (IST): ${istDateString} (${enDateString})
- Current Time (IST): ${istTimeString}
- ALWAYS accurately state today's date (${istDateString}) whenever the user asks for current date, time, or today's news. Never output placeholders or bracketed text!`;
}

// Helper to format friendly user error responses
function getFriendlyErrorMessage(err: any): string {
  const errStr = String(err?.message || err || "");
  if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
    return "क्षमा करें! अभी AI सर्वर पर ट्रैफिक बहुत अधिक है। कृपया 5-10 सेकंड रुक कर फिर से प्रयास करें। (API Rate Limit)";
  }
  return "क्षमा करें, उत्तर तैयार करने में समस्या आई है। कृपया अपना प्रश्न पुनः पूछें।";
}

// Helper to fetch Google Translate HD audio for natural speech synthesis fallback
async function fetchGoogleTranslateAudio(text: string, lang: string = "hi"): Promise<string | null> {
  try {
    const cleanChunk = text.slice(0, 250);
    const targetLang = lang === "hi" || lang === "hinglish" ? "hi" : "en";
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanChunk)}&tl=${targetLang}&client=tw-ob`;
    const audioRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (audioRes.ok) {
      const buffer = await audioRes.arrayBuffer();
      return Buffer.from(buffer).toString("base64");
    }
  } catch (err) {
    console.warn("Google Translate TTS fallback notice:", err);
  }
  return null;
}

// 1. CHAT API
app.post("/api/chat", async (req, res) => {
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
      preferredEngine = "auto",
    } = req.body;

    const sysInstruction = getDynamicSystemInstruction(persona, language);

    let modePrompt = "";
    if (mode === "coding") {
      modePrompt = "\nFocus on generating clean, high-performance, well-commented code with complete explanations and bug diagnosis.";
    } else if (mode === "math") {
      modePrompt = "\nBreak down math and logic problems into step-by-step formulas, derivations, and final verification.";
    } else if (mode === "language") {
      modePrompt = "\nAct as a friendly multilingual language tutor. Provide translations, grammar tips, and example sentences.";
    }

    const groqKey = customGroqKey || req.headers["x-groq-key"] || process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const geminiKey = customGeminiKey || req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY;

    // If preferredEngine is groq or auto (and groqKey exists), try Groq Llama-3.3-70B first!
    if ((preferredEngine === "groq" || preferredEngine === "auto") && groqKey) {
      try {
        const groq = new Groq({ apiKey: String(groqKey).trim() });
        const groqMessages: any[] = [{ role: "system", content: sysInstruction }];
        if (memory && Array.isArray(history)) {
          for (const m of history.slice(-8)) {
            groqMessages.push({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            });
          }
        }
        groqMessages.push({ role: "user", content: `${message}${modePrompt}` });

        const groqRes = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: groqMessages,
          temperature: 0.7,
        });

        const groqReply = groqRes.choices[0]?.message?.content || "";
        if (groqReply) {
          return res.json({
            success: true,
            reply: groqReply,
            groundingChunks: [],
            provider: "Groq (Llama-3.3 70B High Speed)",
            creator: "Hariom Kushwaha (HK Tech World)",
          });
        }
      } catch (groqErr: any) {
        console.warn("Groq execution failed, trying Gemini:", groqErr?.message);
      }
    }

    // Try Gemini
    const ai = getGenAIClient(geminiKey as string);
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
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: base64Data,
        },
      });
    }

    currentParts.push({ text: `${message}${modePrompt}` });
    contents.push({ role: "user", parts: currentParts });

    const modelName = mode === "math" || mode === "coding" ? "gemini-3.1-pro-preview" : "gemini-3.6-flash";

    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.7,
          tools: mode === "research" || message.toLowerCase().includes("latest") || message.toLowerCase().includes("news") ? [{ googleSearch: {} }] : undefined,
        },
      });
    } catch (apiErr: any) {
      console.warn("Gemini call failed, trying Groq fallback:", apiErr?.message);

      if (groqKey) {
        const groq = new Groq({ apiKey: String(groqKey).trim() });
        const groqMessages: any[] = [{ role: "system", content: sysInstruction }];
        if (memory && Array.isArray(history)) {
          for (const m of history.slice(-6)) {
            groqMessages.push({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            });
          }
        }
        groqMessages.push({ role: "user", content: `${message}${modePrompt}` });

        const groqRes = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: groqMessages,
          temperature: 0.7,
        });

        const groqReply = groqRes.choices[0]?.message?.content || "";
        if (groqReply) {
          return res.json({
            success: true,
            reply: groqReply,
            groundingChunks: [],
            provider: "Groq (High-Speed Engine)",
            creator: "Hariom Kushwaha (HK Tech World)",
          });
        }
      }

      // If Groq also not present, try plain Gemini 3.6 Flash without tools
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.7,
        },
      });
    }

    const reply = response.text || "HK Nexus AI is ready to assist you!";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Reference",
      uri: chunk.web?.uri || "#",
    })) || [];

    res.json({
      success: true,
      reply,
      groundingChunks,
      creator: "Hariom Kushwaha (HK Tech World)",
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI response",
      fallbackReply: getFriendlyErrorMessage(error),
    });
  }
});

// 1.1 CHAT STREAMING API (Ultra-Fast Response)
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { message, history = [], memory = true, language = "auto", persona = "nexus_prime", mode = "general", image = null } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ai = getGenAIClient();
    const sysInstruction = getDynamicSystemInstruction(persona, language);
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
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: base64Data,
        },
      });
    }

    let modePrompt = "";
    if (mode === "coding") {
      modePrompt = "\nFocus on generating clean, high-performance, well-commented code with complete explanations.";
    } else if (mode === "math") {
      modePrompt = "\nBreak down math and logic problems into step-by-step formulas and derivations.";
    } else if (mode === "language") {
      modePrompt = "\nAct as a friendly multilingual language tutor.";
    }

    currentParts.push({ text: `${message}${modePrompt}` });
    contents.push({ role: "user", parts: currentParts });

    const modelName = "gemini-3.6-flash";

    let responseStream;
    try {
      responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.7,
          tools: mode === "research" || message.toLowerCase().includes("latest") || message.toLowerCase().includes("news") ? [{ googleSearch: {} }] : undefined,
        },
      });
    } catch (firstErr: any) {
      console.warn("Stream primary error, trying Groq or Gemini fallback:", firstErr?.message);
      const groq = getGroqClient();
      if (groq) {
        try {
          console.log("Streaming with Groq fallback...");
          const groqMessages: any[] = [
            { role: "system", content: sysInstruction }
          ];
          if (memory && Array.isArray(history)) {
            for (const m of history.slice(-6)) {
              groqMessages.push({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content,
              });
            }
          }
          groqMessages.push({ role: "user", content: `${message}${modePrompt}` });

          const groqStream = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            temperature: 0.7,
            stream: true,
          });

          for await (const chunk of groqStream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
            }
          }
          res.write(`data: ${JSON.stringify({ done: true, sources: [] })}\n\n`);
          return res.end();
        } catch (groqStreamErr: any) {
          console.error("Groq stream fallback error:", groqStreamErr?.message);
        }
      }

      responseStream = await ai.models.generateContentStream({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction: sysInstruction,
          temperature: 0.7,
        },
      });
    }

    let groundingChunks: any[] = [];

    for await (const chunk of responseStream) {
      if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        groundingChunks = chunk.candidates[0].groundingMetadata.groundingChunks.map((c: any) => ({
          title: c.web?.title || "Reference",
          uri: c.web?.uri || "#",
        }));
      }

      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, sources: groundingChunks })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Stream error:", error);
    const friendlyErr = getFriendlyErrorMessage(error);
    res.write(`data: ${JSON.stringify({ error: friendlyErr, done: true })}\n\n`);
    res.end();
  }
});

// 2. VISION & OCR API
app.post("/api/vision/ocr", async (req, res) => {
  try {
    const { image, task = "full_analysis" } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: "Image base64 data required" });
    }

    const mimeType = image.substring(image.indexOf(":") + 1, image.indexOf(";")) || "image/jpeg";
    const base64Data = image.includes("base64,") ? image.split(",")[1] : image;

    const ai = getGenAIClient();

    let promptText = "Extract all text (OCR), detect all objects, charts, locations, and summarize the overall content of this image in detail in clear Hindi and English.";
    if (task === "ocr_only") {
      promptText = "Perform high-precision Optical Character Recognition (OCR). Extract every single word, heading, table, or handwritten text from this image exactly as written.";
    } else if (task === "math_solver") {
      promptText = "Extract the mathematical problem shown in this image, translate formulas into LaTeX/text, and provide a full step-by-step solution.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Data } },
          { text: promptText },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
      },
    });

    res.json({
      success: true,
      result: response.text,
      creator: "Hariom Kushwaha (HK Tech World)",
    });
  } catch (error: any) {
    console.error("Vision OCR Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. IMAGE & LOGO GENERATOR API
app.post("/api/image/generate", async (req, res) => {
  try {
    const { prompt, type = "general", aspectRatio = "1:1", style = "cyberpunk" } = req.body;
    
    const userPromptClean = (prompt || "Futuristic AI Mascot Logo").trim();
    const styleModifier = style ? `, ${style} style` : "";
    const typeModifier = type === "logo" ? ", professional vector logo design, isolated, high definition" 
      : type === "banner" ? ", wide banner layout, cover photo art" 
      : type === "poster" ? ", poster art design, vivid typography" 
      : type === "bg_remove" ? ", transparent background style, clean edges, isolated cutout" 
      : type === "upscale" ? ", 8k resolution, ultra detailed, photorealistic super-resolution" 
      : "";

    const cleanDescriptivePrompt = `${userPromptClean}${styleModifier}${typeModifier}, 8k resolution, masterpiece, detailed lighting`;

    // Calculate width and height based on aspect ratio
    let width = 1024;
    let height = 1024;
    if (aspectRatio === "16:9") {
      width = 1280;
      height = 720;
    } else if (aspectRatio === "9:16") {
      width = 720;
      height = 1280;
    } else if (aspectRatio === "4:3") {
      width = 1024;
      height = 768;
    }

    const ai = getGenAIClient();

    try {
      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: cleanDescriptivePrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: (aspectRatio as any) || "1:1",
          outputMimeType: "image/jpeg",
        },
      });

      const generatedImage = response.generatedImages?.[0]?.image;
      if (generatedImage?.imageBytes) {
        const imageUrl = `data:image/jpeg;base64,${generatedImage.imageBytes}`;
        return res.json({
          success: true,
          imageUrl,
          prompt: userPromptClean,
          type,
          creator: "Hariom Kushwaha (HK Tech World)",
        });
      }
    } catch (genErr: any) {
      console.warn("Imagen API notice, switching to Flux renderer:", genErr?.message || genErr);
    }

    // High Quality Pollinations Flux Renderer Fallback
    const randomSeed = Math.floor(Math.random() * 9999999);
    const encodedPrompt = encodeURIComponent(cleanDescriptivePrompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${randomSeed}&model=flux`;

    return res.json({
      success: true,
      imageUrl: pollinationsUrl,
      prompt: userPromptClean,
      type,
      style,
      aspectRatio,
      message: "Generated via HK Nexus Flux HD visual engine.",
      creator: "Hariom Kushwaha (HK Tech World)",
    });
  } catch (error: any) {
    console.error("Image API catch error:", error);
    res.status(500).json({ success: false, error: error.message || "Image generation failed" });
  }
});

// 4. LIVE WEB SEARCH & NEWS API
app.post("/api/web-search", async (req, res) => {
  try {
    const { query, category = "all", customGroqKey = null, customGeminiKey = null } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ success: false, error: "Search query is required" });
    }

    const groqKey = customGroqKey || req.headers["x-groq-key"] || process.env.GROQ_API_KEY || process.env.GROQ_KEY;
    const geminiKey = customGeminiKey || req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY;

    const categoryPrompt = category === "news" 
      ? `Provide the latest breaking news and live updates regarding: ${query}`
      : category === "crypto"
      ? `Provide real-time market insights, prices, and trend analysis for: ${query}`
      : category === "weather"
      ? `Provide current live weather report, temperature, humidity, and forecast for: ${query}`
      : category === "sports"
      ? `Provide live sports scores, match updates, and standings for: ${query}`
      : query;

    // 1. Try Gemini with Google Search Grounding
    if (geminiKey) {
      try {
        const ai = getGenAIClient(geminiKey as string);
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: categoryPrompt,
          config: {
            systemInstruction: `${SYSTEM_INSTRUCTION_BASE}\nProvide current, factual, and well-structured live web intelligence in clean markdown.`,
            tools: [{ googleSearch: {} }],
          },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
          title: c.web?.title || "Google Verified Source",
          url: c.web?.uri || "#",
        })) || [];

        if (response.text) {
          return res.json({
            success: true,
            answer: response.text,
            sources,
            query,
            provider: "Google Live Grounded Search",
            timestamp: new Date().toLocaleTimeString("hi-IN"),
            creator: "Hariom Kushwaha (HK Tech World)",
          });
        }
      } catch (geminiSearchErr: any) {
        console.warn("Gemini Google Search failed, using web scraper fallback:", geminiSearchErr?.message);
      }
    }

    // 2. Fetch live data from DuckDuckGo Instant Answer / Wikipedia Public API
    let publicContext = "";
    const publicSources: Array<{ title: string; url: string }> = [];

    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const ddgRes = await fetch(ddgUrl, { headers: { "User-Agent": "HKNexusAI/1.0" } });
      if (ddgRes.ok) {
        const ddgData: any = await ddgRes.json();
        if (ddgData.AbstractText) {
          publicContext += `\nDirect Overview: ${ddgData.AbstractText}\nSource: ${ddgData.AbstractSource} (${ddgData.AbstractURL})`;
          publicSources.push({ title: ddgData.AbstractSource || "DuckDuckGo Verified Source", url: ddgData.AbstractURL || "https://duckduckgo.com" });
        }
        if (Array.isArray(ddgData.RelatedTopics)) {
          for (const topic of ddgData.RelatedTopics.slice(0, 4)) {
            if (topic.Text && topic.FirstURL) {
              publicContext += `\n- ${topic.Text}`;
              publicSources.push({ title: topic.Text.slice(0, 60), url: topic.FirstURL });
            }
          }
        }
      }
    } catch (ddgErr) {
      console.warn("Public search fetch failed:", ddgErr);
    }

    // 3. Synthesize with Groq or Gemini Plain Model
    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: String(groqKey).trim() });
        const promptWithContext = `You are HK Nexus AI Live Web Search Engine by Hariom Kushwaha.
User search query: "${query}"
Category: ${category}
${publicContext ? `Live Verified Web Data:\n${publicContext}\n` : ""}

Provide a rich, structured, comprehensive, and up-to-date answer in clean Markdown with headings, key points, and clear explanations in Hindi & English according to the query.`;

        const groqRes = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: promptWithContext }],
          temperature: 0.5,
        });

        const answer = groqRes.choices[0]?.message?.content;
        if (answer) {
          return res.json({
            success: true,
            answer,
            sources: publicSources.length > 0 ? publicSources : [
              { title: `${query} - Live Search`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}` },
              { title: `Wikipedia Research: ${query}`, url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}` },
            ],
            query,
            provider: "Groq Llama-3.3 70B High Speed Search",
            timestamp: new Date().toLocaleTimeString("hi-IN"),
            creator: "Hariom Kushwaha (HK Tech World)",
          });
        }
      } catch (groqSearchErr: any) {
        console.warn("Groq web search fallback error:", groqSearchErr?.message);
      }
    }

    // Default Fallback
    return res.json({
      success: true,
      answer: `### 🌐 लाइव वेब सर्च रिपोर्ट: **${query}**\n\n- **श्रेणी (Category):** ${category.toUpperCase()}\n- **स्थिति:** HK Nexus AI ने आपके अनुरोध को प्रोसेस किया है।\n\n${publicContext ? `**ताज़ा संदर्भ:**\n${publicContext}\n` : `Google और इंटरनेट पर "${query}" से संबंधित ताज़ा जानकारी उपलब्ध है।`}\n\n*टिप: ताज़ा रियल-टाइम लाइव गूगल सर्च के लिए Settings में Groq या Gemini API Key सक्रिय रखें।*`,
      sources: [
        { title: `Google Search: ${query}`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}` },
        { title: `Wikipedia: ${query}`, url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}` }
      ],
      query,
      timestamp: new Date().toLocaleTimeString("hi-IN"),
      creator: "Hariom Kushwaha (HK Tech World)",
    });
  } catch (error: any) {
    console.error("Web Search error:", error);
    res.status(500).json({ success: false, error: error.message || "Search failed" });
  }
});

// Helper to prepend WAV header to raw PCM audio
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// 5. TEXT TO SPEECH (TTS) API
app.post("/api/speech/tts", async (req, res) => {
  try {
    const { text, voice, gender = "female" } = req.body;
    const selectedVoice = voice || (gender === "male" ? "Puck" : "Kore");
    const cleanText = (text || "").replace(/[*_#`~\[\]()]/g, " ").trim().slice(0, 400);

    if (!cleanText) {
      return res.status(400).json({ success: false, error: "Text parameter is required" });
    }

    const ai = getGenAIClient();

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const audioBase64 = part?.inlineData?.data;
      const rawMime = part?.inlineData?.mimeType || "audio/pcm";

      if (audioBase64) {
        const rawBuffer = Buffer.from(audioBase64, "base64");
        let wavBuffer = rawBuffer;

        if (rawMime.includes("pcm") || !rawMime.includes("wav")) {
          const rateMatch = rawMime.match(/rate=(\d+)/);
          const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
          wavBuffer = pcmToWav(rawBuffer, sampleRate, 1, 16);
        }

        return res.json({
          success: true,
          audioBase64: wavBuffer.toString("base64"),
          voice: selectedVoice,
          mimeType: "audio/wav",
          creator: "Hariom Kushwaha (HK Tech World)",
        });
      }
    } catch (ttsErr: any) {
      const errMsg = ttsErr?.message || String(ttsErr);
      console.warn("Gemini TTS notice, switching to HD natural speech fallback:", errMsg.slice(0, 120));
    }

    // Try Google Translate HD natural human audio
    const isHindi = /[\u0900-\u097F]/.test(cleanText);
    const audioB64 = await fetchGoogleTranslateAudio(cleanText, isHindi ? "hi" : "en");
    if (audioB64) {
      return res.json({
        success: true,
        audioBase64: audioB64,
        mimeType: "audio/mp3",
        voice: "Natural Human Voice",
        creator: "Hariom Kushwaha (HK Tech World)",
      });
    }

    res.json({
      success: false,
      useBrowserTTS: true,
      text: cleanText,
      voice: selectedVoice,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. SOLVER & LEARNING LAB API
app.post("/api/tools/solver", async (req, res) => {
  try {
    const { problem, domain = "math" } = req.body;
    const ai = getGenAIClient();

    let prompt = `Solve this problem step-by-step with clear logical explanation, formulas, and final answers:\n${problem}`;
    if (domain === "quiz") {
      prompt = `Generate a 5-question interactive quiz based on the topic: "${problem}". Return as structured JSON array with question, options (A,B,C,D), correctOption, and explanation.`;
    } else if (domain === "code") {
      prompt = `Write, debug, or optimize code for the following request: "${problem}". Include code snippet with line comments and explanation.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_BASE,
      },
    });

    res.json({
      success: true,
      solution: response.text,
      domain,
      creator: "Hariom Kushwaha (HK Tech World)",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SEO & Google Search Console Support
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml`);
});

app.get("/sitemap.xml", (req, res) => {
  const host = req.get("host") || "ais-pre-zx2ujyx3uwp72hsmqrw6x6-724066052237.asia-east1.run.app";
  const protocol = req.protocol || "https";
  res.type("application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${protocol}://${host}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

// Automatic Google Search Console HTML Verification File Handlers
app.get(/^\/google.*\.html$/, (req, res) => {
  const filename = req.path.replace(/^\//, "");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  return res.status(200).send(`google-site-verification: ${filename}`);
});

// Static public files (icons, verification files, etc.)
app.use(express.static(path.join(process.cwd(), "public")));

// Serve frontend with Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 HK Nexus Studio AI Server running on http://0.0.0.0:${PORT}`);
    console.log(`Developed by Hariom Kushwaha (HK Tech World Mauranipur)`);
  });
}

startServer();
