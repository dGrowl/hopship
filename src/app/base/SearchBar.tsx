import { BsArrowLeft, BsSearch } from 'react-icons/bs'
import { Dispatch, FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  NETWORK_NAME_MAX_LENGTH,
  NETWORK_NAME_MIN_LENGTH,
  NETWORK_NAME_REGEX,
} from '../../lib/safety'
import { AppRouter } from '../../lib/types'
import { NETWORK_PLATFORM, PLATFORM_NETWORKS } from '../../lib/util'
import { setAnimationPlatform } from '../home/OrbitAnimation'

import styles from '../../styles/SearchBar.module.css'

const NetworkSelect = () => {
  const [network, setNetwork] = useState<string | null>(null)
  useEffect(() => {
    setNetwork(localStorage.getItem('network') || 'twitter.com')
  }, [])
  useEffect(() => {
    if (network !== null) {
      setAnimationPlatform(NETWORK_PLATFORM[network])
    }
  }, [network])
  return (
    <select
      id="network"
      name="network"
      onChange={(e) => setNetwork(e.target.value)}
      required
      value={network || ''}
    >
      {Object.entries(PLATFORM_NETWORKS).map(([p, networks]) =>
        networks.length > 1 ? (
          <optgroup key={p} label={p}>
            {networks.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </optgroup>
        ) : (
          <option key={p} value={networks}>
            {p}
          </option>
        )
      )}
    </select>
  )
}

type Fields = EventTarget & {
  network: HTMLSelectElement
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
    if (storedName) {
      setName(storedName)
    }
  }, [])
  useEffect(() => (searching ? nameRef.current?.focus() : void 0), [searching])
  return (
    <input
      maxLength={NETWORK_NAME_MAX_LENGTH}
      minLength={NETWORK_NAME_MIN_LENGTH}
      name="name"
      onChange={(e) => setName(e.target.value)}
      pattern={NETWORK_NAME_REGEX}
      ref={nameRef}
      required
      title="Platform IDs can only contain letters, numbers, and underscores."
      value={name}
    />
  )
}

const submit = (e: FormEvent, router: AppRouter) => {
  e.preventDefault()
  const form = e.target as Fields
  const network = form.network.value
  const name = form.name.value
  if (network) {
    localStorage.setItem('network', network)
  }
  if (name) {
    localStorage.setItem('name', name)
  }
  router.push(`/results/${network}/${name}`)
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
              <BsArrowLeft className="iconLink" />
            </button>
            <NetworkSelect />
            <NameInput searching={searching} />
            <button>
              <BsSearch className="iconLink" />
            </button>
          </nav>
        </fieldset>
      </form>
      <div
        className={searching ? styles.hidden : styles.shownForMobile}
        id={styles.toggleContainer}
      >
        <BsSearch onClick={() => setSearching(true)} />
      </div>
    </>
  )
}

export default SearchBar
