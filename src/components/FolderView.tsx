import React, { useState, useRef, useMemo } from 'react';
import { Folder as FolderType, Note } from '@/types';
import { useFolders } from '@/contexts/FolderContext';
import { ArrowLeft, Upload, FileText, Youtube, Sparkles, Plus, Trash2, ExternalLink, Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import DocumentActionBar from './DocumentActionBar';
import { PDFViewer } from './PDFViewer';
import { getGradientTheme } from '@/lib/folder-themes';
import { generateAIFlashcards, analyzePDFForVideos } from '@/lib/ai';

interface FolderViewProps {
  folder: FolderType;
  onBack: () => void;
}

const FolderView: React.FC<FolderViewProps> = ({ folder, onBack }) => {
  const { folders, getFolderNotes, getFolderYouTubeLinks, getFolderFlashcards, addNote, addYouTubeLink, addFlashcard, deleteNote, deleteYouTubeLink, deleteFlashcard } = useFolders();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [flashcardQuestion, setFlashcardQuestion] = useState('');
  const [flashcardAnswer, setFlashcardAnswer] = useState('');

  // AI Flashcard Feature states
  const [flashcardMode, setFlashcardMode] = useState<'manual' | 'ai'>('manual');
  const [selectedNoteForAI, setSelectedNoteForAI] = useState<string>('');
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [hasGeneratedCardsForSession, setHasGeneratedCardsForSession] = useState(false);

  // AI YouTube Feature states
  const [youtubeMode, setYoutubeMode] = useState<'manual' | 'ai'>('manual');
  const [selectedNoteForYTAI, setSelectedNoteForYTAI] = useState<string>('');
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);

  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const theme = useMemo(() => getGradientTheme(folder.name), [folder.name]);

  // Long press handling
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const LONG_PRESS_DURATION = 500;

  const notes = getFolderNotes(folder.id);
  const youtubeLinks = getFolderYouTubeLinks(folder.id);
  const flashcards = getFolderFlashcards(folder.id);

  const handleLongPressStart = (note: Note) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedNote(note);
    }, LONG_PRESS_DURATION);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMoveNote = (targetFolderId: string) => {
    if (selectedNote) {
      // Delete from current folder and add to new folder
      deleteNote(selectedNote.id);
      addNote({
        ...selectedNote,
        id: Date.now().toString(),
        folderId: targetFolderId,
      });
      const targetFolder = folders.find(f => f.id === targetFolderId);
      toast.success(`Moved to ${targetFolder?.name}`);
      setSelectedNote(null);
    }
  };

  const handleDeleteNote = () => {
    if (selectedNote) {
      deleteNote(selectedNote.id);
      toast.success('Document deleted');
      setSelectedNote(null);
    }
  };

  const handleFavoriteNote = () => {
    toast.success('Added to favorites');
    setSelectedNote(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      addNote({
        id: Date.now().toString(),
        folderId: folder.id,
        title: file.name.replace('.pdf', ''),
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        pdfUrl: URL.createObjectURL(file),
      });
      toast.success('PDF uploaded successfully');
    } else {
      toast.error('Please upload a PDF file');
    }
    e.target.value = '';
  };

  const handleAddYouTubeLink = () => {
    if (youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be')) {
      addYouTubeLink({
        id: Date.now().toString(),
        folderId: folder.id,
        title: 'YouTube Video',
        url: youtubeUrl,
        addedAt: new Date(),
      });
      setYoutubeUrl('');
      toast.success('YouTube link added');
    } else {
      toast.error('Please enter a valid YouTube URL');
    }
  };

  const handleAddFlashcard = () => {
    if (flashcardQuestion.trim() && flashcardAnswer.trim()) {
      addFlashcard({
        id: Date.now().toString(),
        folderId: folder.id,
        question: flashcardQuestion,
        answer: flashcardAnswer,
        createdAt: new Date(),
      });
      setFlashcardQuestion('');
      setFlashcardAnswer('');
      toast.success('Flashcard created');
    }
  };

  const handleGenerateAIFlashcards = async () => {
    const selectedNoteObj = notes.find(n => n.id === selectedNoteForAI);
    if (!selectedNoteObj || !selectedNoteObj.pdfUrl) {
      toast.error('Please select a valid PDF note first');
      return;
    }

    setIsGeneratingCards(true);
    try {
      const generatedCards = await generateAIFlashcards(selectedNoteObj.pdfUrl);

      generatedCards.forEach(c => {
        addFlashcard({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          folderId: folder.id,
          question: c.question,
          answer: c.answer,
          createdAt: new Date(),
        });
      });
      toast.success(`Generated ${generatedCards.length} flashcards!`);
      setHasGeneratedCardsForSession(true);
    } catch (error: any) {
      if (error.message === "cant generate flash card" || error.message.includes("cant generate flash card")) {
        toast.error("cant generate flash card");
      } else {
        toast.error(error.message || "cant generate flash card");
      }
    } finally {
      setIsGeneratingCards(false);
    }
  };

  const handleGenerateAIVideos = async () => {
    const selectedNoteObj = notes.find(n => n.id === selectedNoteForYTAI);
    if (!selectedNoteObj || !selectedNoteObj.pdfUrl) {
      toast.error('Please select a valid PDF note first');
      return;
    }

    setIsGeneratingVideos(true);
    try {
      const suggestedVideos = await analyzePDFForVideos(selectedNoteObj.pdfUrl);

      suggestedVideos.forEach(v => {
        addYouTubeLink({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          folderId: folder.id,
          title: v.title,
          url: v.url,
          addedAt: new Date(),
        });
      });
      toast.success(`Found ${suggestedVideos.length} lecture topics!`);
      setYoutubeMode('manual');
    } catch (error: any) {
      toast.error(error.message || "Failed to find videos");
    } finally {
      setIsGeneratingVideos(false);
    }
  };

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealedCards);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedCards(newRevealed);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border border-border bg-background flex items-center justify-center text-2xl rounded-xl">
            {folder.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{folder.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">
              {notes.length} notes • {flashcards.length} flashcards
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className={`grid w-full grid-cols-3 mb-6 rounded-xl bg-gradient-to-r ${theme.gradient} p-1`}>
          <TabsTrigger value="notes" className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[hsl(220,15%,15%)] data-[state=active]:shadow-sm text-[hsl(220,15%,30%)] dark:text-[hsl(220,15%,75%)]">
            <FileText className="w-4 h-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="youtube" className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[hsl(220,15%,15%)] data-[state=active]:shadow-sm text-[hsl(220,15%,30%)] dark:text-[hsl(220,15%,75%)]">
            <Youtube className="w-4 h-4" />
            YouTube
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-[hsl(220,15%,15%)] data-[state=active]:shadow-sm text-[hsl(220,15%,30%)] dark:text-[hsl(220,15%,75%)]">
            <Sparkles className="w-4 h-4" />
            Flashcards
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          {/* Upload Button */}
          <label className="block">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-border hover:border-foreground/50 rounded-2xl p-8 text-center cursor-pointer transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">Upload PDF</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click to browse or drag and drop
              </p>
            </div>
          </label>

          {/* Notes List */}
          {notes.length > 0 ? (
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setViewingNote(note)}
                  onMouseDown={() => handleLongPressStart(note)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => handleLongPressStart(note)}
                  onTouchEnd={handleLongPressEnd}
                  className={`flex items-center justify-between p-4 border-2 rounded-2xl transition-all duration-200 select-none cursor-pointer ${selectedNote?.id === note.id
                    ? 'border-foreground bg-secondary/50 scale-[0.98]'
                    : 'border-border hover:bg-secondary/30'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-border bg-background flex items-center justify-center rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{note.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatFileSize(note.fileSize)} • {new Date(note.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="text-muted-foreground hover:text-destructive rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No notes yet</p>
              <p className="text-sm">Upload your first PDF to get started</p>
            </div>
          )}
        </TabsContent>

        {/* YouTube Tab */}
        <TabsContent value="youtube" className="space-y-4">
          <div className="flex bg-secondary p-1 rounded-xl mb-4 w-full">
            <Button
              variant={youtubeMode === 'manual' ? 'default' : 'ghost'}
              className={`flex-1 rounded-lg ${youtubeMode === 'manual' ? 'shadow-sm' : ''}`}
              onClick={() => setYoutubeMode('manual')}
            >
              Manual
            </Button>
            <Button
              variant={youtubeMode === 'ai' ? 'default' : 'ghost'}
              className={`flex-1 rounded-lg ${youtubeMode === 'ai' ? 'shadow-sm' : ''}`}
              onClick={() => setYoutubeMode('ai')}
            >
              AI Discover
            </Button>
          </div>

          <div className="border-2 border-border rounded-2xl p-4 space-y-3">
            {youtubeMode === 'manual' ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Paste YouTube URL..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="rounded-xl"
                />
                <Button onClick={handleAddYouTubeLink} disabled={!youtubeUrl} className="rounded-xl">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                {notes.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No PDFs in this folder yet.</p>
                    <p className="text-sm">Upload a PDF in the Notes tab first.</p>
                  </div>
                ) : (
                  <>
                    <select
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedNoteForYTAI}
                      onChange={(e) => setSelectedNoteForYTAI(e.target.value)}
                    >
                      <option value="" disabled>Select a subject PDF...</option>
                      {notes.map(note => <option key={note.id} value={note.id}>{note.title}</option>)}
                    </select>

                    <Button
                      onClick={handleGenerateAIVideos}
                      disabled={!selectedNoteForYTAI || isGeneratingVideos}
                      className="w-full rounded-xl"
                    >
                      {isGeneratingVideos ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Syllabus...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Discover Video Topics
                        </>
                      )}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {youtubeLinks.length > 0 ? (
            <div className="space-y-2">
              {youtubeLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 border-2 border-border rounded-2xl hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 border-2 border-border bg-background flex items-center justify-center flex-shrink-0 rounded-xl">
                      <Youtube className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex flex-col truncate">
                      <p className="font-medium text-sm truncate">{link.title !== 'YouTube Video' ? link.title : link.url}</p>
                      {link.title !== 'YouTube Video' && (
                        <p className="text-xs text-muted-foreground truncate opacity-70 mt-1">{link.url}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => window.open(link.url, '_blank')}
                      className="rounded-xl"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteYouTubeLink(link.id)}
                      className="text-muted-foreground hover:text-destructive rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Youtube className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No YouTube links yet</p>
              <p className="text-sm">Add video links for this subject</p>
            </div>
          )}
        </TabsContent>

        {/* Flashcards Tab */}
        <TabsContent value="flashcards" className="space-y-4">
          <div className="flex bg-secondary p-1 rounded-xl mb-4 w-full">
            <Button
              variant={flashcardMode === 'manual' ? 'default' : 'ghost'}
              className={`flex-1 rounded-lg ${flashcardMode === 'manual' ? 'shadow-sm' : ''}`}
              onClick={() => setFlashcardMode('manual')}
            >
              Manual
            </Button>
            <Button
              variant={flashcardMode === 'ai' ? 'default' : 'ghost'}
              className={`flex-1 rounded-lg ${flashcardMode === 'ai' ? 'shadow-sm' : ''}`}
              onClick={() => setFlashcardMode('ai')}
            >
              AI Generate
            </Button>
          </div>

          <div className="border-2 border-border rounded-2xl p-4 space-y-3">
            {flashcardMode === 'manual' ? (
              <>
                <Input
                  placeholder="Question..."
                  value={flashcardQuestion}
                  onChange={(e) => setFlashcardQuestion(e.target.value)}
                  className="rounded-xl"
                />
                <Input
                  placeholder="Answer..."
                  value={flashcardAnswer}
                  onChange={(e) => setFlashcardAnswer(e.target.value)}
                  className="rounded-xl"
                />
                <Button onClick={handleAddFlashcard} disabled={!flashcardQuestion || !flashcardAnswer} className="w-full rounded-xl">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Flashcard
                </Button>
              </>
            ) : (
              <>
                {notes.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No PDFs in this folder yet.</p>
                    <p className="text-sm">Upload a PDF in the Notes tab first.</p>
                  </div>
                ) : (
                  <>
                    <select
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedNoteForAI}
                      onChange={(e) => setSelectedNoteForAI(e.target.value)}
                    >
                      <option value="" disabled>Select a PDF note...</option>
                      {notes.map(note => <option key={note.id} value={note.id}>{note.title}</option>)}
                    </select>

                    <Button
                      onClick={handleGenerateAIFlashcards}
                      disabled={!selectedNoteForAI || isGeneratingCards}
                      className="w-full rounded-xl"
                    >
                      {isGeneratingCards ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing PDF...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          {hasGeneratedCardsForSession ? "Generate More Cards" : "Generate Cards"}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {flashcards.length > 0 ? (
            <div className="grid gap-3">
              {flashcards.map((card) => (
                <div
                  key={card.id}
                  className="border-2 border-border rounded-2xl p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => toggleReveal(card.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium mb-2">{card.question}</p>
                      {revealedCards.has(card.id) && (
                        <p className="text-muted-foreground border-t border-border pt-2 mt-2 animate-fade-in">
                          {card.answer}
                        </p>
                      )}
                      {!revealedCards.has(card.id) && (
                        <p className="text-sm text-muted-foreground">Click to reveal answer</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFlashcard(card.id);
                      }}
                      className="text-muted-foreground hover:text-destructive rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No flashcards yet</p>
              <p className="text-sm">Create flashcards to test your knowledge</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Document Action Bar */}
      {selectedNote && (
        <DocumentActionBar
          documentName={selectedNote.title}
          folders={folders}
          currentFolderId={folder.id}
          onMove={handleMoveNote}
          onDelete={handleDeleteNote}
          onFavorite={handleFavoriteNote}
          onClose={() => setSelectedNote(null)}
        />
      )}

      {/* PDF Viewer */}
      <PDFViewer
        note={viewingNote}
        open={viewingNote !== null}
        onOpenChange={(open) => !open && setViewingNote(null)}
      />
    </div>
  );
};

export default FolderView;
