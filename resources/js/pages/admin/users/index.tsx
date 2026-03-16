import { Form, Head, router } from '@inertiajs/react';
import { CheckCircle2, Plus, Search, UserCheck, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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

type Role = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    email_verified_at: string | null;
    created_at: string;
    roles: Role[];
};

type PaginatedUsers = {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    users: PaginatedUsers;
    filters: { search?: string; role?: string; active?: string };
    roles: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: UserController.index.url() },
];

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    Admin: 'default',
    Manager: 'secondary',
    Client: 'outline',
};

export default function UsersIndex({ users, filters, roles }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [createOpen, setCreateOpen] = useState(false);
    const [createIsActive, setCreateIsActive] = useState(true);
    const [createBypassVerification, setCreateBypassVerification] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editIsActive, setEditIsActive] = useState(true);
    const [editBypassVerification, setEditBypassVerification] = useState(false);

    const editingRole = editUser?.roles[0]?.name ?? '';

    function applyFilters(overrides: Record<string, string | undefined>) {
        router.get(
            UserController.index.url(),
            { search: search || undefined, ...filters, ...overrides },
            { preserveState: true, replace: true },
        );
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilters({ search: search || undefined });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="User Management"
                        description="Manage system users, roles, and account status"
                    />
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Create User</DialogTitle>
                                <DialogDescription>
                                    Add a new user and assign a role.
                                </DialogDescription>
                            </DialogHeader>

                            <Form
                                {...UserController.store.form()}
                                className="space-y-4"
                                onSuccess={() => {
                                    setCreateOpen(false);
                                    setCreateIsActive(true);
                                    setCreateBypassVerification(false);
                                }}
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="create-name">Full Name</Label>
                                            <Input
                                                id="create-name"
                                                name="name"
                                                autoComplete="name"
                                                autoFocus
                                                placeholder="Jane Doe"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="create-email">Email Address</Label>
                                            <Input
                                                id="create-email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="jane@example.com"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="create-password">Password</Label>
                                            <PasswordInput
                                                id="create-password"
                                                name="password"
                                                autoComplete="new-password"
                                                placeholder="Enter a strong password"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="create-password-confirmation">
                                                Confirm Password
                                            </Label>
                                            <PasswordInput
                                                id="create-password-confirmation"
                                                name="password_confirmation"
                                                autoComplete="new-password"
                                                placeholder="Repeat the password"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="create-role">Role</Label>
                                            <Select name="role" defaultValue="">
                                                <SelectTrigger id="create-role">
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

                                        <div className="flex items-center gap-3 rounded-lg border p-3">
                                            <Checkbox
                                                id="create-is-active"
                                                checked={createIsActive}
                                                onCheckedChange={(checked) => setCreateIsActive(Boolean(checked))}
                                            />
                                            <div className="space-y-1">
                                                <Label htmlFor="create-is-active">Account is active</Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Active users can sign in.
                                                </p>
                                            </div>
                                            <input
                                                type="hidden"
                                                name="is_active"
                                                value={createIsActive ? '1' : '0'}
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 rounded-lg border p-3">
                                            <Checkbox
                                                id="create-bypass-email-verification"
                                                checked={createBypassVerification}
                                                onCheckedChange={(checked) => setCreateBypassVerification(Boolean(checked))}
                                            />
                                            <div className="space-y-1">
                                                <Label htmlFor="create-bypass-email-verification">
                                                    Bypass email verification
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Mark this user as verified immediately.
                                                </p>
                                            </div>
                                            <input
                                                type="hidden"
                                                name="bypass_email_verification"
                                                value={createBypassVerification ? '1' : '0'}
                                            />
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setCreateOpen(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                Create User
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search by name or email…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Search
                        </Button>
                    </form>

                    <Select
                        value={filters.role ?? 'all'}
                        onValueChange={(v) =>
                            applyFilters({ role: v === 'all' ? undefined : v })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.active ?? 'all'}
                        onValueChange={(v) =>
                            applyFilters({ active: v === 'all' ? undefined : v })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-xl border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Verified
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium">
                                        Joined
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-10 text-center text-muted-foreground"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {user.name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.roles.map((role) => (
                                                    <Badge
                                                        key={role.id}
                                                        variant={roleBadgeVariant[role.name] ?? 'outline'}
                                                    >
                                                        {role.name}
                                                    </Badge>
                                                ))}
                                            </td>
                                            <td className="px-4 py-3">
                                                {user.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                                        <UserCheck className="h-4 w-4" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-500">
                                                        <UserX className="h-4 w-4" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {user.email_verified_at ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-500">
                                                        <XCircle className="h-4 w-4" />
                                                        Unverified
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditUser(user);
                                                        setEditIsActive(user.is_active);
                                                        setEditBypassVerification(false);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Showing {users.data.length} of {users.total} users
                        </span>
                        <div className="flex gap-1">
                            {users.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <Dialog
                    open={Boolean(editUser)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditUser(null);
                        }
                    }}
                >
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>
                                Update user details, role, and account status.
                            </DialogDescription>
                        </DialogHeader>

                        {editUser && (
                            <Form
                                key={editUser.id}
                                {...UserController.update.form({ user: editUser.id })}
                                className="space-y-4"
                                onSuccess={() => setEditUser(null)}
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-name">Full Name</Label>
                                            <Input
                                                id="edit-name"
                                                name="name"
                                                defaultValue={editUser.name}
                                                autoComplete="name"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-email">Email Address</Label>
                                            <Input
                                                id="edit-email"
                                                name="email"
                                                type="email"
                                                defaultValue={editUser.email}
                                                autoComplete="email"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-password">
                                                New Password
                                            </Label>
                                            <PasswordInput
                                                id="edit-password"
                                                name="password"
                                                autoComplete="new-password"
                                                placeholder="Leave blank to keep current password"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-password-confirmation">
                                                Confirm New Password
                                            </Label>
                                            <PasswordInput
                                                id="edit-password-confirmation"
                                                name="password_confirmation"
                                                autoComplete="new-password"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-role">Role</Label>
                                            <Select
                                                name="role"
                                                defaultValue={editingRole}
                                            >
                                                <SelectTrigger id="edit-role">
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

                                        <div className="flex items-center gap-3 rounded-lg border p-3">
                                            <Checkbox
                                                id="edit-is-active"
                                                checked={editIsActive}
                                                onCheckedChange={(checked) => setEditIsActive(Boolean(checked))}
                                            />
                                            <div className="space-y-1">
                                                <Label htmlFor="edit-is-active">Account is active</Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Inactive users cannot sign in.
                                                </p>
                                            </div>
                                            <input
                                                type="hidden"
                                                name="is_active"
                                                value={editIsActive ? '1' : '0'}
                                            />
                                        </div>
                                        <InputError message={errors.is_active} />

                                        <div className="flex items-center gap-3 rounded-lg border p-3">
                                            <Checkbox
                                                id="edit-bypass-email-verification"
                                                checked={editBypassVerification}
                                                onCheckedChange={(checked) => setEditBypassVerification(Boolean(checked))}
                                            />
                                            <div className="space-y-1">
                                                <Label htmlFor="edit-bypass-email-verification">
                                                    Bypass email verification
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Mark this user as verified immediately.
                                                </p>
                                            </div>
                                            <input
                                                type="hidden"
                                                name="bypass_email_verification"
                                                value={editBypassVerification ? '1' : '0'}
                                            />
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setEditUser(null)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                Save Changes
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
