import Head from 'next/head'

export default function UserForm() {
  return (
    <>
      <Head>
        <title>Also: Login/Register</title>
      </Head>
      <div>
        <form>
          <div>
            <button name="login-mode">Login</button>
            <button name="register-mode">Register</button>
          </div>
          <label htmlFor="email">Email</label>
          <input name="email" />
          <label htmlFor="password">Password</label>
          <input name="password" type="password" />
          <label htmlFor="password-confirm">
            Password (Again)
          </label>
          <input name="password-confirm" type="password" />
          <button>Submit</button>
        </form>
      </div>
    </>
  )
}
