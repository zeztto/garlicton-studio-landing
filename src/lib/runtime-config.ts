const DEFAULT_SITE_URL = 'https://www.garlicton.com'
const DEVELOPMENT_CLOUDINARY_CLOUD_NAME = 'dnlcuy2aj'
const BUILD_PAYLOAD_SECRET = 'build-only-payload-secret'
const DEVELOPMENT_PAYLOAD_SECRET = 'development-only-payload-secret'

export type CloudinaryRuntimeConfig = {
  apiKey: string
  apiSecret: string
  cloudName: string
  configured: boolean
}

const getTrimmedEnv = (name: string): string | undefined => {
  const value = process.env[name]?.trim()

  return value ? value : undefined
}

export const isProductionRuntime = (): boolean => process.env.NODE_ENV === 'production'
export const isBuildRuntime = (): boolean => process.env.NEXT_PHASE === 'phase-production-build'

export const getSiteUrl = (): string => {
  return getTrimmedEnv('NEXT_PUBLIC_SITE_URL')?.replace(/\/+$/, '') || DEFAULT_SITE_URL
}

export const getPreviewSecret = (): null | string => {
  return getTrimmedEnv('PREVIEW_SECRET') ?? null
}

export const getPayloadSecret = (): null | string => {
  const configuredSecret = getTrimmedEnv('PAYLOAD_SECRET')

  if (configuredSecret) {
    return configuredSecret
  }

  if (isBuildRuntime()) {
    return BUILD_PAYLOAD_SECRET
  }

  return isProductionRuntime() ? null : DEVELOPMENT_PAYLOAD_SECRET
}

export const requirePayloadSecret = (context: string): string => {
  const secret = getPayloadSecret()

  if (!secret) {
    throw new Error(`[${context}] PAYLOAD_SECRET must be set in production.`)
  }

  return secret
}

export const getCloudinaryRuntimeConfig = (): CloudinaryRuntimeConfig => {
  const cloudName = getTrimmedEnv('CLOUDINARY_CLOUD_NAME')
  const apiKey = getTrimmedEnv('CLOUDINARY_API_KEY')
  const apiSecret = getTrimmedEnv('CLOUDINARY_API_SECRET')
  const configured = Boolean(cloudName && apiKey && apiSecret)
  const fallbackCloudName = isProductionRuntime() && !isBuildRuntime()
    ? ''
    : DEVELOPMENT_CLOUDINARY_CLOUD_NAME

  return {
    apiKey: apiKey ?? '',
    apiSecret: apiSecret ?? '',
    cloudName: cloudName ?? fallbackCloudName,
    configured,
  }
}

export const hasCloudinaryRuntimeConfig = (): boolean => {
  return getCloudinaryRuntimeConfig().configured
}

export const requireCloudinaryRuntimeConfig = (context: string): CloudinaryRuntimeConfig => {
  const config = getCloudinaryRuntimeConfig()

  if (isProductionRuntime() && !isBuildRuntime() && !config.configured) {
    throw new Error(
      `[${context}] CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set in production.`,
    )
  }

  return config
}
