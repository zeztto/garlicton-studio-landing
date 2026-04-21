import { DatabaseSync } from 'node:sqlite'

export interface ResolvedGalleryImage {
  id: number | string
  caption_en?: null | string
  caption_ko?: null | string
  height?: null | number
  src: string
  width?: null | number
}

function resolveSqliteFilePath(databaseUri?: string): null | string {
  if (!databaseUri?.startsWith('file:')) {
    return null
  }

  return databaseUri.slice('file:'.length) || null
}

export function getResolvedGalleryImages(): ResolvedGalleryImage[] {
  const sqliteFilePath = resolveSqliteFilePath(process.env.DATABASE_URI)

  if (!sqliteFilePath) {
    return []
  }

  const database = new DatabaseSync(sqliteFilePath, { open: true, readOnly: true })

  try {
    const statement = database.prepare(`
      select
        g.id as id,
        g.caption_ko as caption_ko,
        g.caption_en as caption_en,
        m.url as src,
        m.width as width,
        m.height as height
      from gallery g
      left join media m on m.id = g.image_id
      where m.url is not null and trim(m.url) <> ''
      order by g.sort_order asc, g.id asc
    `)

    return statement.all().map((row) => ({
      id: row.id as number | string,
      caption_ko: typeof row.caption_ko === 'string' ? row.caption_ko : null,
      caption_en: typeof row.caption_en === 'string' ? row.caption_en : null,
      height: typeof row.height === 'number' ? row.height : null,
      src: String(row.src),
      width: typeof row.width === 'number' ? row.width : null,
    }))
  } finally {
    database.close()
  }
}
