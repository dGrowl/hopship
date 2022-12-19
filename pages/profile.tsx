import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { AuthPayload, Identity } from '../lib/types'
import db from '../lib/db'
import IdentitiesList from '../components/IdentitiesList'

interface AccountProps {
  tag: string
  identities: Identity[]
}

const getUserIdentities = async (user_tag: string) => {
  try {
    const result = await db.query(
      `
        SELECT
          platform_tag AS platform,
          tag          AS id,
          description  AS desc
        FROM public.get_identities($1);
      `,
      [user_tag]
    )
    return result.rows
  } catch (error) {
    console.error(error)
  }
  return []
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { auth: token } = context.req.cookies

  try {
    if (!process.env.JWT_AUTH_SECRET) {
      throw 'Environment is missing JWT secret'
    }
    if (token) {
      const payload = jwt.verify(
        token,
        process.env.JWT_AUTH_SECRET
      ) as AuthPayload
      const { tag } = payload
      const identities = await getUserIdentities(tag)
      return {
        props: { tag, identities },
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

const buildIdentitiesList = (identities: Identity[]) => {
  if (identities.length === 0) {
    return <div>You haven&apos;t added any identities yet!</div>
  }
  return <IdentitiesList identities={identities} editable />
}

export default function Profile(props: AccountProps) {
  const { tag, identities } = props
  return (
    <>
      <Head>
        <title>{`Also: ${tag}'s Profile`}</title>
      </Head>
      <section>
        Email: <input type="email" />
        Tag: <input defaultValue={tag} /> https://also.domain/u/{tag}
        Password: Old: <input type="password" />
        New: <input type="password" />
        New Again: <input type="password" />
      </section>
      <section>{buildIdentitiesList(identities)}</section>
    </>
  )
}
