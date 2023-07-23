import {
  BsKeyFill,
  BsPersonCheckFill,
  BsPersonVcard,
  BsTrash3Fill,
  BsTwitch,
  BsTwitter,
} from 'react-icons/bs'
import { createHash } from 'crypto'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { ReactElement } from 'react'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import {
  AuthPayload,
  Identity,
  LinkDatum,
  VerificationDetails,
} from '../../lib/types'
import { hasKey, platforms } from '../../lib/util'
import { validateUserData } from '../../lib/helpers'
import db from '../../lib/db'
import DropNav from '../../components/DropNav'
import EditableIdentitiesList from '../../components/EditableIdentitiesList'
import IdentitySettings from '../../components/IdentitySettings'
import RemoveUserForm from '../../components/RemoveUserForm'
import SideNav from '../../components/SideNav'
import UpdatePasswordForm from '../../components/UpdatePasswordForm'
import UpdateUserForm from '../../components/UpdateUserForm'

import styles from '../../styles/Settings.module.css'

const isIdentitySubpage = (subpage: string) => subpage.includes('/')

const PLATFORM_ICONS: { [key: string]: ReactElement } = {
  Twitch: <BsTwitch size={24} className={styles.Twitch} />,
  Twitter: <BsTwitter size={24} className={styles.Twitter} />,
}

const linkData: { [key: string]: LinkDatum } = {
  identities: {
    text: 'identities',
    icon: <BsPersonVcard size={24} />,
    url: '/settings',
  },
  user: {
    text: 'user',
    icon: <BsPersonCheckFill size={24} />,
    url: '/settings/user',
  },
  password: {
    text: 'password',
    icon: <BsKeyFill size={24} />,
    url: '/settings/password',
  },
  delete: {
    text: 'delete',
    icon: <BsTrash3Fill size={24} />,
    url: '/settings/delete',
  },
}

const DEFAULT_SUBPAGE = 'identities'

const paramsToSubpage = (params: ParsedUrlQuery | undefined) => {
  const subpage = params?.subpage || DEFAULT_SUBPAGE
  if (Array.isArray(subpage)) {
    if (subpage.length === 1 && hasKey(linkData, subpage[0])) {
      return subpage[0]
    } else if (subpage.length === 2 && platforms.includes(subpage[0])) {
      return `${subpage[0]}/${subpage[1]}`
    }
    return DEFAULT_SUBPAGE
  }
  return subpage
}

const getBio = async (name: string) => {
  try {
    const result = await db.query(
      `
        SELECT u.bio
        FROM public.users u
        WHERE u.name = $1;
      `,
      [name]
    )
    if (result.rowCount === 1) {
      return result.rows[0].bio
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

const getUserIdentities = async (userName: string) => {
  try {
    const result = await db.query(
      `
        SELECT
          i.platform,
          i.name,
          i.description AS desc,
          i.status
        FROM public.identities i
          INNER JOIN public.users u
            ON u.id = i.user_id
        WHERE u.name = $1;
      `,
      [userName]
    )
    return result.rows
  } catch (error) {
    console.error(error)
  }
  return null
}

const getIdentityData = async (
  userName: string,
  platform: string,
  platformName: string
) => {
  try {
    const result = await db.query(
      `
        SELECT
          u.id,
          i.description AS desc,
          i.status
        FROM public.identities i
          INNER JOIN public.users u
            ON u.id = i.user_id
        WHERE u.name = $1
          AND i.platform = $2
          AND i.name = $3;
      `,
      [userName, platform, platformName]
    )
    if (result.rowCount === 1) {
      return result.rows[0]
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

const genVerificationDetails = (userID: string, identity: Identity) => {
  if (!process.env.VERIFICATION_SECRET) {
    throw 'Environment is missing verification secret'
  }
  const timestampMs = Math.floor(Date.now() / 1000).toString()
  const hash = createHash('sha256')
  hash.update(userID.toString())
  hash.update(identity.platform)
  hash.update(identity.name)
  hash.update(timestampMs)
  hash.update(process.env.VERIFICATION_SECRET)
  return {
    hash: hash.digest('base64url'),
    timestampMs,
  }
}

interface SettingsData extends AuthPayload {
  bio: string
  identities: Identity[]
  identity: Identity
  verification: VerificationDetails
}

const fetchSettingsData = async (subpage: string, auth: AuthPayload) => {
  const user: SettingsData = {
    ...auth,
    bio: '',
    verification: {
      hash: '',
      timestampMs: '',
    },
    identity: {
      desc: '',
      name: '',
      platform: '',
      status: '',
    },
    identities: [],
  }
  if (subpage === 'user') {
    const bio = await getBio(user.name)
    if (bio === null) {
      return null
    }
    user.bio = bio
  } else if (subpage === 'identities') {
    const identities = await getUserIdentities(user.name)
    if (identities === null) {
      return null
    }
    user.identities = identities
  } else if (isIdentitySubpage(subpage)) {
    const [platform, platformName] = subpage.split('/')
    const identity = await getIdentityData(user.name, platform, platformName)
    if (identity === null) {
      return null
    }
    user.identity = {
      desc: identity.desc,
      status: identity.status,
      platform,
      name: platformName,
    }
    if (identity.status === 'UNVERIFIED') {
      user.verification = genVerificationDetails(identity.id, user.identity)
    }
  }
  return user
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { auth: token } = ctx.req.cookies

  try {
    if (!process.env.JWT_AUTH_SECRET) {
      throw 'Environment is missing JWT secret'
    }
    if (token) {
      const payload = jwt.verify(
        token,
        process.env.JWT_AUTH_SECRET
      ) as AuthPayload
      if (!(await validateUserData(payload))) {
        return {
          redirect: {
            destination: '/logout',
            permanent: false,
          },
        }
      }
      const subpage = paramsToSubpage(ctx.params)
      const data = await fetchSettingsData(subpage, payload)
      if (!data) {
        return {
          redirect: {
            destination: isIdentitySubpage(subpage) ? '/settings' : '/logout',
            permanent: false,
          },
        }
      }
      return {
        props: { subpage, data },
      }
    }
  } catch (error) {
    console.error(error)
  }

  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  }
}

interface Props {
  subpage: string
  data: SettingsData
}

const SubPage = ({ subpage, data }: Props) => {
  switch (subpage) {
    case 'identities':
      return <EditableIdentitiesList {...data} />
    case 'user':
      return <UpdateUserForm {...data} />
    case 'password':
      return <UpdatePasswordForm {...data} />
    case 'delete':
      return <RemoveUserForm {...data} />
  }
  return isIdentitySubpage(subpage) ? <IdentitySettings {...data} /> : <></>
}

const TITLES: { [key: string]: string } = {
  identities: 'Manage Identities',
  user: 'Update User Details',
  password: 'Change Password',
  delete: 'Delete Account',
}

const buildTitle = (subpage: string) => {
  return TITLES[subpage] || 'Modify ' + subpage.replace('/', ' // ')
}

const Settings = ({ subpage, data }: Props) => {
  let relevantLinkData = Object.values(linkData)
  let currentURL = linkData[subpage]?.url
  if (isIdentitySubpage(subpage)) {
    const [platform, _] = subpage.split('/')
    currentURL = `/settings/${subpage}`
    relevantLinkData.splice(1, 0, {
      text: subpage,
      icon: PLATFORM_ICONS[platform],
      url: currentURL,
    })
  }
  return (
    <>
      <Head>
        <title>{`also: ${buildTitle(subpage)}`}</title>
      </Head>
      <div id={styles.container}>
        <SideNav current={currentURL} linkData={relevantLinkData} />
        <DropNav
          current={currentURL}
          linkData={relevantLinkData}
          root="Settings"
        />
        <SubPage subpage={subpage} data={data} />
      </div>
    </>
  )
}

export default Settings
