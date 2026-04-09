"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "../../../_components/data-table";

interface BannerRow {
  id: string;
  title: string;
  imageUrl: string;
  placement: string;
  targetProvince: string | null;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

const columns: Column<BannerRow>[] = [
  {
    key: "image",
    label: "Image",
    className: "w-[60px]",
    render: (row) => (
      <img
        src={row.imageUrl}
        alt={row.title}
        className="h-10 w-16 rounded object-cover"
      />
    ),
  },
  {
    key: "title",
    label: "Title",
    sortable: true,
    searchable: true,
    getValue: (row) => row.title,
    render: (row) => <span className="font-medium text-foreground">{row.title}</span>,
  },
  {
    key: "placement",
    label: "Placement",
    sortable: true,
    getValue: (row) => row.placement,
    render: (row) => (
      <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium capitalize text-primary">
        {row.placement}
      </span>
    ),
  },
  {
    key: "targetProvince",
    label: "Province",
    sortable: true,
    getValue: (row) => row.targetProvince || "All",
    render: (row) => row.targetProvince || "All",
  },
  {
    key: "sortOrder",
    label: "Order",
    sortable: true,
    getValue: (row) => row.sortOrder,
    render: (row) => row.sortOrder,
  },
  {
    key: "isActive",
    label: "Active",
    render: (row) => (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          row.isActive
            ? "bg-emerald-500/15 text-emerald-500"
            : "bg-zinc-500/15 text-zinc-400"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {row.isActive ? "Yes" : "No"}
      </span>
    ),
  },
  {
    key: "dates",
    label: "Schedule",
    render: (row) => {
      if (!row.startsAt && !row.endsAt) return <span className="text-muted-foreground">Always</span>;
      const fmt = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      if (row.startsAt && row.endsAt)
        return `${fmt(row.startsAt)} - ${fmt(row.endsAt)}`;
      if (row.startsAt) return `From ${fmt(row.startsAt)}`;
      return `Until ${fmt(row.endsAt!)}`;
    },
  },
];

export function BannersTable({ data }: { data: BannerRow[] }) {
  const router = useRouter();

  return (
    <DataTable
      data={data}
      columns={columns}
      searchPlaceholder="Search banners..."
      emptyMessage="No banners yet"
      onRowClick={(row) => router.push(`/admin/banners/${row.id}/edit`)}
    />
  );
}
