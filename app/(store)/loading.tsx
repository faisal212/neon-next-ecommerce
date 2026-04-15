/**
 * Intentionally empty. Its presence provides the implicit <Suspense>
 * boundary Next.js needs for dynamic reads (searchParams, cookies, client
 * hooks) on pages inside the (store) group. Returning null avoids a
 * skeleton flash in front of the cached shell.
 */
export default function StoreLoading() {
  return null;
}
