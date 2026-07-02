import type { ReactNode } from "react";
import Card from "./Card";

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
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.hideOnTablet ? "data-table__col--hide-tablet" : ""}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "data-table__row--clickable" : ""}
            >
              {columns.map(col => (
                <td key={col.key} className={col.hideOnTablet ? "data-table__col--hide-tablet" : ""}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="data-table__cards">
        {rows.map(row => (
          <Card key={rowKey(row)} onClick={() => onRowClick?.(row)}>
            {columns.map(col => (
              <p key={col.key}>
                <strong>{col.label}: </strong>
                {col.render(row)}
              </p>
            ))}
          </Card>
        ))}
      </div>
    </>
  );
}
