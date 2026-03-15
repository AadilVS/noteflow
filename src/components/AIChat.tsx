import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useFolders } from '@/contexts/FolderContext';
import { ChatMessage } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAIResponse, hasApiKey } from '@/lib/ai';

interface AIChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIChat: React.FC<AIChatProps> = ({ open, onOpenChange }) => {
  const { folders, notes, flashcards } = useFolders();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your study assistant. Ask me anything about your notes, folders, or study materials. For example:\n\n• "How many notes do I have?"\n• "What folders do I have?"\n• "How many flashcards in my Science folder?"',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateContext = () => {
    let contextStr = `The user has ${folders.length} folders, ${notes.length} notes, and ${flashcards.length} flashcards.\n`;

    if (folders.length > 0) {
      contextStr += "Folders:\n";
      folders.forEach(f => {
        const folderNotes = notes.filter(n => n.folderId === f.id);
        const folderFlashcards = flashcards.filter(fc => fc.folderId === f.id);
        contextStr += `- ${f.name} (${folderNotes.length} notes, ${folderFlashcards.length} flashcards)\n`;
        if (folderNotes.length > 0) {
          contextStr += `  Notes: ${folderNotes.map(n => n.title).join(', ')}\n`;
        }
        if (folderFlashcards.length > 0) {
          contextStr += `  Flashcard Qs: ${folderFlashcards.map(fc => fc.question).join(', ')}\n`;
        }
      });
    }
    return contextStr;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!hasApiKey()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Please click the Gear icon in the sidebar to add your free Gemini API key before chatting!',
        timestamp: new Date(),
      }]);
      setInput('');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    const context = generateContext();
    const responseText = await getAIResponse(currentInput, context);

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Study Assistant
          </SheetTitle>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-fade-in ${message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                    ? 'bg-foreground text-background'
                    : 'border border-border bg-background'
                    }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`flex-1 p-3 text-sm ${message.role === 'user'
                    ? 'bg-foreground text-background'
                    : 'border border-border bg-background'
                    }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 border border-border bg-background flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="border border-border bg-background p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Ask about your notes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIChat;
