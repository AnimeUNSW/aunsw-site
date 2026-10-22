import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"

// jsdom has no scroll implementation; real route scrolling is exercised in Playwright.
window.scrollTo = vi.fn()
