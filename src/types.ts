export type ActiveTab = 
  | "chat" 
  | "vision" 
  | "studio" 
  | "video" 
  | "search" 
  | "learning" 
  | "creator";

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
  image?: string;
  sources?: Array<{ title: string; uri: string }>;
  codeSnippet?: string;
  isVoiceMessage?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  memoryEnabled: boolean;
  language: string;
  voiceGender: "male" | "female";
  selectedVoice?: "Kore" | "Aoede" | "Puck" | "Charon" | "Fenrir";
  voiceSpeed: number;
  autoReadResponse: boolean;
  aiPersona: "nexus_prime" | "hk_genius" | "friendly_tutor" | "code_architect";
}

export interface GeneratedImageItem {
  id: string;
  prompt: string;
  type: "logo" | "banner" | "poster" | "general" | "photo_edit";
  style: string;
  imageUrl: string;
  timestamp: string;
  aspectRatio: string;
}

export interface VideoProjectItem {
  id: string;
  title: string;
  prompt: string;
  status: "completed" | "processing" | "rendering";
  videoUrl?: string;
  aspectRatio: "16:9" | "9:16";
  subtitles?: string[];
  dubbingLanguage?: string;
  durationSeconds: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}
