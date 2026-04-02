import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import { Mail, ShieldCheck, ShieldOff, Key, Shield, Save } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
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
    const { auth } = usePage().props;
    const isClient = auth.roles?.includes('Client') ?? false;
    const LayoutComponent = isClient ? AppHeaderLayout : AppLayout;
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <LayoutComponent {...(!isClient && { breadcrumbs })}>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <SettingsLayout>
                <Card className="w-full overflow-hidden rounded-3xl border-border/50 shadow-sm">
                    <div className="flex items-center gap-4 border-b border-border/40 bg-muted/10 p-6 md:p-8">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-muted/40 text-foreground">
                            <Key className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-foreground md:text-2xl">
                                Update Password
                            </h2>
                            <p className="mt-1 text-sm font-medium text-muted-foreground">
                                Ensure your account is using a long, random
                                password to stay secure.
                            </p>
                        </div>
                    </div>

                    <CardContent className="p-6 md:p-8">
                        <Form
                            {...SecurityController.update.form()}
                            options={{ preserveScroll: true }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }

                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="max-w-2xl space-y-8"
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <>
                                    <div className="group grid gap-3">
                                        <Label
                                            htmlFor="current_password"
                                            className="ml-1 text-xs font-black tracking-widest text-muted-foreground uppercase"
                                        >
                                            Current Password
                                        </Label>
                                        <PasswordInput
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            className="h-12 rounded-xl border-border/60 bg-muted/5 transition-all focus:bg-background"
                                            autoComplete="current-password"
                                            placeholder="Enter your current password"
                                        />
                                        <InputError
                                            className="ml-1"
                                            message={errors.current_password}
                                        />
                                    </div>

                                    <div className="group grid gap-3">
                                        <Label
                                            htmlFor="password"
                                            className="ml-1 text-xs font-black tracking-widest text-muted-foreground uppercase"
                                        >
                                            New Password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            className="h-12 rounded-xl border-border/60 bg-muted/5 transition-all focus:bg-background"
                                            autoComplete="new-password"
                                            placeholder="Enter your new password"
                                        />
                                        <InputError
                                            className="ml-1"
                                            message={errors.password}
                                        />
                                    </div>

                                    <div className="group grid gap-3">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="ml-1 text-xs font-black tracking-widest text-muted-foreground uppercase"
                                        >
                                            Confirm Password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            className="h-12 rounded-xl border-border/60 bg-muted/5 transition-all focus:bg-background"
                                            autoComplete="new-password"
                                            placeholder="Confirm your new password"
                                        />
                                        <InputError
                                            className="ml-1"
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center gap-5 border-t border-border/40 pt-4">
                                        <Button
                                            disabled={processing}
                                            data-test="update-password-button"
                                            className="h-11 rounded-xl bg-bm-gold px-8 font-bold text-black shadow-lg shadow-bm-gold/20 hover:bg-bm-gold/90"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
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
                                            <p className="flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                <span className="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
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
                    <Card className="mt-6 overflow-hidden rounded-3xl border-border/50 shadow-sm">
                        <div className="flex items-center gap-4 border-b border-border/40 bg-muted/10 p-6 md:p-8">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-muted/40 text-foreground">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight text-foreground md:text-2xl">
                                    Two-Factor Authentication
                                </h2>
                                <p className="mt-1 text-sm font-medium text-muted-foreground">
                                    Add an extra layer of security to your
                                    account.
                                </p>
                            </div>
                        </div>

                        <CardContent className="p-6 md:p-8">
                            {twoFactorEnabled ? (
                                <div className="max-w-2xl space-y-6">
                                    <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/40">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold tracking-tight text-emerald-800 dark:text-emerald-300">
                                                Two-factor authentication is
                                                enabled
                                            </p>
                                            <p className="mt-0.5 text-sm font-medium text-emerald-700/80 dark:text-emerald-400/80">
                                                A 6-digit code will be sent to
                                                your email address each time you
                                                log in.
                                            </p>
                                        </div>
                                    </div>

                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                                disabled={processing}
                                                className="h-11 rounded-xl px-6 font-bold"
                                            >
                                                <ShieldOff className="mr-2 h-4 w-4" />
                                                Disable 2FA
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            ) : (
                                <div className="max-w-2xl space-y-6">
                                    <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-muted/30 px-5 py-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm leading-relaxed font-medium text-foreground/80">
                                            When enabled, a 6-digit code will be
                                            sent to your email address each time
                                            you log in to verify your identity.
                                        </p>
                                    </div>

                                    <Form {...enable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="h-11 rounded-xl bg-foreground px-6 font-bold text-background hover:bg-foreground/90"
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
        </LayoutComponent>
    );
}
