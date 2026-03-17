import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Search, UserCheck, UserX, XCircle } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { CreateUserModal } from './partials/create-user-modal';
import { DeleteUserModal } from './partials/delete-user-modal';
import { EditUserModal } from './partials/edit-user-modal';

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
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

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

    function handleEditUser(user: User) {
        setEditUser(user);
        setEditIsActive(user.is_active);
        setEditBypassVerification(false);
    }

    const columns = [
        {
            key: 'name',
            header: 'Name',
            render: (user: User) => <span className="font-medium">{user.name}</span>,
        },
        {
            key: 'email',
            header: 'Email',
            render: (user: User) => <span className="text-muted-foreground">{user.email}</span>,
        },
        {
            key: 'role',
            header: 'Role',
            render: (user: User) => (
                <div className="space-x-1">
                    {user.roles.map((role) => (
                        <Badge
                            key={role.id}
                            variant={roleBadgeVariant[role.name] ?? 'outline'}
                        >
                            {role.name}
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (user: User) =>
                user.is_active ? (
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <UserCheck className="h-4 w-4" />
                        Active
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-red-500">
                        <UserX className="h-4 w-4" />
                        Inactive
                    </span>
                ),
        },
        {
            key: 'verified',
            header: 'Verified',
            render: (user: User) =>
                user.email_verified_at ? (
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Verified
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-red-500">
                        <XCircle className="h-4 w-4" />
                        Unverified
                    </span>
                ),
        },
        {
            key: 'joined',
            header: 'Joined',
            render: (user: User) => (
                <span className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            className: 'text-right',
            render: (user: User) => (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="cursor-pointer"
                    >
                        Edit
                    </Button>
                    {/* hide delete option */}
                    {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteUser(user)}
                        className="cursor-pointer text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button> */}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="space-y-6 p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="User Management"
                        description="Manage system users, roles, and account status"
                    />
                    <CreateUserModal
                        isOpen={createOpen}
                        onOpenChange={setCreateOpen}
                        roles={roles}
                        isActive={createIsActive}
                        onIsActiveChange={setCreateIsActive}
                        bypassVerification={createBypassVerification}
                        onBypassVerificationChange={setCreateBypassVerification}
                        onSuccess={() =>
                            Swal.fire({
                                title: 'User Created',
                                text: 'The user has been successfully created.',
                                icon: 'success',
                                timer: 2000,
                                timerProgressBar: true,
                                showConfirmButton: false,
                            })
                        }
                    />
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
                        <Button type="submit" variant="secondary" className="cursor-pointer">
                            Search
                        </Button>
                    </form>

                    <Select
                        value={filters.role ?? 'all'}
                        onValueChange={(v) =>
                            applyFilters({ role: v === 'all' ? undefined : v })
                        }

                    >
                        <SelectTrigger className="w-full sm:w-40 cursor-pointer">
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            {roles.map((role) => (
                                <SelectItem key={role} value={role} className="cursor-pointer">
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
                        <SelectTrigger className="w-full sm:w-40 cursor-pointer">
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
                <DataTableWithPagination
                    columns={columns}
                    data={users.data}
                    pagination={users}
                    emptyMessage="No users found."
                    onPageChange={(url) => router.get(url)}
                />

                <EditUserModal
                    user={editUser}
                    isOpen={Boolean(editUser)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditUser(null);
                        }
                    }}
                    roles={roles}
                    isActive={editIsActive}
                    onIsActiveChange={setEditIsActive}
                    bypassVerification={editBypassVerification}
                    onBypassVerificationChange={setEditBypassVerification}
                    onSuccess={() =>
                        Swal.fire({
                            title: 'User Updated',
                            text: 'The user has been successfully updated.',
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        })
                    }
                />

                <DeleteUserModal
                    user={deleteUser}
                    isOpen={Boolean(deleteUser)}
                    onOpenChange={(open) => {
                        if (!open) {
                            setDeleteUser(null);
                        }
                    }}
                    onSuccess={() =>
                        Swal.fire({
                            title: 'User Deleted',
                            text: 'The user has been successfully deleted.',
                            icon: 'success',
                            timer: 2000,
                            timerProgressBar: true,
                            showConfirmButton: false,
                        })
                    }
                />
            </div>
        </AppLayout>
    );
}
