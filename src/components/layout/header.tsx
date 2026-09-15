import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"

import { useTheme } from "@/components/theme-provider"
import { useSiteContent } from "@/hooks/use-site-content"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import arcLogoBlack from "@/assets/arc-logo-black.png"
import arcLogoWhite from "@/assets/arc-logo-white.webp"
import purpleLogo from "@/assets/purple_logo.gif"

import { MobileNavSheet } from "@/components/navigation/mobile-nav-sheet"
import { Navbar } from "@/components/navigation/navbar"
import { ThemeToggle } from "@/components/navigation/theme-toggle"
import { getAccount } from "@/lib/account-api"
import { cn } from "@/lib/utils"

export function Header() {
  const { resolvedTheme } = useTheme()
  const siteContent = useSiteContent()
  const location = useLocation()
  const [hasScrolled, setHasScrolled] = useState(
    typeof window !== "undefined" ? window.scrollY > 56 : false
  )
  const [isTopHoverActive, setIsTopHoverActive] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const isHomeRoute = location.pathname === "/"

  useEffect(() => {
    const controller = new AbortController()

    const refreshAccountAccess = () => {
      void getAccount(controller.signal)
        .then((account) => setIsAdmin(Boolean(account?.is_admin)))
        .catch(() => setIsAdmin(false))
    }

    refreshAccountAccess()
    window.addEventListener("aunsw:account-changed", refreshAccountAccess)
    return () => {
      controller.abort()
      window.removeEventListener("aunsw:account-changed", refreshAccountAccess)
    }
  }, [location.pathname])

  useEffect(() => {
    if (!isHomeRoute) {
      return
    }

    const onScroll = () => {
      setHasScrolled(window.scrollY > 56)
    }
    const onMouseMove = (event: MouseEvent) => {
      const insideTopTriggerZone = event.clientY <= 88
      setIsTopHoverActive((current) =>
        current === insideTopTriggerZone ? current : insideTopTriggerZone
      )
    }
    const onMouseLeave = () => {
      setIsTopHoverActive(false)
    }

    const frameId = window.requestAnimationFrame(() => {
      onScroll()
      setIsTopHoverActive(false)
    })
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [isHomeRoute])

  const showHeader = !isHomeRoute || hasScrolled || isTopHoverActive
  const arcLogo = resolvedTheme === "dark" ? arcLogoWhite : arcLogoBlack

  return (
    <header
      className={cn(
        "z-40",
        isHomeRoute ? "fixed inset-x-0 top-0" : "sticky top-0"
      )}
    >
      <div
        className={cn(
          "w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-all duration-500 ease-out",
          showHeader
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2.5">
            <a
              href="https://www.arc.unsw.edu.au/"
              target="_blank"
              rel="noreferrer"
              className="group shrink-0"
              aria-label="Open Arc UNSW website"
            >
              <img
                src={arcLogo}
                alt="Arc logo"
                className="h-8 w-auto shrink-0 object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </a>
            <span aria-hidden className="h-7 w-px shrink-0 bg-border/70" />
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
                <AvatarImage src={purpleLogo} alt="AnimeUNSW logo" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  AU
                </AvatarFallback>
              </Avatar>
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-sm font-semibold tracking-[0.18em] text-transparent uppercase md:text-base">
                {siteContent.clubName}
              </span>
            </Link>
          </div>
          <nav className="hidden md:block" aria-label="Main navigation">
            <Navbar showAdmin={isAdmin} />
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNavSheet showAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </header>
  )
}
