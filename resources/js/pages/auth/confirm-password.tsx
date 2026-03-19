import { Form, Head } from '@inertiajs/react';
import { Lock, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <AuthLayout
            title="Confirm security"
            description="Please confirm your password to proceed."
        >
            <Head title="Confirm password" />

            <Form {...store.form()} resetOnSuccess={['password']} className="flex flex-col gap-8">
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-6 bm-glass-shine">
                            <div className="grid gap-2.5">
                                <Label htmlFor="password" title="Password" className="bm-label">Password</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-bm-gold text-bm-muted/50 z-10">
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
                                        className="pl-10 h-11 bg-bm-dark/50 border-bm-border/30 text-bm-white placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all rounded-lg"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="bm-shimmer-container rounded-lg">
                                <Button
                                    type="submit"
                                    className="mt-2 w-full h-11 bg-bm-gold hover:bg-bm-gold-hover text-bm-dark font-bold text-sm shadow-lg shadow-bm-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-lg relative z-10"
                                    tabIndex={2}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        'Confirm Password'
                                    )}
                                </Button>
                                <div className="bm-shimmer-overlay pointer-events-none" />
                            </div>
                        </div>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
