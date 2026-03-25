import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    Bell,
    Bookmark,
    BookText,
    Boxes,
    ClipboardCheck,
    ClipboardList,
    CreditCard,
    HelpCircle,
    LayoutGrid,
    LogOut,
    Megaphone,
    MessageCircle,
    MessageSquare,
    PackageCheck,
    ScrollText,
    FileText,
    Settings,
    ShoppingCart,
    Tag,
    Truck,
    User,
    UserCircle2,
    Users,
    Wrench,
    ChevronRight,
} from 'lucide-react';

import { index as activityLogs } from '@/actions/App/Http/Controllers/Admin/ActivityLogController';
import { index as ads } from '@/actions/App/Http/Controllers/Admin/AdvertisementController';
import AdminActions from '@/actions/App/Http/Controllers/Admin';
import { index as users } from '@/actions/App/Http/Controllers/Admin/UserController';
import { useState, useEffect } from 'react';

const announcements = AdminActions.AnnouncementController;
import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import services from '@/routes/services';
import { edit as editProfile } from '@/routes/profile';
import type { NavItem, NavGroup } from '@/types';
import AppLogo from './app-logo';

const clientMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Shop',
        href: '/products',
        icon: ShoppingCart,
    },
    {
        title: 'Services',
        href: '/services',
        icon: Wrench,
    },
    {
        title: 'My Orders',
        href: '/my-orders',
        icon: PackageCheck,
    },
    {
        title: 'Repair Jobs',
        href: '/my-jobs',
        icon: Activity,
    },
    {
        title: 'Track Service',
        href: '/track-order',
        icon: Truck,
    },
    {
        title: 'Promotions',
        href: '/promotions',
        icon: Megaphone,
    },
    {
        title: 'Blog & News',
        href: '/blog',
        icon: BookText,
    },
];

const adminMainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Promotions',
        href: '/promotions',
        icon: Megaphone,
    },
    {
        title: 'Blog & News',
        href: '/blog',
        icon: BookText,
    },
];


const adminNavGroups: NavGroup[] = [
    {
        title: 'Inventory',
        items: [
            {
                title: 'Products',
                href: '/admin/products',
                icon: Boxes,
            },
            {
                title: 'Categories',
                href: '/admin/categories',
                icon: LayoutGrid,
            },
            {
                title: 'Suppliers',
                href: '/admin/suppliers',
                icon: Truck,
            },
            {
                title: 'Purchase Orders',
                href: '/admin/purchase-orders',
                icon: ClipboardList,
            },
            {
                title: 'Stock Adjustments',
                href: '/admin/stock-adjustments',
                icon: ClipboardCheck,
            },
        ],
    },
    {
        title: 'CRM',
        items: [
            {
                title: 'Customers',
                href: '/admin/customers',
                icon: UserCircle2,
            },
            {
                title: 'Customer Segments',
                href: '/admin/customer-segments',
                icon: Tag,
            },
        ],
    },
    {
        title: 'Sales & Analytics',
        items: [
            {
                title: 'Orders',
                href: '/admin/orders',
                icon: ShoppingCart,
            },
            {
                title: 'Transactions',
                href: '/admin/transactions',
                icon: CreditCard,
            },
            {
                title: 'Reports',
                href: '/admin/reports',
                icon: BarChart3,
            },
        ],
    },
    {
        title: 'Blog Content',
        items: [
            {
                title: 'Posts',
                href: '/admin/blog-posts',
                icon: FileText,
            },
            {
                title: 'Categories',
                href: '/admin/blog-categories',
                icon: LayoutGrid,
            },
            {
                title: 'Tags',
                href: '/admin/blog-tags',
                icon: Tag,
            },
            {
                title: 'Comments',
                href: '/admin/blog-comments',
                icon: MessageSquare,
            },
        ],
    },
    {
        title: 'System Management',
        items: [
            {
                title: 'Users',
                href: users.url(),
                icon: Users,
            },
            {
                title: 'Advertisements',
                href: ads.url(),
                icon: Megaphone,
            },
            {
                title: 'Services Management',
                href: admin.services.index.url(),
                icon: Wrench,
            },
            {
                title: 'Service Bookings',
                href: '/admin/service-requests',
                icon: ClipboardList,
            },
            {
                title: 'Activity Logs',
                href: activityLogs.url(),
                icon: Activity,
            },
        ],
    },
];

const managerNavGroups: NavGroup[] = [
    {
        title: 'Inventory',
        items: [
            { title: 'Products', href: admin.products.index.url(), icon: PackageCheck },
            { title: 'Categories', href: admin.categories.index.url(), icon: Tag },
            { title: 'Suppliers', href: admin.suppliers.index.url(), icon: Truck },
            { title: 'Purchase Orders', href: admin.purchaseOrders.index.url(), icon: ClipboardCheck },
            { title: 'Stock Adjustments', href: admin.stockAdjustments.index.url(), icon: Boxes },
        ],
    },
    {
        title: 'Sales & CRM',
        items: [
            { title: 'Orders', href: admin.orders.index.url(), icon: ShoppingCart },
            { title: 'Transactions', href: '/admin/transactions', icon: CreditCard },
            { title: 'Customers', href: '/admin/customers', icon: Users },
            { title: 'Segments', href: admin.customerSegments.index.url(), icon: Bookmark },
        ],
    },
    {
        title: 'Blog Content',
        items: [
            { title: 'Posts', href: '/admin/blog-posts', icon: FileText },
            { title: 'Categories', href: '/admin/blog-categories', icon: Tag },
            { title: 'Tags', href: '/admin/blog-tags', icon: Tag },
        ],
    },
    {
        title: 'Services',
        items: [
            { title: 'Service Jobs', href: '/admin/service-requests', icon: Wrench },
            { title: 'Services Catalog', href: admin.services.index.url(), icon: BookText },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const roles: string[] = auth.roles ?? [];
    const primaryRole = roles[0] ?? 'Client';
    const isAdminOrManager =
        roles.includes('Admin') || roles.includes('Manager');
    const mainNavItems = isAdminOrManager
        ? adminMainNavItems
        : clientMainNavItems;
    const getInitials = useInitials();

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
                            {/* <Link href={dashboard()} prefetch className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 rounded-lg border border-sidebar-border/50">
                                    <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                    <AvatarFallback className="rounded-lg bg-bm-gold/10 text-bm-gold font-bold">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-black tracking-tight text-sidebar-foreground">
                                        {auth.user.name}
                                    </span>
                                    <span className="truncate text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/60">
                                        {primaryRole}
                                    </span>
                                </div>
                            </Link> */}
                            <Link href={dashboard()} prefetch>
                                <AppLogo subtitle={primaryRole} />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-3">
                <NavMain items={mainNavItems} />
                {roles.includes('Admin') && <NavAdmin groups={adminNavGroups} />}
                {roles.includes('Manager') && !roles.includes('Admin') && <NavAdmin groups={managerNavGroups} />}
            </SidebarContent>

            <SidebarFooter />
        </Sidebar>
    );
}

function NavAdmin({ groups }: { groups: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        if (typeof window === 'undefined') return {};
        try {
            const saved = localStorage.getItem('sidebar_groups_state');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // Auto-open group if an item inside is active
    useEffect(() => {
        const newOpenGroups = { ...openGroups };
        let changed = false;

        groups.forEach((group) => {
            const hasActiveItem = group.items.some((item) => item.href && isCurrentUrl(item.href));
            if (hasActiveItem && !newOpenGroups[group.title]) {
                newOpenGroups[group.title] = true;
                changed = true;
            }
        });

        if (changed) {
            setOpenGroups(newOpenGroups);
            localStorage.setItem('sidebar_groups_state', JSON.stringify(newOpenGroups));
        }
    }, [groups, isCurrentUrl]);

    const toggleGroup = (title: string, open: boolean) => {
        const newOpenGroups = { ...openGroups, [title]: open };
        setOpenGroups(newOpenGroups);
        localStorage.setItem('sidebar_groups_state', JSON.stringify(newOpenGroups));
    };

    return (
        <>
            {groups.map((group) => {
                const isActiveGroup = group.items.some((item) => item.href && isCurrentUrl(item.href));

                return (
                    <Collapsible
                        key={group.title}
                        open={openGroups[group.title]}
                        onOpenChange={(open) => toggleGroup(group.title, open)}
                        className="group/collapsible"
                    >
                        <SidebarGroup className="px-3 py-1">
                            <SidebarGroupLabel asChild>
                                <CollapsibleTrigger className="flex w-full items-center justify-between px-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                                    <span>{group.title}</span>
                                    <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent>
                                    <SidebarMenu className="gap-1 mt-1">
                                        {group.items.map((item) => (
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
            })}
        </>
    );
}
