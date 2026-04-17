import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/Middle/Library/utils";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: "sm" | "md" | "lg";
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: {
      root: "w-9 h-5",
      thumb: "w-3 h-3 left-[3px] data-[state=checked]:left-[auto] data-[state=checked]:right-[3px] data-[state=checked]:translate-x-0",
    },
    md: {
      root: "w-11 h-6",
      thumb: "w-4 h-4 left-[4px] data-[state=checked]:left-[auto] data-[state=checked]:right-[4px] data-[state=checked]:translate-x-0",
    },
    lg: {
      root: "w-14 h-7",
      thumb: "w-5 h-5 left-[5px] data-[state=checked]:left-[auto] data-[state=checked]:right-[5px] data-[state=checked]:translate-x-0",
    },
  };

  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full transition-all duration-200 group/switch",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // OFF state
        "bg-white dark:bg-black border-2 border-black dark:border-white",
        // OFF state hover: black background, white border
        "hover:bg-black dark:hover:bg-white",
        "hover:border-white dark:hover:border-black",
        // ON state
        "data-[state=checked]:bg-black dark:data-[state=checked]:bg-white",
        "data-[state=checked]:border-white dark:data-[state=checked]:border-black",
        // ON state hover: white background, black border
        "data-[state=checked]:hover:bg-white dark:data-[state=checked]:hover:bg-black",
        "data-[state=checked]:hover:border-black dark:data-[state=checked]:hover:border-white",
        sizeClasses[size].root,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block rounded-full transition-all duration-200",
          "absolute top-1/2 -translate-y-1/2",
          // OFF state thumb: black
          "bg-black dark:bg-white",
          // OFF state hover: white thumb (when group/switch is hovered)
          "group-hover/switch:bg-white dark:group-hover/switch:bg-black",
          // ON state thumb: white
          "data-[state=checked]:bg-white dark:data-[state=checked]:bg-black",
          // ON state hover: black thumb (when group/switch is hovered)
          "data-[state=checked]:group-hover/switch:bg-black dark:data-[state=checked]:group-hover/switch:bg-white",
          sizeClasses[size].thumb
        )}
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = "Switch";

export { Switch };