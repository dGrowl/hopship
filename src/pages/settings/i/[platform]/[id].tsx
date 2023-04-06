import { GetServerSidePropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { arrayToFirstString, platforms } from '../../../../lib/util'
import { AuthPayload } from '../../../../lib/types'
import { validateUserData } from '../../../../server/helpers'
import {
  MAX_PLATFORM_LENGTH,
  MAX_PLATFORM_NAME_LENGTH,
} from '../../../../lib/safety'
import db from '../../../../server/db'
import RemoveIdentityForm from '../../../../components/RemoveIdentityForm'
import SettingsContainer from '../../../../components/SettingsContainer'
import UpdateIdentityForm from '../../../../components/UpdateIdentityForm'
import VerificationForm from '../../../../components/VerificationForm'

const processQuery = (query: ParsedUrlQuery) => {
  let platform = arrayToFirstString(query.platform || null)
  let name = arrayToFirstString(query.id || null)
  if (platform) {
    platform = platform.slice(0, MAX_PLATFORM_LENGTH)
    if (!platforms.includes(platform)) {
      platform = null
    }
  }
  if (name) {
    name = name.slice(0, MAX_PLATFORM_NAME_LENGTH)
    name = name.replace(/[^\w]/g, '')
  }
  return { platform, name }
}

const getIdentityData = async (
  userName: string,
  platform: string,
  platformName: string
) => {
  const result = await db.query(
    `
      WITH i AS (
        SELECT *, true AS verified
        FROM public.identities
        UNION ALL
        SELECT *, false AS verified
        FROM public.unverified_identities
      )
      SELECT description AS desc, verified
      FROM i INNER JOIN public.users u
        ON u.id = i.user_id
          AND u.name = $1
          AND i.platform = $2
          AND i.name = $3;
    `,
    [userName, platform, platformName]
  )
  return result.rows
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { query } = ctx
  const { platform, name } = processQuery(query)
  if (!platform || !name) {
    return {
      redirect: {
        destination: `/settings`,
        permanent: false,
      },
    }
  }
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
      const result = await getIdentityData(payload.name, platform, name)
      if (result.length !== 1) {
        throw {
          message: 'Unexpected number of matching identities',
          result,
        }
      }
      const { desc, verified } = result[0]
      return {
        props: { platform, name, desc, verified },
      }
    }
  } catch (error) {
    console.log(error)
  }

  return {
    redirect: {
      destination: `/settings`,
      permanent: false,
    },
  }
}

interface Props {
  platform: string
  name: string
  desc: string
  verified: boolean
}

const IdentitySettings = ({ platform, name, desc, verified }: Props) => {
  return (
    <>
      <Head>
        <title>{`Also: ${platform} // ${name}`}</title>
      </Head>
      <SettingsContainer active={`${platform}/${name}`}>
        {verified ? null : (
          <>
            <h2>Verify</h2>
            <VerificationForm platform={platform} name={name} />
          </>
        )}
        <h2>Edit</h2>
        <UpdateIdentityForm
          platform={platform}
          name={name}
          verified={verified}
          desc={desc}
        />
        <h2>Remove</h2>
        <RemoveIdentityForm
          platform={platform}
          name={name}
          verified={verified}
        />
      </SettingsContainer>
    </>
  )
}

export default IdentitySettings
