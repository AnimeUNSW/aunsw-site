import { Link, useLocation } from "react-router-dom"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

import { NAV_ITEMS } from "./nav-items"

export function Navbar({ showAdmin = false }: { showAdmin?: boolean }) {
  const location = useLocation()
  const items = showAdmin
    ? [...NAV_ITEMS, { label: "Admin", to: "/admin" }]
    : NAV_ITEMS

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="gap-1">
        {items.map((item) => {
          const isActive = location.pathname === item.to

          return (
            <NavigationMenuItem key={item.to}>
              <NavigationMenuLink
                asChild
                className={cn(
                  "font-medium tracking-wide",
                  isActive &&
                    "bg-gradient-to-r from-primary/20 to-accent/20 text-foreground"
                )}
              >
                <Link to={item.to} aria-current={isActive ? "page" : undefined}>
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
