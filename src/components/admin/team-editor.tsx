import { useState, type DragEvent, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { uploadTeamImage, type TeamProfileInput } from "@/lib/admin-api"
import type { TeamMembership, TeamProfile } from "@/types/content"

const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"

const membershipOptions: Array<{
  value: TeamMembership
  label: string
}> = [
  { value: "top5", label: "Top 5" },
  { value: "executive", label: "Executive" },
  { value: "director", label: "Director" },
  { value: "other", label: "Subcommittee" },
]

interface EditorState {
  name: string
  role: string
  membership: TeamMembership
  portfolio: string
  displayOrder: string
  pronouns: string
  portraitImage: string
  portraitAlt: string
  degree: string
  funFacts: string
  favoriteAnime: string
  extras: string
  discordHandle: string
}

function lines(value?: string[]) {
  return value?.join("\n") ?? ""
}

function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function initialState(
  profile: TeamProfile | undefined,
  defaultMembership: TeamMembership,
  defaultDisplayOrder: number
): EditorState {
  return {
    name: profile?.name ?? "",
    role: profile?.role ?? "",
    membership: profile?.membership ?? defaultMembership,
    portfolio: profile?.portfolio ?? "",
    displayOrder: String(profile?.displayOrder ?? defaultDisplayOrder),
    pronouns: profile?.pronouns ?? "",
    portraitImage: profile?.portraitImage ?? "",
    portraitAlt: profile?.portraitAlt ?? "",
    degree: lines(profile?.degree),
    funFacts: lines(profile?.funFacts),
    favoriteAnime: lines(profile?.favoriteAnime),
    extras: lines(profile?.extras),
    discordHandle: profile?.discordHandle ?? "",
  }
}

export function TeamEditor({
  profile,
  defaultMembership,
  defaultDisplayOrder,
  saving,
  onSave,
  onCancel,
}: {
  profile?: TeamProfile
  defaultMembership: TeamMembership
  defaultDisplayOrder: number
  saving: boolean
  onSave: (value: TeamProfileInput) => Promise<void>
  onCancel: () => void
}) {
  const [value, setValue] = useState(() =>
    initialState(profile, defaultMembership, defaultDisplayOrder)
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof EditorState>(key: K, next: EditorState[K]) {
    setValue((current) => ({ ...current, [key]: next }))
  }

  function selectImage(file: File | undefined) {
    if (!file) return
    if (
      !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
        file.type
      )
    ) {
      setError("Choose a PNG, JPG, WebP, or GIF image.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile images must be 5 MB or smaller.")
      return
    }
    setImageFile(file)
    setError(null)
  }

  function dropImage(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    selectImage(event.dataTransfer.files[0])
  }

  async function submit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault()
    setError(null)

    let portraitImage = value.portraitImage
    if (imageFile) {
      setUploadingImage(true)
      try {
        const uploaded = await uploadTeamImage(value.name, imageFile)
        portraitImage = uploaded.portraitImage
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Could not upload the profile image."
        )
        return
      } finally {
        setUploadingImage(false)
      }
    }

    if (!portraitImage) {
      setError("Choose a profile image.")
      return
    }

    const degree = parseLines(value.degree)
    if (degree.length === 0) {
      setError("Enter at least one degree line.")
      return
    }

    const payload: TeamProfileInput = {
      name: value.name.trim(),
      role: value.role.trim(),
      membership: value.membership,
      portfolio: value.portfolio.trim(),
      displayOrder: Number(value.displayOrder),
      portraitImage,
      portraitAlt: value.portraitAlt.trim(),
      degree,
      funFacts: parseLines(value.funFacts),
      favoriteAnime: parseLines(value.favoriteAnime),
      ...(value.pronouns.trim() ? { pronouns: value.pronouns.trim() } : {}),
      ...(value.discordHandle.trim()
        ? { discordHandle: value.discordHandle.trim() }
        : {}),
      ...(parseLines(value.extras).length
        ? { extras: parseLines(value.extras) }
        : {}),
    }

    try {
      await onSave(payload)
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save the team profile."
      )
    }
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle>
          {profile ? `Edit ${profile.name}` : "Add team profile"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5"
          onSubmit={(formEvent) => void submit(formEvent)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Name
              <input
                className={fieldClass}
                required
                value={value.name}
                onChange={(change) => set("name", change.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Role
              <input
                className={fieldClass}
                required
                placeholder="Events Director"
                value={value.role}
                onChange={(change) => set("role", change.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Profile type
              <select
                className={fieldClass}
                value={value.membership}
                onChange={(change) =>
                  set("membership", change.target.value as TeamMembership)
                }
              >
                {membershipOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Portfolio
              <input
                className={fieldClass}
                required
                placeholder="Events"
                value={value.portfolio}
                onChange={(change) => set("portfolio", change.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Display order
              <input
                className={fieldClass}
                type="number"
                min="0"
                max="10000"
                required
                value={value.displayOrder}
                onChange={(change) => set("displayOrder", change.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Pronouns
              <input
                className={fieldClass}
                value={value.pronouns}
                onChange={(change) => set("pronouns", change.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Discord username
              <input
                className={fieldClass}
                value={value.discordHandle}
                onChange={(change) => set("discordHandle", change.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Image description
              <input
                className={fieldClass}
                required
                value={value.portraitAlt}
                onChange={(change) => set("portraitAlt", change.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-1.5 text-sm font-medium">
            <span>Profile image</span>
            <label
              className="grid cursor-pointer place-items-center gap-1 rounded-lg border border-dashed border-input bg-muted/30 px-4 py-6 text-center transition hover:border-primary"
              onDragOver={(event) => event.preventDefault()}
              onDrop={dropImage}
            >
              <input
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={saving || uploadingImage}
                onChange={(change) => selectImage(change.target.files?.[0])}
              />
              <span>
                {imageFile
                  ? imageFile.name
                  : value.portraitImage
                    ? "Drop or choose a replacement image"
                    : "Drop an image here or click to choose one"}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                PNG, JPG, WebP, or GIF · maximum 5 MB
              </span>
            </label>
          </div>

          {[
            ["degree", "Degree", "One degree line per row"],
            ["funFacts", "Fun facts", "One fact per row"],
            ["favoriteAnime", "Favourite anime", "One title per row"],
            ["extras", "Extras", "Optional; one item per row"],
          ].map(([key, label, placeholder]) => (
            <label key={key} className="grid gap-1.5 text-sm font-medium">
              {label}
              <textarea
                className={`${fieldClass} min-h-24 resize-y`}
                required={key === "degree"}
                placeholder={placeholder}
                value={value[key as keyof EditorState]}
                onChange={(change) =>
                  set(key as keyof EditorState, change.target.value)
                }
              />
            </label>
          ))}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploadingImage}>
              {uploadingImage
                ? "Uploading image…"
                : saving
                  ? "Saving…"
                  : "Save profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
