import React, { useState, useRef } from "react";
import { FormattedMessage } from "./FormattedMessage";
import { 
  Eye, 
  Upload, 
  FileText, 
  Search, 
  Sparkles, 
  Copy, 
  Check, 
  BarChart2, 
  MapPin, 
  Calculator,
  ImageIcon,
  RefreshCw
} from "lucide-react";

export const VisionWorkspace: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [taskMode, setTaskMode] = useState<"full_analysis" | "ocr_only" | "math_solver">("full_analysis");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processVision = async () => {
    if (!selectedImage) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/vision/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: selectedImage,
          task: taskMode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysisResult(data.result);
      } else {
        setAnalysisResult("विज़न एनालिसिस विफल रहा। कृपया चित्र पुन: अपलोड करें।");
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisResult(`एनालिसिस में समस्या: ${err.message || "सर्वर कनेक्शन जांचें"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">
      {/* Header */}
      <div className="mb-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <span>Vision & OCR Studio</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyze photos, documents, or solve photo math
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: "full_analysis", label: "👁️ Full Analysis" },
            { id: "ocr_only", label: "📄 Text OCR" },
            { id: "math_solver", label: "🧮 Math Solver" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setTaskMode(mode.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                taskMode === mode.id
                  ? "bg-cyan-600 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Image Upload & Preview */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 flex flex-col justify-between shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
              <span>Image / Document Upload</span>
              {selectedImage && (
                <button
                  onClick={() => { setSelectedImage(null); setAnalysisResult(null); }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Clear Image
                </button>
              )}
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-950/50 flex flex-col items-center justify-center min-h-[280px]"
              >
                <div className="p-4 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 mb-3">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  क्लिक करें या फोटो यहाँ ड्रैग करें
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PNG, JPG, WEBP, Screenshot, Documents
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 min-h-[280px] flex items-center justify-center p-2">
                <img
                  src={selectedImage}
                  alt="Vision target"
                  className="max-h-80 object-contain rounded-xl"
                />
              </div>
            )}
          </div>

          <button
            onClick={processVision}
            disabled={!selectedImage || isLoading}
            className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>HK Vision AI analyzing image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze with HK Nexus Vision</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Extracted Result */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 flex flex-col shadow-lg min-h-[380px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Extracted Analysis & OCR Output</span>
            </h3>

            {analysisResult && (
              <button
                onClick={copyText}
                className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-slate-800 text-xs text-cyan-300 hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>

          <div className="flex-1 bg-slate-950 rounded-2xl p-4 border border-slate-800 overflow-y-auto text-slate-200 text-xs leading-relaxed font-sans">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-12">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-cyan-400 font-medium">Extracting text, OCR, objects & charts...</p>
              </div>
            ) : analysisResult ? (
              <FormattedMessage content={analysisResult} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12 space-y-2">
                <ImageIcon className="w-10 h-10 text-slate-600" />
                <p className="text-xs">
                  Upload an image on the left and click "Analyze with HK Nexus Vision"
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Accuracy: High-Precision Multi-modal Vision</span>
            <span className="font-semibold text-slate-400">Hariom Kushwaha (HK Tech World)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
