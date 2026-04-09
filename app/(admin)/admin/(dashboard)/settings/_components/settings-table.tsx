"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

export function SettingsTable({ settings }: { settings: Setting[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Setting | null>(null);
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  function openEdit(setting: Setting) {
    setEditing(setting);
    setValue(setting.value.replace(/^"|"$/g, ""));
    setDescription(setting.description || "");
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);

    let parsedValue: unknown = value;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      // Keep as string
    }

    const res = await fetch("/api/v1/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: editing.key,
        value: parsedValue,
        description: description || undefined,
      }),
    });

    if (res.ok) {
      setEditing(null);
      router.refresh();
    }
    setSaving(false);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Key
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Value
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Last Updated
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No settings configured
                </TableCell>
              </TableRow>
            ) : (
              settings.map((setting) => (
                <TableRow key={setting.id} className="border-border/50">
                  <TableCell className="font-mono text-[12px] font-medium text-foreground">
                    {setting.key}
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-500">
                    {setting.value.replace(/^"|"$/g, "")}
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {setting.description || "—"}
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {new Date(setting.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => openEdit(setting)}
                      className="rounded-md border border-border bg-card px-3 py-1 text-[12px] font-medium transition-colors hover:border-zinc-600"
                    >
                      Edit
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Key
              </label>
              <input
                type="text"
                value={editing?.key || ""}
                disabled
                className={`${inputClass} opacity-50`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Value
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
