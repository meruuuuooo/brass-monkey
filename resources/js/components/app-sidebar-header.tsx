import { usePage, router, Link } from '@inertiajs/react';
import {
    Bell,
    BellOff,
    ChevronDown,
    EllipsisVertical,
    ExternalLink,
    MoonIcon,
    Palette,
    RotateCcw,
    SunIcon,
    Check,
    Info,
    Megaphone,
    AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAdvancedThemeCustomization, BRASS_MONKEY_COLORS, BRASS_MONKEY_V2_COLORS } from '@/hooks/use-advanced-theme-customization';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { Input } from './ui/input';
import { Label } from './ui/label';

type ColorInputProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
};

/**
 * Convert OKLCH color to Hex
 * OKLCH format: oklch(lightness saturation hue)
 */
function oklchToHex(oklch: string): string {
    const match = oklch.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);

    if (!match) {
        return '#000000';
    }

    const [, l, c, h] = match;
    const L = parseFloat(l);
    const C = parseFloat(c);
    const H = parseFloat(h);

    // Convert OKLCH to OKLab
    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    // Convert OKLab to linear RGB
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291486575 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const r = 4.0767416621 * l3 - 3.3077363322 * m3 + 0.2309101289 * s3;
    const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193761 * s3;
    const b_ = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    // Convert linear RGB to sRGB
    const toSRGB = (x: number) => {
        if (x <= 0.0031308) {
            return 12.92 * x;
        }

        return 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    };

    const sr = Math.max(0, Math.min(1, toSRGB(r)));
    const sg = Math.max(0, Math.min(1, toSRGB(g)));
    const sb = Math.max(0, Math.min(1, toSRGB(b_)));

    const toHex = (x: number) => {
        const hex = Math.round(x * 255)
            .toString(16)
            .padStart(2, '0');

        return hex;
    };

    return `#${toHex(sr)}${toHex(sg)}${toHex(sb)}`.toLowerCase();
}

/**
 * Convert Hex color to OKLCH
 */
function hexToOklch(hex: string): string {
    const cleanHex = hex.replace(/^#/, '');
    const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    const b = parseInt(cleanHex.slice(4, 6), 16) / 255;

    // Convert sRGB to linear RGB
    const toLinear = (x: number) => {
        if (x <= 0.04045) {
            return x / 12.92;
        }

        return Math.pow((x + 0.055) / 1.055, 2.4);
    };

    const lr = toLinear(r);
    const lg = toLinear(g);
    const lb = toLinear(b);

    // Convert linear RGB to OKLab
    const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s = 0.0883024619 * lr + 0.0817845529 * lg + 0.8943868922 * lb;

    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
    const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808649671 * s_;

    // Convert OKLab to OKLCH
    const C = Math.sqrt(a * a + b_ * b_);
    let H = (Math.atan2(b_, a) * 180) / Math.PI;

    if (H < 0) {
        H += 360;
    }

    return `oklch(${L.toFixed(3)} ${C.toFixed(6)} ${H.toFixed(3)})`;
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
    const hexValue = oklchToHex(value);

    return (
        <div className="flex items-center gap-2">
            <Label className="min-w-24 text-xs">{label}</Label>
            <input
                type="color"
                value={hexValue}
                onChange={(e) => onChange(hexToOklch(e.target.value))}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border border-input shadow-sm"
                title={`Color: ${value}`}
            />
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 font-mono text-xs"
                placeholder="oklch(0 0 0)"
            />
        </div>
    );
}

export function AppSidebarHeader() {
    const { auth } = usePage().props;
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const { colors, updateColor, resetAllColors, applyPreset } = useAdvancedThemeCustomization();
    const displayName = auth.user?.name ?? 'User';

    const typeConfig: Record<string, { color: string; icon: React.ElementType }> = {
        system: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: Info },
        promotional: { color: 'text-bm-gold bg-bm-gold/10 border-bm-gold/20', icon: Megaphone },
        alert: { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: AlertTriangle },
        info: { color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', icon: Info },
    };

    const markAllRead = () => router.post('/notifications/mark-all-read', {}, { preserveScroll: true });
    const markAsRead = (id: number) => router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });

    const initials = displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const isDarkMode = resolvedAppearance === 'dark';

    const toggleAppearance = () => {
        const nextAppearance = isDarkMode ? 'light' : 'dark';
        const shouldUseDark = nextAppearance === 'dark';

        updateAppearance(nextAppearance);

        document.documentElement.classList.toggle('dark', shouldUseDark);
        document.documentElement.style.colorScheme = shouldUseDark ? 'dark' : 'light';
    };

    return (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/40 bg-background/60 px-6 backdrop-blur-lg transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 transition-all duration-300 hover:scale-110 hover:text-amber-600 active:scale-95" />
            </div>

            <div className="group flex flex-1 cursor-default items-center justify-center gap-4 px-4 transition-all duration-300 md:ml-8">
                <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-500/10 to-orange-500/10 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
                    <img
                        src="/brass-monkey-logo.png"
                        alt="Brass Monkey Repair and Rental"
                        className="bm-logo-glow relative h-10 w-auto rounded-full border border-amber-600/20 bg-white object-contain p-0.5 shadow-sm transition-all duration-700 group-hover:scale-110 group-hover:border-amber-600/40"
                    />
                </div>
                <h3 className="hidden truncate bg-linear-to-br from-foreground via-foreground to-foreground/50 bg-clip-text text-sm font-black tracking-tight text-transparent transition-all duration-500 group-hover:tracking-normal md:block sm:text-base lg:text-xl">
                    Brass Monkey Repair and Rental
                </h3>
            </div>

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={toggleAppearance}
                    aria-label={
                        isDarkMode
                            ? 'Switch to light mode'
                            : 'Switch to dark mode'
                    }
                    title={
                        isDarkMode
                            ? 'Switch to light mode'
                            : 'Switch to dark mode'
                    }
                    className="hidden size-9 cursor-pointer items-center justify-center rounded-xl border border-border/40 bg-muted/30 text-muted-foreground transition-all duration-300 hover:bg-muted/60 hover:text-foreground hover:shadow-md hover:shadow-amber-500/5 active:scale-90 md:flex"
                >
                    {isDarkMode ? (
                        <SunIcon className="size-5 transition-transform duration-500 group-hover:rotate-45" />
                    ) : (
                        <MoonIcon className="size-5 transition-transform duration-500 group-hover:-rotate-12" />
                    )}
                </button>

                <Drawer direction="right">
                    <DrawerTrigger asChild>
                        <button
                            type="button"
                            aria-label="Open theme settings"
                            title="Open theme settings"
                            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border/40 bg-muted/30 text-muted-foreground transition-all duration-300 hover:bg-muted/60 hover:text-foreground hover:shadow-md hover:shadow-amber-500/5 active:scale-90"
                        >
                            <Palette className="size-5" />
                        </button>
                    </DrawerTrigger>

                    <DrawerContent className="w-full sm:max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle className="text-xl font-bold tracking-tight">Advanced Theme Customization</DrawerTitle>
                            <DrawerDescription>
                                Customize all colors and design tokens. Changes are saved automatically.
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="h-[60vh] w-full overflow-y-auto font-sans">
                            <div className="space-y-6 px-4 py-4">
                                {/* Presets */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Presets</h3>
                                    <div className="flex flex-wrap gap-2 pl-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applyPreset(BRASS_MONKEY_COLORS)}
                                            className="h-9 rounded-xl border-amber-600/30 bg-amber-50/50 text-amber-900 transition-all hover:bg-amber-100/80 hover:shadow-sm dark:bg-amber-900/10 dark:text-amber-100"
                                        >
                                            Brass Monkey
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applyPreset(BRASS_MONKEY_V2_COLORS)}
                                            className="h-9 rounded-md border-amber-600/30 bg-amber-950 text-amber-100 transition-all hover:bg-amber-900 hover:shadow-[0_0_15px_rgba(242,202,80,0.2)]"
                                        >
                                            Brass Monkey V2
                                        </Button>
                                    </div>
                                </div>

                                {/* Light Mode Colors */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Light Mode Colors</h3>
                                    <div className="space-y-3 pl-2">
                                        <ColorInput
                                            label="Background"
                                            value={colors.background}
                                            onChange={(val) => updateColor('background', val)}
                                        />
                                        <ColorInput
                                            label="Foreground"
                                            value={colors.foreground}
                                            onChange={(val) => updateColor('foreground', val)}
                                        />
                                        <ColorInput
                                            label="Primary"
                                            value={colors.primary}
                                            onChange={(val) => updateColor('primary', val)}
                                        />
                                        <ColorInput
                                            label="Secondary"
                                            value={colors.secondary}
                                            onChange={(val) => updateColor('secondary', val)}
                                        />
                                        <ColorInput
                                            label="Accent"
                                            value={colors.accent}
                                            onChange={(val) => updateColor('accent', val)}
                                        />
                                        <ColorInput
                                            label="Destructive"
                                            value={colors.destructive}
                                            onChange={(val) => updateColor('destructive', val)}
                                        />
                                        <ColorInput
                                            label="Border"
                                            value={colors.border}
                                            onChange={(val) => updateColor('border', val)}
                                        />
                                        <ColorInput
                                            label="Muted"
                                            value={colors.muted}
                                            onChange={(val) => updateColor('muted', val)}
                                        />
                                    </div>
                                </div>

                                {/* Chart Colors */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Chart Colors</h3>
                                    <div className="space-y-3 pl-2">
                                        {[
                                            { key: 'chart1' as const, label: 'Chart 1' },
                                            { key: 'chart2' as const, label: 'Chart 2' },
                                            { key: 'chart3' as const, label: 'Chart 3' },
                                            { key: 'chart4' as const, label: 'Chart 4' },
                                            { key: 'chart5' as const, label: 'Chart 5' },
                                        ].map(({ key, label }) => (
                                            <ColorInput
                                                key={key}
                                                label={label}
                                                value={colors[key]}
                                                onChange={(val) => updateColor(key, val)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Sidebar Colors */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Sidebar Colors</h3>
                                    <div className="space-y-3 pl-2">
                                        <ColorInput
                                            label="Sidebar Background"
                                            value={colors.sidebar}
                                            onChange={(val) => updateColor('sidebar', val)}
                                        />
                                        <ColorInput
                                            label="Sidebar Foreground"
                                            value={colors.sidebarForeground}
                                            onChange={(val) => updateColor('sidebarForeground', val)}
                                        />
                                        <ColorInput
                                            label="Sidebar Primary"
                                            value={colors.sidebarPrimary}
                                            onChange={(val) => updateColor('sidebarPrimary', val)}
                                        />
                                        <ColorInput
                                            label="Sidebar Accent"
                                            value={colors.sidebarAccent}
                                            onChange={(val) => updateColor('sidebarAccent', val)}
                                        />
                                    </div>
                                </div>

                                {/* Border Radius */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Spacing</h3>
                                    <div className="space-y-3 pl-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="theme-radius" className="text-xs font-semibold text-muted-foreground">
                                                Corner Radius
                                            </Label>
                                            <Input
                                                id="theme-radius"
                                                type="text"
                                                value={colors.radius}
                                                onChange={(e) => updateColor('radius', e.target.value)}
                                                placeholder="0.625rem"
                                                className="h-9 rounded-xl font-mono text-xs focus:ring-amber-500/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DrawerFooter className="border-t border-border/40 bg-muted/10 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetAllColors}
                                className="gap-2 rounded-xl transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-95"
                            >
                                <RotateCcw className="size-4" />
                                Reset All
                            </Button>
                            <DrawerClose asChild>
                                <Button type="button" className="rounded-xl active:scale-95">Done</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

                <div className="hidden items-center gap-3 md:flex">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Notifications"
                                title="Notifications"
                                className="relative flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border/40 bg-muted/30 text-muted-foreground transition-all duration-300 hover:bg-muted/60 hover:text-foreground hover:shadow-md hover:shadow-amber-500/5 active:scale-90"
                            >
                                <Bell className="size-5" />
                                {auth.unread_notifications_count > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bm-gold px-1 text-[10px] font-black text-black ring-2 ring-background">
                                        {auth.unread_notifications_count > 9 ? '9+' : auth.unread_notifications_count}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-80 overflow-hidden rounded-2xl border-border/40 bg-background/95 p-0 shadow-2xl backdrop-blur-xl"
                            align="end"
                            side="bottom"
                        >
                            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3 bg-muted/20">
                                <h3 className="text-sm font-bold tracking-tight">Notifications</h3>
                                {auth.unread_notifications_count > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-[10px] font-black uppercase tracking-widest text-bm-gold hover:text-bm-gold/80 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {auth.recent_notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center space-y-3 px-6 py-10 text-center">
                                        <div className="relative">
                                            <div className="absolute -inset-4 rounded-full bg-amber-500/10 blur-2xl dark:bg-amber-900/20" />
                                            <div className="relative flex size-16 items-center justify-center rounded-full border border-amber-600/10 bg-amber-500/5 dark:bg-amber-900/10">
                                                <BellOff className="size-7 text-amber-600/40" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-foreground">No notifications yet</p>
                                            <p className="text-xs text-muted-foreground">We'll let you know when something important happens.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2">
                                        {auth.recent_notifications.map((notif) => {
                                            const cfg = typeConfig[notif.type] || typeConfig.info;
                                            const Icon = cfg.icon;
                                            const isRead = notif.pivot?.is_read;

                                            return (
                                                <div
                                                    key={notif.id}
                                                    className={cn(
                                                        "group/item relative px-4 py-3 hover:bg-muted/40 transition-colors border-l-2",
                                                        isRead ? "border-transparent" : "border-bm-gold bg-bm-gold/5"
                                                    )}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0 border", cfg.color)}>
                                                            <Icon className="size-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className={cn("text-xs font-bold leading-none", isRead ? "text-foreground/80" : "text-foreground")}>
                                                                    {notif.title}
                                                                </p>
                                                                <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                                                    {new Date(notif.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className={cn("text-[11px] mt-1 line-clamp-2 leading-relaxed", isRead ? "text-muted-foreground/70" : "text-muted-foreground")}>
                                                                {notif.message}
                                                            </p>
                                                            {!isRead && (
                                                                <button
                                                                    onClick={() => markAsRead(notif.id)}
                                                                    className="mt-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-bm-gold opacity-0 group-hover/item:opacity-100 transition-opacity"
                                                                >
                                                                    <Check className="size-3" /> Mark Read
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border/40 bg-muted/20 p-2">
                                <Button
                                    variant="outline"
                                    asChild
                                    className="h-9 w-full gap-2 rounded-xl border-amber-600/20 bg-amber-500/5 text-xs font-bold text-amber-600 transition-all hover:bg-amber-500 hover:text-white dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-400 dark:hover:bg-amber-600 dark:hover:text-white"
                                >
                                    <Link href="/notifications">
                                        <ExternalLink className="size-3" />
                                        View All Notifications
                                    </Link>
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border/40 bg-muted/30 p-1 pr-4 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:bg-muted/60 hover:text-foreground hover:shadow-md hover:shadow-amber-500/5 active:scale-95 focus-visible:outline-none"
                            >
                                <div className="relative">
                                    <Avatar className="size-7 ring-2 ring-border/20 transition-all group-hover:ring-amber-500/30">
                                        <AvatarFallback className="bg-gradient-to-br from-neutral-200 to-neutral-300 text-[10px] font-black tracking-tighter text-black dark:from-neutral-700 dark:to-neutral-800 dark:text-white">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-background bg-emerald-500 shadow-sm transition-transform duration-300 group-hover:scale-125" />
                                </div>

                                <p className="whitespace-nowrap">
                                    Welcome!{' '}
                                    <span className="font-black text-foreground">
                                        {displayName}
                                    </span>
                                </p>

                                <ChevronDown className="size-4 opacity-50 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="min-w-60 rounded-xl border-border/40 bg-background/80 p-2 shadow-2xl backdrop-blur-xl"
                            align="end"
                            side="bottom"
                        >
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            aria-label="Open menu"
                            title="Open menu"
                            className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-border/40 bg-muted/30 text-muted-foreground transition-all duration-300 hover:bg-muted/60 hover:text-foreground active:scale-90 md:hidden"
                        >
                            <EllipsisVertical className="size-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-xl border-border/40 bg-background/80 p-2 shadow-2xl backdrop-blur-xl md:hidden"
                        align="end"
                        side="bottom"
                    >
                        <DropdownMenuItem onClick={toggleAppearance} className="rounded-lg py-2.5 transition-all focus:bg-amber-500/10 focus:text-amber-600 dark:focus:bg-amber-500/20">
                            {isDarkMode ? (
                                <SunIcon className="mr-3 size-4.5" />
                            ) : (
                                <MoonIcon className="mr-3 size-4.5" />
                            )}
                            <span className="font-medium">
                                {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            </span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2 bg-border/40" />

                        <DropdownMenuItem className="rounded-lg py-2.5 transition-all focus:bg-amber-500/10 focus:text-amber-600 dark:focus:bg-amber-500/20">
                            <span className="font-medium">Notification</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="my-2 bg-border/40" />

                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
