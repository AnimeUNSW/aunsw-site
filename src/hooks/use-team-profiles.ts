import { useMemo } from "react"

import { getTeamProfiles } from "@/lib/content-repository"

export function useTeamProfiles() {
  return useMemo(() => getTeamProfiles(), [])
}
