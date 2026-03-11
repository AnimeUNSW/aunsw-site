import type { LucideIcon } from "lucide-react"
import {
  BrainCircuitIcon,
  CalendarIcon,
  Gamepad2Icon,
  ImageIcon,
  MapPinIcon,
  SparklesIcon,
  TicketIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"
import type { Event } from "@/types/content"

interface CategoryMeta {
  label: string
  icon: LucideIcon
  badgeClass: string
  ribbonClass: string
}

const CATEGORY_META: Record<
  import("@/types/content").EventCategory,
  CategoryMeta
> = {
  collab: {
    label: "Collab",
    icon: SparklesIcon,
    badgeClass:
      "bg-emerald-200/65 text-emerald-950 dark:bg-emerald-400/20 dark:text-emerald-100",
    ribbonClass: "bg-gradient-to-r from-emerald-500 to-teal-400",
  },
  challenge: {
    label: "Challenge",
    icon: Gamepad2Icon,
    badgeClass:
      "bg-amber-200/40 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
    ribbonClass: "bg-gradient-to-r from-amber-500 to-rose-500",
  },
  cosplay: {
    label: "Cosplay",
    icon: SparklesIcon,
    badgeClass:
      "bg-pink-200/50 text-pink-900 dark:bg-pink-400/20 dark:text-pink-100",
    ribbonClass: "bg-gradient-to-r from-pink-500 to-violet-500",
  },
  past: {
    label: "Past Events",
    icon: CalendarIcon,
    badgeClass:
      "bg-slate-200/70 text-slate-900 dark:bg-slate-400/20 dark:text-slate-100",
    ribbonClass: "bg-gradient-to-r from-slate-500 to-zinc-400",
  },
  weekly: {
    label: "Weekly",
    icon: CalendarIcon,
    badgeClass:
      "bg-sky-200/65 text-sky-950 dark:bg-sky-400/20 dark:text-sky-100",
    ribbonClass: "bg-gradient-to-r from-sky-500 to-cyan-400",
  },
  trivia: {
    label: "Trivia",
    icon: BrainCircuitIcon,
    badgeClass:
      "bg-purple-200/50 text-purple-900 dark:bg-purple-400/20 dark:text-purple-100",
    ribbonClass: "bg-gradient-to-r from-purple-500 to-violet-500",
  },
}

export function EventCard({ event }: { event: Event }) {
  const primaryCategory = event.category[0]
  const meta = CATEGORY_META[primaryCategory]

  return (
    <Card className="relative h-full w-full overflow-hidden border-primary/30 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_96%,var(--color-primary)),var(--color-card))] shadow-[0_22px_44px_-30px_var(--color-primary)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-[0_34px_62px_-30px_var(--color-primary)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(18rem_9rem_at_88%_8%,color-mix(in_oklab,var(--color-accent)_22%,transparent),transparent_70%)]"
        aria-hidden
      />
      <div className={cn("h-1 w-full", meta.ribbonClass)} aria-hidden />
      <div className="overflow-hidden border-b border-border/60 bg-muted/35">
        {event.image ? (
          <img
            src={event.image}
            alt={event.imageAlt ?? `${event.title} event photo`}
            className="aspect-[16/9] w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-muted/60 to-background text-xs tracking-[0.12em] text-muted-foreground uppercase">
            <ImageIcon className="mr-2 size-4" aria-hidden />
            Add event photo
          </div>
        )}
      </div>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {event.featured ? (
            <Badge className="tracking-[0.12em] uppercase">Featured</Badge>
          ) : null}
          {event.category.map((category) => {
            const categoryMeta = CATEGORY_META[category]

            return (
              <Badge
                key={category}
                variant="secondary"
                className={categoryMeta.badgeClass}
              >
                {categoryMeta.label}
              </Badge>
            )
          })}
        </div>
        <CardTitle>
          <h3 className="text-lg font-semibold">{event.title}</h3>
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex grow flex-col">
        <div className="mt-auto space-y-2 rounded-lg border border-border/70 bg-muted/35 p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="size-4" aria-hidden />
            {event.startDateTime ? (
              <time dateTime={event.startDateTime}>
                {formatDateTime(event.startDateTime)}
              </time>
            ) : (
              <span>Schedule TBA</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="size-4" aria-hidden />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto justify-start gap-2">
        {event.registerLink ? (
          <Button size="sm" asChild>
            <a href={event.registerLink} target="_blank" rel="noreferrer">
              <TicketIcon className="size-4" aria-hidden />
              Register
            </a>
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button size="sm" disabled>
                  <TicketIcon className="size-4" aria-hidden />
                  Register
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sorry! You&apos;re unable to register for this event.</p>
            </TooltipContent>
          </Tooltip>
        )}
      </CardFooter>
    </Card>
  )
}
