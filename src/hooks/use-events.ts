import { useMemo } from "react"

import { getEvents } from "@/lib/content-repository"
import type { EventCategory } from "@/types/content"

export function useEvents(category: EventCategory | "all" = "all") {
  return useMemo(() => {
    const events = getEvents()

    if (category === "all") {
      return events
    }

    return events.filter((event) => event.category.includes(category))
  }, [category])
}
