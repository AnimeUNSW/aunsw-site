import { formatDate } from "@/lib/format"
import type { ClubStats } from "@/types/content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClubIntroSectionProps {
  clubDescription: string
  stats: ClubStats
}

interface StatItem {
  label: string
  value: string | number
}

export function ClubIntroSection({ clubDescription, stats }: ClubIntroSectionProps) {
  const items: StatItem[] = [
    { label: "Events this year", value: stats.eventsThisYear },
    { label: "Active Since", value: stats.activeSince },
    { label: "Instagram Followers", value: stats.memberCount },
    { label: "Discord members", value: stats.sponsorCount },
  ]

  return (
    <section
      aria-labelledby="club-overview-title"
      className="grid items-stretch gap-4 md:grid-cols-2"
    >
      <Card className="h-full border-primary/30 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-card)_94%,var(--color-primary)),var(--color-card))] shadow-[0_20px_42px_-30px_var(--color-primary)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_56px_-30px_var(--color-primary)]">
        <CardHeader>
          <CardTitle
            id="club-overview-title"
            className="text-xs tracking-[0.16em] text-muted-foreground uppercase"
          >
            About the Club
          </CardTitle>
        </CardHeader>
        <CardContent className="grow">
          <p className="text-sm md:text-base">{clubDescription}</p>
        </CardContent>
      </Card>
      <Card className="h-full border-accent/35 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-accent)),var(--color-card))] shadow-[0_20px_42px_-30px_var(--color-accent)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_56px_-30px_var(--color-accent)]">
        <CardHeader>
          <CardTitle className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Club Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="grow">
          <dl className="grid grid-cols-2 gap-3" aria-label="Club membership stats">
            {items.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border/60 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-background)_88%,var(--color-accent)),var(--color-background))] p-3 shadow-[0_14px_26px_-20px_var(--color-primary)]"
              >
                <dt className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                  {item.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-primary">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Updated {formatDate(stats.lastUpdated)}
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
