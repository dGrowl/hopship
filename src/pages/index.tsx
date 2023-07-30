import { BsArrowRightCircle } from 'react-icons/bs'
import Link from 'next/link'

import OrbitAnimation from '../components/OrbitAnimation'

import styles from '../styles/Home.module.css'

export const getServerSideProps = async () => ({ props: {} })

const Home = () => {
  return (
    <div id={styles.container}>
      <OrbitAnimation width={360} height={360} />
      <dl id={styles.questions}>
        <section>
          <div>
            <dt>What?</dt>
            <Link href="/about/help">
              <BsArrowRightCircle size={24} strokeWidth={0.35} />
            </Link>
          </div>
          <dd>
            A search engine for netizens. Look up one account to find the rest!
          </dd>
        </section>
        <section>
          <div>
            <dt>Why?</dt>
            <Link href="/about/mission">
              <BsArrowRightCircle size={24} strokeWidth={0.35} />
            </Link>
          </div>
          <dd>
            People over platforms. Our goal is to ease transitions between
            services.
          </dd>
        </section>
        <section>
          <div>
            <dt>How?</dt>
            <Link href="/about/code">
              <BsArrowRightCircle size={24} strokeWidth={0.35} />
            </Link>
          </div>
          <dd>
            Built from open-source software, with its own code hosted&nbsp;
            <a href="https://github.com/dGrowl/also" className="underline">
              here
            </a>
            . Bring issues!
          </dd>
        </section>
      </dl>
    </div>
  )
}

export default Home
