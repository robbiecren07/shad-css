import type { Metadata } from 'next'
import { getDocSlugs } from '@/lib/getDocSlugs'

interface Props {
  params: {
    slug: string[]
  }
}

export const dynamicParams = false

export async function generateStaticParams() {
  return await getDocSlugs()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const doc = await import(`@/content/docs/${slug}.mdx`)

  if (!doc) {
    return {}
  }

  return {
    title: doc.title,
    description: doc.description,
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { default: Post } = await import(`@/content/docs/${slug}.mdx`)

  return (
    <main>
      <Post />
    </main>
  )
}
