import { EventCard } from "@/components/events/event-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Event } from "@/types/content"

interface EventListProps {
  events: Event[]
  emptyLabel?: string
}

export function EventList({
  events,
  emptyLabel = "No events found.",
}: EventListProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Events Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{emptyLabel}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ul
      className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3"
      aria-label="Event list"
    >
      {events.map((event) => (
        <li key={event.id} id={event.slug} className="flex h-full">
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  )
}
