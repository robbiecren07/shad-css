'use client'

import Link from 'next/link'
import styles from './sidebar.module.scss'
import { Button } from '../ui/button'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href?: string
  children?: NavItem[]
}

const navigationData: NavItem[] = [
  {
    title: 'Getting Started',
    children: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Quick Start', href: '/docs/quick-start' },
    ],
  },
  {
    title: 'Components',
    children: [
      { title: 'Button', href: '/docs/components/button' },
      { title: 'Input', href: '/docs/components/input' },
      { title: 'Modal', href: '/docs/components/modal' },
      { title: 'Card', href: '/docs/components/card' },
    ],
  },
]

export default function Sidebar() {
  const pathName = usePathname()

  return (
    <aside className={styles.container}>
      <nav className={styles.nav}>
        {navigationData.map((item, index) => {
          return (
            <div key={index} className={styles.nav_group}>
              <h3 className={styles.nav_title}>{item.title}</h3>
              {item.children?.map((child, childIndex) => (
                <Button
                  key={childIndex}
                  variant="ghost"
                  size="sm"
                  className={`${styles.nav_link} ${pathName === child.href && styles.nav_link_active}`}
                  asChild
                >
                  <Link href={child.href || '#'}>{child.title}</Link>
                </Button>
              ))}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
