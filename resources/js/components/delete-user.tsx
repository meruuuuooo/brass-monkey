import { Form } from '@inertiajs/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <Card className="border-rose-500/20 shadow-sm overflow-hidden rounded-3xl group mt-6">
            <div className="p-6 md:p-8 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors border-b border-rose-500/10 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-600">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-rose-600">Delete Account</h2>
                    <p className="text-sm font-medium text-rose-600/80 mt-1">Permanently remove your account and all of its resources.</p>
                </div>
            </div>

            <CardContent className="p-6 md:p-8 space-y-8">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/50 dark:bg-rose-900/20 shadow-sm">
                    <div className="flex flex-col gap-1 text-rose-600 dark:text-rose-400">
                        <p className="font-bold tracking-tight uppercase text-xs">Warning: This action is irreversible</p>
                        <p className="text-sm font-medium opacity-90 leading-relaxed">
                            Once your account is deleted, all of its resources and data will be permanently wiped. Before deleting your account, please download any data or information that you wish to retain.
                        </p>
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                            className="h-11 px-6 rounded-xl font-bold shadow-lg shadow-rose-900/20 
                                     hover:shadow-rose-900/40 transition-all"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md rounded-3xl border-rose-500/20 bg-background overflow-hidden p-0">
                        <div className="flex flex-col">
                            <div className="p-6 md:p-8 pb-6 border-b border-rose-500/10 bg-rose-500/5">
                                <DialogTitle className="text-xl md:text-2xl font-black tracking-tight text-rose-600 mb-2">
                                    Are you absolutely sure?
                                </DialogTitle>
                                <DialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers. Please enter your password to confirm.
                                </DialogDescription>
                            </div>

                            <div className="p-6 md:p-8 bg-background">
                                <Form
                                    {...ProfileController.destroy.form()}
                                    options={{ preserveScroll: true }}
                                    onError={() => passwordInput.current?.focus()}
                                    resetOnSuccess
                                    className="space-y-6"
                                >
                                    {({ resetAndClearErrors, processing, errors }) => (
                                        <>
                                            <div className="grid gap-3 group">
                                                <Label htmlFor="password" className="text-xs font-black tracking-widest text-muted-foreground uppercase ml-1">
                                                    Verify Password
                                                </Label>
                                                <PasswordInput
                                                    id="password"
                                                    name="password"
                                                    ref={passwordInput}
                                                    placeholder="Enter your password"
                                                    autoComplete="current-password"
                                                    className="h-12 rounded-xl border-border/60 bg-muted/5 focus:bg-background transition-all"
                                                />
                                                <InputError className="ml-1" message={errors.password} />
                                            </div>

                                            <DialogFooter className="gap-3 pt-6 border-t border-border/40 sm:justify-end flex-col sm:flex-row">
                                                <DialogClose asChild>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => resetAndClearErrors()}
                                                        className="h-11 rounded-xl font-bold hover:bg-muted/50 w-full sm:w-auto"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </DialogClose>

                                                <Button
                                                    variant="destructive"
                                                    disabled={processing}
                                                    className="h-11 rounded-xl font-bold shadow-lg shadow-rose-900/20 w-full sm:w-auto"
                                                    asChild
                                                >
                                                    <button type="submit" data-test="confirm-delete-user-button">
                                                        Permanently Delete
                                                    </button>
                                                </Button>
                                            </DialogFooter>
                                        </>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
