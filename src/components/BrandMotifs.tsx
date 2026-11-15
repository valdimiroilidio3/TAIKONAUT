import React from "react";

/**
 * Official Taikonaut wordmark (hand-drawn, from the brand's own store).
 * The source file is white; `adaptive` inverts it on light backgrounds.
 */
export function TaikonautLogo({
  className = "h-6 w-auto",
  tone = "adaptive",
}: {
  className?: string;
  tone?: "adaptive" | "white" | "black";
}) {
  const toneClass =
    tone === "adaptive" ? "logo-adaptive" : tone === "black" ? "invert" : "";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/brand/taikonaut-wordmark.png"
      alt="Taikonaut"
      width={1930}
      height={694}
      className={`${className} ${toneClass} select-none`}
      draggable={false}
    />
  );
}
