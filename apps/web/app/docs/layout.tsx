import type React from 'react'
import Sidebar from '@/components/Sidebar'
import styles from './layout.module.scss'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.content}>{children}</main>
    </div>
  )
}
