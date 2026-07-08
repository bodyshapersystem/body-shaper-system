"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ports the original site's `.reveal` → `.in` scroll-reveal animation.
 * Re-runs whenever the route changes so newly mounted page content
 * gets observed too.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.getElementById("siteHeader");
    const onScroll = () => header?.classList.add("scrolled");
    window.addEventListener("scroll", onScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
