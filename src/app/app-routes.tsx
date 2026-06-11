import { Route, Routes } from "react-router-dom"

import { EventsPage } from "@/pages/events-page"
import { HomePage } from "@/pages/home-page"
import { InfoPage } from "@/pages/info-page"
import { NotFoundPage } from "@/pages/not-found-page"
import { SponsorsPage } from "@/pages/sponsors-page"
import { TeamPage } from "@/pages/team-page"
import { DashboardPage } from "@/pages/dashboard-page"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/sponsors" element={<SponsorsPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/info" element={<InfoPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
