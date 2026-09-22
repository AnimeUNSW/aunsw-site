import { useEffect, useState, type FormEvent } from "react"
import { MailCheckIcon, SaveIcon, UnlinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  removeAccountZid,
  requestAccountEmailChange,
  updateAccountProfile,
  type Account,
  type AccountProfileChanges,
} from "@/lib/account-api"

interface AccountSettingsProps {
  account: Account
  onSaved: () => Promise<void>
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"

function valueOrNull(value: string) {
  return value.trim() || null
}

export function AccountSettings({ account, onSaved }: AccountSettingsProps) {
  const [profile, setProfile] = useState({
    first_name: account.profile.first_name,
    last_name: account.profile.last_name,
    phone_number: account.profile.phone_number ?? "",
    quote: account.stats.quote ?? "",
    mal_profile: account.stats.mal_profile ?? "",
    anilist_profile: account.stats.anilist_profile ?? "",
  })
  const [email, setEmail] = useState(account.profile.email ?? "")
  const [zid, setZid] = useState(account.profile.zid ?? "")
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState<"email" | "zid" | null>(null)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [toast, setToast] = useState("")
  const [removeZidOpen, setRemoveZidOpen] = useState(false)
  const [removingZid, setRemovingZid] = useState(false)
  const hasVerifiedZid = Boolean(account.profile.zid)

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(""), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  function edit(field: keyof typeof profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError("")
    setNotice("")
    try {
      const changes: AccountProfileChanges = {
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        phone_number: valueOrNull(profile.phone_number),
        quote: valueOrNull(profile.quote),
        mal_profile: valueOrNull(profile.mal_profile),
        anilist_profile: valueOrNull(profile.anilist_profile),
      }
      await updateAccountProfile(changes)
      await onSaved()
      setNotice("Your profile has been updated.")
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not save your profile."
      )
    } finally {
      setSaving(false)
    }
  }

  async function sendVerification(
    kind: "email" | "zid",
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    setSending(kind)
    setError("")
    setNotice("")
    setToast("")
    try {
      await requestAccountEmailChange(
        kind === "email"
          ? { kind, email: email.trim() }
          : { kind, zid: zid.trim() }
      )
      setToast("Verification email sent")
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not send the verification email."
      )
    } finally {
      setSending(null)
    }
  }

  async function removeZid() {
    setRemovingZid(true)
    setError("")
    setNotice("")
    setToast("")
    try {
      await removeAccountZid()
      setZid("")
      await onSaved()
      setRemoveZidOpen(false)
      setToast("zID removed")
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not remove your zID."
      )
    } finally {
      setRemovingZid(false)
    }
  }

  return (
    <Card id="account-settings" className="scroll-mt-24">
      {toast ? (
        <p
          role="status"
          className="fixed right-5 bottom-5 z-50 rounded-full border border-emerald-300/60 bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </p>
      ) : null}
      <CardHeader>
        <CardTitle>Account settings</CardTitle>
        <CardDescription>
          Your Discord username and avatar still come from Discord. Verification
          details are private to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
        {notice ? (
          <p
            role="status"
            className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm"
          >
            {notice}
          </p>
        ) : null}

        <form
          onSubmit={(event) => void saveProfile(event)}
          className="space-y-4"
        >
          <h3 className="font-semibold">Profile details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              First name
              <input
                className={inputClass}
                maxLength={100}
                value={profile.first_name}
                onChange={(event) => edit("first_name", event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              Last name
              <input
                className={inputClass}
                maxLength={100}
                value={profile.last_name}
                onChange={(event) => edit("last_name", event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              Phone number
              <input
                className={inputClass}
                type="tel"
                maxLength={40}
                value={profile.phone_number}
                onChange={(event) => edit("phone_number", event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              MyAnimeList username
              <input
                className={inputClass}
                maxLength={80}
                value={profile.mal_profile}
                onChange={(event) => edit("mal_profile", event.target.value)}
                placeholder="Username, not a URL"
              />
            </label>
            <label className="space-y-1 text-sm">
              AniList username
              <input
                className={inputClass}
                maxLength={80}
                value={profile.anilist_profile}
                onChange={(event) =>
                  edit("anilist_profile", event.target.value)
                }
                placeholder="Username, not a URL"
              />
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            Quote
            <textarea
              className={inputClass}
              maxLength={100}
              rows={3}
              value={profile.quote}
              onChange={(event) => edit("quote", event.target.value)}
            />
          </label>
          <Button type="submit" disabled={saving}>
            <SaveIcon data-icon="inline-start" />
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </form>

        <div className="grid gap-6 border-t pt-6 lg:grid-cols-2">
          <form
            onSubmit={(event) => void sendVerification("email", event)}
            className="space-y-3"
          >
            <h3 className="font-semibold">Email address</h3>
            <p className="text-sm text-muted-foreground">
              Current: {account.profile.email ?? "Not stored"}. A new address
              must be verified before it replaces this one.
            </p>
            <label className="block space-y-1 text-sm">
              New email
              <input
                className={inputClass}
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <Button type="submit" variant="outline" disabled={sending !== null}>
              <MailCheckIcon data-icon="inline-start" />
              {sending === "email" ? "Sending…" : "Verify new email"}
            </Button>
          </form>
          <form
            onSubmit={(event) => void sendVerification("zid", event)}
            className="space-y-3"
          >
            <h3 className="font-semibold">UNSW zID</h3>
            <p className="text-sm text-muted-foreground">
              Current: {account.profile.zid ?? "Not linked"}. Your zID links
              attendance to your Discord account.
            </p>
            <label className="block space-y-1 text-sm">
              {hasVerifiedZid ? "zID" : "New zID"}
              <input
                className={inputClass}
                disabled={hasVerifiedZid}
                required
                maxLength={12}
                pattern="[zZ]?[0-9]{7}"
                placeholder="z0000000"
                value={zid}
                onChange={(event) => setZid(event.target.value)}
              />
            </label>
            <p className="text-xs text-muted-foreground">
              {hasVerifiedZid
                ? "A verified zID cannot be changed. Contact an Executive if this is incorrect."
                : "We send the confirmation to the corresponding zID@ad.unsw.edu.au address. Another member’s zID cannot be claimed."}
            </p>
            {!hasVerifiedZid ? (
              <Button
                type="submit"
                variant="outline"
                disabled={sending !== null}
              >
                <MailCheckIcon data-icon="inline-start" />
                {sending === "zid" ? "Sending…" : "Verify zID"}
              </Button>
            ) : (
              <Dialog open={removeZidOpen} onOpenChange={setRemoveZidOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="destructive">
                    <UnlinkIcon data-icon="inline-start" />
                    Remove zID
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove your verified zID?</DialogTitle>
                    <DialogDescription>
                      Attendance and XP linked through this zID will be removed.
                      You can verify a different zID afterwards.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={removingZid}
                      onClick={() => void removeZid()}
                    >
                      {removingZid ? "Removing…" : "Remove zID"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
