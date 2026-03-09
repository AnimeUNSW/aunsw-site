import { MessageCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DiscordSectionProps {
  overview: string
  inviteUrl: string
}

export function DiscordSection({ overview, inviteUrl }: DiscordSectionProps) {
  return (
    <Card className="border-primary/25 bg-[linear-gradient(140deg,color-mix(in_oklab,var(--color-card)_95%,var(--color-primary)),var(--color-card))]">
      <CardHeader>
        <CardTitle>Discord Community</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{overview}</p>
        <Button asChild>
          <a href={inviteUrl} target="_blank" rel="noreferrer">
            <MessageCircleIcon className="size-4" aria-hidden />
            Join Discord
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
