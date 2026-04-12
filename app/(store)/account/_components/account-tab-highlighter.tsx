"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AccountTabHighlighter() {
  const pathname = usePathname();

  useEffect(() => {
    const tabs = document.querySelectorAll<HTMLElement>(".account-tab[data-href]");
    tabs.forEach((tab) => {
      const href = tab.getAttribute("data-href")!;
      const isActive =
        href === "/account" ? pathname === "/account" : pathname.startsWith(href);
      if (isActive) {
        tab.setAttribute("aria-current", "page");
      } else {
        tab.removeAttribute("aria-current");
      }
    });
  }, [pathname]);

  return null;
}
