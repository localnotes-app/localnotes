import * as React from "react"
import { cn } from "@/lib/utils"

export function Kbd({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded border border-[#2a2a2a] bg-[#111] px-1.5 py-0.5 text-[9px] font-mono text-[#555] leading-none",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  )
}
