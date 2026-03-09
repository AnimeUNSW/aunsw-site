import { useMemo } from "react"

import { getCosplayBlogEntries } from "@/lib/content-repository"

export function useCosplayBlog() {
  return useMemo(() => getCosplayBlogEntries(), [])
}
