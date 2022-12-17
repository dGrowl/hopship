import Link from 'next/link'

interface UserMenuProps {
  tag: string | null
}

const logout = async () => {
  await fetch('/api/logout')
  document.location.reload()
}

export default function UserMenu({ tag }: UserMenuProps) {
  if (tag === null) {
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
        <div>{tag}</div>
      </Link>
      <div onClick={() => logout()}>Logout</div>
    </div>
  )
}
