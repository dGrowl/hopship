import { BsEmojiFrownFill } from 'react-icons/bs'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'

import {
  arrayToFirstString,
  getSpecificNetworkName,
  NETWORKS,
} from '../lib/util'
import { NETWORK_NAME_MAX_LENGTH, NETWORK_MAX_LENGTH } from '../lib/safety'
import db from '../lib/db'

import styles from '../styles/Results.module.css'

const processQuery = (query: ParsedUrlQuery) => {
  let network = arrayToFirstString(query.network || null)
  let name = arrayToFirstString(query.id || null)
  if (network) {
    network = network.slice(0, NETWORK_MAX_LENGTH)
    if (!NETWORKS.includes(network)) {
      network = null
    }
  }
  if (name) {
    name = name.slice(0, NETWORK_NAME_MAX_LENGTH)
    name = name.replace(/[^\w]/g, '')
  }
  return { network, name }
}

const errorMessage = (network: string | null, name: string | null) => {
  if (!network) {
    if (!name) {
      return `Neither the network nor the ID you searched for are valid search inputs. Try again!`
    }
    return `The network you tried to search isn't supported by our system. Try again!`
  } else if (!name) {
    return `The ID you tried to search for isn't valid. Try again!`
  }
  return (
    <>
      We don&apos;t know <b>{name}</b> from{' '}
      <b>{getSpecificNetworkName(network)}</b>. If you do, ask them to sign up!
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { network, name } = processQuery(ctx.query)
  if (network && name) {
    const result = await db.query(
      `
        SELECT u.name AS user_name
        FROM public.users u
          INNER JOIN public.identities i
            ON u.id = i.user_id
        WHERE i.status = 'VERIFIED'
          AND i.network = $1
          AND i.name = $2;
      `,
      [network, name]
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
  }
  return {
    props: { network, name },
  }
}

interface Props {
  network: string | null
  name: string | null
}

const Results = ({ network, name }: Props) => {
  return (
    <>
      <Head>
        <title>
          {`hopship: ${
            network && name
              ? `${getSpecificNetworkName(network)}/${name}`
              : 'Results'
          }`}
        </title>
      </Head>
      <section id={styles.content}>
        <BsEmojiFrownFill size={48} />
        <p>{errorMessage(network, name)}</p>
      </section>
    </>
  )
}

export default Results
