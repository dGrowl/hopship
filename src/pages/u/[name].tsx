import { BsBookHalf, BsPersonHeart, BsPersonVcard } from 'react-icons/bs'
import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'

import { arrayToFirstString } from '../../lib/util'
import { Identity } from '../../lib/types'
import { MAX_USER_NAME_LENGTH } from '../../lib/safety'
import db from '../../lib/db'
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
  if (userName && userName.length > MAX_USER_NAME_LENGTH) {
    userName = null
  }
  return { userName }
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { query } = ctx
  const { userName } = processQuery(query)
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
    props: { userName, bio, identities },
  }
}

const buildRows = (identities: Identity[]) =>
  identities.map((i) => <IdentityBox key={i.platform + i.name} {...i} />)

interface NoIdentitiesProps {
  userName: string
}

const NoIdentities = ({ userName }: NoIdentitiesProps) => {
  return (
    <>
      <p>{userName} hasn&apos;t verified any identities yet. :(</p>
      <p>If you know them, tell them that they should!</p>
    </>
  )
}

interface Props {
  userName: string
  bio: string
  identities: Identity[]
}

const UserPage = ({
  userName,
  bio,
  identities,
}: Props) => {
  return (
    <>
      <Head>
        <title>{`also: ${userName}`}</title>
      </Head>
      <dl id={styles.container}>
        <dt className={styles.label}>
          <BsPersonHeart size={24} />
          name
        </dt>
        <dd>
          <h2>{userName}</h2>
        </dd>
        {bio ? (
          <>
            <dt className={styles.label}>
              <BsBookHalf size={24} />
              biography
            </dt>
            <dd id={styles.bio}>{bio}</dd>
          </>
        ) : null}
        <dt className={`${styles.label} ${styles.wide}`}>
          <BsPersonVcard size={24} />
          identities
        </dt>
        <dd className={styles.wide}>
          {identities.length > 0 ? (
            <section>
              <div id={styles.identities}>{buildRows(identities)}</div>
            </section>
          ) : (
            <NoIdentities userName={userName} />
          )}
        </dd>
      </dl>
    </>
  )
}

export default UserPage
