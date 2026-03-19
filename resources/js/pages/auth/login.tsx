import { Form, Head } from '@inertiajs/react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-8 bm-glass-shine"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
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
                                        placeholder="email@example.com"
                                        className="pl-10 h-11 bg-bm-dark/50 border-bm-border/30 text-bm-white placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all rounded-lg"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2.5">
                                <Label htmlFor="password" className="bm-label">Password</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-bm-gold text-bm-muted/50 z-10">
                                        <Lock className="size-4" />
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="pl-10 h-11 bg-bm-dark/50 border-bm-border/30 text-bm-white placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all rounded-lg"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center justify-between py-1">
                                <div className="flex items-center space-x-2.5">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        className="border-bm-border/50 data-[state=checked]:bg-bm-gold data-[state=checked]:border-bm-gold rounded"
                                    />
                                    <Label htmlFor="remember" className="bm-label text-xs cursor-pointer select-none">
                                        Keep me logged in
                                    </Label>
                                </div>

                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs text-bm-gold/80 hover:text-bm-gold transition-colors font-semibold"
                                        tabIndex={5}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>

                            <div className="bm-shimmer-container rounded-lg">
                                <Button
                                    type="submit"
                                    className="mt-2 w-full h-11 bg-bm-gold hover:bg-bm-gold-hover text-bm-dark font-bold text-sm shadow-lg shadow-bm-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-lg relative z-10"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : 'Sign In to Brassmonkey'}
                                </Button>
                                <div className="bm-shimmer-overlay pointer-events-none" />
                            </div>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-bm-muted/80 font-medium pt-2">
                                New to Brassmonkey?{' '}
                                <TextLink href={register()} tabIndex={5} className="text-bm-gold hover:text-bm-gold-hover decoration-bm-gold/30 hover:decoration-bm-gold transition-all font-bold">
                                    Create an account
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center text-sm font-medium text-green-400">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
