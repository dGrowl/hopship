import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { useEffect } from 'react'
import Head from 'next/head'

import { Identity } from '../lib/types'
import db from '../lib/db'
import IdentitiesList from '../components/IdentitiesList'
import SearchForm from '../components/SearchForm'

interface ResultsProps {
  platform: string | null
  id: string | null
  identities: Identity[]
}

const getConnectedIdentities = async (
  platform: string | null,
  id: string | null
) => {
  if (!platform || !id) return []
  try {
    const results = await db.query(
      `
        SELECT
          platform_tag AS platform,
          tag          AS id,
          description  AS desc
        FROM public.get_identities($1, $2);
      `,
      [platform, id]
    )
    return results.rows
  } catch (error) {
    console.error(error)
    return []
  }
}

const processQuery = (query: ParsedUrlQuery) => {
  let platform = query.platform || null
  let id = query.id || null
  if (Array.isArray(platform)) {
    platform = platform.join()
  }
  if (Array.isArray(id)) {
    id = id.join()
  }
  return { platform, id }
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { query } = context
  const { platform, id } = processQuery(query)
  const identities = await getConnectedIdentities(platform, id)
  return {
    props: { platform, id, identities },
  }
}

export default function Results(props: ResultsProps) {
  const { platform, id, identities } = props
  let title = 'Also'
  if (platform && id) {
    title += `: ${props.platform}/${props.id}`
  }
  useEffect(() => {
    if (platform && id) {
      localStorage.setItem('platform', platform)
      localStorage.setItem('id', id)
    }
  })
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <SearchForm platform={platform} id={id} />
      <IdentitiesList identities={identities} />
    </>
  )
}
