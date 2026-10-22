import { copyFile } from "node:fs/promises"

// GitHub Pages serves this document for deep links before React takes over.
await copyFile(
  new URL("../dist/index.html", import.meta.url),
  new URL("../dist/404.html", import.meta.url)
)
