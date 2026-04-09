import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, categories, productTags, productVariants, inventory } from "@/lib/db/schema/catalog";
import { BackLink } from "../../../../_components/back-link";
import { PageHeader } from "../../../../_components/page-header";
import { ProductForm } from "../../_components/product-form";
import { VariantManager } from "../../_components/variant-manager";
import { SeoEditor } from "../../../../_components/seo-editor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) notFound();

  const tags = await db
    .select({ tag: productTags.tag })
    .from(productTags)
    .where(eq(productTags.productId, id));

  const allCategories = await db
    .select({ id: categories.id, nameEn: categories.nameEn })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.nameEn);

  const variantsWithStock = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      color: productVariants.color,
      size: productVariants.size,
      extraPricePkr: productVariants.extraPricePkr,
      isActive: productVariants.isActive,
      quantityOnHand: inventory.quantityOnHand,
      quantityReserved: inventory.quantityReserved,
      lowStockThreshold: inventory.lowStockThreshold,
    })
    .from(productVariants)
    .leftJoin(inventory, eq(productVariants.id, inventory.variantId))
    .where(eq(productVariants.productId, id));

  const variants = variantsWithStock.map((v) => ({
    id: v.id,
    sku: v.sku,
    color: v.color,
    size: v.size,
    extraPricePkr: v.extraPricePkr,
    isActive: v.isActive,
    stock: {
      onHand: v.quantityOnHand ?? 0,
      reserved: v.quantityReserved ?? 0,
      available: (v.quantityOnHand ?? 0) - (v.quantityReserved ?? 0),
      threshold: v.lowStockThreshold ?? 5,
    },
  }));

  return (
    <>
      <BackLink href="/admin/products" label="Back to Products" />
      <PageHeader title={`Edit: ${product.nameEn}`} />
      <ProductForm
        categories={allCategories}
        variants={variants}
        initialData={{
          id: product.id,
          categoryId: product.categoryId,
          nameEn: product.nameEn,
          nameUr: product.nameUr || "",
          descriptionEn: product.descriptionEn || "",
          descriptionUr: product.descriptionUr || "",
          basePricePkr: product.basePricePkr,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          tags: tags.map((t) => t.tag),
        }}
      />
      <VariantManager productId={id} variants={variants} />
      <SeoEditor entityType="product" entityId={id} />
    </>
  );
}
