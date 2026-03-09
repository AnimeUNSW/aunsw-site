import type { PropsWithChildren, ReactElement } from "react"
import { MemoryRouter } from "react-router-dom"
import { render } from "@testing-library/react"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

interface RenderOptions {
  route?: string
}

function Wrapper({ children, route = "/" }: PropsWithChildren<RenderOptions>) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="test-theme">
      <TooltipProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <Wrapper route={options.route}>{children}</Wrapper>
    ),
  })
}
