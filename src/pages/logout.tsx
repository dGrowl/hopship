import { GetServerSidePropsContext } from 'next'

const cookie = [
  `auth=0`,
  `Expires=${new Date(0)}`,
  'HttpOnly',
  'Secure',
  'Path=/',
  'SameSite=Lax',
].join('; ')

export async function getServerSideProps(context: GetServerSidePropsContext) {
  context.res.setHeader('Set-Cookie', cookie)
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  }
}

const Logout = () => <></>

export default Logout
