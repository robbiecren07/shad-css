import type { ComponentItem } from '@/types'
import ComponentSelector from './ComponentSelector'
import { Badge } from '../ui/badge'
import { Zap } from 'lucide-react'
import styles from './hero.module.scss'

interface Props {
  data: ComponentItem[]
}

export default function Hero({ data }: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.hero_inner}>
        <div className={styles.hero_header}>
          <Badge variant="secondary" className={styles.hero_badge}>
            <Zap className={styles.hero_badgeIcon} />
            Built for the community
          </Badge>
          <h2 className={styles.hero_title}>Swap Tailwind for CSS Modules—Effortlessly</h2>
          <p className={styles.hero_text}>
            Skip the manual conversion. Instantly add Shadcn/ui components styled with CSS Modules
            with a single CLI command. Get clean, production-ready React components—
            <strong>no Tailwind setup needed</strong>.
          </p>
        </div>

        <ComponentSelector data={data} />
      </div>
    </section>
  )
}
