import { useEffect, useState } from 'react'

import OrbitAnimation from '../components/OrbitAnimation'
import SearchForm from '../components/SearchForm'

import styles from '../styles/Home.module.css'

export async function getServerSideProps() {
  return {
    props: {},
  }
}

const Home = () => {
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
    <div id={styles.container}>
      <OrbitAnimation width={300} height={300} platform={platform} />
      <SearchForm platform={platform} name={name} setPlatform={setPlatform} />
    </div>
  )
}

export default Home
