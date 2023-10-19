import {
  BsGearFill,
  BsPersonAdd,
  BsPersonCheckFill,
  BsPersonCircle,
  BsSlashCircle,
} from 'react-icons/bs'
import { useEffect, useState } from 'react'
import Link from 'next/link'

import styles from '../../styles/UserMenu.module.css'

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
          <Link href={`/u/${name}`}>
            <BsPersonCheckFill /> {name}
          </Link>
          <Link href="/settings/identities">
            <BsGearFill /> settings
          </Link>
          <Link href="/logout">
            <BsSlashCircle /> logout
          </Link>
        </nav>
      ) : null}
    </div>
  )
}

export default UserMenu
