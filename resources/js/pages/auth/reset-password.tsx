import { Form, Head } from '@inertiajs/react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <AuthLayout
            title="Set new password"
            description="Secure your account with a new password"
        >
            <Head title="Reset password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-8"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6 bm-glass-shine">
                        <div className="grid gap-2.5">
                            <Label htmlFor="email" className="bm-label opacity-70">Email address</Label>
                            <div className="relative group grayscale opacity-50">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bm-muted/50">
                                    <Mail className="size-4" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={email}
                                    readOnly
                                    autoComplete="username"
                                    className="pl-10 h-11 bg-bm-dark/30 border-bm-border/10 text-bm-muted cursor-not-allowed rounded-lg"
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        <div className="grid gap-2.5">
                            <Label htmlFor="password" title="Password" className="bm-label">New Password</Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-bm-gold text-bm-muted/50 z-10">
                                    <Lock className="size-4" />
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoFocus
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 bg-bm-dark/50 border-bm-border/30 text-bm-white placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all rounded-lg"
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="grid gap-2.5">
                            <Label htmlFor="password_confirmation" title="Confirm Password" className="bm-label">
                                Confirm New Password
                            </Label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-bm-gold text-bm-muted/50 z-10">
                                    <Lock className="size-4" />
                                </div>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    className="pl-10 h-11 bg-bm-dark/50 border-bm-border/30 text-bm-white placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all rounded-lg"
                                />
                            </div>
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        <div className="bm-shimmer-container rounded-lg">
                            <Button
                                type="submit"
                                className="mt-2 w-full h-11 bg-bm-gold hover:bg-bm-gold-hover text-bm-dark font-bold text-sm shadow-lg shadow-bm-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-lg relative z-10"
                                disabled={processing}
                            >
                                {processing ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                            </Button>
                            <div className="bm-shimmer-overlay pointer-events-none" />
                        </div>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
