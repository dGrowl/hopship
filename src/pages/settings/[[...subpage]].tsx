import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { useRouter } from 'next/router'
import Head from 'next/head'
import jwt from 'jsonwebtoken'
import Link from 'next/link'

import { AuthPayload, Identity } from '../../lib/types'
import { platforms } from '../../lib/util'
import { validateUserData } from '../../server/helpers'
import db from '../../server/db'
import EditableIdentitiesList from '../../components/EditableIdentitiesList'
import IdentitySettings from '../../components/IdentitySettings'
import RemoveUserForm from '../../components/RemoveUserForm'
import UpdatePasswordForm from '../../components/UpdatePasswordForm'
import UpdateUserForm from '../../components/UpdateUserForm'

import styles from '../../styles/Settings.module.css'

const SUBPAGES: readonly string[] = ['identities', 'user', 'password', 'delete']

const isIdentitySubpage = (subpage: string) => subpage.includes('/')

const buildLink = (page: string, active: string) => (
  <Link href={page} key={page}>
    {page === active ? (
      <li className={styles.current}>
        <b>{page}</b>
      </li>
    ) : (
      <li>{page}</li>
    )}
  </Link>
)

interface NavProps {
  current: string
}

const SideNav = ({ current }: NavProps) => {
  const links = SUBPAGES.map((s) => buildLink(s, current))
  if (isIdentitySubpage(current)) {
    const [platform, name] = current.split('/')
    links.splice(
      1,
      0,
      <li key={current} className={styles.identity}>
        <div className={`${styles.identityDetails} ${styles[platform]}`}>
          <b>
            {platform} &#47;&#47;
            <br />
            {name}
          </b>
        </div>
      </li>
    )
  }
  return (
    <nav id={styles.sidebar}>
      <ul>{links}</ul>
    </nav>
  )
}

const DropNav = ({ current }: NavProps) => {
  const router = useRouter()
  const links = SUBPAGES.map((subpage) => (
    <option key={subpage} value={subpage}>
      {subpage}
    </option>
  ))
  if (isIdentitySubpage(current)) {
    const [platform, name] = current.split('/')
    links.splice(
      1,
      0,
      <option
        className={styles.indent}
        key={current}
        value={`/settings/${current}`}
      >
        {platform} &#47;&#47; {name}
      </option>
    )
  }
  return (
    <nav id={styles.dropNav}>
      <h2>Settings &gt;</h2>
      <select
        defaultValue={
          isIdentitySubpage(current) ? `/settings/${current}` : current
        }
        onChange={(e) => router.push(e.target.value)}
      >
        {links}
      </select>
    </nav>
  )
}

const DEFAULT_SUBPAGE = 'identities'

const paramsToSubpage = (params: ParsedUrlQuery | undefined) => {
  const subpage = params?.subpage || DEFAULT_SUBPAGE
  if (Array.isArray(subpage)) {
    if (subpage.length === 1 && SUBPAGES.includes(subpage[0])) {
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
        WITH i AS (
          SELECT *, true AS verified
          FROM public.identities
          UNION ALL
          SELECT *, false AS verified
          FROM public.unverified_identities
        )
        SELECT
          i.platform,
          i.name,
          i.description AS desc,
          i.verified
        FROM i INNER JOIN public.users u
          ON u.id = i.user_id
            AND u.name = $1;
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
        WITH i AS (
          SELECT *, true AS verified
          FROM public.identities
          UNION ALL
          SELECT *, false AS verified
          FROM public.unverified_identities
        )
        SELECT description AS desc, verified
        FROM i INNER JOIN public.users u
          ON u.id = i.user_id
            AND u.name = $1
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

interface SettingsData extends AuthPayload {
  bio: string
  identity: Identity
  identities: Identity[]
}

const fetchSettingsData = async (subpage: string, auth: AuthPayload) => {
  const user: SettingsData = {
    ...auth,
    bio: '',
    identity: {
      desc: '',
      name: '',
      platform: '',
      verified: false,
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
      ...identity,
      platform,
      name: platformName,
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
    console.log(error)
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
  return isIdentitySubpage(subpage) ? (
    <IdentitySettings
      {...data.identity}
      verified={data.identity.verified || false}
    />
  ) : (
    <></>
  )
}

const Settings = (props: Props) => {
  return (
    <>
      <Head>
        <title>Also: Modify Identities</title>
      </Head>
      <div id={styles.container}>
        <DropNav current={props.subpage} />
        <SideNav current={props.subpage} />
        <SubPage {...props} />
      </div>
    </>
  )
}

export default Settings
