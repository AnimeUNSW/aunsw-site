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

export interface Account {
  avatar_url: string | null
  discord_id: string
  display_name: string
  stats: AccountStats
  username: string
}

export class MembershipRequiredError extends Error {}

export function discordLoginUrl(frontendOrigin = window.location.origin) {
  const url = new URL(`${API_BASE_URL}/auth/discord/start`)
  url.searchParams.set("return_to", `${frontendOrigin.replace(/\/$/, "")}/account`)
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

export async function logOut(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    credentials: "include",
    method: "POST",
  })

  if (!response.ok) {
    throw new Error("Could not log out. Please try again.")
  }
}
