const requiredEnv = ['DATABASE_URI', 'PAYLOAD_SECRET']

const productionRequiredEnv = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_SITE_URL',
  'PREVIEW_SECRET',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'TURNSTILE_SECRET_KEY',
]

const missing = requiredEnv.filter((key) => !process.env[key]?.trim())

if (process.env.NODE_ENV === 'production') {
  missing.push(...productionRequiredEnv.filter((key) => !process.env[key]?.trim()))
}

if (missing.length > 0) {
  console.error(
    `[validate-runtime-env] Missing required environment variables: ${missing.join(', ')}`,
  )
  process.exit(1)
}

console.log('[validate-runtime-env] Required environment variables are present.')
