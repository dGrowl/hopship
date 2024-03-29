import { BsEmojiFrownFill } from 'react-icons/bs'
import { Metadata } from 'next'

import { getSpecificNetworkName, NETWORKS } from 'lib/util'
import { NETWORK_MAX_LENGTH, NETWORK_NAME_MAX_LENGTH } from 'lib/safety'
import { redirect } from 'next/navigation'
import db from 'lib/db'

import styles from 'styles/Results.module.css'

interface Params {
  network: string
  name: string
}

const processParams = (params: Params) => {
  let { network, name } = params
  network = network.slice(0, NETWORK_MAX_LENGTH)
  name = name.slice(0, NETWORK_NAME_MAX_LENGTH)
  name = name.replace(/[^\w]/g, '')
  return {
    network: NETWORKS.includes(network) ? network : null,
    name,
  }
}

interface Props {
  params: Params
}

export const generateMetadata = ({ params }: Props): Metadata => {
  const { network, name } = processParams(params)
  return {
    title:
      'hopship: ' +
      (network && name
        ? `${getSpecificNetworkName(network)}/${name}`
        : 'Results'),
  }
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

const fetchUser = async (network: string | null, networkName: string) => {
  if (!network || !networkName) {
    return null
  }
  try {
    const result = await db.query<{ user_name: string }>(
      `
        SELECT u.name AS user_name
        FROM public.users u
          INNER JOIN public.identities i
            ON u.id = i.user_id
        WHERE i.status = 'VERIFIED'
          AND i.network = $1
          AND i.name = $2;
      `,
      [network, networkName]
    )
    if (result.rowCount === 1) {
      const userName = result.rows[0]['user_name']
      return userName || null
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

const Results = async ({ params }: Props) => {
  const { network, name: networkName } = processParams(params)
  const userName = await fetchUser(network, networkName)
  return userName ? (
    redirect(`/u/${userName}`)
  ) : (
    <section id={styles.content}>
      <BsEmojiFrownFill />
      <p>{errorMessage(network, networkName)}</p>
    </section>
  )
}

export default Results
