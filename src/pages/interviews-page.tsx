import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { InterviewPlanner } from "@/components/applications/interview-planner"
import { ActionNotice } from "@/components/shared/action-notice"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { getAccount } from "@/lib/account-api"

export function InterviewsPage() {
  const { windowId } = useParams()
  const [state, setState] = useState<"loading" | "ready" | "denied" | "error">(
    "loading"
  )
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    void getAccount(controller.signal)
      .then((account) => {
        if (!controller.signal.aborted)
          setState(account?.is_admin ? "ready" : "denied")
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            cause instanceof Error
              ? cause.message
              : "The account service could not be reached."
          )
          setState("error")
        }
      })
    return () => controller.abort()
  }, [retry])
  return (
    <div className="page-container space-y-6">
      <Button asChild variant="outline">
        <Link
          to={`/admin/applications/responses${windowId ? `?window=${windowId}` : ""}`}
        >
          Back to applications
        </Link>
      </Button>
      <PageHeader
        badge="Committee admin"
        title="Arrange interviews"
        description="Find shared times and portfolio-matched interview panels."
      />
      {state === "ready" && windowId ? (
        <InterviewPlanner key={windowId} windowId={windowId} />
      ) : state === "denied" ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Access denied</h2>
          <ActionNotice kind="error">
            The AnimeUNSW Executive or Director role is required.
          </ActionNotice>
          <Button asChild>
            <Link to="/account">Go to account</Link>
          </Button>
        </div>
      ) : state === "error" ? (
        <div className="space-y-3">
          <ActionNotice kind="error">{error}</ActionNotice>
          <Button
            onClick={() => {
              setState("loading")
              setRetry((value) => value + 1)
            }}
          >
            Try again
          </Button>
        </div>
      ) : (
        <p role="status" className="py-12 text-muted-foreground">
          Checking admin access…
        </p>
      )}
    </div>
  )
}
