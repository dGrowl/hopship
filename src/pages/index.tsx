import { BsArrowRightCircle } from 'react-icons/bs'
import { ReactNode } from 'react'
import Link from 'next/link'

import OrbitAnimation from '../components/OrbitAnimation'

import styles from '../styles/Home.module.css'

interface QuestionProps {
  children: ReactNode
  prompt: string
  url: string
}

const Question = ({ children, prompt, url }: QuestionProps) => (
  <section>
    <div>
      <dt>{prompt}</dt>
      <Link href={url}>
        <BsArrowRightCircle className="iconLink" />
      </Link>
    </div>
    <dd>{children}</dd>
  </section>
)

export const getServerSideProps = async () => ({ props: {} })

const Home = () => {
  return (
    <div id={styles.container}>
      <OrbitAnimation width={380} height={380} />
      <dl id={styles.questions}>
        <Question prompt="What?" url="/about/help">
          A social search engine. Look up one of your friend&apos;s accounts to
          find their others!
        </Question>
        <Question prompt="Why?" url="/about/mission">
          People over platforms. Our goal is to ease transitions between
          networks.
        </Question>
        <Question prompt="How?" url="/about/code">
          Built from open-source software, with its own code hosted{' '}
          <a href="https://github.com/dGrowl/hopship" className="underline">
            here
          </a>
          . Bring issues!
        </Question>
      </dl>
    </div>
  )
}

export default Home
