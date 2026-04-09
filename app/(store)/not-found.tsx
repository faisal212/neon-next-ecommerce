import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
      {/* Large 404 */}
      <p className="text-[10rem] font-black leading-none text-surface-container-highest md:text-[14rem]">
        404
      </p>

      {/* Subtitle */}
      <h1 className="-mt-4 text-3xl font-black tracking-tight md:text-5xl">
        Page Not Found
      </h1>

      {/* Description */}
      <p className="mt-4 max-w-md text-on-surface-variant leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>

      {/* CTA */}
      <Link
        href="/"
        className="kinetic-gradient mt-10 inline-block rounded-lg px-12 py-5 text-sm font-black uppercase tracking-widest text-on-primary-fixed transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        Back to Home
      </Link>

      {/* Search suggestion */}
      <p className="mt-6 text-sm text-on-surface-variant">
        Or try{" "}
        <Link
          href="/search"
          className="font-bold text-primary hover:underline"
        >
          searching for what you need
        </Link>
      </p>
    </section>
  );
}
