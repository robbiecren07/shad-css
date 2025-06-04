import { Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import styles from './ctaSection.module.scss'

export default function CtaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.section_inner}>
        <div className={styles.section_content}>
          <h3 className={styles.section_heading}>Ready to get started?</h3>
          <p className={styles.section_text}>
            Run the CLI with npx and add components to your project instantly.
          </p>
          <div className={styles.section_actions}>
            <Button size="lg">
              <Code2 className={styles.section_icon} />
              Quick Start
            </Button>
            <Button size="lg" variant="outline">
              View Examples
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
