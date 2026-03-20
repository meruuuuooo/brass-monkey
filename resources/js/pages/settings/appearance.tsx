import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';
import type { BreadcrumbItem } from '@/types';
import { Paintbrush } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: editAppearance(),
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <SettingsLayout>
                <Card className="w-full border-border/50 shadow-sm overflow-hidden rounded-3xl">
                    <div className="p-6 md:p-8 bg-muted/10 border-b border-border/40 flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted/40 border border-border/50 text-foreground">
                            <Paintbrush className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Appearance Settings</h2>
                            <p className="text-sm font-medium text-muted-foreground mt-1">Update your account's appearance settings and theme preferences.</p>
                        </div>
                    </div>
                    <CardContent className="p-6 md:p-8 space-y-8 max-w-2xl">
                        <AppearanceTabs />
                    </CardContent>
                </Card>
            </SettingsLayout>
        </AppLayout>
    );
}
