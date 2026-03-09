import { ImageIcon, SparklesIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { SiteContent } from "@/types/content"

interface HeroSectionProps {
  hero: SiteContent["hero"]
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/25 bg-[linear-gradient(120deg,color-mix(in_oklab,var(--color-primary)_14%,transparent),color-mix(in_oklab,var(--color-accent)_10%,transparent))] p-6 shadow-[0_24px_45px_-30px_var(--color-primary)] md:p-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(18rem_10rem_at_85%_10%,color-mix(in_oklab,var(--color-accent)_30%,transparent),transparent_70%)]" />
      <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-5">
          <Badge className="w-fit gap-1.5 tracking-[0.12em] uppercase">
            <SparklesIcon className="size-3" aria-hidden />
            {hero.badge}
          </Badge>
          <h1 className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-5xl">
            {hero.title}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            {hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              className="shadow-[0_12px_28px_-20px_var(--color-primary)]"
              asChild
            >
              <Link to={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
            </Button>
            <Button
              variant="outline"
              className="border-primary/35 bg-background/70"
              asChild
            >
              <Link to={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>
        <div className="w-full max-w-xs rounded-2xl border border-accent/40 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_92%,var(--color-accent)),var(--color-card))] p-5 shadow-[0_20px_38px_-30px_var(--color-accent)] md:ml-auto">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                Hero photo
              </p>
              <div className="overflow-hidden rounded-xl border border-primary/25">
                {hero.image ? (
                  <img
                    src={hero.image}
                    alt={hero.imageAlt ?? "AnimeUNSW hero photo"}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted/50 text-xs tracking-[0.12em] text-muted-foreground uppercase">
                    <ImageIcon className="mr-2 size-4" aria-hidden />
                    Add hero photo
                  </div>
                )}
              </div>
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-xs tracking-[0.16em] text-muted-foreground uppercase">
                Weekly focus
              </p>
              <ul className="space-y-2.5 text-sm">
                <li className="flex gap-2">
                  <span
                    className="mt-1 size-2 rounded-full bg-primary"
                    aria-hidden
                  />
                  Watch parties and seasonal premieres
                </li>
                <li className="flex gap-2">
                  <span
                    className="mt-1 size-2 rounded-full bg-accent"
                    aria-hidden
                  />
                  Trivia and challenge nights
                </li>
                <li className="flex gap-2">
                  <span
                    className="mt-1 size-2 rounded-full bg-secondary"
                    aria-hidden
                  />
                  Cosplay-friendly community events
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
