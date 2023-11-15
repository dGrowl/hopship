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

import { LinkDatum } from 'lib/types'
import DropNav from 'components/DropNav'
import SideNav from 'components/SideNav'

import styles from 'styles/Settings.module.css'

const LINK_DATA = [
  {
    icon: <BsQuestionLg />,
    text: 'help',
    url: '/about/help',
  },
  {
    icon: <BsBullseye />,
    text: 'mission',
    url: '/about/mission',
  },
  {
    icon: <BsCodeSlash />,
    text: 'code',
    url: '/about/code',
  },
  {
    icon: <BsShieldCheck />,
    text: 'privacy',
    url: '/about/privacy',
  },
  {
    icon: <BsClipboard2Check />,
    text: 'terms',
    url: '/about/terms',
  },
  {
    icon: <BsChatLeftText />,
    text: 'contact',
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
