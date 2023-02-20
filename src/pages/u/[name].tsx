import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'

import { arrayToFirstString, platforms } from '../../lib/util'
import db from '../../server/db'
import IdentityBox from '../../components/IdentityBox'
import {
  MAX_PLATFORM_LENGTH,
  MAX_PLATFORM_NAME_LENGTH,
  MAX_USER_NAME_LENGTH,
} from '../../lib/safety'
import { Identity } from '../../lib/types'

import styles from '../../styles/UserPage.module.css'

const getUserIdentities = async (userName: string) => {
  try {
    const result = await db.query(
      `
        SELECT
          platform,
          name,
          description AS desc,
          verified
        FROM public.get_user_identities($1)
        ORDER BY verified DESC, platform ASC, name ASC;
      `,
      [userName]
    )
    return result.rows
  } catch (error) {
    console.error(error)
  }
  return []
}

const processQuery = (query: ParsedUrlQuery) => {
  let userName = arrayToFirstString(query.name || null)
  if (userName) {
    userName = userName.slice(0, MAX_USER_NAME_LENGTH)
  }

  let platform = arrayToFirstString(query.platform || null)
  if (platform) {
    platform = platform.slice(0, MAX_PLATFORM_LENGTH)
    if (!platforms.includes(platform)) {
      platform = null
    }
  }

  let platformName = arrayToFirstString(query.id || null)
  if (platformName) {
    platformName = platformName.slice(0, MAX_PLATFORM_NAME_LENGTH)
    platformName = platformName.replace(/[^\w]/g, '')
  }

  return { userName, platform, platformName }
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { query } = context
  const { userName, platform, platformName } = processQuery(query)
  if (!userName) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  const identities = await getUserIdentities(userName)
  return {
    props: { userName, platform, platformName, identities },
  }
}

const buildRows = (identities: Identity[]) =>
  identities.map((i) => <IdentityBox key={i.platform + i.name} {...i} />)

interface NoIdentitesProps {
  userName: string
}

const NoIdentities = ({ userName }: NoIdentitesProps) => {
  return (
    <>
      <h2>:(</h2>
      <p>
        {userName} hasn&apos;t added any identities yet. If you know them, tell
        them that they should!
      </p>
    </>
  )
}

interface Props {
  userName: string
  platform: string | null
  platformName: string | null
  identities: Identity[]
}

const UserPage = ({ userName, platform, platformName, identities }: Props) => {
  const title = `Also: ${userName}`
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div id={styles.container}>
        <section id={styles.details}>
          <h2>{userName}</h2>
          <p>
            In the future, a biography will be here.
          </p>
        </section>
        <section id={styles.identitiesContainer}>
          <div id={styles.identities}>
            {identities.length > 0 ? (
              buildRows(identities)
            ) : (
              <NoIdentities userName={userName} />
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default UserPage
