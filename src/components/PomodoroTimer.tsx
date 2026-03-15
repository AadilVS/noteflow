import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface PomodoroTimerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = 'work' | 'shortBreak' | 'longBreak';

const TIMES = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ open, onOpenChange }) => {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(TIMES.work);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((TIMES[mode] - timeLeft) / TIMES[mode]) * 100;

  const handleReset = useCallback(() => {
    setTimeLeft(TIMES[mode]);
    setIsRunning(false);
  }, [mode]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(TIMES[newMode]);
    setIsRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === 'work') {
        setSessions((s) => s + 1);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Pomodoro Timer
          </SheetTitle>
        </SheetHeader>

        <div className="py-8 space-y-8">
          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={mode === 'work' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('work')}
            >
              Focus
            </Button>
            <Button
              variant={mode === 'shortBreak' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('shortBreak')}
            >
              Short Break
            </Button>
            <Button
              variant={mode === 'longBreak' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('longBreak')}
            >
              Long Break
            </Button>
          </div>

          {/* Timer Display */}
          <div className="relative">
            {/* Progress Ring */}
            <div className="w-48 h-48 mx-auto relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="stroke-muted"
                  strokeWidth="4"
                  fill="none"
                  r="46"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="stroke-foreground transition-all duration-1000"
                  strokeWidth="4"
                  fill="none"
                  r="46"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-mono font-bold tracking-tight">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm text-muted-foreground mt-1 capitalize">
                  {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              className="w-32"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
          </div>

          {/* Sessions */}
          <div className="text-center border-t border-border pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Coffee className="w-4 h-4" />
              <span className="text-sm font-mono">
                {sessions} session{sessions !== 1 ? 's' : ''} completed
              </span>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-muted p-4 text-sm space-y-2">
            <p className="font-medium">Pomodoro Technique</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• 25 min focus → 5 min break</li>
              <li>• After 4 sessions → 15 min break</li>
              <li>• Stay focused, avoid distractions</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PomodoroTimer;
