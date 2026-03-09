import type { ComponentType } from "react"
import {
  FacebookIcon,
  InstagramIcon,
  Link2Icon,
  MailIcon,
  MessageCircleIcon,
  YoutubeIcon,
} from "lucide-react"

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
  icon: ComponentType<{ className?: string }>
  fallback: string
}

function makeMailto(value: string) {
  return `mailto:${value}`
}

export function SocialLinks({ links }: { links: SocialLinksModel }) {
  const items: SocialLinkItem[] = [
    {
      id: "discord",
      label: "Discord",
      href: links.discord,
      icon: MessageCircleIcon,
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

  if (links.facebook) {
    items.push({
      id: "facebook",
      label: "Facebook",
      href: links.facebook,
      icon: FacebookIcon,
      fallback: "F",
    })
  }

  if (links.youtube) {
    items.push({
      id: "youtube",
      label: "YouTube",
      href: links.youtube,
      icon: YoutubeIcon,
      fallback: "Y",
    })
  }

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
        const Icon = item.icon
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
                        <Icon className="size-3" />
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
