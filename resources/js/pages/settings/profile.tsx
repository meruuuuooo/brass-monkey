import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { User, Mail, Save, UserCircle, Camera } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
// import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit(),
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const isClient = auth.roles?.includes('Client') ?? false;
    const LayoutComponent = isClient ? AppHeaderLayout : AppLayout;
    const getInitials = useInitials();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <LayoutComponent {...(!isClient && { breadcrumbs })}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <SettingsLayout>
                <Card className="w-full border-border/50 shadow-sm overflow-hidden rounded-3xl">
                    <div className="p-6 md:p-8 bg-muted/10 border-b border-border/40 flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted/40 border border-border/50 text-foreground">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Profile Information</h2>
                            <p className="text-sm font-medium text-muted-foreground mt-1">Update your account's profile information and email address.</p>
                        </div>
                    </div>

                    <CardContent className="p-6 md:p-8">
                        <Form
                            {...ProfileController.update.form()}
                            options={{ preserveScroll: true }}
                            className="space-y-8 max-w-2xl"
                        >
                            {({ processing, recentlySuccessful, errors }) => (
                                <>
                                    <div className="flex flex-col gap-6 md:flex-row md:items-center pb-6 mb-2 border-b border-border/40">
                                        <div className="relative group">
                                            <Avatar className="h-24 w-24 border-2 border-border/50 shadow-inner">
                                                <AvatarImage src={previewUrl || (auth.user.avatar as string)} className="object-cover" />
                                                <AvatarFallback className="text-2xl font-black bg-bm-gold/10 text-bm-gold">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <label
                                                htmlFor="avatar-upload"
                                                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]"
                                            >
                                                <Camera className="w-8 h-8" />
                                            </label>
                                            <input
                                                id="avatar-upload"
                                                name="avatar"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-foreground">Profile Image</h3>
                                            <p className="text-sm font-medium text-muted-foreground">Click the image to select a new one. <br />Recommended: Square, JPG or PNG. Max 2MB.</p>
                                            <InputError className="mt-2" message={errors.avatar} />
                                        </div>
                                    </div>
                                    <div className="grid gap-3 group">
                                        <Label htmlFor="name" className="text-xs font-black tracking-widest text-muted-foreground uppercase ml-1">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 transition-colors group-focus-within:text-bm-gold" />
                                            <Input
                                                id="name"
                                                className="pl-11 h-12 rounded-xl border-border/60 bg-muted/5 focus:bg-background transition-all"
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <InputError className="ml-1" message={errors.name} />
                                    </div>

                                    <div className="grid gap-3 group">
                                        <Label htmlFor="email" className="text-xs font-black tracking-widest text-muted-foreground uppercase ml-1">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 transition-colors group-focus-within:text-bm-gold" />
                                            <Input
                                                id="email"
                                                type="email"
                                                className="pl-11 h-12 rounded-xl border-border/60 bg-muted/5 focus:bg-background transition-all"
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                        <InputError className="ml-1" message={errors.email} />
                                    </div>

                                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                                            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                                                Your email address is unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="font-bold underline decoration-amber-300 underline-offset-4 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                                                >
                                                    Click here to resend the verification email.
                                                </Link>
                                            </p>
                                            {status === 'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                    A new verification link has been sent to your email address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-5 pt-4 border-t border-border/40">
                                        <Button
                                            disabled={processing}
                                            data-test="update-profile-button"
                                            className="h-11 px-8 rounded-xl font-bold bg-bm-gold text-black hover:bg-bm-gold/90 shadow-lg shadow-bm-gold/20"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
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
                                                Preferences Saved
                                            </p>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                {/* <DeleteUser /> */}
            </SettingsLayout>
        </LayoutComponent>
    );
}
