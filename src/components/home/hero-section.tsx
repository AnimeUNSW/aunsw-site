import { useEffect, useRef, type CSSProperties } from "react"
import { ChevronDownIcon } from "lucide-react"
import { Link } from "react-router-dom"

import heroBackground from "@/assets/banner/hero-background.webp"
import heroCharacter from "@/assets/banner/hero-character.png"
import { Button } from "@/components/ui/button"
import type { SiteContent } from "@/types/content"

interface HeroSectionProps {
  clubName: string
  hero: SiteContent["hero"]
}

const HERO_SECTION_CLASS =
  "relative min-h-[100svh] w-full overflow-hidden bg-black"
const HERO_BACKGROUND_CLASS =
  "pointer-events-none absolute inset-0 size-full object-cover object-center"
const HERO_RADIAL_OVERLAY_CLASS =
  "pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(42rem_24rem_at_18%_22%,color-mix(in_oklab,var(--color-primary)_38%,transparent),transparent_72%),radial-gradient(34rem_20rem_at_82%_72%,color-mix(in_oklab,var(--color-accent)_30%,transparent),transparent_70%)]"
const HERO_DARK_OVERLAY_CLASS =
  "pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-black/42 to-black/62"
const HERO_CHARACTER_POINTER_CLASS =
  "hero-character-pointer hero-character-reveal pointer-events-none absolute inset-0 z-20"
const HERO_CHARACTER_CLASS =
  "hero-character-idle absolute inset-0 size-full max-w-none object-cover object-center"
const HERO_CONTENT_CLASS =
  "relative z-30 mx-auto flex min-h-[100svh] max-w-6xl items-center px-4 py-12 md:px-6 md:py-16"
const HERO_PANEL_CLASS =
  "w-full max-w-3xl rounded-3xl border border-white/55 bg-white/72 p-6 shadow-[0_35px_80px_-44px_rgba(6,6,12,0.55)] backdrop-blur-xl backdrop-saturate-150 md:-translate-x-4 md:p-10 lg:-translate-x-6 xl:-translate-x-20 dark:border-white/20 dark:bg-white/14"
const HERO_TITLE_CLASS =
  "text-4xl font-bold tracking-tight text-foreground drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)] md:text-6xl dark:text-white dark:drop-shadow-[0_10px_22px_rgba(0,0,0,0.55)]"
const HERO_SUBTITLE_CLASS =
  "mt-2 text-lg font-semibold text-foreground/90 md:text-2xl dark:text-white/92"
const HERO_BODY_CLASS =
  "mt-5 max-w-2xl text-sm text-foreground/80 md:text-base dark:text-white/82"
const HERO_SCROLL_WRAPPER_CLASS =
  "pointer-events-none absolute inset-x-0 bottom-5 z-40 flex justify-center md:bottom-7"
const HERO_SCROLL_BUTTON_CLASS =
  "pointer-events-auto inline-flex size-11 items-center justify-center rounded-full border border-white/55 bg-black/40 text-white shadow-[0_14px_34px_-22px_black] backdrop-blur-sm transition hover:scale-105 hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"

function isExternalHref(href: string) {
  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:")
}

const HERO_POINTER_STYLE = {
  "--hero-pointer-x": "0px",
  "--hero-pointer-y": "0px",
} as CSSProperties

export function HeroSection({ clubName, hero }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const characterLayerRef = useRef<HTMLDivElement>(null)
  const usesMatchedArtwork = !hero.image

  useEffect(() => {
    const section = sectionRef.current
    const characterLayer = characterLayerRef.current

    if (!usesMatchedArtwork || !section || !characterLayer) {
      return
    }

    if (typeof window.matchMedia !== "function") {
      return
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    )
    const finePointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    )
    let animationFrameId: number | null = null
    let currentX = 0
    let currentY = 0
    let targetX = 0
    let targetY = 0

    const writePosition = () => {
      characterLayer.style.setProperty("--hero-pointer-x", `${currentX}px`)
      characterLayer.style.setProperty("--hero-pointer-y", `${currentY}px`)
    }

    const animateTowardTarget = () => {
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12

      if (
        Math.abs(targetX - currentX) < 0.01 &&
        Math.abs(targetY - currentY) < 0.01
      ) {
        currentX = targetX
        currentY = targetY
        writePosition()
        animationFrameId = null
        return
      }

      writePosition()
      animationFrameId = window.requestAnimationFrame(animateTowardTarget)
    }

    const requestPositionUpdate = () => {
      if (animationFrameId === null) {
        animationFrameId = window.requestAnimationFrame(animateTowardTarget)
      }
    }

    const resetPosition = () => {
      targetX = 0
      targetY = 0
      requestPositionUpdate()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotionQuery.matches || !finePointerQuery.matches) {
        return
      }

      const bounds = section.getBoundingClientRect()
      if (bounds.width === 0 || bounds.height === 0) {
        return
      }

      const normalizedX = Math.max(
        -1,
        Math.min(
          1,
          (event.clientX - (bounds.left + bounds.width / 2)) /
            (bounds.width / 2)
        )
      )
      const normalizedY = Math.max(
        -1,
        Math.min(
          1,
          (event.clientY - (bounds.top + bounds.height / 2)) /
            (bounds.height / 2)
        )
      )

      targetX = normalizedX * 8
      targetY = normalizedY * 5
      requestPositionUpdate()
    }

    const onMotionPreferenceChange = () => {
      if (reducedMotionQuery.matches || !finePointerQuery.matches) {
        targetX = 0
        targetY = 0
        currentX = 0
        currentY = 0
        writePosition()
      }
    }

    section.addEventListener("pointermove", onPointerMove, { passive: true })
    section.addEventListener("pointerleave", resetPosition)
    reducedMotionQuery.addEventListener("change", onMotionPreferenceChange)
    finePointerQuery.addEventListener("change", onMotionPreferenceChange)

    return () => {
      section.removeEventListener("pointermove", onPointerMove)
      section.removeEventListener("pointerleave", resetPosition)
      reducedMotionQuery.removeEventListener("change", onMotionPreferenceChange)
      finePointerQuery.removeEventListener("change", onMotionPreferenceChange)

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [usesMatchedArtwork])

  return (
    <section
      ref={sectionRef}
      className={HERO_SECTION_CLASS}
      aria-label={`${clubName} hero banner`}
    >
      <img
        src={hero.image ?? heroBackground}
        alt=""
        aria-hidden
        className={HERO_BACKGROUND_CLASS}
        data-testid="hero-background"
      />

      {/* Background gradients */}
      <div className={HERO_RADIAL_OVERLAY_CLASS} />
      <div className={HERO_DARK_OVERLAY_CLASS} />

      {usesMatchedArtwork ? (
        <div
          ref={characterLayerRef}
          className={HERO_CHARACTER_POINTER_CLASS}
          style={HERO_POINTER_STYLE}
          aria-hidden
          data-testid="hero-character-layer"
        >
          <img
            src={heroCharacter}
            alt=""
            className={HERO_CHARACTER_CLASS}
            draggable={false}
          />
        </div>
      ) : null}

      <div className={HERO_CONTENT_CLASS}>
        <div className={HERO_PANEL_CLASS}>
          <h1 className={HERO_TITLE_CLASS}>{clubName}</h1>
          <h2 className={HERO_SUBTITLE_CLASS}>{hero.title}</h2>
          {hero.subtitle ? (
            <p className={HERO_BODY_CLASS}>{hero.subtitle}</p>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="shadow-[0_18px_34px_-24px_var(--color-primary)]"
              asChild
            >
              {isExternalHref(hero.primaryCta.href) ? (
                <a href={hero.primaryCta.href} target="_blank" rel="noreferrer">
                  {hero.primaryCta.label}
                </a>
              ) : (
                <Link to={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
              )}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="border border-secondary-foreground/15"
              asChild
            >
              {isExternalHref(hero.secondaryCta.href) ? (
                <a
                  href={hero.secondaryCta.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {hero.secondaryCta.label}
                </a>
              ) : (
                <Link to={hero.secondaryCta.href}>
                  {hero.secondaryCta.label}
                </Link>
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
