import React, { useState } from 'react';
import { FolderInput, Trash2, MoreHorizontal, Star, X, Check, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder as FolderType } from '@/types';

interface DocumentActionBarProps {
  documentName: string;
  folders: FolderType[];
  currentFolderId: string;
  onMove: (targetFolderId: string) => void;
  onDelete: () => void;
  onFavorite: () => void;
  onClose: () => void;
}

const DocumentActionBar: React.FC<DocumentActionBarProps> = ({
  documentName,
  folders,
  currentFolderId,
  onMove,
  onDelete,
  onFavorite,
  onClose,
}) => {
  const [showMoveSelector, setShowMoveSelector] = useState(false);

  const availableFolders = folders.filter(f => f.id !== currentFolderId);

  const handleMoveClick = () => {
    setShowMoveSelector(true);
  };

  const handleSelectFolder = (folderId: string) => {
    onMove(folderId);
    setShowMoveSelector(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-4 mb-4 md:mx-auto md:max-w-lg">
        <div className="bg-card/95 backdrop-blur-xl border-2 border-foreground/20 rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-medium truncate max-w-[200px]">
              {showMoveSelector ? 'Move to folder' : documentName}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={showMoveSelector ? () => setShowMoveSelector(false) : onClose}
              className="rounded-full hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {showMoveSelector ? (
            /* Folder Selector */
            <ScrollArea className="max-h-64">
              <div className="p-2 space-y-1">
                {availableFolders.length > 0 ? (
                  availableFolders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleSelectFolder(folder.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center border-2 border-foreground/10 group-hover:border-foreground/20 transition-colors">
                        <span className="text-lg">{folder.icon}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">{folder.noteCount} notes</p>
                      </div>
                      <Check className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <Folder className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No other folders available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            /* Actions */
            <div className="flex items-center justify-around py-3 px-2">
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
                <DropdownMenuContent align="center" className="rounded-xl border-2 border-foreground/20 bg-card">
                  <DropdownMenuItem onClick={onFavorite} className="rounded-lg">
                    <Star className="w-4 h-4 mr-2" />
                    Add to Favorites
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ActionButton icon={FolderInput} label="Move" onClick={handleMoveClick} />
            </div>
          )}
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

export default DocumentActionBar;
