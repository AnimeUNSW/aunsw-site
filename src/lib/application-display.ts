export function portfolioLabel(portfolio: string) {
  return portfolio === "it"
    ? "IT"
    : portfolio.charAt(0).toUpperCase() + portfolio.slice(1)
}

export function interviewTime(time: string | null) {
  if (!time) return "—"
  const [hourText, minute] = time.split(":")
  const hour = Number(hourText)
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "pm" : "am"}`
}
