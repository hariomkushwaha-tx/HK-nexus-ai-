import { GoogleGenAI, Modality } from "@google/genai";

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

// Helper for clean TTS prompt
function cleanTextForSpeech(raw: string): string {
  return (raw || "")
    .replace(/!\[.*?\]\(.*?\)/g, "") // Remove image markdown
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Replace links with link text
    .replace(/```[\s\S]*?```/g, " कोड उपलब्ध है। ") // Replace code blocks
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/[*_#~>|]/g, " ") // Markdown symbols
    .replace(/https?:\/\/\S+/g, "") // Raw URLs
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 450);
}

export default async function handler(req: any, res: any) {
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

  try {
    const body = req.body || {};
    const rawText = body.text || req.query?.text || "";
    const cleanText = cleanTextForSpeech(rawText);
    const gender = body.gender || "female";
    const voice = body.voice || (gender === "male" ? "Puck" : "Kore");

    if (!cleanText) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const customKey = body.customGeminiKey || req.headers["x-gemini-key"] || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    // 1. Try Gemini Audio Modality (High Definition Human AI Voice)
    if (customKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: String(customKey).trim() });
        const selectedVoice = voice || (gender === "male" ? "Puck" : "Kore");
        const expressivePrompt = `Please speak naturally, warmly, fluently, and with realistic human inflection in Hindi: ${cleanText}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: expressivePrompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: selectedVoice,
                },
              },
            },
          },
        });

        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0];

        if (part && "inlineData" in part && part.inlineData?.data) {
          const rawB64 = part.inlineData.data;
          const rawMime = part.inlineData.mimeType || "audio/pcm";
          const rawBuffer = Buffer.from(rawB64, "base64");

          let finalWavBuffer = rawBuffer;
          if (rawMime.includes("pcm") || !rawMime.includes("wav")) {
            const rateMatch = rawMime.match(/rate=(\d+)/);
            const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
            finalWavBuffer = pcmToWav(rawBuffer, sampleRate, 1, 16);
          }

          return res.status(200).json({
            success: true,
            audioBase64: finalWavBuffer.toString("base64"),
            mimeType: "audio/wav",
            voice: selectedVoice,
            creator: "Hariom Kushwaha (HK Tech World)",
          });
        }
      } catch (err: any) {
        console.warn("Gemini TTS notice:", err?.message);
      }
    }

    // 2. Google Translate HD Speech Fallback
    try {
      const isHindi = /[\u0900-\u097F]/.test(cleanText);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.slice(0, 200))}&tl=${isHindi ? "hi" : "en"}&client=tw-ob`;
      const audioRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (audioRes.ok) {
        const buffer = await audioRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return res.status(200).json({
          success: true,
          audioBase64: base64,
          mimeType: "audio/mp3",
          voice: isHindi ? "Google Hindi HD" : "Google English HD",
          creator: "Hariom Kushwaha (HK Tech World)",
        });
      }
    } catch (e) {
      console.warn("Translate TTS fallback notice:", e);
    }

    // 3. Fallback to Browser Speech Synthesis
    return res.status(200).json({
      success: false,
      useBrowserTTS: true,
      text: cleanText,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
