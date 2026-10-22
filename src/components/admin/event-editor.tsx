import { useState, type DragEvent, type FormEvent } from "react"
import {
  CalendarClockIcon,
  ImageIcon,
  InfoIcon,
  SparklesIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { uploadEventImage, type EventInput } from "@/lib/admin-api"
import type { Event, EventCategory } from "@/types/content"

const categoryOptions: EventCategory[] = [
  "weekly",
  "collab",
  "anisyd",
  "cosplay",
  "competition",
  "past",
]

const fieldClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"

function localDateTime(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

interface EditorState {
  title: string
  slug: string
  description: string
  category: EventCategory[]
  schedule: "dated" | "recurring"
  startDateTime: string
  endDateTime: string
  recurringStartTime: string
  recurringEndTime: string
  location: string
  image: string
  imageAlt: string
  registerLink: string
  featured: boolean
}

function initialState(event?: Event): EditorState {
  return {
    title: event?.title ?? "",
    slug: event?.slug ?? "",
    description: event?.description ?? "",
    category: event?.category ?? [],
    schedule: event?.recurringStartTime ? "recurring" : "dated",
    startDateTime: localDateTime(event?.startDateTime),
    endDateTime: localDateTime(event?.endDateTime),
    recurringStartTime: event?.recurringStartTime ?? "thursday 13:00",
    recurringEndTime: event?.recurringEndTime ?? "thursday 15:00",
    location: event?.location ?? "",
    image: event?.image ?? "",
    imageAlt: event?.imageAlt ?? "",
    registerLink: event?.registerLink ?? "",
    featured: event?.featured ?? false,
  }
}

export function EventEditor({
  event,
  saving,
  onSave,
  onCancel,
}: {
  event?: Event
  saving: boolean
  onSave: (value: EventInput) => Promise<void>
  onCancel: () => void
}) {
  const [value, setValue] = useState(() => initialState(event))
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const formId = `event-editor-form-${event?.id ?? "new"}`

  function set<K extends keyof EditorState>(key: K, next: EditorState[K]) {
    setValue((current) => ({ ...current, [key]: next }))
  }

  function toggleCategory(category: EventCategory) {
    set(
      "category",
      value.category.includes(category)
        ? value.category.filter((item) => item !== category)
        : [...value.category, category]
    )
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
      setError("Event images must be 5 MB or smaller.")
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
    if (value.category.length === 0) {
      setError("Choose at least one category.")
      return
    }
    let image = value.image
    if (imageFile) {
      setUploadingImage(true)
      try {
        const uploaded = await uploadEventImage(value.slug, imageFile)
        image = uploaded.image
      } catch (uploadError) {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Could not upload the event image."
        )
        return
      } finally {
        setUploadingImage(false)
      }
    }
    const payload: EventInput = {
      slug: value.slug,
      title: value.title,
      description: value.description,
      category: value.category,
      location: value.location,
      featured: value.featured,
      ...(image ? { image } : {}),
      ...(value.imageAlt ? { imageAlt: value.imageAlt } : {}),
      ...(value.registerLink ? { registerLink: value.registerLink } : {}),
      ...(value.schedule === "dated"
        ? {
            startDateTime: new Date(value.startDateTime).toISOString(),
            endDateTime: new Date(value.endDateTime).toISOString(),
          }
        : {
            recurringStartTime: value.recurringStartTime,
            recurringEndTime: value.recurringEndTime,
          }),
    }
    try {
      await onSave(payload)
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save event."
      )
    }
  }

  return (
    <Card className="border-primary/25 shadow-sm">
      <CardHeader className="border-b bg-primary/5 py-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <SparklesIcon className="size-5" aria-hidden />
          </span>
          <div>
            <CardTitle className="text-lg">
              {event ? `Edit ${event.title}` : "Create a new event"}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {event
                ? "Update the details shown on the public events page."
                : "Add the details that visitors need to discover this event."}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-5">
        <form
          id={formId}
          className="grid gap-4"
          onSubmit={(formEvent) => void submit(formEvent)}
        >
          <section className="grid gap-4 rounded-xl border bg-muted/15 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <InfoIcon className="size-4 text-primary" aria-hidden />
              <h3 className="font-semibold">Event details</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                Title
                <input
                  className={fieldClass}
                  required
                  value={value.title}
                  onChange={(change) => set("title", change.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Page anchor
                <input
                  className={fieldClass}
                  required
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  placeholder="movie-night"
                  value={value.slug}
                  onChange={(change) =>
                    set("slug", change.target.value.toLowerCase())
                  }
                />
                <span className="text-xs font-normal text-muted-foreground">
                  /events#{value.slug || "movie-night"}
                </span>
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-medium">
              Description
              <textarea
                className={`${fieldClass} min-h-28 resize-y`}
                required
                value={value.description}
                onChange={(change) => set("description", change.target.value)}
              />
            </label>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium">Categories</legend>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <label
                    key={category}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm capitalize transition ${
                      value.category.includes(category)
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "bg-background hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={value.category.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="grid gap-4 rounded-xl border bg-muted/15 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <CalendarClockIcon className="size-4 text-primary" aria-hidden />
              <h3 className="font-semibold">Schedule & place</h3>
            </div>
            <fieldset className="grid gap-3">
              <legend className="sr-only">Schedule type</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium transition ${value.schedule === "dated" ? "border-primary/40 bg-primary/10" : "bg-background"}`}
                >
                  <input
                    type="radio"
                    checked={value.schedule === "dated"}
                    onChange={() => set("schedule", "dated")}
                  />
                  Specific date
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-medium transition ${value.schedule === "recurring" ? "border-primary/40 bg-primary/10" : "bg-background"}`}
                >
                  <input
                    type="radio"
                    checked={value.schedule === "recurring"}
                    onChange={() => set("schedule", "recurring")}
                  />
                  Weekly recurring
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {value.schedule === "dated" ? (
                  <>
                    <label className="grid gap-1.5 text-sm font-medium">
                      Starts
                      <input
                        className={fieldClass}
                        type="datetime-local"
                        required
                        value={value.startDateTime}
                        onChange={(change) =>
                          set("startDateTime", change.target.value)
                        }
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium">
                      Ends
                      <input
                        className={fieldClass}
                        type="datetime-local"
                        required
                        value={value.endDateTime}
                        onChange={(change) =>
                          set("endDateTime", change.target.value)
                        }
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="grid gap-1.5 text-sm font-medium">
                      Recurring start
                      <input
                        className={fieldClass}
                        required
                        placeholder="thursday 13:00"
                        value={value.recurringStartTime}
                        onChange={(change) =>
                          set("recurringStartTime", change.target.value)
                        }
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium">
                      Recurring end
                      <input
                        className={fieldClass}
                        required
                        placeholder="thursday 15:00"
                        value={value.recurringEndTime}
                        onChange={(change) =>
                          set("recurringEndTime", change.target.value)
                        }
                      />
                    </label>
                  </>
                )}
              </div>
            </fieldset>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                Location
                <input
                  className={fieldClass}
                  required
                  value={value.location}
                  onChange={(change) => set("location", change.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Registration URL
                <input
                  className={fieldClass}
                  type="url"
                  value={value.registerLink}
                  onChange={(change) =>
                    set("registerLink", change.target.value)
                  }
                />
              </label>
            </div>
          </section>

          <section className="grid gap-4 rounded-xl border bg-muted/15 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" aria-hidden />
              <h3 className="font-semibold">Promotion</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5 text-sm font-medium md:col-span-2">
                <span>Event image</span>
                <label
                  className="grid cursor-pointer place-items-center gap-1 rounded-xl border border-dashed border-input bg-background px-4 py-8 text-center transition hover:border-primary hover:bg-primary/5"
                  onDragOver={(dragEvent) => dragEvent.preventDefault()}
                  onDrop={dropImage}
                >
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    disabled={saving || uploadingImage}
                    onChange={(change) => selectImage(change.target.files?.[0])}
                  />
                  <ImageIcon className="mb-1 size-6 text-primary" aria-hidden />
                  <span>
                    {imageFile
                      ? imageFile.name
                      : value.image
                        ? "Drop or choose a replacement image"
                        : "Drop an image here or click to choose one"}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">
                    PNG, JPG, WebP, or GIF · maximum 5 MB
                  </span>
                </label>
              </div>
              <label className="grid gap-1.5 text-sm font-medium">
                Image description
                <input
                  className={fieldClass}
                  value={value.imageAlt}
                  onChange={(change) => set("imageAlt", change.target.value)}
                />
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border bg-background p-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={value.featured}
                  onChange={(change) => set("featured", change.target.checked)}
                />
                <span>
                  <span className="block">Feature this event</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Highlight it on the home page
                  </span>
                </span>
              </label>
            </div>
          </section>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <InfoIcon className="size-3.5" aria-hidden />
          Required fields must be completed before saving.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={saving || uploadingImage}
          >
            {uploadingImage
              ? "Uploading image…"
              : saving
                ? "Saving…"
                : "Save event"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
