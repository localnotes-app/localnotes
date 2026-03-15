import * as React from "react"
import { cn } from "@/lib/utils"

export function Kbd({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground leading-none shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.03)]",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}
