import { useMemo } from "react"

import { getFeaturedEvents } from "@/lib/content-repository"

export function useFeaturedEvents(limit = 3) {
  return useMemo(() => getFeaturedEvents(limit), [limit])
}
