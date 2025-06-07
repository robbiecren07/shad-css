import { Code2, Palette, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import styles from './features.module.scss'

export default function Features() {
  return (
    <section className={styles.section}>
      <div className={styles.section_inner}>
        <div className={styles.section_header}>
          <h2 className={styles.section_header_title}>Why use shad-css?</h2>
          <p className={styles.section_header_text}>
            Switch to CSS Modules for Shadcn/ui components—preserve design, boost maintainability.
          </p>
        </div>

        <div className={styles.section_grid}>
          <Card>
            <CardHeader className={styles.section_card_header}>
              <Code2 className={styles.section_card_icon} />
              <CardTitle>Modular & Maintainable</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Generate modular CSS that&lsquo;s easy to read, update, and scale.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className={styles.section_card_header}>
              <Zap className={styles.section_card_icon} />
              <CardTitle>Blazing Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Add or convert components in seconds—skip manual rewrites.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className={styles.section_card_header}>
              <Palette className={styles.section_card_icon} />
              <CardTitle>Pixel-Perfect Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Keep every detail of Shadcn/ui&lsquo;s design—no visual differences.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
