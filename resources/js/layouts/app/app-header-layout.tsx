import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent variant="header">{children}</AppContent>
            <AppFooter />
        </AppShell>
    );
}
