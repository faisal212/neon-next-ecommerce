import { db } from "@/lib/db";
import { deliveryZones } from "@/lib/db/schema/orders";
import { PageHeader } from "../../_components/page-header";
import { ZonesClient } from "./_components/zones-client";

export default async function DeliveryZonesPage() {
  const zones = await db
    .select()
    .from(deliveryZones)
    .orderBy(deliveryZones.province, deliveryZones.city);

  const serialized = zones.map((z) => ({
    id: z.id,
    city: z.city,
    province: z.province,
    shippingChargePkr: z.shippingChargePkr,
    estimatedDays: z.estimatedDays,
    isCodAvailable: z.isCodAvailable,
    isActive: z.isActive,
  }));

  return (
    <>
      <PageHeader title="Delivery Zones" />
      <ZonesClient data={serialized} />
    </>
  );
}
