import React, { useState } from "react";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Wand2, 
  Layers, 
  Download, 
  Maximize2, 
  Scissors, 
  Palette, 
  Share2,
  RefreshCw,
  Layout,
  Check
} from "lucide-react";
import { GeneratedImageItem } from "../types";

export const CreativeStudioWorkspace: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [studioType, setStudioType] = useState<"general" | "logo" | "banner" | "poster" | "bg_remove" | "upscale">("general");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3">("1:1");
  const [stylePreset, setStylePreset] = useState("cyberpunk");
  const [isLoading, setIsLoading] = useState(false);
  const [activeImage, setActiveImage] = useState<GeneratedImageItem | null>(null);

  const [gallery, setGallery] = useState<GeneratedImageItem[]>([
    {
      id: "img-demo-1",
      prompt: "HK Nexus Studio AI Futuristic Cyber Mascot Logo",
      type: "logo",
      style: "neon_minimal",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      timestamp: "Just now",
      aspectRatio: "1:1"
    },
    {
      id: "img-demo-2",
      prompt: "HK Tech World Luxury AI Conference Banner",
      type: "banner",
      style: "cyberpunk",
      imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80",
      timestamp: "5 mins ago",
      aspectRatio: "16:9"
    }
  ]);

  const handleGenerate = async () => {
    if (!prompt.trim() && studioType !== "bg_remove" && studioType !== "upscale") return;
    setIsLoading(true);

    const actualPrompt = prompt || `HK Nexus Studio AI ${studioType} designed by Hariom Kushwaha`;

    try {
      const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: actualPrompt,
          type: studioType,
          aspectRatio,
          style: stylePreset
        }),
      });

      const data = await response.json();
      
      const newImg: GeneratedImageItem = {
        id: `gen-${Date.now()}`,
        prompt: actualPrompt,
        type: studioType as any,
        style: stylePreset,
        imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
        timestamp: "Just now",
        aspectRatio
      };

      setGallery((prev) => [newImg, ...prev]);
      setActiveImage(newImg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4">
      {/* Header */}
      <div className="mb-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Image & Logo Generator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create logos, banners, or images easily
          </p>
        </div>

        {/* Studio Type Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: "general", label: "🎨 Image" },
            { id: "logo", label: "🏷️ Logo" },
            { id: "banner", label: "🖼️ Banner" },
            { id: "poster", label: "📜 Poster" },
            { id: "bg_remove", label: "✂️ Bg Remove" },
            { id: "upscale", label: "🔍 Upscale" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setStudioType(type.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                studioType === type.id
                  ? "bg-cyan-600 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-lg space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-cyan-400" />
            <span>Design Specs & Prompt</span>
          </h3>

          {/* Prompt input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description / Creative Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe the ${studioType} you want to generate (e.g. "Futuristic neon tiger logo for HK Tech World")...`}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Aspect Ratio</label>
            <div className="grid grid-cols-4 gap-2">
              {(["1:1", "16:9", "9:16", "4:3"] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-1.5 rounded-xl text-xs font-semibold border ${
                    aspectRatio === ratio
                      ? "bg-cyan-600 border-cyan-400 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Style Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Art & Design Style</label>
            <select
              value={stylePreset}
              onChange={(e) => setStylePreset(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="3d_render">3D Octane Render</option>
              <option value="photorealistic">Photorealistic 8K</option>
              <option value="vector_flat">Vector Minimalist Logo</option>
              <option value="gold_luxury">Gold Luxury Branding</option>
              <option value="anime_digital">Anime Digital Art</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 hover:opacity-90 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>HK Studio Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Design</span>
              </>
            )}
          </button>
        </div>

        {/* Display Canvas & Gallery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Active Canvas */}
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-lg min-h-[360px] flex flex-col items-center justify-center relative">
            {activeImage ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative max-h-[400px] rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
                  <img
                    src={activeImage.imageUrl}
                    alt={activeImage.prompt}
                    className="max-h-[380px] object-contain rounded-xl"
                  />
                </div>

                <div className="mt-4 w-full flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      {activeImage.type} • {activeImage.aspectRatio}
                    </span>
                    <p className="text-xs text-slate-300 truncate max-w-md">{activeImage.prompt}</p>
                  </div>

                  <a
                    href={activeImage.imageUrl}
                    download="hk-nexus-ai-design.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow-md shadow-cyan-500/30"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download HD</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 py-12">
                <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Choose specs & click Generate Design</p>
                <p className="text-xs text-slate-500">Supports Logo, Banner, Poster & Photo Upscaling</p>
              </div>
            )}
          </div>

          {/* Gallery History */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Generated Gallery History
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveImage(item)}
                  className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all aspect-square bg-slate-950 ${
                    activeImage?.id === item.id ? "border-cyan-400 ring-2 ring-cyan-500/50" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                    <span className="text-[10px] font-bold text-cyan-300 capitalize">{item.type}</span>
                    <p className="text-[10px] text-white truncate">{item.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
