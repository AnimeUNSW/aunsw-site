import { useEffect, useState } from "react"
import { PencilIcon, PlusIcon, ShieldAlertIcon, Trash2Icon } from "lucide-react"
import { Link } from "react-router-dom"

import { AttendanceUploader } from "@/components/admin/attendance-uploader"
import { EventEditor } from "@/components/admin/event-editor"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AdminAccessError,
  createEvent,
  deleteEvent,
  getAdminEvents,
  updateEvent,
  type AdminEvent,
  type EventInput,
} from "@/lib/admin-api"
import { getAccount } from "@/lib/account-api"

type PageState =
  | { status: "loading" }
  | { status: "denied"; message: string }
  | { status: "error"; message: string }
  | { status: "ready"; events: AdminEvent[] }

export function AdminPage() {
  const [state, setState] = useState<PageState>({ status: "loading" })
  const [editing, setEditing] = useState<AdminEvent | "new" | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

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
        if (!account.is_executive) {
          setState({
            status: "denied",
            message: "The AnimeUNSW Executive role is required.",
          })
          return
        }
        const events = await getAdminEvents(controller.signal)
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
  }, [])

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
    if (!window.confirm(`Remove “${event.title}” from the website?`)) return
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
    }
  }

  function addAttendance(eventId: string, count: number) {
    setState((current) => {
      if (current.status !== "ready") return current
      return {
        ...current,
        events: current.events.map((event) =>
          event.id === eventId
            ? { ...event, attendanceCount: event.attendanceCount + count }
            : event
        ),
      }
    })
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        badge="Executive"
        title="Event administration"
        description="Add, edit, and remove events stored in the website’s events.json file."
      />

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

      {state.status === "ready" ? (
        <>
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

          {editing ? (
            <EventEditor
              key={editing === "new" ? "new" : editing.id}
              event={editing === "new" ? undefined : editing}
              saving={saving}
              onSave={saveEvent}
              onCancel={() => setEditing(null)}
            />
          ) : null}

          <div className="grid gap-3">
            {state.events.map((event) => (
              <Card key={event.id}>
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
                      <Badge variant="outline">
                        Attendance uploaded · {event.attendanceCount}
                      </Badge>
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
                      onUploaded={(result) =>
                        addAttendance(event.id, result.newly_recorded)
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNotice(null)
                        setEditing(event)
                      }}
                    >
                      <PencilIcon data-icon="inline-start" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={saving}
                      onClick={() => void removeEvent(event)}
                    >
                      <Trash2Icon data-icon="inline-start" /> Remove
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
