import React from 'react';
import {
  Folder,
  Clock,
  MessageSquare,
  LogOut,
  Plus,
  ChevronRight,
  CalendarCheck,
  Flame
} from 'lucide-react';
import logo from '@/assets/logo.jpeg';
import { useAuth } from '@/contexts/AuthContext';
import { useFolders } from '@/contexts/FolderContext';
import { Folder as FolderType } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from './ThemeToggle';
import { SettingsDialog } from './SettingsDialog';

interface AppSidebarProps {
  onFolderSelect: (folder: FolderType) => void;
  onCreateFolder: () => void;
  onPomodoroClick: () => void;
  onAIChatClick: () => void;
  onRoutineTrackerClick: () => void;
  onStreakManagerClick: () => void;
  selectedFolderId?: string;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  onFolderSelect,
  onCreateFolder,
  onPomodoroClick,
  onAIChatClick,
  onRoutineTrackerClick,
  onStreakManagerClick,
  selectedFolderId,
}) => {
  const { user, logout } = useAuth();
  const { folders, notes } = useFolders();

  return (
    <Sidebar className="border-r-2 border-foreground/10">
      {/* Header / Logo */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="NoteFlow logo" className="w-9 h-9 rounded-xl object-cover" />
          <span className="font-display font-semibold text-lg tracking-tight">
            NoteFlow
          </span>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Tools Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onPomodoroClick}
                  className="rounded-xl hover:bg-secondary/80 transition-all duration-200 hover:translate-x-0.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Pomodoro Timer</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onAIChatClick}
                  className="rounded-xl hover:bg-secondary/80 transition-all duration-200 hover:translate-x-0.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="font-medium">AI Assistant</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onRoutineTrackerClick}
                  className="rounded-xl hover:bg-secondary/80 transition-all duration-200 hover:translate-x-0.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Routine Tracker</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onStreakManagerClick}
                  className="rounded-xl hover:bg-secondary/80 transition-all duration-200 hover:translate-x-0.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block">Streak Manager</span>
                    <span className="text-[10px] text-muted-foreground">7 day streak</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Folders Section */}
        <SidebarGroup className="flex-1">
          <div className="flex items-center justify-between px-2 mb-1">
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider p-0">
              Folders
            </SidebarGroupLabel>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-lg hover:bg-secondary"
              onClick={onCreateFolder}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-420px)]">
              <SidebarMenu>
                {folders.length > 0 ? (
                  folders.map((folder) => {
                    const noteCount = notes.filter(n => n.folderId === folder.id).length;
                    const isSelected = selectedFolderId === folder.id;

                    return (
                      <SidebarMenuItem key={folder.id}>
                        <SidebarMenuButton
                          onClick={() => onFolderSelect(folder)}
                          isActive={isSelected}
                          className="rounded-xl hover:bg-secondary/80 transition-all duration-200 hover:translate-x-0.5 group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-foreground/10"
                            style={{ backgroundColor: folder.color + '20' }}
                          >
                            <Folder className="w-4 h-4" style={{ color: folder.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium truncate block">{folder.name}</span>
                            <span className="text-xs text-muted-foreground">{noteCount} notes</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                ) : (
                  <div className="px-3 py-6 text-center">
                    <Folder className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No folders yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={onCreateFolder}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Create folder
                    </Button>
                  </div>
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* User Account Footer */}
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200">
          <div className="w-9 h-9 bg-foreground text-background rounded-xl flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <SettingsDialog />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive shrink-0"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
