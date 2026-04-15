// Empty space-holder instead of a skeleton:
//
// A pulsing skeleton in this slot gets streamed into <main> before the real
// hero (the layout is `"use cache"`, so the shell + Suspense fallback lands
// first, then the hero swaps in via React's $RC). Lighthouse/Lantern
// sometimes latched onto the skeleton as the LCP candidate and failed to
// upgrade to the hero, causing intermittent NO_LCP on PSI.
//
// Rendering null fixed LCP but caused CLS 0.93 (no space reserved → footer
// jumped out of viewport when the hero streamed in). A single empty, sized
// div reserves the vertical room without being an LCP candidate (Chrome's
// LCP algorithm ignores elements with no text/image content).
//
// The original skeleton is preserved in `_home-loading-skeleton.tsx`.
export default function HomeLoading() {
  return <div aria-hidden className="min-h-[1800px]" />;
}
