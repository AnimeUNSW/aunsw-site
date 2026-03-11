import type { ComponentType } from "react"
import {
  InstagramIcon,
  Link2Icon,
  MailIcon,
} from "lucide-react"

import discordIconBlack from "@/assets/discord-icon-black.png"
import discordIconWhite from "@/assets/discord-icon-white.png"
import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { SocialLinks as SocialLinksModel } from "@/types/content"

interface SocialLinkItem {
  id: string
  label: string
  href: string
  icon?: ComponentType<{ className?: string }>
  imageSrc?: string
  fallback: string
}

function makeMailto(value: string) {
  return `mailto:${value}`
}

export function SocialLinks({ links }: { links: SocialLinksModel }) {
  const { resolvedTheme } = useTheme()
  const discordIcon =
    resolvedTheme === "dark" ? discordIconWhite : discordIconBlack

  const items: SocialLinkItem[] = [
    {
      id: "discord",
      label: "Discord",
      href: links.discord,
      imageSrc: discordIcon,
      fallback: "D",
    },
    {
      id: "instagram",
      label: "Instagram",
      href: links.instagram,
      icon: InstagramIcon,
      fallback: "I",
    },
    {
      id: "email",
      label: "Email",
      href: makeMailto(links.email),
      icon: MailIcon,
      fallback: "@",
    },
  ]

  if (links.linktree) {
    items.push({
      id: "linktree",
      label: "Linktree",
      href: links.linktree,
      icon: Link2Icon,
      fallback: "L",
    })
  }

  return (
    <ul className="flex flex-wrap gap-2" aria-label="AnimeUNSW social links">
      {items.map((item) => {
        const isMailto = item.href.startsWith("mailto:")

        return (
          <li key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-primary/35 bg-background/70 hover:bg-primary/10"
                  asChild
                >
                  <a
                    href={item.href}
                    target={isMailto ? undefined : "_blank"}
                    rel={isMailto ? undefined : "noreferrer"}
                    aria-label={item.label}
                  >
                    <Avatar
                      size="sm"
                      className="ring-1 ring-primary/25"
                      aria-hidden
                    >
                      <AvatarFallback className="bg-gradient-to-br from-primary/25 to-accent/30">
                        {item.imageSrc ? (
                          <img
                            src={item.imageSrc}
                            alt=""
                            className="size-3 object-contain"
                          />
                        ) : item.icon ? (
                          <item.icon className="size-3" />
                        ) : null}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">{item.fallback}</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          </li>
        )
      })}
    </ul>
  )
}
