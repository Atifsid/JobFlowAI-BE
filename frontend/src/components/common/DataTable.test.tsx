import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DataTable from "./DataTable";

interface Row { id: string; name: string; }

const rows: Row[] = [{ id: "1", name: "Alice" }, { id: "2", name: "Bob" }];
const columns = [{ key: "name", label: "Name", render: (row: Row) => row.name }];

describe("DataTable", () => {
  it("renders one row per item, in both the table and card views", () => {
    render(<DataTable columns={columns} rows={rows} rowKey={row => row.id} />);
    expect(screen.getAllByText("Alice")).toHaveLength(2);
    expect(screen.getAllByText("Bob")).toHaveLength(2);
  });

  it("calls onRowClick with the clicked row", () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} rows={rows} rowKey={row => row.id} onRowClick={onRowClick} />);
    fireEvent.click(screen.getAllByText("Alice")[0]);
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });
});
