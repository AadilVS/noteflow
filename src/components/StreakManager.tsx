import React from 'react';
import { Flame, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog';

interface StreakManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEEK_DAYS = ['We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu'];
const COMPLETED = [true, true, true, true, true, true, true];

const StreakManager: React.FC<StreakManagerProps> = ({ open, onOpenChange }) => {
  const streakCount = 7;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] rounded-2xl border-border/50 bg-card p-0 gap-0 overflow-hidden shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200">
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative flex flex-col items-center pt-10 pb-8 px-6">
          {/* Flame icon */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl scale-150 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Streak number */}
          <div className="relative">
            <span className="text-6xl font-bold tracking-tight text-foreground">{streakCount}</span>
          </div>
          <p className="text-lg font-medium text-muted-foreground mt-1">day streak!</p>

          {/* Weekly progress */}
          <div className="flex items-center gap-3 mt-8 w-full justify-center">
            {WEEK_DAYS.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    COMPLETED[i]
                      ? 'bg-foreground border-foreground'
                      : 'border-muted-foreground/30 bg-transparent'
                  }`}
                >
                  {COMPLETED[i] && (
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className="text-background">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{day}</span>
              </div>
            ))}
          </div>

          {/* Motivational message */}
          <div className="mt-8 px-4 py-3 rounded-xl bg-secondary/60 w-full text-center">
            <p className="text-sm font-medium text-foreground">
              🔥 {streakCount} days in a row! Keep up the great work!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakManager;
