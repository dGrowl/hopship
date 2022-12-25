import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { AuthPayload, Identity } from '../lib/types'
import AddIdentityForm from '../components/AddIdentityForm'
import db from '../lib/db'
import IdentitiesList from '../components/IdentitiesList'

interface ProfileProps {
  name: string
  email: string
  identities: Identity[]
}

const getUserIdentities = async (user_name: string) => {
  try {
    const result = await db.query(
      `
        SELECT
          platform,
          name,
          description AS desc
        FROM public.get_user_identities($1)
        ORDER BY platform ASC, name ASC;
      `,
      [user_name]
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
      const { name, email } = payload
      const identities = await getUserIdentities(name)
      return {
        props: { name, email, identities },
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

export default function Profile(props: ProfileProps) {
  const { name, email, identities } = props
  return (
    <>
      <Head>
        <title>{`Also: ${name}'s Profile`}</title>
      </Head>
      <section>
        Email: <input type="email" defaultValue={email} />
        Name: <input defaultValue={name} /> https://also.domain/u/{name}
        Password: Old: <input type="password" />
        New: <input type="password" />
        New Again: <input type="password" />
      </section>
      <section>
        {buildIdentitiesList(identities)}
        <AddIdentityForm user_name={name} />
      </section>
    </>
  )
}
