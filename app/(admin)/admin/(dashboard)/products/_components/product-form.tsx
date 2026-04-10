"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ProductImages } from "./product-images";

interface Category {
  id: string;
  nameEn: string;
}

interface Variant {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
}

interface ProductData {
  id?: string;
  categoryId: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  basePricePkr: string;
  isActive: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  tags: string[];
}

interface ProductFormProps {
  categories: Category[];
  variants?: Variant[];
  initialData?: ProductData;
}

export function ProductForm({ categories, variants = [], initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [form, setForm] = useState<ProductData>(
    initialData || {
      categoryId: "",
      nameEn: "",
      nameUr: "",
      descriptionEn: "",
      descriptionUr: "",
      basePricePkr: "",
      isActive: true,
      isFeatured: false,
      isPublished: false,
      tags: [],
    }
  );
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingIntent, setSavingIntent] = useState<"save" | "publish" | "unpublish" | null>(null);
  const [error, setError] = useState("");

  function updateField<K extends keyof ProductData>(key: K, value: ProductData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      updateField("tags", [...form.tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    updateField(
      "tags",
      form.tags.filter((t) => t !== tag)
    );
  }

  async function handleSubmit(
    e: React.FormEvent,
    intent: "save" | "publish" | "unpublish",
  ) {
    e.preventDefault();

    if (intent === "unpublish") {
      if (!confirm(`Unpublish "${form.nameEn}"? It will be hidden from the store and moved back to drafts.`)) {
        return;
      }
    }

    setSaving(true);
    setSavingIntent(intent);
    setError("");

    // Resolve the published state from the intent
    const nextPublished =
      intent === "publish"
        ? true
        : intent === "unpublish"
          ? false
          : form.isPublished;

    const url = isEditing
      ? `/api/v1/admin/products/${initialData!.id}`
      : "/api/v1/admin/products";

    try {
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: form.categoryId,
          nameEn: form.nameEn,
          nameUr: form.nameUr || undefined,
          descriptionEn: form.descriptionEn || undefined,
          descriptionUr: form.descriptionUr || undefined,
          basePricePkr: form.basePricePkr,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
          isPublished: nextPublished,
          tags: form.tags.length ? form.tags : undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to save product");
        setSaving(false);
        setSavingIntent(null);
        return;
      }

      if (isEditing) {
        router.push("/admin/products");
      } else {
        // Redirect to the edit page so user can add images, variants, and SEO
        const json = await res.json();
        router.push(`/admin/products/${json.data.id}/edit`);
      }
      router.refresh();
    } catch {
      setError("Something went wrong");
      setSaving(false);
      setSavingIntent(null);
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <form onSubmit={(e) => handleSubmit(e, "save")}>
      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="mb-5 rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Basic Information</h3>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Product Name (English)
            </label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => updateField("nameEn", e.target.value)}
              placeholder="e.g. Embroidered Lawn Suit"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Product Name (Urdu)
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
              Description (English)
            </label>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => updateField("descriptionEn", e.target.value)}
              placeholder="Product description..."
              rows={4}
              className={`${inputClass} resize-vertical`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Description (Urdu)
            </label>
            <textarea
              value={form.descriptionUr}
              onChange={(e) => updateField("descriptionUr", e.target.value)}
              placeholder="تفصیل"
              dir="rtl"
              rows={4}
              className={`${inputClass} resize-vertical`}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              required
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Base Price (PKR)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                Rs.
              </span>
              <input
                type="text"
                value={form.basePricePkr}
                onChange={(e) => updateField("basePricePkr", e.target.value)}
                placeholder="0.00"
                required
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-8">
          {form.isPublished && (
            <div className="flex items-center gap-2.5">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => updateField("isActive", checked)}
              />
              <Label className="text-[13px]">Active</Label>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <Switch
              checked={form.isFeatured}
              onCheckedChange={(checked) => updateField("isFeatured", checked)}
            />
            <Label className="text-[13px]">Featured</Label>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-5 rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Tags</h3>
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag and press Enter"
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={addTag}
            className="rounded-md border border-border bg-card px-3 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded bg-primary/12 px-2 py-0.5 text-[11px] font-medium text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 text-primary/60 hover:text-primary"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Images (edit mode only) */}
      {isEditing && initialData?.id && (
        <div className="mb-5">
          <ProductImages productId={initialData.id} variants={variants} />
        </div>
      )}

      {/* Next steps hint (create mode only) */}
      {!isEditing && (
        <div className="mb-5 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 p-5">
          <h3 className="mb-2 text-sm font-semibold text-zinc-400">After Creating</h3>
          <p className="mb-3 text-[13px] text-zinc-500">
            Once you create this product, you&apos;ll be redirected to the edit page where you can:
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
                <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <span className="text-[12px] font-medium text-zinc-400">Upload Images</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10">
                <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <span className="text-[12px] font-medium text-zinc-400">Add Variants</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-500/10">
                <svg className="h-3.5 w-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <span className="text-[12px] font-medium text-zinc-400">Configure SEO</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {form.isPublished ? (
          <>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving && savingIntent === "save" ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, "unpublish")}
              className="rounded-md border border-amber-500/40 bg-amber-500/5 px-4 py-2 text-[13px] font-medium text-amber-400 transition-colors hover:border-amber-500/60 hover:bg-amber-500/10 disabled:opacity-50"
            >
              {saving && savingIntent === "unpublish" ? "Unpublishing..." : "Unpublish"}
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-zinc-600 disabled:opacity-50"
            >
              {saving && savingIntent === "save"
                ? "Saving..."
                : isEditing
                  ? "Save draft"
                  : "Save draft & continue"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, "publish")}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400 hover:shadow-emerald-500/30 disabled:opacity-50"
            >
              {saving && savingIntent === "publish"
                ? "Publishing..."
                : isEditing
                  ? "Save & publish"
                  : "Create & publish"}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
