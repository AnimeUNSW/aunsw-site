import { useEffect, useMemo, useState, type TouchEventHandler } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import { TeamMemberCard } from "@/components/team/team-member-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { TeamProfile } from "@/types/content"

interface TeamBrowserProps {
  profiles: TeamProfile[]
}

const AUTOPLAY_MS = 6500
const SWIPE_THRESHOLD_PX = 42

function getSafeIndex(index: number, length: number) {
  if (length === 0) {
    return 0
  }

  return (index + length) % length
}

export function TeamBrowser({ profiles }: TeamBrowserProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)

  const portfolioStops = useMemo(() => {
    const stops = new Map<
      string,
      {
        label: string
        index: number
      }
    >()

    profiles.forEach((profile, index) => {
      const existing = stops.get(profile.portfolio)

      if (!existing) {
        stops.set(profile.portfolio, {
          label: profile.portfolio,
          index,
        })
        return
      }

      const existingProfile = profiles[existing.index]
      const profileIsLead =
        profile.membership === "executive" || profile.membership === "top5"
      const existingIsLead =
        existingProfile?.membership === "executive" ||
        existingProfile?.membership === "top5"

      if (profileIsLead && !existingIsLead) {
        stops.set(profile.portfolio, {
          label: profile.portfolio,
          index,
        })
      }
    })

    return [...stops.values()]
  }, [profiles])

  // autoplay effect; whenever profiles length or activeIndex changes we
  // restart the timer so manual navigation resets the countdown.
  useEffect(() => {
    if (profiles.length <= 1) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => getSafeIndex(current + 1, profiles.length))
    }, AUTOPLAY_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [profiles.length, activeIndex])

  const activeSafeIndex = getSafeIndex(activeIndex, profiles.length)

  const executiveCount = profiles.filter(
    (profile) =>
      profile.membership === "executive" || profile.membership === "top5"
  ).length
  const directorCount = profiles.filter(
    (profile) => profile.membership === "director"
  ).length

  const activeProfile = useMemo(
    () => profiles[activeSafeIndex],
    [activeSafeIndex, profiles]
  )

  if (profiles.length === 0 || !activeProfile) {
    return (
      <Card className="rounded-2xl border-primary/25 p-6">
        <p className="text-sm text-muted-foreground">
          Team introductions are coming soon.
        </p>
      </Card>
    )
  }

  const handlePrevious = () => {
    setActiveIndex((current) => getSafeIndex(current - 1, profiles.length))
  }

  const handleNext = () => {
    setActiveIndex((current) => getSafeIndex(current + 1, profiles.length))
  }

  const handleTouchStart: TouchEventHandler<HTMLElement> = (event) => {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null)
  }

  const handleTouchEnd: TouchEventHandler<HTMLElement> = (event) => {
    const endX = event.changedTouches[0]?.clientX

    if (touchStartX === null || typeof endX !== "number") {
      setTouchStartX(null)
      return
    }

    const delta = endX - touchStartX

    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
      if (delta > 0) {
        handlePrevious()
      } else {
        handleNext()
      }
    }

    setTouchStartX(null)
  }

  return (
    <div className="space-y-6">
      <section
        className="rounded-2xl border border-primary/20 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-primary)),var(--color-card))] p-5 md:p-7"
        aria-labelledby="team-intro-title"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="tracking-[0.14em] uppercase">
            Committee
          </Badge>
          <Badge variant="outline" className="border-primary/30">
            {executiveCount} executives
          </Badge>
          <Badge variant="outline" className="border-primary/30">
            {directorCount} directors
          </Badge>
        </div>
        <h2 id="team-intro-title" className="mt-3 text-2xl font-semibold">
          Executive and Director Gallery
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
          Swipe or use buttons to move through one profile at a time. Autoplay
          is enabled, and all intro sheet content stays visible in each frame.
        </p>
      </section>

      <section className="space-y-4" aria-label="Team profile carousel">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {activeSafeIndex + 1}
            </span>{" "}
            of {profiles.length}: {activeProfile.name}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/35"
              onClick={handlePrevious}
              aria-label="Show previous team profile"
            >
              <ChevronLeftIcon className="size-4" aria-hidden />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/35"
              onClick={handleNext}
              aria-label="Show next team profile"
            >
              Next
              <ChevronRightIcon className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-[1.75rem] border border-primary/30 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-primary)),var(--color-card))] shadow-[0_26px_45px_-28px_var(--color-primary)]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(28rem_12rem_at_12%_8%,color-mix(in_oklab,var(--color-accent)_32%,transparent),transparent_70%)]" />
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.2,1,0.22,1)]"
            style={{ transform: `translateX(-${activeSafeIndex * 100}%)` }}
          >
            {profiles.map((profile, index) => {
              const isActive = index === activeSafeIndex

              return (
                <div key={profile.id} className="min-w-full">
                  <div
                    className={cn(
                      "transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.2,1,0.22,1)]",
                      isActive
                        ? "blur-0 [transform:scale(1)_rotate(0deg)] opacity-100"
                        : "[transform:scale(0.985)_rotate(-0.25deg)] opacity-70 blur-[0.5px]"
                    )}
                  >
                    <TeamMemberCard profile={profile} isActive={isActive} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <ul
          className="flex snap-x snap-mandatory justify-center gap-2 overflow-x-auto pb-1"
          aria-label="Jump to team portfolio"
        >
          {portfolioStops.map((portfolioStop) => {
            const isActive = activeProfile.portfolio === portfolioStop.label

            return (
              <li key={portfolioStop.label} className="snap-start">
                <button
                  type="button"
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-all",
                    isActive
                      ? "border-primary/50 bg-primary/20 text-foreground"
                      : "border-border/70 bg-background/50 text-muted-foreground hover:border-primary/35 hover:bg-primary/10 hover:text-foreground"
                  )}
                  onClick={() => setActiveIndex(portfolioStop.index)}
                  aria-current={isActive ? "true" : undefined}
                >
                  {portfolioStop.label}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <SparklesIcon className="size-4" aria-hidden />
        <p>
          Autoplay runs every {Math.round(AUTOPLAY_MS / 1000)} seconds. Swipe on
          touch devices for manual navigation.
        </p>
      </div>
    </div>
  )
}
