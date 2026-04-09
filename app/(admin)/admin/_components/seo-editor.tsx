"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Globe } from "lucide-react";

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  robots: string;
  // Category-specific
  h1Override?: string;
  topContent?: string;
  bottomContent?: string;
}

interface SeoEditorProps {
  entityType: "product" | "category";
  entityId: string;
}

const defaultSeo: SeoData = {
  metaTitle: "",
  metaDescription: "",
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
  canonicalUrl: "",
  robots: "index,follow",
};

export function SeoEditor({ entityType, entityId }: SeoEditorProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState<SeoData>(defaultSeo);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const apiUrl =
    entityType === "product"
      ? `/api/v1/admin/seo/products/${entityId}`
      : `/api/v1/admin/seo/categories/${entityId}`;

  // Load SEO data when section is expanded for the first time
  useEffect(() => {
    if (!expanded || loaded) return;

    async function fetchSeo() {
      setLoading(true);
      try {
        const res = await fetch(apiUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setForm({
              metaTitle: json.data.metaTitle || "",
              metaDescription: json.data.metaDescription || "",
              ogTitle: json.data.ogTitle || "",
              ogDescription: json.data.ogDescription || "",
              ogImageUrl: json.data.ogImageUrl || "",
              canonicalUrl: json.data.canonicalUrl || "",
              robots: json.data.robots || "index,follow",
              ...(entityType === "category"
                ? {
                    h1Override: json.data.h1Override || "",
                    topContent: json.data.topContent || "",
                    bottomContent: json.data.bottomContent || "",
                  }
                : {}),
            });
          }
        }
      } catch {
        // No existing SEO data — that's fine
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    }

    fetchSeo();
  }, [expanded, loaded, apiUrl, entityType]);

  function updateField<K extends keyof SeoData>(key: K, value: SeoData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const body: Record<string, unknown> = {
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        ogTitle: form.ogTitle || null,
        ogDescription: form.ogDescription || null,
        ogImageUrl: form.ogImageUrl || null,
        canonicalUrl: form.canonicalUrl || null,
        robots: form.robots || "index,follow",
      };

      if (entityType === "category") {
        body.h1Override = form.h1Override || null;
        body.topContent = form.topContent || null;
        body.bottomContent = form.bottomContent || null;
      }

      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to save SEO data");
        setSaving(false);
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <div className="mb-5 rounded-lg border border-border bg-card">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 p-5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <Globe className="h-4 w-4 text-muted-foreground" />
        <h3 className="flex-1 text-sm font-semibold">SEO Settings</h3>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          {loading ? (
            <div className="py-4 text-center text-[13px] text-muted-foreground">
              Loading SEO data...
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
                  SEO settings saved successfully
                </div>
              )}

              {/* Meta Tags */}
              <div className="mb-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Meta Tags
                </p>
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Meta Title
                    <span className="ml-1 text-[10px] text-muted-foreground/60">
                      ({form.metaTitle.length}/70)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => updateField("metaTitle", e.target.value)}
                    placeholder="Page title for search engines"
                    maxLength={70}
                    className={inputClass}
                  />
                </div>
                <div className="mb-3">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Meta Description
                    <span className="ml-1 text-[10px] text-muted-foreground/60">
                      ({form.metaDescription.length}/180)
                    </span>
                  </label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) =>
                      updateField("metaDescription", e.target.value)
                    }
                    placeholder="Brief description for search results"
                    maxLength={180}
                    rows={2}
                    className={`${inputClass} resize-vertical`}
                  />
                </div>
              </div>

              {/* Search Preview */}
              {(form.metaTitle || form.metaDescription) && (
                <div className="mb-4 rounded-md border border-border bg-background p-3">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                    Search Preview
                  </p>
                  <p className="text-[14px] font-medium text-blue-400">
                    {form.metaTitle || "Page Title"}
                  </p>
                  <p className="text-[12px] text-emerald-500/80">
                    {form.canonicalUrl || "https://yourstore.pk/..."}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {form.metaDescription || "No description set"}
                  </p>
                </div>
              )}

              {/* Open Graph */}
              <div className="mb-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Social Sharing (Open Graph)
                </p>
                <div className="mb-3 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      OG Title
                    </label>
                    <input
                      type="text"
                      value={form.ogTitle}
                      onChange={(e) => updateField("ogTitle", e.target.value)}
                      placeholder="Social share title (defaults to meta title)"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      OG Image URL
                    </label>
                    <input
                      type="text"
                      value={form.ogImageUrl}
                      onChange={(e) =>
                        updateField("ogImageUrl", e.target.value)
                      }
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>
                </div>
                {entityType === "product" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      OG Description
                    </label>
                    <textarea
                      value={form.ogDescription}
                      onChange={(e) =>
                        updateField("ogDescription", e.target.value)
                      }
                      placeholder="Social share description"
                      rows={2}
                      className={`${inputClass} resize-vertical`}
                    />
                  </div>
                )}
              </div>

              {/* Category-specific fields */}
              {entityType === "category" && (
                <div className="mb-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Category Content
                  </p>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      H1 Override
                    </label>
                    <input
                      type="text"
                      value={form.h1Override || ""}
                      onChange={(e) =>
                        updateField("h1Override", e.target.value)
                      }
                      placeholder="Custom H1 tag (defaults to category name)"
                      className={inputClass}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Top Content (above products)
                    </label>
                    <textarea
                      value={form.topContent || ""}
                      onChange={(e) =>
                        updateField("topContent", e.target.value)
                      }
                      placeholder="HTML or text content displayed above products"
                      rows={3}
                      className={`${inputClass} resize-vertical`}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Bottom Content (below products)
                    </label>
                    <textarea
                      value={form.bottomContent || ""}
                      onChange={(e) =>
                        updateField("bottomContent", e.target.value)
                      }
                      placeholder="HTML or text content displayed below products"
                      rows={3}
                      className={`${inputClass} resize-vertical`}
                    />
                  </div>
                </div>
              )}

              {/* Advanced */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={form.canonicalUrl}
                    onChange={(e) =>
                      updateField("canonicalUrl", e.target.value)
                    }
                    placeholder="https://yourstore.pk/..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Robots
                  </label>
                  <select
                    value={form.robots}
                    onChange={(e) => updateField("robots", e.target.value)}
                    className={`${inputClass} appearance-none pr-8`}
                  >
                    <option value="index,follow">index, follow</option>
                    <option value="noindex,follow">noindex, follow</option>
                    <option value="index,nofollow">index, nofollow</option>
                    <option value="noindex,nofollow">noindex, nofollow</option>
                  </select>
                </div>
              </div>

              {/* Save */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save SEO Settings"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
