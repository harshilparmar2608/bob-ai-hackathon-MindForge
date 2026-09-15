import React, { useEffect, useRef, useState } from "react";

export const CustomCursor: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isOnTextInput, setIsOnTextInput] = useState(false);

  // Direct DOM references for zero-lag requestAnimationFrame movement
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Position state tracked for requestAnimationFrame
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Check for fine pointer (desktop mouse/trackpad) and reduced-motion preference
    const finePointerMedia = window.matchMedia("(pointer: fine)");
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

    const checkSupport = () => {
      return finePointerMedia.matches && !reducedMotionMedia.matches;
    };

    if (!checkSupport()) {
      setIsEnabled(false);
      document.documentElement.classList.remove("custom-cursor-enabled");
      return;
    }

    setIsEnabled(true);
    document.documentElement.classList.add("custom-cursor-enabled");

    // Clickable elements detection helper
    const isClickable = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      const clickableSelector =
        'button, a, input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="switch"], select, label, summary, [data-clickable], .cursor-pointer';
      if (el.matches(clickableSelector) || el.closest(clickableSelector)) {
        return true;
      }
      try {
        const computed = window.getComputedStyle(el);
        if (computed.cursor === "pointer") return true;
      } catch {
        // Ignore
      }
      return false;
    };

    // Text input detection helper - exempt from custom cursor
    const isTextInput = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      if (tag === "textarea" || tag === "pre" || tag === "code") return true;
      if (el.isContentEditable) return true;
      if (tag === "input") {
        const type = (el.getAttribute("type") || "text").toLowerCase();
        return ["text", "email", "password", "search", "number", "tel", "url"].includes(type);
      }
      if (el.closest("input, textarea, [contenteditable='true'], pre, code")) {
        return true;
      }
      return false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      // Make visible once cursor enters window
      setIsVisible(true);

      const target = e.target as HTMLElement | null;

      // Check text input state
      const onInput = isTextInput(target);
      setIsOnTextInput(onInput);

      // Check clickable state (only if not on text input)
      if (!onInput) {
        setIsHovered(isClickable(target));
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setIsClicked(true);
      }
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // requestAnimationFrame animation loop with smooth lerp easing
    const render = () => {
      const { x: targetX, y: targetY } = mousePos.current;

      // Direct tracking for pinpoint dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }

      // Smooth lerp easing for follower ring (~0.18 for silky responsive follow)
      ringPos.current.x += (targetX - ringPos.current.x) * 0.18;
      ringPos.current.y += (targetY - ringPos.current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    rafId.current = requestAnimationFrame(render);

    return () => {
      document.documentElement.classList.remove("custom-cursor-enabled");
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  if (!isEnabled) return null;

  // Fade out custom cursor when outside window or on text inputs/code blocks
  const isHidden = !isVisible || isOnTextInput;

  return (
    <div
      id="custom-cursor"
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none transition-opacity duration-150"
      style={{ opacity: isHidden ? 0 : 1 }}
      aria-hidden="true"
    >
      {/* Outer Follower Ring - IBM Blue with smooth easing */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full border transition-all duration-200 ease-out will-change-transform ${
          isHovered
            ? "w-12 h-12 border-[#0F62FE] bg-[#0F62FE]/15 shadow-[0_0_12px_rgba(15,98,254,0.35)]"
            : isClicked
            ? "w-7 h-7 border-[#0F62FE] bg-[#0F62FE]/25 scale-90"
            : "w-8 h-8 border-[#0F62FE]/70 bg-[#0F62FE]/5"
        }`}
        style={{
          borderWidth: isHovered ? "1.75px" : "1.5px",
        }}
      />

      {/* Center Target Dot - Sharp Instant Follower */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full bg-[#0F62FE] shadow-[0_0_8px_#0F62FE] transition-transform duration-100 ease-out will-change-transform ${
          isClicked
            ? "w-1.5 h-1.5 scale-75"
            : isHovered
            ? "w-2 h-2 scale-125"
            : "w-1.5 h-1.5"
        }`}
      />
    </div>
  );
};
