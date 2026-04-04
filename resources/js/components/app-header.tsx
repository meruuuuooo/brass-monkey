import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Menu,
    Bell,
    ShoppingCart,
    Wrench,
    PackageCheck,
    Activity,
    Truck,
    Megaphone,
    BookText,
    MoonIcon,
    SunIcon,
    Palette,
    RotateCcw,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CartButton, CartDrawer } from '@/components/cart-drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import {
    useAdvancedThemeCustomization,
    BRASS_MONKEY_COLORS,
    BRASS_MONKEY_V2_COLORS,
} from '@/hooks/use-advanced-theme-customization';
import { useAppearance } from '@/hooks/use-appearance';
import { useCart } from '@/hooks/use-cart';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [
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

const rightNavItems: NavItem[] = [];

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

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
    if (!oklch || typeof oklch !== 'string') {
        return '#000000';
    }

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
    if (!hex || typeof hex !== 'string') {
        return 'oklch(0 0 0)';
    }

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

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const { colors, updateColor, resetAllColors, applyPreset } =
        useAdvancedThemeCustomization();
    const { cart, cartCount, subtotal, tax, total, updateQty, removeFromCart, clearCart } = useCart();
    const [cartOpen, setCartOpen] = useState(false);

    const isDarkMode = resolvedAppearance === 'dark';

    const toggleAppearance = () => {
        const nextAppearance = isDarkMode ? 'light' : 'dark';
        const shouldUseDark = nextAppearance === 'dark';

        updateAppearance(nextAppearance);

        document.documentElement.classList.toggle('dark', shouldUseDark);
        document.documentElement.style.colorScheme = shouldUseDark
            ? 'dark'
            : 'light';
    };

    return (
        <>
            <div className="fixed top-0 right-0 left-0 z-50 border-b border-bm-border/10 bg-bm-dark/80 backdrop-blur-md">
                <div className="text-bm-white flex h-20 items-center bg-bm-dark px-6">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-8.5 w-8.5"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map(
                                                (item) =>
                                                    item.href && (
                                                        <Link
                                                            key={item.title}
                                                            href={item.href}
                                                            className="flex items-center space-x-2 font-medium"
                                                        >
                                                            {item.icon && (
                                                                <item.icon className="h-5 w-5" />
                                                            )}
                                                            <span>
                                                                {item.title}
                                                            </span>
                                                        </Link>
                                                    ),
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map(
                                                (item) =>
                                                    item.href && (
                                                        <a
                                                            key={item.title}
                                                            href={toUrl(
                                                                item.href as string,
                                                            )}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center space-x-2 font-medium"
                                                        >
                                                            {item.icon && (
                                                                <item.icon className="h-5 w-5" />
                                                            )}
                                                            <span>
                                                                {item.title}
                                                            </span>
                                                        </a>
                                                    ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2 text-bm-white"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-auto hidden h-full items-center lg:flex pr-8">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map(
                                    (item, index) =>
                                        item.href && (
                                            <NavigationMenuItem
                                                key={index}
                                                className="relative flex h-full items-center"
                                            >
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        navigationMenuTriggerStyle(),
                                                        whenCurrentUrl(
                                                            item.href,
                                                            activeItemStyles,
                                                        ),
                                                        'cursor-pointer text-bm-white focus:bg-bm-dark dark:bg-bm-dark px-3 bg-bm-dark hover:text-bm-gold hover:bg-bm-dark rounded-md',
                                                    )}
                                                >
                                                    {/* {item.icon && (
                                                        <item.icon className="mr-2 h-4 w-4" />
                                                    )} */}
                                                    {item.title}
                                                </Link>
                                                {isCurrentUrl(item.href) && (
                                                    <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-bm-gold dark:bg-bm-gold"></div>
                                                )}
                                            </NavigationMenuItem>
                                        ),
                                )}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="flex items-center">
                        <div className="relative flex items-center space-x-3">
                            {/* Add to Cart Button */}
                            <CartButton
                                cartCount={cartCount}
                                onClick={() => setCartOpen(true)}

                            />

                            <CartDrawer
                                open={cartOpen}
                                onClose={() => setCartOpen(false)}
                                cart={cart}
                                cartCount={cartCount}
                                subtotal={subtotal}
                                tax={tax}
                                total={total}
                                updateQty={updateQty}
                                removeFromCart={removeFromCart}
                                clearCart={clearCart}
                            />

                            {/* Theme Toggle Button */}
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
                                className="hidden size-9 cursor-pointer items-center justify-center rounded-md border border-border/40 bg-bm-dark/30 text-muted-foreground transition-all duration-300 hover:bg-bm-dark/60 hover:text-foreground hover:shadow-md active:scale-90 md:flex"
                            >
                                {isDarkMode ? (
                                    <SunIcon className="size-5 transition-transform duration-500 hover:rotate-45" />
                                ) : (
                                    <MoonIcon className="size-5 transition-transform duration-500 hover:-rotate-12" />
                                )}
                            </button>

                            {/* Advanced Theme Customization Drawer */}
                            <Drawer direction="right">
                                <DrawerTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label="Open theme settings"
                                        title="Open theme settings"
                                        className="flex size-9 cursor-pointer items-center justify-center rounded-md border border-border/40 bg-bm-dark/30 text-muted-foreground transition-all duration-300 hover:bg-bm-dark/60 hover:text-foreground hover:shadow-md active:scale-90"
                                    >
                                        <Palette className="size-5" />
                                    </button>
                                </DrawerTrigger>

                                <DrawerContent className="w-full sm:max-w-sm">
                                    <DrawerHeader>
                                        <DrawerTitle className="text-xl font-bold tracking-tight">
                                            Advanced Theme Customization
                                        </DrawerTitle>
                                        <DrawerDescription>
                                            Customize all colors and design
                                            tokens. Changes are saved
                                            automatically.
                                        </DrawerDescription>
                                    </DrawerHeader>

                                    <div className="h-[60vh] w-full overflow-y-auto font-sans">
                                        <div className="space-y-6 px-4 py-4">
                                            {/* Presets */}
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold tracking-widest text-muted-foreground/70 uppercase">
                                                    Presets
                                                </h3>
                                                <div className="flex flex-wrap gap-2 pl-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            applyPreset(
                                                                BRASS_MONKEY_COLORS,
                                                            )
                                                        }
                                                        className="h-9 rounded-xl border-amber-600/30 bg-amber-50/50 text-amber-900 transition-all hover:bg-amber-100/80 hover:shadow-sm dark:bg-amber-900/10 dark:text-amber-100"
                                                    >
                                                        Brass Monkey
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            applyPreset(
                                                                BRASS_MONKEY_V2_COLORS,
                                                            )
                                                        }
                                                        className="h-9 rounded-md border-amber-600/30 bg-amber-950 text-amber-100 transition-all hover:bg-amber-900 hover:shadow-[0_0_15px_rgba(242,202,80,0.2)]"
                                                    >
                                                        Brass Monkey V2
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Light Mode Colors */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold tracking-widest text-muted-foreground/70 uppercase">
                                                    Light Mode Colors
                                                </h3>
                                                <div className="space-y-3 pl-2">
                                                    <ColorInput
                                                        label="Background"
                                                        value={
                                                            colors.background
                                                        }
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'background',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <ColorInput
                                                        label="Foreground"
                                                        value={
                                                            colors.foreground
                                                        }
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'foreground',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <ColorInput
                                                        label="Primary"
                                                        value={colors.primary}
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'primary',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <ColorInput
                                                        label="Secondary"
                                                        value={colors.secondary}
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'secondary',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <ColorInput
                                                        label="Accent"
                                                        value={colors.accent}
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'accent',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <ColorInput
                                                        label="Destructive"
                                                        value={
                                                            colors.destructive
                                                        }
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'destructive',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <ColorInput
                                                        label="Border"
                                                        value={colors.border}
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'border',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <ColorInput
                                                        label="Muted"
                                                        value={colors.muted}
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'muted',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {/* Chart Colors */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold tracking-widest text-muted-foreground/70 uppercase">
                                                    Chart Colors
                                                </h3>
                                                <div className="space-y-3 pl-2">
                                                    {[
                                                        {
                                                            key: 'chart1' as const,
                                                            label: 'Chart 1',
                                                        },
                                                        {
                                                            key: 'chart2' as const,
                                                            label: 'Chart 2',
                                                        },
                                                        {
                                                            key: 'chart3' as const,
                                                            label: 'Chart 3',
                                                        },
                                                        {
                                                            key: 'chart4' as const,
                                                            label: 'Chart 4',
                                                        },
                                                        {
                                                            key: 'chart5' as const,
                                                            label: 'Chart 5',
                                                        },
                                                    ].map(({ key, label }) => (
                                                        <ColorInput
                                                            key={key}
                                                            label={label}
                                                            value={colors[key]}
                                                            onChange={(val) =>
                                                                updateColor(
                                                                    key,
                                                                    val,
                                                                )
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Sidebar Colors */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold tracking-widest text-muted-foreground/70 uppercase">
                                                    Sidebar Colors
                                                </h3>
                                                <div className="space-y-3 pl-2">
                                                    <ColorInput
                                                        label="Sidebar Background"
                                                        value={colors.sidebar}
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'sidebar',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <ColorInput
                                                        label="Sidebar Foreground"
                                                        value={
                                                            colors.sidebarForeground
                                                        }
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'sidebarForeground',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <ColorInput
                                                        label="Sidebar Primary"
                                                        value={
                                                            colors.sidebarPrimary
                                                        }
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'sidebarPrimary',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                    <ColorInput
                                                        label="Sidebar Accent"
                                                        value={
                                                            colors.sidebarAccent
                                                        }
                                                        onChange={(val) =>
                                                            updateColor(
                                                                'sidebarAccent',
                                                                val,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {/* Border Radius */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-bold tracking-widest text-muted-foreground/70 uppercase">
                                                    Spacing
                                                </h3>
                                                <div className="space-y-3 pl-2">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="theme-radius"
                                                            className="text-xs font-semibold text-muted-foreground"
                                                        >
                                                            Corner Radius
                                                        </Label>
                                                        <Input
                                                            id="theme-radius"
                                                            type="text"
                                                            value={
                                                                colors.radius
                                                            }
                                                            onChange={(e) =>
                                                                updateColor(
                                                                    'radius',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="0.625rem"
                                                            className="h-9 rounded-md font-mono text-xs focus:ring-amber-500/20"
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
                                            className="gap-2 rounded-md transition-all hover:bg-destructive hover:text-destructive-foreground active:scale-95"
                                        >
                                            <RotateCcw className="size-4" />
                                            Reset All
                                        </Button>
                                        <DrawerClose asChild>
                                            <Button
                                                type="button"
                                                className="rounded-md active:scale-95"
                                            >
                                                Done
                                            </Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>

                            <Link
                                href="/notifications"
                                className="hidden size-9 cursor-pointer items-center justify-center rounded-md border border-border/40 bg-bm-dark text-muted-foreground transition-all duration-300 hover:bg-bm-dark/60 hover:text-foreground hover:shadow-md active:scale-90 md:flex"
                            >
                                <Bell className="size-5 opacity-80 group-hover:opacity-100" />
                                {auth.unread_notifications_count > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-bm-gold px-1 text-[10px] font-black text-black">
                                        {auth.unread_notifications_count > 9
                                            ? '9+'
                                            : auth.unread_notifications_count}
                                    </span>
                                )}
                                <span className="sr-only">Notifications</span>
                            </Link>

                            <div className="ml-1 hidden gap-1 lg:flex">
                                {rightNavItems.map(
                                    (item) =>
                                        item.href && (
                                            <Tooltip key={item.title}>
                                                <TooltipTrigger>
                                                    <a
                                                        href={toUrl(
                                                            item.href as string,
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                    >
                                                        <span className="sr-only">
                                                            {item.title}
                                                        </span>
                                                        {item.icon && (
                                                            <item.icon className="size-5 opacity-80 group-hover:opacity-100" />
                                                        )}
                                                    </a>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{item.title}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ),
                                )}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    // variant="ghost"
                                    className="hidden size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground bg-bm-dark active:scale-90 md:flex"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-md hover:bg-bm-gold/60 hover:text-bm-dark">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-md bg-bm-gold text-black dark:bg-bm-dark dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-header-border bg-header flex w-full border-b">
                    <div className="text-header-foreground/60 mx-auto flex h-12 w-full items-center justify-start px-4 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
