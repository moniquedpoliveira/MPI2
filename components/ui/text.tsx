import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const textVariants = cva("m-0", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-md",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
      "7xl": "text-7xl",
      default: "text-base",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

function Text({
  className,
  size,
  asChild = false,
  as,
  ...props
}: React.ComponentProps<"p"> &
  VariantProps<typeof textVariants> & {
    asChild?: boolean;
    as?: React.ElementType;
  }) {
  const Comp = asChild ? Slot : as || "p";

  return (
    <Comp
      data-slot="text"
      className={cn(textVariants({ size, className }))}
      {...props}
    />
  );
}

export { Text, textVariants };
