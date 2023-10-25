'use client'

import { useState } from 'react'
import Link from 'next/link'

import { HOME_DOMAIN } from '../../../lib/env'
import PACKAGES from './packages'

const Code = () => {
  const [current, setCurrent] = useState(0)
  return (
    <article>
      <section>
        <h3>Source Code</h3>
        <p>
          You can find <b>hopship</b>&apos;s source code{' '}
          <a href="https://github.com/dGrowl/hopship" className="underline">
            on GitHub
          </a>
          . The canonical version of the website is currently hosted by{' '}
          <a href="https://vercel.com/" className="underline">
            vercel
          </a>{' '}
          and can be accessed via{' '}
          <Link href={`https://${HOME_DOMAIN}`} className="underline">
            {HOME_DOMAIN}
          </Link>
          .
        </p>
      </section>
      <section>
        <h3>Third-Party Packages</h3>
        <p>
          <b>hopship</b> depends on the following open-source software packages,
          each used under the terms of its accompanying license. They can all be
          found on{' '}
          <a href="https://www.npmjs.com/" className="underline">
            npm
          </a>
          .
        </p>
        <select onChange={(e) => setCurrent(e.target.selectedIndex)}>
          {PACKAGES.map((p, i) => (
            <option key={p.name} value={i}>
              {p.name}
            </option>
          ))}
        </select>
        <pre>{PACKAGES[current].license}</pre>
      </section>
    </article>
  )
}

export default Code
