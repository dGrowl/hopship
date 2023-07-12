import {
  BsGearFill,
  BsPersonAdd,
  BsPersonCircle,
  BsSlashCircle,
} from 'react-icons/bs'
import { useEffect, useState } from 'react'
import Link from 'next/link'

import styles from '../styles/UserMenu.module.css'

interface Props {
  name: string | null
  searching: boolean
}

const UserMenu = ({ name, searching }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      const element = e.target as Element
      if (element.closest('#' + styles.container) === null) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', closeMenu)
    return () => document.removeEventListener('click', closeMenu)
  }, [setIsOpen])
  return (
    <div
      className={searching ? styles.hiddenForMobile : ''}
      id={styles.container}
    >
      {name === null ? (
        <Link href="/login">
          <BsPersonAdd id={styles.userBadge} size={32} />
        </Link>
      ) : (
        <BsPersonCircle
          id={styles.userBadge}
          onClick={() => setIsOpen((s) => !s)}
          size={32}
        />
      )}
      {isOpen ? (
        <nav id={styles.menu} onClick={() => setIsOpen(false)}>
          <Link href="/settings">
            <BsGearFill strokeWidth={0.75} /> settings
          </Link>
          <Link href="/logout">
            <BsSlashCircle strokeWidth={0.75} /> logout
          </Link>
        </nav>
      ) : null}
    </div>
  )
}

export default UserMenu
