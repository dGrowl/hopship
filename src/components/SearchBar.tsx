import { FormEvent, useEffect, useState } from 'react'
import { NextRouter, useRouter } from 'next/router'

import { MAX_PLATFORM_NAME_LENGTH } from '../lib/safety'
import { platforms } from '../lib/util'

import styles from '../styles/SearchBar.module.css'

const PlatformSelect = () => {
  const [platform, setPlatform] = useState('')
  useEffect(() => {
    const storedPlatform = localStorage.getItem('platform')
    if (storedPlatform && storedPlatform !== platform) {
      setPlatform(storedPlatform)
    }
  }, [])
  return (
    <select
      id="platform"
      name="platform"
      onChange={(e) => setPlatform(e.target.value)}
      required
      value={platform}
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

const NameInput = () => {
  const [name, setName] = useState('')
  useEffect(() => {
    const storedName = localStorage.getItem('name')
    if (storedName && storedName !== name) {
      setName(storedName)
    }
  }, [])
  return (
    <input
      maxLength={MAX_PLATFORM_NAME_LENGTH}
      minLength={1}
      name="name"
      onChange={(e) => setName(e.target.value)}
      pattern="\w+"
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

const SearchBar = () => {
  const router = useRouter()
  return (
    <form onSubmit={(e) => submit(e, router)}>
      <fieldset>
        <nav id={styles.container}>
          <PlatformSelect />
          <NameInput />
          <button>s</button>
        </nav>
      </fieldset>
    </form>
  )
}

export default SearchBar
