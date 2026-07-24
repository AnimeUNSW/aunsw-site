import { fireEvent, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { HeroSection } from "@/components/home/hero-section"
import { renderWithProviders } from "@/tests/render-with-providers"
import type { SiteContent } from "@/types/content"

const hero: SiteContent["hero"] = {
  title: "Anime nights, socials, and community on campus",
  primaryCta: {
    label: "View Events",
    href: "/events",
  },
  secondaryCta: {
    label: "Membership Info",
    href: "/info",
  },
}

function createMediaQueryList(query: string, matches: boolean) {
  return {
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } satisfies MediaQueryList
}

describe("HeroSection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) =>
        createMediaQueryList(
          query,
          query === "(hover: hover) and (pointer: fine)"
        )
      )
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("renders the matched hero artwork decoratively with accessible content", () => {
    renderWithProviders(<HeroSection clubName="AnimeUNSW" hero={hero} />)

    expect(screen.getByTestId("hero-background")).toHaveAttribute(
      "src",
      expect.stringContaining("hero-background")
    )
    expect(screen.getByTestId("hero-background")).toHaveAttribute("alt", "")
    expect(screen.getByTestId("hero-character-layer")).toHaveClass(
      "hero-character-reveal",
      "hero-character-pointer"
    )
    expect(
      screen.getByRole("heading", { name: "AnimeUNSW" })
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Events" })).toHaveAttribute(
      "href",
      "/events"
    )
  })

  it("uses a configured background override without the matched character", () => {
    renderWithProviders(
      <HeroSection
        clubName="AnimeUNSW"
        hero={{ ...hero, image: "/custom-hero.jpg" }}
      />
    )

    expect(screen.getByTestId("hero-background")).toHaveAttribute(
      "src",
      "/custom-hero.jpg"
    )
    expect(screen.queryByTestId("hero-character-layer")).not.toBeInTheDocument()
  })

  it("eases the character in the cursor direction and back toward centre", () => {
    const animationFrames: FrameRequestCallback[] = []
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      animationFrames.push(callback)
      return animationFrames.length
    })

    renderWithProviders(<HeroSection clubName="AnimeUNSW" hero={hero} />)

    const section = screen.getByRole("region", {
      name: "AnimeUNSW hero banner",
    })
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 500,
      width: 1000,
      height: 500,
      toJSON: () => ({}),
    })
    const characterLayer = screen.getByTestId("hero-character-layer")

    animationFrames.length = 0
    fireEvent.pointerMove(section, { clientX: 1000, clientY: 500 })
    animationFrames.shift()?.(0)

    const outwardX = Number.parseFloat(
      characterLayer.style.getPropertyValue("--hero-pointer-x")
    )
    const outwardY = Number.parseFloat(
      characterLayer.style.getPropertyValue("--hero-pointer-y")
    )
    expect(outwardX).toBeGreaterThan(0)
    expect(outwardY).toBeGreaterThan(0)

    fireEvent.pointerLeave(section)
    animationFrames.shift()?.(16)

    expect(
      Number.parseFloat(
        characterLayer.style.getPropertyValue("--hero-pointer-x")
      )
    ).toBeLessThan(outwardX)
  })

  it("does not schedule pointer motion when reduced motion is requested", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) =>
        createMediaQueryList(
          query,
          query === "(prefers-reduced-motion: reduce)" ||
            query === "(hover: hover) and (pointer: fine)"
        )
      )
    )
    const requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame")

    renderWithProviders(<HeroSection clubName="AnimeUNSW" hero={hero} />)
    requestAnimationFrame.mockClear()
    fireEvent.pointerMove(
      screen.getByRole("region", { name: "AnimeUNSW hero banner" }),
      { clientX: 1000, clientY: 500 }
    )

    expect(requestAnimationFrame).not.toHaveBeenCalled()
  })

  it("cancels an active animation frame on unmount", () => {
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(42)
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame")
    const { unmount } = renderWithProviders(
      <HeroSection clubName="AnimeUNSW" hero={hero} />
    )

    const section = screen.getByRole("region", {
      name: "AnimeUNSW hero banner",
    })
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1000,
      bottom: 500,
      width: 1000,
      height: 500,
      toJSON: () => ({}),
    })
    fireEvent.pointerMove(section, { clientX: 1000, clientY: 500 })
    unmount()

    expect(cancelAnimationFrame).toHaveBeenCalledWith(42)
  })
})
