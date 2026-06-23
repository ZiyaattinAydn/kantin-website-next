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
};

export default function DoodleParallaxStage({
  children,
  className,
  movementX = 12,
  movementY = 9,
}: DoodleParallaxStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    if (typeof window.matchMedia !== "function") return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    let animationFrame: number | null = null;
    let isActive = false;

    const reset = () => {
      isActive = false;
      stage.style.setProperty("--parallax-x", "0px");
      stage.style.setProperty("--parallax-y", "0px");
    };

    const handlePointerMove = (event: MouseEvent | PointerEvent) => {
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

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", reset);

    return () => {
      if (animationFrame !== null) cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("pointerleave", reset);
    };
  }, [movementX, movementY]);

  return (
    <div ref={stageRef} aria-hidden="true" className={className}>
      {children}
    </div>
  );
}
