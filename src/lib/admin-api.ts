import { API_BASE_URL } from "@/lib/account-api"
import type { Event } from "@/types/content"

export type EventInput = Omit<Event, "id" | "isRecurring">

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

export async function getAdminEvents(signal?: AbortSignal): Promise<Event[]> {
  const payload = await adminRequest<{ events: Event[] }>("/v1/admin/events", {
    signal,
  })
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
  return adminRequest(`/v1/admin/events/${encodeURIComponent(id)}/attendance`, {
    method: "POST",
    headers: { "Content-Type": file.type || "text/csv" },
    body: file,
  })
}
