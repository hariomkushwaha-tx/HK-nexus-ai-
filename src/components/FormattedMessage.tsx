import React from "react";
import Markdown from "react-markdown";

interface FormattedMessageProps {
  content: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-slate-100 text-[13.5px] leading-relaxed space-y-2 [&_p]:my-1.5 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-cyan-300 [&_h1]:mt-3 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-cyan-300 [&_h2]:mt-2.5 [&_h2]:mb-1 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-cyan-300 [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:text-cyan-200 [&_strong]:font-bold [&_code]:bg-slate-950 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-cyan-300 [&_code]:font-mono [&_code]:text-xs [&_pre]:bg-slate-950 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-slate-800 [&_pre]:overflow-x-auto">
      <Markdown>{content}</Markdown>
    </div>
  );
};
