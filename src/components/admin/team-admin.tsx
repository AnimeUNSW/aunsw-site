import { useEffect, useMemo, useState } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { TeamEditor } from "@/components/admin/team-editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  createTeamProfile,
  deleteTeamProfile,
  getAdminTeamProfiles,
  updateTeamProfile,
  type TeamProfileInput,
} from "@/lib/admin-api"
import type { TeamMembership, TeamProfile } from "@/types/content"

type NewProfile = { membership: TeamMembership; displayOrder: number }

function membershipLabel(membership: TeamMembership) {
  if (membership === "top5") return "Top 5"
  if (membership === "other") return "Subcommittee"
  return membership[0].toUpperCase() + membership.slice(1)
}

function sortProfiles(profiles: TeamProfile[]) {
  return [...profiles].sort(
    (left, right) => left.displayOrder - right.displayOrder
  )
}

export function TeamAdmin() {
  const [profiles, setProfiles] = useState<TeamProfile[] | null>(null)
  const [editing, setEditing] = useState<TeamProfile | NewProfile | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void getAdminTeamProfiles(controller.signal)
      .then((loaded) => setProfiles(sortProfiles(loaded)))
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Team profiles could not be loaded."
          )
        }
      })
    return () => controller.abort()
  }, [])

  const nextDisplayOrder = useMemo(
    () =>
      profiles?.length
        ? Math.max(...profiles.map((profile) => profile.displayOrder)) + 1
        : 0,
    [profiles]
  )

  async function saveProfile(value: TeamProfileInput) {
    if (!editing || !profiles) return
    setSaving(true)
    setNotice(null)
    try {
      const saved =
        "id" in editing
          ? await updateTeamProfile(editing.id, value)
          : await createTeamProfile(value)
      setProfiles(
        sortProfiles(
          "id" in editing
            ? profiles.map((profile) =>
                profile.id === saved.id ? saved : profile
              )
            : [...profiles, saved]
        )
      )
      setEditing(null)
      setNotice("Team profile saved.")
    } finally {
      setSaving(false)
    }
  }

  async function removeProfile(profile: TeamProfile) {
    if (!profiles) return
    if (
      !window.confirm(
        `Remove “${profile.name}” from the Meet the Team section?`
      )
    ) {
      return
    }
    setSaving(true)
    setNotice(null)
    try {
      await deleteTeamProfile(profile.id)
      setProfiles(profiles.filter((existing) => existing.id !== profile.id))
      if (editing && "id" in editing && editing.id === profile.id) {
        setEditing(null)
      }
      setNotice(`${profile.name} was removed from Meet the Team.`)
    } catch (removeError) {
      setNotice(
        removeError instanceof Error
          ? removeError.message
          : "Could not remove the team profile."
      )
    } finally {
      setSaving(false)
    }
  }

  function startNew(membership: TeamMembership) {
    setNotice(null)
    setEditing({ membership, displayOrder: nextDisplayOrder })
  }

  function renderGroup(title: string, group: TeamProfile[]) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="outline">{group.length} profiles</Badge>
        </div>
        <div className="grid gap-2">
          {group.map((profile) => (
            <Card key={profile.id} className="py-4">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    className="size-12 rounded-lg object-cover"
                    src={profile.portraitImage}
                    alt=""
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{profile.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      #{profile.displayOrder} · {profile.role} ·{" "}
                      {profile.portfolio} ·{" "}
                      {membershipLabel(profile.membership)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onClick={() => {
                      setNotice(null)
                      setEditing(profile)
                    }}
                  >
                    <PencilIcon data-icon="inline-start" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={saving}
                    onClick={() => void removeProfile(profile)}
                  >
                    <Trash2Icon data-icon="inline-start" /> Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  const committee = profiles?.filter(
    (profile) => profile.membership !== "other"
  )
  const subcommittee = profiles?.filter(
    (profile) => profile.membership === "other"
  )

  return (
    <section
      className="space-y-5 border-t pt-8"
      aria-labelledby="team-admin-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="team-admin-title" className="text-2xl font-semibold">
            Meet the Team profiles
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Profiles stay ordered by display order. Subcommittee profiles remain
            in their separate carousel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => startNew("executive")}>
            <PlusIcon data-icon="inline-start" /> Add committee member
          </Button>
          <Button onClick={() => startNew("other")}>
            <PlusIcon data-icon="inline-start" /> Add subcommittee member
          </Button>
        </div>
      </div>

      {notice ? (
        <p className="rounded-lg border bg-muted/40 p-3 text-sm" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {editing ? (
        <TeamEditor
          key={"id" in editing ? editing.id : `new-${editing.membership}`}
          profile={"id" in editing ? editing : undefined}
          defaultMembership={editing.membership}
          defaultDisplayOrder={editing.displayOrder}
          saving={saving}
          onSave={saveProfile}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      {profiles === null && !error ? (
        <p className="text-sm text-muted-foreground">Loading team profiles…</p>
      ) : null}
      {committee && subcommittee ? (
        <div className="grid gap-8">
          {renderGroup("Executive and director carousel", committee)}
          {renderGroup("Subcommittee carousel", subcommittee)}
        </div>
      ) : null}
    </section>
  )
}
