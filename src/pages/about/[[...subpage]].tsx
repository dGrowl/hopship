import { useState } from 'react'
import Head from 'next/head'

import packages from '../../lib/packages'

import styles from '../../styles/About.module.css'

export const getServerSideProps = async () => ({ props: {} })

const About = () => {
  const [current, setCurrent] = useState(0)
  return (
    <>
      <Head>
        <title>also: Code</title>
      </Head>
      <div id={styles.container}>
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
              <b>also</b> depends on the following open-source software packages, each
              used under the terms of its accompanying license. They can all be
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
      </div>
    </>
  )
}

export default About
