import React, { useState, useMemo, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Habit {
  id: string;
  name: string;
  completedDays: boolean[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Wake Up Early', completedDays: [true, true, true, true, true, true, true] },
  { id: '2', name: 'Morning Cardio', completedDays: [false, false, true, true, true, true, true] },
  { id: '3', name: 'Study Session', completedDays: [false, false, true, true, true, true, true] },
  { id: '4', name: 'Read for 20m', completedDays: [false, true, true, true, true, true, true] },
  { id: '5', name: 'Review Notes', completedDays: [false, false, true, true, true, true, true] },
  { id: '6', name: 'Drink 2L of Water', completedDays: [false, false, true, true, true, true, true] },
];

/* ── Rectangular check toggle ── */
const HabitCheck: React.FC<{ checked: boolean; onChange: () => void }> = React.memo(({ checked, onChange }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={onChange}
    className={`
      w-5 h-5 rounded-[4px] border-[1.5px] flex items-center justify-center
      transition-all duration-150 ease-out cursor-pointer select-none
      active:scale-90
      ${checked
        ? 'bg-foreground border-foreground'
        : 'border-muted-foreground/40 bg-transparent hover:border-foreground/60'
      }
    `}
  >
    {checked && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-background">
        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </button>
));
HabitCheck.displayName = 'HabitCheck';

const RoutineTracker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [newHabitName, setNewHabitName] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const dailyPercentages = useMemo(() => {
    return DAYS.map((_, dayIndex) => {
      const completed = habits.filter(h => h.completedDays[dayIndex]).length;
      return habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
    });
  }, [habits]);

  const overallCompletion = useMemo(() => {
    const total = habits.length * 7;
    const completed = habits.reduce((sum, h) => sum + h.completedDays.filter(Boolean).length, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [habits]);

  const todayIndex = new Date().getDay();
  const completedToday = habits.filter(h => h.completedDays[todayIndex]).length;

  const weeklyOrder = [1, 2, 3, 4, 5, 6, 0];
  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyPercentages = weeklyOrder.map(i => dailyPercentages[i]);
  const monthProgress = overallCompletion;

  const streakData = useMemo(() => {
    return weeklyPercentages.map((p, i) => ({ day: i + 1, value: p }));
  }, [weeklyPercentages]);

  const longestStreak = useMemo(() => {
    let max = 0, current = 0;
    habits.forEach(h => {
      h.completedDays.forEach(d => {
        if (d) { current++; max = Math.max(max, current); }
        else current = 0;
      });
      current = 0;
    });
    return max;
  }, [habits]);

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  const firstDay = new Date(year, currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < adjustedFirstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [adjustedFirstDay, daysInMonth]);

  const activeDays = useMemo(() => {
    const today = new Date();
    const set = new Set<number>();
    for (let d = 1; d <= Math.min(today.getDate(), daysInMonth); d++) {
      if (d % 7 !== 0) set.add(d);
    }
    return set;
  }, [daysInMonth]);

  const toggleHabit = useCallback((habitId: string, dayIndex: number) => {
    setHabits(prev =>
      prev.map(h =>
        h.id === habitId
          ? { ...h, completedDays: h.completedDays.map((v, i) => (i === dayIndex ? !v : v)) }
          : h
      )
    );
  }, []);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      completedDays: [false, false, false, false, false, false, false],
    };
    setHabits(prev => [...prev, newHabit]);
    setNewHabitName('');
    setAddDialogOpen(false);
  };

  const prevMonth = () => setCurrentMonth(new Date(year, currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, currentMonth.getMonth() + 1, 1));

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallCompletion / 100) * circumference;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Habit Tracker</h1>
          <p className="text-sm text-muted-foreground">{completedToday} of {habits.length} completed today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Circular Progress */}
            <div className="rounded-2xl bg-card border border-border p-6 flex flex-col items-center justify-center shadow-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
                {monthName} {year}
              </p>
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle
                    cx="80" cy="80" r={radius} fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold tracking-tight">{overallCompletion}%</span>
                  <span className="text-[11px] text-muted-foreground">Overall</span>
                </div>
              </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">This Week</span>
                <span className="text-lg font-semibold">{monthProgress}%</span>
              </div>
              <Progress value={monthProgress} className="h-2 mb-5" />

              <div className="grid grid-cols-7 gap-1.5 text-center">
                {weeklyLabels.map((label, i) => {
                  const pct = weeklyPercentages[i];
                  const isToday = weeklyOrder[i] === todayIndex;
                  return (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      <span className={`text-[10px] font-medium ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                      <div className={`
                        w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-semibold
                        transition-colors duration-150
                        ${isToday
                          ? 'bg-foreground text-background'
                          : pct > 50
                            ? 'bg-secondary text-foreground'
                            : 'bg-muted/50 text-muted-foreground'
                        }
                      `}>
                        {pct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Habits Table */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Habit</th>
                    {DAYS.map(day => (
                      <th key={day} className={`p-3 text-center text-xs font-medium uppercase tracking-wider ${
                        DAYS.indexOf(day) === todayIndex ? 'text-foreground' : 'text-muted-foreground'
                      }`}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {habits.map((habit, idx) => (
                    <tr
                      key={habit.id}
                      className={`border-b border-border/50 transition-colors duration-100 hover:bg-secondary/40 ${
                        idx === habits.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="p-4 font-medium text-sm flex items-center gap-3">
                        <HabitCheck
                          checked={habit.completedDays[todayIndex]}
                          onChange={() => toggleHabit(habit.id, todayIndex)}
                        />
                        <span className={habit.completedDays[todayIndex] ? 'text-muted-foreground line-through' : ''}>
                          {habit.name}
                        </span>
                      </td>
                      {habit.completedDays.map((completed, dayIdx) => (
                        <td key={dayIdx} className="p-3 text-center">
                          <div className="flex justify-center">
                            <HabitCheck
                              checked={completed}
                              onChange={() => toggleHabit(habit.id, dayIdx)}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Completion</td>
                    {DAYS.map((_, i) => (
                      <td key={i} className="p-3 text-center text-xs font-semibold text-muted-foreground">
                        {dailyPercentages[i]}%
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Add Habit */}
            <div className="p-3 border-t border-border/50">
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-muted-foreground hover:text-foreground text-xs">
                    <Plus className="w-3.5 h-3.5" />
                    Add habit
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">New Habit</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="e.g. Meditate for 10 minutes"
                      value={newHabitName}
                      onChange={e => setNewHabitName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addHabit()}
                      className="rounded-xl"
                    />
                    <Button onClick={addHabit} className="rounded-xl px-5">Add</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Calendar */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-lg h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-sm font-semibold tracking-tight">{monthName}</h3>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-lg h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {DAYS_SHORT.map(d => (
                <span key={d} className="text-[9px] font-semibold text-muted-foreground tracking-wider">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isActive = day !== null && activeDays.has(day);
                const isToday = day === new Date().getDate() &&
                  currentMonth.getMonth() === new Date().getMonth() &&
                  currentMonth.getFullYear() === new Date().getFullYear();
                return (
                  <div
                    key={i}
                    className={`
                      w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium
                      transition-all duration-100
                      ${day === null ? '' :
                        isToday ? 'bg-foreground text-background font-semibold' :
                        isActive ? 'bg-secondary text-foreground' :
                        'text-muted-foreground/60'
                      }
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streak Momentum */}
          <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold tracking-tight">Streak Momentum</h3>
              <span className="text-xs text-muted-foreground">{longestStreak} day best</span>
            </div>

            <div className="relative h-28 w-full">
              <svg className="w-full h-full" viewBox="0 0 280 110" preserveAspectRatio="none">
                {[0, 25, 50, 75, 100].map(y => (
                  <line key={y} x1="0" y1={110 - y * 1.05} x2="280" y2={110 - y * 1.05} stroke="hsl(var(--border))" strokeWidth="0.5" />
                ))}
                {/* Area fill */}
                <polygon
                  fill="hsl(var(--foreground) / 0.04)"
                  points={`20,110 ${streakData.map((d, i) => `${i * 40 + 20},${110 - d.value * 1.05}`).join(' ')} ${(streakData.length - 1) * 40 + 20},110`}
                />
                <polyline
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={streakData.map((d, i) => `${i * 40 + 20},${110 - d.value * 1.05}`).join(' ')}
                />
                {streakData.map((d, i) => (
                  <circle key={i} cx={i * 40 + 20} cy={110 - d.value * 1.05} r="3" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="2" />
                ))}
              </svg>
            </div>

            <div className="flex justify-between mt-2 px-1">
              {weeklyLabels.map(l => (
                <span key={l} className="text-[9px] font-medium text-muted-foreground">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineTracker;
