import { ChevronDownIcon, SparklesIcon } from "lucide-react"
import { Link } from "react-router-dom"

import animeCitySunset from "@/assets/anime-city-sunset.jpg"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { SiteContent } from "@/types/content"

interface HeroSectionProps {
  clubName: string
  hero: SiteContent["hero"]
}

export function HeroSection({ clubName, hero }: HeroSectionProps) {
  const backgroundStyle = animeCitySunset
    ? {
        backgroundImage: `url(${animeCitySunset})`,
      }
    : {
        backgroundImage:
          "linear-gradient(118deg,color-mix(in_oklab,var(--color-background)_40%,black),color-mix(in_oklab,var(--color-primary)_45%,black)_48%,color-mix(in_oklab,var(--color-accent)_35%,black))",
      }

  return (
    <section
      className="relative left-1/2 min-h-[78svh] w-screen -translate-x-1/2 overflow-hidden bg-cover bg-center bg-no-repeat md:min-h-[100svh]"
      style={backgroundStyle}
      aria-label={`${clubName} hero banner`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(42rem_24rem_at_18%_22%,color-mix(in_oklab,var(--color-primary)_38%,transparent),transparent_72%),radial-gradient(34rem_20rem_at_82%_72%,color-mix(in_oklab,var(--color-accent)_30%,transparent),transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/42 to-black/62" />

      <div className="relative mx-auto flex min-h-[78svh] max-w-6xl items-center px-4 py-14 md:min-h-[100svh] md:px-6 md:py-20">
        <div className="w-full max-w-3xl rounded-3xl border border-white/55 bg-white/72 p-6 shadow-[0_35px_80px_-44px_rgba(6,6,12,0.55)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/20 dark:bg-white/14 md:-translate-x-4 md:p-10">
          <Badge className="mb-5 w-fit gap-1.5 border border-white/45 bg-white/70 text-foreground tracking-[0.12em] uppercase dark:border-white/20 dark:bg-white/20 dark:text-white">
            <SparklesIcon className="size-3" aria-hidden />
            {hero.badge}
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight text-foreground drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)] dark:text-white dark:drop-shadow-[0_10px_22px_rgba(0,0,0,0.55)] md:text-6xl">
            {clubName}
          </h1>
          <h2 className="mt-2 text-lg font-semibold text-foreground/90 dark:text-white/92 md:text-2xl">
            {hero.title}
          </h2>
          <p className="mt-5 max-w-2xl text-sm text-foreground/80 dark:text-white/82 md:text-base">
            {hero.subtitle}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="shadow-[0_18px_34px_-24px_var(--color-primary)]"
              asChild
            >
              <Link to="/info">Join Now</Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="border border-secondary-foreground/15"
              asChild
            >
              <Link to="/events">Events</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center md:bottom-7">
        <a
          href="#home-main-sections"
          className="pointer-events-auto inline-flex size-11 items-center justify-center rounded-full border border-primary-foreground/35 bg-black/35 text-primary-foreground shadow-[0_14px_34px_-22px_black] backdrop-blur-sm transition hover:scale-105 hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Scroll down to explore more sections"
        >
          <ChevronDownIcon className="size-5 animate-bounce" aria-hidden />
        </a>
      </div>
    </section>
  )
}
