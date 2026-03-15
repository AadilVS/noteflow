import React from 'react';
import { FolderInput, Share2, Trash2, MoreHorizontal, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface FolderActionBarProps {
  folderName: string;
  onMove: () => void;
  onShare: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  onClose: () => void;
}

const FolderActionBar: React.FC<FolderActionBarProps> = ({
  folderName,
  onMove,
  onShare,
  onDelete,
  onFavorite,
  onClose,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-4 mb-4 md:mx-auto md:max-w-lg">
        <div className="bg-card/95 backdrop-blur-xl border-2 border-foreground/20 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium truncate max-w-[200px]">{folderName}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="rounded-full hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-around py-3 px-2">
            <ActionButton icon={FolderInput} label="Move" onClick={onMove} />
            <ActionButton icon={Share2} label="Share" onClick={onShare} />
            <ActionButton icon={Trash2} label="Delete" onClick={onDelete} variant="destructive" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-secondary group">
                  <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:bg-secondary transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-2 border-foreground/20 bg-card">
                <DropdownMenuItem onClick={onFavorite} className="rounded-lg">
                  <Star className="w-4 h-4 mr-2" />
                  Add to Favorites
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  const isDestructive = variant === 'destructive';
  
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-secondary group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
        isDestructive 
          ? 'bg-destructive/10 group-hover:bg-destructive/20' 
          : 'bg-secondary/50 group-hover:bg-secondary'
      }`}>
        <Icon className={`w-5 h-5 ${isDestructive ? 'text-destructive' : 'text-foreground'}`} />
      </div>
      <span className={`text-xs ${isDestructive ? 'text-destructive' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </button>
  );
};

export default FolderActionBar;
