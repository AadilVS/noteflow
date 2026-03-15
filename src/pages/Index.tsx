import React from 'react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { FolderProvider } from '@/contexts/FolderContext';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';
import { Helmet } from 'react-helmet-async';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Helmet>
        <title>NoteFlow - Organize Your Study Notes</title>
        <meta name="description" content="Import, organize, and study your PDF notes with AI-powered assistance. Features subject folders, YouTube links, flashcards, and Pomodoro timer." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <link rel="canonical" href="https://noteflow.app" />
      </Helmet>
      {isAuthenticated ? <Dashboard /> : <LoginScreen />}
    </>
  );
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <FolderProvider>
        <AppContent />
      </FolderProvider>
    </AuthProvider>
  );
};

export default Index;
