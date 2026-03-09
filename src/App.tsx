import { BrowserRouter } from "react-router-dom"

import { AppRoutes } from "@/app/app-routes"
import { AppShell } from "@/components/layout/app-shell"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </TooltipProvider>
  )
}
