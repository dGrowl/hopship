import { useState } from 'react'
import Head from 'next/head'

export default function UserForm() {
  const [registerMode, setRegisterMode] = useState(false)
  return (
    <>
      <Head>
        <title>Also: Login/Register</title>
      </Head>
      <div>
        <form>
          <div>
            <button onClick={() => setRegisterMode(false)}>Login</button>
            <button onClick={() => setRegisterMode(true)}>Register</button>
          </div>
          <label htmlFor="email">Email</label>
          <input name="email" />
          <label htmlFor="password">Password</label>
          <input name="password" type="password" />
          {registerMode ? (
            <>
              <label htmlFor="repassword">Password (Again)</label>
              <input name="repassword" type="password" />
            </>
          ) : null}
          <button>Submit</button>
        </form>
      </div>
    </>
  )
}
