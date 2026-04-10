import { type NextRequest, connection } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

type RevalidateBody =
  | { tag: string }
  | {
      slug: string;
      type: "product" | "collection" | "homepage" | "search" | "static";
    };

function isValidSecret(provided: string | null): boolean {
  const expected = process.env.REVALIDATION_SECRET;
  if (!expected || !provided) return false;

  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(providedBuf, expectedBuf);
}

function resolveTag(body: RevalidateBody): string | null {
  if ("tag" in body && typeof body.tag === "string" && body.tag.length > 0) {
    return body.tag;
  }

  if (
    "slug" in body &&
    typeof body.slug === "string" &&
    body.slug.length > 0 &&
    "type" in body
  ) {
    switch (body.type) {
      case "product":
        return `product-${body.slug}`;
      case "collection":
        return `collection-${body.slug}`;
      case "homepage":
        return "homepage";
      case "search":
        return `search-${body.slug}`;
      case "static":
        return `static-${body.slug}`;
      default:
        return null;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  await connection();
  const headerSecret = request.headers.get("x-revalidate-secret");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const provided = headerSecret ?? querySecret;

  if (!isValidSecret(provided)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RevalidateBody;
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tag = resolveTag(body);
  if (!tag) {
    return Response.json(
      {
        error:
          "Body must be { tag: string } or { slug: string, type: 'product' | 'collection' | 'homepage' | 'search' | 'static' }",
      },
      { status: 400 },
    );
  }

  // Immediate expiration — the caller is explicitly requesting a cache bust
  // after a mutation and expects the next request to see fresh data.
  revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: true, tag, now: Date.now() });
}
