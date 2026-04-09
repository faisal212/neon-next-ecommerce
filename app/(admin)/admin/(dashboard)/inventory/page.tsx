import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productVariants, inventory } from "@/lib/db/schema/catalog";
import { PageHeader } from "../../_components/page-header";
import { InventoryTable } from "./_components/inventory-table";

export default async function InventoryPage() {
  const inventoryList = await db
    .select({
      variantId: inventory.variantId,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      lowStockThreshold: inventory.lowStockThreshold,
      productName: products.nameEn,
      sku: productVariants.sku,
      color: productVariants.color,
      size: productVariants.size,
      isActive: productVariants.isActive,
    })
    .from(inventory)
    .innerJoin(productVariants, eq(inventory.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .orderBy(sql`${inventory.quantityOnHand} - ${inventory.quantityReserved}`);

  const serialized = inventoryList.map((item) => ({
    id: item.variantId,
    variantId: item.variantId,
    productName: item.productName,
    sku: item.sku,
    variant: [item.color, item.size].filter(Boolean).join(" / ") || "—",
    quantityOnHand: item.quantityOnHand ?? 0,
    quantityReserved: item.quantityReserved ?? 0,
    available: (item.quantityOnHand ?? 0) - (item.quantityReserved ?? 0),
    lowStockThreshold: item.lowStockThreshold ?? 5,
    isLow:
      (item.quantityOnHand ?? 0) - (item.quantityReserved ?? 0) <=
      (item.lowStockThreshold ?? 5),
  }));

  return (
    <>
      <PageHeader title="Inventory" />
      <InventoryTable data={serialized} />
    </>
  );
}
