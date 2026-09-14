import { API_BASE_URL } from "@/lib/account-api"
import type { Event, TeamProfile } from "@/types/content"

export type EventInput = Omit<Event, "id" | "isRecurring">
export type TeamProfileInput = Omit<TeamProfile, "id">
export interface AttendanceUpload {
  id: string
  fileName: string
  importedAt: string
  attendanceCount: number
}
export type AdminEvent = Event & {
  attendanceCount: number
  attendanceUploads: AttendanceUpload[]
}

export interface EventImageUploadResult {
  image: string
}

export interface TeamImageUploadResult {
  portraitImage: string
}

export interface AttendanceImportResult {
  total_rows: number
  unique_valid_zids: number
  duplicate_rows: number
  placeholder_rows: number
  invalid_rows: number
  matched_users: number
  newly_recorded: number
  already_recorded: number
  unmatched_zids: number
  ambiguous_zids: number
  upload_id: string
  imported_at: string
  file_name: string
  xp_awarded: number
}

export interface AttendanceRemovalResult {
  removed: number
}

export class AdminAccessError extends Error {}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  })

  if (response.status === 401 || response.status === 403) {
    throw new AdminAccessError(
      response.status === 401
        ? "Sign in with Discord to access the admin dashboard."
        : "The AnimeUNSW Executive role is required."
    )
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      detail?: string
    } | null
    throw new Error(
      payload?.detail || "The event update could not be completed."
    )
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export async function getAdminEvents(
  signal?: AbortSignal
): Promise<AdminEvent[]> {
  const payload = await adminRequest<{ events: AdminEvent[] }>(
    "/v1/admin/events",
    {
      signal,
    }
  )
  return payload.events
}

export function createEvent(event: EventInput): Promise<Event> {
  return adminRequest("/v1/admin/events", {
    method: "POST",
    body: JSON.stringify(event),
  })
}

export function updateEvent(id: string, event: EventInput): Promise<Event> {
  return adminRequest(`/v1/admin/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(event),
  })
}

export function deleteEvent(id: string): Promise<void> {
  return adminRequest(`/v1/admin/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export function uploadEventAttendance(
  id: string,
  file: File
): Promise<AttendanceImportResult> {
  return adminRequest(
    `/v1/admin/events/${encodeURIComponent(id)}/attendance?filename=${encodeURIComponent(file.name)}`,
    {
      method: "POST",
      headers: { "Content-Type": file.type || "text/csv" },
      body: file,
    }
  )
}

export function removeEventAttendance(
  eventId: string,
  uploadId: string
): Promise<AttendanceRemovalResult> {
  return adminRequest(
    `/v1/admin/events/${encodeURIComponent(eventId)}/attendance/${encodeURIComponent(uploadId)}`,
    { method: "DELETE" }
  )
}

export function uploadEventImage(
  slug: string,
  file: File
): Promise<EventImageUploadResult> {
  return adminRequest(
    `/v1/admin/event-images?slug=${encodeURIComponent(slug)}`,
    {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    }
  )
}

export async function getAdminTeamProfiles(
  signal?: AbortSignal
): Promise<TeamProfile[]> {
  const payload = await adminRequest<{ profiles: TeamProfile[] }>(
    "/v1/admin/team",
    { signal }
  )
  return payload.profiles
}

export function createTeamProfile(
  profile: TeamProfileInput
): Promise<TeamProfile> {
  return adminRequest("/v1/admin/team", {
    method: "POST",
    body: JSON.stringify(profile),
  })
}

export function updateTeamProfile(
  id: string,
  profile: TeamProfileInput
): Promise<TeamProfile> {
  return adminRequest(`/v1/admin/team/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(profile),
  })
}

export function deleteTeamProfile(id: string): Promise<void> {
  return adminRequest(`/v1/admin/team/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export function uploadTeamImage(
  profileName: string,
  file: File
): Promise<TeamImageUploadResult> {
  return adminRequest(
    `/v1/admin/team-images?profile=${encodeURIComponent(profileName)}`,
    {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    }
  )
}
