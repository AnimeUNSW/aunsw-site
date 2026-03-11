import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "weekly", label: "Weekly" },
  { value: "collab", label: "Collab" },
  { value: "trivia", label: "Trivia" },
  { value: "cosplay", label: "Cosplay" },
  { value: "challenge", label: "Challenges" },
  { value: "past", label: "Past Events" },
] as const

interface EventsTabsProps {
  value: string
  onValueChange: (value: string) => void
}

export function EventsTabs({ value, onValueChange }: EventsTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-full">
      <TabsList
        variant="line"
        className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-primary/20 bg-background/60 p-1"
      >
        {CATEGORIES.map((category) => (
          <TabsTrigger
            key={category.value}
            value={category.value}
            className="rounded-md px-3 py-2 data-active:bg-gradient-to-r data-active:from-primary/20 data-active:to-accent/25"
          >
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
