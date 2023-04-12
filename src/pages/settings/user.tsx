import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { AuthPayload } from '../../lib/types'
import db from './../../server/db'
import SettingsContainer from '../../components/SettingsContainer'
import UpdateUserForm from '../../components/UpdateUserForm'

const getBio = async (payload: AuthPayload) => {
  const { name, email } = payload
  const result = await db.query(
    `
      SELECT u.bio
      FROM public.users u
      WHERE u.name = $1
        AND u.email = $2;
    `,
    [name, email]
  )
  return result.rowCount === 1 ? result.rows[0].bio : null
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { auth: token } = ctx.req.cookies

  try {
    if (!process.env.JWT_AUTH_SECRET) {
      throw 'Environment is missing JWT secret'
    }
    if (token) {
      const payload = jwt.verify(
        token,
        process.env.JWT_AUTH_SECRET
      ) as AuthPayload
      const bio = await getBio(payload)
      if (!bio) {
        return {
          redirect: {
            destination: '/logout',
            permanent: false,
          },
        }
      }
      return { props: { ...payload, bio } }
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

interface Props {
  name: string
  email: string
  bio: string
}

const UserSettings = (props: Props) => {
  return (
    <>
      <Head>
        <title>Also: Update User Data</title>
      </Head>
      <SettingsContainer active="User">
        <UpdateUserForm {...props} />
      </SettingsContainer>
    </>
  )
}

export default UserSettings
