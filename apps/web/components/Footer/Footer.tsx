import Link from 'next/link'
import styles from './footer.module.scss'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer_inner}>
        <p className={styles.footer_text}>
          shad-css is open source, you can view it on{' '}
          <Link href="https://github.com/robbiecren07/shad-css" target="_blank" rel="nofollow">
            GitHub
          </Link>
          .
        </p>
      </div>
    </footer>
  )
}
