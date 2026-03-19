import { Form, Head, Link, usePage } from '@inertiajs/react'; // Add Link and usePage
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import { Mail, Loader2, ShieldCheck, Clock, Shield, KeyRound, RefreshCcw } from 'lucide-react'; // Add Shield, KeyRound, RefreshCcw
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';

type Props = {
    emailHint?: string;
};

export default function TwoFactorChallenge({ emailHint }: Props) {
    const [code, setCode] = useState<string>('');
    const [recovery, setRecovery] = useState<boolean>(false); // Define recovery state

    return (
        <AuthLayout
            title="Verify identity"
            description={
                emailHint
                    ? `We've sent a 6-digit code to ${emailHint}`
                    : "We've sent a verification code to your email."
            }
        >
            <Head title="Two-factor authentication" />

            <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[500px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center gap-6 text-center">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-bm-gold/20 blur-2xl rounded-full animate-pulse" />
                        <div className="relative size-20 bg-bm-dark/40 rounded-3xl border border-bm-gold/20 flex items-center justify-center bm-logo-glow">
                            {recovery ? (
                                <KeyRound className="size-10 text-bm-gold" />
                            ) : (
                                <Shield className="size-10 text-bm-gold" />
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-serif font-bold text-bm-white">Two-factor confirmation</h1>
                        <p className="max-w-[350px] text-bm-muted/80 font-medium">
                            {recovery
                                ? 'Please confirm access to your account by entering one of your emergency recovery codes.'
                                : 'Please confirm access to your account by entering the authentication code provided by your authenticator application.'}
                        </p>
                    </div>
                </div>

                <div className="bm-glass-premium bm-shadow-premium bm-glass-shine rounded-3xl p-8 space-y-8">
                    <div className="relative px-2">
                        <Form
                            {...store.form()} // Use store.form() instead of challenge.form()
                            className="space-y-6"
                            resetOnError
                            resetOnSuccess
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="flex justify-center">
                                        <InputOTP
                                            maxLength={OTP_MAX_LENGTH}
                                            name={recovery ? 'recovery_code' : 'code'}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={recovery ? undefined : REGEXP_ONLY_DIGITS}
                                            autoFocus
                                            containerClassName="group flex items-center gap-3"
                                        >
                                            <InputOTPGroup className="gap-2.5">
                                                {Array.from({ length: recovery ? 8 : OTP_MAX_LENGTH }).map(
                                                    (_, index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                            className="size-12 rounded-lg border-bm-border/30 bg-bm-dark/50 text-bm-white text-lg font-bold data-[active=true]:border-bm-gold data-[active=true]:ring-bm-gold/20 transition-all border leading-none shadow-inner"
                                                        />
                                                    ),
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError message={recovery ? errors.recovery_code : errors.code} />

                                    <div className="bm-shimmer-container rounded-lg">
                                        <Button
                                            type="submit"
                                            className="w-full h-11 bg-bm-gold hover:bg-bm-gold-hover text-bm-dark font-bold text-sm shadow-lg shadow-bm-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-lg relative z-10"
                                            disabled={processing || code.length < 6}
                                        >
                                            {processing ? (
                                                <Loader2 className="animate-spin" />
                                            ) : (
                                                'Verify Access'
                                            )}
                                        </Button>
                                        <div className="bm-shimmer-overlay pointer-events-none" />
                                    </div>

                                    <div className="flex justify-center pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRecovery(!recovery);
                                                setCode('');
                                            }}
                                            className="inline-flex items-center gap-2 text-xs font-semibold text-bm-gold/70 hover:text-bm-gold transition-colors"
                                        >
                                            <RefreshCcw className="size-3" />
                                            {recovery ? 'Use an authentication code' : 'Use a recovery code'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
