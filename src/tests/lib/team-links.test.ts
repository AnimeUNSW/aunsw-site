import { describe, expect, it } from "vitest"
import { parseTeamProfiles } from "@/lib/content-validation"

const profile = {
  id: "sample",
  name: "Sample",
  role: "IT Executive",
  membership: "executive",
  portfolio: "IT",
  displayOrder: 0,
  portraitImage: "/team/sample.webp",
  portraitAlt: "Sample",
  degree: [],
  funFacts: [],
  favoriteAnime: [],
}

describe("team Discord links", () => {
  it("keeps older unlinked cards valid and preserves optional linked string IDs", () => {
    expect(parseTeamProfiles([profile])[0].discordId).toBeUndefined()
    expect(
      parseTeamProfiles([{ ...profile, discordId: "419431549797269504" }])[0]
        .discordId
    ).toBe("419431549797269504")
  })
  it("rejects lossy numeric and invalid Discord IDs", () => {
    for (const discordId of [
      419431549797269504,
      "wrong",
      "9999999999999999999",
    ])
      expect(() => parseTeamProfiles([{ ...profile, discordId }])).toThrow()
  })
})
