import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type ContainerProps = PropsWithChildren & {
  className?: string;
};

export const Container = ({ children, className }: ContainerProps) => {
  return (
    <div className={cn("h-screen flex items-center gap-20", className)}>
      {children}
    </div>
  );
};
