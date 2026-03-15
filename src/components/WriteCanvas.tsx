import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  ChevronLeft, Plus, MoreVertical, Keyboard, Pen, Highlighter,
  Eraser, Lasso, Undo2, Redo2, Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, CheckSquare, Type, AlignLeft, Strikethrough,
  Heading1, Heading2, Link as LinkIcon, Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

/* ── Noise SVG for glass texture ── */
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E")`;

/* ── Glass Bar Component ── */
const GlassBar: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => (
  <div
    className={cn('relative overflow-hidden', className)}
    style={{
      background: 'rgba(30,30,30,0.95)',
      backdropFilter: 'blur(12px) saturate(140%)',
      WebkitBackdropFilter: 'blur(12px) saturate(140%)',
      willChange: 'transform',
      ...style,
    }}
  >
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 40%, rgba(255,255,255,0.05) 100%)',
        backgroundSize: '250% 100%',
        animation: 'glass-reflection 8s linear infinite',
        opacity: 0.5,
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: NOISE_SVG,
        backgroundRepeat: 'repeat',
        opacity: 0.3,
        mixBlendMode: 'overlay',
      }}
    />
    <div className="relative z-10 flex items-center justify-center w-full h-full">{children}</div>
  </div>
);

/* ── Drawing stroke type ── */
interface Stroke {
  points: { x: number; y: number; pressure: number }[];
  color: string;
  width: number;
  opacity: number;
  tool: 'pen' | 'highlighter';
}

/* ── Tool Settings Popover ── */
const ToolSettingsPopover: React.FC<{
  tool: 'pen' | 'highlighter';
  strokeWidth: number;
  strokeColor: string;
  strokeOpacity: number;
  onWidthChange: (v: number) => void;
  onColorChange: (v: string) => void;
  onOpacityChange: (v: number) => void;
  children: React.ReactNode;
}> = ({ tool, strokeWidth, strokeColor, strokeOpacity, onWidthChange, onColorChange, onOpacityChange, children }) => {
  const colors = ['#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE', '#FF2D55'];

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={8}
        className="w-56 p-3 border-0"
        style={{
          background: 'rgba(40,40,40,0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p className="text-xs font-medium mb-2" style={{ color: '#9CA3AF' }}>
          {tool === 'pen' ? 'Pen' : 'Highlighter'} Settings
        </p>
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
            <span>Thickness</span>
            <span>{strokeWidth}px</span>
          </div>
          <Slider
            value={[strokeWidth]}
            min={1}
            max={tool === 'highlighter' ? 30 : 12}
            step={1}
            onValueChange={([v]) => onWidthChange(v)}
            className="w-full"
          />
        </div>
        {tool === 'highlighter' && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
              <span>Opacity</span>
              <span>{Math.round(strokeOpacity * 100)}%</span>
            </div>
            <Slider
              value={[strokeOpacity * 100]}
              min={10}
              max={80}
              step={5}
              onValueChange={([v]) => onOpacityChange(v / 100)}
              className="w-full"
            />
          </div>
        )}
        <div className="flex gap-2 flex-wrap mt-1">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className="w-6 h-6 rounded-full transition-transform duration-100"
              style={{
                background: c,
                border: strokeColor === c ? '2px solid hsl(var(--primary))' : '2px solid rgba(255,255,255,0.1)',
                transform: strokeColor === c ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/* ══════════════════════════════════════════ */
/*              WRITE CANVAS                 */
/* ══════════════════════════════════════════ */

type EditorMode = 'text' | 'pen' | 'highlighter' | 'eraser' | 'lasso';

interface WriteCanvasProps {
  onBack?: () => void;
}

const WriteCanvas: React.FC<WriteCanvasProps> = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<EditorMode>('text');
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);

  // Tool settings
  const [penWidth, setPenWidth] = useState(3);
  const [penColor, setPenColor] = useState('#FFFFFF');
  const [hlWidth, setHlWidth] = useState(16);
  const [hlColor, setHlColor] = useState('#FFCC00');
  const [hlOpacity, setHlOpacity] = useState(0.4);

  const isDrawMode = mode === 'pen' || mode === 'highlighter' || mode === 'eraser' || mode === 'lasso';

  // Load from local storage
  useEffect(() => {
    try {
      const savedStrokes = localStorage.getItem('writecanvas_strokes');
      if (savedStrokes) {
        setStrokes(JSON.parse(savedStrokes));
      }
      const savedTitle = localStorage.getItem('writecanvas_title');
      if (savedTitle) {
        setTitle(savedTitle);
      }
    } catch (e) {
      console.error('Failed to parse saved canvas state', e);
    }
  }, []);

  // Save strokes to local storage when they change
  useEffect(() => {
    localStorage.setItem('writecanvas_strokes', JSON.stringify(strokes));
  }, [strokes]);

  /* ── Tiptap Editor ── */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: localStorage.getItem('writecanvas_content') || '',
    editable: !isDrawMode,
    editorProps: {
      attributes: { class: 'outline-none min-h-[60vh]' },
    },
    onUpdate: () => triggerAutoSave(),
    onFocus: () => setIsEditorFocused(true),
    onBlur: () => setTimeout(() => setIsEditorFocused(false), 150),
  });

  useEffect(() => {
    editor?.setEditable(!isDrawMode);
  }, [isDrawMode, editor]);

  const triggerAutoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (titleRef.current) {
        localStorage.setItem('writecanvas_title', titleRef.current.value);
      }
      if (editor) {
        localStorage.setItem('writecanvas_content', editor.getHTML());
      }
    }, 500);
  }, [editor]);

  /* ── Canvas Drawing ── */
  const getCanvasPoint = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  }, []);

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.globalAlpha = stroke.opacity;
    if (stroke.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
    }
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      const prev = stroke.points[i - 1];
      const curr = stroke.points[i];
      const mx = (prev.x + curr.x) / 2;
      const my = (prev.y + curr.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    }
    ctx.stroke();
    ctx.restore();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing strokes
    if (strokes && strokes.length > 0) {
      strokes.forEach((s) => {
        if (s && s.points && s.points.length > 0) {
          drawStroke(ctx, s)
        }
      });
    }

    // Draw current stroke
    if (currentStroke.current && currentStroke.current.points && currentStroke.current.points.length > 0) {
      drawStroke(ctx, currentStroke.current);
    }
  }, [strokes, drawStroke]);

  useEffect(() => { redrawCanvas(); }, [redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      // Prevent resetting width/height to 0 if parent is briefly unmounted
      if (parent.clientWidth === 0 || parent.clientHeight === 0) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      redrawCanvas();
    };

    // Initial resize with a tiny delay to ensure DOM layout is complete
    const timeoutId = setTimeout(resize, 0);
    window.addEventListener('resize', resize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', resize);
    };
  }, [redrawCanvas]);

  const eraseStrokesAtPoint = useCallback((pt: { x: number; y: number }) => {
    setStrokes((prev) => {
      if (!Array.isArray(prev)) return [];

      const newStrokes = prev.filter((s) => {
        if (!s || !s.points || !Array.isArray(s.points)) return false;
        // Keep stroke if NO point is within 20px
        return !s.points.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < 20);
      });

      return newStrokes.length !== prev.length ? newStrokes : prev;
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawMode || mode === 'lasso') return;

    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);

    if (mode === 'eraser') {
      const pt = getCanvasPoint(e);
      eraseStrokesAtPoint(pt);
      return;
    }

    const pt = getCanvasPoint(e);
    const tool = mode as 'pen' | 'highlighter';
    currentStroke.current = {
      points: [pt],
      color: tool === 'pen' ? penColor : hlColor,
      width: tool === 'pen' ? penWidth : hlWidth,
      opacity: tool === 'pen' ? 1 : hlOpacity,
      tool,
    };
  }, [isDrawMode, mode, penColor, penWidth, hlColor, hlWidth, hlOpacity, getCanvasPoint, eraseStrokesAtPoint]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pt = getCanvasPoint(e);

    if (mode === 'eraser') {
      eraseStrokesAtPoint(pt);
      return;
    }

    if (!currentStroke.current || !Array.isArray(currentStroke.current.points)) return;
    currentStroke.current.points.push(pt);
    redrawCanvas();
  }, [isDrawing, mode, getCanvasPoint, redrawCanvas, eraseStrokesAtPoint]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    try {
      (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
    } catch (err) { }

    if (mode === 'eraser') return; // Nothing to commit for eraser

    if (currentStroke.current && Array.isArray(currentStroke.current.points) && currentStroke.current.points.length > 1) {
      setStrokes((prev) => Array.isArray(prev) ? [...prev, currentStroke.current!] : [currentStroke.current!]);
      setRedoStack([]);
    }
    currentStroke.current = null;
    triggerAutoSave();
  }, [isDrawing, mode, triggerAutoSave]);

  const handleDrawUndo = () => {
    setStrokes((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev || [];
      setRedoStack((r) => [...r, prev[prev.length - 1]]);
      return prev.slice(0, -1);
    });
  };
  const handleDrawRedo = () => {
    setRedoStack((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev || [];
      setStrokes((s) => Array.isArray(s) ? [...s, prev[prev.length - 1]] : [prev[prev.length - 1]]);
      return prev.slice(0, -1);
    });
  };

  const handleUndo = () => {
    if (isDrawMode) handleDrawUndo();
    else editor?.commands.undo();
  };
  const handleRedo = () => {
    if (isDrawMode) handleDrawRedo();
    else editor?.commands.redo();
  };

  /* ── Tool Row Items ── */
  const toolItems: { id: EditorMode; icon: React.FC<any>; label: string }[] = [
    { id: 'text', icon: Keyboard, label: 'Text' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'highlighter', icon: Highlighter, label: 'Highlight' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'lasso', icon: Lasso, label: 'Lasso' },
  ];

  /* ── Bottom Formatting Bar Items ── */
  const fmtButtons: Array<{ icon?: React.FC<any>; action?: () => void; active?: boolean; label?: string; sep?: boolean }> = [
    { icon: CheckSquare, action: () => editor?.chain().focus().toggleBulletList().run(), active: false, label: 'Check' },
    { icon: Heading1, action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive('heading', { level: 1 }), label: 'H1' },
    { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }), label: 'H2' },
    { sep: true },
    { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold'), label: 'Bold' },
    { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic'), label: 'Italic' },
    { icon: UnderlineIcon, action: () => editor?.chain().focus().toggleUnderline().run(), active: editor?.isActive('underline'), label: 'Underline' },
    { icon: Strikethrough, action: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive('strike'), label: 'Strike' },
    { sep: true },
    { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList'), label: 'Bullet' },
    { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList'), label: 'Ordered' },
    { icon: Minus, action: () => editor?.chain().focus().setHorizontalRule().run(), active: false, label: 'Divider' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col -mx-6 -mt-6"
      style={{ background: '#000000', minHeight: 'calc(100vh - 80px)' }}
    >
      {/* ── 1. TOP NAVIGATION ── */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          height: 52,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => { setTitle(e.target.value); triggerAutoSave(); }}
          placeholder="Untitled Note"
          className="bg-transparent border-none outline-none text-center font-semibold text-base flex-1 mx-4"
          style={{ color: '#FFFFFF', caretColor: 'hsl(var(--primary))' }}
        />
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl" style={{ color: '#9CA3AF' }}>
            <Plus className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl" style={{ color: '#9CA3AF' }}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── 2. INTEGRATED TOOL ROW ── */}
      <GlassBar
        className="flex items-center justify-center gap-0.5 px-2 shrink-0"
        style={{ height: 44, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {toolItems.map((tool) => {
          const Icon = tool.icon;
          const isActive = mode === tool.id;
          const needsPopover = (tool.id === 'pen' || tool.id === 'highlighter') && isActive;

          const btn = (
            <motion.button
              key={tool.id}
              whileTap={{ scale: 0.93 }}
              transition={{ duration: 0.12 }}
              onClick={() => setMode(tool.id)}
              className={cn(
                'relative flex items-center justify-center p-2 rounded-xl transition-all duration-150',
                isActive ? 'text-primary' : 'text-[#9CA3AF] hover:text-white'
              )}
              style={isActive ? {
                background: 'rgba(255,255,255,0.1)',
              } : undefined}
              title={tool.label}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.6} />
            </motion.button>
          );

          if (needsPopover && tool.id === 'pen') {
            return (
              <ToolSettingsPopover
                key={tool.id}
                tool="pen"
                strokeWidth={penWidth}
                strokeColor={penColor}
                strokeOpacity={1}
                onWidthChange={setPenWidth}
                onColorChange={setPenColor}
                onOpacityChange={() => { }}
              >
                {btn}
              </ToolSettingsPopover>
            );
          }
          if (needsPopover && tool.id === 'highlighter') {
            return (
              <ToolSettingsPopover
                key={tool.id}
                tool="highlighter"
                strokeWidth={hlWidth}
                strokeColor={hlColor}
                strokeOpacity={hlOpacity}
                onWidthChange={setHlWidth}
                onColorChange={setHlColor}
                onOpacityChange={setHlOpacity}
              >
                {btn}
              </ToolSettingsPopover>
            );
          }

          return <React.Fragment key={tool.id}>{btn}</React.Fragment>;
        })}

        {/* Divider */}
        <div className="w-px h-7 mx-1.5" style={{ background: 'rgba(255,255,255,0.12)' }} />

        {/* Undo / Redo */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onMouseDown={(e) => { e.preventDefault(); handleUndo(); }}
          className="p-2.5 rounded-xl text-[#9CA3AF] hover:text-white transition-colors"
        >
          <Undo2 className="w-5 h-5" strokeWidth={1.6} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.93 }}
          onMouseDown={(e) => { e.preventDefault(); handleRedo(); }}
          className="p-2.5 rounded-xl text-[#9CA3AF] hover:text-white transition-colors"
        >
          <Redo2 className="w-5 h-5" strokeWidth={1.6} />
        </motion.button>
      </GlassBar>

      {/* ── 3. CANVAS / EDITOR SURFACE ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ height: 'calc(100vh - 180px)' }}>
        <div style={{ minHeight: 3000, position: 'relative' }} className="w-full">
          {/* Drawing canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{
              zIndex: isDrawMode ? 10 : 0,
              opacity: isDrawMode ? 1 : 0,
              pointerEvents: isDrawMode ? 'auto' : 'none',
              touchAction: 'none',
              cursor: mode === 'eraser' ? 'crosshair' : mode === 'lasso' ? 'default' : 'crosshair',
              transition: 'opacity 150ms ease',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />

          {/* Text editor */}
          <div
            className="absolute inset-0 overflow-visible px-5 pt-5 pb-24 write-canvas-editor"
            style={{
              zIndex: isDrawMode ? 0 : 10,
              opacity: isDrawMode ? 0.3 : 1,
              pointerEvents: isDrawMode ? 'none' : 'auto',
              transition: 'opacity 150ms ease',
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* ── 4. BOTTOM FORMATTING BAR (Text Mode Only) ── */}
      <AnimatePresence>
        {!isDrawMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="sticky bottom-0 z-30 shrink-0"
          >
            <GlassBar
              className="px-2 overflow-x-auto"
              style={{ height: 52, borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-start gap-0.5 min-w-max h-full">
                {fmtButtons.map((item, i) => {
                  if ('sep' in item && item.sep) {
                    return <div key={`s-${i}`} className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />;
                  }
                  const Icon = item.icon!;
                  return (
                    <motion.button
                      key={i}
                      onMouseDown={(e) => { e.preventDefault(); item.action?.(); }}
                      whileTap={{ scale: 0.92 }}
                      className={cn(
                        'p-2.5 rounded-xl transition-all duration-150 shrink-0',
                        item.active ? 'text-primary bg-white/10' : 'text-[#9CA3AF] hover:text-white'
                      )}
                    >
                      <Icon className="w-[18px] h-[18px]" strokeWidth={item.active ? 2.5 : 1.8} />
                    </motion.button>
                  );
                })}
              </div>
            </GlassBar>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WriteCanvas;
