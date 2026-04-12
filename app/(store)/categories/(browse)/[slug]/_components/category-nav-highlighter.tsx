"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function CategoryNavHighlighter() {
  const pathname = usePathname();

  useEffect(() => {
    const links = document.querySelectorAll<HTMLElement>(".category-nav-link[data-href]");
    links.forEach((link) => {
      const href = link.getAttribute("data-href")!;
      if (pathname === href) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }, [pathname]);

  return null;
}
