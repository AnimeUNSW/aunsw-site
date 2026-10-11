import { useEffect, useState } from "react"
import {
  CalendarClockIcon,
  CheckIcon,
  LinkIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react"
import { Link } from "react-router-dom"

import { WeeklyAvailabilityGrid } from "@/components/applications/weekly-availability-grid"
import { ActionNotice } from "@/components/shared/action-notice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { interviewTime, portfolioLabel } from "@/lib/application-display"
import {
  getInterviewPlan,
  saveInterviewAvailability,
  type Interviewer,
  type InterviewPlan,
} from "@/lib/applications-api"

const dayNames: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
}
const fieldClass =
  "rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring"

export function InterviewPlanner({ windowId }: { windowId: string }) {
  const [plan, setPlan] = useState<InterviewPlan | null>(null)
  const [slots, setSlots] = useState<string[] | null>(null)
  const [duration, setDuration] = useState(30)
  const [panelSize, setPanelSize] = useState(2)
  const [refresh, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [editing, setEditing] = useState(false)
  const [viewing, setViewing] = useState<Interviewer | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    void getInterviewPlan(windowId, duration, panelSize, controller.signal)
      .then((loaded) => {
        if (controller.signal.aborted) return
        setPlan(loaded)
        const saved =
          loaded.interviewers.find(
            (member) => member.discord_id === loaded.viewer_discord_id
          )?.slots ?? []
        setSlots((current) => current ?? saved)
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "The interview plan could not be loaded."
          )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [windowId, duration, panelSize, refresh])

  async function save() {
    if (!slots) return
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      await saveInterviewAvailability(windowId, slots)
      setDirty(false)
      setEditing(false)
      setNotice(
        slots.length
          ? "Your interview availability was saved. Recommendations have been refreshed."
          : "Your availability was cleared. You will no longer be recommended for interviews in this window."
      )
      setRefresh((value) => value + 1)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Availability could not be saved."
      )
    } finally {
      setSaving(false)
    }
  }

  async function copyPlannerLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/admin/applications/${windowId}/interviews`
      )
      setNotice(
        "Planner link copied. Share it with Executives and Directors so they can add their availability."
      )
    } catch {
      setNotice(
        "Copy this page's address to share the planner with Executives and Directors."
      )
    }
  }

  if (!plan)
    return (
      <div className="space-y-4">
        {error ? (
          <>
            <ActionNotice kind="error">{error}</ActionNotice>
            <Button
              variant="outline"
              onClick={() => setRefresh((value) => value + 1)}
            >
              Try again
            </Button>
          </>
        ) : (
          <p role="status" className="py-12 text-muted-foreground">
            Loading interview planner…
          </p>
        )}
      </div>
    )
  const me = plan.interviewers.find(
    (member) => member.discord_id === plan.viewer_discord_id
  )
  const open = plan.window.status === "open"
  const ready = plan.interviewers.filter((member) => member.slots.length)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{plan.window.name}</h2>
          <p className="text-sm text-muted-foreground">
            Weekly times in Sydney · Monday–Sunday, 9 am–6 pm
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => void copyPlannerLink()}>
            <LinkIcon data-icon="inline-start" />
            Copy planner link
          </Button>
          <Badge variant={open ? "default" : "secondary"}>
            {open ? "Open window" : "Archived · read-only"}
          </Badge>
        </div>
      </div>
      {!open ? (
        <p className="rounded-xl border bg-muted/30 p-4 text-sm">
          This window is archived. Existing availability can be viewed, but
          cannot be changed.
        </p>
      ) : null}
      {notice ? <ActionNotice kind="success">{notice}</ActionNotice> : null}
      {error ? (
        <div className="space-y-2">
          <ActionNotice kind="error">{error}</ActionNotice>
          <Button
            variant="outline"
            onClick={() => setRefresh((value) => value + 1)}
          >
            Retry loading plan
          </Button>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Submitted applicants", plan.summary.applicants],
          ["Interviewers available", ready.length],
          [
            "Recommended interviews",
            `${plan.summary.recommended} / ${plan.summary.applicants}`,
          ],
        ].map(([label, count]) => (
          <Card key={label}>
            <CardContent>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-primary/30">
        <CardHeader className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Your availability</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {me?.name ?? "Your Discord account"} ·{" "}
              {me?.portfolios.length
                ? me.portfolios.map(portfolioLabel).join(", ")
                : "No portfolio linked yet"}
            </p>
          </div>
          {open ? (
            <Button
              variant="outline"
              aria-expanded={editing}
              onClick={() => setEditing((value) => !value)}
            >
              {editing ? "Hide grid" : "Edit availability"}
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {me?.slots.length
              ? `${me.slots.length} half-hour slots saved for this window.`
              : "Add your times to be included in the recommendations."}{" "}
            You can only change your own availability.
          </p>
          {!me?.linked ? (
            <p className="rounded-lg border bg-muted/30 p-3 text-sm">
              You can still interview applicants. To give your portfolio
              priority,{" "}
              <Link
                className="font-medium text-primary underline"
                to="/admin/team"
              >
                link your Discord user ID to your Meet the Team card
              </Link>
              .
            </p>
          ) : null}
          {editing ? (
            <>
              <WeeklyAvailabilityGrid
                value={slots ?? []}
                readOnly={!open || saving}
                onChange={(value) => {
                  setSlots(value)
                  setDirty(true)
                  setNotice(null)
                }}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {dirty
                    ? "Unsaved changes — recommendations still use your last saved availability."
                    : "Recommendations use saved availability."}
                </p>
                <Button
                  onClick={() => void save()}
                  disabled={saving || !open || !dirty}
                >
                  {saving
                    ? "Saving…"
                    : slots?.length
                      ? "Save my availability"
                      : "Save cleared availability"}
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-5 text-primary" />
            Interviewing team
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Only current Executives and Directors are eligible. Everyone should
            sign in and save their own times for this window.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plan.interviewers.map((member) => (
              <button
                type="button"
                key={member.discord_id}
                onClick={() => setViewing(member)}
                className="rounded-xl border bg-muted/10 p-4 text-left hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <p className="font-medium">
                  {member.name}
                  {member.discord_id === plan.viewer_discord_id ? " (you)" : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  @{member.username}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {member.portfolios.map((portfolio) => (
                    <Badge key={portfolio} variant="outline">
                      {portfolioLabel(portfolio)}
                    </Badge>
                  ))}
                  <Badge
                    variant={member.slots.length ? "secondary" : "outline"}
                  >
                    {member.slots.length
                      ? `${member.slots.length} slots saved`
                      : "Awaiting availability"}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <section className="space-y-4" aria-labelledby="recommendations-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="recommendations-title"
              className="flex items-center gap-2 text-2xl font-semibold"
            >
              <CalendarClockIcon className="size-6 text-primary" />
              Recommended interviews
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Portfolio coverage first, then balanced workload. More constrained
              applicants are placed first.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-xs text-muted-foreground">
              Interview length
              <select
                className={fieldClass}
                value={duration}
                disabled={loading}
                onChange={(event) => setDuration(Number(event.target.value))}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs text-muted-foreground">
              Panel size
              <select
                className={fieldClass}
                value={panelSize}
                disabled={loading}
                onChange={(event) => setPanelSize(Number(event.target.value))}
              >
                <option value={1}>1 interviewer</option>
                <option value={2}>2 interviewers</option>
              </select>
            </label>
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => setRefresh((value) => value + 1)}
            >
              <RefreshCwIcon data-icon="inline-start" />
              {loading ? "Refreshing…" : "Refresh plan"}
            </Button>
          </div>
        </div>
        <p className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
          Draft suggestions, not bookings. No invitations or emails are sent.
          This is a weekly availability plan, not a dated calendar; confirm the
          actual date with everyone. The matching heuristic avoids overlaps
          within this draft, but does not guarantee an optimal schedule. Refresh
          after other interviewers update their times.
        </p>
        <div
          className={loading || error ? "space-y-3 opacity-50" : "space-y-3"}
          aria-busy={loading}
        >
          {plan.recommendations.map((item) => (
            <Card
              key={item.id}
              className={
                item.status === "unmatched" ? "border-destructive/25" : ""
              }
            >
              <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <div>
                  <Link
                    className="font-semibold hover:text-primary"
                    to={`/admin/applications/responses?window=${windowId}&applicant=${item.id}`}
                  >
                    {item.name}
                  </Link>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.portfolios.map((portfolio) => (
                      <Badge key={portfolio} variant="outline">
                        {portfolioLabel(portfolio)}
                      </Badge>
                    ))}
                  </div>
                </div>
                {item.status === "recommended" ? (
                  <>
                    <div>
                      <p className="font-medium">
                        {dayNames[item.day ?? ""]} · {interviewTime(item.start)}
                        –{interviewTime(item.end)}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckIcon className="size-3" />
                        {item.matched_portfolios.length
                          ? `Portfolio match: ${item.matched_portfolios.map(portfolioLabel).join(", ")}`
                          : "Other-portfolio panel · shared availability"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {item.interviewers.map((member) => (
                        <p key={member.discord_id} className="text-sm">
                          {member.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            @{member.username}
                          </span>
                        </p>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2">
                    <Badge variant="outline">Needs arranging</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!plan.recommendations.length ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Submitted applications will appear here. Drafts and withdrawn
                applications are not included.
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
      <Dialog
        open={viewing !== null}
        onOpenChange={(value) => {
          if (!value) setViewing(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{viewing?.name} — saved availability</DialogTitle>
            <DialogDescription>
              Read-only availability for this application window.
            </DialogDescription>
          </DialogHeader>
          <WeeklyAvailabilityGrid value={viewing?.slots ?? []} readOnly />
        </DialogContent>
      </Dialog>
    </div>
  )
}
