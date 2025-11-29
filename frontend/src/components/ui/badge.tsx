import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary/35 backdrop-blur-md text-primary-foreground border border-primary/60 [a&]:hover:bg-primary/45",
        secondary:
          "bg-secondary/25 backdrop-blur-md text-secondary-foreground border border-border/60 [a&]:hover:bg-secondary/35",
        destructive:
          "bg-destructive/35 backdrop-blur-md text-destructive-foreground border border-destructive/60 [a&]:hover:bg-destructive/45 focus-visible:ring-destructive/20 focus-visible:ring-destructive/40",
        outline:
          "text-foreground backdrop-blur-sm border border-border/60 [a&]:hover:bg-accent/30 [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
