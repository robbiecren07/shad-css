import type { Metadata } from 'next'
import { getDocSlugs } from '@/lib/getDocSlugs'
import styles from './page.module.scss'

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

  const fileName = !slug || slug.length === 0 ? 'introduction' : slug.join('/')

  const doc = await import(`@/content/docs/${fileName}.mdx`)

  if (!doc) {
    return {}
  }

  return {
    title: doc.title,
    description: doc.description,
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params

  // If slug is missing or empty array, use "introduction"
  const fileName = !slug || slug.length === 0 ? 'introduction' : slug.join('/')

  const { default: Doc } = await import(`@/content/docs/${fileName}.mdx`)

  return (
    <div className={styles.container}>
      <article className={styles.article}>
        <div className={styles.article_inner}>
          <Doc />
        </div>
      </article>

      <aside className={styles.article_sidebar}></aside>
    </div>
  )
}
