import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'theme-primary-color';
const DEFAULT_COLOR = '#D9A441';

const listeners = new Set<() => void>();
let currentPrimaryColor = DEFAULT_COLOR;

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

const isValidHexColor = (value: string): boolean => {
    return /^#([0-9A-Fa-f]{6})$/.test(value);
};

const normalizeHexColor = (value: string): string => {
    const normalized = value.trim().toUpperCase();

    return isValidHexColor(normalized) ? normalized : DEFAULT_COLOR;
};

const getReadableForeground = (hex: string): string => {
    const red = Number.parseInt(hex.slice(1, 3), 16);
    const green = Number.parseInt(hex.slice(3, 5), 16);
    const blue = Number.parseInt(hex.slice(5, 7), 16);

    const toLinear = (channel: number): number => {
        const sRGB = channel / 255;

        return sRGB <= 0.03928
            ? sRGB / 12.92
            : ((sRGB + 0.055) / 1.055) ** 2.4;
    };

    const luminance =
        0.2126 * toLinear(red) +
        0.7152 * toLinear(green) +
        0.0722 * toLinear(blue);

    return luminance > 0.42 ? '#1F2937' : '#F9FAFB';
};

const getStoredPrimaryColor = (): string => {
    if (typeof window === 'undefined') {
        return DEFAULT_COLOR;
    }

    let storedValue: string | null = null;

    try {
        storedValue = localStorage.getItem(STORAGE_KEY);
    } catch {
        return DEFAULT_COLOR;
    }

    if (!storedValue) {
        return DEFAULT_COLOR;
    }

    return normalizeHexColor(storedValue);
};

const applyPrimaryColor = (hex: string): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const readableForeground = getReadableForeground(hex);

    // Apply to Tailwind v4 theme variables to support hex colors safely.
    document.documentElement.style.setProperty('--color-primary', hex);
    document.documentElement.style.setProperty('--color-accent', hex);
    document.documentElement.style.setProperty('--color-sidebar-primary', hex);

    document.documentElement.style.setProperty(
        '--color-primary-foreground',
        readableForeground,
    );
    document.documentElement.style.setProperty(
        '--color-accent-foreground',
        readableForeground,
    );
    document.documentElement.style.setProperty(
        '--color-sidebar-primary-foreground',
        readableForeground,
    );
};

export function initializeThemeColor(): void {
    if (typeof window === 'undefined') {
        return;
    }

    currentPrimaryColor = getStoredPrimaryColor();
    applyPrimaryColor(currentPrimaryColor);
}

export function useThemeColor() {
    const primaryColor = useSyncExternalStore(
        subscribe,
        () => currentPrimaryColor,
        () => DEFAULT_COLOR,
    );

    const updatePrimaryColor = (value: string): void => {
        const nextColor = normalizeHexColor(value);

        currentPrimaryColor = nextColor;

        try {
            localStorage.setItem(STORAGE_KEY, nextColor);
        } catch {
            // Ignore storage write issues and still apply in-memory/theme state.
        }

        applyPrimaryColor(nextColor);
        notify();
    };

    const resetPrimaryColor = (): void => {
        currentPrimaryColor = DEFAULT_COLOR;

        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore storage remove issues and still apply default state.
        }

        applyPrimaryColor(DEFAULT_COLOR);
        notify();
    };

    return {
        primaryColor,
        updatePrimaryColor,
        resetPrimaryColor,
    } as const;
}
