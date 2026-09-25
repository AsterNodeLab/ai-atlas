"use client";

import Link from "next/link";
import { track as trackEvent } from "@/lib/analytics";

/** Link that reports `learning_path_start` when it opens the first step of a path. */
export function StartPathLink({
  path,
  track,
  href,
  className,
  children,
}: {
  path: string;
  track: boolean;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => track && trackEvent({ name: "learning_path_start", path })}>
      {children}
    </Link>
  );
}
