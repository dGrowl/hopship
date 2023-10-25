'use client'

import {
  BsBullseye,
  BsChatLeftText,
  BsClipboard2Check,
  BsCodeSlash,
  BsQuestionLg,
  BsShieldCheck,
} from 'react-icons/bs'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { LinkDatum } from '../../lib/types'
import DropNav from '../../components/DropNav'
import SideNav from '../../components/SideNav'

import styles from '../../styles/Settings.module.css'

const LINK_DATA = [
  {
    icon: <BsQuestionLg />,
    text: 'help',
    // title: 'Help',
    url: '/about/help',
  },
  {
    icon: <BsBullseye />,
    text: 'mission',
    // title: 'Mission',
    url: '/about/mission',
  },
  {
    icon: <BsCodeSlash />,
    text: 'code',
    // title: 'Code',
    url: '/about/code',
  },
  {
    icon: <BsShieldCheck />,
    text: 'privacy',
    // title: 'Privacy Policy',
    url: '/about/privacy',
  },
  {
    icon: <BsClipboard2Check />,
    text: 'terms',
    // title: 'Terms of Service',
    url: '/about/terms',
  },
  {
    icon: <BsChatLeftText />,
    text: 'contact',
    // title: 'Contact Us',
    url: '/about/contact',
  },
] as readonly LinkDatum[]

interface Props {
  children: ReactNode
}

const AboutLayout = ({ children }: Props) => {
  const path = usePathname() || '/'
  return (
    <div id={styles.container}>
      <SideNav current={path} linkData={LINK_DATA} />
      <DropNav current={path} root="About" linkData={LINK_DATA} />
      {children}
    </div>
  )
}

export default AboutLayout
