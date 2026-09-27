import { useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DAYS = [
  { id: "mon", short: "Mon", long: "Monday" },
  { id: "tue", short: "Tue", long: "Tuesday" },
  { id: "wed", short: "Wed", long: "Wednesday" },
  { id: "thu", short: "Thu", long: "Thursday" },
  { id: "fri", short: "Fri", long: "Friday" },
  { id: "sat", short: "Sat", long: "Saturday" },
  { id: "sun", short: "Sun", long: "Sunday" },
] as const

const TIMES = Array.from({ length: 18 }, (_, index) => {
  const minutes = 9 * 60 + index * 30
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
})

const SLOT_ORDER = new Map(
  TIMES.flatMap((time) => DAYS.map((day) => `${day.id}-${time}`)).map(
    (slot, index) => [slot, index]
  )
)

function displayTime(time: string) {
  const [hourText, minute] = time.split(":")
  const hour = Number(hourText)
  return `${hour > 12 ? hour - 12 : hour}:${minute} ${hour >= 12 ? "pm" : "am"}`
}

function endTime(time: string) {
  const [hourText, minuteText] = time.split(":")
  const total = Number(hourText) * 60 + Number(minuteText) + 30
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

export function WeeklyAvailabilityGrid({
  value,
  onChange,
  readOnly = false,
}: {
  value: string[]
  onChange?: (value: string[]) => void
  readOnly?: boolean
}) {
  const [dragValue, setDragValue] = useState<boolean | null>(null)
  const selected = useMemo(() => new Set(value), [value])
  const selectionRef = useRef(selected)

  useEffect(() => {
    selectionRef.current = selected
  }, [selected])

  useEffect(() => {
    if (dragValue === null) return
    const finishDrag = () => setDragValue(null)
    window.addEventListener("pointerup", finishDrag)
    window.addEventListener("pointercancel", finishDrag)
    return () => {
      window.removeEventListener("pointerup", finishDrag)
      window.removeEventListener("pointercancel", finishDrag)
    }
  }, [dragValue])

  function setSlot(slot: string, available: boolean) {
    if (readOnly || !onChange) return
    const next = new Set(selectionRef.current)
    if (available) next.add(slot)
    else next.delete(slot)
    selectionRef.current = next
    onChange(
      Array.from(next).sort(
        (left, right) => SLOT_ORDER.get(left)! - SLOT_ORDER.get(right)!
      )
    )
  }

  return (
    <div className="space-y-3">
      {!readOnly ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Click or drag across the times you are normally available. This is
            to coordinate interview times as well as gauge general availability.
          </p>
          {value.length ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onChange?.([])}
            >
              Clear availability
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-xl border bg-card/40">
        <div
          className="grid min-w-[44rem] grid-cols-[5.5rem_repeat(7,minmax(4.75rem,1fr))] select-none"
          role="grid"
          aria-label="Weekly availability from 9:00 am to 6:00 pm"
        >
          <div className="sticky left-0 z-10 border-r border-b bg-muted/90 p-2" />
          {DAYS.map((day) => (
            <div
              key={day.id}
              role="columnheader"
              className="border-r border-b bg-muted/70 p-2 text-center text-xs font-semibold last:border-r-0"
            >
              {day.short}
            </div>
          ))}
          {TIMES.flatMap((time) => [
            <div
              key={`time-${time}`}
              role="rowheader"
              className="sticky left-0 z-10 border-r border-b bg-background px-2 py-1.5 text-right text-[0.7rem] text-muted-foreground"
            >
              {displayTime(time)}
            </div>,
            ...DAYS.map((day) => {
              const slot = `${day.id}-${time}`
              const isSelected = selected.has(slot)
              const label = `${day.long}, ${displayTime(time)} to ${displayTime(endTime(time))}`
              return (
                <button
                  key={slot}
                  type="button"
                  role="gridcell"
                  aria-label={label}
                  aria-pressed={isSelected}
                  disabled={readOnly}
                  className={cn(
                    "h-8 touch-none border-r border-b transition-colors last:border-r-0 focus-visible:relative focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-primary",
                    isSelected
                      ? "bg-primary/75 hover:bg-primary/85"
                      : "bg-background/60 hover:bg-primary/15",
                    readOnly && "disabled:opacity-100"
                  )}
                  onPointerDown={(event) => {
                    if (readOnly) return
                    event.preventDefault()
                    const nextValue = !isSelected
                    setDragValue(nextValue)
                    setSlot(slot, nextValue)
                  }}
                  onPointerEnter={() => {
                    if (dragValue !== null) setSlot(slot, dragValue)
                  }}
                  onClick={(event) => {
                    if (event.detail === 0) setSlot(slot, !isSelected)
                  }}
                />
              )
            }),
          ])}
        </div>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {value.length
          ? `${value.length} half-hour ${value.length === 1 ? "slot" : "slots"} selected.`
          : readOnly
            ? "No availability recorded."
            : "Select at least one time to continue."}
      </p>
    </div>
  )
}
