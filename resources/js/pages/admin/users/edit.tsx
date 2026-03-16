import { Form, Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Role = { id: number; name: string };

type ActivityLog = {
    id: number;
    event: string;
    description: string;
    ip_address: string | null;
    created_at: string;
};

type UserData = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    email_verified_at: string | null;
    roles: Role[];
};

type Props = {
    user: UserData;
    roles: string[];
    recentActivity: ActivityLog[];
};

const breadcrumbs = (userId: number): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: UserController.index.url() },
    { title: 'Edit User', href: UserController.edit.url({ user: userId }) },
];

const eventBadgeStyle: Record<string, string> = {
    login: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    logout: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950',
    created: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950',
    updated: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950',
    deleted: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
    activated: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950',
    deactivated: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950',
};

export default function EditUser({ user, roles, recentActivity }: Props) {
    const currentRole = user.roles[0]?.name ?? '';

    return (
        <AppLayout breadcrumbs={breadcrumbs(user.id)}>
            <Head title={`Edit ${user.name}`} />

            <div className="mx-auto max-w-2xl space-y-8 p-4 md:p-6">
                <Heading
                    title={`Edit ${user.name}`}
                    description="Update this user's profile, role, and account status"
                />

                {!user.is_active && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            This account is currently <strong>inactive</strong>.
                            The user cannot log in.
                        </AlertDescription>
                    </Alert>
                )}

                <Form
                    {...UserController.update.form({ user: user.id })}
                    options={{ preserveScroll: true }}
                    className="space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={user.name}
                                    autoComplete="name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={user.email}
                                    autoComplete="email"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    New Password{' '}
                                    <span className="text-muted-foreground">
                                        (leave blank to keep current)
                                    </span>
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm New Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Select name="role" defaultValue={currentRole}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="is_active">Account Status</Label>
                                <Select
                                    name="is_active"
                                    defaultValue={user.is_active ? '1' : '0'}
                                >
                                    <SelectTrigger id="is_active">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.is_active} />
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                <Checkbox
                                    id="bypass_email_verification"
                                    name="bypass_email_verification"
                                    value="1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="bypass_email_verification">
                                        Bypass email verification
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Mark this user as verified immediately.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    Save Changes
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={UserController.index.url()}>Cancel</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">
                            Recent Activity
                        </h3>
                        <div className="space-y-2">
                            {recentActivity.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-3 rounded-lg border p-3"
                                >
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${eventBadgeStyle[log.event] ?? 'bg-muted text-muted-foreground'}`}
                                    >
                                        {log.event}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-foreground">
                                            {log.description}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {new Date(
                                                log.created_at,
                                            ).toLocaleString()}{' '}
                                            {log.ip_address && (
                                                <span>· {log.ip_address}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
