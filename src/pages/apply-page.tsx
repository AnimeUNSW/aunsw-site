import { useEffect, useMemo, useRef, useState } from "react"
import {
  CheckCircle2Icon,
  Clock3Icon,
  HistoryIcon,
  LoaderCircleIcon,
  SaveIcon,
  SendIcon,
} from "lucide-react"

import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { discordLoginUrl } from "@/lib/account-api"
import {
  ApplicationAccessError,
  PORTFOLIOS,
  getCurrentApplication,
  saveApplicationDraft,
  submitApplication,
  withdrawApplication,
  type ApplicationDraft,
  type ApplicationQuestion,
  type ApplicationRecord,
  type CurrentApplicationResponse,
  type Portfolio,
} from "@/lib/applications-api"

const labels: Record<string, string> = {
  general: "General",
  creatives: "Creatives",
  events: "Events",
  marketing: "Marketing",
  externals: "Externals",
  it: "IT",
}

function SubmittedAnswers({ application }: { application: ApplicationRecord }) {
  if (!application.answer_details?.length) return null
  return (
    <details className="mt-4 text-left">
      <summary className="cursor-pointer text-sm font-medium text-primary">
        View submitted answers
      </summary>
      <div className="mt-3 space-y-3">
        {application.answer_details.map((item, index) => (
          <div
            key={`${item.section}-${index}`}
            className="rounded-lg border bg-muted/20 p-3"
          >
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              {labels[item.section]}
            </p>
            <p className="mt-1 text-sm font-medium">{item.question}</p>
            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
              {Array.isArray(item.answer)
                ? item.answer.join(", ")
                : item.answer}
            </p>
          </div>
        ))}
      </div>
    </details>
  )
}

const emptyDraft: ApplicationDraft = {
  full_name: "",
  preferred_name: "",
  year_of_study: null,
  membership_number: null,
  portfolios: [],
  answers: {},
  confirmation_email: null,
  email_opt_in: false,
}

type LoadState =
  | { status: "loading" }
  | { status: "guest"; message: string }
  | { status: "error"; message: string }
  | { status: "ready"; data: CurrentApplicationResponse }

function inputClass() {
  return "min-h-11 w-full rounded-xl border border-input bg-background/70 px-3 py-2 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: ApplicationQuestion
  value: string | string[] | undefined
  onChange: (value: string | string[]) => void
}) {
  const id = `question-${question.id}`
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {question.question_text}{" "}
        {question.required ? <span className="text-destructive">*</span> : null}
      </label>
      {question.answer_type === "long_text" ? (
        <textarea
          id={id}
          className={`${inputClass()} min-h-32 resize-y`}
          minLength={question.min_length ?? undefined}
          maxLength={question.max_length ?? 4000}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : question.answer_type === "short_text" ? (
        <input
          id={id}
          className={inputClass()}
          minLength={question.min_length ?? undefined}
          maxLength={question.max_length ?? 4000}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : question.allow_multiple ? (
        <div className="grid gap-2 sm:grid-cols-2" id={id}>
          {question.options.map((option) => {
            const selected = Array.isArray(value) && value.includes(option)
            return (
              <label
                key={option}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border bg-card/60 px-3 py-2 text-sm has-checked:border-primary has-checked:bg-primary/10"
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onChange(
                      selected
                        ? (value as string[]).filter((item) => item !== option)
                        : [...(Array.isArray(value) ? value : []), option]
                    )
                  }
                />
                {option}
              </label>
            )
          })}
        </div>
      ) : (
        <select
          id={id}
          className={inputClass()}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Choose an option</option>
          {question.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      )}
      {question.answer_type !== "multiple_choice" &&
      (question.min_length !== null || question.max_length !== null) ? (
        <p className="text-xs text-muted-foreground">
          {question.min_length
            ? `Minimum ${question.min_length} characters`
            : null}
          {question.min_length && question.max_length ? " · " : null}
          {question.max_length
            ? `Maximum ${question.max_length} characters`
            : null}
        </p>
      ) : null}
    </div>
  )
}

export function ApplyPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" })
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft)
  const [page, setPage] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "retry">(
    "saved"
  )
  const [saveAttempt, setSaveAttempt] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const latestDraft = useRef(draft)

  useEffect(() => {
    const controller = new AbortController()
    void getCurrentApplication(controller.signal)
      .then((data) => {
        setState({ status: "ready", data })
        if (data.draft) setDraft({ ...emptyDraft, ...data.draft })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: error instanceof ApplicationAccessError ? "guest" : "error",
          message:
            error instanceof Error
              ? error.message
              : "Applications could not be loaded.",
        })
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    latestDraft.current = draft
    if (!dirty || state.status !== "ready" || !state.data.window) return
    setSaveStatus("saving")
    const timeout = window.setTimeout(() => {
      void saveApplicationDraft(latestDraft.current)
        .then(() => {
          setSaveStatus("saved")
          setDirty(false)
        })
        .catch(() => {
          setSaveStatus("retry")
          window.setTimeout(
            () => setSaveAttempt((attempt) => attempt + 1),
            1800
          )
        })
    }, 650)
    return () => window.clearTimeout(timeout)
  }, [dirty, draft, saveAttempt, state])

  const pages = useMemo(
    () => [
      "general",
      ...PORTFOLIOS.filter((portfolio) => draft.portfolios.includes(portfolio)),
      "review",
    ],
    [draft.portfolios]
  )

  function update(changes: Partial<ApplicationDraft>) {
    setDraft((current) => ({ ...current, ...changes }))
    setDirty(true)
    setConfirmed(false)
    setNotice(null)
  }

  function togglePortfolio(portfolio: Portfolio) {
    const selected = draft.portfolios.includes(portfolio)
    if (selected) {
      const relevantIds =
        state.status === "ready"
          ? (state.data.window?.questions ?? [])
              .filter((question) => question.section === portfolio)
              .map((question) => question.id)
          : []
      const populated = relevantIds.some((id) => {
        const answer = draft.answers[id]
        return Array.isArray(answer) ? answer.length > 0 : Boolean(answer)
      })
      if (
        populated &&
        !window.confirm(
          `Remove ${labels[portfolio]} and permanently clear its draft answers?`
        )
      )
        return
      const answers = { ...draft.answers }
      relevantIds.forEach((id) => delete answers[id])
      update({
        portfolios: draft.portfolios.filter((item) => item !== portfolio),
        answers,
      })
      return
    }
    update({ portfolios: [...draft.portfolios, portfolio] })
  }

  if (state.status === "loading") {
    return (
      <div className="page-container py-16 text-muted-foreground">
        Loading applications…
      </div>
    )
  }

  if (state.status === "guest") {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          badge="Recruitment"
          title="Team Applications"
          description="Sign in with Discord to apply or view your application history."
        />
        <Card className="mx-auto max-w-xl">
          <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
            <Clock3Icon className="size-10 text-primary" aria-hidden />
            <div>
              <h2 className="text-xl font-semibold">Continue with Discord</h2>
              <p className="mt-2 text-muted-foreground">{state.message}</p>
            </div>
            <Button asChild>
              <a href={discordLoginUrl(window.location.origin, "/apply")}>
                Sign in with Discord
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="page-container">
        <Card role="alert">
          <CardContent className="py-10 text-destructive">
            {state.message}
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data } = state
  if (!data.window) {
    return (
      <div className="page-container space-y-8">
        <PageHeader
          badge="Recruitment"
          title="Applications are currently closed"
          description="Check back during the next Director or Subcommittee recruitment round."
        />
        {data.history.length ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HistoryIcon className="size-5" /> Your previous applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.history.map((item) => (
                <div
                  key={item.id ?? String(item.created_at)}
                  className="rounded-xl border p-4 text-sm"
                >
                  <Badge
                    variant={
                      item.status === "withdrawn" ? "destructive" : "secondary"
                    }
                  >
                    {item.status === "withdrawn" ? "Deleted" : "Submitted"}
                  </Badge>
                  <p className="mt-2 text-muted-foreground">
                    Submitted{" "}
                    {item.submitted_at
                      ? new Date(item.submitted_at).toLocaleString("en-AU")
                      : "previously"}
                  </p>
                  <SubmittedAnswers application={item} />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    )
  }

  const currentSection = pages[Math.min(page, pages.length - 1)]
  const questions = (data.window.questions ?? []).filter(
    (question) => question.section === currentSection && !question.fixed_key
  )
  const isReview = currentSection === "review"

  async function submit() {
    setSubmitting(true)
    setNotice(null)
    try {
      const result = await submitApplication(draft)
      setNotice(
        result.email_sent || !draft.email_opt_in
          ? "Application submitted. Your answers are now locked."
          : "Application submitted, but the optional confirmation email could not be sent."
      )
      setState({
        status: "ready",
        data: {
          ...data,
          draft: null,
          history: [
            {
              ...draft,
              id: result.id,
              window_id: data.window!.id,
              window_name: data.window!.name,
              application_type: data.window!.application_type,
              status: "submitted",
              submitted_at: result.submitted_at,
              withdrawn_at: null,
            },
            ...data.history,
          ],
        },
      })
      setDraft(emptyDraft)
      setPage(0)
      setDirty(false)
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Application could not be submitted."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const activeSubmission = data.history.find(
    (item) => item.window_id === data.window?.id && item.status === "submitted"
  )
  if (activeSubmission) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          badge={data.window.name}
          title="Application submitted"
          description="Your answers are locked and ready for the AnimeUNSW team to review."
        />
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
            <CheckCircle2Icon className="size-12 text-primary" aria-hidden />
            <div>
              <h2 className="text-xl font-semibold">Thanks for applying</h2>
              <p className="mt-2 text-muted-foreground">
                Submitted{" "}
                {new Date(activeSubmission.submitted_at!).toLocaleString(
                  "en-AU"
                )}
                .
              </p>
            </div>
            {notice ? <p role="status">{notice}</p> : null}
            <div className="w-full">
              <SubmittedAnswers application={activeSubmission} />
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  !window.confirm(
                    "Withdraw this application? The submitted version will remain visible as Deleted, and you can start a new application while this window is open."
                  )
                )
                  return
                void withdrawApplication(activeSubmission.id)
                  .then(() => {
                    setState({
                      status: "ready",
                      data: {
                        ...data,
                        history: data.history.map((item) =>
                          item.id === activeSubmission.id
                            ? {
                                ...item,
                                status: "withdrawn",
                                withdrawn_at: new Date().toISOString(),
                              }
                            : item
                        ),
                      },
                    })
                    setNotice(
                      "Application withdrawn. You can now start a new draft."
                    )
                  })
                  .catch((error: unknown) =>
                    setNotice(
                      error instanceof Error
                        ? error.message
                        : "The application could not be withdrawn."
                    )
                  )
              }}
            >
              Withdraw application
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        badge={data.window.name}
        title={
          data.window.application_type === "director"
            ? "Director Application"
            : "Subcommittee Application"
        }
        description="Complete General first, then one page for each selected portfolio. Your draft saves automatically."
      />
      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <aside className="space-y-2" aria-label="Application progress">
          {pages.map((item, index) => (
            <button
              key={item}
              type="button"
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm ${index === page ? "border-primary bg-primary/10 text-foreground" : "bg-card/50 text-muted-foreground"}`}
              onClick={() => setPage(index)}
            >
              <span className="grid size-7 place-items-center rounded-full bg-muted text-xs">
                {index + 1}
              </span>
              {item === "review" ? "Review & submit" : labels[item]}
            </button>
          ))}
        </aside>
        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>
                {isReview ? "Review & submit" : labels[currentSection]}
              </CardTitle>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {saveStatus === "saving" ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : (
                  <SaveIcon className="size-4" />
                )}
                {saveStatus === "saving"
                  ? "Saving…"
                  : saveStatus === "retry"
                    ? "Could not save—retrying"
                    : "Saved"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {currentSection === "general" ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    Full name <span className="text-destructive">*</span>
                    <input
                      className={inputClass()}
                      value={draft.full_name}
                      onChange={(event) =>
                        update({ full_name: event.target.value })
                      }
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Preferred name <span className="text-destructive">*</span>
                    <input
                      className={inputClass()}
                      value={draft.preferred_name}
                      onChange={(event) =>
                        update({ preferred_name: event.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    Year of study <span className="text-destructive">*</span>
                    <select
                      className={inputClass()}
                      value={draft.year_of_study ?? ""}
                      onChange={(event) =>
                        update({
                          year_of_study: (event.target.value ||
                            null) as ApplicationDraft["year_of_study"],
                        })
                      }
                    >
                      <option value="">Choose your year</option>
                      {["1", "2", "3", "4+", "N/A"].map((year) => (
                        <option key={year}>{year}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    AnimeUNSW membership number{" "}
                    <span className="text-destructive">*</span>
                    <input
                      className={inputClass()}
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      value={draft.membership_number ?? ""}
                      onChange={(event) =>
                        update({
                          membership_number: event.target.value || null,
                        })
                      }
                    />
                    <span className="block text-xs font-normal text-muted-foreground">
                      Exactly four digits, or 0000 if you do not have one.
                    </span>
                  </label>
                </div>
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">
                    Portfolio selection{" "}
                    <span className="text-destructive">*</span>
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PORTFOLIOS.map((portfolio) => (
                      <label
                        key={portfolio}
                        className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border bg-card/60 px-3 py-2 text-sm has-checked:border-primary has-checked:bg-primary/10"
                      >
                        <input
                          type="checkbox"
                          checked={draft.portfolios.includes(portfolio)}
                          onChange={() => togglePortfolio(portfolio)}
                        />
                        {labels[portfolio]}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {questions.map((question) => (
                  <QuestionField
                    key={question.id}
                    question={question}
                    value={draft.answers[question.id]}
                    onChange={(value) =>
                      update({
                        answers: { ...draft.answers, [question.id]: value },
                      })
                    }
                  />
                ))}
              </>
            ) : isReview ? (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <h3 className="font-semibold">General</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {draft.full_name || "Missing full name"} ·{" "}
                    {draft.preferred_name || "Missing preferred name"} · Year{" "}
                    {draft.year_of_study ?? "not selected"} · Member{" "}
                    {draft.membership_number ?? "not entered"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Portfolios:{" "}
                    {draft.portfolios
                      .map((portfolio) => labels[portfolio])
                      .join(", ") || "None selected"}
                  </p>
                </div>
                {draft.portfolios.map((portfolio) => (
                  <div key={portfolio} className="rounded-xl border p-4">
                    <h3 className="font-semibold">{labels[portfolio]}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {
                        (data.window?.questions ?? []).filter(
                          (question) =>
                            question.section === portfolio &&
                            !question.fixed_key
                        ).length
                      }{" "}
                      answers included
                    </p>
                  </div>
                ))}
                <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
                  <label className="flex gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.email_opt_in}
                      onChange={(event) =>
                        update({ email_opt_in: event.target.checked })
                      }
                    />
                    <span>
                      Email me a submission confirmation
                      {data.verified_email
                        ? ` at ${data.verified_email.replace(/(.{2}).+(@.+)/, "$1••••$2")}`
                        : ""}
                      .
                    </span>
                  </label>
                  {draft.email_opt_in && !data.verified_email ? (
                    <label className="space-y-2 text-sm font-medium">
                      Confirmation email
                      <input
                        type="email"
                        className={inputClass()}
                        value={draft.confirmation_email ?? ""}
                        onChange={(event) =>
                          update({
                            confirmation_email: event.target.value || null,
                          })
                        }
                      />
                      <span className="block text-xs font-normal text-muted-foreground">
                        Used only for this application. Complete account
                        verification to verify it for future use.
                      </span>
                    </label>
                  ) : null}
                </div>
                <label className="flex gap-3 rounded-xl border p-4 text-sm">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                  />
                  <span>
                    I have reviewed my answers and am ready to submit this
                    application. I understand my answers will be locked.
                  </span>
                </label>
              </div>
            ) : (
              questions.map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  value={draft.answers[question.id]}
                  onChange={(value) =>
                    update({
                      answers: { ...draft.answers, [question.id]: value },
                    })
                  }
                />
              ))
            )}
            {notice ? (
              <p
                role="status"
                className="rounded-xl border bg-muted/40 p-3 text-sm"
              >
                {notice}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
              <Button
                variant="outline"
                disabled={page === 0 || submitting}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Back
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {pages.length}
              </span>
              {isReview ? (
                <Button
                  disabled={submitting || !confirmed}
                  onClick={() => void submit()}
                >
                  <SendIcon data-icon="inline-start" />
                  {submitting ? "Submitting…" : "Submit application"}
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pages.length - 1, current + 1)
                    )
                  }
                >
                  Continue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {data.history.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2Icon className="size-5 text-primary" /> Submitted
              applications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.history.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div>
                  <Badge
                    variant={
                      item.status === "withdrawn" ? "destructive" : "secondary"
                    }
                  >
                    {item.status === "withdrawn" ? "Deleted" : "Submitted"}
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.submitted_at
                      ? new Date(item.submitted_at).toLocaleString("en-AU")
                      : "Submitted"}
                  </p>
                  <SubmittedAnswers application={item} />
                </div>
                {item.status === "submitted" &&
                item.window_id === data.window!.id ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (
                        !window.confirm(
                          "Withdraw this application? The submitted version will remain visible as Deleted."
                        )
                      )
                        return
                      void withdrawApplication(item.id).then(() =>
                        window.location.reload()
                      )
                    }}
                  >
                    Withdraw
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
