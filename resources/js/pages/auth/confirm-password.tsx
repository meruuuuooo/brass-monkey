import { Form, Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Lock, Loader2, ShieldCheck, ChevronLeft } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { home } from '@/routes';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <div className="min-h-dvh flex flex-col items-center justify-center bg-bm-dark bm-grain relative overflow-hidden px-4">
            {/* Atmospheric glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-bm-gold/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bm-gold/[0.03] to-transparent pointer-events-none" />

            {/* Back to Profile — top left */}
            <div className="absolute top-6 left-6 z-30">
                <Link
                    href="/settings/profile"
                    className="flex items-center gap-2 text-sm font-bold text-bm-white hover:text-bm-gold transition-all duration-200 group"
                >
                    <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                    Back to Profile
                </Link>
            </div>

            {/* Logo at top */}
            <Link href={home()} className="relative z-20 mb-10 flex flex-col items-center gap-4 group transition-all duration-500 hover:scale-105 active:scale-95">
                <div className="absolute -inset-12 bg-bm-gold/10 blur-[60px] rounded-full opacity-30 group-hover:opacity-70 transition-opacity animate-pulse duration-[4000ms]" />
                <AppLogoIcon className="bm-logo-glow h-24 w-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
            </Link>

            {/* Form card */}
            <div className="relative z-20 w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="bm-glass-premium bm-shadow-premium rounded-3xl p-10 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bm-gold/10 border border-bm-gold/20 text-bm-gold">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold tracking-tight text-bm-white">Confirm Security</h1>
                            <p className="text-sm font-medium text-bm-muted/80 mt-2 leading-relaxed">
                                Please confirm your password to access your security settings.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <Head title="Confirm password" />
                    <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                        {({ processing, errors }) => (
                            <div className="space-y-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-bm-muted/70 ml-1">
                                        Password
                                    </Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bm-muted/40 group-focus-within:text-bm-gold transition-colors z-10">
                                            <Lock className="size-4" />
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="pl-10 h-12 rounded-xl bg-bm-dark/50 border-bm-border/30 text-bm-white placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all"
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 bg-bm-gold hover:bg-bm-gold/90 text-bm-dark font-bold text-sm shadow-lg shadow-bm-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                                    tabIndex={2}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        'Confirm Password'
                                    )}
                                </Button>


                            </div>
                        )}
                    </Form>
                </div>
            </div>
        </div>
    );
}

