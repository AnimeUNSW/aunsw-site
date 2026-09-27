import { useEffect, useState } from "react"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FileQuestionIcon,
  FolderIcon,
  GripVerticalIcon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  ShieldAlertIcon,
  Trash2Icon,
} from "lucide-react"
import { Link } from "react-router-dom"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageHeader } from "@/components/shared/page-header"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAccount, type Account } from "@/lib/account-api"
import {
  APPLICATION_SECTIONS,
  closeApplicationWindow,
  deleteApplicationWindow,
  getApplicationForms,
  getApplicationWindow,
  getApplicationWindows,
  openApplicationWindow,
  saveApplicationForms,
  type ApplicationFormTemplate,
  type ApplicationQuestion,
  type ApplicationSection,
  type ApplicationWindow,
  type ApplicationWindowDetail,
} from "@/lib/applications-api"

const labels: Record<ApplicationSection, string> = {
  general: "General",
  creatives: "Creatives",
  events: "Events",
  marketing: "Marketing",
  externals: "Externals",
  it: "IT",
}

function fieldClass() {
  return "min-h-10 w-full rounded-lg border border-input bg-background/70 px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
}

type PageState =
  | { status: "loading" }
  | { status: "denied"; message: string }
  | {
      status: "ready"
      account: Account
      template: ApplicationFormTemplate
      windows: ApplicationWindow[]
    }
  | { status: "error"; message: string }

export function TeamApplicationsPage() {
  const [state, setState] = useState<PageState>({ status: "loading" })
  const [section, setSection] = useState<ApplicationSection>("general")
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [windowType, setWindowType] = useState<"director" | "subcommittee">(
    "director"
  )
  const [windowName, setWindowName] = useState("")
  const [pendingClose, setPendingClose] = useState<ApplicationWindow | null>(
    null
  )
  const [pendingQuestion, setPendingQuestion] =
    useState<ApplicationQuestion | null>(null)
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null)
  const [draggedOption, setDraggedOption] = useState<{
    questionId: string
    index: number
  } | null>(null)
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null)
  const [detail, setDetail] = useState<ApplicationWindowDetail | null>(null)
  const [viewerPortfolio, setViewerPortfolio] =
    useState<ApplicationSection>("creatives")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "submitted" | "withdrawn"
  >("all")

  async function reload() {
    const account = await getAccount()
    if (!account?.is_admin) {
      setState({
        status: "denied",
        message: "The AnimeUNSW Executive or Director role is required.",
      })
      return
    }
    const [template, windows] = await Promise.all([
      getApplicationForms(),
      getApplicationWindows(),
    ])
    setState({ status: "ready", account, template, windows })
  }

  useEffect(() => {
    void reload().catch((error: unknown) =>
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Team Applications could not be loaded.",
      })
    )
  }, [])

  useEffect(() => {
    if (!selectedWindow) {
      setDetail(null)
      return
    }
    const controller = new AbortController()
    void getApplicationWindow(selectedWindow, controller.signal)
      .then(setDetail)
      .catch((error: unknown) =>
        setNotice(
          error instanceof Error
            ? error.message
            : "Applications could not be loaded."
        )
      )
    return () => controller.abort()
  }, [selectedWindow])

  function updateQuestion(id: string, changes: Partial<ApplicationQuestion>) {
    if (state.status !== "ready") return
    setState({
      ...state,
      template: {
        ...state.template,
        questions: state.template.questions.map((question) =>
          question.id === id ? { ...question, ...changes } : question
        ),
      },
    })
  }

  function reorderQuestion(id: string, direction: -1 | 1) {
    if (state.status !== "ready") return
    const custom = state.template.questions
      .filter((question) => question.section === section && !question.fixed_key)
      .sort((a, b) => a.display_order - b.display_order)
    const index = custom.findIndex((question) => question.id === id)
    const target = index + direction
    if (index < 0 || target < 0 || target >= custom.length) return
    ;[custom[index], custom[target]] = [custom[target], custom[index]]
    const positions = new Map(
      custom.map((question, order) => [question.id, order + 10])
    )
    setState({
      ...state,
      template: {
        ...state.template,
        questions: state.template.questions.map((question) =>
          positions.has(question.id)
            ? { ...question, display_order: positions.get(question.id)! }
            : question
        ),
      },
    })
  }

  function moveQuestion(id: string, targetId: string) {
    if (state.status !== "ready" || id === targetId) return
    const custom = state.template.questions
      .filter((question) => question.section === section && !question.fixed_key)
      .sort((a, b) => a.display_order - b.display_order)
    const sourceIndex = custom.findIndex((question) => question.id === id)
    const targetIndex = custom.findIndex((question) => question.id === targetId)
    if (sourceIndex < 0 || targetIndex < 0) return
    const [moved] = custom.splice(sourceIndex, 1)
    custom.splice(targetIndex, 0, moved)
    const positions = new Map(
      custom.map((question, order) => [question.id, order + 10])
    )
    setState({
      ...state,
      template: {
        ...state.template,
        questions: state.template.questions.map((question) =>
          positions.has(question.id)
            ? { ...question, display_order: positions.get(question.id)! }
            : question
        ),
      },
    })
  }

  function changeOptions(question: ApplicationQuestion, options: string[]) {
    updateQuestion(question.id, { options })
  }

  function moveOption(
    question: ApplicationQuestion,
    sourceIndex: number,
    targetIndex: number
  ) {
    if (sourceIndex === targetIndex) return
    const options = [...question.options]
    const [moved] = options.splice(sourceIndex, 1)
    options.splice(targetIndex, 0, moved)
    changeOptions(question, options)
  }

  function addQuestion() {
    if (state.status !== "ready") return
    const question: ApplicationQuestion = {
      id: crypto.randomUUID(),
      section,
      fixed_key: null,
      question_text: "Untitled question",
      answer_type: "short_text",
      required: false,
      min_length: null,
      max_length: 500,
      allow_multiple: false,
      display_order:
        state.template.questions.filter((item) => item.section === section)
          .length + 10,
      options: [],
    }
    setState({
      ...state,
      template: {
        ...state.template,
        questions: [...state.template.questions, question],
      },
    })
  }

  async function saveForms() {
    if (state.status !== "ready") return
    setSaving(true)
    setNotice(null)
    try {
      const result = await saveApplicationForms(state.template)
      setState({
        ...state,
        template: { ...state.template, version: result.version },
      })
      setNotice("Application form saved for the next recruitment window.")
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "The form could not be saved."
      )
    } finally {
      setSaving(false)
    }
  }

  if (state.status === "loading") {
    return (
      <div className="page-container py-16 text-muted-foreground">
        Loading Team Applications…
      </div>
    )
  }
  if (state.status === "denied") {
    return (
      <div className="page-container">
        <Card role="alert">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <ShieldAlertIcon className="size-10 text-destructive" />
            <h1 className="text-2xl font-semibold">Access denied</h1>
            <p className="text-muted-foreground">{state.message}</p>
            <Button asChild>
              <Link to="/account">Go to account</Link>
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

  const openWindow = state.windows.find((window) => window.status === "open")
  const sectionQuestions = state.template.questions
    .filter((question) => question.section === section)
    .sort((a, b) => a.display_order - b.display_order)
  const counts = Object.fromEntries(
    APPLICATION_SECTIONS.map((item) => [
      item,
      state.template.questions.filter((question) => question.section === item)
        .length,
    ])
  )
  const filteredApplications = (detail?.applications ?? []).filter(
    (application) => {
      const matchesPortfolio = application.portfolios.includes(
        viewerPortfolio as never
      )
      const matchesStatus =
        statusFilter === "all" || application.status === statusFilter
      const haystack =
        `${application.full_name} ${application.preferred_name} ${application.username ?? ""} ${application.display_name ?? ""} ${application.membership_number ?? ""}`.toLowerCase()
      return (
        matchesPortfolio &&
        matchesStatus &&
        haystack.includes(query.toLowerCase())
      )
    }
  )

  return (
    <div className="page-container space-y-6">
      <PageHeader
        badge="Committee admin"
        title="Team Applications"
        description="Build recruitment forms, publish an application window, and review portfolio submissions."
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
        <div>
          <p className="font-medium">
            {openWindow
              ? `${openWindow.name} is open`
              : "Applications are closed"}
          </p>
          <p className="text-sm text-muted-foreground">
            {openWindow
              ? "Published questions are locked until this window closes."
              : "The shared form is available for editing."}
          </p>
        </div>
        {openWindow ? (
          <Button
            variant="destructive"
            onClick={() => setPendingClose(openWindow)}
          >
            Close Applications
          </Button>
        ) : (
          <Button
            onClick={() => {
              setWindowName("")
              setOpenDialog(true)
            }}
          >
            Open Applications
          </Button>
        )}
      </div>

      {notice ? (
        <p role="status" className="rounded-xl border bg-muted/40 p-3 text-sm">
          {notice}
        </p>
      ) : null}

      <Tabs defaultValue="editor" className="gap-6">
        <TabsList className="h-auto w-full max-w-lg p-1">
          <TabsTrigger value="editor" className="min-h-11">
            Form Editor
          </TabsTrigger>
          <TabsTrigger value="viewer" className="min-h-11">
            View Applications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="space-y-5">
          {state.template.locked ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <LockIcon />
                </span>
                <h2 className="text-xl font-semibold">
                  Published forms are locked
                </h2>
                <p className="max-w-xl text-muted-foreground">
                  Close {openWindow?.name ?? "the current window"} before
                  editing questions for the next round.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Shared form template</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Version {state.template.version}. Fixed General fields
                    cannot be changed.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={addQuestion}>
                    <PlusIcon data-icon="inline-start" /> Add question
                  </Button>
                  <Button disabled={saving} onClick={() => void saveForms()}>
                    {saving ? "Saving…" : "Save form"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {APPLICATION_SECTIONS.map((item) => (
                    <Button
                      key={item}
                      size="sm"
                      variant={section === item ? "default" : "outline"}
                      onClick={() => setSection(item)}
                    >
                      {labels[item]}{" "}
                      <Badge variant="secondary">{counts[item]}</Badge>
                    </Button>
                  ))}
                </div>
                <div className="space-y-3">
                  {sectionQuestions.map((question) => (
                    <div
                      key={question.id}
                      draggable={!question.fixed_key}
                      onDragStart={() => setDraggedQuestion(question.id)}
                      onDragEnd={() => setDraggedQuestion(null)}
                      onDragOver={(event) => {
                        if (!question.fixed_key) event.preventDefault()
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        if (draggedQuestion && !question.fixed_key) {
                          moveQuestion(draggedQuestion, question.id)
                        }
                        setDraggedQuestion(null)
                      }}
                      className={`rounded-xl border bg-card/60 p-4 transition ${draggedQuestion === question.id ? "opacity-50 ring-2 ring-primary/40" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <GripVerticalIcon
                          className="mt-2 size-5 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                        <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[1fr_12rem]">
                          <label className="space-y-1 text-xs text-muted-foreground">
                            Question
                            <input
                              className={fieldClass()}
                              disabled={Boolean(question.fixed_key)}
                              value={question.question_text}
                              onChange={(event) =>
                                updateQuestion(question.id, {
                                  question_text: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="space-y-1 text-xs text-muted-foreground">
                            Answer type
                            <select
                              className={fieldClass()}
                              disabled={Boolean(question.fixed_key)}
                              value={question.answer_type}
                              onChange={(event) =>
                                updateQuestion(question.id, {
                                  answer_type: event.target
                                    .value as ApplicationQuestion["answer_type"],
                                  options:
                                    event.target.value === "multiple_choice"
                                      ? ["Option 1", "Option 2"]
                                      : [],
                                })
                              }
                            >
                              <option value="short_text">Short text</option>
                              <option value="long_text">Long text</option>
                              <option value="multiple_choice">
                                Multiple choice
                              </option>
                            </select>
                          </label>
                        </div>
                        {question.fixed_key ? (
                          <Badge variant="secondary">Fixed</Badge>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Move question up"
                              onClick={() => reorderQuestion(question.id, -1)}
                            >
                              <ChevronUpIcon />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Move question down"
                              onClick={() => reorderQuestion(question.id, 1)}
                            >
                              <ChevronDownIcon />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Delete question"
                              onClick={() => setPendingQuestion(question)}
                            >
                              <Trash2Icon />
                            </Button>
                          </div>
                        )}
                      </div>
                      {!question.fixed_key ? (
                        <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(event) =>
                                updateQuestion(question.id, {
                                  required: event.target.checked,
                                })
                              }
                            />{" "}
                            Required
                          </label>
                          {question.answer_type !== "multiple_choice" ? (
                            <>
                              <label className="space-y-1 text-xs text-muted-foreground">
                                Minimum characters
                                <input
                                  className={fieldClass()}
                                  type="number"
                                  min={0}
                                  max={4000}
                                  value={question.min_length ?? ""}
                                  onChange={(event) =>
                                    updateQuestion(question.id, {
                                      min_length: event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                    })
                                  }
                                />
                              </label>
                              <label className="space-y-1 text-xs text-muted-foreground">
                                Maximum characters
                                <input
                                  className={fieldClass()}
                                  type="number"
                                  min={1}
                                  max={4000}
                                  value={question.max_length ?? ""}
                                  onChange={(event) =>
                                    updateQuestion(question.id, {
                                      max_length: event.target.value
                                        ? Number(event.target.value)
                                        : null,
                                    })
                                  }
                                />
                              </label>
                            </>
                          ) : (
                            <>
                              <div className="space-y-2 sm:col-span-2">
                                <p className="text-xs text-muted-foreground">
                                  Options
                                </p>
                                {question.options.map((option, optionIndex) => (
                                  <div
                                    key={`${question.id}-${optionIndex}`}
                                    draggable
                                    onDragStart={(event) => {
                                      event.stopPropagation()
                                      setDraggedOption({
                                        questionId: question.id,
                                        index: optionIndex,
                                      })
                                    }}
                                    onDragOver={(event) => {
                                      event.preventDefault()
                                      event.stopPropagation()
                                    }}
                                    onDrop={(event) => {
                                      event.preventDefault()
                                      event.stopPropagation()
                                      if (
                                        draggedOption?.questionId ===
                                        question.id
                                      ) {
                                        moveOption(
                                          question,
                                          draggedOption.index,
                                          optionIndex
                                        )
                                      }
                                      setDraggedOption(null)
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
                                    <input
                                      className={fieldClass()}
                                      aria-label={`Option ${optionIndex + 1}`}
                                      value={option}
                                      onChange={(event) => {
                                        const options = [...question.options]
                                        options[optionIndex] =
                                          event.target.value
                                        changeOptions(question, options)
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      aria-label={`Move option ${optionIndex + 1} up`}
                                      disabled={optionIndex === 0}
                                      onClick={() =>
                                        moveOption(
                                          question,
                                          optionIndex,
                                          optionIndex - 1
                                        )
                                      }
                                    >
                                      <ChevronUpIcon />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      aria-label={`Move option ${optionIndex + 1} down`}
                                      disabled={
                                        optionIndex ===
                                        question.options.length - 1
                                      }
                                      onClick={() =>
                                        moveOption(
                                          question,
                                          optionIndex,
                                          optionIndex + 1
                                        )
                                      }
                                    >
                                      <ChevronDownIcon />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      aria-label={`Delete option ${optionIndex + 1}`}
                                      disabled={question.options.length <= 2}
                                      onClick={() =>
                                        changeOptions(
                                          question,
                                          question.options.filter(
                                            (_, index) => index !== optionIndex
                                          )
                                        )
                                      }
                                    >
                                      <Trash2Icon />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    changeOptions(question, [
                                      ...question.options,
                                      `Option ${question.options.length + 1}`,
                                    ])
                                  }
                                >
                                  <PlusIcon data-icon="inline-start" /> Add
                                  option
                                </Button>
                              </div>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={question.allow_multiple}
                                  onChange={(event) =>
                                    updateQuestion(question.id, {
                                      allow_multiple: event.target.checked,
                                    })
                                  }
                                />{" "}
                                Allow several selections
                              </label>
                            </>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="viewer" className="space-y-5">
          {!state.windows.length ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No application windows have been published yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Application windows</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(
                    [
                      [
                        "Open window",
                        state.windows.filter(
                          (window) => window.status === "open"
                        ),
                      ],
                      [
                        "Archive",
                        state.windows.filter(
                          (window) => window.status !== "open"
                        ),
                      ],
                    ] as const
                  ).map(([heading, windows]) =>
                    windows.length ? (
                      <section key={heading} className="space-y-2">
                        <h3 className="pt-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          {heading}
                        </h3>
                        {windows.map((window) => (
                          <button
                            key={window.id}
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selectedWindow === window.id ? "border-primary bg-primary/10" : "bg-card/50"}`}
                            onClick={() => setSelectedWindow(window.id)}
                          >
                            <FolderIcon className="size-5 text-primary" />
                            <span className="min-w-0 flex-1">
                              <strong className="block truncate text-sm">
                                {window.name}
                              </strong>
                              <span className="text-xs text-muted-foreground">
                                {window.status === "open" ? "Open" : "Archived"}
                                {" · "}
                                {window.application_count ?? 0}
                              </span>
                            </span>
                          </button>
                        ))}
                      </section>
                    ) : null
                  )}
                </CardContent>
              </Card>
              <div className="space-y-4">
                {detail ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {detail.window.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Newest submissions first
                        </p>
                      </div>
                      {detail.window.status === "closed" ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const confirmation = window.prompt(
                              `Type ${detail.window.name} to permanently delete this window.`
                            )
                            if (confirmation)
                              void deleteApplicationWindow(
                                detail.window.id,
                                confirmation
                              )
                                .then(() => {
                                  setSelectedWindow(null)
                                  setDetail(null)
                                  return reload()
                                })
                                .catch((error: unknown) =>
                                  setNotice(
                                    error instanceof Error
                                      ? error.message
                                      : "Window could not be deleted."
                                  )
                                )
                          }}
                        >
                          <Trash2Icon data-icon="inline-start" /> Delete archive
                        </Button>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {APPLICATION_SECTIONS.slice(1).map((item) => (
                        <Button
                          key={item}
                          size="sm"
                          variant={
                            viewerPortfolio === item ? "default" : "outline"
                          }
                          onClick={() => setViewerPortfolio(item)}
                        >
                          <FolderIcon data-icon="inline-start" /> {labels[item]}
                        </Button>
                      ))}
                      <Button
                        size="sm"
                        variant={
                          viewerPortfolio === "general" ? "default" : "outline"
                        }
                        onClick={() => setViewerPortfolio("general")}
                      >
                        <FileQuestionIcon data-icon="inline-start" />{" "}
                        Application questions
                      </Button>
                    </div>
                    {viewerPortfolio === "general" ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Application questions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {APPLICATION_SECTIONS.map((item) => (
                            <section key={item}>
                              <h3 className="font-semibold">{labels[item]}</h3>
                              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                                {detail.questions
                                  .filter(
                                    (question) => question.section === item
                                  )
                                  .map((question, questionIndex) => (
                                    <li key={question.id}>
                                      <span className="text-foreground">
                                        {question.question_text}
                                      </span>
                                      <span className="block text-xs">
                                        Order {questionIndex + 1} ·{" "}
                                        {question.answer_type.replace("_", " ")}{" "}
                                        ·{" "}
                                        {question.required
                                          ? "Required"
                                          : "Optional"}
                                        {question.min_length !== null
                                          ? ` · Min ${question.min_length}`
                                          : ""}
                                        {question.max_length !== null
                                          ? ` · Max ${question.max_length}`
                                          : ""}
                                        {question.allow_multiple
                                          ? " · Multiple selections"
                                          : ""}
                                      </span>
                                      {question.options.length ? (
                                        <span className="block text-xs">
                                          Options: {question.options.join(", ")}
                                        </span>
                                      ) : null}
                                    </li>
                                  ))}
                              </ol>
                            </section>
                          ))}
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                        <div className="grid gap-2 sm:grid-cols-[1fr_12rem]">
                          <label className="relative">
                            <SearchIcon className="absolute top-3 left-3 size-4 text-muted-foreground" />
                            <input
                              className={`${fieldClass()} pl-9`}
                              placeholder="Search name, Discord or member number"
                              value={query}
                              onChange={(event) => setQuery(event.target.value)}
                            />
                          </label>
                          <select
                            className={fieldClass()}
                            value={statusFilter}
                            onChange={(event) =>
                              setStatusFilter(
                                event.target.value as typeof statusFilter
                              )
                            }
                          >
                            <option value="all">All statuses</option>
                            <option value="submitted">Submitted</option>
                            <option value="withdrawn">Deleted</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          {filteredApplications.map((application) => (
                            <Card key={application.id}>
                              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <CardTitle className="text-lg">
                                    {application.preferred_name ||
                                      application.full_name}
                                  </CardTitle>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {application.full_name} · @
                                    {application.username} · Member{" "}
                                    {application.membership_number}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    application.status === "withdrawn"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {application.status === "withdrawn"
                                    ? "Deleted"
                                    : "Submitted"}
                                </Badge>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                                  <div>
                                    <dt className="text-muted-foreground">
                                      Year of study
                                    </dt>
                                    <dd>{application.year_of_study}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-muted-foreground">
                                      Submitted
                                    </dt>
                                    <dd>
                                      {application.submitted_at
                                        ? new Date(
                                            application.submitted_at
                                          ).toLocaleString("en-AU")
                                        : "—"}
                                    </dd>
                                  </div>
                                  {application.withdrawn_at ? (
                                    <div>
                                      <dt className="text-muted-foreground">
                                        Withdrawn
                                      </dt>
                                      <dd>
                                        {new Date(
                                          application.withdrawn_at
                                        ).toLocaleString("en-AU")}
                                      </dd>
                                    </div>
                                  ) : null}
                                </dl>
                                {detail.questions
                                  .filter(
                                    (question) =>
                                      !question.fixed_key &&
                                      (question.section === "general" ||
                                        question.section === viewerPortfolio)
                                  )
                                  .map((question) => (
                                    <div
                                      key={question.id}
                                      className="rounded-lg border bg-muted/20 p-3"
                                    >
                                      <p className="text-sm font-medium">
                                        {question.question_text}
                                      </p>
                                      <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                                        {Array.isArray(
                                          application.answers[question.id]
                                        )
                                          ? (
                                              application.answers[
                                                question.id
                                              ] as string[]
                                            ).join(", ")
                                          : String(
                                              application.answers[
                                                question.id
                                              ] ?? "No answer"
                                            )}
                                      </p>
                                    </div>
                                  ))}
                              </CardContent>
                            </Card>
                          ))}
                          {!filteredApplications.length ? (
                            <Card>
                              <CardContent className="py-10 text-center text-muted-foreground">
                                No matching applications.
                              </CardContent>
                            </Card>
                          ) : null}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Choose an application window.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open Applications</DialogTitle>
            <DialogDescription>
              Publishing creates an immutable question snapshot and locks the
              shared form until this window closes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="space-y-2 text-sm font-medium">
              Application type
              <select
                className={fieldClass()}
                value={windowType}
                onChange={(event) => {
                  const type = event.target.value as typeof windowType
                  setWindowType(type)
                }}
              >
                <option value="director">Director Application</option>
                <option value="subcommittee">Subcommittee Application</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              Application-window name
              <input
                className={fieldClass()}
                value={windowName}
                placeholder={`${new Date().getFullYear()} ${windowType === "director" ? "Directors" : "Subcom"}`}
                onChange={(event) => setWindowName(event.target.value)}
              />
            </label>
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <p className="font-medium">Publication summary</p>
              {APPLICATION_SECTIONS.map((item) => (
                <p key={item} className="mt-1 text-muted-foreground">
                  {labels[item]}: {counts[item]} questions
                </p>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button
              disabled={!windowName.trim() || saving}
              onClick={() => {
                setSaving(true)
                void openApplicationWindow({
                  name: windowName.trim(),
                  application_type: windowType,
                })
                  .then(() => reload())
                  .then(() => {
                    setOpenDialog(false)
                    setNotice(`${windowName.trim()} is now open.`)
                  })
                  .catch((error: unknown) =>
                    setNotice(
                      error instanceof Error
                        ? error.message
                        : "Applications could not be opened."
                    )
                  )
                  .finally(() => setSaving(false))
              }}
            >
              {saving ? "Publishing…" : "Publish and open"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingClose !== null}
        title="Close Applications?"
        description={`Closing ${pendingClose?.name ?? "this window"} immediately prevents new submissions and permanently removes unfinished drafts. Submitted and withdrawn applications remain archived.`}
        confirmLabel="Close Applications"
        destructive
        busy={saving}
        onOpenChange={(open) => {
          if (!open) setPendingClose(null)
        }}
        onConfirm={async () => {
          if (!pendingClose) return
          setSaving(true)
          try {
            await closeApplicationWindow(pendingClose.id)
            await reload()
            setNotice(`${pendingClose.name} has been closed.`)
            setPendingClose(null)
          } finally {
            setSaving(false)
          }
        }}
      />
      <ConfirmDialog
        open={pendingQuestion !== null}
        title="Delete question?"
        description={`Delete “${pendingQuestion?.question_text ?? "this question"}” from the draft form? Published application windows are not affected.`}
        confirmLabel="Delete question"
        destructive
        onOpenChange={(open) => {
          if (!open) setPendingQuestion(null)
        }}
        onConfirm={() => {
          if (state.status === "ready" && pendingQuestion)
            setState({
              ...state,
              template: {
                ...state.template,
                questions: state.template.questions.filter(
                  (question) => question.id !== pendingQuestion.id
                ),
              },
            })
          setPendingQuestion(null)
        }}
      />
    </div>
  )
}
