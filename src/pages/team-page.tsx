import { TeamBrowser } from "@/components/team/team-browser"
import { PageHeader } from "@/components/shared/page-header"
import { Separator } from "@/components/ui/separator"
import { useTeamProfiles } from "@/hooks/use-team-profiles"

export function TeamPage() {
  const profiles = useTeamProfiles()
  const committeeProfiles = profiles.filter(profile => profile.membership !== "other")
  const subcomProfiles = profiles.filter(profile => profile.membership === "other")

  return (
    <div className="page-container space-y-7">
      <PageHeader
        badge="Committee"
        title="Meet the Team"
        description="Get to know our current executives and directors!"
      />
      <Separator className="page-divider-accent" />
      <TeamBrowser profiles={committeeProfiles} />

      <PageHeader
        badge="Subcommittee"
        title="Meet the Team"
        description="Get to know our current subcommittee members!"
      />
      <Separator className="page-divider-accent" />
      <TeamBrowser profiles={subcomProfiles} />
    </div>
  )
}
