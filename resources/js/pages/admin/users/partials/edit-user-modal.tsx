import { Form } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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

type EditUserModalProps = {
    user: User | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    roles: string[];
    isActive: boolean;
    onIsActiveChange: (active: boolean) => void;
    bypassVerification: boolean;
    onBypassVerificationChange: (bypass: boolean) => void;
    onSuccess?: () => void;
};

export function EditUserModal({
    user,
    isOpen,
    onOpenChange,
    roles,
    isActive,
    onIsActiveChange,
    bypassVerification,
    onBypassVerificationChange,
    onSuccess,
}: EditUserModalProps) {
    const editingRole = user?.roles[0]?.name ?? '';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user details, role, and account status.
                    </DialogDescription>
                </DialogHeader>


                {user && (
                    <Form
                        key={user.id}
                        {...UserController.update.form({ user: user.id })}
                        className="space-y-4"
                        onSuccess={() => {
                            onSuccess?.();
                            setTimeout(() => onOpenChange(false), 300);
                        }}
                    >
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Full Name</Label>
                                    <Input
                                        id="edit-name"
                                        name="name"
                                        defaultValue={user.name}
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
                                        defaultValue={user.email}
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
                                        checked={isActive}
                                        onCheckedChange={(checked) =>
                                            onIsActiveChange(Boolean(checked))
                                        }
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor="edit-is-active">
                                            Account is active
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Inactive users cannot sign in.
                                        </p>
                                    </div>
                                    <input
                                        type="hidden"
                                        name="is_active"
                                        value={isActive ? '1' : '0'}
                                    />
                                </div>
                                <InputError message={errors.is_active} />

                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                    <Checkbox
                                        id="edit-bypass-email-verification"
                                        checked={bypassVerification}
                                        onCheckedChange={(checked) =>
                                            onBypassVerificationChange(Boolean(checked))
                                        }
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
                                        value={bypassVerification ? '1' : '0'}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => onOpenChange(false)}
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
    );
}
