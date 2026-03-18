import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, LayoutGrid, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export type PaginationData = {
    data: unknown[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
};

export type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    emptyMessage?: string
    onRowClick?: (item: TData) => void
    renderGridItem?: (item: TData) => React.ReactNode
}

export type DataTableWithPaginationProps<TData, TValue> = DataTableProps<TData, TValue> & {
    pagination?: PaginationData;
    onPageChange?: (url: string) => void;
};

export function DataTable<TData, TValue>({
    columns,
    data,
    emptyMessage = 'No data found.',
    onRowClick,
    renderGridItem,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [viewMode, setViewMode] = React.useState<"list" | "grid">("list")

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    // Prevent row click triggering if user interacts with a button/checkbox inside the row
    const handleRowClick = (item: TData, e: React.MouseEvent) => {
        // Check if the click originated from an interactive element like a button, checkbox, link, etc.
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button, a, input, [role="checkbox"], [role="menuitem"]');

        if (!isInteractive && onRowClick) {
            onRowClick(item);
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {renderGridItem && (
                        <div className="flex items-center border rounded-md p-1 bg-muted/20">
                            <Button
                                variant={viewMode === "list" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer"
                                onClick={() => setViewMode("list")}
                            >
                                <List className="h-4 w-4" />
                                <span className="sr-only">List View</span>
                            </Button>
                            <Button
                                variant={viewMode === "grid" ? "secondary" : "ghost"}
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer"
                                onClick={() => setViewMode("grid")}
                            >
                                <LayoutGrid className="h-4 w-4" />
                                <span className="sr-only">Grid View</span>
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto cursor-pointer">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize cursor-pointer"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {viewMode === "list" ? (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-muted/50">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={onRowClick ? "cursor-pointer transition-colors" : ""}
                                        onClick={(e) => handleRowClick(row.original, e)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <div
                                key={row.id}
                                className={onRowClick ? "cursor-pointer" : ""}
                                onClick={(e) => handleRowClick(row.original, e)}
                            >
                                {renderGridItem?.(row.original)}
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-10 text-center text-muted-foreground border rounded-md">
                            {emptyMessage}
                        </div>
                    )}
                </div>
            )}

            {/* Row Selection Info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
            </div>
        </div>
    )
}

export function DataTableWithPagination<TData, TValue>({
    columns,
    data,
    emptyMessage = 'No data found.',
    onRowClick,
    pagination,
    onPageChange,
    renderGridItem,
}: DataTableWithPaginationProps<TData, TValue>) {
    return (
        <div className="flex flex-col gap-4">
            <DataTable
                columns={columns}
                data={data}
                emptyMessage={emptyMessage}
                onRowClick={onRowClick}
                renderGridItem={renderGridItem}
            />
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                    <span>
                        Showing {data.length} of {pagination.total}{' '}
                        {pagination.total === 1 ? 'item' : 'items'}
                    </span>
                    <div className="flex gap-1 overflow-x-auto pb-1">
                        {pagination.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                className="cursor-pointer shrink-0"
                                onClick={() => link.url && onPageChange?.(link.url)}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
