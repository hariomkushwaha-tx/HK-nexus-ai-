import { GoogleGenAI, Modality } from "@google/genai";

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
    const { text, voice, gender = "female" } = req.body || {};
    const cleanText = (text || "").replace(/[*_#`~\[\]()]/g, " ").trim().slice(0, 400);

    if (!cleanText) {
      return res.status(400).json({ success: false, error: "Text is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const selectedVoice = voice || (gender === "male" ? "Puck" : "Kore");

        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-tts-preview",
          contents: [{ parts: [{ text: cleanText }] }],
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
          return res.status(200).json({
            success: true,
            audioBase64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || "audio/mp3",
            voice: selectedVoice,
          });
        }
      } catch (err: any) {
        console.warn("Vercel TTS Gemini error:", err?.message);
      }
    }

    // Google Translate TTS Fallback
    try {
      const isHindi = /[\u0900-\u097F]/.test(cleanText);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.slice(0, 200))}&tl=${isHindi ? "hi" : "en"}&client=tw-ob`;
      const audioRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (audioRes.ok) {
        const buffer = await audioRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return res.status(200).json({
          success: true,
          audioBase64: base64,
          mimeType: "audio/mp3",
          voice: "Google Natural Voice",
        });
      }
    } catch (e) {
      console.warn("Google Translate TTS fallback error:", e);
    }

    return res.status(200).json({
      success: false,
      useBrowserTTS: true,
      text: cleanText,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
