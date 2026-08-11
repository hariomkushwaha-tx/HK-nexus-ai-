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
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
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
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

const SYSTEM_INSTRUCTION_BASE = `You are HK Nexus AI, a world-class, ultra-powerful multi-modal artificial intelligence assistant.

Response Style Guidelines:
- Give very clear, accurate, easy-to-understand, and neatly structured responses.
- Use smooth, natural, and polite tone in Hindi, English, Hinglish, or whichever language the user speaks.
- Format complex explanations or answers using clean bullet points and short paragraphs. Avoid clutter or unnecessary fluff.

Identity & Creator Rules (IMPORTANT: ONLY provide these details if the user explicitly asks):
- Default behavior: Focus directly on solving the user's prompt without introducing creator details.
- If asked who built or created you ("किसने बनाया है" / "who created you"): State clearly "मुझे HK Tech World ने बनाया है।".
- If asked who is the owner or founder ("Owner / मालिक कौन है" / "who is the owner"): State clearly "इसके Owner और मालिक Hariom Kushwaha हैं।".
- If asked where Hariom Kushwaha is from ("Hariom Kushwaha कहाँ के हैं" / "where is Hariom Kushwaha from"): State clearly "Hariom Kushwaha मौरानीपुर (Mauranipur) के रहने वाले हैं।".`;

function getDynamicSystemInstruction() {
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

  return `${SYSTEM_INSTRUCTION_BASE}

Current Live Date & Time Context:
- Today's Date (IST): ${istDateString} (${enDateString})
- Current Time (IST): ${istTimeString}
- ALWAYS accurately state today's date (${istDateString}) whenever the user asks for current date, time, or today's news. Never output placeholders or bracketed text!`;
}

// Helper to format friendly user error responses
function getFriendlyErrorMessage(err: any): string {
  const errStr = String(err?.message || err || "");
  if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
    return "क्षमा करें! अभी API पर ट्रैफिक बहुत अधिक है। कृपया 5-10 सेकंड रुक कर फिर से प्रश्न पूछें। (API Quota Rate Limit)";
  }
  return "नमस्ते! HK Nexus AI सेवा चालू है। कृपया अपना प्रश्न दोबारा पूछें।";
}

// 1. CHAT API
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [], memory = true, language = "auto", mode = "general", image = null } = req.body;

    const ai = getGenAIClient();
    
    // Prepare contents
    const contents: any[] = [];

    // Add previous context if memory enabled
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
      modePrompt = "\nFocus on generating clean, high-performance, well-commented code with complete explanations and bug diagnosis.";
    } else if (mode === "math") {
      modePrompt = "\nBreak down math and logic problems into step-by-step formulas, derivations, and final verification.";
    } else if (mode === "language") {
      modePrompt = "\nAct as a friendly multilingual language tutor. Provide translations, grammar tips, and example sentences.";
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
          systemInstruction: getDynamicSystemInstruction(),
          temperature: 0.7,
          tools: mode === "research" || message.toLowerCase().includes("latest") || message.toLowerCase().includes("news") ? [{ googleSearch: {} }] : undefined,
        },
      });
    } catch (apiErr: any) {
      console.warn("Primary AI call failed, checking fallbacks:", apiErr?.message);
      
      // Try Groq fallback if GROQ_API_KEY is configured
      const groq = getGroqClient();
      if (groq) {
        try {
          console.log("Using Groq fallback API...");
          const groqMessages: any[] = [
            { role: "system", content: getDynamicSystemInstruction() }
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
        } catch (groqErr: any) {
          console.error("Groq fallback error:", groqErr?.message);
        }
      }

      // If Groq not present or failed, try plain Gemini 3.6 Flash without search
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction: getDynamicSystemInstruction(),
          temperature: 0.7,
        },
      });
    }

    const reply = response.text || "HK Nexus AI is unable to process this request right now. Please try again.";
    
    // Extract grounding chunks if search tool was used
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
    const { message, history = [], memory = true, language = "auto", mode = "general", image = null } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ai = getGenAIClient();
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
          systemInstruction: getDynamicSystemInstruction(),
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
            { role: "system", content: getDynamicSystemInstruction() }
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
          systemInstruction: getDynamicSystemInstruction(),
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
    
    const fullPrompt = `HK Nexus AI Design [Type: ${type}, Style: ${style}]: ${prompt}. High quality, 8k resolution, clean lighting.`;

    const ai = getGenAIClient();

    try {
      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: fullPrompt,
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
          prompt,
          type,
          creator: "Hariom Kushwaha (HK Tech World)",
        });
      }
    } catch (genErr: any) {
      // Graceful fallback to Pollinations AI image generator
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=800&height=800&nologo=true`;
      return res.json({
        success: true,
        imageUrl: pollinationsUrl,
        prompt,
        type,
        style,
        message: "Generated via HK Nexus AI visual renderer.",
        creator: "Hariom Kushwaha (HK Tech World)",
      });
    }

    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=800&height=800&nologo=true`;
    res.json({
      success: true,
      imageUrl: fallbackUrl,
      prompt,
      type,
      style,
      creator: "Hariom Kushwaha (HK Tech World)",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. LIVE WEB SEARCH & NEWS API
app.post("/api/web-search", async (req, res) => {
  try {
    const { query, category = "all" } = req.body;
    const ai = getGenAIClient();

    const categoryPrompt = category === "news" 
      ? `Provide the latest breaking news and live updates regarding: ${query}`
      : category === "crypto"
      ? `Provide real-time market insights, prices, and trend analysis for: ${query}`
      : category === "weather"
      ? `Provide current live weather report, temperature, humidity, and forecast for: ${query}`
      : category === "sports"
      ? `Provide live sports scores, match updates, and standings for: ${query}`
      : query;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: categoryPrompt,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION_BASE}\nProvide current, factual, and well-structured information with bullet points.`,
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
      title: c.web?.title || "Source",
      url: c.web?.uri || "#",
    })) || [];

    res.json({
      success: true,
      answer: response.text,
      sources,
      query,
      timestamp: new Date().toISOString(),
      creator: "Hariom Kushwaha (HK Tech World)",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
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

    const ai = getGenAIClient();

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
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
      console.warn("Gemini TTS unavailable, falling back to browser TTS:", errMsg.slice(0, 150));
    }

    res.json({
      success: false,
      useBrowserTTS: true,
      text,
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
