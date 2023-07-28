import {
  BsBullseye,
  BsCodeSlash,
  BsGearFill,
  BsPersonAdd,
  BsPersonCircle,
  BsPersonPlus,
  BsQuestionLg,
  BsSearch,
} from 'react-icons/bs'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { useState } from 'react'
import Head from 'next/head'

import { hasKey } from '../../lib/util'
import { LinkDatum } from '../../lib/types'
import DropNav from '../../components/DropNav'
import packages from '../../lib/packages'
import SideNav from '../../components/SideNav'

import styles from '../../styles/About.module.css'
import Link from 'next/link'

const linkData: { [key: string]: LinkDatum } = {
  help: {
    text: 'help',
    icon: <BsQuestionLg size={24} strokeWidth={0.5} />,
    url: '/about',
  },
  code: {
    text: 'code',
    icon: <BsCodeSlash size={24} strokeWidth={0.5} />,
    url: '/about/code',
  },
}

const DEFAULT_SUBPAGE = 'help'

const paramsToSubpage = (params: ParsedUrlQuery | undefined) => {
  const subpage = params?.subpage || DEFAULT_SUBPAGE
  if (Array.isArray(subpage)) {
    if (subpage.length === 1 && hasKey(linkData, subpage[0])) {
      return subpage[0]
    }
    return DEFAULT_SUBPAGE
  }
  return subpage
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const subpage = paramsToSubpage(ctx.params)
  return { props: { subpage } }
}

const AboutHelp = () => {
  return (
    <article id={styles.content}>
      <section>
        <p>
          <b>also</b> is built primarily to serve two types of users:
        </p>
        <ul>
          <li>
            <b>Searchers</b> who wish to follow their friends on other
            platforms.
          </li>
          <li>
            <b>Providers</b> who wish to add their accounts to our system.
          </li>
        </ul>
      </section>
      <section>
        <h3>Searcher</h3>
        <p>
          You'll need to know one of the accounts of the person you're hoping to
          look up. Using the fields at the top, moving from left to right:
        </p>
        <ol>
          <li>Select the platform of the account from the dropdown.</li>
          <li>Type their ID/name on that platform into the text field.</li>
          <li>
            Click the <BsSearch strokeWidth={0.85} /> magnifying glass to run
            the search.
          </li>
        </ol>
      </section>
      <section>
        <h3>Provider</h3>
        <p>
          To make changes to your account, update your user page, or modify your
          identities, first navigate to the{' '}
          <Link href="/settings" className="underline">
            settings
          </Link>{' '}
          page:
        </p>
        <ol>
          <li>
            If you aren't logged in, create or sign into an account by clicking
            the <BsPersonAdd strokeWidth={0.65} size={18} /> unknown user icon
            and following the steps on the{' '}
            <Link href="/login" className="underline">
              login
            </Link>{' '}
            page.
          </li>
          <li>
            Open the user menu by clicking the{' '}
            <BsPersonCircle strokeWidth={0.35} size={18} /> logged in user icon.
          </li>
          <li>
            Click the <BsGearFill /> settings link.
          </li>
        </ol>
        <p>
          <strong>Note:</strong> After adding a new identity to your account,
          you must prove that it belongs to you before it will show up in search
          results. To verify an identity's authenticity:
        </p>
        <ol>
          <li>
            Navigate to the{' '}
            <Link href="/settings" className="underline">
              settings
            </Link>{' '}
            page; see above.
          </li>
          <li>
            Click the <BsGearFill /> button on the identity to go to the
            identity's settings.
          </li>
          <li>Follow the steps in the "Verify" section.</li>
        </ol>
      </section>
    </article>
  )
}

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

const Content = ({ subpage }: Props) => {
  switch (subpage) {
    case 'code':
      return <AboutCode />
  }
  return <AboutHelp />
}

interface Props {
  subpage: string
}

const About = ({ subpage }: Props) => {
  const { url } = linkData[subpage]
  const allLinkData = Object.values(linkData)
  return (
    <>
      <Head>
        <title>also: Code</title>
      </Head>
      <div id={styles.container}>
        <SideNav current={url} linkData={allLinkData} />
        <DropNav current={url} linkData={allLinkData} root="About" />
        <Content subpage={subpage} />
      </div>
    </>
  )
}

export default About
