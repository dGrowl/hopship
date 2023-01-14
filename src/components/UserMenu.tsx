import Link from 'next/link'

interface Props {
  name: string | null
}

const logout = async () => {
  await fetch('/api/logout')
  document.location.reload()
}

export default function UserMenu({ name }: Props) {
  if (name === null) {
    return (
      <div>
        <Link href="/login">
          <div>Login/Register</div>
        </Link>
      </div>
    )
  }
  return (
    <div>
      <Link href="/profile">
        <div>{name}</div>
      </Link>
      <div onClick={() => logout()}>Logout</div>
    </div>
  )
}
