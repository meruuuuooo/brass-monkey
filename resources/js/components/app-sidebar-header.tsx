import { usePage } from '@inertiajs/react';
import { ChevronDown, MoonIcon, SunIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useThemeColor } from '@/hooks/use-theme-color';

const colorPresets = [
    '#D9A441',
    '#2563EB',
    '#0EA5E9',
    '#16A34A',
    '#F97316',
    '#DC2626',
    '#DB2777',
    '#7C3AED',
    '#0891B2',
    '#4D7C0F',
] as const;

export function AppSidebarHeader() {
    const { auth } = usePage().props;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const { primaryColor, updatePrimaryColor, resetPrimaryColor } =
        useThemeColor();
    const displayName = auth.user?.name ?? 'User';

    const initials = displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const isDarkMode = resolvedAppearance === 'dark';

    const toggleAppearance = () => {
        updateAppearance(isDarkMode ? 'light' : 'dark');
    };

    const handleThemeHexInput = (value: string) => {
        if (/^#?[0-9A-Fa-f]{0,6}$/.test(value)) {
            const nextColor = value.startsWith('#') ? value : `#${value}`;

            if (nextColor.length === 7) {
                updatePrimaryColor(nextColor);
            }
        }
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <div className="flex flex-1 items-center justify-center px-4">
                <img
                    src="/hillbcs-logo.png"
                    alt="Hillbcs"
                    className="h-10 w-auto rounded-full border border-sidebar-border/50 bg-white object-contain p-0.5 shadow-sm"
                />
                <h3 className="text-lg font-bold">Hillbcs</h3>
            </div>
            </div>

            <div className="flex flex-1 items-center justify-center px-4">
                <img
                    src="/brass-monkey-logo.png"
                    alt="Brass Monkey Repair and Rental"
                    className="h-10 w-auto rounded-full border border-sidebar-border/50 bg-white object-contain p-0.5 shadow-sm"
                />
                <h3 className="text-lg font-bold">Brass Monkey Repair and Rental</h3>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={toggleAppearance}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="flex cursor-pointer items-center gap-2 rounded border border-sidebar-border/50 p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
                >
                    {isDarkMode ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
                </button>

                {/* <Drawer direction="right">
                    <DrawerTrigger asChild>
                        <button
                            type="button"
                            aria-label="Open theme settings"
                            title="Open theme settings"
                            className="flex cursor-pointer items-center gap-2 rounded border border-sidebar-border/50 p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
                        >
                            <Palette className="size-4" />
                        </button>
                    </DrawerTrigger>

                    <DrawerContent className="w-full sm:max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>Custom Theme</DrawerTitle>
                            <DrawerDescription>
                                Pick your brand color. Your selection is saved in this browser.
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="space-y-4 px-4 pb-2">
                            <div className="space-y-2">
                                <Label htmlFor="theme-primary-color">
                                    Primary Color
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="theme-primary-color"
                                        type="color"
                                        value={primaryColor}
                                        onChange={(event) =>
                                            updatePrimaryColor(
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 w-14 cursor-pointer p-1"
                                    />
                                    <Input
                                        type="text"
                                        value={primaryColor}
                                        onChange={(event) =>
                                            handleThemeHexInput(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="#D9A441"
                                        className="font-mono uppercase"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Quick Presets</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {colorPresets.map((color) => {
                                        const isActive =
                                            primaryColor.toUpperCase() === color;

                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() =>
                                                    updatePrimaryColor(color)
                                                }
                                                aria-label={`Set theme color ${color}`}
                                                className="h-8 w-full rounded-md border transition-transform hover:scale-105"
                                                style={{
                                                    backgroundColor: color,
                                                    borderColor: isActive
                                                        ? 'var(--foreground)'
                                                        : 'var(--border)',
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <DrawerFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetPrimaryColor}
                            >
                                Reset Default
                            </Button>
                            <DrawerClose asChild>
                                <Button type="button">Done</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer> */}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex cursor-pointer items-center gap-2 rounded border border-sidebar-border/50 p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
                        >
                            <p className="whitespace-nowrap">
                               Notification
                            </p>

                            <ChevronDown className="size-3.5 opacity-60" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg"
                        align="end"
                        side="bottom"
                    >
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex cursor-pointer items-center gap-2 rounded border border-sidebar-border/50 p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
                        >
                            <div className="relative">
                                <Avatar className="size-5 bg-muted">
                                    <AvatarFallback className="font-semibold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border border-background bg-emerald-500" />
                            </div>

                            <p className="whitespace-nowrap">
                                Welcome!{' '}
                                <span className="font-semibold text-foreground">
                                    {displayName}
                                </span>
                            </p>

                            <ChevronDown className="size-3.5 opacity-60" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg"
                        align="end"
                        side="bottom"
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
