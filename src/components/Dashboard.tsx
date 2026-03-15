import React, { useState, useRef } from 'react';
import { useFolders } from '@/contexts/FolderContext';
import { Grid3X3, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import AppSidebar from './AppSidebar';
import FolderCard from './FolderCard';
import FolderView from './FolderView';
import CreateFolderDialog from './CreateFolderDialog';
import PomodoroTimer from './PomodoroTimer';
import AIChat from './AIChat';
import RoutineTracker from './RoutineTracker';
import StreakManager from './StreakManager';
import FolderActionBar from './FolderActionBar';
import FloatingActionButton from './FloatingActionButton';
import GlassSegmentedControl from './GlassSegmentedControl';
import WriteCanvas from './WriteCanvas';
import { Folder as FolderType } from '@/types';
import { toast } from 'sonner';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const Dashboard: React.FC = () => {
  const { folders, deleteFolder, notes } = useFolders();
  const [selectedFolder, setSelectedFolder] = useState<FolderType | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [aiChatOpen, setAIChatOpen] = useState(false);
  const [routineTrackerOpen, setRoutineTrackerOpen] = useState(false);
  const [streakManagerOpen, setStreakManagerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [longPressedFolder, setLongPressedFolder] = useState<FolderType | null>(null);
  const [activeSegment, setActiveSegment] = useState('folder');
  const prevSegment = useRef(activeSegment);
  const direction = useRef(1);

  const handleSegmentChange = (seg: string) => {
    const order = ['folder', 'write', 'meetup'];
    const oldIdx = order.indexOf(prevSegment.current);
    const newIdx = order.indexOf(seg);
    direction.current = newIdx > oldIdx ? 1 : -1;
    prevSegment.current = seg;
    setActiveSegment(seg);
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteFolder = (folderId: string) => {
    deleteFolder(folderId);
    setLongPressedFolder(null);
    toast.success('Folder deleted');
  };

  const handleMoveFolder = () => {
    toast.info('Move folder feature coming soon');
    setLongPressedFolder(null);
  };

  const handleShareFolder = () => {
    if (navigator.share && longPressedFolder) {
      navigator.share({
        title: longPressedFolder.name,
        text: `Check out my ${longPressedFolder.name} folder`,
      }).catch(() => { });
    } else {
      toast.info('Share feature not supported on this device');
    }
    setLongPressedFolder(null);
  };

  const handleFavoriteFolder = () => {
    toast.success('Added to favorites');
    setLongPressedFolder(null);
  };

  const totalNotes = notes.length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar
          onFolderSelect={(folder) => { setSelectedFolder(folder); setRoutineTrackerOpen(false); }}
          onCreateFolder={() => setCreateDialogOpen(true)}
          onPomodoroClick={() => setPomodoroOpen(true)}
          onAIChatClick={() => setAIChatOpen(true)}
          onRoutineTrackerClick={() => { setRoutineTrackerOpen(true); setSelectedFolder(null); }}
          onStreakManagerClick={() => setStreakManagerOpen(true)}
          selectedFolderId={selectedFolder?.id}
        />

        <main className="flex-1 bg-background">
          {/* Top bar with trigger */}
          <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-3 px-4 py-3">
              <SidebarTrigger className="md:hidden">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>

              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl transition-all duration-300 focus:ring-0 focus:ring-offset-0 focus:shadow-[0_0_20px_rgba(255,255,255,0.3),0_0_40px_rgba(255,255,255,0.1),inset_0_0_10px_rgba(255,255,255,0.1)] dark:focus:shadow-[0_0_20px_rgba(255,255,255,0.2),0_0_40px_rgba(255,255,255,0.1),inset_0_0_10px_rgba(255,255,255,0.05)] focus:border-foreground/30"
                />
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                  <span>
                    <span className="font-semibold">{folders.length}</span>
                    <span className="text-muted-foreground ml-1">folders</span>
                  </span>
                </div>
                <div className="w-px h-4 bg-border" />
                <span>
                  <span className="font-semibold">{totalNotes}</span>
                  <span className="text-muted-foreground ml-1">notes</span>
                </span>
              </div>
            </div>
          </div>

          {/* Glass Segmented Control */}
          {!selectedFolder && !routineTrackerOpen && (
            <GlassSegmentedControl activeTab={activeSegment} onTabChange={handleSegmentChange} />
          )}

          {/* Content Area */}
          <div className="p-6 overflow-hidden">
            {routineTrackerOpen ? (
              <RoutineTracker onBack={() => setRoutineTrackerOpen(false)} />
            ) : selectedFolder ? (
              <FolderView
                folder={selectedFolder}
                onBack={() => setSelectedFolder(null)}
              />
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeSegment}
                  initial={{ opacity: 0, x: direction.current * 60, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction.current * -60, scale: 0.98 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeSegment === 'folder' && (
                    <div className="grid-pattern rounded-2xl min-h-[calc(100vh-120px)]">
                      {filteredFolders.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                          {filteredFolders.map((folder, index) => (
                            <div
                              key={folder.id}
                              className="animate-fade-in"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <FolderCard
                                folder={{
                                  ...folder,
                                  noteCount: notes.filter(n => n.folderId === folder.id).length,
                                }}
                                onClick={() => setSelectedFolder(folder)}
                                onDelete={() => handleDeleteFolder(folder.id)}
                                onLongPress={() => setLongPressedFolder(folder)}
                                isSelected={longPressedFolder?.id === folder.id}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-lg font-medium">
                            {searchQuery ? 'No folders found' : 'No folders yet'}
                          </p>
                          <p className="text-muted-foreground mt-1">
                            {searchQuery ? 'Try a different search term' : 'Create your first folder from the sidebar'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSegment === 'write' && <WriteCanvas onBack={() => handleSegmentChange('folder')} />}

                  {activeSegment === 'meetup' && (
                    <div className="text-center py-16 min-h-[calc(100vh-120px)]">
                      <p className="text-lg font-medium text-muted-foreground">Meetup coming soon</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      <CreateFolderDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <PomodoroTimer open={pomodoroOpen} onOpenChange={setPomodoroOpen} />
      <AIChat open={aiChatOpen} onOpenChange={setAIChatOpen} />
      <StreakManager open={streakManagerOpen} onOpenChange={setStreakManagerOpen} />

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton
        onCreateFolder={() => setCreateDialogOpen(true)}
        showNoteOption={false}
      />

      {/* Bottom Action Bar */}
      {longPressedFolder && (
        <FolderActionBar
          folderName={longPressedFolder.name}
          onMove={handleMoveFolder}
          onShare={handleShareFolder}
          onDelete={() => handleDeleteFolder(longPressedFolder.id)}
          onFavorite={handleFavoriteFolder}
          onClose={() => setLongPressedFolder(null)}
        />
      )}
    </SidebarProvider>
  );
};

export default Dashboard;
