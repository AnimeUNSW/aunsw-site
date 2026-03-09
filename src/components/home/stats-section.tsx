import { FlameIcon, UsersRoundIcon } from "lucide-react"

import { SectionHeader } from "@/components/shared/section-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import type { ClubStats } from "@/types/content"

interface StatsSectionProps {
  stats: ClubStats
}

interface StatItem {
  label: string
  value: number
}

export function StatsSection({ stats }: StatsSectionProps) {
  const items: StatItem[] = [
    { label: "Members", value: stats.memberCount },
    { label: "Active Years", value: stats.activeYears },
    { label: "Events per Term", value: stats.eventsPerTerm },
    { label: "Sponsor Partners", value: stats.sponsorCount },
  ]

  return (
    <section aria-labelledby="club-stats-title" className="space-y-5">
      <SectionHeader
        badge="Power Level"
        title="Membership Stats"
        description="A quick snapshot of our community and activity this term."
        className="space-y-2"
      />
      <ul
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        id="club-stats-title"
      >
        {items.map((item) => (
          <li key={item.label}>
            <Card className="border-primary/20 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-primary)),var(--color-card))]">
              <CardHeader>
                <CardTitle className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  {item.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{item.value}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="gap-1.5 border-primary/35">
          <UsersRoundIcon className="size-3" aria-hidden />
          Community updated {formatDate(stats.lastUpdated)}
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <FlameIcon className="size-3" aria-hidden />
          Active every week
        </Badge>
      </div>
    </section>
  )
}
