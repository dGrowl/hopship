import { BsArrowLeft, BsSearch } from 'react-icons/bs'
import { Dispatch, FormEvent, useEffect, useRef, useState } from 'react'
import { NextRouter, useRouter } from 'next/router'

import { MAX_PLATFORM_NAME_LENGTH } from '../lib/safety'
import { platforms } from '../lib/util'
import { setAnimationPlatform } from './OrbitAnimation'

import styles from '../styles/SearchBar.module.css'

const PlatformSelect = () => {
  const [platform, setPlatform] = useState<string | null>(null)
  useEffect(() => {
    setPlatform(localStorage.getItem('platform') || '')
  }, [])
  useEffect(() => {
    if (platform !== null) {
      setAnimationPlatform(platform)
    }
  }, [platform])
  return (
    <select
      id="platform"
      name="platform"
      onChange={(e) => setPlatform(e.target.value)}
      required
      value={platform || ''}
    >
      <option value="">Platform</option>
      {platforms.map((p) => (
        <option key={p}>{p}</option>
      ))}
    </select>
  )
}

type Fields = EventTarget & {
  platform: HTMLSelectElement
  name: HTMLInputElement
}

interface NameInputProps {
  searching: boolean
}

const NameInput = ({ searching }: NameInputProps) => {
  const [name, setName] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const storedName = localStorage.getItem('name')
    if (storedName && storedName !== name) {
      setName(storedName)
    }
  }, [])
  useEffect(() => (searching ? nameRef.current?.focus() : void 0), [searching])
  return (
    <input
      maxLength={MAX_PLATFORM_NAME_LENGTH}
      minLength={1}
      name="name"
      onChange={(e) => setName(e.target.value)}
      pattern="\w+"
      ref={nameRef}
      required
      title="Platform IDs can only contain letters, numbers, and underscores."
      value={name}
    />
  )
}

const submit = (e: FormEvent, router: NextRouter) => {
  e.preventDefault()
  const form = e.target as Fields
  const platform = form.platform.value
  const name = form.name.value
  if (platform) {
    localStorage.setItem('platform', platform)
  }
  if (name) {
    localStorage.setItem('name', name)
  }
  router.push({
    pathname: '/results',
    query: { platform, id: name },
  })
}

interface Props extends NameInputProps {
  setSearching: Dispatch<boolean>
}

const SearchBar = ({ searching, setSearching }: Props) => {
  const router = useRouter()
  return (
    <>
      <form
        className={searching ? styles.shown : styles.hiddenForMobile}
        id={styles.searchForm}
        onSubmit={(e) => {
          setSearching(false)
          submit(e, router)
        }}
      >
        <fieldset>
          <nav id={styles.container}>
            <button
              className={searching ? styles.shownForMobile : styles.hidden}
              onClick={() => setSearching(false)}
              type="button"
            >
              <BsArrowLeft size={22} strokeWidth={0.75} />
            </button>
            <PlatformSelect />
            <NameInput searching={searching} />
            <button>
              <BsSearch size={22} strokeWidth={0.75} />
            </button>
          </nav>
        </fieldset>
      </form>
      <div
        className={searching ? styles.hidden : styles.shownForMobile}
        id={styles.toggleContainer}
      >
        <BsSearch
          onClick={() => setSearching(true)}
          size={24}
          strokeWidth={0.75}
        />
      </div>
    </>
  )
}

export default SearchBar
