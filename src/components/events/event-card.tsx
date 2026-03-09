import type { LucideIcon } from "lucide-react"
import {
  BrainCircuitIcon,
  CalendarIcon,
  Gamepad2Icon,
  ImageIcon,
  MapPinIcon,
  PartyPopperIcon,
  SparklesIcon,
  TicketIcon,
  TvIcon,
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

const CATEGORY_META: Record<Event["category"], CategoryMeta> = {
  challenge: {
    label: "Challenge",
    icon: Gamepad2Icon,
    badgeClass:
      "bg-amber-200/40 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
    ribbonClass: "bg-gradient-to-r from-amber-500 to-rose-500",
  },
  club: {
    label: "Club Event",
    icon: TvIcon,
    badgeClass:
      "bg-indigo-200/45 text-indigo-900 dark:bg-indigo-400/20 dark:text-indigo-100",
    ribbonClass: "bg-gradient-to-r from-indigo-500 to-fuchsia-500",
  },
  cosplay: {
    label: "Cosplay",
    icon: SparklesIcon,
    badgeClass:
      "bg-pink-200/50 text-pink-900 dark:bg-pink-400/20 dark:text-pink-100",
    ribbonClass: "bg-gradient-to-r from-pink-500 to-violet-500",
  },
  social: {
    label: "Social",
    icon: PartyPopperIcon,
    badgeClass:
      "bg-rose-200/50 text-rose-900 dark:bg-rose-400/20 dark:text-rose-100",
    ribbonClass: "bg-gradient-to-r from-rose-500 to-fuchsia-500",
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
  const meta = CATEGORY_META[event.category]
  const CategoryIcon = meta.icon

  return (
    <Card className="h-full overflow-hidden border-primary/20 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_96%,var(--color-primary)),var(--color-card))] shadow-[0_14px_30px_-26px_var(--color-primary)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_42px_-24px_var(--color-primary)]">
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
          <Badge variant="secondary" className={cn("gap-1.5", meta.badgeClass)}>
            <CategoryIcon className="size-3" aria-hidden />
            {meta.label}
          </Badge>
          {event.featured ? (
            <Badge className="tracking-[0.12em] uppercase">Featured</Badge>
          ) : null}
        </div>
        <CardTitle>
          <h3 className="text-lg font-semibold">{event.title}</h3>
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border border-border/70 bg-muted/35 p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="size-4" aria-hidden />
            <time dateTime={event.startDateTime}>
              {formatDateTime(event.startDateTime)}
            </time>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="size-4" aria-hidden />
            <span>{event.location}</span>
          </div>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label={`${event.title} tags`}>
          {event.tags.map((tag) => (
            <li key={tag}>
              <Badge
                variant="outline"
                className="border-primary/25 bg-background/70"
              >
                {tag}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-primary/35"
              asChild
            >
              <a href={`/events#${event.slug}`}>Mission details</a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Jump to event details</p>
          </TooltipContent>
        </Tooltip>
        {event.registrationUrl ? (
          <Button size="sm" asChild>
            <a href={event.registrationUrl} target="_blank" rel="noreferrer">
              <TicketIcon className="size-4" aria-hidden />
              Register
            </a>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}
