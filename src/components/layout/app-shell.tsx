import { useLayoutEffect, type PropsWithChildren } from "react"
import { useLocation } from "react-router-dom"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"

const APP_SHELL_CLASS =
  "relative min-h-svh bg-[radial-gradient(60rem_30rem_at_0%_0%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_65%),radial-gradient(56rem_28rem_at_100%_0%,color-mix(in_oklab,var(--color-accent)_20%,transparent),transparent_68%),repeating-linear-gradient(135deg,color-mix(in_oklab,var(--color-border)_32%,transparent)_0_1px,transparent_1px_13px)]"
const SKIP_LINK_CLASS =
  "sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_35%,transparent)] focus:not-sr-only focus:absolute focus:top-4 focus:left-4"

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation()

  useLayoutEffect(() => {
    const root = document.documentElement
    const body = document.body
    const previousRootScrollBehavior = root.style.scrollBehavior
    const previousBodyScrollBehavior = body.style.scrollBehavior

    root.style.scrollBehavior = "auto"
    body.style.scrollBehavior = "auto"
    window.scrollTo(0, 0)

    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      root.style.scrollBehavior = previousRootScrollBehavior
      body.style.scrollBehavior = previousBodyScrollBehavior
    }
  }, [location.pathname])

  return (
    <div className={APP_SHELL_CLASS}>
      <a
        href="#main-content"
        className={SKIP_LINK_CLASS}
      >
        Skip to content
      </a>
      <Header />
      <main
        id="main-content"
        className="w-full flex-1 py-10 md:py-14"
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}
