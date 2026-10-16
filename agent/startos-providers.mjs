// Writes the model servers StartOS connected (STARTOS_PROVIDERS, built by
// main.ts) into the llm-pi-ai entry of dsh's profile patch, before dsh starts.
// Routes named startos-* belong to StartOS: they are rewritten on every start
// and dropped once their server is disconnected. Every other provider is the
// user's, saved by the Models page, and is left untouched — as are comments
// and `!!js` expressions, the way dsh's own config editor keeps them.
//
// Usage: node startos-providers.mjs <path to cordis.patch.yml>
import { readFileSync, renameSync, writeFileSync } from 'node:fs'
import { isMap, isSeq, parseDocument } from 'yaml'

const ENTRY_ID = 'llm-pi-ai'
const ENTRY_NAME = '@deepseek-ai/dsh-llm-pi-ai'
const PREFIX = 'startos-'

const path = process.argv[2]
const wanted = JSON.parse(process.env.STARTOS_PROVIDERS || '{}')

const before = readFileSync(path, 'utf8')
const doc = parseDocument(before, {
  customTags: [{ tag: 'tag:yaml.org,2002:js', resolve: (value) => value }],
})
if (doc.errors.length) throw doc.errors[0]
if (!isSeq(doc.contents)) throw new Error(`${path} is not a YAML sequence`)
// dsh seeds the file as `[]`; write rows in block style, as dsh's editor does.
doc.contents.flow = false

// The row dsh's config editor writes this entry's config to.
const index = doc.contents.items.findLastIndex(
  (item, i) =>
    isMap(item) &&
    doc.getIn([i, 'id']) === ENTRY_ID &&
    !item.has('insert') &&
    (!item.has('name') || doc.getIn([i, 'name']) === ENTRY_NAME),
)

if (index < 0) {
  if (Object.keys(wanted).length) {
    doc.add(
      doc.createNode({
        id: ENTRY_ID,
        name: ENTRY_NAME,
        config: { providers: wanted },
      }),
    )
  }
} else {
  const providers = doc.getIn([index, 'config', 'providers'], true)
  if (providers !== undefined && !isMap(providers)) {
    console.warn(
      `[startos-providers] ${ENTRY_ID} providers is not a plain mapping; leaving it as it is`,
    )
    process.exit(0)
  }
  for (const pair of providers?.items ?? []) {
    const name = String(pair.key?.value ?? pair.key)
    if (name.startsWith(PREFIX) && !(name in wanted)) {
      doc.deleteIn([index, 'config', 'providers', name])
    }
  }
  for (const [name, route] of Object.entries(wanted)) {
    doc.setIn([index, 'config', 'providers', name], doc.createNode(route))
  }
}

const after = String(doc)
if (after !== before) {
  writeFileSync(`${path}.startos-tmp`, after, { mode: 0o600 })
  renameSync(`${path}.startos-tmp`, path)
}
const names = Object.keys(wanted)
console.log(
  `[startos-providers] model servers from StartOS: ${names.length ? names.join(', ') : 'none'}`,
)
