import Link from 'next/link'
import { Button } from '@/components/ui/button'
import styles from './header.module.scss'
import { Logo } from '../icons/logo'

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.header_nav}>
        <div className={styles.header_nav_inner}>
          <div className={styles.header_group}>
            <Logo />
            <span className={styles.header_group_logo}>shad-css</span>
          </div>
          <Link href="/docs">
            <Button variant="ghost" size="sm">
              Documentation
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
