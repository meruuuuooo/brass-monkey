import { Form } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type User = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    email_verified_at: string | null;
    created_at: string;
    roles: { id: number; name: string }[];
};

type DeleteUserModalProps = {
    user: User | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

export function DeleteUserModal({ user, isOpen, onOpenChange, onSuccess }: DeleteUserModalProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <span className="font-semibold">{user?.name}</span>?
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {user && (
                    <Form
                        method="delete"
                        action={UserController.destroy.url({ user: user.id })}
                        onSuccess={() => {
                            onSuccess?.();
                            setTimeout(() => onOpenChange(false), 300);
                        }}
                    >
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    className="cursor-pointer"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </Form>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );
}
