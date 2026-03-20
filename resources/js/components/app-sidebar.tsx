import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bookmark,
    BookText,
    Boxes,
    HelpCircle,
    LayoutGrid,
    MessageSquare,
    PackageCheck,
    ScrollText,
    Settings,
    ShoppingCart,
    Truck,
    User,
    Wrench,
} from 'lucide-react';
import { index as activityLogs } from '@/actions/App/Http/Controllers/Admin/ActivityLogController';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import { edit as editProfile } from '@/routes/profile';
import type { NavItem } from '@/types';

const clientMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Shop',
        href: null,
        icon: ShoppingCart,
    },
    {
        title: 'Rentals',
        href: null,
        icon: Truck,
    },
    {
        title: 'Services',
        href: null,
        icon: Wrench,
    },
    {
        title: 'Blog',
        href: null,
        icon: Bookmark,
    },
    {
        title: 'My Orders',
        href: null,
        icon: PackageCheck,
    },
    {
        title: 'Profile',
        href: editProfile(),
        icon: User,
    },
    {
        title: 'Support',
        href: null,
        icon: HelpCircle,
    },
];

const adminMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'POS / Sales',
        href: null,
        icon: ShoppingCart,
    },
    {
        title: 'Rentals Management',
        href: null,
        icon: PackageCheck,
    },
    {
        title: 'Inventory',
        href: null,
        icon: Boxes,
    },
    {
        title: 'Blog Management',
        href: null,
        icon: BookText,
    },
    {
        title: 'History',
        href: activityLogs.url(),
        icon: ScrollText,
    },
    {
        title: 'Messaging',
        href: null,
        icon: MessageSquare,
    },
    {
        title: 'Reports',
        href: null,
        icon: BarChart3,
    },
    {
        title: 'Settings',
        href: editProfile(),
        icon: Settings,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const roles: string[] = auth.roles ?? [];
    const isAdminOrManager =
        roles.includes('Admin') || roles.includes('Manager');
    const mainNavItems = isAdminOrManager
        ? adminMainNavItems
        : clientMainNavItems;

    return (
        <Sidebar
            collapsible="icon"
            variant="sidebar"
            className="border-r border-sidebar-border/60"
        >
            <SidebarHeader className="border-b border-sidebar-border/50 px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-13 rounded-xl px-2.5 hover:bg-transparent active:bg-transparent data-open:hover:bg-transparent"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-3">
                <NavMain items={mainNavItems} />
                {isAdminOrManager && <NavAdmin items={adminNavItems} />}
            </SidebarContent>

            <SidebarFooter />
        </Sidebar>
    );
}

function NavAdmin({ items }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="px-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-sidebar-foreground/70">
                Administration
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
