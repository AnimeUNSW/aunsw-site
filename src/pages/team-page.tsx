import { TeamBrowser } from "@/components/team/team-browser"
import { PageHeader } from "@/components/shared/page-header"
import { Separator } from "@/components/ui/separator"
import { useTeamProfiles } from "@/hooks/use-team-profiles"

export function TeamPage() {
  const profiles = useTeamProfiles()

  return (
    <div className="space-y-7">
      <PageHeader
        badge="Committee"
        title="Meet the Team"
        description="Get to know our current executives and directors!"
      />
      <Separator className="bg-gradient-to-r from-primary/30 via-accent/40 to-transparent" />
      <TeamBrowser profiles={profiles} />
    </div>
  )
}
