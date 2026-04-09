"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SaleProduct {
  id: string;
  productId: string;
  productName: string;
  overridePricePkr: string | null;
  stockLimit: number | null;
  unitsSold: number;
}

interface Product {
  id: string;
  nameEn: string;
}

interface SaleProductsProps {
  saleId: string;
  products: SaleProduct[];
  allProducts: Product[];
}

export function SaleProducts({ saleId, products, allProducts }: SaleProductsProps) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [overridePrice, setOverridePrice] = useState("");
  const [stockLimit, setStockLimit] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Filter out products already in the sale
  const existingProductIds = new Set(products.map((p) => p.productId));
  const availableProducts = allProducts.filter((p) => !existingProductIds.has(p.id));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;
    setAdding(true);
    setError("");

    try {
      const res = await fetch(`/api/v1/admin/flash-sales/${saleId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          overridePricePkr: overridePrice || undefined,
          stockLimit: stockLimit ? parseInt(stockLimit, 10) : undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to add product");
        setAdding(false);
        return;
      }

      setProductId("");
      setOverridePrice("");
      setStockLimit("");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(flashSaleProductId: string) {
    setRemovingId(flashSaleProductId);
    setError("");

    try {
      const res = await fetch(
        `/api/v1/admin/flash-sales/${saleId}/products/${flashSaleProductId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const json = await res.json();
        setError(json.error?.message || "Failed to remove product");
        setRemovingId(null);
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setRemovingId(null);
    }
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Add product form */}
      <form onSubmit={handleAdd} className="mb-5 rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold">Add Product to Sale</h3>
        <div className="mb-3 grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={`${inputClass} appearance-none pr-8`}
              required
            >
              <option value="">Select product...</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Override Price (PKR)
            </label>
            <input
              type="text"
              value={overridePrice}
              onChange={(e) => setOverridePrice(e.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Stock Limit
            </label>
            <input
              type="number"
              value={stockLimit}
              onChange={(e) => setStockLimit(e.target.value)}
              placeholder="Optional"
              min="1"
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={adding || !productId}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {adding ? "Adding..." : "Add Product"}
        </button>
      </form>

      {/* Products table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Product Name
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Override Price
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Stock Limit
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Units Sold
              </TableHead>
              <TableHead className="w-[60px] text-[11px] font-medium uppercase tracking-wide text-muted-foreground" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No products in this sale yet
                </TableCell>
              </TableRow>
            ) : (
              products.map((sp) => (
                <TableRow key={sp.id} className="border-border/50">
                  <TableCell className="text-[13px] font-medium text-foreground">
                    {sp.productName}
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {sp.overridePricePkr
                      ? `Rs. ${Number(sp.overridePricePkr).toLocaleString("en-PK")}`
                      : "--"}
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {sp.stockLimit ?? "--"}
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground">
                    {sp.unitsSold}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleRemove(sp.id)}
                      disabled={removingId === sp.id}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
