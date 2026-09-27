import { useState } from "react"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { WeeklyAvailabilityGrid } from "@/components/applications/weekly-availability-grid"
import { renderWithProviders } from "@/tests/render-with-providers"

function TestGrid() {
  const [value, setValue] = useState<string[]>([])
  return <WeeklyAvailabilityGrid value={value} onChange={setValue} />
}

describe("WeeklyAvailabilityGrid", () => {
  it("selects and clears half-hour availability slots", async () => {
    const user = userEvent.setup()
    renderWithProviders(<TestGrid />)

    const slot = screen.getByRole("gridcell", {
      name: "Monday, 9:00 am to 9:30 am",
    })
    await user.click(slot)

    expect(slot).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByText("1 half-hour slot selected.")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Clear availability" }))

    expect(slot).toHaveAttribute("aria-pressed", "false")
    expect(
      screen.getByText("Select at least one time to continue.")
    ).toBeInTheDocument()
  })
})
