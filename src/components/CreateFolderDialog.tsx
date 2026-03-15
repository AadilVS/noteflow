import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFolders } from '@/contexts/FolderContext';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emojis = ['📚', '📐', '🔬', '📊', '🌍', '🏛️', '💻', '🎨', '🎵', '⚽', '🧮', '📝'];

const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({ open, onOpenChange }) => {
  const { addFolder } = useFolders();
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📚');

  const handleCreate = () => {
    if (name.trim()) {
      addFolder({
        id: Date.now().toString(),
        name: name.trim(),
        icon: selectedEmoji,
        noteCount: 0,
        createdAt: new Date(),
      });
      setName('');
      setSelectedEmoji('📚');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="e.g., Mathematics, Physics..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Choose Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-10 h-10 flex items-center justify-center text-xl border transition-all ${
                    selectedEmoji === emoji
                      ? 'border-foreground bg-secondary'
                      : 'border-border hover:border-foreground/50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;
