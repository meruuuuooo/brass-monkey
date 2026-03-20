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
        const dateStr = isCurrentMonth ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
        
        const dayItems = items.filter(item => {
            const itemDate = new Date(item.date);
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">{monthName}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{year}</p>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-full hover:bg-bm-gold/10 hover:text-bm-gold transition-colors">
                        <ChevronLeft className="size-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full hover:bg-bm-gold/10 hover:text-bm-gold transition-colors">
                        <ChevronRight className="size-5" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px mb-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                    <div key={d} className="text-center text-[10px] font-black tracking-widest text-muted-foreground/40 py-2">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 flex-1">
                {days.map((d, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => d.day && handleDateClick(d.day)}
                        className={cn(
                            "relative aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-bold transition-all group outline-none focus-visible:ring-2 focus-visible:ring-bm-gold",
                            d.day ? "hover:bg-bm-gold/10 cursor-pointer" : "opacity-0 pointer-events-none",
                            d.isSelected ? "bg-bm-gold text-bm-dark shadow-lg shadow-bm-gold/20 scale-105" : 
                            d.isToday ? "bg-muted text-foreground ring-1 ring-border" : "text-foreground/80"
                        )}
                    >
                        {d.day}
                        <div className="absolute bottom-2 flex gap-0.5">
                            {d.items.slice(0, 3).map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className={cn(
                                        "size-1 rounded-full",
                                        d.isSelected ? "bg-bm-dark/40" :
                                        item.status === 'urgent' ? "bg-red-500" :
                                        item.status === 'completed' ? "bg-emerald-500" : "bg-bm-gold"
                                    )} 
                                />
                            ))}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

