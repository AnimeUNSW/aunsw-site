import type { LucideIcon } from "lucide-react"
import {
  ExternalLinkIcon,
  GiftIcon,
  ImageIcon,
  SparklesIcon,
  TicketPercentIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Sponsor } from "@/types/content"

interface TierMeta {
  icon: LucideIcon
  badgeClass: string
  ribbonClass: string
}

const TIER_META: Record<Sponsor["tier"], TierMeta> = {
  community: {
    icon: GiftIcon,
    badgeClass:
      "bg-zinc-200/65 text-zinc-900 dark:bg-zinc-400/20 dark:text-zinc-100",
    ribbonClass: "bg-gradient-to-r from-zinc-500 to-zinc-300",
  },
  diamond: {
    icon: SparklesIcon,
    badgeClass:
      "bg-fuchsia-200/65 text-fuchsia-900 dark:bg-fuchsia-400/25 dark:text-fuchsia-100",
    ribbonClass: "bg-gradient-to-r from-fuchsia-500 to-violet-500",
  },
  gold: {
    icon: GiftIcon,
    badgeClass:
      "bg-amber-200/70 text-amber-950 dark:bg-amber-400/25 dark:text-amber-100",
    ribbonClass: "bg-gradient-to-r from-amber-500 to-orange-500",
  },
  silver: {
    icon: GiftIcon,
    badgeClass:
      "bg-slate-200/70 text-slate-900 dark:bg-slate-400/20 dark:text-slate-100",
    ribbonClass: "bg-gradient-to-r from-slate-500 to-zinc-400",
  },
}

export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const meta = TIER_META[sponsor.tier]
  const TierIcon = meta.icon

  return (
    <Card className="relative h-full w-full overflow-hidden border-primary/30 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-accent)),var(--color-card))] shadow-[0_22px_44px_-30px_var(--color-accent)] transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/55 hover:shadow-[0_34px_62px_-30px_var(--color-accent)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(18rem_9rem_at_88%_8%,color-mix(in_oklab,var(--color-primary)_24%,transparent),transparent_70%)]"
        aria-hidden
      />
      <div className={cn("h-1 w-full", meta.ribbonClass)} aria-hidden />
      <div className="overflow-hidden border-b border-border/60 bg-muted/35">
        {sponsor.image ? (
          <img
            src={sponsor.image}
            alt={sponsor.imageAlt ?? `${sponsor.name} sponsor image`}
            className="aspect-[16/10] w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-muted/60 to-background text-xs tracking-[0.12em] text-muted-foreground uppercase">
            <ImageIcon className="mr-2 size-4" aria-hidden />
            Add sponsor image
          </div>
        )}
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar aria-hidden className="ring-1 ring-primary/35">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
              {sponsor.logoText}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <Badge
              variant="secondary"
              className={cn("gap-1.5 capitalize", meta.badgeClass)}
            >
              <TierIcon className="size-3" aria-hidden />
              {sponsor.tier}
            </Badge>
            <CardTitle className="text-lg">{sponsor.name}</CardTitle>
          </div>
        </div>
        <CardDescription className="leading-relaxed">
          {sponsor.discountDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex grow flex-col gap-3">
        {sponsor.promoCode ? (
          <div className="rounded-lg border border-accent/35 bg-accent/10 p-3">
            <p className="mb-1 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              Member code
            </p>
            <p className="font-mono text-base font-semibold tracking-[0.2em] text-accent-foreground">
              {sponsor.promoCode}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/35 p-2.5 text-sm text-muted-foreground">
            <TicketPercentIcon className="size-4" aria-hidden />
            No promo code required.
          </div>
        )}
        {sponsor.validUntil ? (
          <p className="mt-auto text-xs text-muted-foreground">
            Valid until {formatDate(sponsor.validUntil)}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="mt-auto justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-primary/35"
          asChild
        >
          <a href={sponsor.websiteUrl} target="_blank" rel="noreferrer">
            <ExternalLinkIcon className="size-4" aria-hidden />
            Visit
          </a>
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Terms</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{sponsor.name} terms</DialogTitle>
              <DialogDescription>{sponsor.terms}</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
