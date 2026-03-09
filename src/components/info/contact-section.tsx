import { MailIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Contact } from "@/types/content"

export function ContactSection({ contacts }: { contacts: Contact[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2" aria-label="Contact emails">
      {contacts.map((contact) => (
        <li key={contact.email}>
          <Card className="border-primary/20 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-card)_96%,var(--color-accent)),var(--color-card))]">
            <CardHeader>
              <CardTitle>{contact.label}</CardTitle>
              <CardDescription>{contact.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/35"
                asChild
              >
                <a href={`mailto:${contact.email}`}>
                  <MailIcon className="size-4" aria-hidden />
                  Email team
                </a>
              </Button>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
