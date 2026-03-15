import React, { useState } from 'react';
import { Plus, FolderPlus, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onCreateFolder: () => void;
  onCreateNote?: () => void;
  showNoteOption?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onCreateFolder,
  onCreateNote,
  showNoteOption = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCreateFolder = () => {
    onCreateFolder();
    setIsOpen(false);
  };

  const handleCreateNote = () => {
    onCreateNote?.();
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen &&
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
        onClick={() => setIsOpen(false)} />

      }

      {/* FAB Container - Available on all devices */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-center gap-3">
        {/* Action Options */}
        {isOpen &&
        <div className="flex flex-col-reverse gap-3 animate-scale-in">
            {/* Create Folder Option */}
            <button
            onClick={handleCreateFolder}
            className="flex items-center gap-3 bg-background border-2 border-foreground rounded-2xl pl-4 pr-5 py-3 shadow-brutal hover:bg-secondary/50 transition-colors animate-slide-up"
            style={{ animationDelay: '50ms' }}>

              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <FolderPlus className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm">New Folder</span>
            </button>

            {/* Create Note Option - Only when inside a folder */}
            {showNoteOption &&
          <button
            onClick={handleCreateNote}
            className="flex items-center gap-3 bg-background border-2 border-foreground rounded-2xl pl-4 pr-5 py-3 shadow-brutal hover:bg-secondary/50 transition-colors animate-slide-up"
            style={{ animationDelay: '100ms' }}>

                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center border-2 border-foreground">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">Upload Note</span>
              </button>
          }
          </div>
        }

        {/* Main FAB Button */}
        
















      </div>
    </>);

};

export default FloatingActionButton;