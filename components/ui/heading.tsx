import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const headingVariants = cva("leading-6", {
  variants: {
    size: {
      sm: "text-xl",
      md: "text-2xl",
      lg: "text-3xl",
      xl: "text-4xl",
      "2xl": "text-5xl",
      "3xl": "text-6xl",
      "4xl": "text-4xl",
      default: "text-2xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

function Heading({
  className,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"h2"> &
  VariantProps<typeof headingVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "h2";

  return (
    <Comp
      data-slot="text"
      className={cn(headingVariants({ size, className }))}
      {...props}
    />
  );
}

export { Heading, headingVariants };
