import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'

import { arrayToFirstString, platforms } from '../lib/util'
import { MAX_PLATFORM_NAME_LENGTH, MAX_PLATFORM_LENGTH } from '../lib/safety'
import db from '../lib/db'

import styles from '../styles/Results.module.css'

const processQuery = (query: ParsedUrlQuery) => {
  let platform = arrayToFirstString(query.platform || null)
  let name = arrayToFirstString(query.id || null)
  if (platform) {
    platform = platform.slice(0, MAX_PLATFORM_LENGTH)
    if (!platforms.includes(platform)) {
      platform = null
    }
  }
  if (name) {
    name = name.slice(0, MAX_PLATFORM_NAME_LENGTH)
    name = name.replace(/[^\w]/g, '')
  }
  return { platform, name }
}

const errorMessage = (platform: string | null, name: string | null) => {
  if (!platform) {
    if (!name) {
      return `The platform you gave isn't supported by our system and the name you gave isn't valid. Try again!`
    }
    return `The platform you gave isn't supported by our system. Try again!`
  } else if (!name) {
    return `The name you gave isn't valid. Try again!`
  }
  return (
    <>
      We don&apos;t know <b>{name}</b> from <b>{platform}</b>. If you do, ask
      them to sign up!
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { platform, name } = processQuery(ctx.query)
  if (platform && name) {
    const result = await db.query(
      `
        SELECT u.name AS user_name
        FROM public.users u
          INNER JOIN public.identities i
            ON u.id = i.user_id
        WHERE i.status = 'VERIFIED'
          AND i.platform = $1
          AND i.name = $2;
      `,
      [platform, name]
    )
    if (result.rowCount === 1) {
      const userName = result.rows[0]['user_name']
      if (userName) {
        return {
          redirect: {
            destination: `/u/${userName}?platform=${platform}&id=${name}`,
            permanent: false,
          },
        }
      }
    }
  }
  return {
    props: { platform, name },
  }
}

interface Props {
  platform: string | null
  name: string | null
}

const Results = ({ platform, name }: Props) => {
  return (
    <>
      <Head>
        <title>
          {`also: ${platform && name ? `${platform}//${name}` : 'Results'}`}
        </title>
      </Head>
      <section id={styles.content}>
        <h2>:(</h2>
        <p>{errorMessage(platform, name)}</p>
      </section>
    </>
  )
}

export default Results
