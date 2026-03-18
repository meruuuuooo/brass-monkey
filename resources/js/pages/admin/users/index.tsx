import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, CheckCircle2, Search, UserCheck, UserX, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import { DataTableWithPagination } from '@/components/data-table';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

    const columns: ColumnDef<User>[] = useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className="flex justify-center items-center w-8">
                        <Checkbox
                            checked={
                                table.getIsAllPageRowsSelected() ||
                                (table.getIsSomePageRowsSelected() && 'indeterminate')
                            }
                            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                            aria-label="Select all"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center items-center w-8">
                        <Checkbox
                            checked={row.getIsSelected()}
                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                            aria-label="Select row"
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'name',
                header: ({ column }) => {
                    return (
                        <div
                            className="flex items-center space-x-2 cursor-pointer select-none"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            <span>Name</span>
                            <ArrowUpDown className="h-4 w-4" />
                        </div>
                    );
                },
                cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
            },
            {
                accessorKey: 'email',
                header: ({ column }) => {
                    return (
                        <div
                            className="flex items-center space-x-2 cursor-pointer select-none"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            <span>Email</span>
                            <ArrowUpDown className="h-4 w-4" />
                        </div>
                    );
                },
                cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('email')}</span>,
            },
            {
                id: 'role',
                header: 'Role',
                cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <div className="space-x-1 flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                                <Badge
                                    key={role.id}
                                    variant={roleBadgeVariant[role.name] ?? 'outline'}
                                >
                                    {role.name}
                                </Badge>
                            ))}
                        </div>
                    );
                },
            },
            {
                id: 'status',
                accessorFn: (row) => (row.is_active ? 'Active' : 'Inactive'),
                header: ({ column }) => {
                    return (
                        <div
                            className="flex items-center space-x-2 cursor-pointer select-none"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            <span>Status</span>
                            <ArrowUpDown className="h-4 w-4" />
                        </div>
                    );
                },
                cell: ({ row }) =>
                    row.original.is_active ? (
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
                id: 'verified',
                header: 'Verified',
                cell: ({ row }) =>
                    row.original.email_verified_at ? (
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
                accessorKey: 'created_at',
                header: ({ column }) => {
                    return (
                        <div
                            className="flex items-center space-x-2 cursor-pointer select-none"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            <span>Joined</span>
                            <ArrowUpDown className="h-4 w-4" />
                        </div>
                    );
                },
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {new Date(row.original.created_at).toLocaleDateString()}
                    </span>
                ),
            },
            {
                id: 'actions',
                header: () => <div className="text-right">Actions</div>,
                cell: ({ row }) => {
                    const user = row.original;
                    return (
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="cursor-pointer"
                            >
                                Edit
                            </Button>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const renderGridItem = (user: User) => (
        <Card className="h-full flex flex-col transition-all hover:shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-start">
                    <span className="truncate pr-2">{user.name}</span>
                    <div className="flex gap-1 shrink-0">
                        {user.roles.map((role) => (
                            <Badge
                                key={role.id}
                                variant={roleBadgeVariant[role.name] ?? 'outline'}
                                className="text-[10px] px-1.5 py-0 h-5"
                            >
                                {role.name}
                            </Badge>
                        ))}
                    </div>
                </CardTitle>
                <div className="text-sm text-muted-foreground truncate" title={user.email}>
                    {user.email}
                </div>
            </CardHeader>
            <CardContent className="pb-4 flex-1">
                <div className="flex flex-col gap-2 text-sm mt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        {user.is_active ? (
                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                                <UserCheck className="h-3 w-3" /> Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                                <UserX className="h-3 w-3" /> Inactive
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Verified</span>
                        {user.email_verified_at ? (
                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                                <CheckCircle2 className="h-3 w-3" /> Yes
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                                <XCircle className="h-3 w-3" /> No
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-muted-foreground">Joined</span>
                        <span className="text-xs font-medium">
                            {new Date(user.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2 border-t mt-auto">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEditUser(user);
                    }}
                >
                    Edit User
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="space-y-6 mt-0 rounded-sm p-4 md:p-6 m-4 border border-sidebar-border/50 shadow-sm">
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
                    renderGridItem={renderGridItem}
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
