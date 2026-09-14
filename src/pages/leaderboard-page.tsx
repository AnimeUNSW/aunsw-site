import { useEffect, useState } from "react"
import { CalendarCheckIcon, LogInIcon, TrophyIcon } from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AuthenticationRequiredError,
  discordLoginUrl,
  getLeaderboard,
  MembershipRequiredError,
  type Leaderboard,
  type LeaderboardSort,
} from "@/lib/account-api"

type LeaderboardState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "ready"; leaderboard: Leaderboard }
  | { status: "error"; message: string }

export function LeaderboardPage() {
  const [sort, setSort] = useState<LeaderboardSort>("xp")
  const [state, setState] = useState<LeaderboardState>({ status: "loading" })

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: "loading" })
    void getLeaderboard(sort, controller.signal)
      .then((leaderboard) => setState({ status: "ready", leaderboard }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (error instanceof AuthenticationRequiredError) {
          setState({ status: "guest" })
          return
        }
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "The leaderboard is temporarily unavailable.",
        })
      })
    return () => controller.abort()
  }, [sort])

  return (
    <div className="page-container space-y-7">
      <PageHeader
        badge="Members"
        title="Server leaderboard"
        description="See how AnimeUNSW members rank by total XP or events attended. Each event attendance is worth 500 XP."
      />

      <Tabs
        value={sort}
        onValueChange={(value) => setSort(value as LeaderboardSort)}
      >
        <TabsList aria-label="Leaderboard ranking">
          <TabsTrigger value="xp">
            <TrophyIcon aria-hidden /> XP
          </TabsTrigger>
          <TabsTrigger value="events">
            <CalendarCheckIcon aria-hidden /> Events attended
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {state.status === "loading" ? (
        <Card aria-live="polite">
          <CardContent className="py-8 text-muted-foreground">
            Loading leaderboard…
          </CardContent>
        </Card>
      ) : null}

      {state.status === "guest" ? (
        <Card className="mx-auto max-w-2xl bg-gradient-to-br from-card via-card to-primary/10">
          <CardContent className="flex flex-col items-center space-y-5 py-10 text-center">
            <TrophyIcon className="size-9 text-primary" aria-hidden />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Members only</h2>
              <p className="text-muted-foreground">
                Sign in with Discord to view the AnimeUNSW server leaderboard.
              </p>
            </div>
            <Button asChild size="lg">
              <a href={discordLoginUrl()}>
                <LogInIcon data-icon="inline-start" /> Sign in with Discord
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {state.status === "ready" ? (
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[38rem] text-left">
                <thead className="border-b text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3 text-center font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 text-right font-medium">XP</th>
                    <th className="px-4 py-3 text-right font-medium">Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {state.leaderboard.entries.map((entry) => {
                    const isViewer =
                      entry.discord_id === state.leaderboard.viewer_discord_id
                    return (
                      <tr
                        key={entry.discord_id}
                        className={isViewer ? "bg-primary/10" : undefined}
                      >
                        <td className="px-4 py-3 text-center text-lg font-semibold tabular-nums">
                          {entry.rank}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar size="lg">
                              {entry.avatar_url ? (
                                <AvatarImage
                                  src={entry.avatar_url}
                                  alt={`${entry.display_name}'s avatar`}
                                />
                              ) : null}
                              <AvatarFallback>
                                {entry.display_name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {entry.display_name}
                                {isViewer ? (
                                  <span className="ml-2 text-xs text-primary">
                                    You
                                  </span>
                                ) : null}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                @{entry.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {entry.xp.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {entry.events_attended.toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {state.leaderboard.entries.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">
                No members have activity recorded yet.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {state.status === "error" ? (
        <Card role="alert">
          <CardContent className="space-y-2 py-8">
            <h2 className="text-xl font-semibold">Leaderboard unavailable</h2>
            <p className="text-muted-foreground">{state.message}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
