import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  badge?: string
  title: string
  description?: string
}

export function PageHeader({ badge, title, description }: PageHeaderProps) {
  return (
    <header className="space-y-5">
      {badge ? (
        <Badge
          variant="secondary"
          className="tracking-[0.14em] uppercase ring-1 ring-primary/25"
        >
          {badge}
        </Badge>
      ) : null}
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        <div className="h-px w-32 bg-gradient-to-r from-primary via-accent to-transparent" />
        {description ? (
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  )
}
