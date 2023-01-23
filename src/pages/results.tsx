import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { useEffect } from 'react'
import Head from 'next/head'

import { Identity } from '../lib/types'
import db from '../lib/db'
import IdentitiesList from '../components/IdentitiesList'
import SearchForm from '../components/SearchForm'

import styles from '../styles/Results.module.css'

interface ResultsProps {
  platform: string | null
  name: string | null
  identities: Identity[]
}

const getConnectedIdentities = async (
  platform: string | null,
  name: string | null
) => {
  if (!platform || !name) return []
  try {
    const result = await db.query(
      `
        SELECT
          platform,
          name,
          description AS desc
        FROM public.get_connected_identities($1, $2)
        ORDER BY platform ASC, name ASC;
      `,
      [platform, name]
    )
    return result.rows
  } catch (error) {
    console.error(error)
  }
  return []
}

const processQuery = (query: ParsedUrlQuery) => {
  let platform = query.platform || null
  let name = query.id || null
  if (Array.isArray(platform)) {
    platform = platform.join()
  }
  if (Array.isArray(name)) {
    name = name.join()
  }
  return { platform, name }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context
  const { platform, name } = processQuery(query)
  const identities = await getConnectedIdentities(platform, name)
  return {
    props: { platform, name, identities },
  }
}

export default function Results(props: ResultsProps) {
  const { platform, name, identities } = props
  let title = 'Also'
  if (platform && name) {
    title += `: ${props.platform}/${props.name}`
  }
  useEffect(() => {
    if (platform && name) {
      localStorage.setItem('platform', platform)
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
          {identities.length !== 0 ? (
            <IdentitiesList identities={identities} />
          ) : (
            <>
              <h2>:(</h2>
              <p>
                {name} on {platform} isn&apos;t registered here. If you know
                them, ask them to sign up!
              </p>
            </>
          )}
        </section>
      </div>
    </>
  )
}
