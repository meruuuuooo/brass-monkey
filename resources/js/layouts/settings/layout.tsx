import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';
import { UserCircle, Shield, Paintbrush } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', href: edit(), icon: UserCircle },
    { title: 'Security', href: editSecurity(), icon: Shield },
    { title: 'Appearance', href: editAppearance(), icon: Paintbrush },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-8 md:p-12 max-w-7xl mx-auto pb-20">
            <div className="mb-8 md:mb-12">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">Account Settings</h1>
                <p className="text-muted-foreground text-lg font-medium mt-2">
                    Manage your profile, security, and application preferences.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[256px_1fr] gap-8 lg:gap-16 items-start">
                <aside className="w-full">
                    <nav className="flex flex-row lg:flex-col gap-2" aria-label="Settings">
                        {sidebarNavItems.map((item, index) => {
                            const isActive = isCurrentOrParentUrl(item.href as string);
                            return (
                                <Link
                                    key={`${toUrl(item.href as string)}-${index}`}
                                    href={item.href as string}
                                    className={cn(
                                        "flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold transition-colors duration-200 whitespace-nowrap",
                                        isActive
                                            ? "bg-bm-gold text-black shadow-lg shadow-bm-gold/20"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {item.icon && <item.icon className={cn("size-5 shrink-0", isActive ? "text-black" : "text-muted-foreground")} />}
                                    {item.title}
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                <div className="w-full min-w-0">
                    <div className="space-y-12">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
