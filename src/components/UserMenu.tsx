import { BsPersonCircle } from 'react-icons/bs'
import Link from 'next/link'

import styles from '../styles/UserMenu.module.css'

interface Props {
  name: string | null
  searching: boolean
}

const UserMenu = ({ name, searching }: Props) => {
  return (
    <div
      className={searching ? styles.hiddenForMobile : ''}
      id={styles.container}
    >
      {name === null ? (
        <Link id={styles.link} href="/login">
          <BsPersonCircle size={36} />
        </Link>
      ) : (
        <>
          <Link id={styles.link} href="/settings">
            <BsPersonCircle size={36} />
          </Link>
          <Link href="/logout">Logout</Link>
        </>
      )}
    </div>
  )
}

export default UserMenu
