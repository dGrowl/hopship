import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { useEffect } from 'react'
import Head from 'next/head'

import { arrayToFirstString, platforms } from '../lib/util'
import { MAX_PLATFORM_NAME_LENGTH, MAX_PLATFORM_LENGTH } from '../lib/safety'
import db from '../server/db'
import SearchForm from '../components/SearchForm'

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
      <b>{name}</b> on <b>{platform}</b> isn&apos;t registered here. If you know
      them, ask them to sign up!
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { platform, name } = processQuery(ctx.query)
  const result = await db.query(
    `
      SELECT u.name AS user_name
      FROM public.users u INNER JOIN public.identities i
        ON u.id = i.user_id
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
          destination: `/u/${userName}`,
          permanent: false,
        },
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
  let title = 'Also'
  if (platform && name) {
    title += `: ${platform}/${name}`
  }
  useEffect(() => {
    if (platform) {
      localStorage.setItem('platform', platform)
    }
    if (name) {
      localStorage.setItem('name', name)
    }
  })
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div id={styles.container}>
        <SearchForm platform={platform} name={name} />
        <section>
          <h2>:(</h2>
          <p>{errorMessage(platform, name)}</p>
        </section>
      </div>
    </>
  )
}

export default Results
