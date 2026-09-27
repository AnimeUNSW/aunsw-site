import { API_BASE_URL } from "@/lib/account-api"

export const APPLICATION_SECTIONS = [
  "general",
  "creatives",
  "events",
  "marketing",
  "externals",
  "it",
] as const
export const PORTFOLIOS = APPLICATION_SECTIONS.slice(1)

export type ApplicationSection = (typeof APPLICATION_SECTIONS)[number]
export type Portfolio = (typeof PORTFOLIOS)[number]
export type AnswerType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "weekly_availability"

export interface ApplicationQuestion {
  id: string
  section: ApplicationSection
  fixed_key: string | null
  question_text: string
  answer_type: AnswerType
  required: boolean
  min_length: number | null
  max_length: number | null
  allow_multiple: boolean
  display_order: number
  options: string[]
}

export interface ApplicationWindow {
  id: string
  name: string
  application_type: "director" | "subcommittee"
  status?: "open" | "closed"
  opened_at: string
  closed_at?: string | null
  application_count?: number
  questions?: ApplicationQuestion[]
}

export interface ApplicationDraft {
  id?: string
  full_name: string
  preferred_name: string
  year_of_study: "1" | "2" | "3" | "4+" | "N/A" | null
  membership_number: string | null
  portfolios: Portfolio[]
  answers: Record<string, string | string[]>
  confirmation_email: string | null
  email_opt_in: boolean
}

export interface ApplicationRecord extends ApplicationDraft {
  id: string
  window_id: string
  window_name?: string
  application_type?: "director" | "subcommittee"
  status: "submitted" | "withdrawn"
  submitted_at: string | null
  withdrawn_at: string | null
  created_at?: string
  discord_id?: string
  username?: string
  display_name?: string
  answer_details?: Array<{
    question: string
    section: ApplicationSection
    answer_type: AnswerType
    answer: string | string[]
  }>
}

export interface CurrentApplicationResponse {
  window: ApplicationWindow | null
  draft?: ApplicationDraft | null
  history: ApplicationRecord[]
  verified_email?: string | null
}

export interface ApplicationFormTemplate {
  version: number
  updated_at: string
  locked: boolean
  questions: ApplicationQuestion[]
}

export interface ApplicationWindowDetail {
  window: ApplicationWindow
  questions: ApplicationQuestion[]
  applications: ApplicationRecord[]
}

export class ApplicationAccessError extends Error {}

async function applicationRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
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
    throw new ApplicationAccessError(
      response.status === 401
        ? "Sign in with Discord to continue."
        : "You must be a current AnimeUNSW Discord member."
    )
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      detail?: string | { msg?: string }[]
    } | null
    const detail = payload?.detail
    throw new Error(
      typeof detail === "string"
        ? detail
        : detail?.[0]?.msg?.replace(/^Value error, /, "") ||
            "The application request could not be completed."
    )
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getCurrentApplication(signal?: AbortSignal) {
  return applicationRequest<CurrentApplicationResponse>(
    "/v1/applications/current",
    { signal }
  )
}

export function saveApplicationDraft(draft: ApplicationDraft) {
  return applicationRequest<{ id: string; saved_at: string }>(
    "/v1/applications/current/draft",
    { method: "PUT", body: JSON.stringify(draft) }
  )
}

export function submitApplication(draft: ApplicationDraft) {
  return applicationRequest<{
    id: string
    submitted_at: string
    email_sent: boolean
  }>("/v1/applications/current/submit", {
    method: "POST",
    body: JSON.stringify(draft),
  })
}

export function withdrawApplication(id: string) {
  return applicationRequest<{ status: "withdrawn" }>(
    `/v1/applications/${encodeURIComponent(id)}/withdraw`,
    { method: "POST" }
  )
}

export function getApplicationHistory(signal?: AbortSignal) {
  return applicationRequest<{ applications: ApplicationRecord[] }>(
    "/v1/applications/history",
    { signal }
  )
}

export function getApplicationForms(signal?: AbortSignal) {
  return applicationRequest<ApplicationFormTemplate>(
    "/v1/admin/applications/forms",
    { signal }
  )
}

export function saveApplicationForms(template: ApplicationFormTemplate) {
  const questions = template.questions
    .filter((question) => !question.fixed_key)
    .map((question) => ({
      id: question.id,
      section: question.section,
      question_text: question.question_text,
      answer_type: question.answer_type,
      required: question.required,
      min_length: question.min_length,
      max_length: question.max_length,
      allow_multiple: question.allow_multiple,
      display_order: question.display_order,
      options: question.options,
    }))

  return applicationRequest<{ version: number }>(
    "/v1/admin/applications/forms",
    {
      method: "PUT",
      body: JSON.stringify({
        version: template.version,
        questions,
      }),
    }
  )
}

export async function getApplicationWindows(signal?: AbortSignal) {
  const payload = await applicationRequest<{ windows: ApplicationWindow[] }>(
    "/v1/admin/applications/windows",
    { signal }
  )
  return payload.windows
}

export function openApplicationWindow(input: {
  name: string
  application_type: "director" | "subcommittee"
}) {
  return applicationRequest<ApplicationWindow>(
    "/v1/admin/applications/windows",
    { method: "POST", body: JSON.stringify(input) }
  )
}

export function closeApplicationWindow(id: string) {
  return applicationRequest<{ status: "closed" }>(
    `/v1/admin/applications/windows/${encodeURIComponent(id)}/close`,
    { method: "POST" }
  )
}

export function deleteApplicationWindow(id: string, confirmation: string) {
  return applicationRequest<void>(
    `/v1/admin/applications/windows/${encodeURIComponent(id)}`,
    { method: "DELETE", body: JSON.stringify({ confirmation }) }
  )
}

export function getApplicationWindow(id: string, signal?: AbortSignal) {
  return applicationRequest<ApplicationWindowDetail>(
    `/v1/admin/applications/windows/${encodeURIComponent(id)}`,
    { signal }
  )
}
