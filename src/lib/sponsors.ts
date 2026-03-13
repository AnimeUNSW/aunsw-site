import type { Sponsor } from "@/types/content"

const PERCENT_PATTERN = /\b\d+\s*%/
const DISCOUNT_WORD_PATTERN = /\bdiscount(?:ed)?\b/
const OFF_WORD_PATTERN = /\boff\b/

export function hasMemberDiscountOffer(sponsor: Sponsor) {
  if (sponsor.promoCode?.trim()) {
    return true
  }

  const description = sponsor.discountDescription.toLowerCase()

  return (
    PERCENT_PATTERN.test(description) ||
    DISCOUNT_WORD_PATTERN.test(description) ||
    OFF_WORD_PATTERN.test(description)
  )
}
