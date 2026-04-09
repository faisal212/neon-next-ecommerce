"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "../../../_components/data-table";

interface Template {
  id: string;
  key: string;
  channel: string;
  subject: string | null;
  body: string;
  isActive: boolean;
  updatedAt: string;
}

const channelStyles: Record<string, string> = {
  sms: "bg-emerald-500/10 text-emerald-400",
  email: "bg-blue-500/10 text-blue-400",
  push: "bg-purple-500/10 text-purple-400",
};

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

export function TemplatesClient({
  templates,
}: {
  templates: Template[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Template | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  function openEdit(template: Template) {
    setEditing(template);
    setSubject(template.subject || "");
    setBody(template.body);
    setIsActive(template.isActive);
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);

    const res = await fetch(`/api/v1/admin/notification-templates/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: subject || null,
        body,
        isActive,
      }),
    });

    if (res.ok) {
      setEditing(null);
      router.refresh();
    }
    setSaving(false);
  }

  const columns: Column<Template>[] = [
    {
      key: "key",
      label: "Key",
      searchable: true,
      getValue: (t) => t.key,
      render: (t) => (
        <span className="font-mono text-[12px] font-medium text-foreground">
          {t.key}
        </span>
      ),
    },
    {
      key: "channel",
      label: "Channel",
      sortable: true,
      getValue: (t) => t.channel,
      render: (t) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            channelStyles[t.channel.toLowerCase()] ||
            "bg-zinc-500/10 text-zinc-400"
          }`}
        >
          {t.channel}
        </span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      searchable: true,
      getValue: (t) => t.subject || "",
      render: (t) => (
        <span className="text-muted-foreground">{t.subject || "—"}</span>
      ),
    },
    {
      key: "active",
      label: "Active",
      render: (t) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            t.isActive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-zinc-500/10 text-zinc-400"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                t.isActive ? "bg-emerald-400" : "bg-zinc-500"
              }`}
            />
          </span>
          {t.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "updated",
      label: "Updated",
      sortable: true,
      getValue: (t) => new Date(t.updatedAt).getTime(),
      render: (t) => (
        <span className="text-muted-foreground">
          {new Date(t.updatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (t) => (
        <button
          onClick={() => openEdit(t)}
          className="rounded-md border border-border bg-card px-3 py-1 text-[12px] font-medium transition-colors hover:border-zinc-600"
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={templates}
        columns={columns}
        searchPlaceholder="Search by key or subject..."
        emptyMessage="No notification templates found"
      />

      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="border-border bg-card sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
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
                Channel
              </label>
              <input
                type="text"
                value={editing?.channel || ""}
                disabled
                className={`${inputClass} opacity-50`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Notification subject..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Template body..."
                className={`${inputClass} resize-y`}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-muted-foreground">
                Active
              </label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isActive ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
                    isActive ? "translate-x-[18px]" : "translate-x-[3px]"
                  }`}
                />
              </button>
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
                disabled={saving || !body.trim()}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
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
