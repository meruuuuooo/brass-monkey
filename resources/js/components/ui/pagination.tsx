import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface PaginationProps {
    links: { url: string | null; label: string; active: boolean }[];
    className?: string;
}

export function Pagination({ links, className }: PaginationProps) {
    if (links.length <= 3) return null;

    return (
        <div className={cn("flex flex-wrap items-center justify-center gap-1", className)}>
            {links.map((link, i) => {
                const isPrevious = link.label.includes('Previous');
                const isNext = link.label.includes('Next');

                if (!link.url) {
                    return (
                        <div
                            key={i}
                            className="px-4 py-2 text-sm text-muted-foreground opacity-50 cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Button
                        key={i}
                        variant={link.active ? 'default' : 'outline'}
                        size={isPrevious || isNext ? 'default' : 'icon'}
                        className={cn(
                            "rounded-xl",
                            link.active ? "bg-bm-gold text-black hover:bg-bm-gold/90 font-black" : "text-foreground"
                        )}
                        asChild
                    >
                        <Link
                            href={link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            preserveScroll
                        />
                    </Button>
                );
            })}
        </div>
    );
}
