import { useEffect, useState } from 'react'

import OrbitAnimation from '../components/OrbitAnimation'
import SearchForm from '../components/SearchForm'

import styles from '../styles/Home.module.css'

export const getServerSideProps = async () => {
  return {
    props: {},
  }
}

const Home = () => {
  const [platform, setPlatform] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  useEffect(() => {
    setPlatform(localStorage.getItem('platform') || '')
    setName(localStorage.getItem('name') || '')
  }, [])
  return (
    <div id={styles.container}>
      <OrbitAnimation width={300} height={300} platform={platform} />
      <SearchForm platform={platform} name={name} setPlatform={setPlatform} />
    </div>
  )
}

export default Home
