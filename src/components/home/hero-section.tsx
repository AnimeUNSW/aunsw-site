import { ChevronDownIcon } from "lucide-react"
import { Link } from "react-router-dom"

import animeCitySunset from "@/assets/anime-city-sunset.jpg"
import { Button } from "@/components/ui/button"
import type { SiteContent } from "@/types/content"

interface HeroSectionProps {
  clubName: string
  hero: SiteContent["hero"]
}

const HERO_SECTION_CLASS =
  "relative w-full min-h-[100svh] overflow-hidden bg-cover bg-center bg-no-repeat"
const HERO_RADIAL_OVERLAY_CLASS =
  "absolute inset-0 bg-[radial-gradient(42rem_24rem_at_18%_22%,color-mix(in_oklab,var(--color-primary)_38%,transparent),transparent_72%),radial-gradient(34rem_20rem_at_82%_72%,color-mix(in_oklab,var(--color-accent)_30%,transparent),transparent_70%)]"
const HERO_DARK_OVERLAY_CLASS =
  "absolute inset-0 bg-gradient-to-b from-black/35 via-black/42 to-black/62"
const HERO_CONTENT_CLASS =
  "relative mx-auto flex min-h-[100svh] max-w-6xl items-center px-4 py-12 md:px-6 md:py-16"
const HERO_PANEL_CLASS =
  "w-full max-w-3xl rounded-3xl border border-white/55 bg-white/72 p-6 shadow-[0_35px_80px_-44px_rgba(6,6,12,0.55)] backdrop-blur-xl backdrop-saturate-150 md:-translate-x-4 md:p-10 dark:border-white/20 dark:bg-white/14"
const HERO_TITLE_CLASS =
  "text-4xl font-bold tracking-tight text-foreground drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)] md:text-6xl dark:text-white dark:drop-shadow-[0_10px_22px_rgba(0,0,0,0.55)]"
const HERO_SUBTITLE_CLASS =
  "mt-2 text-lg font-semibold text-foreground/90 md:text-2xl dark:text-white/92"
const HERO_BODY_CLASS =
  "mt-5 max-w-2xl text-sm text-foreground/80 md:text-base dark:text-white/82"
const HERO_SCROLL_WRAPPER_CLASS =
  "pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center md:bottom-7"
const HERO_SCROLL_BUTTON_CLASS =
  "pointer-events-auto inline-flex size-11 items-center justify-center rounded-full border border-white/55 bg-black/40 text-white shadow-[0_14px_34px_-22px_black] backdrop-blur-sm transition hover:scale-105 hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"

function isExternalHref(href: string) {
  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:")
}

export function HeroSection({ clubName, hero }: HeroSectionProps) {
  const backgroundImage = hero.image ?? animeCitySunset
  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
      }
    : {
        backgroundImage:
          "linear-gradient(118deg,color-mix(in_oklab,var(--color-background)_40%,black),color-mix(in_oklab,var(--color-primary)_45%,black)_48%,color-mix(in_oklab,var(--color-accent)_35%,black))",
      }

  return (
    <section
      className={HERO_SECTION_CLASS}
      style={backgroundStyle}
      aria-label={`${clubName} hero banner`}
    >
      {/* Background gradients */}
      <div className={HERO_RADIAL_OVERLAY_CLASS} />
      <div className={HERO_DARK_OVERLAY_CLASS} />

      {/*  */}
      <div className={HERO_CONTENT_CLASS}>
        <div className={HERO_PANEL_CLASS}>
          <h1 className={HERO_TITLE_CLASS}>
            {clubName}
          </h1>
          <h2 className={HERO_SUBTITLE_CLASS}>
            {hero.title}
          </h2>
          {hero.subtitle ? (
            <p className={HERO_BODY_CLASS}>
              {hero.subtitle}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" className="shadow-[0_18px_34px_-24px_var(--color-primary)]" asChild>
              {isExternalHref(hero.primaryCta.href) ? (
                <a href={hero.primaryCta.href} target="_blank" rel="noreferrer">
                  {hero.primaryCta.label}
                </a>
              ) : (
                <Link to={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
              )}
            </Button>
            <Button size="lg" variant="secondary" className="border border-secondary-foreground/15" asChild>
              {isExternalHref(hero.secondaryCta.href) ? (
                <a href={hero.secondaryCta.href} target="_blank" rel="noreferrer">
                  {hero.secondaryCta.label}
                </a>
              ) : (
                <Link to={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className={HERO_SCROLL_WRAPPER_CLASS}>
        <a
          href="#home-main-sections"
          className={HERO_SCROLL_BUTTON_CLASS}
          aria-label="Scroll down to explore more sections"
        >
          <ChevronDownIcon className="size-5 animate-bounce" aria-hidden />
        </a>
      </div>
    </section>
  )
}
