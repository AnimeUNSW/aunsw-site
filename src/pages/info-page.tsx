import { ContactSection } from "@/components/info/contact-section"
import { DiscordSection } from "@/components/info/discord-section"
import { FAQAccordion } from "@/components/info/faq-accordion"
import { MembershipInstructions } from "@/components/info/membership-instructions"
import { PageHeader } from "@/components/shared/page-header"
import { Separator } from "@/components/ui/separator"
import { useFaqs } from "@/hooks/use-faqs"
import { useSiteContent } from "@/hooks/use-site-content"

export function InfoPage() {
  const faqs = useFaqs()
  const siteContent = useSiteContent()

  return (
    <div className="space-y-9">
      <PageHeader
        badge="Help"
        title="Info"
        description="Membership instructions, Discord access, FAQ answers, and contact details."
      />
      <Separator className="bg-gradient-to-r from-primary/30 via-accent/40 to-transparent" />
      <section className="space-y-4" aria-labelledby="membership-title">
        <h2
          id="membership-title"
          className="text-xl font-semibold tracking-[0.02em]"
        >
          Membership Instructions
        </h2>
        <MembershipInstructions paths={siteContent.membershipPaths} />
      </section>
      <section className="space-y-4" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-xl font-semibold tracking-[0.02em]">
          Frequently Asked Questions
        </h2>
        <FAQAccordion faqs={faqs} />
      </section>
      <section className="space-y-4" aria-labelledby="discord-title">
        <h2
          id="discord-title"
          className="text-xl font-semibold tracking-[0.02em]"
        >
          Discord
        </h2>
        <DiscordSection
          overview={siteContent.discordOverview}
          inviteUrl={siteContent.socialLinks.discord}
        />
      </section>
      <section className="space-y-4" aria-labelledby="contact-title">
        <h2
          id="contact-title"
          className="text-xl font-semibold tracking-[0.02em]"
        >
          Contact
        </h2>
        <ContactSection contacts={siteContent.contacts} />
      </section>
    </div>
  )
}
