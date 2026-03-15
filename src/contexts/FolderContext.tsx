import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Folder, Note, YouTubeLink, Flashcard } from '@/types';

interface FolderContextType {
  folders: Folder[];
  notes: Note[];
  youtubeLinks: YouTubeLink[];
  flashcards: Flashcard[];
  addFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  addNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  addYouTubeLink: (link: YouTubeLink) => void;
  deleteYouTubeLink: (id: string) => void;
  addFlashcard: (flashcard: Flashcard) => void;
  deleteFlashcard: (id: string) => void;
  getFolderNotes: (folderId: string) => Note[];
  getFolderYouTubeLinks: (folderId: string) => YouTubeLink[];
  getFolderFlashcards: (folderId: string) => Flashcard[];
}

const FolderContext = createContext<FolderContextType | undefined>(undefined);

const initialFolders: Folder[] = [
  { id: '1', name: 'Mathematics', icon: '📐', noteCount: 12, createdAt: new Date() },
  { id: '2', name: 'Science', icon: '🔬', noteCount: 8, createdAt: new Date() },
  { id: '3', name: 'Economics', icon: '📊', noteCount: 5, createdAt: new Date() },
  { id: '4', name: 'Social Studies', icon: '🌍', noteCount: 7, createdAt: new Date() },
  { id: '5', name: 'English', icon: '📚', noteCount: 10, createdAt: new Date() },
  { id: '6', name: 'History', icon: '🏛️', noteCount: 6, createdAt: new Date() },
];

const initialNotes: Note[] = [
  { id: 'n1', folderId: '1', title: 'Algebra Basics', fileName: 'algebra-basics.pdf', fileSize: 1024000, uploadedAt: new Date(), pdfUrl: '' },
  { id: 'n2', folderId: '1', title: 'Calculus Introduction', fileName: 'calculus-intro.pdf', fileSize: 2048000, uploadedAt: new Date(), pdfUrl: '' },
  { id: 'n3', folderId: '2', title: 'Physics Chapter 1', fileName: 'physics-ch1.pdf', fileSize: 1536000, uploadedAt: new Date(), pdfUrl: '' },
];

export const FolderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [youtubeLinks, setYoutubeLinks] = useState<YouTubeLink[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const addFolder = (folder: Folder) => setFolders([...folders, folder]);
  const deleteFolder = (id: string) => setFolders(folders.filter(f => f.id !== id));
  
  const addNote = (note: Note) => setNotes([...notes, note]);
  const deleteNote = (id: string) => setNotes(notes.filter(n => n.id !== id));
  
  const addYouTubeLink = (link: YouTubeLink) => setYoutubeLinks([...youtubeLinks, link]);
  const deleteYouTubeLink = (id: string) => setYoutubeLinks(youtubeLinks.filter(l => l.id !== id));
  
  const addFlashcard = (flashcard: Flashcard) => setFlashcards([...flashcards, flashcard]);
  const deleteFlashcard = (id: string) => setFlashcards(flashcards.filter(f => f.id !== id));

  const getFolderNotes = (folderId: string) => notes.filter(n => n.folderId === folderId);
  const getFolderYouTubeLinks = (folderId: string) => youtubeLinks.filter(l => l.folderId === folderId);
  const getFolderFlashcards = (folderId: string) => flashcards.filter(f => f.folderId === folderId);

  return (
    <FolderContext.Provider value={{
      folders,
      notes,
      youtubeLinks,
      flashcards,
      addFolder,
      deleteFolder,
      addNote,
      deleteNote,
      addYouTubeLink,
      deleteYouTubeLink,
      addFlashcard,
      deleteFlashcard,
      getFolderNotes,
      getFolderYouTubeLinks,
      getFolderFlashcards,
    }}>
      {children}
    </FolderContext.Provider>
  );
};

export const useFolders = () => {
  const context = useContext(FolderContext);
  if (context === undefined) {
    throw new Error('useFolders must be used within a FolderProvider');
  }
  return context;
};
