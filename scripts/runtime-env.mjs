export const CLOUDINARY_ENV_KEYS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
]

export const REQUIRED_RUNTIME_ENV_KEYS = ['DATABASE_URI', 'PAYLOAD_SECRET']

export const PRODUCTION_RUNTIME_ENV_KEYS = [
  ...CLOUDINARY_ENV_KEYS,
  'NEXT_PUBLIC_SITE_URL',
  'PREVIEW_SECRET',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'TURNSTILE_SECRET_KEY',
]

export function hasConfiguredValue(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function getMissingEnvKeys(keys, env = process.env) {
  return keys.filter((key) => !hasConfiguredValue(env[key]))
}

export function snapshotEnv(keys, env = process.env) {
  return Object.fromEntries(keys.map((key) => [key, env[key]]))
}

export function restoreEnv(snapshot, env = process.env) {
  for (const [key, value] of Object.entries(snapshot)) {
    if (typeof value === 'undefined') {
      delete env[key]
      continue
    }

    env[key] = value
  }
}
