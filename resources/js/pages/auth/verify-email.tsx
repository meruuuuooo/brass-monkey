// Components
import { Form, Head } from '@inertiajs/react';
import { Mail, Loader2, LogOut } from 'lucide-react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verify your email"
            description="We've sent a magic link to your inbox. Please click it to verify your account."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center text-sm font-medium text-green-400 animate-in fade-in zoom-in duration-300">
                    A new verification link has been sent to your email address.
                </div>
            )}

            <div className="space-y-8">
                <Form {...send.form()} className="space-y-6 text-center">
                    {({ processing }) => (
                        <div className="flex flex-col gap-6 items-center bm-glass-shine">
                            <div className="bm-shimmer-container rounded-lg w-full">
                                <Button
                                    disabled={processing}
                                    className="w-full h-11 bg-bm-gold hover:bg-bm-gold-hover text-bm-dark font-bold text-sm shadow-lg shadow-bm-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-lg relative z-10"
                                >
                                    {processing ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        'Resend Verification Email'
                                    )}
                                </Button>
                                <div className="bm-shimmer-overlay pointer-events-none" />
                            </div>

                            <TextLink
                                href={logout()}
                                className="inline-flex items-center gap-2 text-bm-muted hover:text-bm-gold transition-colors font-medium text-sm"
                            >
                                <LogOut className="size-4" />
                                Log out
                            </TextLink>
                        </div>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}
