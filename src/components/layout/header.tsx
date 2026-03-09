import { Link } from "react-router-dom"

import { useSiteContent } from "@/hooks/use-site-content"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { MobileNavSheet } from "@/components/navigation/mobile-nav-sheet"
import { Navbar } from "@/components/navigation/navbar"
import { ThemeToggle } from "@/components/navigation/theme-toggle"

export function Header() {
  const siteContent = useSiteContent()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link
          to="/"
          className="group flex items-center gap-2"
          aria-label="Go to home page"
        >
          <Avatar
            size="sm"
            aria-hidden
            className="ring-1 ring-primary/35 transition-transform duration-200 group-hover:scale-105"
          >
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
              AU
            </AvatarFallback>
          </Avatar>
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-sm font-semibold tracking-[0.18em] text-transparent uppercase md:text-base">
            {siteContent.clubName}
          </span>
        </Link>
        <nav className="hidden md:block" aria-label="Main navigation">
          <Navbar />
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <MobileNavSheet />
        </div>
      </div>
    </header>
  )
}
