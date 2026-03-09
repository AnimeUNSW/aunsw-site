export interface NavItem {
  label: string
  to: string
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Sponsors", to: "/sponsors" },
  { label: "Meet the Team", to: "/team" },
  { label: "Info", to: "/info" },
]
