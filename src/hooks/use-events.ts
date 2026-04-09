import { useMemo } from "react"

import { getEvents } from "@/lib/content-repository"
import { withPastCategory } from "@/lib/events"
import type { EventCategory } from "@/types/content"

export function useEvents(category: EventCategory | "all" = "all") {
  return useMemo(() => {
    const events = getEvents().map(withPastCategory)

    if (category === "all") {
      return events
    }

    return events.filter((event) => event.category.includes(category))
  }, [category])
}
