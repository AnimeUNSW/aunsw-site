import type { Sponsor } from "@/types/content"

import { SponsorCard } from "@/components/sponsors/sponsor-card"

export function SponsorsGrid({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <ul
      className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      aria-label="Sponsors list"
    >
      {sponsors.map((sponsor) => (
        <li key={sponsor.id}>
          <SponsorCard sponsor={sponsor} />
        </li>
      ))}
    </ul>
  )
}
