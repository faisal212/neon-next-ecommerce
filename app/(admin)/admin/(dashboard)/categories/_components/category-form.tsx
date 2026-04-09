"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SingleImageUpload } from "../../../_components/image-upload";

interface Category {
  id: string;
  nameEn: string;
}

interface CategoryData {
  id?: string;
  nameEn: string;
  nameUr: string;
  parentId: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  isEcosystemFeatured: boolean;
  ecosystemOrder: number;
}

interface CategoryFormProps {
  categories: Category[];
  initialData?: CategoryData;
}

export function CategoryForm({ categories, initialData }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState<CategoryData>(
    initialData || {
      nameEn: "",
      nameUr: "",
      parentId: "",
      imageUrl: "",
      isActive: true,
      sortOrder: 0,
      isEcosystemFeatured: false,
      ecosystemOrder: 0,
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField<K extends keyof CategoryData>(key: K, value: CategoryData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEditing
      ? `/api/v1/admin/categories/${initialData!.id}`
      : "/api/v1/admin/categories";

    try {
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: form.nameEn,
          nameUr: form.nameUr || undefined,
          parentId: form.parentId || undefined,
          imageUrl: form.imageUrl || undefined,
          isActive: form.isActive,
          sortOrder: form.sortOrder,
          isEcosystemFeatured: form.isEcosystemFeatured,
          ecosystemOrder: form.ecosystemOrder,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to save category");
        setSaving(false);
        return;
      }

      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setSaving(false);
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
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Category Name (English)
            </label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => updateField("nameEn", e.target.value)}
              placeholder="e.g. Women's Clothing"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Category Name (Urdu)
            </label>
            <input
              type="text"
              value={form.nameUr}
              onChange={(e) => updateField("nameUr", e.target.value)}
              placeholder="اردو میں نام"
              dir="rtl"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Parent Category
            </label>
            <select
              value={form.parentId}
              onChange={(e) => updateField("parentId", e.target.value)}
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="">None (Top Level)</option>
              {categories
                .filter((c) => c.id !== initialData?.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameEn}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Sort Order
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => updateField("sortOrder", Number(e.target.value))}
              min={0}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Category Image
          </label>
          <SingleImageUpload
            value={form.imageUrl}
            onChange={(url) => updateField("imageUrl", url)}
            context={`categories/${initialData?.id || "new"}`}
          />
        </div>

        <div className="mb-4 rounded-md border border-dashed border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="flex items-center gap-2.5">
            <Switch
              checked={form.isEcosystemFeatured}
              onCheckedChange={(checked) => updateField("isEcosystemFeatured", checked)}
            />
            <Label className="text-[13px]">Feature in Homepage Ecosystem</Label>
          </div>
          {form.isEcosystemFeatured && (
            <div className="mt-3">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Ecosystem Slot Order
              </label>
              <input
                type="number"
                value={form.ecosystemOrder}
                onChange={(e) => updateField("ecosystemOrder", Number(e.target.value))}
                min={0}
                className={inputClass}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Lowest order wins the hero tile (2×2). Top 4 featured categories are shown.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Switch
            checked={form.isActive}
            onCheckedChange={(checked) => updateField("isActive", checked)}
          />
          <Label className="text-[13px]">Active</Label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
