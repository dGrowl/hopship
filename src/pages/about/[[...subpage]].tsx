import { BsCodeSlash } from 'react-icons/bs'
import { useState } from 'react'
import Head from 'next/head'

import DropNav from '../../components/DropNav'
import packages from '../../lib/packages'
import SideNav from '../../components/SideNav'

import styles from '../../styles/About.module.css'

export const getServerSideProps = async () => ({ props: {} })

const linkData = [
  {
    text: 'code',
    icon: <BsCodeSlash size={24} strokeWidth={0.5} />,
    url: '/about/code',
  },
]

const AboutCode = () => {
  const [current, setCurrent] = useState(0)
  return (
    <article id={styles.content}>
      <section>
        <h3>Source Code</h3>
        <p>
          You can find <b>also</b>'s source code{' '}
          <a href="https://github.com/dGrowl/also" className="underline">
            on GitHub
          </a>
          . The canonical version of the website is currently hosted by{' '}
          <a href="https://render.com/" className="underline">
            render
          </a>{' '}
          and can be accessed via{' '}
          <a href="/#placeholder" className="underline">
            also.domain
          </a>
          .
        </p>
      </section>
      <section>
        <h3>Third-Party Packages</h3>
        <p>
          <b>also</b> depends on the following open-source software packages,
          each used under the terms of its accompanying license. They can all be
          found on{' '}
          <a href="https://www.npmjs.com/" className="underline">
            npm
          </a>
          .
        </p>
        <select onChange={(e) => setCurrent(e.target.selectedIndex)}>
          {packages.map((p, i) => (
            <option key={p.name} value={i}>
              {p.name}
            </option>
          ))}
        </select>
        <pre>{packages[current].license}</pre>
      </section>
    </article>
  )
}

const About = () => {
  return (
    <>
      <Head>
        <title>also: Code</title>
      </Head>
      <div id={styles.container}>
        <SideNav current={linkData[0].url} linkData={linkData} />
        <DropNav current={linkData[0].url} linkData={linkData} root="About" />
        <AboutCode />
      </div>
    </>
  )
}

export default About
