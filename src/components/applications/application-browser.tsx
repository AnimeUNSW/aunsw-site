import { useEffect, useRef, useState } from "react"
import {
  CalendarClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"

import { WeeklyAvailabilityGrid } from "@/components/applications/weekly-availability-grid"
import { ActionNotice } from "@/components/shared/action-notice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  APPLICATION_SECTIONS,
  PORTFOLIOS,
  deleteApplicationWindow,
  getApplicationWindow,
  type ApplicationWindow,
  type ApplicationWindowDetail,
} from "@/lib/applications-api"
import { portfolioLabel } from "@/lib/application-display"

const fieldClass =
  "min-h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
const PAGE_SIZE = 6

export function ApplicationBrowser({
  windows,
  onChanged,
}: {
  windows: ApplicationWindow[]
  onChanged: () => Promise<void>
}) {
  const [params, setParams] = useSearchParams()
  const selectedWindow =
    windows.find((item) => item.id === params.get("window")) ??
    windows.find((item) => item.status === "open") ??
    windows[0]
  const windowId = selectedWindow?.id
  const [loaded, setLoaded] = useState<{
    key: string
    detail?: ApplicationWindowDetail
    error?: string
  }>({ key: "" })
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)
  const requestKey = `${windowId}:${refresh}`
  const detail = loaded.key === requestKey ? (loaded.detail ?? null) : null
  const error = loaded.key === requestKey ? (loaded.error ?? null) : null
  const loading = loaded.key !== requestKey
  const [portfolio, setPortfolio] = useState("all")
  const [status, setStatus] = useState("submitted")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState<number | null>(null)
  const [activeId, setActiveId] = useState<string | null>(
    params.get("applicant")
  )
  const [showQuestions, setShowQuestions] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [deleting, setDeleting] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!windowId) return
    const controller = new AbortController()
    void getApplicationWindow(windowId, controller.signal)
      .then((detail) => {
        if (!controller.signal.aborted) setLoaded({ key: requestKey, detail })
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setLoaded({
            key: requestKey,
            error:
              cause instanceof Error
                ? cause.message
                : "Applications could not be loaded.",
          })
      })
    return () => controller.abort()
  }, [windowId, requestKey])

  const statusApplications = (detail?.applications ?? []).filter(
    (item) => status === "all" || item.status === status
  )
  const filtered = statusApplications.filter(
    (item) =>
      (portfolio === "all" ||
        item.portfolios.some((value) => value === portfolio)) &&
      `${item.full_name} ${item.preferred_name} ${item.username ?? ""} ${item.display_name ?? ""} ${item.membership_number ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const linkedPage = Math.max(
    0,
    Math.floor(filtered.findIndex((item) => item.id === activeId) / PAGE_SIZE)
  )
  const resolvedPage = Math.min(page ?? linkedPage, pages - 1)
  const visible = filtered.slice(
    resolvedPage * PAGE_SIZE,
    (resolvedPage + 1) * PAGE_SIZE
  )
  const active = filtered.find((item) => item.id === activeId) ?? visible[0]
  const activeIndex = filtered.findIndex((item) => item.id === active?.id)

  function chooseApplicant(index: number, scroll = false) {
    const applicant = filtered[index]
    if (!applicant) return
    setActiveId(applicant.id)
    setPage(Math.floor(index / PAGE_SIZE))
    if (scroll && window.innerWidth < 1280)
      requestAnimationFrame(() =>
        detailRef.current?.scrollIntoView({ block: "start" })
      )
  }

  if (!selectedWindow)
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No application windows have been published yet.
        </CardContent>
      </Card>
    )

  return (
    <section className="space-y-5" aria-label="Application browser">
      <Card>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <label className="grid min-w-0 flex-1 gap-2 text-sm font-medium">
            Application window
            <select
              className={fieldClass}
              value={windowId}
              onChange={(event) => {
                setParams({ window: event.target.value })
                setPortfolio("all")
                setQuery("")
                setPage(0)
                setActiveId(null)
              }}
            >
              <optgroup label="Open windows">
                {windows
                  .filter((item) => item.status === "open")
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.application_count ?? 0})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Archived windows">
                {windows
                  .filter((item) => item.status !== "open")
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.application_count ?? 0})
                    </option>
                  ))}
              </optgroup>
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedWindow.status === "open" ? (
              <Button asChild>
                <Link to={`/admin/applications/${windowId}/interviews`}>
                  <CalendarClockIcon data-icon="inline-start" />
                  Arrange interviews
                </Link>
              </Button>
            ) : (
              <Badge variant="secondary">Archived · read-only</Badge>
            )}
            <Button
              variant="outline"
              aria-label="Refresh applications"
              onClick={() => setRefresh((value) => value + 1)}
              disabled={loading}
            >
              <RefreshCwIcon />
            </Button>
            {selectedWindow.status === "closed" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteOpen(true)
                  setConfirmation("")
                  setDeleteError(null)
                }}
              >
                <Trash2Icon data-icon="inline-start" />
                Delete archive
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{selectedWindow.name}</h2>
          <p className="text-sm text-muted-foreground">
            Choose an applicant to read their responses and availability.
          </p>
        </div>
        <Button variant="ghost" onClick={() => setShowQuestions(true)}>
          View form questions
        </Button>
      </div>
      {error ? (
        <div className="space-y-3">
          <ActionNotice kind="error">{error}</ActionNotice>
          <Button
            variant="outline"
            onClick={() => setRefresh((value) => value + 1)}
          >
            Try again
          </Button>
        </div>
      ) : null}
      {loading ? (
        <p className="py-10 text-muted-foreground" role="status">
          Loading applications…
        </p>
      ) : detail ? (
        <>
          <div
            className="flex flex-wrap gap-2"
            aria-label="Filter by portfolio"
          >
            {["all", ...PORTFOLIOS].map((item) => (
              <Button
                key={item}
                size="sm"
                variant={portfolio === item ? "default" : "outline"}
                aria-pressed={portfolio === item}
                onClick={() => {
                  setPortfolio(item)
                  setPage(0)
                  setActiveId(null)
                }}
              >
                {item === "all" ? "All applicants" : portfolioLabel(item)} (
                {item === "all"
                  ? statusApplications.length
                  : statusApplications.filter((app) =>
                      app.portfolios.some((value) => value === item)
                    ).length}
                )
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
            <label className="relative">
              <span className="sr-only">Search applicants</span>
              <SearchIcon className="absolute top-3 left-3 size-4 text-muted-foreground" />
              <input
                className={`${fieldClass} pl-9`}
                placeholder="Name, Discord or membership number"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(0)
                  setActiveId(null)
                }}
              />
            </label>
            <label>
              <span className="sr-only">Application status</span>
              <select
                className={fieldClass}
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(0)
                  setActiveId(null)
                }}
              >
                <option value="submitted">Submitted</option>
                <option value="withdrawn">Withdrawn</option>
                <option value="all">All statuses</option>
              </select>
            </label>
          </div>
          {!filtered.length ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No matching applications. Try a different portfolio, status or
                search.
              </CardContent>
            </Card>
          ) : (
            <div className="grid items-start gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
              <div className="space-y-3 xl:sticky xl:top-24">
                <p className="text-xs text-muted-foreground">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "applicant" : "applicants"} · newest
                  first
                </p>
                {visible.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active?.id === item.id}
                    onClick={() =>
                      chooseApplicant(filtered.indexOf(item), true)
                    }
                    className={`w-full rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-ring ${active?.id === item.id ? "border-primary bg-primary/10" : "bg-card hover:border-primary/40"}`}
                  >
                    <span className="block font-semibold">
                      {item.preferred_name || item.full_name}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {item.username ? `@${item.username}` : item.full_name}
                    </span>
                    <span className="mt-3 flex flex-wrap gap-1">
                      {item.portfolios.map((value) => (
                        <Badge key={value} variant="outline">
                          {portfolioLabel(value)}
                        </Badge>
                      ))}
                      {item.status === "withdrawn" ? (
                        <Badge variant="destructive">Withdrawn</Badge>
                      ) : null}
                    </span>
                  </button>
                ))}
                <div className="flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label="Previous applicant page"
                    disabled={resolvedPage === 0}
                    onClick={() =>
                      chooseApplicant((resolvedPage - 1) * PAGE_SIZE)
                    }
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {resolvedPage + 1} of {pages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label="Next applicant page"
                    disabled={resolvedPage + 1 >= pages}
                    onClick={() =>
                      chooseApplicant((resolvedPage + 1) * PAGE_SIZE)
                    }
                  >
                    <ChevronRightIcon />
                  </Button>
                </div>
              </div>
              {active ? (
                <Card ref={detailRef} className="min-w-0 scroll-mt-24">
                  <CardHeader className="gap-4 border-b">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-2xl">
                          <h3>{active.preferred_name || active.full_name}</h3>
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {active.full_name}
                          {active.username ? ` · @${active.username}` : ""}
                        </p>
                      </div>
                      <Badge
                        variant={
                          active.status === "withdrawn"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {portfolioLabel(active.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Applicant {activeIndex + 1} of {filtered.length}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={activeIndex <= 0}
                          onClick={() => chooseApplicant(activeIndex - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={activeIndex + 1 >= filtered.length}
                          onClick={() => chooseApplicant(activeIndex + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <dl className="grid gap-4 text-sm sm:grid-cols-3">
                      {[
                        ["Year of study", active.year_of_study ?? "—"],
                        ["Membership number", active.membership_number ?? "—"],
                        [
                          "Submitted",
                          active.submitted_at
                            ? new Date(active.submitted_at).toLocaleString(
                                "en-AU"
                              )
                            : "—",
                        ],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="mt-1 font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="flex flex-wrap gap-2">
                      {active.portfolios.map((item) => (
                        <Badge key={item} variant="outline">
                          {portfolioLabel(item)}
                        </Badge>
                      ))}
                    </div>
                    {APPLICATION_SECTIONS.filter(
                      (item) =>
                        item === "general" ||
                        active.portfolios.some((value) => value === item)
                    ).map((item) => {
                      const questions = detail.questions.filter(
                        (question) =>
                          question.section === item &&
                          (!question.fixed_key ||
                            question.fixed_key === "weekly_availability")
                      )
                      return questions.length ? (
                        <section key={item} className="space-y-3">
                          <h3 className="font-semibold">
                            {portfolioLabel(item)}
                          </h3>
                          {questions.map((question) => {
                            const answer = active.answers[question.id]
                            return (
                              <div
                                key={question.id}
                                className="rounded-xl border bg-muted/15 p-4"
                              >
                                <h4 className="text-sm font-medium">
                                  {question.question_text}
                                </h4>
                                {question.answer_type ===
                                "weekly_availability" ? (
                                  <div className="mt-3">
                                    <WeeklyAvailabilityGrid
                                      value={
                                        Array.isArray(answer) ? answer : []
                                      }
                                      readOnly
                                    />
                                  </div>
                                ) : (
                                  <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                                    {Array.isArray(answer)
                                      ? answer.join(", ")
                                      : answer || "No answer"}
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </section>
                      ) : null
                    })}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          )}
        </>
      ) : null}
      <Dialog open={showQuestions} onOpenChange={setShowQuestions}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Published form questions</DialogTitle>
            <DialogDescription>
              These are the question snapshots used for {selectedWindow.name}.
            </DialogDescription>
          </DialogHeader>
          {APPLICATION_SECTIONS.map((section) => (
            <section key={section}>
              <h3 className="font-semibold">{portfolioLabel(section)}</h3>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
                {detail?.questions
                  .filter((question) => question.section === section)
                  .map((question) => (
                    <li key={question.id}>
                      {question.question_text}
                      <span className="block text-xs text-muted-foreground">
                        {question.required ? "Required" : "Optional"} ·{" "}
                        {question.answer_type.replaceAll("_", " ")}
                        {question.options.length
                          ? ` · ${question.options.join(", ")}`
                          : ""}
                      </span>
                    </li>
                  ))}
              </ol>
            </section>
          ))}
        </DialogContent>
      </Dialog>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete archived window?</DialogTitle>
            <DialogDescription>
              This permanently removes this archive and its responses. Type the
              exact name to confirm: {selectedWindow.name}
            </DialogDescription>
          </DialogHeader>
          {deleteError ? (
            <ActionNotice kind="error">{deleteError}</ActionNotice>
          ) : null}
          <label className="grid gap-2 text-sm">
            Window name
            <input
              className={fieldClass}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </label>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={deleting}
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting || confirmation !== selectedWindow.name}
              onClick={() => {
                setDeleting(true)
                void deleteApplicationWindow(selectedWindow.id, confirmation)
                  .then(async () => {
                    setDeleteOpen(false)
                    await onChanged()
                    setParams({})
                  })
                  .catch((cause: unknown) =>
                    setDeleteError(
                      cause instanceof Error
                        ? cause.message
                        : "The archive could not be deleted."
                    )
                  )
                  .finally(() => setDeleting(false))
              }}
            >
              {deleting ? "Deleting…" : "Delete archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
