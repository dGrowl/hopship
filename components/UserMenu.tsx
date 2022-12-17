import Link from 'next/link'

interface UserMenuProps {
  tag: string | null
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
      <div>Logout</div>
    </div>
  )
}
