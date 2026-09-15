import { CircleAlertIcon, CircleCheckIcon } from "lucide-react"
import type { PropsWithChildren } from "react"

import { cn } from "@/lib/utils"

export function ActionNotice({
  kind,
  children,
}: PropsWithChildren<{ kind: "error" | "success" }>) {
  const Icon = kind === "error" ? CircleAlertIcon : CircleCheckIcon

  return (
    <div
      className={cn(
        "flex max-w-md items-start gap-3 rounded-xl border p-3 text-sm shadow-sm",
        kind === "error"
          ? "border-destructive/35 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/10 text-foreground"
      )}
      role={kind === "error" ? "alert" : "status"}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
