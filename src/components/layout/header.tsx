import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"

import { useSiteContent } from "@/hooks/use-site-content"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { MobileNavSheet } from "@/components/navigation/mobile-nav-sheet"
import { Navbar } from "@/components/navigation/navbar"
import { ThemeToggle } from "@/components/navigation/theme-toggle"
import { cn } from "@/lib/utils"

export function Header() {
  const siteContent = useSiteContent()
  const location = useLocation()
  const [hasScrolled, setHasScrolled] = useState(
    typeof window !== "undefined" ? window.scrollY > 56 : false,
  )
  const isHomeRoute = location.pathname === "/"

  useEffect(() => {
    if (!isHomeRoute) {
      return
    }

    const onScroll = () => {
      setHasScrolled(window.scrollY > 56)
    }

    const frameId = window.requestAnimationFrame(onScroll)
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener("scroll", onScroll)
    }
  }, [isHomeRoute])

  const showHeader = !isHomeRoute || hasScrolled

  return (
    <header
      className={cn(
        "z-40",
        isHomeRoute ? "fixed inset-x-0 top-0" : "sticky top-0",
      )}
    >
      <div
        className={cn(
          "w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-all duration-500 ease-out",
          showHeader
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0",
        )}
      >
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
      </div>
    </header>
  )
}
