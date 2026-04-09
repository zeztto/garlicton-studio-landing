import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadPrepareRuntime } from './prepare-sqlite.mjs'
import { CLOUDINARY_ENV_KEYS, getMissingEnvKeys } from './runtime-env.mjs'

const LOG_PREFIX = '[seed-gallery]'

export async function seedGalleryAssets({
  log = console.log,
  loadRuntime = loadPrepareRuntime,
} = {}) {
  const missingCloudinaryEnvKeys = getMissingEnvKeys(CLOUDINARY_ENV_KEYS)

  if (missingCloudinaryEnvKeys.length > 0) {
    throw new Error(
      `${LOG_PREFIX} Missing required Cloudinary environment variables: ${missingCloudinaryEnvKeys.join(', ')}`,
    )
  }

  const { config, getPayload, seedGalleryUploads, starterGallerySeedCount } = await loadRuntime()
  let payload

  try {
    payload = await getPayload({ config })

    log(
      `${LOG_PREFIX} Running explicit starter gallery upload with Cloudinary enabled.`,
    )

    await seedGalleryUploads(payload, {
      allowGalleryUpload: true,
      phase: 'bootstrap',
    })

    const updatedGallery = await payload.find({ collection: 'gallery', limit: 1 })

    if (updatedGallery.totalDocs === 0) {
      throw new Error(
        `${LOG_PREFIX} Gallery seed finished without creating any entries. Check Cloudinary credentials and upload logs.`,
      )
    }

    if (
      typeof starterGallerySeedCount === 'number' &&
      updatedGallery.totalDocs < starterGallerySeedCount
    ) {
      throw new Error(
        `${LOG_PREFIX} Gallery seed is incomplete (${updatedGallery.totalDocs}/${starterGallerySeedCount}). Clean up partial starter entries and rerun the command.`,
      )
    }

    log(
      `${LOG_PREFIX} Gallery seed finished. Gallery now has ${updatedGallery.totalDocs} item(s).`,
    )

    return {
      totalDocs: updatedGallery.totalDocs,
    }
  } finally {
    if (payload) {
      await payload.destroy()
    }
  }
}

const isDirectExecution = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false

if (isDirectExecution) {
  void seedGalleryAssets().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
