export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  noteCount: number;
  color?: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  folderId: string;
  title: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  pdfUrl: string;
}

export interface YouTubeLink {
  id: string;
  folderId: string;
  title: string;
  url: string;
  thumbnail?: string;
  addedAt: Date;
}

export interface Flashcard {
  id: string;
  folderId: string;
  question: string;
  answer: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PomodoroState {
  mode: 'work' | 'shortBreak' | 'longBreak';
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
}
