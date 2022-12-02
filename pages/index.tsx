import { useEffect, useState } from 'react'

import SearchForm from '../components/SearchForm'

export default function Home() {
  const [platform, setPlatform] = useState<string | null>(null)
  const [id, setId] = useState<string | null>(null)
  useEffect(() => {
    const storedPlatform = localStorage.getItem('platform')
    if (storedPlatform) {
      setPlatform(storedPlatform)
    }
    const storedId = localStorage.getItem('id')
    if (storedId) {
      setId(storedId)
    }
  }, [])
  return (
    <>
      <SearchForm platform={platform} id={id} />
    </>
  )
}
