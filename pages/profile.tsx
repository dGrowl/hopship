import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import jwt, { JwtPayload } from 'jsonwebtoken'

interface AccountProps {
  tag: string
}

interface AuthPayload extends JwtPayload {
  tag: string
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
      return {
        props: { tag },
      }
    }
  } catch (err) {
    console.log(err)
  }
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  }
}

export default function Profile(props: AccountProps) {
  const { tag } = props
  return (
    <>
      <Head>
        <title>{`Also: ${tag}'s Profile`}</title>
      </Head>
      <div>Hello {tag}</div>
    </>
  )
}
