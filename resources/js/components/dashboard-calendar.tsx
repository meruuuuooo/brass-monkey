import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CalendarItem {
    date: string; // ISO string or YYYY-MM-DD
    status: 'urgent' | 'pending' | 'completed';
}

interface DashboardCalendarProps {
    selectedDate?: Date | null;
    onDateSelect?: (date: Date | null) => void;
    items?: CalendarItem[];
}

export function DashboardCalendar({ selectedDate, onDateSelect, items = [] }: DashboardCalendarProps) {
    const [viewDate, setViewDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const handleDateClick = (day: number) => {
        const clickedDate = new Date(year, month, day);
        if (onDateSelect) {
            // Toggle selection if clicking the same date
            if (selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year) {
                onDateSelect(null);
            } else {
                onDateSelect(clickedDate);
            }
        }
    };

    const days = Array.from({ length: 42 }, (_, i) => {
        const day = i - startDay + 1;
        const isCurrentMonth = day > 0 && day <= totalDays;

        const dayItems = items.filter(item => {
            const itemDate = new Date(item.date);
            // Adjust for local timezone if item.date is just a date string
            return itemDate.getDate() === day && itemDate.getMonth() === month && itemDate.getFullYear() === year;
        });

        const isSelected = selectedDate &&
            selectedDate.getDate() === day &&
            selectedDate.getMonth() === month &&
            selectedDate.getFullYear() === year;

        return {
            day: isCurrentMonth ? day : null,
            isToday: isCurrentMonth && day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear(),
            isSelected,
            items: dayItems,
        };
    });

    const monthName = viewDate.toLocaleString('default', { month: 'long' });

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">{monthName}</h3>
                    <p className="text-xs font-medium text-muted-foreground">{year}</p>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="size-8 rounded-full hover:bg-bm-gold/10 hover:text-bm-gold transition-colors">
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="size-8 rounded-full hover:bg-bm-gold/10 hover:text-bm-gold transition-colors">
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px mb-1">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                    <div key={d} className="text-center text-[9px] font-black tracking-widest text-muted-foreground/40 py-1">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 flex-1">
                {days.map((d, i) => {
                    const hasUrgent = d.items.some(item => item.status === 'urgent');
                    const hasPending = d.items.some(item => item.status === 'pending');

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => d.day && handleDateClick(d.day)}
                            className={cn(
                                "relative aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all group outline-none focus-visible:ring-2 focus-visible:ring-bm-gold",
                                d.day ? "hover:bg-bm-gold/10 cursor-pointer" : "opacity-0 pointer-events-none",
                                d.isSelected ? "bg-bm-gold text-bm-dark shadow-lg shadow-bm-gold/20 scale-105" :
                                    d.isToday ? "bg-muted text-foreground ring-1 ring-border" : "text-foreground/80",
                                !d.isSelected && hasUrgent && "ring-2 ring-red-500/30 bg-red-500/5",
                                !d.isSelected && !hasUrgent && d.items.length > 0 && "bg-bm-gold/5"
                            )}
                        >
                            {d.day}
                            <div className="absolute bottom-1.5 flex gap-0.5">
                                {d.items.length > 0 && (
                                    <div
                                        className={cn(
                                            "size-1.5 rounded-full",
                                            d.isSelected ? "bg-bm-dark/40" :
                                                hasUrgent ? "bg-red-500 animate-pulse" :
                                                    hasPending ? "bg-bm-gold" : "bg-emerald-500"
                                        )}
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
