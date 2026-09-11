import { useEffect, useState } from "react"
import { LogInIcon, ShieldCheckIcon } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { AccountDashboard } from "@/components/account/account-dashboard"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  API_BASE_URL,
  getAccount,
  logOut,
  MembershipRequiredError,
  type Account,
} from "@/lib/account-api"

type AccountState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "ready"; account: Account }
  | { status: "error"; message: string }

export function AccountPage() {
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<AccountState>({ status: "loading" })
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const notMember = searchParams.get("error") === "not_member"

  useEffect(() => {
    const controller = new AbortController()

    void getAccount(controller.signal)
      .then((account) => {
        setState(account ? { status: "ready", account } : { status: "guest" })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        const message =
          error instanceof MembershipRequiredError
            ? error.message
            : "The account service is temporarily unavailable. Please try again shortly."
        setState({ status: "error", message })
      })

    return () => controller.abort()
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logOut()
      setState({ status: "guest" })
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not log out. Please try again.",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="page-container space-y-7">
      <PageHeader
        badge="Members"
        title="Your account"
        description="Sign in with Discord to view your AnimeUNSW server activity, XP, rank, and event attendance."
      />

      {notMember ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm"
        >
          Join the{" "}
          <a
            className="font-medium underline underline-offset-4"
            href="https://discord.gg/aunsw"
          >
            AnimeUNSW Discord server
          </a>{" "}
          before signing in.
        </div>
      ) : null}

      {state.status === "loading" ? (
        <Card aria-live="polite">
          <CardContent className="py-8 text-muted-foreground">
            Loading your account…
          </CardContent>
        </Card>
      ) : null}

      {state.status === "guest" ? (
        <Card className="mx-auto max-w-2xl bg-gradient-to-br from-card via-card to-primary/10">
          <CardContent className="flex flex-col items-center space-y-6 py-10 text-center">
            <span className="rounded-full bg-primary/10 p-4 text-primary">
              <ShieldCheckIcon className="size-8" aria-hidden />
            </span>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Continue with Discord</h2>
              <p className="text-muted-foreground">
                Access is limited to members of the AnimeUNSW Discord server.
                Your Discord ID links this login to your existing Ibi profile.
              </p>
            </div>
            <Button asChild size="lg">
              <a href={`${API_BASE_URL}/auth/discord/start`}>
                <LogInIcon data-icon="inline-start" />
                Sign in with Discord
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              We count activity totals only. Message content is never stored.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {state.status === "ready" ? (
        <AccountDashboard
          account={state.account}
          isLoggingOut={isLoggingOut}
          onLogout={() => void handleLogout()}
        />
      ) : null}

      {state.status === "error" ? (
        <Card role="alert">
          <CardContent className="space-y-3 py-8">
            <h2 className="text-xl font-semibold">Account unavailable</h2>
            <p className="text-muted-foreground">{state.message}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
