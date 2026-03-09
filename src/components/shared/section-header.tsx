import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  badge?: string
  title: string
  description?: string
  className?: string
}

export function SectionHeader({
  badge,
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {badge ? (
        <Badge
          variant="secondary"
          className="w-fit tracking-[0.14em] uppercase ring-1 ring-primary/25"
        >
          {badge}
        </Badge>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h2>
        <div className="h-px w-24 bg-gradient-to-r from-primary via-accent to-transparent" />
      </div>
      {description ? (
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      ) : null}
    </header>
  )
}
