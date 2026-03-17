import { CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AlertSuccess({
    message,
    title = 'Success',
}: {
    message: string;
    title?: string;
}) {
    return (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">{title}</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
                {message}
            </AlertDescription>
        </Alert>
    );
}
