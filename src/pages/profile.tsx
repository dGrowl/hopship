import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { AuthPayload, Identity } from '../lib/types'
import db from '../lib/db'
import IdentitiesList from '../components/IdentitiesList'
import UpdatePasswordForm from '../components/UpdatePasswordForm'
import UpdateUserForm from '../components/UpdateUserForm'
import UserContext from '../components/UserContext'

import styles from '../styles/Profile.module.css'

interface Props {
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
          description AS desc,
          verified
        FROM public.get_user_identities($1)
        ORDER BY verified DESC, platform ASC, name ASC;
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

const Profile = ({ name, email, identities }: Props) => {
  return (
    <>
      <Head>
        <title>{`Also: ${name}'s Profile`}</title>
      </Head>
      <div id={styles.container}>
        <section>
          <h2>User</h2>
          <UpdateUserForm name={name} email={email} />
        </section>
        <section>
          <h2>Password</h2>
          <UpdatePasswordForm />
        </section>
        <section style={{ gridColumn: '1 / 3' }}>
          <h2>Identities</h2>
          <UserContext.Provider value={name}>
            <IdentitiesList identities={identities} editable />
          </UserContext.Provider>
        </section>
      </div>
    </>
  )
}

export default Profile
