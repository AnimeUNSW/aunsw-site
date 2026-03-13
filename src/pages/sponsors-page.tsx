import { useMemo, useState } from "react"

import { SponsorTermsNotice } from "@/components/sponsors/sponsor-terms-notice"
import { SponsorsGrid } from "@/components/sponsors/sponsors-grid"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSponsors } from "@/hooks/use-sponsors"
import { hasMemberDiscountOffer } from "@/lib/sponsors"

export function SponsorsPage() {
  const [showDiscountsOnly, setShowDiscountsOnly] = useState(false)
  const sponsors = useSponsors()
  const discountSponsors = useMemo(
    () => sponsors.filter(hasMemberDiscountOffer),
    [sponsors]
  )
  const visibleSponsors = showDiscountsOnly ? discountSponsors : sponsors

  return (
    <div className="page-container space-y-7">
      <PageHeader
        badge="Partners"
        title="Sponsors"
        description="Our sponsors support AnimeUNSW with member discounts, promo offers, and event collaboration."
      />
      <Separator className="page-divider-accent" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {showDiscountsOnly
            ? `Showing ${visibleSponsors.length} sponsors with member discounts.`
            : `Showing all ${sponsors.length} sponsors.`}
        </p>
        <Button
          size="sm"
          variant={showDiscountsOnly ? "default" : "outline"}
          className="border-primary/35"
          onClick={() => setShowDiscountsOnly((value) => !value)}
        >
          {showDiscountsOnly ? "Show all sponsors" : "Member discounts only"}
        </Button>
      </div>
      <SponsorsGrid sponsors={visibleSponsors} />
      <SponsorTermsNotice />
    </div>
  )
}
