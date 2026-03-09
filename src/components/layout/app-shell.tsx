import type { PropsWithChildren } from "react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-svh bg-[radial-gradient(60rem_30rem_at_0%_0%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_65%),radial-gradient(56rem_28rem_at_100%_0%,color-mix(in_oklab,var(--color-accent)_20%,transparent),transparent_68%),repeating-linear-gradient(135deg,color-mix(in_oklab,var(--color-border)_32%,transparent)_0_1px,transparent_1px_13px)]">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_35%,transparent)] focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Header />
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6 md:py-14"
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}
