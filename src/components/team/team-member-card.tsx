import { InfoIcon, SparklesIcon } from "lucide-react"
import discordIconBlack from "@/assets/discord-icon-black.png"
import discordIconWhite from "@/assets/discord-icon-white.png"

import { useTheme } from "@/components/theme-provider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { TeamProfile } from "@/types/content"

const MEMBERSHIP_STYLES: Record<TeamProfile["membership"], string> = {
  director:
    "bg-violet-200/55 text-violet-950 dark:bg-violet-400/20 dark:text-violet-100",
  executive:
    "bg-fuchsia-200/60 text-fuchsia-950 dark:bg-fuchsia-400/20 dark:text-fuchsia-100",
  top5:
    "bg-fuchsia-200/60 text-fuchsia-950 dark:bg-fuchsia-400/20 dark:text-fuchsia-100",
  other:
    "bg-slate-200/60 text-slate-900 dark:bg-slate-400/20 dark:text-slate-100",
}

function formatMembership(value: TeamProfile["membership"]) {
  if (value === "top5") {
    return "Top 5"
  }
  return value.charAt(0).toUpperCase() + value.slice(1)
}

interface TeamMemberCardProps {
  profile: TeamProfile
  isActive: boolean
}

export function TeamMemberCard({ profile, isActive }: TeamMemberCardProps) {
  const { resolvedTheme } = useTheme()
  const discordIcon =
    resolvedTheme === "dark" ? discordIconWhite : discordIconBlack

  return (
    <article className="grid gap-5 p-4 md:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] md:gap-7 md:p-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/35">
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(18rem_10rem_at_18%_10%,color-mix(in_oklab,var(--color-accent)_35%,transparent),transparent_70%),linear-gradient(180deg,transparent,rgba(0,0,0,0.2))]" />
        <img
          src={profile.portraitImage}
          alt={profile.portraitAlt}
          className={cn(
            "aspect-[4/5] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isActive ? "[transform:scale(1.03)]" : "[transform:scale(1)]"
          )}
          loading="lazy"
        />
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className={cn("gap-1.5", MEMBERSHIP_STYLES[profile.membership])}
          >
            <SparklesIcon className="size-3" aria-hidden />
            {formatMembership(profile.membership)}
          </Badge>
          {profile.pronouns ? (
            <Badge variant="outline" className="border-primary/30">
              {profile.pronouns}
            </Badge>
          ) : null}
          {profile.discordHandle ? (
            <Badge variant="outline" className="border-primary/30">
              <img src={discordIcon} alt="" className="size-3" />
              {profile.discordHandle}
            </Badge>
          ) : null}
        </div>

        <header className="space-y-1">
          <h2 className="text-2xl font-semibold md:text-3xl">{profile.name}</h2>
          <p className="text-base text-foreground/85 md:text-lg">
            {profile.role}
          </p>
        </header>

        <section
          className="space-y-2"
          aria-labelledby={`${profile.id}-bio-carousel`}
        >
          <h3
            id={`${profile.id}-bio-carousel`}
            className="text-sm font-semibold tracking-[0.14em] uppercase"
          >
            Degree
          </h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {profile.degree.map((line, index) => (
              <li key={`${profile.id}-bio-${index}`}>{line}</li>
            ))}
          </ul>
        </section>

        <Separator />

        <section
          className="space-y-2"
          aria-labelledby={`${profile.id}-fun-facts-carousel`}
        >
          <h3
            id={`${profile.id}-fun-facts-carousel`}
            className="text-sm font-semibold tracking-[0.14em] uppercase"
          >
            Fun Facts
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {profile.funFacts.map((line, index) => (
              <li key={`${profile.id}-fun-${index}`}>{line}</li>
            ))}
          </ul>
        </section>

        <Separator />

        <section
          className="space-y-2"
          aria-labelledby={`${profile.id}-fav-anime-carousel`}
        >
          <h3
            id={`${profile.id}-fav-anime-carousel`}
            className="text-sm font-semibold tracking-[0.14em] uppercase"
          >
            Fav Anime
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {profile.favoriteAnime.map((line, index) => (
              <li key={`${profile.id}-anime-${index}`}>{line}</li>
            ))}
          </ul>
        </section>

        {profile.extras?.length ? (
          <>
            <Separator />
            <section
              className="space-y-2"
              aria-labelledby={`${profile.id}-extras-carousel`}
            >
              <h3
                id={`${profile.id}-extras-carousel`}
                className="flex items-center gap-2 text-sm font-semibold tracking-[0.14em] uppercase"
              >
                <InfoIcon className="size-4" aria-hidden />
                Extras
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {profile.extras.map((line, index) => (
                  <li key={`${profile.id}-extra-${index}`}>{line}</li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </div>
    </article>
  )
}
