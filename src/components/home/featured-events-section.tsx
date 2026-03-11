import { Link } from "react-router-dom"

import { EventList } from "@/components/events/event-list"
import { SectionHeader } from "@/components/shared/section-header"
import { Button } from "@/components/ui/button"
import type { Event } from "@/types/content"

export function FeaturedEventsSection({ events }: { events: Event[] }) {
  return (
    <section className="space-y-5" aria-labelledby="featured-events-title">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          badge="Up Next"
          title="Featured Events"
          description="Some of our favourite upcoming events."
          className="space-y-2"
        />
        <Button variant="outline" className="border-primary/35" asChild>
          <Link to="/events">See all events</Link>
        </Button>
      </div>
      <EventList
        events={events}
        emptyLabel="Featured events will be published soon. Check back this week."
      />
    </section>
  )
}
