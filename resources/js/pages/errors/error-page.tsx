import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';

type ErrorPageProps = {
    code: number;
    title: string;
    description: string;
};

export default function ErrorPage({ code, title, description }: ErrorPageProps) {
    return (
        <>
            <Head title={`${code} ${title}`} />

            <main className="bm-grain relative flex min-h-screen items-center justify-center overflow-hidden bg-bm-dark px-4 py-10">
                <div className="absolute inset-0 z-0 flex">
                    <div className="hidden h-full w-1/2 bg-bm-gradient lg:block" />
                    <div className="h-full w-full bg-bm-dark lg:w-1/2" />
                </div>

                <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none leading-none">
                    <svg
                        className="relative block h-22.5 w-full"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,103.14-6.13,183.15,36.56,285.5,41.49,61.4,3,122.95-10.27,184.21-19.5,120.5-18.15,223,12.72,365,5.1V0Z"
                            className="fill-bm-gold/5"
                        />
                        <path
                            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                            className="fill-bm-cream"
                        />
                    </svg>
                </div>

                <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bm-gold/5 blur-[110px]" />

                <section className="relative z-30 w-full max-w-2xl bm-glass-premium bm-shadow-premium rounded-2xl p-6 md:p-10 [--primary:var(--color-bm-gold)] [--primary-foreground:var(--color-bm-dark)] [--ring:var(--color-bm-gold)] [--foreground:var(--color-bm-white)] [--muted-foreground:var(--color-bm-muted)]">
                    <div className="mb-8 flex items-center justify-center">
                        <Link href={home()} className="group relative inline-flex items-center justify-center transition-transform duration-300 hover:scale-105">
                            <div className="absolute -inset-6 rounded-full bg-bm-gold/15 blur-[35px] opacity-60 transition-opacity group-hover:opacity-100" />
                            <AppLogoIcon className="bm-logo-glow relative h-24 w-auto drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]" />
                        </Link>
                    </div>

                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-bm-gold/30 bg-bm-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-bm-gold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        HTTP Error {code}
                    </div>

                    <p className="text-5xl font-black tracking-tight text-bm-white md:text-6xl">{code}</p>
                    <h1 className="mt-3 text-2xl font-serif font-bold text-bm-white md:text-3xl">{title}</h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-bm-muted md:text-base">
                        {description}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="w-full bg-bm-gold text-bm-dark hover:bg-bm-gold-hover sm:w-auto" variant="default">
                            <Link href={home()}>
                                <Home className="h-4 w-4" />
                                Back to home
                            </Link>
                        </Button>

                        <Button
                            type="button"
                            className="w-full sm:w-auto"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go back
                        </Button>
                    </div>
                </section>
            </main>
        </>
    );
}
