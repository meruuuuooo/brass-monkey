import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="bm-grain relative grid h-dvh flex-col items-center justify-center bg-bm-dark px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0 overflow-hidden">
            {/* Split Background ensuring no lines */}
            <div className="absolute inset-0 z-0 flex">
                <div className="h-full w-1/2 bg-bm-gradient hidden lg:block" />
                <div className="h-full w-full lg:w-1/2 bg-bm-dark" />
            </div>

            {/* Global Layered Waves spanning full width */}
            <div className="absolute inset-x-0 bottom-0 z-10 leading-none pointer-events-none">
                <svg
                    className="relative block h-[90px] w-full"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,103.14-6.13,183.15,36.56,285.5,41.49,61.4,3,122.95-10.27,184.21-19.5,120.5-18.15,223,12.72,365,5.1V0Z"
                        className="fill-bm-gold/5"
                    ></path>
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        className="fill-bm-cream"
                    ></path>
                </svg>
            </div>

            <div className="relative hidden h-full flex-col items-center justify-center overflow-hidden p-10 text-white lg:flex z-20">
                {/* Atmospheric Glow for Left Pane */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-bm-gold/5 blur-[120px] rounded-full pointer-events-none" />

                <Link
                    href={home()}
                    className="relative z-20 flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 group"
                >
                    <div className="absolute -inset-12 bg-bm-gold/15 blur-[60px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity animate-pulse duration-[4000ms]" />
                    <AppLogoIcon className="bm-logo-glow h-64 w-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
                </Link>

                <div className="relative z-20 mt-12 text-center max-w-sm">
                    <p className="text-xl font-serif text-bm-cream italic tracking-wide drop-shadow-sm">
                        "Where mechanics meet mastery."
                    </p>
                    <div className="h-1 w-12 bg-bm-gold mx-auto mt-4 rounded-full shadow-[0_0_10px_rgba(212,160,23,0.5)]" />
                </div>
            </div>

            <div className="relative z-30 h-full w-full flex items-center justify-center lg:p-8">
                {/* Atmospheric Glow for Right Pane */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bm-gold/[0.03] blur-[100px] rounded-full pointer-events-none" />

                <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[450px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-32 drop-shadow-xl bm-logo-glow" />
                    </Link>

                    <div className="bm-glass-premium bm-shadow-premium rounded-2xl p-10 space-y-8 [--primary:var(--color-bm-gold)] [--primary-foreground:var(--color-bm-dark)] [--ring:var(--color-bm-gold)] [--foreground:var(--color-bm-white)] [--muted-foreground:var(--color-bm-muted)]">
                        <div className="flex flex-col items-start gap-3 text-left sm:items-center sm:text-center">
                            <h1 className="text-4xl font-serif font-bold tracking-tight text-bm-white">{title}</h1>
                            <p className="text-base text-balance text-bm-muted/90 font-medium">
                                {description}
                            </p>
                        </div>
                        <div className="relative">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
