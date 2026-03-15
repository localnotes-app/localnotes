// components/AppIcon.tsx
'use client'

interface AppIconProps {
  size?: number
  className?: string
}

export function AppIcon({ size = 48, className }: AppIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M14 2H6C4.89 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" className="stroke-foreground" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <path d="M14 2V8H20" className="stroke-foreground" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="9" y="13" width="6" height="5" rx="1" className="fill-foreground"/>
      <path d="M10 13V11C10 10.17 10.67 9.5 11.5 9.5C12.33 9.5 13 10.17 13 11V13" className="stroke-foreground" strokeWidth="1.2" fill="none"/>
    </svg>
  )
}
