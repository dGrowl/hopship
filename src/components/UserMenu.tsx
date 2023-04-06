import Link from 'next/link'

interface Props {
  name: string | null
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
      <Link href="/settings">
        <div>{name}</div>
      </Link>
      <Link href="/logout">Logout</Link>
    </div>
  )
}
