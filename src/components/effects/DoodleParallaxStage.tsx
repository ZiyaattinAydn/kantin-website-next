"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type DoodleParallaxStageProps = {
  children: ReactNode;
  className: string;
  movementX?: number;
  movementY?: number;
  disabled?: boolean;
};

export default function DoodleParallaxStage({
  children,
  className,
  movementX = 12,
  movementY = 9,
  disabled = false,
}: DoodleParallaxStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || disabled) return undefined;
    if (typeof window.matchMedia !== "function") return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let animationFrame: number | null = null;
    let isActive = false;
    let isVisible = false;

    const reset = () => {
      isActive = false;
      stage.style.setProperty("--parallax-x", "0px");
      stage.style.setProperty("--parallax-y", "0px");
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isVisible) return;

      const boundsSource = stage.parentElement ?? stage;
      const rect = boundsSource.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        if (isActive) reset();
        return;
      }

      const isInside =
        event.clientX >= rect.left
        && event.clientX <= rect.right
        && event.clientY >= rect.top
        && event.clientY <= rect.bottom;

      if (!isInside) {
        if (isActive) reset();
        return;
      }

      isActive = true;
      const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
      const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;

      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        stage.style.setProperty("--parallax-x", `${(-normalizedX * movementX).toFixed(1)}px`);
        stage.style.setProperty("--parallax-y", `${(-normalizedY * movementY).toFixed(1)}px`);
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
        if (!isVisible && isActive) reset();
      },
      { rootMargin: "120px 0px" },
    );

    observer.observe(stage);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", reset);

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", reset);
    };
  }, [disabled, movementX, movementY]);

  return (
    <div ref={stageRef} aria-hidden="true" className={className}>
      {children}
    </div>
  );
}
