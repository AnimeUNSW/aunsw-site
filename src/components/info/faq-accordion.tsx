import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import type { FAQ } from "@/types/content"

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      className="rounded-2xl border border-primary/20 bg-card/85 px-4 py-2"
    >
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger>
            <span className="mr-3">{faq.question}</span>
            <Badge
              variant="outline"
              className="mr-2 border-primary/30 capitalize"
            >
              {faq.category}
            </Badge>
          </AccordionTrigger>
          <AccordionContent>
            <p>{faq.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
