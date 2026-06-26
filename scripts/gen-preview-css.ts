// Read the original portfolio style.css and emit a TS module that exports
// the contents as a `PREVIEW_CSS` string constant.

import * as fs from 'node:fs'
import * as path from 'node:path'

const SRC = '/home/z/my-project/upload/My-Portfolio-main-extracted/My-Portfolio-main/style.css'
const DEST = '/home/z/my-project/src/lib/preview-css.ts'

const css = fs.readFileSync(SRC, 'utf8')

// Escape backticks and ${ in CSS for safe embedding in a TS template literal.
const escaped = css
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${')

const tsModule = `// AUTO-GENERATED from the original portfolio style.css.
// Do not edit by hand — re-run scripts/gen-preview-css.ts to regenerate.

export const PREVIEW_CSS = \`${escaped}\`
`

fs.writeFileSync(DEST, tsModule, 'utf8')
console.log(`Wrote ${DEST} (${tsModule.length} bytes)`)
