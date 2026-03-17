import { Form } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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

type CreateUserModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    roles: string[];
    isActive: boolean;
    onIsActiveChange: (active: boolean) => void;
    bypassVerification: boolean;
    onBypassVerificationChange: (bypass: boolean) => void;
    onSuccess?: () => void;
};

export function CreateUserModal({
    isOpen,
    onOpenChange,
    roles,
    isActive,
    onIsActiveChange,
    bypassVerification,
    onBypassVerificationChange,
    onSuccess,
}: CreateUserModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">
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
                        onSuccess?.();
                        setTimeout(() => {
                            onOpenChange(false);
                            onIsActiveChange(true);
                            onBypassVerificationChange(false);
                        }, 300);
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
                                    checked={isActive}
                                    onCheckedChange={(checked) =>
                                        onIsActiveChange(Boolean(checked))
                                    }
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="create-is-active">
                                        Account is active
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Active users can sign in.
                                    </p>
                                </div>
                                <input
                                    type="hidden"
                                    name="is_active"
                                    value={isActive ? '1' : '0'}
                                />
                            </div>

                            <div className="flex items-center gap-3 rounded-lg border p-3">
                                <Checkbox
                                    id="create-bypass-email-verification"
                                    checked={bypassVerification}
                                    onCheckedChange={(checked) =>
                                        onBypassVerificationChange(Boolean(checked))
                                    }
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
                                    Create User
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
