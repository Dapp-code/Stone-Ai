import React, { useRef, useState, useEffect } from "react";
import { 
  Palette, 
  Trash2, 
  RotateCcw, 
  RotateCw, 
  Check, 
  X, 
  Paintbrush, 
  Eraser, 
  Paperclip, 
  Sliders 
} from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface DrawingCanvasProps {
  onAttachImage: (base64Png: string) => void;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#2C2C28", // Natural Dark
  "#6B705C", // Sage Accent
  "#4A4A40", // Deep Olive
  "#b56576", // Soft Cranberry
  "#3a86c8", // Soft Slate Blue
  "#eab308", // Golden sand
];

export function DrawingCanvas({ onAttachImage, onClose }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#2C2C28");
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  
  // Undo/Redo historical states
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // We increase resolution for retina displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(2, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Draw opaque white background
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rect.width, rect.height);

    // Save initial state
    const initialState = canvas.toDataURL();
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  // Sync stroke parameters
  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = isEraser ? "#ffffff" : color;
    contextRef.current.lineWidth = brushSize;
  }, [color, brushSize, isEraser]);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const currentState = canvas.toDataURL();
    
    // Slice state history if they drew after undoing
    const newHistory = history.slice(0, historyIndex + 1);
    const updated = [...newHistory, currentState];
    
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
    
    // Handle individual dot drawing
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    
    // Prevent scrolling or zooming during touch draws
    if (e.cancelable) {
      e.preventDefault();
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    contextRef.current?.closePath();
    setIsDrawing(false);
    saveCanvasState();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    const rect = canvas.getBoundingClientRect();
    contextRef.current.fillStyle = "#ffffff";
    contextRef.current.fillRect(0, 0, rect.width, rect.height);
    saveCanvasState();
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    restoreStateAtIndex(prevIndex);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    restoreStateAtIndex(nextIndex);
  };

  const restoreStateAtIndex = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const img = new Image();
    img.src = history[index];
    img.onload = () => {
      const rect = canvas.getBoundingClientRect();
      contextRef.current!.clearRect(0, 0, rect.width, rect.height);
      contextRef.current!.drawImage(img, 0, 0, rect.width, rect.height);
      setHistoryIndex(index);
    };
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Export standard image
    const dataUrl = canvas.toDataURL("image/png");
    // Remove metadata prefix to retrieve raw base64
    const base64 = dataUrl.split(",")[1];
    onAttachImage(base64);
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2EB] border border-[#D6D6CC] rounded-2xl shadow-xl overflow-hidden text-[#2C2C28]">
      {/* Header controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#E5E5DC] border-b border-[#D6D6CC]">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-[#6B705C]" />
          <span className="font-serif italic font-bold text-[#4A4A40] text-sm">Stone Drawboard</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="h-8 w-8 cursor-pointer disabled:opacity-30 hover:bg-[#D6D6CC] text-[#2C2C28]"
            title="Undo"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="h-8 w-8 cursor-pointer disabled:opacity-30 hover:bg-[#D6D6CC] text-[#2C2C28]"
            title="Redo"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-8 w-8 cursor-pointer text-red-650 hover:bg-[#D6D6CC] hover:text-red-700"
            title="Clear canvas"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-[#D6D6CC] mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-[#8A8A7C] hover:bg-[#D6D6CC] hover:text-[#2C2C28] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Frame */}
      <div className="flex-1 bg-[#F2F2EB] p-4 flex items-center justify-center relative min-h-[250px]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="bg-white rounded-lg shadow-sm border border-[#D6D6CC] cursor-crosshair touch-none"
        />
      </div>

      {/* Footer Settings */}
      <div className="p-4 bg-white border-t border-[#D6D6CC] flex flex-col gap-4">
        {/* Brush config & Eraser */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Presets and Eraser Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEraser(false)}
              className={`p-1.5 rounded-lg transition-colors border ${
                !isEraser 
                  ? "bg-[#E5E5DC] border-[#D6D6CC] text-[#2C2C28]" 
                  : "border-transparent text-[#8A8A7C] hover:text-[#2C2C28]"
              }`}
              title="Paintbrush"
            >
              <Paintbrush className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`p-1.5 rounded-lg transition-colors border ${
                isEraser 
                  ? "bg-[#E5E5DC] border-[#D6D6CC] text-[#2C2C28]" 
                  : "border-transparent text-[#8A8A7C] hover:text-[#2C2C28]"
              }`}
              title="White Eraser"
            >
              <Eraser className="h-4 w-4" />
            </button>
            
            <div className="h-5 w-px bg-[#D6D6CC] mx-1" />
            
            {!isEraser && (
              <div className="flex items-center gap-1.5 animate-fade-in">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: c }}
                    className={`h-5 w-5 rounded-full ring-offset-2 hover:scale-110 transition-transform ${
                      color === c && !isEraser
                        ? "ring-2 ring-[#6B705C] scale-105"
                        : "ring-0"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Size slider */}
          <div className="flex items-center gap-2 text-[#2C2C28]">
            <Sliders className="h-3.5 w-3.5 text-[#8A8A7C]" />
            <span className="text-xs font-mono text-[#8A8A7C]">{brushSize}px</span>
            <input
              type="range"
              min="2"
              max="35"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 h-1 bg-[#E5E5DC] rounded-lg appearance-none cursor-pointer accent-[#6B705C]"
            />
          </div>
        </div>

        {/* Save/Attach CTA */}
        <Button
          onClick={handleExport}
          className="w-full h-11 bg-[#6B705C] hover:bg-[#4A4A40] text-white font-medium rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
        >
          <Paperclip className="h-4 w-4" />
          Attach Scribble to Chat
        </Button>
      </div>
    </div>
  );
}
