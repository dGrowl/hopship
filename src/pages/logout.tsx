import { GetServerSidePropsContext } from 'next'

import { buildCookie } from '../lib/util'

const cookie = buildCookie('auth', 'none', 0)

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  ctx.res.setHeader('Set-Cookie', cookie)
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  }
}

const Logout = () => <></>

export default Logout
