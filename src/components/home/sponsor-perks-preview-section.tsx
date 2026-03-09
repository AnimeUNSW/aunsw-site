import { Link } from "react-router-dom"

import { SponsorsGrid } from "@/components/sponsors/sponsors-grid"
import { SectionHeader } from "@/components/shared/section-header"
import { Button } from "@/components/ui/button"
import type { Sponsor } from "@/types/content"

interface SponsorPerksPreviewSectionProps {
  overview: string
  sponsors: Sponsor[]
}

export function SponsorPerksPreviewSection({
  overview,
  sponsors,
}: SponsorPerksPreviewSectionProps) {
  return (
    <section className="space-y-5" aria-labelledby="sponsor-perks-title">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          badge="Loot Drop"
          title="Sponsor Discounts"
          description={overview}
          className="space-y-2"
        />
        <Button variant="outline" className="border-primary/35" asChild>
          <Link to="/sponsors">View sponsors</Link>
        </Button>
      </div>
      <SponsorsGrid sponsors={sponsors} />
    </section>
  )
}
