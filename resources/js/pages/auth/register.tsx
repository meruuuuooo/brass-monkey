import { Form, Head } from '@inertiajs/react';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Create your account"
            description="Join Brassmonkey and elevate your experience"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5 bm-glass-shine"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name" className="bm-label text-xs">Name</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-bm-gold text-bm-muted/50">
                                        <User className="size-3.5" />
                                    </div>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Full name"
                                        className="pl-10 h-10 bg-bm-dark/50 border-bm-border/30 text-bm-white text-sm placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all rounded-lg"
                                    />
                                </div>
                                <InputError
                                    message={errors.name}
                                    className="mt-0.5"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="bm-label text-xs">Email address</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-bm-gold text-bm-muted/50">
                                        <Mail className="size-3.5" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="email@example.com"
                                        className="pl-10 h-10 bg-bm-dark/50 border-bm-border/30 text-bm-white text-sm placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all rounded-lg"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-0.5" />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password" className="bm-label text-xs">Password</Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-bm-gold text-bm-muted/50 z-10">
                                        <Lock className="size-3.5" />
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-10 bg-bm-dark/50 border-bm-border/30 text-bm-white text-sm placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all font-medium rounded-lg"
                                    />
                                </div>
                                <InputError message={errors.password} className="mt-0.5" />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation" className="bm-label text-xs">
                                    Confirm password
                                </Label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-bm-gold text-bm-muted/50 z-10">
                                        <Lock className="size-3.5" />
                                    </div>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="••••••••"
                                        className="pl-10 h-10 bg-bm-dark/50 border-bm-border/30 text-bm-white text-sm placeholder:text-bm-muted/30 focus-visible:ring-bm-gold/30 hover:border-bm-gold/50 transition-all font-medium rounded-lg"
                                    />
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-0.5"
                                />
                            </div>

                            <div className="bm-shimmer-container rounded-lg mt-2">
                                <Button
                                    type="submit"
                                    className="w-full h-10 bg-bm-gold hover:bg-bm-gold-hover text-bm-dark font-bold text-sm shadow-lg shadow-bm-gold/20 transition-all hover:scale-[1.01] active:scale-[0.99] rounded-lg relative z-10"
                                    tabIndex={5}
                                    data-test="register-user-button"
                                >
                                    {processing ? <Loader2 className="size-4 animate-spin" /> : 'Create Account'}
                                </Button>
                                <div className="bm-shimmer-overlay pointer-events-none" />
                            </div>
                        </div>

                        <div className="text-center text-xs text-bm-muted/80 font-medium pt-1">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6} className="text-bm-gold hover:text-bm-gold-hover transition-colors font-bold">
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
