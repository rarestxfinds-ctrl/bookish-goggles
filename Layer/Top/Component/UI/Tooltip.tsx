// Layer/Top/Component/UI/Tooltip.tsx
import { cn } from "@/Middle/Library/utils";
import { ReactNode, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  enabled?: boolean;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
  offset?: number;
}

export function Tooltip({ 
  children, 
  content, 
  enabled = true, 
  className,
  side = "top",
  offset = 12
}: TooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let x = 0;
      let y = 0;
      
      switch (side) {
        case "top":
          x = rect.left + rect.width / 2;
          y = rect.top - offset;
          break;
        case "bottom":
          x = rect.left + rect.width / 2;
          y = rect.bottom + offset;
          break;
        case "left":
          x = rect.left - offset;
          y = rect.top + rect.height / 2;
          break;
        case "right":
          x = rect.right + offset;
          y = rect.top + rect.height / 2;
          break;
      }
      
      setPos({ x, y });
    }
  };

  useEffect(() => {
    if (showTooltip) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      };
    }
  }, [showTooltip, side]);

  if (!enabled || !content) {
    return <>{children}</>;
  }

  const trigger = (
    <span
      ref={triggerRef}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => {
        setShowTooltip(false);
        setPos(null);
      }}
      style={{ display: "inline" }}
    >
      {children}
    </span>
  );

  const tooltipContent = showTooltip && pos && createPortal(
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transform: side === "top" || side === "bottom" ? "translateX(-50%)" : "translateY(-50%)",
        zIndex: 9999,
        pointerEvents: "none",
        maxWidth: "300px",
        minWidth: "100px",
      }}
    >
      <div
        className={cn(
          "px-4 py-2 text-sm rounded-full text-center",  // Changed to rounded-full for maximum rounded corners
          "bg-white dark:bg-black text-black dark:text-white",
          "border-2 border-black dark:border-white",
          "shadow-lg",
          className
        )}
      >
        {content}
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {trigger}
      {tooltipContent}
    </>
  );
}