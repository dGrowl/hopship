import {
  BsGearFill,
  BsPersonAdd,
  BsPersonCheckFill,
  BsPersonCircle,
  BsSlashCircle,
} from 'react-icons/bs'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { extractAuth } from '../../lib/cookies'

import styles from '../../styles/UserMenu.module.css'

interface Props {
  name: string | null
  searching: boolean
}

const UserMenu = ({ name, searching }: Props) => {
  const [userName, setUserName] = useState(name)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await extractAuth()
      if (!auth || userName !== auth.name) {
        setUserName(auth?.name || null)
      }
    }
    checkAuth()
  }, [userName, setUserName, pathname])
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
      {userName === null ? (
        <Link href="/login">
          <BsPersonAdd className="iconLink" />
        </Link>
      ) : (
        <BsPersonCircle
          className="iconLink"
          onClick={() => setIsOpen((s) => !s)}
        />
      )}
      {isOpen ? (
        <nav id={styles.menu} onClick={() => setIsOpen(false)}>
          <Link href={`/u/${userName}`}>
            <BsPersonCheckFill /> {userName}
          </Link>
          <Link href="/settings/identities">
            <BsGearFill /> settings
          </Link>
          <Link href={'/logout' + pathname} prefetch={false}>
            <BsSlashCircle /> logout
          </Link>
        </nav>
      ) : null}
    </div>
  )
}

export default UserMenu
