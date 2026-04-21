import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'
import { v2 as cloudinary } from 'cloudinary'
import path from 'path'
import { Readable } from 'stream'

interface CloudinaryAdapterOptions {
  cloudName: string
  apiKey: string
  apiSecret: string
  folder?: string
}

export function cloudinaryAdapter({
  cloudName,
  apiKey,
  apiSecret,
  folder = 'garlicton',
}: CloudinaryAdapterOptions): Adapter {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })

  return (): GeneratedAdapter => ({
    name: 'cloudinary',

    generateURL: ({ data, filename }) => {
      if (typeof data?.url === 'string' && data.url.trim()) {
        return data.url
      }

      return `https://res.cloudinary.com/${cloudName}/image/upload/${filename}`
    },

    handleUpload: async ({ data, file: rawFile }) => {
      const file = rawFile as unknown as { data: Buffer; name: string; mimetype: string; size: number }
      const ext = path.extname(file.name || '').replace('.', '')
      const baseName = path.basename(file.name || 'upload', `.${ext}`)
      const publicId = `${folder}/${baseName}-${Date.now()}`

      const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { public_id: publicId, resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result as { secure_url: string; public_id: string })
          },
        )

        const readable = new Readable()
        readable.push(file.data)
        readable.push(null)
        readable.pipe(uploadStream)
      })

      return {
        ...data,
        filename: result.public_id,
        url: result.secure_url,
      }
    },

    handleDelete: async ({ filename }) => {
      if (!filename) return
      try {
        await cloudinary.uploader.destroy(filename)
      } catch {
        // Ignore
      }
    },

    staticHandler: async () => {
      return new Response('Not found', { status: 404 })
    },
  })
}
