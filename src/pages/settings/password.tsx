import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { AuthPayload } from '../../lib/types'
import { validateUserData } from '../../server/helpers'
import SettingsContainer from '../../components/SettingsContainer'
import UpdatePasswordForm from '../../components/UpdatePasswordForm'

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
      if (!(await validateUserData(payload))) {
        return {
          redirect: {
            destination: '/logout',
            permanent: false,
          },
        }
      }
      return {
        props: { name: payload.name },
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

interface Props {
  name: string
}

const PasswordSettings = ({ name }: Props) => {
  return (
    <>
      <Head>
        <title>Also: Change Password</title>
      </Head>
      <SettingsContainer active="Password">
        <UpdatePasswordForm name={name} />
      </SettingsContainer>
    </>
  )
}

export default PasswordSettings
