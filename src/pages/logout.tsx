import { GetServerSidePropsContext } from 'next'

import { buildCookie } from '../lib/util'

const cookies = [buildCookie('auth', 'none', 0), buildCookie('csrf', 'none', 0)]

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  ctx.res.setHeader('Set-Cookie', cookies)
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  }
}

const Logout = () => <></>

export default Logout
