"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SingleImageUpload } from "@/app/(admin)/admin/_components/image-upload";
import { PAKISTAN_PROVINCES } from "@/lib/validators/user.validators";

interface BannerData {
  id?: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  placement: string;
  targetProvince: string;
  sortOrder: number;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
}

interface BannerFormProps {
  initialData?: BannerData;
}

export function BannerForm({ initialData }: BannerFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title || "");
  const [titleHighlight, setTitleHighlight] = useState(initialData?.titleHighlight || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [linkUrl, setLinkUrl] = useState(initialData?.linkUrl || "");
  const [placement, setPlacement] = useState(initialData?.placement || "homepage");
  const [targetProvince, setTargetProvince] = useState(initialData?.targetProvince || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [startsAt, setStartsAt] = useState(initialData?.startsAt || "");
  const [endsAt, setEndsAt] = useState(initialData?.endsAt || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = isEditing
      ? `/api/v1/admin/banners/${initialData!.id}`
      : "/api/v1/admin/banners";

    try {
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          titleHighlight: titleHighlight || null,
          subtitle: subtitle || null,
          description: description || null,
          imageUrl,
          linkUrl: linkUrl || null,
          placement,
          targetProvince: targetProvince || null,
          sortOrder,
          isActive,
          startsAt: startsAt ? new Date(startsAt).toISOString() : null,
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to save banner");
        setSaving(false);
        return;
      }

      router.push("/admin/banners");
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
        <h3 className="mb-4 text-sm font-semibold">Banner Details</h3>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Sale Hero Banner"
            required
            className={inputClass}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Title Highlight (2nd line, accent color)
          </label>
          <input
            type="text"
            value={titleHighlight}
            onChange={(e) => setTitleHighlight(e.target.value)}
            placeholder="e.g. Innovation (shown in accent color below title)"
            className={inputClass}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Subtitle / Tagline
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Premium Tech Store (optional)"
            className={inputClass}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description shown below the title (optional)"
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Banner Image
          </label>
          <SingleImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            context="banners"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Link URL
          </label>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="e.g. /collections/summer (optional)"
            className={inputClass}
          />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Placement
            </label>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="homepage">Homepage</option>
              <option value="category">Category</option>
              <option value="checkout">Checkout</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Target Province
            </label>
            <select
              value={targetProvince}
              onChange={(e) => setTargetProvince(e.target.value)}
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="">All Provinces</option>
              {PAKISTAN_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

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

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Start Date/Time (optional)
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              End Date/Time (optional)
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
          <Label className="text-[13px]">Active</Label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !imageUrl}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : isEditing ? "Update Banner" : "Create Banner"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/banners")}
          className="rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:border-zinc-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
