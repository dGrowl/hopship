import Link from 'next/link'

import OrbitAnimation from '../components/OrbitAnimation'

import styles from '../styles/Home.module.css'

export const getServerSideProps = async () => ({ props: {} })

const Home = () => {
  return (
    <div id={styles.container}>
      <OrbitAnimation width={360} height={360} />
      <div id={styles.questions}>
        <section>
          <b>What?</b>
          <p>
            A search engine for netizens. Look up one account to find the rest!
          </p>
        </section>
        <section>
          <b>Why?</b>
          <p>
            People over platforms. Our goal is to ease transitions between
            services.
          </p>
        </section>
        <section>
          <b>How?</b>
          <p>
            Open-source software hosted&nbsp;
            <Link
              href="https://github.com/dGrowl/also"
              style={{ textDecoration: 'underline' }}
            >
              here
            </Link>
            . Bring issues, let's work on them!
          </p>
        </section>
      </div>
    </div>
  )
}

export default Home
