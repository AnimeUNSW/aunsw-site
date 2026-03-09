import { AlertTriangleIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SponsorTermsNotice() {
  return (
    <Card size="sm" className="border-accent/35 bg-accent/8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangleIcon className="size-4 text-accent" aria-hidden />
          Discount notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Sponsor offers can change during term. Always check individual terms
          before purchasing.
        </p>
      </CardContent>
    </Card>
  )
}
