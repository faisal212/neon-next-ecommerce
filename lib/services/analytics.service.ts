import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sessions, pageViews, productViews, cartEvents, siteSearches } from '@/lib/db/schema/analytics';

export async function createOrResumeSession(sessionToken: string, data: {
  userId?: string;
  ipAddress?: string;
  city?: string;
  province?: string;
  deviceType?: string;
  os?: string;
  browser?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  referrerUrl?: string;
  landingPage?: string;
}) {
  const [existing] = await db.select().from(sessions).where(eq(sessions.sessionToken, sessionToken)).limit(1);

  if (existing) {
    await db.update(sessions).set({ lastActiveAt: new Date() }).where(eq(sessions.id, existing.id));
    return existing;
  }

  const [session] = await db.insert(sessions).values({
    sessionToken,
    userId: data.userId ?? null,
    ipAddress: data.ipAddress ?? null,
    city: data.city ?? null,
    province: data.province ?? null,
    deviceType: data.deviceType ?? null,
    os: data.os ?? null,
    browser: data.browser ?? null,
    utmSource: data.utmSource ?? null,
    utmMedium: data.utmMedium ?? null,
    utmCampaign: data.utmCampaign ?? null,
    utmContent: data.utmContent ?? null,
    referrerUrl: data.referrerUrl ?? null,
    landingPage: data.landingPage ?? null,
  }).returning();

  return session;
}

export async function trackPageView(sessionId: string, data: {
  pageUrl: string;
  pageType?: string;
  entityId?: string;
  timeOnPageSec?: number;
}) {
  const [view] = await db.insert(pageViews).values({
    sessionId,
    pageUrl: data.pageUrl,
    pageType: data.pageType ?? null,
    entityId: data.entityId ?? null,
    timeOnPageSec: data.timeOnPageSec ?? null,
  }).returning();

  return view;
}

export async function trackProductView(sessionId: string, productId: string, variantId?: string) {
  const [view] = await db.insert(productViews).values({
    sessionId,
    productId,
    variantId: variantId ?? null,
  }).returning();

  return view;
}

export async function trackCartEvent(sessionId: string, data: {
  userId?: string;
  variantId: string;
  eventType: string;
  quantity: number;
  pricePkr: string;
}) {
  const [event] = await db.insert(cartEvents).values({
    sessionId,
    userId: data.userId ?? null,
    variantId: data.variantId,
    eventType: data.eventType,
    quantity: data.quantity,
    pricePkr: data.pricePkr,
  }).returning();

  return event;
}

export async function trackSearch(sessionId: string, query: string, resultsCount: number) {
  const [search] = await db.insert(siteSearches).values({
    sessionId,
    query,
    resultsCount,
  }).returning();

  return search;
}
