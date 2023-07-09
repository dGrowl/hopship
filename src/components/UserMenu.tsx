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
          Login |<br />
          Register
        </Link>
      ) : (
        <>
          <Link href="/settings">{name}</Link>
          <Link href="/logout">Logout</Link>
        </>
      )}
    </div>
  )
}

export default UserMenu
