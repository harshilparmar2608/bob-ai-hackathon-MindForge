import React from "react";
import { cn } from "../../lib/utils";

/**
 * CampusPilot brand logo.
 *
 * Renders the transparent graduation-cap mark at an exact square size so the
 * artwork is never stretched, cropped or distorted (`object-contain` with
 * matching width/height). Pass `framed` to mount it inside a white rounded
 * tile — this guarantees brand contrast on both light and dark themes.
 * Pass `interactive` on sidebar / navbar placements for a subtle GPU-cheap
 * hover treatment (slight scale + blue glow, transform/drop-shadow only).
 */

export interface LogoProps {
  /** Outer square size in px (includes the tile when `framed`). */
  size?: number;
  className?: string;
  imgClassName?: string;
  alt?: string;
  /** White rounded tile behind the mark — identical contrast in both themes. */
  framed?: boolean;
  /** Hover animation: slight scale + blue glow (sidebar / navbar only). */
  interactive?: boolean;
  id?: string;
}

export const LOGO_MARK_SRC = "/logo-mark-512.png";
export const LOGO_MARK_SRCSET =
  "/logo-mark-96.png 96w, /logo-mark-128.png 128w, /logo-mark-256.png 256w, /logo-mark-512.png 512w";

export const Logo: React.FC<LogoProps> = ({
  size = 40,
  className,
  imgClassName,
  alt = "CampusPilot",
  framed = false,
  interactive = false,
  id,
}) => {
  const px = Math.max(16, Math.round(size));
  const inner = framed ? Math.max(12, Math.round(px * 0.76)) : px;

  const img = (
    <img
      src={LOGO_MARK_SRC}
      srcSet={LOGO_MARK_SRCSET}
      sizes={`${inner}px`}
      width={inner}
      height={inner}
      alt={alt}
      draggable={false}
      decoding="async"
      loading="eager"
      className={cn(
        "object-contain select-none shrink-0 pointer-events-none",
        "drop-shadow-[0_1px_2px_rgba(15,23,42,0.18)]",
        imgClassName
      )}
      style={{ width: inner, height: inner }}
    />
  );

  if (!framed) {
    return <span id={id} className={cn("inline-flex shrink-0", className)}>{img}</span>;
  }

  return (
    <span
      id={id}
      className={cn(
        "inline-flex items-center justify-center shrink-0 rounded-[28%]",
        "bg-white dark:bg-white",
        "ring-1 ring-gray-200/90 dark:ring-white/20",
        "shadow-[0_2px_8px_rgba(37,99,235,0.14),0_1px_3px_rgba(15,23,42,0.12)]",
        interactive &&
          "transition-all duration-200 ease-out cursor-pointer hover:scale-[1.06] hover:ring-blue-400/50 hover:shadow-[0_0_18px_rgba(37,99,235,0.45),0_2px_8px_rgba(37,99,235,0.25)] active:scale-[1.0]",
        className
      )}
      style={{ width: px, height: px }}
    >
      {img}
    </span>
  );
};