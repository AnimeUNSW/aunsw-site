import { useMemo } from "react"

import { getSponsors } from "@/lib/content-repository"

export function useSponsors() {
  return useMemo(() => getSponsors(), [])
}
