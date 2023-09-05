import {
  BsBullseye,
  BsChatLeftText,
  BsCodeSlash,
  BsGearFill,
  BsPersonAdd,
  BsPersonCircle,
  BsQuestionLg,
  BsSearch,
} from 'react-icons/bs'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

import { hasKey } from '../../lib/util'
import { LinkDatum } from '../../lib/types'
import ContactForm from '../../components/about/ContactForm'
import DropNav from '../../components/DropNav'
import packages from '../../lib/packages'
import SideNav from '../../components/SideNav'

import styles from '../../styles/About.module.css'

const linkData: { [key: string]: LinkDatum } = {
  help: {
    icon: <BsQuestionLg size={24} strokeWidth={0.5} />,
    text: 'help',
    title: 'Help',
    url: '/about/help',
  },
  mission: {
    icon: <BsBullseye size={24} strokeWidth={0.5} />,
    text: 'mission',
    title: 'Mission',
    url: '/about/mission',
  },
  code: {
    icon: <BsCodeSlash size={24} strokeWidth={0.5} />,
    text: 'code',
    title: 'Code',
    url: '/about/code',
  },
  contact: {
    icon: <BsChatLeftText size={24} strokeWidth={0.5} />,
    text: 'contact',
    title: 'Contact Us',
    url: '/about/contact',
  },
}

const paramsToSubpage = (params: ParsedUrlQuery | undefined) => {
  const subpage = params?.subpage
  if (!subpage) {
    return null
  }
  if (Array.isArray(subpage)) {
    return subpage.length === 1 && hasKey(linkData, subpage[0])
      ? subpage[0]
      : null
  }
  return hasKey(linkData, subpage) ? subpage : null
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const subpage = paramsToSubpage(ctx.params)
  return subpage
    ? { props: { subpage } }
    : {
        redirect: {
          destination: '/about/help',
          permanent: true,
        },
      }
}

const Help = (
  <article>
    <section>
      <p>
        <b>also</b> is built primarily to serve two types of users:
      </p>
      <ul>
        <li>
          <b>Searchers</b> who wish to follow their friends on other platforms.
        </li>
        <li>
          <b>Providers</b> who wish to add their accounts to our system.
        </li>
      </ul>
    </section>
    <section>
      <h3>Searcher</h3>
      <p>
        You&apos;ll need to know one of the accounts of the person you&apos;re
        hoping to look up. Using the fields at the top, moving from left to
        right:
      </p>
      <ol>
        <li>Select the platform of the account from the dropdown.</li>
        <li>Type their ID/name on that platform into the text field.</li>
        <li>
          Click the <BsSearch strokeWidth={0.85} /> magnifying glass to run the
          search.
        </li>
      </ol>
    </section>
    <section>
      <h3>Provider</h3>
      <p>
        To make changes to your account, update your user page, or modify your
        identities, first navigate to the{' '}
        <Link href="/settings/identities" className="underline">
          settings
        </Link>{' '}
        page:
      </p>
      <ol>
        <li>
          If you aren&apos;t logged in, create or sign into an account by
          clicking the <BsPersonAdd strokeWidth={0.65} size={18} /> unknown user
          icon and following the steps on the{' '}
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
        <strong>Note:</strong> After adding a new identity to your account, you
        must prove that it belongs to you before it will show up in search
        results. To verify an identity&apos;s authenticity:
      </p>
      <ol>
        <li>
          Navigate to the{' '}
          <Link href="/settings/identities" className="underline">
            settings
          </Link>{' '}
          page; see above.
        </li>
        <li>
          Click the <BsGearFill /> button on the identity to go to the
          identity&apos;s settings.
        </li>
        <li>Follow the steps in the &quot;Verify&quot; section.</li>
      </ol>
    </section>
  </article>
)

const Mission = (
  <article>
    <section style={{ rowGap: '20px' }}>
      <p>
        <b>also</b> is a mission is to empower people by fostering genuine
        connections and promoting freedom of choice. In a world filled with
        siloed platforms, we aim to break down barriers by providing a
        user-friendly social search engine that respects consent and celebrates
        diversity.
      </p>

      <p>
        Philosophically, we believe that individuals should have the liberty to
        navigate the online world on their terms. We aspire to contribute to a
        more unified internet where people are free to express their true
        selves. Higher-order communities, such as this, are one means of
        advancing this goal.
      </p>

      <p>
        We have a strong commitment to privacy and transparency. We prioritize
        safeguarding user data and ensure that our project adheres to ethical
        principles. Instead of competing with other platforms, we aim to
        collaborate and complement their services while placing users' needs
        first.
      </p>
    </section>
  </article>
)

const Code = () => {
  const [current, setCurrent] = useState(0)
  return (
    <article>
      <section>
        <h3>Source Code</h3>
        <p>
          You can find <b>also</b>&apos;s source code{' '}
          <a href="https://github.com/dGrowl/also" className="underline">
            on GitHub
          </a>
          . The canonical version of the website is currently hosted by{' '}
          <a href="https://render.com/" className="underline">
            render
          </a>{' '}
          and can be accessed via{' '}
          <Link href="/#placeholder" className="underline">
            also.domain
          </Link>
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
      return <Code />
    case 'contact':
      return <ContactForm />
    case 'mission':
      return Mission
  }
  return Help
}

interface Props {
  subpage: string
}

const About = ({ subpage }: Props) => {
  const linkDatum = linkData[subpage]
  const allLinkData = Object.values(linkData)
  return (
    <>
      <Head>
        <title>{`also: About > ${linkDatum.title}`}</title>
      </Head>
      <div id={styles.container}>
        <SideNav current={linkDatum.url} linkData={allLinkData} />
        <DropNav current={linkDatum.url} linkData={allLinkData} root="About" />
        <Content subpage={subpage} />
      </div>
    </>
  )
}

export default About
