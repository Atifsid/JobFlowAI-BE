import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  hideOnTablet?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T>({ columns, rows, rowKey, onRowClick }: DataTableProps<T>) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead key={col.key} className={cn(col.hideOnTablet && "hidden lg:table-cell")}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => (
              <TableRow
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map(col => (
                  <TableCell key={col.key} className={cn(col.hideOnTablet && "hidden lg:table-cell")}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {rows.map(row => (
          <Card key={rowKey(row)} onClick={() => onRowClick?.(row)} className={cn(onRowClick && "cursor-pointer")}>
            <CardContent className="flex flex-col gap-1">
              {columns.map(col => (
                <p key={col.key} className="text-sm text-foreground">
                  <strong className="font-medium">{col.label}: </strong>
                  {col.render(row)}
                </p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
