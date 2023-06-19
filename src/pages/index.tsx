import OrbitAnimation from '../components/OrbitAnimation'

import styles from '../styles/Home.module.css'

export const getServerSideProps = async () => ({ props: {} })

const Home = () => {
  return (
    <div id={styles.container}>
      <OrbitAnimation width={360} height={360} />
    </div>
  )
}

export default Home
