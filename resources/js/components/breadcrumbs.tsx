import { Link } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';
import { Fragment } from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';


export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}) {
    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            const isDashboard = item.title === 'Dashboard';

                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage className="flex items-center gap-2 font-bold tracking-tight text-foreground">
                                                {isDashboard && <LayoutDashboard className="size-4 text-amber-600 dark:text-amber-400" />}
                                                {item.title}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild className="flex items-center transition-colors hover:text-foreground">
                                                <Link href={item.href} className="flex items-center gap-2">
                                                    {isDashboard && <LayoutDashboard className="size-4 opacity-50" />}
                                                    {item.title}
                                                </Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>

                </Breadcrumb>
            )}
        </>
    );
}
