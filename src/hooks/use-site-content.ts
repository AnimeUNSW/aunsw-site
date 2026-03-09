import { useMemo } from "react"

import { getSiteContent } from "@/lib/content-repository"

export function useSiteContent() {
  return useMemo(() => getSiteContent(), [])
}
