import { Link, useLocation } from "react-router-dom"
import { MenuIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import { NAV_ITEMS } from "./nav-items"

export function MobileNavSheet() {
  const location = useLocation()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-primary/35 bg-background/70 md:hidden"
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-xs bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_96%,var(--color-primary)),var(--color-card))]"
      >
        <SheetHeader>
          <SheetTitle>Navigate</SheetTitle>
          <SheetDescription>
            Quick links across AnimeUNSW pages.
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="px-4 pb-4">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.to

              return (
                <li key={item.to}>
                  <SheetClose asChild>
                    <Link
                      to={item.to}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                        isActive &&
                          "bg-gradient-to-r from-primary/20 to-accent/20 text-foreground"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                </li>
              )
            })}
          </ul>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            Built for members, guests, and collaborators.
          </p>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
