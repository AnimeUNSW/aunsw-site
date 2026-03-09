import { useMemo } from "react"

import { getFaqs } from "@/lib/content-repository"
import type { FAQCategory } from "@/types/content"

export function useFaqs(category?: FAQCategory) {
  return useMemo(() => {
    const faqs = getFaqs()

    if (!category) {
      return faqs
    }

    return faqs.filter((faq) => faq.category === category)
  }, [category])
}
