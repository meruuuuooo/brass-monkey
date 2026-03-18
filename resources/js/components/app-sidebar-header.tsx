import { usePage } from '@inertiajs/react';
import {
    ChevronDown,
    EllipsisVertical,
    MoonIcon,
    Palette,
    RotateCcw,
    SunIcon,
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
import { useAdvancedThemeCustomization, BRASS_MONKEY_COLORS } from '@/hooks/use-advanced-theme-customization';
import { useAppearance } from '@/hooks/use-appearance';
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
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
            </div>

            <div className="flex flex-1 items-center justify-center gap-3 px-4 md:ml-8">
                <img
                    src="/brass-monkey-logo.png"
                    alt="Brass Monkey Repair and Rental"
                    className="h-10 w-auto rounded-full border border-sidebar-border/50 bg-white object-contain p-0.6 shadow-sm"
                />
                <h3 className="hidden truncate text-sm font-bold md:block sm:text-base lg:text-lg">
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
                    className="hidden cursor-pointer items-center gap-2 rounded border border-sidebar-border/50 p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none md:flex"
                >
                    {isDarkMode ? (
                        <SunIcon className="size-4" />
                    ) : (
                        <MoonIcon className="size-4" />
                    )}
                </button>

                <Drawer direction="right">
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
                            <DrawerTitle>Advanced Theme Customization</DrawerTitle>
                            <DrawerDescription>
                                Customize all colors and design tokens. Changes are saved automatically.
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="h-[60vh] w-full overflow-y-auto">
                            <div className="space-y-6 px-4 py-4">
                                {/* Presets */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold">Presets</h3>
                                    <div className="flex flex-wrap gap-2 pl-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => applyPreset(BRASS_MONKEY_COLORS)}
                                            className="h-8 border-amber-600/50 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-100"
                                        >
                                            Brass Monkey
                                        </Button>
                                    </div>
                                </div>

                                {/* Light Mode Colors */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold">Light Mode Colors</h3>
                                    <div className="space-y-2 pl-2">
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
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold">Chart Colors</h3>
                                    <div className="space-y-2 pl-2">
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
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold">Sidebar Colors</h3>
                                    <div className="space-y-2 pl-2">
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
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold">Spacing</h3>
                                    <div className="space-y-2 pl-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="theme-radius" className="text-xs">
                                                Border Radius
                                            </Label>
                                            <Input
                                                id="theme-radius"
                                                type="text"
                                                value={colors.radius}
                                                onChange={(e) => updateColor('radius', e.target.value)}
                                                placeholder="0.625rem"
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DrawerFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetAllColors}
                                className="gap-2"
                            >
                                <RotateCcw className="size-4" />
                                Reset All
                            </Button>
                            <DrawerClose asChild>
                                <Button type="button">Done</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

                <div className="hidden items-center gap-3 md:flex">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex cursor-pointer items-center gap-2 rounded border border-sidebar-border/50 p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
                            >
                                <p className="whitespace-nowrap">Notification</p>

                                <ChevronDown className="size-3.5 opacity-60" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="min-w-56 rounded-lg"
                            align="end"
                            side="bottom"
                        />
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

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            aria-label="Open menu"
                            title="Open menu"
                            className="flex cursor-pointer items-center rounded border border-sidebar-border/50 p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none md:hidden"
                        >
                            <EllipsisVertical className="size-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg md:hidden"
                        align="end"
                        side="bottom"
                    >
                        <DropdownMenuItem onClick={toggleAppearance}>
                            {isDarkMode ? (
                                <SunIcon className="mr-2 size-4" />
                            ) : (
                                <MoonIcon className="mr-2 size-4" />
                            )}
                            <span>
                                {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                            </span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem>Notification</DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
