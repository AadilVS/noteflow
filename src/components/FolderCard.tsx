import React, { useRef, useCallback, useMemo } from 'react';
import { Folder as FolderType } from '@/types';
import { ChevronRight, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getGradientTheme } from '@/lib/folder-themes';

interface FolderCardProps {
  folder: FolderType;
  onClick: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
}

const LONG_PRESS_DURATION = 500;

const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onClick,
  onDelete,
  onLongPress,
  isSelected = false,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const theme = useMemo(() => getGradientTheme(folder.name), [folder.name]);

  const handleTouchStart = useCallback(() => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress?.();
    }, LONG_PRESS_DURATION);
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!isLongPress.current) {
      onClick();
    }
  }, [onClick]);

  return (
    <div 
      className={`
        group relative rounded-[16px] cursor-pointer animate-fade-in
        bg-gradient-to-br ${theme.gradient}
        ${theme.shadow}
        transition-all duration-[250ms] ease-out
        hover:-translate-y-[3px] ${theme.glow}
        hover:brightness-[1.06]
        ${isSelected 
          ? 'ring-2 ring-primary/50 scale-[0.98]' 
          : ''
        }
      `}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in z-10">
          <div className="w-2 h-2 bg-primary-foreground rounded-full" />
        </div>
      )}

      <div className="p-5 md:p-6">
        {/* Icon container - pure white with subtle shadow in light, translucent with blur in dark */}
        <div className="w-12 h-12 bg-white dark:bg-white/10 dark:backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-[250ms] ease-out group-hover:scale-[1.02] shadow-[0_2px_8px_-2px_hsla(0,0%,0%,0.1)] dark:shadow-none">
          {folder.icon}
        </div>

        {/* Content - Typography with proper hierarchy */}
        <h3 className="font-semibold text-base mb-1 pr-8 text-[hsl(220,15%,25%)] dark:text-[hsl(220,20%,92%)] transition-colors duration-200">
          {folder.name}
        </h3>
        <p className="text-sm text-[hsl(220,10%,50%)] dark:text-[hsl(220,15%,55%)]">
          {folder.noteCount} {folder.noteCount === 1 ? 'note' : 'notes'}
        </p>

        {/* Arrow indicator - hidden, appears on hover */}
        <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-[250ms] ease-out transform translate-x-1 group-hover:translate-x-0">
          <ChevronRight className="w-5 h-5 text-[hsl(220,15%,40%)] dark:text-[hsl(220,15%,70%)]" />
        </div>
      </div>

      {/* Actions */}
      <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl border-0 shadow-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <DropdownMenuItem onClick={onDelete} className="text-destructive rounded-lg">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default FolderCard;
