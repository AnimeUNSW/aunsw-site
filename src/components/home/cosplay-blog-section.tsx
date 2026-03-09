import { useEffect, useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SectionHeader } from "@/components/shared/section-header"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { CosplayBlogEntry } from "@/types/content"

interface CosplayBlogSectionProps {
  entries: CosplayBlogEntry[]
}

const AUTOPLAY_MS = 5000

function getSafeIndex(index: number, length: number) {
  if (length === 0) {
    return 0
  }

  return (index + length) % length
}

function getObjectPosition(entry: CosplayBlogEntry) {
  return `${entry.portrait.focusX}% ${entry.portrait.focusY}%`
}

function getObjectScale(entry: CosplayBlogEntry) {
  return `scale(${entry.portrait.zoom / 100})`
}

export function CosplayBlogSection({ entries }: CosplayBlogSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeSafeIndex = getSafeIndex(activeIndex, entries.length)

  useEffect(() => {
    if (entries.length <= 1) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => getSafeIndex(current + 1, entries.length))
    }, AUTOPLAY_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [entries.length])

  const activeEntry = useMemo(
    () => entries[activeSafeIndex],
    [entries, activeSafeIndex]
  )

  if (entries.length === 0 || !activeEntry) {
    return null
  }

  const handleNext = () => {
    setActiveIndex((current) => getSafeIndex(current + 1, entries.length))
  }

  const handlePrevious = () => {
    setActiveIndex((current) => getSafeIndex(current - 1, entries.length))
  }

  return (
    <section className="space-y-5" aria-labelledby="cosplay-blog-title">
      <SectionHeader
        badge="Cosplay Blog"
        title="HobbyCon Character Spotlight"
        description="Dynamic cosplay portraits from the AnimeUNSW group frame, cycling through featured character looks."
      />

      <Card className="overflow-hidden border-primary/25 bg-[linear-gradient(140deg,color-mix(in_oklab,var(--color-card)_96%,var(--color-primary)),var(--color-card))] p-0">
        <div className="grid md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="relative overflow-hidden border-b border-border/60 md:border-r md:border-b-0">
            <div className="relative aspect-[4/5] bg-black/40">
              <img
                src={activeEntry.portrait.image}
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-xl"
                style={{
                  objectPosition: getObjectPosition(activeEntry),
                }}
              />

              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className={cn(
                    "absolute inset-[6%_12%] overflow-hidden rounded-[1.7rem] border border-border/45 shadow-[0_18px_55px_-20px_rgba(0,0,0,0.7)] transition-[clip-path,filter,opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[clip-path,filter,opacity,transform]",
                    index === activeSafeIndex
                      ? "portrait-morph-in z-20 [transform:scale(1)_rotate(0deg)] opacity-100 [filter:blur(0px)_saturate(1.08)_hue-rotate(0deg)] [clip-path:polygon(0%_0%,100%_0%,100%_100%,0%_100%)]"
                      : "pointer-events-none z-10 [transform:scale(1.12)_rotate(-1.6deg)] opacity-0 [filter:blur(16px)_saturate(1.38)_hue-rotate(-12deg)] [clip-path:polygon(11%_19%,83%_8%,95%_35%,91%_78%,70%_95%,24%_91%,5%_66%,8%_31%)]"
                  )}
                  aria-hidden={index !== activeSafeIndex}
                >
                  <img
                    src={entry.portrait.image}
                    alt={entry.portrait.alt}
                    className="h-full w-full object-cover brightness-[1.04] contrast-[1.08] saturate-[1.2]"
                    loading="lazy"
                    style={{
                      objectPosition: getObjectPosition(entry),
                      transformOrigin: getObjectPosition(entry),
                      transform: getObjectScale(entry),
                    }}
                  />
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 transition-[opacity,filter,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      index === activeSafeIndex
                        ? "portrait-glow-shift opacity-100 [filter:saturate(1.06)]"
                        : "[transform:scale(1.03)] opacity-0 [filter:blur(6px)_saturate(1.25)]",
                      "bg-[radial-gradient(circle_at_20%_18%,rgba(255,120,220,0.35),transparent_58%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.55))]"
                    )}
                  />
                </div>
              ))}

              <div className="absolute top-3 right-3">
                <Badge className="gap-1.5 bg-background/85 text-foreground shadow-sm backdrop-blur-sm">
                  <SparklesIcon className="size-3" aria-hidden />
                  {activeEntry.characterAlias}
                </Badge>
              </div>

              <div className="absolute right-3 bottom-3 left-3 rounded-xl border border-border/50 bg-background/75 p-3 backdrop-blur-sm">
                <p className="text-xs tracking-[0.14em] text-muted-foreground uppercase">
                  Active portrait
                </p>
                <p className="text-sm font-medium">{activeEntry.title}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 md:p-7">
            <div
              key={activeEntry.id}
              className="space-y-3 data-[active=true]:animate-in data-[active=true]:fade-in-0 data-[active=true]:slide-in-from-bottom-2"
              data-active
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="tracking-[0.14em] uppercase"
                >
                  {activeEntry.role}
                </Badge>
                <Badge variant="outline" className="border-primary/30">
                  Posted {formatDate(activeEntry.publishedAt)}
                </Badge>
              </div>
              <h3 className="text-2xl leading-tight font-semibold">
                {activeEntry.title}
              </h3>
              <p className="text-sm text-muted-foreground md:text-base">
                {activeEntry.excerpt}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-primary/35"
                onClick={handlePrevious}
                aria-label="Show previous portrait"
              >
                <ChevronLeftIcon className="size-4" aria-hidden />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/35"
                onClick={handleNext}
                aria-label="Show next portrait"
              >
                Next
                <ChevronRightIcon className="size-4" aria-hidden />
              </Button>
            </div>

            <ul
              className="grid gap-2 sm:grid-cols-2"
              aria-label="Cosplay spotlight entries"
            >
              {entries.map((entry, index) => {
                const isActive = index === activeSafeIndex

                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        "w-full rounded-lg border p-2 text-left text-sm transition-all",
                        isActive
                          ? "border-primary/50 bg-primary/15"
                          : "border-border/70 bg-background/50 hover:border-primary/30 hover:bg-primary/8"
                      )}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <p className="font-medium">{entry.characterAlias}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.role}
                      </p>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </Card>
    </section>
  )
}
