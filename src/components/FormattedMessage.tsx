import React, { useState } from "react";
import Markdown from "react-markdown";
import { Download, Maximize2, X, Image as ImageIcon } from "lucide-react";

interface FormattedMessageProps {
  content: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  const [modalImage, setModalImage] = useState<string | null>(null);

  return (
    <div className="prose prose-invert max-w-none text-slate-100 text-[13.5px] leading-relaxed space-y-2 [&_p]:my-1.5 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-cyan-300 [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-cyan-300 [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-cyan-300 [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:text-cyan-200 [&_strong]:font-bold [&_code]:bg-slate-950 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-cyan-300 [&_code]:font-mono [&_code]:text-xs [&_pre]:bg-slate-950 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-slate-800 [&_pre]:overflow-x-auto">
      <Markdown
        components={{
          img: ({ node, src, alt, ...props }) => {
            if (!src) return null;
            const imgAlt = alt || "HK Nexus AI Generated Design";
            return (
              <span className="block my-3 group relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 p-1.5 max-w-lg shadow-xl">
                <img
                  src={src}
                  alt={imgAlt}
                  referrerPolicy="no-referrer"
                  className="rounded-xl w-full max-h-[450px] object-cover cursor-pointer hover:opacity-95 transition-all"
                  onClick={() => setModalImage(src)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.dataset.failed) {
                      target.dataset.failed = "true";
                      target.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgAlt)}?width=800&height=800&nologo=true`;
                    }
                  }}
                  {...props}
                />
                <span className="flex items-center justify-between mt-2 px-2 py-1 bg-slate-900/90 rounded-xl text-[11px] text-slate-300 border border-slate-800">
                  <span className="truncate max-w-[200px] text-cyan-300 font-semibold">{imgAlt}</span>
                  <span className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setModalImage(src)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Full Screen View"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      download="hk-nexus-ai-design.jpg"
                      className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] transition-colors shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download HD</span>
                    </a>
                  </span>
                </span>
              </span>
            );
          },
        }}
      >
        {content}
      </Markdown>

      {/* Lightbox Modal for Fullscreen View */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setModalImage(null)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={modalImage}
              alt="Fullscreen Preview"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto max-w-full rounded-2xl border border-slate-700 shadow-2xl object-contain bg-slate-950"
            />
            <div className="mt-4 flex items-center space-x-3">
              <a
                href={modalImage}
                target="_blank"
                rel="noopener noreferrer"
                download="hk-nexus-ai-design.jpg"
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/30"
              >
                <Download className="w-4 h-4" />
                <span>Download Full HD</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
