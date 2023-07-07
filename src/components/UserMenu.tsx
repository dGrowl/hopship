import Link from 'next/link'

import styles from '../styles/UserMenu.module.css'

interface Props {
  name: string | null
  searching: boolean
}

const UserMenu = ({ name, searching }: Props) => {
  return (
    <div className={searching ? styles.hiddenForMobile : ''}>
      {name === null ? (
        <Link href="/login">
          <div>Login/Register</div>
        </Link>
      ) : (
        <>
          <Link href="/settings">
            <div>{name}</div>
          </Link>
          <Link href="/logout">Logout</Link>
        </>
      )}
    </div>
  )
}

export default UserMenu
