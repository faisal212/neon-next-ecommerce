"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";
import { StatusBadge } from "../../../_components/status-badge";

interface Customer {
  id: string;
  name: string;
  email: string;
  phonePk: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpend: string;
}

const columns: Column<Customer>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
    getValue: (row) => row.name,
    render: (row) => (
      <span className="font-medium text-foreground">{row.name}</span>
    ),
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
    searchable: true,
    getValue: (row) => row.email,
    render: (row) => <span className="text-zinc-400">{row.email}</span>,
  },
  {
    key: "phone",
    label: "Phone",
    searchable: true,
    getValue: (row) => row.phonePk,
    render: (row) => <span className="text-zinc-400">{row.phonePk}</span>,
  },
  {
    key: "orders",
    label: "Orders",
    sortable: true,
    getValue: (row) => row.orderCount,
    render: (row) => (
      <span className="font-mono text-[12px] text-zinc-400">
        {row.orderCount}
      </span>
    ),
  },
  {
    key: "totalSpent",
    label: "Total Spent",
    sortable: true,
    getValue: (row) => Number(row.totalSpend),
    render: (row) => (
      <span className="font-mono text-[12px] text-zinc-400">
        Rs. {Number(row.totalSpend).toLocaleString("en-PK")}
      </span>
    ),
  },
  {
    key: "joined",
    label: "Joined",
    sortable: true,
    getValue: (row) => new Date(row.createdAt).getTime(),
    render: (row) => (
      <span className="text-[12px] text-zinc-500">
        {new Date(row.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    getValue: (row) => (row.isActive ? "active" : "inactive"),
    render: (row) => (
      <StatusBadge status={row.isActive ? "active" : "inactive"} />
    ),
  },
];

export function CustomersTable({ data }: { data: Customer[] }) {
  const router = useRouter();

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={10}
      searchPlaceholder="Search customers by name, email or phone..."
      emptyMessage="No customers yet"
      onRowClick={(row) => router.push(`/admin/customers/${row.id}`)}
    />
  );
}
