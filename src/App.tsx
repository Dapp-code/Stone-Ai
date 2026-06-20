import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Send, 
  Paperclip, 
  Mic, 
  Edit2, 
  Search, 
  Check, 
  Sparkles, 
  Sun,
  Moon, 
  Image as ImageIcon, 
  LogOut, 
  FolderOpen, 
  FileText, 
  Volume2, 
  Compass, 
  Maximize2, 
  HelpCircle,
  Eye, 
  CheckSquare, 
  Lightbulb, 
  Paintbrush, 
  BookOpen, 
  User, 
  Menu, 
  X,
  RefreshCw,
  Clock,
  MessageSquare,
  Play,
  Pause,
  Copy,
  RotateCcw,
  Pin,
  Settings,
  Folder,
  Book,
  AppWindow,
  Code
} from "lucide-react";

import { AuthUI } from "@/src/components/ui/auth-ui";
import { BackgroundPaths } from "@/src/components/ui/background-paths";
import { Button } from "@/src/components/ui/button";
import { DrawingCanvas } from "@/src/components/DrawingCanvas";
import { AudioRecorder } from "@/src/components/AudioRecorder";
import PricingSection6 from "@/src/components/ui/pricing-section-4";
import ShaderBackground from "@/src/components/ui/shader-background";
import { AIModel, ChatSession, Message, FileAttachment } from "@/src/types";

// App navigation stages
type Stage = "lander" | "auth" | "workspace";

// Helper to convert plain letters and numbers to Mathematical Bold Sans-Serif symbols
export function toMathBoldSans(text: string): string {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    // Upper case A-Z
    if (code >= 65 && code <= 90) {
      return String.fromCodePoint(0x1D5D4 + (code - 65));
    }
    // Lower case a-z
    if (code >= 97 && code <= 122) {
      return String.fromCodePoint(0x1D5EE + (code - 97));
    }
    // Numbers 0-9
    if (code >= 48 && code <= 57) {
      return String.fromCodePoint(0x1D7E2 + (code - 48));
    }
    return char;
  }).join('');
}

export const isImageUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase().trim();
  return (
    url.includes("images.unsplash.com") ||
    cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".webp") ||
    cleanUrl.endsWith(".gif") ||
    url.includes("source.unsplash.com") ||
    url.includes("unsplash.com/photo-")
  );
};

export const parseInlineBoldAndItalics = (line: string) => {
  if (!line) return "";

  // 1. Split by images first: `![alt](url)`
  const imageRegex = /(!\[.*?\]\(.*?\))/g;
  const imageParts = line.split(imageRegex);

  return imageParts.map((imagePart, idx) => {
    if (imagePart.startsWith("![") && imagePart.includes("](") && imagePart.endsWith(")")) {
      const altMatch = imagePart.match(/!\[(.*?)\]/);
      const urlMatch = imagePart.match(/\((.*?)\)/);
      const alt = altMatch ? altMatch[1] : "Generated Image";
      const url = urlMatch ? urlMatch[1] : "";
      if (url) {
        return (
          <div key={`img-${idx}`} className="my-4 max-w-full rounded-2xl overflow-hidden border border-natural-border shadow-md bg-stone-100 dark:bg-black/40 flex flex-col">
            <img
              src={url}
              alt={alt}
              referrerPolicy="no-referrer"
              className="w-full h-auto object-cover max-h-[420px] hover:scale-[1.01] transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80`;
              }}
            />
            <span className="text-[11px] text-natural-muted font-mono p-2.5 border-t border-natural-border/30 text-center bg-natural-aside/10 dark:bg-zinc-900/45 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Image: {alt}
            </span>
          </div>
        );
      }
    }

    // 2. Split by links: `[text](url)` but not images
    const linkRegex = /(\[.*?\]\(.*?\))/g;
    const linkParts = imagePart.split(linkRegex);

    return (
      <React.Fragment key={`part-${idx}`}>
        {linkParts.map((linkPart, lIdx) => {
          if (linkPart.startsWith("[") && linkPart.includes("](") && linkPart.endsWith(")")) {
            const textMatch = linkPart.match(/\[(.*?)\]/);
            const urlMatch = linkPart.match(/\((.*?)\)/);
            const text = textMatch ? textMatch[1] : "Link";
            const url = urlMatch ? urlMatch[1] : "";
            if (url) {
              if (isImageUrl(url)) {
                return (
                  <div key={`link-img-${lIdx}`} className="my-4 max-w-full rounded-2xl overflow-hidden border border-natural-border shadow-md bg-stone-100 dark:bg-black/40 flex flex-col">
                    <img
                      src={url}
                      alt={text}
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover max-h-[420px] hover:scale-[1.01] transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80`;
                      }}
                    />
                    <span className="text-[11px] text-natural-muted font-mono p-2.5 border-t border-natural-border/30 text-center bg-natural-aside/10 dark:bg-zinc-900/45 flex items-center justify-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Image Result: {text}
                    </span>
                  </div>
                );
              }
              return (
                <a
                  key={`link-${lIdx}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 dark:text-blue-400 font-bold underline hover:text-blue-600 dark:hover:text-blue-300 inline-flex items-center gap-0.5 mx-0.5"
                >
                  {text}
                </a>
              );
            }
          }

          // Check if some word in here is raw image or unsplash url
          const urlWords = linkPart.split(/(\s+)/);
          const elements = urlWords.map((word, wIdx) => {
            const trimmedWord = word.trim();
            if (trimmedWord.startsWith("http://") || trimmedWord.startsWith("https://")) {
              if (isImageUrl(trimmedWord)) {
                return (
                  <div key={`raw-img-${wIdx}`} className="my-4 max-w-full rounded-2xl overflow-hidden border border-natural-border shadow-md bg-stone-100 dark:bg-black/40 flex flex-col">
                    <img
                      src={trimmedWord}
                      alt="Rendered Asset"
                      referrerPolicy="no-referrer"
                      className="w-full h-auto object-cover max-h-[420px] hover:scale-[1.01] transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80`;
                      }}
                    />
                    <span className="text-[11px] text-natural-muted font-mono p-2.5 border-t border-natural-border/30 text-center bg-natural-aside/10 dark:bg-zinc-900/45 flex items-center justify-center gap-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      Visual Asset
                    </span>
                  </div>
                );
              }
              return (
                <a
                  key={`raw-link-${wIdx}`}
                  href={trimmedWord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 dark:text-blue-400 font-bold underline hover:text-blue-600 dark:hover:text-blue-300 inline-flex items-center gap-0.5 mx-0.5 break-all"
                >
                  {trimmedWord}
                </a>
              );
            }

            const boldParts = word.split(/(\*\*.*?\*\*)/g);

            return (
              <React.Fragment key={`bold-italic-${wIdx}`}>
                {boldParts.map((bPart, bIdx) => {
                  if (bPart.startsWith("**") && bPart.endsWith("**")) {
                    const rawText = bPart.slice(2, -2);
                    const boldUnicode = toMathBoldSans(rawText);
                    return (
                      <strong key={`b-${bIdx}`} className="font-extrabold text-[#111827] dark:text-white bg-blue-500/10 dark:bg-blue-400/15 px-1 py-0.5 rounded tracking-wide">
                        {boldUnicode}
                      </strong>
                    );
                  }

                  const italicParts = bPart.split(/(\*.*?\*)/g);

                  return (
                    <React.Fragment key={`it-${bIdx}`}>
                      {italicParts.map((iPart, iIdx) => {
                        if (iPart.startsWith("*") && iPart.endsWith("*")) {
                          const rawText = iPart.slice(1, -1);
                          return (
                            <em key={`i-${iIdx}`} className="italic font-serif font-semibold text-blue-600 dark:text-blue-400 px-0.5">
                              {rawText}
                            </em>
                          );
                        }

                        return iPart;
                      })}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
          });

          return <React.Fragment key={`word-${lIdx}`}>{elements}</React.Fragment>;
        })}
      </React.Fragment>
    );
  });
};

export const renderCleanMessageText = (text: string) => {
  if (!text) return null;

  // Let's split on code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    // If it's a code block
    if (part.startsWith("```") && part.endsWith("```")) {
      const CodeLineRegex = /^```(\w*)\n([\s\S]*?)```$/;
      const match = part.match(CodeLineRegex);
      const val = match ? match[2] : part.slice(3, -3);
      const lang = match ? match[1] : "code";
      return (
        <div key={index} className="my-3 overflow-hidden rounded-xl border border-[#D6D6CC] dark:border-[#3C3C34] bg-slate-900 text-slate-100 text-xs font-mono">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-white/10 select-none text-[10px] text-slate-400 font-bold uppercase">
            <span>{lang || "source"}</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(val)}
              className="px-2 py-0.5 hover:bg-white/10 rounded border-0 bg-transparent text-slate-400 hover:text-white transition-colors cursor-pointer text-[10px]"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 overflow-x-auto scrollbar-thin text-stone-200 leading-relaxed whitespace-pre-wrap selection:bg-white/20">
            <code>{val}</code>
          </pre>
        </div>
      );
    }

    // Otherwise, parse regular line-by-line paragraph structures with lists
    const lines = part.split("\n");
    return (
      <div key={index} className="space-y-2">
        {lines.map((line, lineIdx) => {
          // Check for headers
          if (line.startsWith("#")) {
            const level = line.match(/^#+/)?.[0].length || 1;
            const headingText = line.replace(/^#+\s*/, "");
            const styledHeading = toMathBoldSans(headingText);
            const sizeClass = level === 1 ? "text-lg font-black mt-4 mb-2" : level === 2 ? "text-base font-extrabold mt-3 mb-1.5" : "text-sm font-bold mt-2.5 mb-1";
            return (
              <div key={lineIdx} className={`${sizeClass} text-natural-dark tracking-tight`}>
                {styledHeading}
              </div>
            );
          }

          // Check for bullet lists
          if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
            const cleanLine = line.replace(/^\s*[\-\*]\s*/, "");
            return (
              <div key={lineIdx} className="flex items-start gap-2 pl-4 text-sm leading-relaxed">
                <span className="text-[#6B705C] mt-1.5 shrink-0 select-none text-xs">●</span>
                <span className="flex-1">{parseInlineBoldAndItalics(cleanLine)}</span>
              </div>
            );
          }

          // Regular paragraph lines
          if (line.trim() === "") {
            return <div key={lineIdx} className="h-2" />;
          }

          return (
            <p key={lineIdx} className="leading-relaxed">
              {parseInlineBoldAndItalics(line)}
            </p>
          );
        })}
      </div>
    );
  });
};

const MODEL_LIST: { id: AIModel; name: string; desc: string; color: string }[] = [
  { id: "anthropic/claude-haiku-4-5", name: "Claude 4.5 Haiku", desc: "Elite logic & speed", color: "from-orange-500 to-amber-600" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", desc: "Snappy responses", color: "from-emerald-500 to-teal-600" },
  { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3", desc: "Detailed reflections", color: "from-blue-500 to-indigo-600" },
  { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", desc: "Broad knowledge base", color: "from-purple-500 to-fuchsia-600" },
  { id: "perplexity/sonar", name: "Perplexity Sonar", desc: "Live web execution", color: "from-sky-500 to-cyan-600" }
];

export default function App() {
  const [stage, setStage] = useState<Stage>("lander");
  const [userEmail, setUserEmail] = useState<string>("");
  const [theme, setTheme] = useState<"default" | "dark">("dark");
  
  // Chat state management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Current edit controllers
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>("anthropic/claude-haiku-4-5");
  const [thinkingEnabled, setThinkingEnabled] = useState(true);
  
  // Media attachments state
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);
  
  // Special UI prompt modes
  const [createImageMode, setCreateImageMode] = useState(false);
  const [globalSearchMode, setGlobalSearchMode] = useState(false);
  const [deepResearchMode, setDeepResearchMode] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [generatingMessageId, setGeneratingMessageId] = useState<string | null>(null);

  // Accordion toggle states for Indonesian sidebar items
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isPerpustakaanOpen, setIsPerpustakaanOpen] = useState(false);
  const [isAplikasiOpen, setIsAplikasiOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isPinnedGroupOpen, setIsPinnedGroupOpen] = useState(true);
  
  // Runtime streaming UI helpers
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeThinkingProcess, setActiveThinkingProcess] = useState<string>("");
  const [thinkingTimeElapsed, setThinkingTimeElapsed] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Premium AI Utility State Hooks
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [playingAudioMsgId, setPlayingAudioMsgId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isShaderBgActive, setIsShaderBgActive] = useState(false);

  const handleTogglePinSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prevSessions) =>
      prevSessions.map((s) => {
        if (s.id === id) {
          return { ...s, isPinned: !s.isPinned };
        }
        return s;
      })
    );
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (playingAudioMsgId === msgId) {
      window.speechSynthesis.cancel();
      setPlayingAudioMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      // Remove basic markdown symbols so TTS reads clean sentences
      const cleanText = text.replace(/[*#`_\-\[\]()]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => {
        setPlayingAudioMsgId(null);
      };
      utterance.onerror = () => {
        setPlayingAudioMsgId(null);
      };
      setPlayingAudioMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRegenerate = (msgId: string) => {
    const activeSess = sessions.find((s) => s.id === activeSessionId);
    if (!activeSess) return;
    
    const msgIdx = activeSess.messages.findIndex((m) => m.id === msgId);
    if (msgIdx === -1) return;
    
    let lastUserPrompt = "";
    let userAttachments: FileAttachment[] = [];
    for (let i = msgIdx - 1; i >= 0; i--) {
      if (activeSess.messages[i].role === "user") {
        lastUserPrompt = activeSess.messages[i].content;
        userAttachments = activeSess.messages[i].attachments || [];
        break;
      }
    }
    
    if (!lastUserPrompt) return;
    
    // Slice messages up to the user's prompt so we exclude the failed/old AI text
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSess.id) {
          return {
            ...s,
            messages: s.messages.slice(0, msgIdx)
          };
        }
        return s;
      })
    );
    
    // Re-issue request
    triggerAIService(lastUserPrompt, `usermsg-regen-${Date.now()}`, activeSess.id, userAttachments);
  };
  
  // Thread DOM scroller anchors
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const thinkingTimerIntervalRef = useRef<any | null>(null);

  // Initialize and retrieve user state or preloaded chats
  useEffect(() => {
    const cachedUser = localStorage.getItem("stone_ai_user");
    const cachedSessions = localStorage.getItem("stone_ai_sessions");
    const cachedStage = localStorage.getItem("stone_ai_stage");

    if (cachedUser) {
      setUserEmail(cachedUser);
    }
    
    if (cachedSessions) {
      try {
        const parsed = JSON.parse(cachedSessions);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
          setSelectedModel(parsed[0].model);
          setThinkingEnabled(parsed[0].thinkingEnabled);
        }
      } catch (e) {
        setSessions([]);
      }
    } else {
      // Seed initial welcoming thread
      const welcomeId = "welcome-session";
      const initialSession: ChatSession = {
        id: welcomeId,
        title: "Stone Cognitive Welcome",
        model: "anthropic/claude-haiku-4-5",
        thinkingEnabled: true,
        createdAt: new Date().toISOString(),
        creator: "Dapp.",
        messages: [
          {
            id: "msg-welcome-sh",
            role: "assistant",
            content: "Welcome to **Stone AI**. I am a premium, structure-focused cognitive workspace.\n\nHere are some advanced modules initialized for you:\n- **Deep Thinking Mode (R1)**: Enabling detailed clinical cognitive chains before answering.\n- **Scribble Drawboard**: Slide out our right whiteboard canvas, sketch your blueprints, and attach them instantly to critique visual layouts!\n- **Voice Note Recording**: Tap the mic to input vocal requests directly.\n- **Local Workspace Persistence**: Search, create, rename, and manage independent sessions easily.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            thinking: "Initializing core intelligence matrices... Configuring cognitive channels for a high-contrast elegant interface. Formulating system instructions for premium craftsmanship. Direct connection to ChatGPT endpoint and Google Gemini fallback initialized successfully."
          }
        ]
      };
      setSessions([initialSession]);
      setActiveSessionId(welcomeId);
    }

    if (cachedStage && cachedUser) {
      setStage(cachedStage as Stage);
    }

    setTheme("dark");
    localStorage.setItem("stone_ai_theme", "dark");
  }, []);

  // Save sessions to localStorage upon every update state mutation
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("stone_ai_sessions", JSON.stringify(sessions));
    } else {
      localStorage.removeItem("stone_ai_sessions");
    }
  }, [sessions]);

  // Track scroll anchoring
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, activeSessionId, activeThinkingProcess, isGenerating]);

  // Thinking step duration timer
  useEffect(() => {
    if (isGenerating && thinkingEnabled) {
      setThinkingTimeElapsed(0);
      thinkingTimerIntervalRef.current = setInterval(() => {
        setThinkingTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (thinkingTimerIntervalRef.current) {
        clearInterval(thinkingTimerIntervalRef.current);
      }
    }

    return () => {
      if (thinkingTimerIntervalRef.current) {
        clearInterval(thinkingTimerIntervalRef.current);
      }
    };
  }, [isGenerating, thinkingEnabled]);

  // Get active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Handle stage forwarders
  const handleStartApp = () => {
    if (userEmail) {
      setStage("workspace");
      localStorage.setItem("stone_ai_stage", "workspace");
    } else {
      setStage("auth");
    }
  };

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setStage("workspace");
    localStorage.setItem("stone_ai_user", email);
    localStorage.setItem("stone_ai_stage", "workspace");
  };

  const handleLogout = () => {
    setUserEmail("");
    setStage("auth");
    localStorage.removeItem("stone_ai_user");
    localStorage.setItem("stone_ai_stage", "auth");
  };

  // Manage Sessions
  const handleCreateNewThread = (titleDraft = "") => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: titleDraft || `Cognitive Probe ${sessions.length + 1}`,
      model: selectedModel,
      thinkingEnabled: thinkingEnabled,
      createdAt: new Date().toISOString(),
      creator: "Dapp.",
      messages: []
    };
    
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    
    if (activeSessionId === id) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else {
        setActiveSessionId(null);
      }
    }
  };

  const handleRenameSession = (id: string, newName: string) => {
    if (!newName.trim()) return;
    const updated = sessions.map((s) => {
      if (s.id === id) {
        return { ...s, title: newName };
      }
      return s;
    });
    setSessions(updated);
  };

  // Select Model & Sync inside current session config
  const handleModelSelect = (modelId: AIModel) => {
    setSelectedModel(modelId);
    if (activeSessionId) {
      setSessions(
        sessions.map((s) => (s.id === activeSessionId ? { ...s, model: modelId } : s))
      );
    }
  };

  const handleToggleThinking = () => {
    const nextVal = !thinkingEnabled;
    setThinkingEnabled(nextVal);
    if (activeSessionId) {
      setSessions(
        sessions.map((s) => (s.id === activeSessionId ? { ...s, thinkingEnabled: nextVal } : s))
      );
    }
  };

  // File Upload Handlers
  const handleFileSelectTrigger = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        const attachment: FileAttachment = {
          name: file.name,
          type: file.type,
          size: file.size,
          base64: base64
        };
        setAttachedFiles((prev) => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Whiteboard drawing attachment callback
  const handleAttachDrawboard = (base64Png: string) => {
    const drawAttachment: FileAttachment = {
      name: `Scribble_${Date.now().toString().slice(-4)}.png`,
      type: "image/png",
      size: Math.round(base64Png.length * 0.75), // approximate byte size from base64
      base64: base64Png
    };
    setAttachedFiles((prev) => [...prev, drawAttachment]);
    setShowCanvas(false);
  };

  // Voice Recording Attachment callback
  const handleAttachVoiceNote = (objectUrl: string, blob: Blob, durationSeconds: number, liveTranscript?: string) => {
    const dummyPeakCount = 20;
    const fakePeaks = Array.from({ length: dummyPeakCount }, () => Math.floor(Math.random() * 85) + 15);
    
    // Convert blob to base64 so model can scan it if needed
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      const audioAttachment: FileAttachment = {
        name: `Voice_${Date.now().toString().slice(-4)}.wav`,
        type: "audio/wav",
        size: blob.size,
        base64: base64
      };

      const customVoiceObj = {
        objectUrl,
        durationSeconds,
        waveformPeaks: fakePeaks,
        transcript: liveTranscript || "Voice Note: [Processing and Transcribing...]"
      };

      // Create new user message for voice record addition
      const mockSessionId = activeSessionId || `session-${Date.now()}`;
      const userMsgId = `user-msg-${Date.now()}`;
      
      const userMessage: Message = {
        id: userMsgId,
        role: "user",
        content: liveTranscript ? `Sent a Voice Note: "${liveTranscript}"` : `Sent a Voice Note (${durationSeconds}s)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachments: [audioAttachment],
        voiceNote: customVoiceObj
      };

      let updatedSessions = [...sessions];
      if (!activeSessionId) {
        const newSessionState: ChatSession = {
          id: mockSessionId,
          title: liveTranscript ? (liveTranscript.length > 25 ? liveTranscript.slice(0, 25) + "..." : liveTranscript) : `Voice query ${sessions.length + 1}`,
          model: selectedModel,
          thinkingEnabled: thinkingEnabled,
          createdAt: new Date().toISOString(),
          creator: "Dapp.",
          messages: [userMessage]
        };
        updatedSessions = [newSessionState, ...sessions];
        setActiveSessionId(mockSessionId);
      } else {
        updatedSessions = sessions.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, userMessage]
            };
          }
          return s;
        });
      }
      
      setSessions(updatedSessions);
      setIsRecordingVoice(false);

      // Trigger intelligence callback using automated transcription
      const voicePrompt = liveTranscript ? `Tolong tanggapi pesan suara/perintah suara saya ini: "${liveTranscript}"` : "Attached voice note query. Analyze and describe structural points.";
      triggerAIService(voicePrompt, userMsgId, mockSessionId, [audioAttachment]);
    };
    reader.readAsDataURL(blob);
  };

  // Remove individual attachments before sending
  const handleRemoveAttachment = (idx: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== idx));
  };

  // Generate simulated thoughts sequence matching DeepSeek requirements
  const generateSimulatedThinkingSteps = (prompt: string): string => {
    const thoughts = [
      `Initializing active node layers for custom model parameters.`,
      `Incoming structure-prompt length: ${prompt.length} values. Analyzing context vectors.`,
      `Parsing semantic nodes in search of optimal logical responses.`,
      `Verifying layout rules... Incorporating clean tone vectors and Markdown formatting structures.`,
      `Assembling cognitive response. Processing mathematical limits or factual proofs.`
    ];
    return thoughts.join("\n");
  };

  // Submit standard chat message
  const handleSendMessage = () => {
    if (!inputPrompt.trim() && attachedFiles.length === 0) return;

    const visualPrompt = inputPrompt;
    let targetPrompt = visualPrompt;
    
    let additions = [];
    if (createImageMode) {
      additions.push("[MODE: CREATE IMAGE. IMPORTANT - Generate a highly aesthetic visual description. You MUST output a relevant high-quality Markdown image matching the query using a genuine Unsplash URL, e.g., ![AI Generated Image](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80) or other beautiful illustrative photograph from Unsplash depending on the theme. Please prioritize writing the image tag directly in the markdown response.]");
    }
    if (globalSearchMode) {
      additions.push("[MODE: GLOBAL SEARCH. Access internet directories, index entries, and web records. Present verified citation sources and direct links.]");
    }
    if (deepResearchMode) {
      additions.push("[MODE: DEEP RESEARCH. Build an extremely deep academic analysis, with clinical sections, multiple expert perspectives, and fully-formed analysis arrays.]");
    }
    
    if (additions.length > 0) {
      targetPrompt = `${additions.join("\n")}\n\n${visualPrompt}`;
    }

    setInputPrompt("");
    
    const userMsgId = `usermsg-${Date.now()}`;
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: visualPrompt,
      timestamp: timestampStr,
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    setAttachedFiles([]);
    
    let targetSessionId = activeSessionId;
    let fallbackUpdatedSessions = [...sessions];

    if (!activeSessionId) {
      targetSessionId = `session-${Date.now()}`;
      const firstSessionState: ChatSession = {
        id: targetSessionId,
        title: visualPrompt.slice(0, 24) || "New Conversation",
        model: selectedModel,
        thinkingEnabled: thinkingEnabled,
        createdAt: new Date().toISOString(),
        creator: "Dapp.",
        messages: [userMessage]
      };
      setActiveSessionId(targetSessionId);
      fallbackUpdatedSessions = [firstSessionState, ...sessions];
    } else {
      fallbackUpdatedSessions = sessions.map((s) => {
        if (s.id === targetSessionId) {
          // Auto rename thread index if it was default title and this is first message
          const count = s.messages.length;
          const updatedTitle = count === 0 ? visualPrompt.slice(0, 26) : s.title;
          return {
            ...s,
            title: updatedTitle,
            messages: [...s.messages, userMessage]
          };
        }
        return s;
      });
    }

    setSessions(fallbackUpdatedSessions);
    triggerAIService(targetPrompt, userMsgId, targetSessionId!, userMessage.attachments);
  };

  // core AI proxy stream interface
  const triggerAIService = async (
    prompt: string, 
    userMsgId: string, 
    sessionId: string, 
    filesToSubmit?: FileAttachment[]
  ) => {
    setIsGenerating(true);
    setActiveThinkingProcess("");
    
    // Create assistant message ID and mark it as currently generating
    const assistantMsgId = `assistant-msg-${Date.now()}`;
    setGeneratingMessageId(assistantMsgId);
    
    const thoughtsSeed = thinkingEnabled ? generateSimulatedThinkingSteps(prompt) : "";
    setActiveThinkingProcess(thoughtsSeed);

    // If thinking is enabled, display active parsing steps for 1.8 seconds mimicking clinical LLM reasoning
    if (thinkingEnabled) {
      setThinkingTimeElapsed(0);
      await new Promise((r) => setTimeout(r, 1800));
    }

    const initialAssistantMessage: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel,
      thinking: thinkingEnabled ? thoughtsSeed : undefined,
      thinkingTimeSeconds: thinkingEnabled ? Math.floor(Math.random() * 5) + 2 : undefined
    };

    // Embed empty assistant structure ready to absorb stream chunks
    setSessions((prevSessions) =>
      prevSessions.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: [...s.messages, initialAssistantMessage]
          };
        }
        return s;
      })
    );

    try {
      // Pick first picture or audio attachment to submit to the API
      const mainPic = filesToSubmit?.find(f => f.type && f.type.startsWith("image"));
      const mainAudio = filesToSubmit?.find(f => f.type && f.type.startsWith("audio"));
      
      const payload: any = {
        prompt: prompt,
        model: selectedModel,
      };

      if (mainPic) {
        payload.fileBase64 = mainPic.base64;
        payload.fileMime = mainPic.type;
      } else if (mainAudio) {
        payload.fileBase64 = mainAudio.base64;
        payload.fileMime = mainAudio.type;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} connecting core service`);
      }

      // Read chunk stream utilizing readable stream text decoders
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let chunkBuffer = "";
      
      if (!reader) {
        // Fallback for non-stream contexts
        const completeText = await response.text();
        setSpeechAndAppend(sessionId, assistantMsgId, completeText || "Error communicating with Stone Core.");
        setIsGenerating(false);
        setGeneratingMessageId(null);
        return;
      }

      let aiResponseText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunkBuffer += decoder.decode(value, { stream: true });
        const lines = chunkBuffer.split("\n");
        chunkBuffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          
          const rawPayload = line.slice(5).trim();
          if (rawPayload === "[DONE]") {
            break;
          }

          try {
            const parsed = JSON.parse(rawPayload);
            if (parsed.text) {
              aiResponseText += parsed.text;
              
              // Incrementally update assistant message content
              setSessions((currentSessions) =>
                currentSessions.map((s) => {
                  if (s.id === sessionId) {
                    return {
                      ...s,
                      messages: s.messages.map((m) => {
                        if (m.id === assistantMsgId) {
                          return { ...m, content: aiResponseText };
                        }
                        return m;
                      })
                    };
                  }
                  return s;
                })
              );
            } else if (parsed.error) {
              console.error("AI returned server error:", parsed.error);
              aiResponseText += `\n\n*System Connection Error: ${parsed.error}*`;
            }
          } catch (e) {
            // Suppress minor chunk splits
          }
        }
      }

      setIsGenerating(false);
      setGeneratingMessageId(null);

    } catch (err: any) {
      console.error("Stone API fetch error, applying local mock query answering:", err);
      // Fallback response if fully offline
      const mockAnswers = [
        "That is a durably structured viewpoint. As **Stone AI**, I suggest checking your network integrations or validating your `GEMINI_API_KEY` status inside the Secrets utility pane to unlock elite streaming.",
        "Understood. Implementing architectural frameworks aligned with this concept is highly logical. Review this structure:\n\n1. Establish robust concrete foundations.\n2. Ensure dynamic state sync variables.\n3. Run validation linters often.",
        "Excellent query. To analyze this further, let us explore the structural integrity of your scribble inputs. Fluid interactions require high contrast design pairings."
      ];
      const randomAnswer = mockAnswers[Math.floor(Math.random() * mockAnswers.length)];
      
      setSpeechAndAppend(sessionId, assistantMsgId, `**[Offline Mock Fallback Layer Activated]**\n\n${randomAnswer}`);
      setIsGenerating(false);
      setGeneratingMessageId(null);
    }
  };

  const setSpeechAndAppend = (sessionId: string, msgId: string, text: string) => {
    setSessions((currentSessions) =>
      currentSessions.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: s.messages.map((m) => {
              if (m.id === msgId) {
                return { ...m, content: text };
              }
              return m;
            })
          };
        }
        return s;
      })
    );
  };

  // Filter sessions matching user search parameters with safeguards
  const filteredSessions = (sessions || []).filter((s) => {
    if (!s) return false;
    const q = (searchQuery || "").toLowerCase();
    const titleMatch = (s.title || "").toLowerCase().includes(q);
    const messagesMatch = Array.isArray(s.messages) && s.messages.some((m) => m && m.content && m.content.toLowerCase().includes(q));
    return titleMatch || messagesMatch;
  });

  return (
    <div className={`min-h-screen bg-natural-bg text-natural-text ${theme === "dark" ? "theme-dark" : "theme-default"}`}>
      {stage === "lander" ? (
        <BackgroundPaths title="Stone AI" subtitle="Premium logic framework with advanced whiteboard, thinking traces, voice notes, and fast fallback servers." onStart={handleStartApp} />
      ) : stage === "auth" ? (
        <AuthUI onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="flex w-full h-screen h-[100dvh] bg-natural-bg text-natural-text font-sans overflow-hidden relative">
          
          {isShaderBgActive && (
            <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
              <ShaderBackground />
            </div>
          )}
          
          {/* Mobile Header Banner */}
          <div className="md:hidden flex items-center justify-between w-full h-14 border-b border-natural-border bg-natural-aside px-4 fixed top-0 left-0 z-30">
            <div className="flex items-center gap-2">
              <Menu className="h-5 w-5 cursor-pointer text-natural-dark" onClick={() => setIsMobileSidebarOpen(true)} />
              <h1 className="font-serif italic font-bold text-natural-dark text-base">Stone AI</h1>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCanvas(!showCanvas)}
                className="h-8 px-2.5 text-xs flex items-center gap-1 border-natural-border bg-white text-natural-text rounded-full"
              >
                <Paintbrush className="h-3.5 w-3.5 text-natural-accent" />
                Scribble
              </Button>
            </div>
          </div>
  
          {/* Desktop & Mobile Sidebar Tray */}
          <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-natural-aside border-r border-natural-border transform ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${isSidebarHidden ? "md:hidden" : "md:flex"} md:relative transition-transform duration-300 flex flex-col h-full shadow-lg md:shadow-none`}>
            
            {/* Sidebar Banner Header */}
            <div className="px-4 py-4 flex items-center justify-between border-b border-natural-border bg-natural-aside shrink-0">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-natural-accent" />
                <div className="flex flex-col">
                  <span className="font-serif italic font-bold text-sm tracking-tight text-natural-dark">Stone AI Workspace</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-natural-accent font-semibold">System Active</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {/* Desktop Hide Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsSidebarHidden(true)}
                  className="hidden md:inline-flex p-1 rounded-full text-natural-muted hover:text-natural-text hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                  title="Hide Sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
                <button className="md:hidden p-1 rounded-full text-natural-muted hover:text-natural-text" onClick={() => setIsMobileSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* +New Message Block (as requested) */}
            <div className="p-3 bg-natural-aside shrink-0 border-b border-natural-border/30">
              <Button
                onClick={() => handleCreateNewThread()}
                className="w-full h-10 bg-[#6B705C] hover:bg-[#4A4A40] text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>+ New message</span>
              </Button>
            </div>

            {/* Search Box: Searc Obrolan / Cari Obrolan (as requested) */}
            <div className="p-3 bg-natural-aside shrink-0 border-b border-natural-border/40">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#8A8A7C]" />
                <input
                  type="text"
                  placeholder="Cari Obrolan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-black border border-natural-border rounded-xl text-xs text-natural-text placeholder-natural-muted focus:outline-none focus:ring-1 focus:ring-natural-accent transition-all"
                />
              </div>
            </div>

            {/* Scrollable Organizers & Lists Column (Interactive Project, Perpustakaan, Aplikasi, Codex, Sematkan) */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2.5 scrollbar-thin select-none">
              
              {/* ----------------- ORGANIZER SECTIONS ----------------- */}

              {/* 1. PROJECT (as requested) */}
              <div className="border border-natural-border/40 rounded-xl bg-white/40 dark:bg-[#242420]/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsProjectOpen(!isProjectOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-natural-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer bg-transparent border-0"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-[#6B705C]" />
                    <span>Project</span>
                  </div>
                  <span className="text-[10px] text-natural-muted">{isProjectOpen ? "▲" : "▼"}</span>
                </button>
                {isProjectOpen && (
                  <div className="px-2 pb-2 pt-0.5 space-y-1.5 border-t border-natural-border/20 text-[11px] animate-fade-in text-natural-muted">
                    <div className="px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center justify-between" onClick={() => setInputPrompt("Tolong petakan struktur modul utama sistem ini.")}>
                      <span>📁 Core Sandbox</span>
                      <span className="bg-emerald-500/10 text-emerald-600 px-1 rounded text-[9px] uppercase font-mono">active</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center justify-between" onClick={() => setInputPrompt("Buatlah rancangan database relasional untuk sistem e-commerce.")}>
                      <span>📁 Web Enterprise</span>
                      <span className="text-[9px] font-mono opacity-60">12 chats</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. PERPUSTAKAAN / LIBRARY (as requested) */}
              <div className="border border-natural-border/40 rounded-xl bg-white/40 dark:bg-[#242420]/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsPerpustakaanOpen(!isPerpustakaanOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-natural-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer bg-transparent border-0"
                >
                  <div className="flex items-center gap-2">
                    <Book className="h-4 w-4 text-[#6B705C]" />
                    <span>Perpustakaan</span>
                  </div>
                  <span className="text-[10px] text-natural-muted">{isPerpustakaanOpen ? "▲" : "▼"}</span>
                </button>
                {isPerpustakaanOpen && (
                  <div className="px-2 pb-2 pt-0.5 space-y-1 animate-fade-in text-[11px] text-natural-muted border-t border-natural-border/20">
                    <button
                      type="button"
                      onClick={() => setInputPrompt("Tolong ringkas paragraf berikut secara padat dan berikan poin-poin kunci utama:\n\n")}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-[#6B705C]/15 hover:text-natural-dark transition-all truncate bg-transparent border-0"
                    >
                      📝 Ringkas Teks Padat
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputPrompt("Dapatkah Anda meninjau kode berikut, mencari potensi bug, mengoptimalkannya, dan menulis versinya yang paling bersih?\n\n```js\n\n```")}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-[#6B705C]/15 hover:text-natural-dark transition-all truncate bg-transparent border-0"
                    >
                      💻 Review Kode JS/TS
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputPrompt("Bantu saya memperbaiki gaya penulisan kalimat berikut agar terdengar lebih profesional, berciri khas, dan mengalir baik:\n\n")}
                      className="w-full text-left px-2 py-1.5 rounded hover:bg-[#6B705C]/15 hover:text-natural-dark transition-all truncate bg-transparent border-0"
                    >
                      ✨ Perbaiki Gaya Tulisan
                    </button>
                  </div>
                )}
              </div>

              {/* 3. APLIKASI / APPS (as requested) */}
              <div className="border border-natural-border/40 rounded-xl bg-white/40 dark:bg-[#242420]/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsAplikasiOpen(!isAplikasiOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-natural-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer bg-transparent border-0"
                >
                  <div className="flex items-center gap-2">
                    <AppWindow className="h-4 w-4 text-[#6B705C]" />
                    <span>Aplikasi</span>
                  </div>
                  <span className="text-[10px] text-natural-muted">{isAplikasiOpen ? "▲" : "▼"}</span>
                </button>
                {isAplikasiOpen && (
                  <div className="px-2 pb-2 pt-0.5 space-y-1 animate-fade-in text-[11px] text-[#4A4A40] border-t border-natural-border/20">
                    <div 
                      onClick={() => setShowCanvas(!showCanvas)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2 text-natural-muted font-bold"
                    >
                      <Paintbrush className="h-3.5 w-3.5 text-natural-accent" />
                      <span>Drawboard Sketcher</span>
                    </div>
                    <div 
                      onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                      className="px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2 text-natural-muted font-bold"
                    >
                      <Mic className="h-3.5 w-3.5 text-amber-500" />
                      <span>Voice Audio Transcribe</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. CODEX (as requested) */}
              <div className="border border-natural-border/40 rounded-xl bg-white/40 dark:bg-[#242420]/20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsCodexOpen(!isCodexOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-natural-dark hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer bg-transparent border-0"
                >
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-[#6B705C]" />
                    <span>Codex</span>
                  </div>
                  <span className="text-[10px] text-natural-muted">{isCodexOpen ? "▲" : "▼"}</span>
                </button>
                {isCodexOpen && (
                  <div className="px-2 pb-2 pt-0.5 space-y-1.5 animate-fade-in text-[11px] text-natural-muted border-t border-natural-border/20">
                    <div className="px-2.5 py-1 rounded hover:bg-black/5 cursor-pointer font-mono" onClick={() => setInputPrompt("Tulis fungsi sorting Quicksort di TypeScript secara efisien.")}>
                      ⚡ quicksort.ts
                    </div>
                    <div className="px-2.5 py-1 rounded hover:bg-black/5 cursor-pointer font-mono" onClick={() => setInputPrompt("Berikan struktur dasar React component menggunakan Tailwind CSS.")}>
                      ⚡ component.tsx
                    </div>
                  </div>
                )}
              </div>

              {/* 📌 SEMATKAN HISTORY SECTION (as requested) */}
              <div className="border border-natural-border/40 rounded-xl bg-amber-50/20 dark:bg-amber-950/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsPinnedGroupOpen(!isPinnedGroupOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-[#b58900] dark:text-amber-400 hover:bg-black/5 transition-all cursor-pointer bg-transparent border-0"
                >
                  <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span>Sematkan History</span>
                  </div>
                  <span className="text-[10px]">{isPinnedGroupOpen ? "▲" : "▼"}</span>
                </button>
                
                {isPinnedGroupOpen && (
                  <div className="p-1 space-y-1 border-t border-natural-border/20 animate-fade-in">
                    {(sessions || []).filter(s => s && s.isPinned).length === 0 ? (
                      <div className="px-3 py-2.5 text-[10px] text-natural-muted italic leading-normal text-center">
                        Belum ada obrolan disematkan. Klik ikon Pin di daftar history untuk menyematkan!
                      </div>
                    ) : (
                      (sessions || []).filter(s => s && s.isPinned).map((s) => {
                        const isActive = s.id === activeSessionId;
                        return (
                          <div
                            key={`pinned-${s.id}`}
                            onClick={() => {
                              setActiveSessionId(s.id);
                              setSelectedModel(s.model || "anthropic/claude-haiku-4-5");
                              setThinkingEnabled(!!s.thinkingEnabled);
                              setIsMobileSidebarOpen(false);
                            }}
                            className={`group flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-all ${
                              isActive 
                                ? "bg-natural-accent/15 text-natural-text font-bold" 
                                : "text-natural-dark hover:bg-natural-border/30"
                            }`}
                          >
                            <div className="flex flex-col overflow-hidden w-full mr-2">
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                <span className="text-xs truncate font-medium">{s.title}</span>
                              </div>
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono ml-5 mt-0.5">
                                Pencipta: {s.creator || "Dapp."}
                              </span>
                            </div>

                            <div className="flex items-center gap-0.5">
                              {/* Unpin Action */}
                              <button
                                type="button"
                                onClick={(e) => handleTogglePinSession(s.id, e)}
                                className="p-1 rounded hover:bg-black/5 text-[#8A8A7C] hover:text-amber-600 transition-all cursor-pointer shrink-0 border-0 bg-transparent"
                                title="Lepas Pin"
                              >
                                <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* ----------------- STANDARD CONVERSATION HISTORY QUEUE ----------------- */}
              <div className="pt-2 border-t border-natural-border/30">
                <div className="px-2 pb-1.5 text-[10px] font-bold text-natural-muted uppercase tracking-wider">
                  Riwayat Obrolan ({filteredSessions.length})
                </div>
                
                <div className="space-y-1">
                  {filteredSessions.length === 0 ? (
                    <div className="text-center py-6 text-[#8A8A7C] text-xs">
                      Tidak ada rekaman obrolan.
                    </div>
                  ) : (
                    filteredSessions.map((s) => {
                      const isActive = s.id === activeSessionId;
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setActiveSessionId(s.id);
                            setSelectedModel(s.model || "anthropic/claude-haiku-4-5");
                            setThinkingEnabled(!!s.thinkingEnabled);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`group flex items-center justify-between px-2.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                            isActive 
                              ? "bg-natural-accent/15 text-natural-text font-bold border-l-2 border-natural-accent" 
                              : "text-natural-dark hover:bg-natural-border/30"
                          }`}
                        >
                          <div className="flex flex-col overflow-hidden w-[75%] mr-1">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70 text-natural-accent" />
                              <span className="text-xs truncate font-medium text-inherit">
                                {s.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-natural-muted font-mono ml-5 mt-0.5">
                              Pencipta: {s.creator || "Dapp."}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Edit/Rename Action */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newTitle = prompt("Ubah Nama Obrolan:", s.title);
                                if (newTitle && newTitle.trim()) {
                                  handleRenameSession(s.id, newTitle);
                                }
                              }}
                              className="p-1 rounded hover:bg-natural-border/40 text-natural-muted hover:text-natural-accent transition-all shrink-0 cursor-pointer border-0 bg-transparent"
                              title="Ubah Nama"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>

                            {/* Pin Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => handleTogglePinSession(s.id, e)}
                              className="p-1 rounded hover:bg-natural-border/40 text-natural-muted hover:text-amber-500 transition-all shrink-0 cursor-pointer border-0 bg-transparent"
                              title={s.isPinned ? "Lepas Pin" : "Sematkan"}
                            >
                              <Pin className={`h-3 w-3 ${s.isPinned ? "text-amber-500 fill-amber-500" : "opacity-40"}`} />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteSession(s.id, e)}
                              className="p-1 rounded hover:bg-natural-border/40 text-natural-muted hover:text-red-500 transition-all shrink-0 cursor-pointer border-0 bg-transparent"
                              title="Hapus Obrolan"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* User Profile Footer row with Account details / Log out / Settings (as requested) */}
            <div className="p-3 border-t border-[#D6D6CC] bg-[#E5E5DC]/70 flex flex-col gap-2.5 shrink-0">
              
              {/* Account Information display card */}
              <div className="flex items-center gap-2 bg-white dark:bg-black p-2 rounded-xl border border-natural-border/30">
                <div className="h-8 w-8 bg-[#D6D6CC] flex items-center justify-center rounded-lg shrink-0">
                  <User className="h-4 w-4 text-[#6B705C]" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[11px] font-extrabold text-[#2C2C28] truncate" title={userEmail}>
                    {userEmail || "ewatyua@gmail.com"}
                  </span>
                  <span className="text-[9px] text-[#8A8A7C] font-mono tracking-wider uppercase font-bold">
                    Pro Account Workspace
                  </span>
                </div>
              </div>

              {/* Premium Plan upgrade banner / trigger */}
              <button
                type="button"
                onClick={() => setIsPricingOpen(true)}
                className="w-full h-8 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Lihat Pricing Plans (Langganan)</span>
              </button>

              {/* Action operations buttons bar (Logout & Settings) */}
              <div className="grid grid-cols-2 gap-2">
                {/* Settings Trigger Icon Button (as requested) */}
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="h-8 border-[#D6D6CC] bg-white text-natural-text hover:text-natural-accent hover:border-natural-accent text-[11px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Setting</span>
                </Button>

                {/* Log Out button (as requested) */}
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleLogout}
                  className="h-8 border-[#D6D6CC] bg-white text-[#8A8A7C] hover:text-red-650 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-[11px] rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar</span>
                </Button>
              </div>

            </div>
          </div>

        {/* Central Core Brain Frame */}
        <div className="flex-1 flex flex-col h-full bg-natural-bg pt-14 md:pt-0 relative">
          
          {/* Header controls pane */}
          <div className="h-16 border-b border-natural-border px-6 flex items-center justify-between bg-natural-aside shrink-0 z-20">
            
            {/* Thread detail & show/hide controls */}
            <div className="flex items-center gap-3">
              {/* Sidebar toggle button */}
              <button
                type="button"
                onClick={() => setIsSidebarHidden(!isSidebarHidden)}
                className="hidden md:inline-flex p-2 hover:bg-[#D6D6CC]/50 rounded-lg text-natural-accent cursor-pointer transition-all items-center gap-1.5 focus:outline-none"
                title={isSidebarHidden ? "Show History Sidebar" : "Hide History Sidebar"}
              >
                <Menu className="h-4.5 w-4.5" />
                <span className="text-xs font-bold font-mono">
                  {isSidebarHidden ? "Show History" : "Hide History"}
                </span>
              </button>

              <div className="hidden sm:flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-natural-accent" />
                <h1 className="font-serif italic font-bold text-sm tracking-tight text-natural-dark truncate max-w-sm">
                  {activeSession ? activeSession.title : "Unassigned Probe Segment"}
                </h1>
                {activeSession && (
                  <span className="hidden md:inline-block text-[10px] bg-[#E5E5DC] dark:bg-[#2C2C28] text-natural-muted font-bold px-2 py-0.5 rounded-full border border-natural-border/30">
                    Pencipta: <span className="text-[#3B82F6]">{activeSession.creator || "Dapp."}</span>
                  </span>
                )}
              </div>
            </div>

            {/* AI Custom Controllers */}
            <div className="flex flex-wrap items-center gap-3">

              {/* Model Choice selector dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="px-4 py-1.5 bg-[#6B705C] hover:bg-[#4A4A40] text-white text-xs rounded-full font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Choose active model"
                >
                  <span>AI: {MODEL_LIST.find((m) => m.id === selectedModel)?.name || "Select AI"}</span>
                  <span className="text-[10px] opacity-75">▼</span>
                </button>
                
                {isModelDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1A1A17] border border-natural-border rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-natural-border animate-fade-in text-natural-text">
                    {MODEL_LIST.map((model) => {
                      const isCur = selectedModel === model.id;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            handleModelSelect(model.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-[#D6D6CC]/30 transition-all block cursor-pointer ${
                            isCur ? "text-[#6B705C] bg-[#D6D6CC]/20" : "text-natural-dark"
                          }`}
                        >
                          <div className="font-bold">{model.name}</div>
                          <div className="text-[10px] text-natural-muted font-normal">{model.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Deep Thinking Toggle Selector */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={thinkingEnabled}
                  onChange={handleToggleThinking}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-[#D6D6CC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6B705C]" />
                <span className="text-xs font-bold text-[#6B705C] uppercase tracking-wide">
                  Thinking
                </span>
              </label>

              {/* Scribble canvas drawer launcher Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCanvas(!showCanvas)}
                className="hidden sm:inline-flex border-[#D6D6CC] rounded-full h-9 text-xs font-bold gap-2 bg-white text-[#2C2C28] shrink-0 cursor-pointer"
              >
                <Paintbrush className="h-4 w-4 text-[#6B705C]" />
                Drawboard Whiteboard
              </Button>
            </div>
          </div>

          {/* Messages Logs Streams */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-natural-bg scrollbar-thin">
            {!activeSession || activeSession.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
                <Compass className="h-10 w-10 text-[#D6D6CC] animate-spin mb-4" />
                <h3 className="font-serif italic font-bold text-sm text-[#4A4A40] mb-1">State Context Empty</h3>
                <p className="text-xs text-[#8A8A7C]">
                  Supply cognitive probe parameters below. Turn on **Thinking Toggle** to activate analytical thoughts.
                </p>
                
                {/* Seed button helper */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const samplePrompt = "Could you explain what makes deep structures durably stable? Elaborate in bullet points.";
                    setInputPrompt(samplePrompt);
                  }}
                  className="mt-4 text-xs font-medium border-[#D6D6CC] rounded-full flex items-center gap-1 bg-white text-[#2C2C28]"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-600" />
                  Try Sample Prompt
                </Button>
              </div>
            ) : (
              activeSession.messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <motion.div
                    key={m.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-4 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                  >
                    {/* Role Launcher Avatar */}
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser 
                        ? "bg-[#6B705C] border border-[#4A4A40] text-white font-bold" 
                        : "bg-[#E5E5DC] border border-[#D6D6CC] text-[#6B705C]"
                    }`}>
                      {isUser ? (<User className="h-4 w-4" />) : (<Sparkles className="h-4 w-4" />)}
                    </div>

                    {/* Speech box wrapper */}
                    <div className="flex flex-col space-y-1.5 max-w-md sm:max-w-xl">
                      {/* Name metadata banner */}
                      <div className={`flex items-center gap-2 text-[10px] text-[#8A8A7C] font-mono ${isUser ? "justify-end" : "justify-start"}`}>
                        <span className="font-bold">{isUser ? "You" : m.modelUsed || "Stone AI"}</span>
                        <span>•</span>
                        <span>{m.timestamp}</span>
                      </div>

                      {/* Content bubble */}
                      <div className={`px-4 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed border ${
                        isUser 
                          ? "bg-blue-600 border-blue-600 text-white rounded-tr-none" 
                          : "bg-white dark:bg-[#111827] border-natural-border text-natural-text rounded-tl-none"
                      }`}>
                        
                        {/* Deepseek-style collapsible thinking steps panels */}
                        {!isUser && m.thinking && generatingMessageId !== m.id && (
                          <details className="mb-3 group" open>
                            <summary className="list-none flex items-center gap-1.5 text-xs text-[#8A8A7C] font-mono font-bold select-none cursor-pointer outline-none">
                              <RefreshCw className="h-3 w-3 text-[#6B705C] animate-spin" />
                              <span>Thinking Process</span>
                              {m.thinkingTimeSeconds && (
                                <span className="text-[10px] text-[#8A8A7C] font-light">
                                  ({m.thinkingTimeSeconds}s calculated)
                                  </span>
                              )}
                              <span className="ml-1 text-[10px] opacity-40 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            
                            <div className="mt-2 text-xs font-mono text-natural-dark bg-natural-aside/40 p-3 rounded-xl border border-natural-border leading-relaxed whitespace-pre-line pl-4 border-l-2 border-natural-accent">
                              {m.thinking}
                            </div>
                          </details>
                        )}

                        {/* Speech text payload formatted with markdown-fallback lines */}
                        <div className="whitespace-pre-wrap select-text selection:bg-[#D6D6CC]/80">
                          {generatingMessageId === m.id ? (
                            <span className="inline-flex items-center gap-1.5 py-1 text-natural-accent">
                              <span className="w-2.5 h-2.5 bg-natural-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="w-2.5 h-2.5 bg-natural-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="w-2.5 h-2.5 bg-natural-accent rounded-full animate-bounce"></span>
                              <span className="w-2.5 h-2.5 bg-natural-accent rounded-full animate-bounce [animation-delay:0.15s]"></span>
                            </span>
                          ) : (
                            renderCleanMessageText(m.content)
                          )}
                        </div>

                        {/* Premium AI Assistant Action control footer bar */}
                        {!isUser && generatingMessageId !== m.id && (
                          <div className="mt-4 pt-2.5 border-t border-natural-border/30 flex items-center justify-between text-[11px] text-natural-muted font-mono select-none">
                            {/* Stats section */}
                            <div className="flex items-center gap-2">
                              <span>
                                {m.content ? m.content.split(/\s+/).filter(Boolean).length : 0} words
                              </span>
                              <span>•</span>
                              <span>
                                {m.content ? m.content.length : 0} chars
                              </span>
                            </div>

                            {/* Action buttons drawer */}
                            <div className="flex items-center gap-2">
                              {/* Copy Response text trigger */}
                              <button
                                type="button"
                                onClick={() => handleCopyText(m.id || `msg-${idx}`, m.content)}
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 hover:text-natural-text transition-all cursor-pointer border-0 bg-transparent text-[10px]"
                                title="Copy reply to clipboard"
                              >
                                {copiedMessageId === (m.id || `msg-${idx}`) ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {/* Speak Audio / TTS Reader trigger */}
                              <button
                                type="button"
                                onClick={() => handleToggleSpeak(m.id || `msg-${idx}`, m.content)}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer border-0 bg-transparent text-[10px] ${
                                  playingAudioMsgId === (m.id || `msg-${idx}`)
                                    ? "text-amber-600 dark:text-amber-400 font-bold"
                                    : ""
                                }`}
                                title="Listen to response"
                              >
                                <Volume2 className={`h-3 w-3 ${playingAudioMsgId === (m.id || `msg-${idx}`) ? "animate-pulse" : ""}`} />
                                <span>{playingAudioMsgId === (m.id || `msg-${idx}`) ? "Stop" : "Read"}</span>
                              </button>

                              {/* Regenerate Trigger - only shown for the last AI response in active chat session */}
                              {idx === activeSession.messages.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRegenerate(m.id || "")}
                                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 hover:text-natural-text transition-all cursor-pointer text-[#6B705C] border-0 bg-transparent text-[10px]"
                                  title="Regenerate this response"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  <span>Regenerate</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* File Attachment previews rendered in balloon logs */}
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-in pt-2 border-t border-[#D6D6CC]/30">
                            {m.attachments.map((attach, aIdx) => {
                              const isImg = attach.type.startsWith("image/");
                              const isAudio = attach.type.startsWith("audio/");
                              
                              return (
                                <div
                                  key={aIdx}
                                  className="p-2 bg-[#E5E5DC]/30 rounded-xl border border-[#D6D6CC] flex items-center gap-2 overflow-hidden"
                                >
                                  {isImg ? (
                                    <>
                                      <ImageIcon className="h-4 w-4 text-[#6B705C] shrink-0" />
                                      <span className="text-xs font-mono font-medium truncate flex-1 text-[#2C2C28]">
                                        {attach.name}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setLightboxImage(`data:${attach.type};base64,${attach.base64}`)}
                                        className="h-6 w-6 text-[#6B705C] hover:text-[#2C2C28] shrink-0 cursor-pointer"
                                        title="View larger"
                                      >
                                        <Maximize2 className="h-3 w-3" />
                                      </Button>
                                    </>
                                  ) : isAudio ? (
                                    <>
                                      <Volume2 className="h-4 w-4 text-[#6B705C] shrink-0 animate-pulse" />
                                      <div className="flex flex-col overflow-hidden flex-1">
                                        <span className="text-[11px] font-bold text-[#2C2C28] truncate">
                                          {attach.name}
                                        </span>
                                        <span className="text-[9px] font-mono text-[#8A8A7C]">
                                          {(attach.size / 1024).toFixed(1)} KB
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <FileText className="h-4 w-4 text-[#6B705C] shrink-0" />
                                      <div className="flex flex-col overflow-hidden flex-1">
                                        <span className="text-[11px] font-bold text-[#2C2C28] truncate">
                                          {attach.name}
                                        </span>
                                        <span className="text-[9px] font-mono text-[#8A8A7C]">
                                          {(attach.size / 1024).toFixed(1)} KB
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Voice waveform details player */}
                        {m.voiceNote && (
                          <div className="mt-3 p-3 bg-[#E5E5DC]/40 rounded-xl border border-[#D6D6CC] flex flex-col gap-2">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => {
                                  const sound = new Audio(m.voiceNote?.objectUrl);
                                  sound.play().catch(() => {
                                    alert("Playing sound clips requires user interactive trigger.");
                                  });
                                }}
                                className="h-7 w-7 bg-[#6B705C] hover:bg-[#4A4A40] text-white rounded-full flex items-center justify-center shrink-0 shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
                                title="Play voice recording"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                              </button>
                              
                              {/* Audio peak graphic indicators */}
                              <div className="flex items-center gap-1.5 h-6 flex-1">
                                {m.voiceNote.waveformPeaks.map((peak, pI) => (
                                  <div
                                    key={pI}
                                    style={{ height: `${Math.round(peak * 0.25)}px` }}
                                    className="w-1 bg-[#6B705C]/70 rounded-full"
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] font-mono text-[#8A8A7C]">{m.voiceNote.durationSeconds}s</span>
                            </div>
                            
                            <div className="text-[11px] text-[#6B705C] dark:text-[#D6D6CC] font-medium border-l border-[#6B705C] pl-2 whitespace-pre-wrap">
                              "{m.voiceNote.transcript || "Automatic Speech-to-Text transcript synchronized."}"
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

            <div ref={threadEndRef} />
          </div>

          {/* Active file attachments thumbnails bar draft */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="px-6 py-2.5 bg-[#E5E5DC]/35 border-t border-[#D6D6CC] flex flex-wrap gap-2.5 z-15 relative"
              >
                {attachedFiles.map((f, i) => {
                  const isImg = f.type.startsWith("image/");
                  return (
                    <div
                      key={i}
                      className="px-3 py-1.5 bg-white rounded-full border border-[#D6D6CC] flex items-center gap-2"
                    >
                      {isImg ? (
                        <h4 className="flex items-center gap-1.5 text-xs text-[#2C2C28]">
                          <ImageIcon className="h-3.5 w-3.5 text-[#6B705C]" />
                          <span className="truncate max-w-[120px] font-medium">{f.name}</span>
                        </h4>
                      ) : (
                        <h4 className="flex items-center gap-1.5 text-xs text-[#2C2C28]">
                          <FileText className="h-3.5 w-3.5 text-[#6B705C]" />
                          <span className="truncate max-w-[120px] font-medium">{f.name}</span>
                        </h4>
                      )}
                      
                      <button
                        onClick={() => handleRemoveAttachment(i)}
                        className="p-0.5 rounded-full hover:bg-[#F2F2EB] text-[#8A8A7C] hover:text-red-650 cursor-pointer"
                        title="Remove file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* User vocal note capture dialog */}
          <AnimatePresence>
            {isRecordingVoice && (
              <div className="px-6 py-3 border-t border-[#D6D6CC] bg-[#2C2C28] z-20">
                <AudioRecorder
                  onAttachAudio={handleAttachVoiceNote}
                  onCancel={() => setIsRecordingVoice(false)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Text input prompt editor */}
          <div className="p-4 border-t border-natural-border bg-natural-aside flex flex-col gap-3 shrink-0 z-10">
            
            {/* Quick auxiliary trigger modes row */}
            <div className="flex flex-wrap gap-2 pb-1.5 border-b border-natural-border/40 select-none">
              {/* Mode: Create Image */}
              <button
                type="button"
                onClick={() => setCreateImageMode(!createImageMode)}
                className={`px-3 py-1 bg-white dark:bg-black border rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  createImageMode
                    ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "border-natural-border text-natural-muted hover:text-natural-text"
                }`}
                title="Scribble AI images or diagrams directly into workspace"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Create Image</span>
              </button>

              {/* Mode: Thinking */}
              <button
                type="button"
                onClick={handleToggleThinking}
                className={`px-3 py-1 bg-white dark:bg-black border rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  thinkingEnabled
                    ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "border-natural-border text-natural-muted hover:text-natural-text"
                }`}
                title="Deep cognitive reasoning paths"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${thinkingEnabled ? "animate-spin" : ""}`} />
                <span>Thinking</span>
              </button>

              {/* Mode: Global Search */}
              <button
                type="button"
                onClick={() => setGlobalSearchMode(!globalSearchMode)}
                className={`px-3 py-1 bg-white dark:bg-black border rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  globalSearchMode
                    ? "border-blue-500/50 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "border-natural-border text-natural-muted hover:text-natural-text"
                }`}
                title="Incorporate search citations"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Global Search</span>
              </button>

              {/* Mode: Riset Mendalam (Deep Research) */}
              <button
                type="button"
                onClick={() => setDeepResearchMode(!deepResearchMode)}
                className={`px-3 py-1 bg-white dark:bg-black border rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  deepResearchMode
                    ? "border-purple-500/50 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 shadow-sm"
                    : "border-natural-border text-natural-muted hover:text-natural-text"
                }`}
                title="Detailed research frameworks"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Riset Mendalam</span>
              </button>
            </div>

            {/* Prompt Preset Library Chips Wrapper */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
              <span className="text-[10px] uppercase font-bold text-natural-muted tracking-wider shrink-0 mr-1">Premium:</span>
              {[
                { label: "📝 Ringkas Teks", query: "Tolong ringkas paragraf berikut secara padat dan berikan poin-poin kunci utama:\n\n" },
                { label: "💻 Tinjau Kode", query: "Dapatkah Anda meninjau kode berikut, mencari potensi bug, mengoptimalkannya, dan menulis versinya yang paling bersih?\n\n```js\n\n```" },
                { label: "💡 Cari Ide", query: "Saya sedang mencari ide kreatif baru untuk proyek saya. Tolong berikan 5 gagasan inovatif dengan pendekatan unik!" },
                { label: "✨ Perbaiki Gaya", query: "Bantu saya memperbaiki gaya penulisan kalimat berikut agar terdengar lebih profesional, berciri khas, dan mengalir baik:\n\n" }
              ].map((preset, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setInputPrompt(preset.query)}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-white/40 dark:bg-black/40 border border-natural-border/60 hover:border-natural-accent hover:text-natural-accent text-natural-dark hover:bg-white dark:hover:bg-black/20 rounded-lg transition-all shrink-0 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="relative flex items-center">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isGenerating}
                placeholder={
                  isRecordingVoice
                    ? "Microphone active. Record vocal context..."
                    : createImageMode
                    ? "Describe the image you want Stone AI to create..."
                    : "Enter logical parameters for Stone AI..."
                }
                className="w-full pl-4 pr-16 py-4 rounded-xl border border-natural-border bg-white dark:bg-black text-sm text-natural-text placeholder-natural-muted focus:outline-none focus:ring-1 focus:ring-natural-accent resize-none h-14 pr-24 shadow-inner transition-colors duration-200"
              />

              {/* Input Action tools within textbox */}
              <div className="absolute right-3 top-3.5 flex items-center gap-1.5">
                
                {/* File input component trigger */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isGenerating}
                  onClick={handleFileSelectTrigger}
                  className="h-8 w-8 text-[#8A8A7C] hover:text-[#2C2C28] rounded-full p-0 cursor-pointer"
                  title="Upload files"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                {/* Voice notes component toggle pointer */}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isGenerating}
                  onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                  className={`h-8 w-8 rounded-full p-0 cursor-pointer ${
                    isRecordingVoice 
                      ? "text-[#b56576] bg-[#b56576]/10" 
                      : "text-[#8A8A7C] hover:text-[#2C2C28]"
                  }`}
                  title="Record Voice Note"
                >
                  <Mic className="h-4 w-4" />
                </Button>

                {/* Drawboard slide out overlay button representation */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCanvas(!showCanvas)}
                  className={`sm:hidden h-8 w-8 rounded-full p-0 cursor-pointer ${
                    showCanvas 
                      ? "text-[#6B705C] bg-[#6B705C]/10" 
                      : "text-[#8A8A7C] hover:text-[#2C2C28]"
                  }`}
                  title="Draw Scribble"
                >
                  <Paintbrush className="h-4 w-4" />
                </Button>

                <div className="h-4 w-px bg-[#D6D6CC] mx-1" />

                {/* Send action CTA */}
                <Button
                  onClick={handleSendMessage}
                  disabled={isGenerating || (!inputPrompt.trim() && attachedFiles.length === 0)}
                  className="h-8 w-8 bg-[#6B705C] hover:bg-[#4A4A40] text-white rounded-full flex items-center justify-center p-0 cursor-pointer disabled:opacity-45 disabled:pointer-events-none"
                  title="Send parameters"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Quick action buttons row helper */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-[#8A8A7C] gap-2">
              <span className="font-mono">
                Model: <b className="text-[#2C2C28]">{selectedModel && selectedModel.includes("/") ? selectedModel.split("/")[1] : selectedModel || "Default"}</b>
              </span>
              
              <div className="flex items-center gap-1 text-xs">
                <Compass className="h-3.5 w-3.5 text-[#6B705C]" />
                <span>Stone AI system ready. Crafting premium logic frames.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Slide-out Right Panel containing Whiteboard canvas */}
        <AnimatePresence>
          {showCanvas && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 bottom-0 w-[420px] max-w-full h-full z-50 p-4 bg-transparent shrink-0"
            >
              <DrawingCanvas
                onAttachImage={handleAttachDrawboard}
                onClose={() => setShowCanvas(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lightbox Modal overlay for images */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-55 p-6 cursor-zoom-out"
            >
              <div className="max-w-4xl max-h-[85vh] relative flex items-center justify-center overflow-hidden">
                <img
                  src={lightboxImage}
                  alt="Enlarged attachment diagram"
                  className="object-contain max-w-full max-h-full rounded-lg"
                />
                
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-4 right-4 h-10 w-10 bg-black/50 text-white hover:bg-black/75 rounded-full flex items-center justify-center shadow"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings modal (Indonesian / English Custom Panel) */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-55 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-md bg-white dark:bg-[#1C1C18] border border-natural-border rounded-2xl shadow-xl flex flex-col overflow-hidden text-natural-text"
              >
                {/* Header banner */}
                <div className="px-5 py-4 border-b border-natural-border flex items-center justify-between bg-natural-aside">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4.5 w-4.5 text-[#6B705C]" />
                    <span className="font-bold text-sm text-[#2C2C28] uppercase font-mono tracking-wider">Workspace Settings</span>
                  </div>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1 rounded-full text-natural-muted hover:text-natural-text hover:bg-black/5 dark:hover:bg-white/5 border-0 bg-transparent cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Content Area */}
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
                  {/* Account detail specification block */}
                  <div className="p-3.5 rounded-xl border border-natural-border bg-natural-aside/50 space-y-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-natural-muted">Account Information</span>
                    <div className="text-xs text-[#2C2C28] space-y-1">
                      <p><b>Email:</b> {userEmail || "ewatyua@gmail.com"}</p>
                      <p><b>Role:</b> Administrator (Root Client)</p>
                      <p><b>Database Creator (Pencipta):</b> <span className="text-emerald-500 font-bold font-mono">Dapp.</span></p>
                      <p><b>Status:</b> Premium Sandbox Enabled</p>
                    </div>
                  </div>

                  {/* System properties checks block */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-natural-dark block">System Options</label>
                    <div className="space-y-2 text-xs text-natural-muted">
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 font-mono text-[11px]">
                        <span>Mode Pensil / Board Sketcher</span>
                        <span className="text-emerald-500 font-bold">READY</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 font-mono text-[11px]">
                        <span>Sematkan History Mirroring</span>
                        <span className="text-emerald-500 font-bold">ACTIVE</span>
                      </div>
                      
                      {/* WebGL Wave shader toggle */}
                      <button
                        type="button"
                        onClick={() => setIsShaderBgActive(!isShaderBgActive)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-black/5 text-left border-0 bg-transparent cursor-pointer font-mono text-[11px]"
                      >
                        <span className="text-natural-text">WebGL Wave-Flow Background</span>
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                          isShaderBgActive ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" : "bg-[#8A8A7C]/10 text-natural-muted"
                        }`}>
                          {isShaderBgActive ? "ACTIVE" : "DISABLED"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-3 border-t border-natural-border/60">
                    <label className="text-xs font-bold text-red-650 block mb-1.5">Danger Area</label>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        localStorage.removeItem("stone_ai_sessions");
                        window.location.reload();
                      }}
                      className="w-full h-9 border-red-200 text-red-500 hover:bg-red-50 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear All Workspace Records
                    </Button>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="px-5 py-3 border-t border-natural-border bg-natural-aside/40 flex justify-end">
                  <Button
                    onClick={() => setIsSettingsOpen(false)}
                    className="h-8 bg-[#6B705C] hover:bg-[#4A4A40] text-white text-xs font-bold rounded-xl px-4 cursor-pointer"
                  >
                    Close Settings
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing modal (PricingSection6) */}
        <AnimatePresence>
          {isPricingOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-55 p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 30 }}
                className="w-full max-w-5xl bg-white dark:bg-[#0C0C0A] border border-natural-border rounded-3xl shadow-2xl flex flex-col overflow-hidden text-natural-text relative my-8"
              >
                {/* Floating close wrapper */}
                <button
                  type="button"
                  onClick={() => setIsPricingOpen(false)}
                  className="absolute top-4 right-4 z-55 p-2 rounded-full bg-black/10 dark:bg-white/10 text-natural-muted hover:text-natural-text hover:scale-105 border-0 cursor-pointer transition-all"
                  title="Close Pricing Card"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Pricing section inclusion body */}
                <div className="p-1 max-h-[85vh] overflow-y-auto overflow-x-hidden scrollbar-thin">
                  <PricingSection6 />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        </div>
      )}
    </div>
  );
}
