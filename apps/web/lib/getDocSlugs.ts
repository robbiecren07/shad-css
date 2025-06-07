import fs from 'node:fs/promises'
import path from 'node:path'

// Helper function to get slugs from filenames
export async function getDocSlugs() {
  const docsDir = path.join(process.cwd(), 'content/docs')
  const files = await fs.readdir(docsDir)

  // Only use .mdx files and strip extension for the slug
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => ({
      slug: file.replace(/\.mdx$/, ''),
    }))
}
