import { useRef, useState, type ChangeEvent } from "react"
import { UploadIcon } from "lucide-react"

import { ActionNotice } from "@/components/shared/action-notice"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  uploadEventAttendance,
  type AttendanceImportResult,
} from "@/lib/admin-api"

export function AttendanceUploader({
  eventId,
  eventTitle,
  disabled = false,
  onUploaded,
}: {
  eventId: string
  eventTitle: string
  disabled?: boolean
  onUploaded?: (result: AttendanceImportResult) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [result, setResult] = useState<AttendanceImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function selectFile(change: ChangeEvent<HTMLInputElement>) {
    const file = change.target.files?.[0]
    change.target.value = ""
    if (!file) return
    setPendingFile(file)
  }

  async function uploadPendingFile() {
    if (!pendingFile) return

    setUploading(true)
    setError(null)
    setResult(null)
    try {
      const uploadResult = await uploadEventAttendance(eventId, pendingFile)
      setResult(uploadResult)
      onUploaded?.(uploadResult)
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload attendance."
      )
    } finally {
      setUploading(false)
      setPendingFile(null)
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
        onChange={selectFile}
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
        <ActionNotice kind="success">
          <p className="font-medium">
            {result.newly_recorded} new attendance record
            {result.newly_recorded === 1 ? "" : "s"} added
          </p>
          <p className="mt-1 text-muted-foreground">
            {result.xp_awarded.toLocaleString()} XP awarded ·{" "}
            {result.already_recorded} already recorded · {result.unmatched_zids}{" "}
            zIDs not found · {result.invalid_rows} invalid ·{" "}
            {result.placeholder_rows} without a zID · {result.duplicate_rows}{" "}
            duplicate submissions
            {result.ambiguous_zids
              ? ` · ${result.ambiguous_zids} ambiguous zIDs`
              : ""}
          </p>
        </ActionNotice>
      ) : null}

      {error ? (
        <ActionNotice kind="error">
          <p className="font-medium">Attendance upload failed</p>
          <p className="mt-1 text-foreground/80">{error}</p>
        </ActionNotice>
      ) : null}

      <ConfirmDialog
        open={pendingFile !== null}
        title="Upload attendance form?"
        description={
          pendingFile
            ? `Import “${pendingFile.name}” for “${eventTitle}”? Each matched attendee will receive attendance credit and XP.`
            : "Confirm this attendance upload."
        }
        confirmLabel="Upload form"
        busy={uploading}
        onOpenChange={(open) => {
          if (!open) setPendingFile(null)
        }}
        onConfirm={uploadPendingFile}
      />
    </div>
  )
}
