import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === 'undefined') return true;
        try {
            const saved = localStorage.getItem('sidebar_main_open');
            return saved !== null ? saved === 'true' : true;
        } catch {
            return true;
        }
    });

    // Auto-open if an item inside is active
    useEffect(() => {
        const hasActiveItem = items.some((item) => item.href && isCurrentUrl(item.href));
        if (hasActiveItem && !isOpen) {
            setIsOpen(true);
            localStorage.setItem('sidebar_main_open', 'true');
        }
    }, [items, isCurrentUrl]);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        localStorage.setItem('sidebar_main_open', String(open));
    };

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={handleOpenChange}
            className="group/collapsible"
        >
            <SidebarGroup className="px-3 py-1">
                <SidebarGroupLabel asChild>
                    <CollapsibleTrigger className="flex cursor-pointer w-full items-center justify-between px-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                        <span>Platform</span>
                        <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1 mt-1">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.href ? (
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isCurrentUrl(item.href)}
                                            tooltip={{ children: item.title }}
                                            className="h-9 rounded-lg px-2.5 text-sm font-medium transition-all duration-150 hover:bg-sidebar-accent/70 hover:pl-3 data-active:bg-sidebar-primary/85 data-active:text-sidebar-primary-foreground data-active:shadow-[inset_3px_0_0_0_hsl(var(--sidebar-primary-foreground)/0.35)]"
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    ) : (
                                        <SidebarMenuButton
                                            disabled
                                            tooltip={{ children: `${item.title} (Coming soon)` }}
                                            className="h-9 cursor-not-allowed rounded-lg px-2.5 text-sm font-medium text-sidebar-foreground/45 opacity-80"
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
    );
}
