import { useEffect, useRef, useState, type FormEvent } from "react"
import { ChevronDownIcon, SearchIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { ActionNotice } from "@/components/shared/action-notice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AdminAccessError,
  searchAdminMembers,
  type AdminMember,
  type AdminMemberSearch,
} from "@/lib/admin-api"

function ProfileField({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-medium break-words">{value || "Not provided"}</dd>
    </div>
  )
}

function MemberResult({ member }: { member: AdminMember }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="size-12 shrink-0">
          {member.avatar_url ? (
            <AvatarImage src={member.avatar_url} alt="" />
          ) : null}
          <AvatarFallback>
            {member.display_name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="break-words">{member.display_name}</CardTitle>
          <p className="text-sm break-words text-muted-foreground">
            {member.username
              ? `@${member.username}`
              : "No Discord username on file"}
            {member.profile.zid ? ` · ${member.profile.zid}` : ""}
          </p>
          {!member.in_server ? (
            <Badge variant="outline">Not in server</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-primary">
            View profile
            <ChevronDownIcon
              className="size-4 group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="space-y-6 pt-5">
            <section aria-label="Member details">
              <h3 className="mb-3 font-semibold">Member details</h3>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ProfileField
                  label="First name"
                  value={member.profile.first_name}
                />
                <ProfileField
                  label="Last name"
                  value={member.profile.last_name}
                />
                <ProfileField label="Discord ID" value={member.discord_id} />
                <ProfileField label="zID" value={member.profile.zid} />
                <ProfileField label="Email" value={member.profile.email} />
                <ProfileField
                  label="Phone"
                  value={member.profile.phone_number}
                />
                <ProfileField
                  label="Membership type"
                  value={
                    member.profile.membership_type === "unsw"
                      ? "UNSW"
                      : member.profile.membership_type === "non_unsw"
                        ? "Non-UNSW"
                        : member.profile.membership_type
                  }
                />
                <ProfileField
                  label="MyAnimeList username"
                  value={member.stats.mal_profile}
                />
                <ProfileField
                  label="AniList username"
                  value={member.stats.anilist_profile}
                />
              </dl>
            </section>
            <section aria-label="Server activity">
              <h3 className="mb-3 font-semibold">Server activity</h3>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Total XP", member.stats.exp ?? 0],
                  ["Term XP", member.stats.term_exp ?? 0],
                  ["Messages sent", member.stats.message_count],
                  ["Events attended", member.stats.events_attended],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-muted/40 p-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-xl font-semibold">
                      {value.toLocaleString()}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            <dl>
              <ProfileField label="Quote" value={member.stats.quote} />
            </dl>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}

export function MemberSearch({
  onAccessDenied,
}: {
  onAccessDenied: (message: string) => void
}) {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<AdminMemberSearch | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  useEffect(() => () => activeRequest.current?.abort(), [])

  async function search(value: string, page = 1) {
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await searchAdminMembers(value, page, controller.signal)
      if (!controller.signal.aborted) setResult(response)
    } catch (cause: unknown) {
      if (controller.signal.aborted) return
      const message =
        cause instanceof Error
          ? cause.message
          : "Could not search members. Please try again."
      if (cause instanceof AdminAccessError) onAccessDenied(message)
      else setError(message)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    void search(query)
  }

  return (
    <div className="space-y-5">
      <Button asChild variant="outline">
        <Link to="/admin">Back to dashboard</Link>
      </Button>
      <Card>
        <CardContent className="space-y-3 pt-6">
          <form onSubmit={submit} className="space-y-2">
            <label htmlFor="member-search" className="text-sm font-medium">
              Discord username or zID
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="member-search"
                className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 focus-visible:outline-2 focus-visible:outline-primary"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="@username or z1234567"
                minLength={2}
                maxLength={100}
                autoComplete="off"
                required
              />
              <Button
                type="submit"
                disabled={loading || query.trim().length < 2}
              >
                <SearchIcon aria-hidden />
                {loading ? "Searching…" : "Search"}
              </Button>
            </div>
          </form>
          <p className="text-sm text-muted-foreground">
            Username searches also match Discord display names and server
            nicknames. zIDs are matched exactly. Profiles are read-only.
          </p>
        </CardContent>
      </Card>
      {error ? <ActionNotice kind="error">{error}</ActionNotice> : null}
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Searching members…
        </p>
      ) : null}
      {result ? (
        <div className="space-y-4">
          <p
            role="status"
            className="text-sm break-words text-muted-foreground"
          >
            {result.total_entries === 0
              ? `No members found for “${result.query}”.`
              : `${result.total_entries} ${result.total_entries === 1 ? "member" : "members"} found for “${result.query}”.`}
          </p>
          {result.members.map((member) => (
            <MemberResult key={member.discord_id} member={member} />
          ))}
          {result.total_pages > 1 ? (
            <nav
              aria-label="Member search results"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <Button
                variant="outline"
                disabled={result.page === 1}
                onClick={() => void search(result.query, result.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {result.page} of {result.total_pages}
              </span>
              <Button
                variant="outline"
                disabled={result.page === result.total_pages}
                onClick={() => void search(result.query, result.page + 1)}
              >
                Next
              </Button>
            </nav>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
