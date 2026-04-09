import {
  getMissingEnvKeys,
  PRODUCTION_RUNTIME_ENV_KEYS,
  REQUIRED_RUNTIME_ENV_KEYS,
} from './runtime-env.mjs'

const missing = getMissingEnvKeys(REQUIRED_RUNTIME_ENV_KEYS)

if (process.env.NODE_ENV === 'production') {
  missing.push(...getMissingEnvKeys(PRODUCTION_RUNTIME_ENV_KEYS))
}

if (missing.length > 0) {
  console.error(
    `[validate-runtime-env] Missing required environment variables: ${missing.join(', ')}`,
  )
  process.exit(1)
}

console.log('[validate-runtime-env] Required environment variables are present.')
