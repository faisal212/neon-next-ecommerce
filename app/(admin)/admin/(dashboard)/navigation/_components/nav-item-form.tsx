"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NavItemData {
  id?: string;
  label: string;
  type: string;
  categoryId: string | null;
  href: string;
  sortOrder: number;
  isActive: boolean;
  openInNewTab: boolean;
}

interface CategoryOption {
  id: string;
  nameEn: string;
  slug: string;
}

interface NavItemFormProps {
  initialData?: NavItemData;
}

export function NavItemForm({ initialData }: NavItemFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [type, setType] = useState(initialData?.type || "category");
  const [label, setLabel] = useState(initialData?.label || "");
  const [href, setHref] = useState(initialData?.href || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [openInNewTab, setOpenInNewTab] = useState(initialData?.openInNewTab ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    fetch("/api/v1/admin/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCategories(json.data);
      })
      .catch(() => {});
  }, []);

  function handleCategoryChange(catId: string) {
    setCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setLabel(cat.nameEn);
      setHref(`/categories/${cat.slug}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEditing
      ? `/api/v1/admin/nav-menu-items/${initialData!.id}`
      : "/api/v1/admin/nav-menu-items";

    try {
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          type,
          categoryId: type === "category" ? categoryId || null : null,
          href,
          sortOrder,
          isActive,
          openInNewTab,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to save");
        setSaving(false);
        return;
      }

      router.push("/admin/navigation");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialData?.id || !confirm("Delete this navigation item?")) return;

    try {
      const res = await fetch(`/api/v1/admin/nav-menu-items/${initialData.id}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        router.push("/admin/navigation");
        router.refresh();
      }
    } catch {
      setError("Failed to delete");
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mb-5 rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Item Details</h3>

        {/* Type selector */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={`${inputClass} appearance-none pr-8`}
          >
            <option value="category">Category</option>
            <option value="custom">Custom Page / URL</option>
          </select>
        </div>

        {/* Category dropdown (when type = category) */}
        {type === "category" && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameEn}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Label */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Watches or Support"
            required
            className={inputClass}
          />
        </div>

        {/* URL */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            URL
          </label>
          <input
            type="text"
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="e.g. /categories/watches or /support"
            required
            className={inputClass}
          />
        </div>

        {/* Sort order */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Sort Order
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
            placeholder="0"
            className={inputClass}
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label className="text-[13px]">Active</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Switch checked={openInNewTab} onCheckedChange={setOpenInNewTab} />
            <Label className="text-[13px]">Open in new tab</Label>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !label || !href}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditing ? "Update Item" : "Create Item"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/navigation")}
          className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
        >
          Cancel
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
