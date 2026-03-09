import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClubIntroSectionProps {
  clubDescription: string
  eventsOverview: string
}

export function ClubIntroSection({
  clubDescription,
  eventsOverview,
}: ClubIntroSectionProps) {
  return (
    <section
      aria-labelledby="club-overview-title"
      className="grid gap-4 md:grid-cols-2"
    >
      <Card className="border-primary/20 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-card)_94%,var(--color-primary)),var(--color-card))]">
        <CardHeader>
          <CardTitle
            id="club-overview-title"
            className="text-xs tracking-[0.16em] text-muted-foreground uppercase"
          >
            About the Club
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm md:text-base">{clubDescription}</p>
        </CardContent>
      </Card>
      <Card className="border-accent/25 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-accent)),var(--color-card))]">
        <CardHeader>
          <CardTitle className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            What to Expect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm md:text-base">{eventsOverview}</p>
        </CardContent>
      </Card>
    </section>
  )
}
