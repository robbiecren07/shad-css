import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import CtaSection from '@/components/CtaSection'
import Features from '@/components/Features'
import componentData from '@/content/components/index.json'
import styles from './page.module.scss'
import { ComponentItem } from '@/types'

export const metadata: Metadata = {
  title: 'Shadcn/ui Components with CSS Modules | shad-css CLI',
  description:
    'Quickly add Shadcn/ui React components to your project using CSS Modules instead of Tailwind CSS. The open-source shad-css CLI lets you install clean, production-ready components with a single command—no Tailwind setup or manual conversion needed.',
}

export default function Home() {
  const data = componentData as ComponentItem[]

  return (
    <main className={styles.main}>
      <h1 className="sr-only">Shadcn/ui Components with CSS Modules – Open Source CLI for React</h1>

      <Hero data={data} />

      <CtaSection />

      <Features />
    </main>
  )
}
