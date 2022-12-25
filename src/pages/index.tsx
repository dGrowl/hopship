import { useEffect, useState } from 'react'

import SearchForm from '../components/SearchForm'

export async function getServerSideProps() {
  return {
    props: {},
  }
}

export default function Home() {
  const [platform, setPlatform] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  useEffect(() => {
    const storedPlatform = localStorage.getItem('platform')
    if (storedPlatform) {
      setPlatform(storedPlatform)
    }
    const storedName = localStorage.getItem('name')
    if (storedName) {
      setName(storedName)
    }
  }, [])
  return (
    <>
      <SearchForm platform={platform} name={name} />
    </>
  )
}
