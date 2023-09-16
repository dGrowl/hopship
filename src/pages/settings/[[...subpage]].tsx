import {
  BsCloudSunFill,
  BsHurricane,
  BsKeyFill,
  BsMastodon,
  BsPersonCheckFill,
  BsPersonVcard,
  BsTrash3Fill,
  BsTwitch,
  BsTwitter,
  BsYoutube,
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
import { JWT_AUTH_SECRET, VERIFICATION_SECRET } from '../../lib/env'
import { NETWORKS, hasKey } from '../../lib/util'
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
  Bluesky: <BsCloudSunFill size={24} className={styles.Bluesky} />,
  Mastodon: <BsMastodon size={24} className={styles.Mastodon} />,
  Threads: <BsHurricane size={24} className={styles.Threads} />,
  Twitch: <BsTwitch size={24} className={styles.Twitch} />,
  Twitter: <BsTwitter size={24} className={styles.Twitter} />,
  YouTube: <BsYoutube size={24} className={styles.YouTube} />,
}

const LINK_DATA: { [key: string]: LinkDatum } = {
  identities: {
    icon: <BsPersonVcard size={24} />,
    text: 'identities',
    title: 'Manage Identities',
    url: '/settings/identities',
  },
  user: {
    icon: <BsPersonCheckFill size={24} />,
    text: 'user',
    title: 'Update User Details',
    url: '/settings/user',
  },
  password: {
    icon: <BsKeyFill size={24} />,
    text: 'password',
    title: 'Change Password',
    url: '/settings/password',
  },
  delete: {
    icon: <BsTrash3Fill size={24} />,
    text: 'delete',
    title: 'Delete Account',
    url: '/settings/delete',
  },
}

const paramsToSubpage = (params: ParsedUrlQuery | undefined) => {
  const subpage = params?.subpage
  if (!subpage) {
    return null
  }
  if (Array.isArray(subpage)) {
    if (subpage.length === 1 && hasKey(LINK_DATA, subpage[0])) {
      return subpage[0]
    } else if (subpage.length === 2 && NETWORKS.includes(subpage[0])) {
      return `${subpage[0]}/${subpage[1]}`
    }
    return null
  }
  return hasKey(LINK_DATA, subpage) ? subpage : null
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
          i.network,
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
  network: string,
  networkName: string
) => {
  try {
    const result = await db.query(
      `
        SELECT
          u.id,
          i.description AS desc,
          i.platform,
          i.network,
          i.status
        FROM public.identities i
          INNER JOIN public.users u
            ON u.id = i.user_id
        WHERE u.name = $1
          AND i.network = $2
          AND i.name = $3;
      `,
      [userName, network, networkName]
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
  const timestampMs = Math.floor(Date.now() / 1000).toString()
  const hash = createHash('sha256')
  hash.update(userID.toString())
  hash.update(identity.network)
  hash.update(identity.name)
  hash.update(timestampMs)
  hash.update(VERIFICATION_SECRET)
  return {
    hash: hash.digest('base64url'),
    timestampMs,
  }
}

interface SettingsData {
  bio: string
  email: string
  identities: Identity[]
  identity: Identity
  name: string
  verification: VerificationDetails
}

const fetchSettingsData = async (subpage: string, auth: AuthPayload) => {
  const user: SettingsData = {
    email: auth.email,
    name: auth.sub,
    bio: '',
    verification: {
      hash: '',
      timestampMs: '',
    },
    identity: {
      desc: '',
      name: '',
      network: '',
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
    const [network, networkName] = subpage.split('/')
    const identity = await getIdentityData(user.name, network, networkName)
    if (identity === null) {
      return null
    }
    user.identity = {
      desc: identity.desc,
      name: networkName,
      network,
      platform: identity.platform,
      status: identity.status,
    }
    if (identity.status !== 'VERIFIED') {
      user.verification = genVerificationDetails(identity.id, user.identity)
    }
  }
  return user
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { auth: token } = ctx.req.cookies

  try {
    if (token) {
      const payload = jwt.verify(token, JWT_AUTH_SECRET) as AuthPayload
      if (!(await validateUserData(payload))) {
        return {
          redirect: {
            destination: '/logout',
            permanent: false,
          },
        }
      }
      const subpage = paramsToSubpage(ctx.params)
      if (!subpage) {
        return {
          redirect: {
            destination: '/settings/identities',
            permanent: true,
          },
        }
      }
      const data = await fetchSettingsData(subpage, payload)
      if (!data) {
        return {
          redirect: {
            destination: isIdentitySubpage(subpage)
              ? '/settings/identities'
              : '/logout',
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

const Content = ({ subpage, data }: Props) => {
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

const buildIdentityLinkDatum = (subpage: string, identity: Identity) => {
  return {
    icon: PLATFORM_ICONS[identity.platform],
    text: identity.name,
    title: `Modify ${subpage}`,
    url: `/settings/${subpage}`,
  }
}

const Settings = ({ subpage, data }: Props) => {
  let relevantLinkData = Object.values(LINK_DATA)
  const linkDatum =
    LINK_DATA[subpage] || buildIdentityLinkDatum(subpage, data.identity)
  if (isIdentitySubpage(subpage)) {
    relevantLinkData.splice(1, 0, linkDatum)
  }
  return (
    <>
      <Head>
        <title>{`hopship: ${linkDatum.title}`}</title>
      </Head>
      <div id={styles.container}>
        <SideNav current={linkDatum.url} linkData={relevantLinkData} />
        <DropNav
          current={linkDatum.url}
          linkData={relevantLinkData}
          root="Settings"
        />
        <Content subpage={subpage} data={data} />
      </div>
    </>
  )
}

export default Settings
