import { Metadata } from 'next'

import Switcher from './Switcher'

import styles from '../../styles/Login.module.css'

export const metadata: Metadata = {
  title: 'hopship: Login/Register',
}

const Login = () => {
  return (
    <div id={styles.container}>
      <Switcher />
    </div>
  )
}

export default Login
