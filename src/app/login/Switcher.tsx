'use client'

import { useState } from 'react'

import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

import styles from 'styles/Login.module.css'

const Switcher = () => {
  const [registerMode, setRegisterMode] = useState(false)
  return (
    <section>
      <div id={styles.switcher}>
        <button
          className={registerMode ? '' : styles.activeMode}
          onClick={() => setRegisterMode(false)}
        >
          Login
        </button>
        <button
          className={registerMode ? styles.activeMode : ''}
          onClick={() => setRegisterMode(true)}
        >
          Register
        </button>
      </div>
      {registerMode ? <RegisterForm /> : <LoginForm />}
    </section>
  )
}

export default Switcher
