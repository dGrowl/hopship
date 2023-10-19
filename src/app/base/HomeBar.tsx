'use client'

import { Nunito_Sans } from 'next/font/google'
import { useState } from 'react'
import Link from 'next/link'

import SearchBar from '../base/SearchBar'
import UserMenu from './UserMenu'

import styles from '../../styles/App.module.css'

const TITLE_FONT = Nunito_Sans({ subsets: ['latin'] })

interface HomeBarProps {
  userName: string | null
}

const HomeBar = ({ userName }: HomeBarProps) => {
  const [searching, setSearching] = useState(false)
  return (
    <header id={styles.header}>
      <div
        className={searching ? styles.expandMobile : ''}
        id={styles.headerContent}
      >
        <Link href="/" className={searching ? styles.hiddenForMobile : ''}>
          <h1 className={TITLE_FONT.className}>hopship</h1>
        </Link>
        <SearchBar searching={searching} setSearching={setSearching} />
        <UserMenu name={userName} searching={searching} />
      </div>
    </header>
  )
}

export default HomeBar
