import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'

import { arrayToFirstString, platforms } from '../../lib/util'
import { Identity } from '../../lib/types'
import {
  MAX_PLATFORM_LENGTH,
  MAX_PLATFORM_NAME_LENGTH,
  MAX_USER_NAME_LENGTH,
} from '../../lib/safety'
import db from '../../server/db'
import Field from '../../components/Field'
import IdentityBox from '../../components/IdentityBox'

import styles from '../../styles/UserPage.module.css'

const getBio = async (userName: string) => {
  try {
    const result = await db.query(
      `
        SELECT u.bio
        FROM public.users u
        WHERE u.name = $1;
      `,
      [userName]
    )
    if (result.rowCount !== 1) {
      throw {
        message: `Error during biography query, wrong number of rows`,
        userName,
        rows: result.rowCount,
      }
    }
    return result.rows[0].bio
  } catch (error) {
    console.error(error)
  }
  return ''
}

const getVerifiedIdentities = async (userName: string) => {
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
        WHERE u.name = $1
          AND i.status = 'VERIFIED'
        ORDER BY platform ASC, name ASC;
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

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { query } = ctx
  const { userName, platform, platformName } = processQuery(query)
  if (!userName) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  const [bio, identities] = await Promise.all([
    getBio(userName),
    getVerifiedIdentities(userName),
  ])
  return {
    props: { userName, bio, platform, platformName, identities },
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
  bio: string
  platform: string | null
  platformName: string | null
  identities: Identity[]
}

const UserPage = ({
  userName,
  bio,
  platform,
  platformName,
  identities,
}: Props) => {
  return (
    <>
      <Head>
        <title>{`also: ${userName}`}</title>
      </Head>
      <div id={styles.container}>
        <div id={styles.details}>
          {platform && platformName ? (
            <p>
              We know <b>{platformName}</b>!
            </p>
          ) : null}
          <Field name="name">
            <p id="name">
              <b>{userName}</b>
            </p>
          </Field>
          {bio ? (
            <>
              <Field name="bio">
                <p id="bio">
                  <b>{bio}</b>
                </p>
              </Field>
            </>
          ) : null}
        </div>
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
