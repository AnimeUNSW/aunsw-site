import { ExternalLinkIcon, ImageIcon } from "lucide-react"

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
import type { Sponsor } from "@/types/content"

const SPONSOR_CARD_CLASS =
  "relative h-full w-full overflow-hidden border-primary/30 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-accent)),var(--color-card))] shadow-[0_22px_44px_-30px_var(--color-accent)] transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/55 hover:shadow-[0_34px_62px_-30px_var(--color-accent)]"
const SPONSOR_CARD_OVERLAY_CLASS =
  "pointer-events-none absolute inset-0 bg-[radial-gradient(18rem_9rem_at_88%_8%,color-mix(in_oklab,var(--color-primary)_24%,transparent),transparent_70%)]"
const SPONSOR_CARD_RIBBON_CLASS =
  "h-1 w-full bg-gradient-to-r from-primary via-accent to-primary"
const SPONSOR_IMAGE_FRAME_CLASS = "overflow-hidden border-b border-border/60 bg-[#b13f7f]"
const SPONSOR_IMAGE_CLASS = "aspect-[16/10] w-full object-contain p-4"
const SPONSOR_IMAGE_FALLBACK_CLASS =
  "flex aspect-[16/10] w-full items-center justify-center text-xs tracking-[0.12em] text-white/90 uppercase"

export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const promoCode = sponsor.promoCode?.trim()

  return (
    <Card className={SPONSOR_CARD_CLASS}>
      <div
        className={SPONSOR_CARD_OVERLAY_CLASS}
        aria-hidden
      />
      <div
        className={SPONSOR_CARD_RIBBON_CLASS}
        aria-hidden
      />
      <div className={SPONSOR_IMAGE_FRAME_CLASS}>
        {sponsor.image ? (
          <img
            src={sponsor.image}
            alt={sponsor.imageAlt ?? `${sponsor.name} sponsor image`}
            className={SPONSOR_IMAGE_CLASS}
            loading="lazy"
          />
        ) : (
          <div className={SPONSOR_IMAGE_FALLBACK_CLASS}>
            <ImageIcon className="mr-2 size-4" aria-hidden />
            Add sponsor image
          </div>
        )}
      </div>
      <CardHeader className="space-y-3">
        <CardTitle className="text-lg">{sponsor.name}</CardTitle>
        <CardDescription className="leading-relaxed">
          {sponsor.discountDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex grow flex-col gap-3">
        {promoCode ? (
          <div className="rounded-lg border border-accent/35 bg-accent/10 p-3">
            <p className="mb-1 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              Member code
            </p>
            <p className="font-mono text-base font-semibold tracking-[0.2em] text-accent-foreground">
              {promoCode}
            </p>
          </div>
        ) : null}
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
