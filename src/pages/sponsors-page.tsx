import { SponsorTermsNotice } from "@/components/sponsors/sponsor-terms-notice"
import { SponsorsGrid } from "@/components/sponsors/sponsors-grid"
import { PageHeader } from "@/components/shared/page-header"
import { Separator } from "@/components/ui/separator"
import { useSponsors } from "@/hooks/use-sponsors"

export function SponsorsPage() {
  const sponsors = useSponsors()

  return (
    <div className="space-y-7">
      <PageHeader
        badge="Partners"
        title="Sponsors"
        description="Our sponsors support AnimeUNSW with member discounts, promo offers, and event collaboration."
      />
      <Separator className="bg-gradient-to-r from-primary/30 via-accent/40 to-transparent" />
      <SponsorsGrid sponsors={sponsors} />
      <SponsorTermsNotice />
    </div>
  )
}
