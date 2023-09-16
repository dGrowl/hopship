import {
  BsBullseye,
  BsChatLeftText,
  BsCodeSlash,
  BsQuestionLg,
  BsShieldCheck,
} from 'react-icons/bs'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'

import { hasKey } from '../../lib/util'
import { LinkDatum } from '../../lib/types'
import Code from '../../components/about/Code'
import ContactForm from '../../components/about/ContactForm'
import DropNav from '../../components/DropNav'
import Help from '../../components/about/Help'
import Mission from '../../components/about/Mission'
import PrivacyPolicy from '../../components/about/PrivacyPolicy'
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
  privacy: {
    icon: <BsShieldCheck size={24} strokeWidth={0.5} />,
    text: 'privacy',
    title: 'Privacy Policy',
    url: '/about/privacy',
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

const Content = ({ subpage }: Props) => {
  switch (subpage) {
    case 'code':
      return <Code />
    case 'contact':
      return <ContactForm />
    case 'mission':
      return Mission
    case 'privacy':
      return PrivacyPolicy
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
        <title>{`hopship: About > ${linkDatum.title}`}</title>
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
