import { useEffect, useState } from "react"
import {
  CalendarDaysIcon,
  ClipboardListIcon,
  PencilIcon,
  PlusIcon,
  ShieldAlertIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import { Link } from "react-router-dom"

import { AttendanceUploader } from "@/components/admin/attendance-uploader"
import { EventEditor } from "@/components/admin/event-editor"
import { TeamAdmin } from "@/components/admin/team-admin"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AdminAccessError,
  createEvent,
  deleteEvent,
  getAdminEvents,
  removeEventAttendance,
  updateEvent,
  type AdminEvent,
  type AttendanceImportResult,
  type AttendanceUpload,
  type EventInput,
} from "@/lib/admin-api"
import { getAccount } from "@/lib/account-api"

type PageState =
  | { status: "loading" }
  | { status: "denied"; message: string }
  | { status: "error"; message: string }
  | { status: "ready"; events: AdminEvent[] }

type PendingRemoval =
  | { kind: "event"; event: AdminEvent }
  | { kind: "attendance"; event: AdminEvent; upload: AttendanceUpload }

const ADMIN_TOOLS = [
  {
    title: "Events",
    description: "Create events, update listings, and manage attendance forms.",
    to: "/admin/events",
    icon: CalendarDaysIcon,
  },
  {
    title: "Meet the Team",
    description: "Add, edit, reorder, or remove committee profiles.",
    to: "/admin/team",
    icon: UsersIcon,
  },
  {
    title: "Team Applications",
    description:
      "Edit recruitment forms, publish application windows, and review submissions.",
    to: "/admin/applications",
    icon: ClipboardListIcon,
  },
] as const

type AdminView = "dashboard" | "events" | "team"

export function AdminPage({ view = "dashboard" }: { view?: AdminView }) {
  const [state, setState] = useState<PageState>({ status: "loading" })
  const [editing, setEditing] = useState<AdminEvent | "new" | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(
    null
  )

  useEffect(() => {
    const controller = new AbortController()
    void getAccount(controller.signal)
      .then(async (account) => {
        if (!account) {
          setState({
            status: "denied",
            message: "Sign in with Discord to continue.",
          })
          return
        }
        if (!account.is_admin) {
          setState({
            status: "denied",
            message: "The AnimeUNSW Executive or Director role is required.",
          })
          return
        }
        const events =
          view === "events" ? await getAdminEvents(controller.signal) : []
        setState({ status: "ready", events })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: error instanceof AdminAccessError ? "denied" : "error",
          message:
            error instanceof Error
              ? error.message
              : "The dashboard could not be loaded.",
        })
      })
    return () => controller.abort()
  }, [view])

  async function saveEvent(value: EventInput) {
    if (state.status !== "ready" || editing === null) return
    setSaving(true)
    try {
      const saved =
        editing === "new"
          ? await createEvent(value)
          : await updateEvent(editing.id, value)
      const savedWithAttendance: AdminEvent = {
        ...saved,
        attendanceCount: editing === "new" ? 0 : editing.attendanceCount,
        attendanceUploads: editing === "new" ? [] : editing.attendanceUploads,
      }
      setState({
        status: "ready",
        events:
          editing === "new"
            ? [...state.events, savedWithAttendance]
            : state.events.map((event) =>
                event.id === saved.id ? savedWithAttendance : event
              ),
      })
      setEditing(null)
      setNotice("Event saved to the website events file.")
    } finally {
      setSaving(false)
    }
  }

  async function removeEvent(event: AdminEvent) {
    if (state.status !== "ready") return
    setSaving(true)
    setNotice(null)
    try {
      await deleteEvent(event.id)
      setState({
        status: "ready",
        events: state.events.filter((existing) => existing.id !== event.id),
      })
      setEditing(null)
      setNotice("Event removed from the website events file.")
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Could not remove event."
      )
    } finally {
      setSaving(false)
      setPendingRemoval(null)
    }
  }

  function addAttendance(eventId: string, result: AttendanceImportResult) {
    setState((current) => {
      if (current.status !== "ready") return current
      return {
        ...current,
        events: current.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                attendanceCount: event.attendanceCount + result.newly_recorded,
                attendanceUploads:
                  result.newly_recorded > 0
                    ? [
                        {
                          id: result.upload_id,
                          fileName: result.file_name,
                          importedAt: result.imported_at,
                          attendanceCount: result.newly_recorded,
                        },
                        ...event.attendanceUploads,
                      ]
                    : event.attendanceUploads,
              }
            : event
        ),
      }
    })
  }

  async function removeAttendance(event: AdminEvent, upload: AttendanceUpload) {
    if (state.status !== "ready") return
    setSaving(true)
    setNotice(null)
    try {
      const result = await removeEventAttendance(event.id, upload.id)
      setState({
        status: "ready",
        events: state.events.map((existing) =>
          existing.id === event.id
            ? {
                ...existing,
                attendanceCount: Math.max(
                  0,
                  existing.attendanceCount - result.removed
                ),
                attendanceUploads: existing.attendanceUploads.filter(
                  (existingUpload) => existingUpload.id !== upload.id
                ),
              }
            : existing
        ),
      })
      setNotice(`Attendance form removed from “${event.title}”.`)
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Could not remove the attendance form."
      )
    } finally {
      setSaving(false)
      setPendingRemoval(null)
    }
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        badge="Committee admin"
        title={
          view === "events"
            ? "Manage events"
            : view === "team"
              ? "Manage team"
              : "Admin dashboard"
        }
        description={
          view === "events"
            ? "Create and update event listings, upload attendance forms, and manage attendance records."
            : view === "team"
              ? "Manage the profiles and display order used in Meet the Team."
              : "Choose an area to manage."
        }
      />

      {state.status === "ready" && view === "dashboard" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {ADMIN_TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <Card key={tool.to} className="flex h-full flex-col">
                <CardHeader className="space-y-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <CardTitle>{tool.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <p className="flex-1 text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                  <Button asChild className="w-full">
                    <Link to={tool.to}>Manage {tool.title}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}

      {state.status === "loading" ? (
        <Card>
          <CardContent className="py-8 text-muted-foreground">
            Checking access…
          </CardContent>
        </Card>
      ) : null}

      {state.status === "denied" ? (
        <Card role="alert">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <ShieldAlertIcon className="size-10 text-destructive" aria-hidden />
            <div>
              <h2 className="text-xl font-semibold">Access denied</h2>
              <p className="mt-1 text-muted-foreground">{state.message}</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/account">Go to account</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {state.status === "error" ? (
        <Card role="alert">
          <CardContent className="py-8 text-destructive">
            {state.message}
          </CardContent>
        </Card>
      ) : null}

      {state.status === "ready" && view === "events" ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {state.events.length}{" "}
              {state.events.length === 1 ? "event" : "events"}
            </p>
            <Button
              onClick={() => {
                setNotice(null)
                setEditing("new")
              }}
            >
              <PlusIcon data-icon="inline-start" /> Add event
            </Button>
          </div>

          {notice ? (
            <p
              role="status"
              className="rounded-lg border bg-muted/40 p-3 text-sm"
            >
              {notice}
            </p>
          ) : null}

          {editing === "new" ? (
            <EventEditor
              key="new"
              saving={saving}
              onSave={saveEvent}
              onCancel={() => setEditing(null)}
            />
          ) : null}

          <div className="grid gap-3">
            {state.events.map((event) => (
              <div key={event.id} className="space-y-3">
                <Card>
                  <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <CardTitle>{event.title}</CardTitle>
                      <div className="flex flex-wrap gap-1.5">
                        {event.category.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                        {event.featured ? <Badge>featured</Badge> : null}
                      </div>
                      {event.attendanceCount > 0 ? (
                        <div className="space-y-2">
                          <Badge variant="outline">
                            {event.attendanceUploads.length} attendance{" "}
                            {event.attendanceUploads.length === 1
                              ? "form"
                              : "forms"}{" "}
                            · {event.attendanceCount} total attendances
                          </Badge>
                          <div className="space-y-1.5">
                            {event.attendanceUploads.map((upload) => (
                              <div
                                key={upload.id}
                                className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                              >
                                <span>
                                  <span className="font-medium text-foreground">
                                    {upload.fileName}
                                  </span>{" "}
                                  {new Intl.DateTimeFormat("en-AU", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  }).format(new Date(upload.importedAt))}{" "}
                                  · {upload.attendanceCount} attendees
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={saving}
                                  onClick={() =>
                                    setPendingRemoval({
                                      kind: "attendance",
                                      event,
                                      upload,
                                    })
                                  }
                                >
                                  Remove form
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <p className="text-sm text-muted-foreground">
                        {event.location} · /events#{event.slug}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <AttendanceUploader
                        eventId={event.id}
                        eventTitle={event.title}
                        disabled={saving}
                        onUploaded={(result) => addAttendance(event.id, result)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setNotice(null)
                          setEditing(event)
                          window.requestAnimationFrame(() => {
                            document
                              .getElementById(`event-editor-${event.id}`)
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              })
                          })
                        }}
                      >
                        <PencilIcon data-icon="inline-start" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={saving}
                        onClick={() =>
                          setPendingRemoval({ kind: "event", event })
                        }
                      >
                        <Trash2Icon data-icon="inline-start" /> Remove
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
                {editing !== "new" && editing?.id === event.id ? (
                  <div id={`event-editor-${event.id}`} className="scroll-mt-24">
                    <EventEditor
                      key={event.id}
                      event={editing}
                      saving={saving}
                      onSave={saveEvent}
                      onCancel={() => setEditing(null)}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {state.status === "ready" && view === "team" ? <TeamAdmin /> : null}

      <ConfirmDialog
        open={pendingRemoval !== null}
        title={
          pendingRemoval?.kind === "attendance"
            ? "Remove attendance form?"
            : "Remove event?"
        }
        description={
          pendingRemoval?.kind === "attendance"
            ? `Remove “${pendingRemoval.upload.fileName}” from “${pendingRemoval.event.title}”? This removes ${pendingRemoval.upload.attendanceCount} attendance ${pendingRemoval.upload.attendanceCount === 1 ? "entry" : "entries"} and reverses its XP.`
            : pendingRemoval
              ? `Remove “${pendingRemoval.event.title}” from the website? This action cannot be undone from the dashboard.`
              : "Confirm this removal."
        }
        confirmLabel="Remove"
        destructive
        busy={saving}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null)
        }}
        onConfirm={() => {
          if (pendingRemoval?.kind === "attendance") {
            return removeAttendance(pendingRemoval.event, pendingRemoval.upload)
          }
          if (pendingRemoval?.kind === "event") {
            return removeEvent(pendingRemoval.event)
          }
        }}
      />
    </div>
  )
}
