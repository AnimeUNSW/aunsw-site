import { useState } from "react"

import { EventList } from "@/components/events/event-list"
import { EventsTabs } from "@/components/events/events-tabs"
import { PageHeader } from "@/components/shared/page-header"
import { Separator } from "@/components/ui/separator"
import { useEvents } from "@/hooks/use-events"
import type { EventCategory } from "@/types/content"

export function EventsPage() {
  const [category, setCategory] = useState<EventCategory | "all">("all")
  const events = useEvents(category)

  return (
    <div className="space-y-7">
      <PageHeader
        badge="Calendar"
        title="Events"
        description="Explore club events, competition nights, cosplay competitions, and other challenges. Note that you must be a member to attend our events."
      />
      <Separator className="bg-gradient-to-r from-primary/30 via-accent/40 to-transparent" />
      <section className="space-y-5" aria-label="Event filters and list">
        <EventsTabs
          value={category}
          onValueChange={(value) => setCategory(value as EventCategory | "all")}
        />
        <EventList
          events={events}
          emptyLabel="No events found for this category. Try a different filter."
        />
      </section>
    </div>
  )
}
