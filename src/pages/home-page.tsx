import { ClubIntroSection } from "@/components/home/club-intro-section"
import { FeaturedEventsSection } from "@/components/home/featured-events-section"
import { HeroSection } from "@/components/home/hero-section"
import { SponsorPerksPreviewSection } from "@/components/home/sponsor-perks-preview-section"
import { StatsSection } from "@/components/home/stats-section"
import { SocialLinks } from "@/components/shared/social-links"
import { Separator } from "@/components/ui/separator"
import { useFeaturedEvents } from "@/hooks/use-featured-events"
import { useSiteContent } from "@/hooks/use-site-content"
import { useSponsors } from "@/hooks/use-sponsors"

export function HomePage() {
  const siteContent = useSiteContent()
  const featuredEvents = useFeaturedEvents()
  const sponsors = useSponsors().slice(0, 3)

  return (
    <div className="space-y-14">
      <HeroSection hero={siteContent.hero} />
      <ClubIntroSection
        clubDescription={siteContent.clubDescription}
        eventsOverview={siteContent.eventsOverview}
      />
      <StatsSection stats={siteContent.clubStats} />
      <FeaturedEventsSection events={featuredEvents} />
      <SponsorPerksPreviewSection
        overview={siteContent.sponsorPerksOverview}
        sponsors={sponsors}
      />
      <Separator />
      <section
        className="space-y-2 rounded-2xl border border-primary/20 bg-[linear-gradient(140deg,color-mix(in_oklab,var(--color-card)_96%,var(--color-primary)),var(--color-card))] p-5 md:p-7"
        aria-labelledby="social-connect-title"
      >
        <h2 id="social-connect-title" className="text-xl font-semibold">
          Connect with us
        </h2>
        <p className="text-sm text-muted-foreground">
          Follow announcements and event updates across our channels.
        </p>
        <div className="mt-4">
          <SocialLinks links={siteContent.socialLinks} />
        </div>
      </section>
    </div>
  )
}
