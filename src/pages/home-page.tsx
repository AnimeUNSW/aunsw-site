import { Link } from "react-router-dom"
import { SparklesIcon, UsersRoundIcon } from "lucide-react"

import { EventCard } from "@/components/events/event-card"
import { ClubIntroSection } from "@/components/home/club-intro-section"
import { StatsSection } from "@/components/home/stats-section"
import { SectionHeader } from "@/components/shared/section-header"
import { SocialLinks } from "@/components/shared/social-links"
import { SponsorCard } from "@/components/sponsors/sponsor-card"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFeaturedEvents } from "@/hooks/use-featured-events"
import { useSiteContent } from "@/hooks/use-site-content"
import { useSponsors } from "@/hooks/use-sponsors"
import { useTeamProfiles } from "@/hooks/use-team-profiles"

const HOME_MODULE_BASE =
  "mb-7 break-inside-avoid rounded-[1.65rem] border p-5 shadow-[0_18px_34px_-26px_var(--color-primary)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_44px_-26px_var(--color-primary)] md:p-6"

export function HomePage() {
  const siteContent = useSiteContent()
  const featuredEvents = useFeaturedEvents().slice(0, 2)
  const sponsors = useSponsors().slice(0, 3)
  const teamPreview = useTeamProfiles().slice(0, 5)
  const heroBackground = siteContent.hero.image
    ? `linear-gradient(112deg, rgba(9, 3, 15, 0.68), rgba(27, 7, 26, 0.48) 42%, rgba(71, 13, 53, 0.36) 100%), url(${siteContent.hero.image})`
    : "linear-gradient(125deg,color-mix(in_oklab,var(--color-primary)_26%,transparent),color-mix(in_oklab,var(--color-accent)_18%,transparent),color-mix(in_oklab,var(--color-background)_88%,black))"

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 px-4 md:px-8 xl:px-12 2xl:px-16">
      <div className="relative overflow-hidden rounded-[2rem] border border-border/55 bg-[radial-gradient(58rem_24rem_at_-8%_-12%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_66%),radial-gradient(52rem_24rem_at_108%_-8%,color-mix(in_oklab,var(--color-accent)_18%,transparent),transparent_64%),linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_92%,black),var(--color-background))] p-4 md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,color-mix(in_oklab,var(--color-border)_35%,transparent)_0_1px,transparent_1px_14px)] opacity-55" />

        <div className="relative">
          <section
            className="relative mb-7 flex min-h-[40vh] overflow-hidden rounded-[1.85rem] border border-primary/30 md:min-h-[55vh]"
            aria-labelledby="home-hero-banner-title"
            style={{
              backgroundImage: heroBackground,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(58rem_24rem_at_84%_8%,rgba(255,114,230,0.2),transparent_70%),radial-gradient(52rem_30rem_at_12%_100%,rgba(160,85,255,0.22),transparent_66%)]" />
            <span className="sr-only">
              {siteContent.hero.imageAlt ?? "AnimeUNSW hero banner image"}
            </span>

            <div className="relative mt-auto w-full p-6 md:p-10">
              <div className="max-w-3xl space-y-5">
                <Badge className="w-fit gap-1.5 tracking-[0.12em] uppercase">
                  <SparklesIcon className="size-3" aria-hidden />
                  {siteContent.hero.badge}
                </Badge>
                <h1
                  id="home-hero-banner-title"
                  className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)] md:text-5xl"
                >
                  {siteContent.hero.title}
                </h1>
                <p className="max-w-2xl text-base text-white/90 md:text-lg">
                  {siteContent.hero.subtitle}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="shadow-[0_16px_30px_-20px_var(--color-primary)]"
                    asChild
                  >
                    <Link to={siteContent.hero.primaryCta.href}>
                      {siteContent.hero.primaryCta.label}
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/50 bg-black/30 text-white hover:bg-white/20 hover:text-white"
                    asChild
                  >
                    <Link to={siteContent.hero.secondaryCta.href}>
                      {siteContent.hero.secondaryCta.label}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="columns-1 [column-gap:1.75rem] md:columns-2 xl:columns-3">
          <article
            className={`${HOME_MODULE_BASE} border-primary/25 bg-[linear-gradient(155deg,color-mix(in_oklab,var(--color-card)_93%,var(--color-primary)),var(--color-card))]`}
          >
            <ClubIntroSection
              clubDescription={siteContent.clubDescription}
              eventsOverview={siteContent.eventsOverview}
            />
          </article>

          <article
            className={`${HOME_MODULE_BASE} border-accent/30 bg-[linear-gradient(170deg,color-mix(in_oklab,var(--color-card)_94%,var(--color-accent)),var(--color-card))]`}
          >
            <StatsSection stats={siteContent.clubStats} />
          </article>

          <article
            className={`${HOME_MODULE_BASE} border-primary/25 bg-[linear-gradient(165deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-primary)),var(--color-card))]`}
          >
            <section
              className="space-y-5"
              aria-labelledby="home-featured-events-title"
            >
              <div className="flex flex-col gap-3">
                <SectionHeader
                  badge="Next Arc"
                  title="Featured Events"
                  description="Highlights from the current term schedule."
                  className="space-y-2"
                />
                <Button
                  variant="outline"
                  className="w-fit border-primary/35"
                  asChild
                >
                  <Link to="/events">See all events</Link>
                </Button>
              </div>
              <ul className="space-y-4" id="home-featured-events-title">
                {featuredEvents.map((event) => (
                  <li key={event.id}>
                    <EventCard event={event} />
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <article
            className={`${HOME_MODULE_BASE} border-accent/30 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-accent)),var(--color-card))]`}
          >
            <section
              className="space-y-5"
              aria-labelledby="home-sponsor-perks-title"
            >
              <div className="flex flex-col gap-3">
                <SectionHeader
                  badge="Loot Drop"
                  title="Sponsor Discounts"
                  description={siteContent.sponsorPerksOverview}
                  className="space-y-2"
                />
                <Button
                  variant="outline"
                  className="w-fit border-primary/35"
                  asChild
                >
                  <Link to="/sponsors">View sponsors</Link>
                </Button>
              </div>
              <ul className="space-y-4" id="home-sponsor-perks-title">
                {sponsors.map((sponsor) => (
                  <li key={sponsor.id}>
                    <SponsorCard sponsor={sponsor} />
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <article
            className={`${HOME_MODULE_BASE} border-primary/25 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-primary)),var(--color-card))]`}
          >
            <section
              className="space-y-4"
              aria-labelledby="home-team-preview-title"
            >
              <SectionHeader
                badge="Committee"
                title="Faces Behind AnimeUNSW"
                description="Quick preview of this term's executives and directors."
                className="space-y-2"
              />
              <AvatarGroup aria-label="Meet the Team preview">
                {teamPreview.map((profile) => (
                  <Avatar
                    key={profile.id}
                    size="lg"
                    className="ring-2 ring-primary/30"
                    title={`${profile.name} - ${profile.role}`}
                  >
                    <AvatarImage
                      src={profile.portraitImage}
                      alt={profile.portraitAlt}
                    />
                    <AvatarFallback>{profile.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <div className="flex flex-wrap gap-2">
                <Button className="gap-1.5" asChild>
                  <Link to="/team">
                    <UsersRoundIcon className="size-4" aria-hidden />
                    Meet the team
                  </Link>
                </Button>
                <Button variant="outline" className="border-primary/35" asChild>
                  <Link to="/info">Membership Info</Link>
                </Button>
              </div>
            </section>
          </article>

          <article
            className={`${HOME_MODULE_BASE} border-accent/30 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-card)_94%,var(--color-accent)),var(--color-card))]`}
          >
            <Card className="border-0 bg-transparent shadow-none">
              <section
                className="space-y-4"
                aria-labelledby="home-pathways-title"
              >
                <div className="space-y-2">
                  <Badge
                    variant="secondary"
                    className="tracking-[0.14em] uppercase"
                  >
                    Interactive
                  </Badge>
                  <h2
                    id="home-pathways-title"
                    className="text-2xl font-semibold"
                  >
                    Choose your anime arc
                  </h2>
                  <p className="text-sm text-muted-foreground md:text-base">
                    Pick a quick path based on what you want to do next.
                  </p>
                </div>

                <Tabs defaultValue="new">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="new">New member</TabsTrigger>
                    <TabsTrigger value="returning">Returning</TabsTrigger>
                    <TabsTrigger value="partner">Partner</TabsTrigger>
                  </TabsList>
                  <TabsContent value="new" className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Start with membership steps, then jump straight into the
                      next event night.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" asChild>
                        <Link to="/info">How to join</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/35"
                        asChild
                      >
                        <Link to="/events">Upcoming events</Link>
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="returning" className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Catch this term's highlights, browse perks, and reconnect
                      with committee channels.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" asChild>
                        <Link to="/events">View highlights</Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/35"
                        asChild
                      >
                        <Link to="/sponsors">Discount perks</Link>
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="partner" className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Explore club reach and contact the committee for
                      collaborations and sponsor opportunities.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" asChild>
                        <a
                          href={`mailto:${siteContent.contacts[0]?.email ?? "info@animeunsw.org"}`}
                        >
                          Contact committee
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/35"
                        asChild
                      >
                        <Link to="/team">Meet directors</Link>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </section>
            </Card>
          </article>

          <article
            className={`${HOME_MODULE_BASE} border-primary/25 bg-[linear-gradient(140deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-primary)),var(--color-card))]`}
          >
            <section
              className="space-y-3"
              aria-labelledby="social-connect-title"
            >
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4 text-primary" aria-hidden />
                <h2 id="social-connect-title" className="text-xl font-semibold">
                  Connect with us
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Follow announcements and event updates across all AnimeUNSW
                channels.
              </p>
              <div className="pt-1">
                <SocialLinks links={siteContent.socialLinks} />
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  )
}
