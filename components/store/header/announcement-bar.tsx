export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center px-4 py-2 md:px-6 md:py-2.5">
        <p className="text-center text-[11px] font-semibold leading-snug md:text-xs">
          <span className="md:hidden">
            Rs. 250 advance + baaki COD par
          </span>
          <span className="hidden md:inline">
            Rs. 250 advance + baaki COD par. Order confirm hone ke liye payment screenshot WhatsApp par bhejna hoga.
          </span>
        </p>
      </div>
    </div>
  );
}
