import {
  CalendarCheckIcon,
  LogOutIcon,
  MessageCircleIcon,
  SettingsIcon,
  SparklesIcon,
  TrophyIcon,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Account } from "@/lib/account-api"

interface AccountDashboardProps {
  account: Account
  isLoggingOut: boolean
  onLogout: () => void
}

const stats = [
  { key: "message_count", label: "Messages sent", icon: MessageCircleIcon },
  { key: "exp", label: "Total XP", icon: SparklesIcon },
  { key: "rank", label: "Server rank", icon: TrophyIcon },
  { key: "events_attended", label: "Events attended", icon: CalendarCheckIcon },
] as const

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function statValue(account: Account, key: (typeof stats)[number]["key"]) {
  const value = account.stats[key]
  if (key === "rank") {
    return value ? `#${value.toLocaleString()}` : "—"
  }
  return (value ?? 0).toLocaleString()
}

export function AccountDashboard({
  account,
  isLoggingOut,
  onLogout,
}: AccountDashboardProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-card via-card to-primary/10 py-0">
        <CardContent className="flex flex-col items-center gap-5 py-6 sm:flex-row">
          <Avatar className="size-24 ring-2 ring-primary/35">
            {account.avatar_url ? (
              <AvatarImage
                src={account.avatar_url}
                alt={`${account.display_name} Discord avatar`}
              />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-xl text-primary-foreground">
              {initials(account.display_name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="truncate text-2xl font-semibold md:text-3xl">
              {account.display_name}
            </h2>
            <p className="truncate text-muted-foreground">
              @{account.username}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
            {account.is_executive ? (
              <Button asChild size="lg">
                <Link to="/admin">
                  <SettingsIcon data-icon="inline-start" />
                  Admin dashboard
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isLoggingOut}
              onClick={onLogout}
            >
              <LogOutIcon data-icon="inline-start" />
              {isLoggingOut ? "Logging out…" : "Log out"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.key}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardDescription>{item.label}</CardDescription>
                  <span className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon aria-hidden />
                  </span>
                </div>
                <CardTitle className="text-3xl font-semibold">
                  {statValue(account, item.key)}
                </CardTitle>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {account.stats.quote ||
      account.stats.mal_profile ||
      account.stats.anilist_profile ? (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {account.stats.quote ? (
              <blockquote className="border-l-2 border-primary pl-4 text-lg">
                {account.stats.quote}
              </blockquote>
            ) : null}
            <div className="flex flex-wrap gap-4">
              {account.stats.mal_profile ? (
                <a
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  href={`https://myanimelist.net/profile/${account.stats.mal_profile}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  MyAnimeList
                </a>
              ) : null}
              {account.stats.anilist_profile ? (
                <a
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  href={`https://anilist.co/user/${account.stats.anilist_profile}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  AniList
                </a>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Messages are counted from 12/09/2026
      </p>
    </div>
  )
}
