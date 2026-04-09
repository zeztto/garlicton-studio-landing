console.warn(
  '[bootstrap-sqlite] Deprecated entrypoint. Delegating to scripts/prepare-sqlite.mjs.',
)

await import('./prepare-sqlite.mjs')
