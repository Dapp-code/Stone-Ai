export type AIModel = 
  | "anthropic/claude-haiku-4-5"
  | "openai/gpt-4o-mini"
  | "deepseek/deepseek-chat-v3-0324"
  | "qwen/qwen-2.5-72b-instruct"
  | "perplexity/sonar";

export interface FileAttachment {
  name: string;
  type: string; // e.g., 'image/png', 'audio/wav', 'application/pdf'
  size: number;
  base64: string; // base64 payload for preview/API
}

export interface VoiceNote {
  objectUrl: string; // Blob URL for playing
  durationSeconds: number;
  waveformPeaks: number[];
  transcript?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  modelUsed?: string;
  thinking?: string; // Deepseek-style thinking step
  thinkingTimeSeconds?: number;
  attachments?: FileAttachment[];
  voiceNote?: VoiceNote;
}

export interface ChatSession {
  id: string;
  title: string;
  model: AIModel;
  thinkingEnabled: boolean;
  messages: Message[];
  createdAt: string;
  isPinned?: boolean;
  creator?: string;
}
