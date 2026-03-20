import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-3 py-0">
            <SidebarGroupLabel className="px-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-sidebar-foreground/70">
                Platform
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
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
        </SidebarGroup>
    );
}
