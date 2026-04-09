"use client";

import { useState, useEffect, useCallback } from "react";
import { DropZone } from "../../../_components/image-upload";
import { Star, Trash2, GripVertical } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  variantId: string | null;
}

interface Variant {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
}

interface ProductImagesProps {
  productId: string;
  variants?: Variant[];
}

export function ProductImages({ productId, variants = [] }: ProductImagesProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(async () => {
    const res = await fetch(`/api/v1/admin/products/${productId}/images`);
    if (res.ok) {
      const json = await res.json();
      setImages(json.data || []);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  async function handleUpload(publicUrl: string) {
    const nextOrder = images.length;
    const isPrimary = images.length === 0;

    const res = await fetch(`/api/v1/admin/products/${productId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: publicUrl,
        isPrimary,
        sortOrder: nextOrder,
      }),
    });

    if (res.ok) {
      fetchImages();
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this image?")) return;

    const res = await fetch(
      `/api/v1/admin/products/${productId}/images/${imageId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  }

  async function handleSetPrimary(imageId: string) {
    const res = await fetch(
      `/api/v1/admin/products/${productId}/images/${imageId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      }
    );

    if (res.ok) {
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      );
    }
  }

  async function handleAltTextChange(imageId: string, altText: string) {
    await fetch(
      `/api/v1/admin/products/${productId}/images/${imageId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText }),
      }
    );
  }

  async function handleVariantChange(imageId: string, variantId: string) {
    const res = await fetch(
      `/api/v1/admin/products/${productId}/images/${imageId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variantId || null }),
      }
    );

    if (res.ok) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? { ...img, variantId: variantId || null }
            : img
        )
      );
    }
  }

  async function handleReorder(imageId: string, newOrder: number) {
    await fetch(
      `/api/v1/admin/products/${productId}/images/${imageId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: newOrder }),
      }
    );

    setImages((prev) =>
      prev
        .map((img) =>
          img.id === imageId ? { ...img, sortOrder: newOrder } : img
        )
        .sort((a, b) => a.sortOrder - b.sortOrder)
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">Product Images</h3>

      {/* Upload zone */}
      <DropZone
        context={`products/${productId}`}
        multiple
        onUpload={handleUpload}
        className="mb-4"
      />

      {/* Image grid */}
      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Loading images...
        </div>
      ) : images.length === 0 ? (
        <div className="py-4 text-center text-sm text-muted-foreground">
          No images yet — upload above
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {images
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((image, index) => (
              <div
                key={image.id}
                className={`group relative rounded-lg border bg-background transition-colors ${
                  image.isPrimary
                    ? "border-primary/50 ring-1 ring-primary/20"
                    : "border-border"
                }`}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={image.url}
                    alt={image.altText || "Product image"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />

                  {/* Overlay actions */}
                  <div className="absolute inset-0 flex items-start justify-between bg-gradient-to-b from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(image.id)}
                      title={image.isPrimary ? "Primary image" : "Set as primary"}
                      className={`rounded-md p-1.5 transition-colors ${
                        image.isPrimary
                          ? "bg-primary text-white"
                          : "bg-black/50 text-white/70 hover:bg-primary hover:text-white"
                      }`}
                    >
                      <Star
                        className="h-3.5 w-3.5"
                        fill={image.isPrimary ? "currentColor" : "none"}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(image.id)}
                      className="rounded-md bg-black/50 p-1.5 text-white/70 transition-colors hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Primary badge */}
                  {image.isPrimary && (
                    <div className="absolute bottom-2 left-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Primary
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 p-2.5">
                  {/* Alt text */}
                  <input
                    type="text"
                    defaultValue={image.altText || ""}
                    onBlur={(e) =>
                      handleAltTextChange(image.id, e.target.value)
                    }
                    placeholder="Alt text (SEO)"
                    className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary"
                  />

                  {/* Variant + Order row */}
                  <div className="flex items-center gap-1.5">
                    {variants.length > 0 && (
                      <select
                        value={image.variantId || ""}
                        onChange={(e) =>
                          handleVariantChange(image.id, e.target.value)
                        }
                        className="min-w-0 flex-1 appearance-none rounded border border-border bg-background px-1.5 py-1 text-[11px] outline-none focus:border-primary"
                      >
                        <option value="">All variants</option>
                        {variants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {[v.color, v.size].filter(Boolean).join(" / ") ||
                              v.sku}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex items-center gap-0.5 text-muted-foreground">
                      <GripVertical className="h-3 w-3" />
                      <input
                        type="number"
                        min={0}
                        defaultValue={image.sortOrder}
                        onBlur={(e) =>
                          handleReorder(image.id, Number(e.target.value))
                        }
                        className="w-8 rounded border border-border bg-background px-1 py-0.5 text-center text-[11px] outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
