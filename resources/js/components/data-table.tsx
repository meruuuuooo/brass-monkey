import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type ColumnDef<T> = {
    key: string;
    header: React.ReactNode;
    render: (item: T, index: number) => React.ReactNode;
    className?: string;
};

type DataTableProps<T> = {
    columns: ColumnDef<T>[];
    data: T[];
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
};

type PaginationData = {
    data: unknown[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
};

type DataTableWithPaginationProps<T> = DataTableProps<T> & {
    pagination?: PaginationData;
    onPageChange?: (url: string) => void;
};

export function DataTable<T>({
    columns,
    data,
    emptyMessage = 'No data found.',
    onRowClick,
}: DataTableProps<T>) {
    return (
        <div className="border">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            {columns.map((column) => (
                                <TableHead key={column.key} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="py-10 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, index) => (
                                <TableRow
                                    key={index}
                                    onClick={() => onRowClick?.(item)}
                                    className={onRowClick ? 'cursor-pointer' : ''}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={column.key} className={column.className}>
                                            {column.render(item, index)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export function DataTableWithPagination<T>({
    columns,
    data,
    emptyMessage = 'No data found.',
    onRowClick,
    pagination,
    onPageChange,
}: DataTableWithPaginationProps<T>) {
    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                emptyMessage={emptyMessage}
                onRowClick={onRowClick}
            />

            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4">
                    <span>
                        Showing {data.length} of {pagination.total}{' '}
                        {pagination.total === 1 ? 'item' : 'items'}
                    </span>
                    <div className="flex gap-1">
                        {pagination.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && onPageChange?.(link.url)}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
