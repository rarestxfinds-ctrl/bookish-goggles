import { cn } from "@/Middle/Library/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, active, hoverable = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-[40px] bg-white dark:bg-black border-2 border-black dark:border-white transition-all duration-200",
        hoverable && "group hover:bg-black dark:hover:bg-white hover:border-white dark:hover:border-black",
        active && "bg-black dark:bg-white border-white dark:border-black",
        active && "text-white dark:text-black",
        className
      )}
    >
      {children}
    </div>
  );
}