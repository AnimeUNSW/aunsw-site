import { useMemo, useState } from "react"
import { ExternalLinkIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MembershipSteps } from "@/types/content"

interface MembershipInstructionsProps {
  steps: MembershipSteps
}

export function MembershipInstructions({ steps }: MembershipInstructionsProps) {
  const path = steps

  if (!path) {
    return null
  }

  const tabs = path.tabs ?? []
  const [activeTab, setActiveTab] = useState("join-home")

  return (
    <Card className="border-primary/20 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-card)_96%,var(--color-primary)),var(--color-card))]">
      <CardHeader>
        <CardTitle>{path.label}</CardTitle>
        <CardDescription>{path.summary}</CardDescription>
        {path.linkUrl ? (
          <a
            href={path.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {path.linkLabel ?? "Open link"}
            <ExternalLinkIcon className="size-4" aria-hidden />
          </a>
        ) : null}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="w-full">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <ol className="space-y-2" aria-label={`${tab.label} steps`}>
                {tab.steps.map((step, index) => {
                  const renderedStep = (() => {
                    if (path.linkUrl && step === "Open the Rubric app or website") {
                      return (
                        <span>
                          Open the Rubric mobile app or {' '}
                          <a
                            href={path.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-primary underline"
                          >
                            website
                          </a>
                        </span>
                      )
                    }

                    return step
                  })()

                  return (
                    <li key={`${step}-${index}`} className="flex gap-3 text-sm">
                      <span className="inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-primary/25 to-accent/35 font-medium">
                        {index + 1}
                      </span>
                      <span className="pt-1">{renderedStep}</span>
                    </li>
                  )
                })}
              </ol>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
