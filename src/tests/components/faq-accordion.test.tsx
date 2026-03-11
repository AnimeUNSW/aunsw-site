import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { FAQAccordion } from "@/components/info/faq-accordion"
import { getFaqs } from "@/lib/content-repository"
import { renderWithProviders } from "@/tests/render-with-providers"

describe("FAQAccordion", () => {
  it("expands and collapses answers", async () => {
    const user = userEvent.setup()
    const [firstFaq] = getFaqs()

    if (!firstFaq) {
      throw new Error("Expected FAQ data")
    }

    renderWithProviders(<FAQAccordion faqs={[firstFaq]} />)

    const trigger = screen.getByRole("button", {
      name: new RegExp(firstFaq.question, "i"),
    })
    // trigger should use pointer cursor so it feels clickable
    expect(trigger).toHaveStyle({ cursor: "pointer" })
    await user.click(trigger)

    expect(screen.getByText(firstFaq.answer)).toBeVisible()

    await user.click(trigger)
    expect(screen.queryByText(firstFaq.answer)).not.toBeInTheDocument()
  })
})
