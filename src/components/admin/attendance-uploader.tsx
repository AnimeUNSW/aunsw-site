import { useRef, useState, type ChangeEvent } from "react"
import { UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  uploadEventAttendance,
  type AttendanceImportResult,
} from "@/lib/admin-api"

export function AttendanceUploader({
  eventId,
  eventTitle,
  disabled = false,
}: {
  eventId: string
  eventTitle: string
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<AttendanceImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function selectFile(change: ChangeEvent<HTMLInputElement>) {
    const file = change.target.files?.[0]
    change.target.value = ""
    if (!file) return
    if (
      !window.confirm(
        `Import attendance from “${file.name}” for “${eventTitle}”?`
      )
    ) {
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)
    try {
      setResult(await uploadEventAttendance(eventId, file))
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload attendance."
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="basis-full space-y-2 sm:basis-auto">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".csv,text/csv,application/vnd.ms-excel"
        disabled={disabled || uploading}
        onChange={(change) => void selectFile(change)}
      />
      <Button
        size="sm"
        variant="outline"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon data-icon="inline-start" />
        {uploading ? "Uploading…" : "Upload attendance form"}
      </Button>

      {result ? (
        <div
          className="max-w-md rounded-lg border bg-muted/40 p-3 text-sm"
          role="status"
        >
          <p className="font-medium">
            {result.newly_recorded} new attendance record
            {result.newly_recorded === 1 ? "" : "s"} added
          </p>
          <p className="mt-1 text-muted-foreground">
            {result.already_recorded} already recorded · {result.unmatched_zids}{" "}
            zIDs not found · {result.invalid_rows} invalid ·{" "}
            {result.placeholder_rows} without a zID · {result.duplicate_rows}{" "}
            duplicate submissions
            {result.ambiguous_zids
              ? ` · ${result.ambiguous_zids} ambiguous zIDs`
              : ""}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="max-w-md text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
