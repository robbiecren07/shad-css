import fs from 'node:fs/promises'
import path from 'node:path'

export async function getDocSlugs() {
  const docsDir = path.join(process.cwd(), 'content/docs')
  const files = await fs.readdir(docsDir)

  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      // 'introduction' maps to [] (so /docs)
      return { slug: slug === 'introduction' ? [] : [slug] }
    })
}
