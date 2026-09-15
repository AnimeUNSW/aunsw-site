import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NotFoundPage() {
  return (
    <div className="page-container">
      <Card className="mx-auto max-w-3xl overflow-hidden border-primary/30 bg-[linear-gradient(145deg,color-mix(in_oklab,var(--color-card)_96%,var(--color-primary)),var(--color-card))]">
        <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_1.15fr] md:items-center md:p-8">
          <div>
            <img
              src="/longarmguyshortlegguy.png"
              alt="A tall long-armed character standing beside a shorter character"
              className="mx-auto max-h-80 w-full object-contain"
            />
          </div>
          <div className="space-y-4 text-center md:text-left">
            <CardHeader className="p-0">
              <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                Error 404
              </p>
              <CardTitle className="text-3xl">Page not found</CardTitle>
            </CardHeader>
            <p className="text-sm leading-relaxed text-muted-foreground">
              These two couldn’t find the page either. It may have moved, or the
              address might be slightly off.
            </p>
            <Button asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
