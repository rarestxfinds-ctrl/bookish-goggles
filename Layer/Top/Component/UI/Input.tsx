// Component/UI/Input.tsx
import * as React from "react";
import { cn } from "@/Middle/Library/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full px-4 py-2 text-base rounded-[40px]",
          "bg-white dark:bg-white text-black dark:text-black", // white background always
          "border-2 border-black dark:border-black", // black border always
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-0 focus:border-black", // no green ring
          "disabled:cursor-not-allowed disabled:opacity-50",
          "md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };