import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MembershipPath } from "@/types/content"

interface MembershipInstructionsProps {
  paths: MembershipPath[]
}

export function MembershipInstructions({ paths }: MembershipInstructionsProps) {
  if (paths.length === 0) {
    return null
  }

  const defaultPath = paths[0]

  if (!defaultPath) {
    return null
  }

  return (
    <Tabs defaultValue={defaultPath.id} className="gap-4">
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-primary/20 bg-background/60 p-1">
        {paths.map((path) => (
          <TabsTrigger
            key={path.id}
            value={path.id}
            className="rounded-md px-3 py-2 data-active:bg-gradient-to-r data-active:from-primary/20 data-active:to-accent/25"
          >
            {path.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {paths.map((path) => (
        <TabsContent key={path.id} value={path.id}>
          <Card className="border-primary/20 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-card)_96%,var(--color-primary)),var(--color-card))]">
            <CardHeader>
              <CardTitle>{path.label}</CardTitle>
              <CardDescription>{path.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2" aria-label={`${path.label} steps`}>
                {path.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-accent/35 font-medium">
                      {index + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
