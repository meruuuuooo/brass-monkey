// Components
import { Form, Head } from '@inertiajs/react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Forgot your password?"
            description="No worries, we'll send you reset instructions."
        >
            <Head title="Forgot password" />

            {status && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center text-sm font-medium text-green-400 animate-in fade-in zoom-in duration-300">
                    {status}
                </div>
            )}

            <div className="space-y-8">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <div className="space-y-6 bm-glass-shine">
                            <div className="grid gap-2.5">
                                <Label htmlFor="email" className="bm-label">Email address</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-bm-gold text-bm-muted/50">
                                        <Mail className="size-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        className="pl-10 h-11 bg-bm-dark/50 border-bm-border/30 text-bm-white placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all rounded-lg"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="bm-shimmer-container rounded-lg">
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-bm-gold hover:bg-bm-gold-hover text-bm-dark font-bold text-sm shadow-lg shadow-bm-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-lg relative z-10"
                                    disabled={processing}
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                                </Button>
                                <div className="bm-shimmer-overlay pointer-events-none" />
                            </div>
                        </div>
                    )}
                </Form>

                <div className="text-center pt-2">
                    <TextLink href={login()} className="inline-flex items-center gap-2 text-bm-gold hover:text-bm-gold-hover transition-colors font-bold text-sm">
                        <ArrowLeft className="size-4" />
                        Back to log in
                    </TextLink>
                </div>
            </div>
        </AuthLayout>
    );
}
