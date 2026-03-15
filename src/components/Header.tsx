import React from 'react';
import { Clock, MessageSquare, LogOut, Menu } from 'lucide-react';
import logo from '@/assets/logo.jpeg';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onPomodoroClick: () => void;
  onAIChatClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onPomodoroClick, onAIChatClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="NoteFlow logo" className="w-9 h-9 rounded-lg object-cover" />
          <span className="font-display font-semibold text-lg tracking-tight hidden sm:block">
            NoteFlow
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="grid"
            size="sm"
            onClick={onPomodoroClick}
            className="hidden sm:inline-flex"
          >
            <Clock className="w-4 h-4" />
            Pomodoro
          </Button>

          <Button
            variant="grid"
            size="sm"
            onClick={onAIChatClick}
            className="hidden sm:inline-flex"
          >
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </Button>

          {/* Mobile menu */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="icon" size="icon-sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPomodoroClick}>
                  <Clock className="w-4 h-4 mr-2" />
                  Pomodoro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAIChatClick}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="icon" size="icon" className="ml-1">
                <div className="w-7 h-7 bg-foreground text-background flex items-center justify-center text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
