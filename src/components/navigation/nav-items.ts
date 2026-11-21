export interface NavItem {
  label: string
  to: string
  external?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Sponsors", to: "/sponsors" },
  { label: "Meet the Team", to: "/team" },
  { label: "Info", to: "/info" },
  { label: "Leaderboard", to: "/leaderboard" },
  { label: "Account", to: "/account" },
  {
    label: "Constitution",
    to: "https://docs.google.com/document/d/1UxDvBf9viiRuanWgl7T0Xz_pI8WR5ZjkE2mKj_sh1Uc/edit?usp=sharing",
    external: true,
  },
]
