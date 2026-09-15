const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = (
  configuredApiBaseUrl || "https://api.animeunsw.net"
).replace(/\/$/, "")

export interface AccountStats {
  anilist_profile: string | null
  events_attended: number
  exp: number | null
  mal_profile: string | null
  message_count: number
  quote: string | null
  rank: number | null
  term_exp: number | null
}

export interface AttendanceHistoryItem {
  event_id: string
  upload_id: string
  attended_at: string
}

export interface Account {
  attendance_history: AttendanceHistoryItem[]
  avatar_url: string | null
  discord_id: string
  display_name: string
  is_admin: boolean
  is_executive: boolean
  profile: {
    first_name: string
    last_name: string
    zid: string | null
    email: string | null
    phone_number: string | null
  }
  stats: AccountStats
  username: string
}

export interface AccountProfileChanges {
  first_name: string
  last_name: string
  phone_number: string | null
  quote: string | null
  mal_profile: string | null
  anilist_profile: string | null
}

async function accountWrite(response: Response) {
  if (response.ok) return response.json()
  const body = await response.json().catch(() => null)
  const detail = body?.detail
  if (typeof detail === "string") throw new Error(detail)
  if (Array.isArray(detail) && typeof detail[0]?.msg === "string") {
    throw new Error(detail[0].msg.replace(/^Value error, /, ""))
  }
  throw new Error("Could not save your account details. Please try again.")
}

export async function updateAccountProfile(
  changes: AccountProfileChanges
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/v1/me/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  })
  await accountWrite(response)
}

export async function requestAccountEmailChange(change: {
  kind: "email" | "zid"
  email?: string
  zid?: string
}): Promise<{ sent_to: string }> {
  const response = await fetch(`${API_BASE_URL}/v1/me/email-changes`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(change),
  })
  return accountWrite(response) as Promise<{ sent_to: string }>
}

export type LeaderboardSort = "xp" | "events"

export interface LeaderboardEntry {
  rank: number
  discord_id: string
  username: string
  display_name: string
  avatar_url: string | null
  xp: number
  events_attended: number
}

export interface Leaderboard {
  sort: LeaderboardSort
  viewer_discord_id: string
  page: number
  page_size: number
  total_entries: number
  total_pages: number
  entries: LeaderboardEntry[]
}

export class MembershipRequiredError extends Error {}
export class AuthenticationRequiredError extends Error {}

export function discordLoginUrl(frontendOrigin = window.location.origin) {
  const url = new URL(`${API_BASE_URL}/auth/discord/start`)
  url.searchParams.set(
    "return_to",
    `${frontendOrigin.replace(/\/$/, "")}/account`
  )
  return url.toString()
}

export async function getAccount(
  signal?: AbortSignal
): Promise<Account | null> {
  const response = await fetch(`${API_BASE_URL}/v1/me`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  })

  if (response.status === 401) {
    return null
  }
  if (response.status === 403) {
    throw new MembershipRequiredError(
      "You must be a member of the AnimeUNSW Discord server to use an account."
    )
  }
  if (!response.ok) {
    throw new Error("The account service is temporarily unavailable.")
  }

  return response.json() as Promise<Account>
}

export async function getLeaderboard(
  sort: LeaderboardSort,
  page: number,
  pageSize: number,
  signal?: AbortSignal
): Promise<Leaderboard> {
  const url = new URL(`${API_BASE_URL}/v1/leaderboard`)
  url.searchParams.set("sort", sort)
  url.searchParams.set("page", String(page))
  url.searchParams.set("page_size", String(pageSize))
  const response = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  })

  if (response.status === 401) {
    throw new AuthenticationRequiredError()
  }
  if (response.status === 403) {
    throw new MembershipRequiredError(
      "You must be a member of the AnimeUNSW Discord server to view the leaderboard."
    )
  }
  if (!response.ok) {
    throw new Error("The leaderboard is temporarily unavailable.")
  }

  return response.json() as Promise<Leaderboard>
}

export async function logOut(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    credentials: "include",
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Could not log out. Please try again.")
  }
}
