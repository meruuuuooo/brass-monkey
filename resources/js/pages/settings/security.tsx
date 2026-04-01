import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { Mail, ShieldCheck, ShieldOff, Key, Shield, Save } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';
import type { BreadcrumbItem } from '@/types';

type Props = {
    canManageTwoFactor?: boolean;
    twoFactorEnabled?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Security settings',
        href: edit(),
    },
];

export default function Security({
    canManageTwoFactor = false,
    twoFactorEnabled = false,
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <SettingsLayout>
                <Card className="w-full border-border/50 shadow-sm overflow-hidden rounded-3xl">
                    <div className="p-6 md:p-8 bg-muted/10 border-b border-border/40 flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted/40 border border-border/50 text-foreground">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Update Password</h2>
                            <p className="text-sm font-medium text-muted-foreground mt-1">Ensure your account is using a long, random password to stay secure.</p>
                        </div>
                    </div>

                    <CardContent className="p-6 md:p-8">
                        <Form
                            {...SecurityController.update.form()}
                            options={{ preserveScroll: true }}
                            resetOnError={['password', 'password_confirmation', 'current_password']}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
passwordInput.current?.focus();
}

                                if (errors.current_password) {
currentPasswordInput.current?.focus();
}
                            }}
                            className="space-y-8 max-w-2xl"
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <>
                                    <div className="grid gap-3 group">
                                        <Label htmlFor="current_password" className="text-xs font-black tracking-widest text-muted-foreground uppercase ml-1">
                                            Current Password
                                        </Label>
                                        <PasswordInput
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            className="h-12 rounded-xl border-border/60 bg-muted/5 focus:bg-background transition-all"
                                            autoComplete="current-password"
                                            placeholder="Enter your current password"
                                        />
                                        <InputError className="ml-1" message={errors.current_password} />
                                    </div>

                                    <div className="grid gap-3 group">
                                        <Label htmlFor="password" className="text-xs font-black tracking-widest text-muted-foreground uppercase ml-1">
                                            New Password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            className="h-12 rounded-xl border-border/60 bg-muted/5 focus:bg-background transition-all"
                                            autoComplete="new-password"
                                            placeholder="Enter your new password"
                                        />
                                        <InputError className="ml-1" message={errors.password} />
                                    </div>

                                    <div className="grid gap-3 group">
                                        <Label htmlFor="password_confirmation" className="text-xs font-black tracking-widest text-muted-foreground uppercase ml-1">
                                            Confirm Password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            className="h-12 rounded-xl border-border/60 bg-muted/5 focus:bg-background transition-all"
                                            autoComplete="new-password"
                                            placeholder="Confirm your new password"
                                        />
                                        <InputError className="ml-1" message={errors.password_confirmation} />
                                    </div>

                                    <div className="flex items-center gap-5 pt-4 border-t border-border/40">
                                        <Button
                                            disabled={processing}
                                            data-test="update-password-button"
                                            className="h-11 px-8 rounded-xl font-bold bg-bm-gold text-black hover:bg-bm-gold/90 shadow-lg shadow-bm-gold/20"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Password
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-out duration-300"
                                            enterFrom="opacity-0 translate-y-1"
                                            enterTo="opacity-100 translate-y-0"
                                            leave="transition ease-in duration-200"
                                            leaveFrom="opacity-100 translate-y-0"
                                            leaveTo="opacity-0 translate-y-1"
                                        >
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                                Password Updated
                                            </p>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                {canManageTwoFactor && (
                    <Card className="border-border/50 shadow-sm overflow-hidden rounded-3xl mt-6">
                        <div className="p-6 md:p-8 bg-muted/10 border-b border-border/40 flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted/40 border border-border/50 text-foreground">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Two-Factor Authentication</h2>
                                <p className="text-sm font-medium text-muted-foreground mt-1">Add an extra layer of security to your account.</p>
                            </div>
                        </div>

                        <CardContent className="p-6 md:p-8">
                            {twoFactorEnabled ? (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/40">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-800 dark:text-emerald-300 tracking-tight">Two-factor authentication is enabled</p>
                                            <p className="text-sm font-medium text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">A 6-digit code will be sent to your email address each time you log in.</p>
                                        </div>
                                    </div>

                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                                disabled={processing}
                                                className="h-11 px-6 rounded-xl font-bold"
                                            >
                                                <ShieldOff className="mr-2 h-4 w-4" />
                                                Disable 2FA
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            ) : (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-muted/30 px-5 py-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted border border-border text-muted-foreground">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                                            When enabled, a 6-digit code will be sent to your email address each time you log in to verify your identity.
                                        </p>
                                    </div>

                                    <Form {...enable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="h-11 px-6 rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90"
                                            >
                                                <ShieldCheck className="mr-2 h-4 w-4" />
                                                Enable 2FA
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </SettingsLayout>
        </AppLayout>
    );
}
