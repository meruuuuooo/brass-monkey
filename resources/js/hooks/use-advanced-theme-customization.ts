import { useState } from 'react';

const STORAGE_KEY = 'app-theme-advanced-custom';

type ThemeColors = {
    // Light Mode
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    // Chart Colors
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
    // Sidebar Colors
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
    // Border Radius
    radius: string;
};

const DEFAULT_COLORS: ThemeColors = {
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.141 0.005 285.823)',
    card: 'oklch(1 0 0)',
    cardForeground: 'oklch(0.141 0.005 285.823)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.141 0.005 285.823)',
    primary: 'oklch(0.555 0.163 48.998)',
    primaryForeground: 'oklch(0.987 0.022 95.277)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    muted: 'oklch(0.967 0.001 286.375)',
    mutedForeground: 'oklch(0.552 0.016 285.938)',
    accent: 'oklch(0.967 0.001 286.375)',
    accentForeground: 'oklch(0.21 0.006 285.885)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.92 0.004 286.32)',
    input: 'oklch(0.92 0.004 286.32)',
    ring: 'oklch(0.705 0.015 286.067)',
    chart1: 'oklch(0.879 0.169 91.605)',
    chart2: 'oklch(0.769 0.188 70.08)',
    chart3: 'oklch(0.666 0.179 58.318)',
    chart4: 'oklch(0.555 0.163 48.998)',
    chart5: 'oklch(0.473 0.137 46.201)',
    sidebar: 'oklch(0.985 0 0)',
    sidebarForeground: 'oklch(0.141 0.005 285.823)',
    sidebarPrimary: 'oklch(0.666 0.179 58.318)',
    sidebarPrimaryForeground: 'oklch(0.987 0.022 95.277)',
    sidebarAccent: 'oklch(0.967 0.001 286.375)',
    sidebarAccentForeground: 'oklch(0.21 0.006 285.885)',
    sidebarBorder: 'oklch(0.92 0.004 286.32)',
    sidebarRing: 'oklch(0.705 0.015 286.067)',
    radius: '0.625rem',
};

export const BRASS_MONKEY_COLORS: ThemeColors = {
    background: 'oklch(0.954 0.013 86.843)', // #F4F0E3
    foreground: 'oklch(0.267 0.026 55.4)', // #3C3024
    card: 'oklch(0.96 0.01 86.8)',
    cardForeground: 'oklch(0.267 0.026 55.4)',
    popover: 'oklch(0.96 0.01 86.8)',
    popoverForeground: 'oklch(0.267 0.026 55.4)',
    primary: 'oklch(0.473 0.081 57.1)', // #83643E
    primaryForeground: 'oklch(0.987 0.022 95.277)',
    secondary: 'oklch(0.643 0.014 62.1)', // #9A9186
    secondaryForeground: 'oklch(0.267 0.026 55.4)',
    muted: 'oklch(0.9 0.01 62.1)',
    mutedForeground: 'oklch(0.4 0.01 62.1)',
    accent: 'oklch(0.635 0.129 76.5)', // #B89232
    accentForeground: 'oklch(0.987 0.022 95.277)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.85 0.01 62.1)',
    input: 'oklch(0.85 0.01 62.1)',
    ring: 'oklch(0.635 0.129 76.5)',
    chart1: 'oklch(0.473 0.081 57.1)',
    chart2: 'oklch(0.635 0.129 76.5)',
    chart3: 'oklch(0.643 0.014 62.1)',
    chart4: 'oklch(0.267 0.026 55.4)',
    chart5: 'oklch(0.555 0.163 48.998)',
    sidebar: 'oklch(0.267 0.026 55.4)', // #3C3024
    sidebarForeground: 'oklch(0.954 0.013 86.843)', // #F4F0E3
    sidebarPrimary: 'oklch(0.635 0.129 76.5)',
    sidebarPrimaryForeground: 'oklch(0.987 0.022 95.277)',
    sidebarAccent: 'oklch(0.473 0.081 57.1)',
    sidebarAccentForeground: 'oklch(0.954 0.013 86.843)',
    sidebarBorder: 'oklch(0.35 0.02 55.4)',
    sidebarRing: 'oklch(0.635 0.129 76.5)',
    radius: '0.625rem',
};

/**
 * Apply theme colors to document root by injecting CSS
 */
function applyThemeColors(colors: ThemeColors): void {
    if (typeof document === 'undefined') {
        return;
    }

    let styleEl = document.getElementById(
        'theme-advanced-styles',
    ) as HTMLStyleElement | null;

    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'theme-advanced-styles';
        document.head.appendChild(styleEl);
    }

    const cssVars = `
        :root:not(.dark) {
            --background: ${colors.background};
            --foreground: ${colors.foreground};
            --card: ${colors.card};
            --card-foreground: ${colors.cardForeground};
            --popover: ${colors.popover};
            --popover-foreground: ${colors.popoverForeground};
            --primary: ${colors.primary};
            --primary-foreground: ${colors.primaryForeground};
            --secondary: ${colors.secondary};
            --secondary-foreground: ${colors.secondaryForeground};
            --muted: ${colors.muted};
            --muted-foreground: ${colors.mutedForeground};
            --accent: ${colors.accent};
            --accent-foreground: ${colors.accentForeground};
            --destructive: ${colors.destructive};
            --destructive-foreground: ${colors.destructiveForeground};
            --border: ${colors.border};
            --input: ${colors.input};
            --ring: ${colors.ring};
            --chart-1: ${colors.chart1};
            --chart-2: ${colors.chart2};
            --chart-3: ${colors.chart3};
            --chart-4: ${colors.chart4};
            --chart-5: ${colors.chart5};
            --sidebar: ${colors.sidebar};
            --sidebar-foreground: ${colors.sidebarForeground};
            --sidebar-primary: ${colors.sidebarPrimary};
            --sidebar-primary-foreground: ${colors.sidebarPrimaryForeground};
            --sidebar-accent: ${colors.sidebarAccent};
            --sidebar-accent-foreground: ${colors.sidebarAccentForeground};
            --sidebar-border: ${colors.sidebarBorder};
            --sidebar-ring: ${colors.sidebarRing};
            --radius: ${colors.radius};
        }
    `;

    styleEl.textContent = cssVars;
}

/**
 * Hook to manage advanced theme customization
 */
export function useAdvancedThemeCustomization() {
    const [colors, setColors] = useState<ThemeColors>(() => {
        if (typeof window === 'undefined') {
            return DEFAULT_COLORS;
        }

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            try {
                const parsedColors = JSON.parse(saved);
                applyThemeColors(parsedColors);

                return parsedColors;
            } catch {
                applyThemeColors(DEFAULT_COLORS);

                return DEFAULT_COLORS;
            }
        }

        applyThemeColors(DEFAULT_COLORS);

        return DEFAULT_COLORS;
    });

    const updateColor = (key: keyof ThemeColors, value: string): void => {
        const newColors = { ...colors, [key]: value };

        setColors(newColors);

        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newColors));
        }

        applyThemeColors(newColors);
    };

    const resetAllColors = (): void => {
        setColors(DEFAULT_COLORS);

        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }

        applyThemeColors(DEFAULT_COLORS);
    };

    const exportTheme = (): string => {
        return JSON.stringify(colors, null, 2);
    };

    const importTheme = (jsonString: string): boolean => {
        try {
            const imported = JSON.parse(jsonString);
            setColors(imported);

            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
            }

            applyThemeColors(imported);

            return true;
        } catch {
            return false;
        }
    };

    const applyPreset = (presetColors: ThemeColors): void => {
        setColors(presetColors);

        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(presetColors));
        }

        applyThemeColors(presetColors);
    };

    return {
        colors,
        defaultColors: DEFAULT_COLORS,
        exportTheme,
        importTheme,
        resetAllColors,
        updateColor,
        applyPreset,
    };
}
