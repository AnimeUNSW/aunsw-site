import { useSiteContent } from "@/hooks/use-site-content"
import { Separator } from "@/components/ui/separator"
import { SocialLinks } from "@/components/shared/social-links"

export function Footer() {
  const siteContent = useSiteContent()

  return (
    <footer className="border-t border-border/60 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_55%,transparent),color-mix(in_oklab,var(--color-background)_88%,black))]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm tracking-[0.18em] uppercase">
              {siteContent.clubName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Community anime events for UNSW students.
            </p>
          </div>
          <SocialLinks links={siteContent.socialLinks} />
        </div>
        <Separator />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteContent.clubName}. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}
