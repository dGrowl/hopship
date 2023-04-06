import { GetServerSidePropsContext } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { AuthPayload, Identity } from '../../lib/types'
import { validateUserData } from '../../server/helpers'
import db from '../../server/db'
import IdentityBox, { AddIdentityBox } from '../../components/IdentityBox'
import SettingsContainer from '../../components/SettingsContainer'

import styles from '../../styles/Settings.module.css'

const getUserIdentities = async (userName: string) => {
  try {
    const result = await db.query(
      `
        WITH i AS (
          SELECT *, true AS verified
          FROM public.identities
          UNION ALL
          SELECT *, false AS verified
          FROM public.unverified_identities
        )
        SELECT
          i.platform,
          i.name,
          i.description AS desc,
          i.verified
        FROM i INNER JOIN public.users u
          ON u.id = i.user_id
            AND u.name = $1;
      `,
      [userName]
    )
    return result.rows
  } catch (error) {
    console.error(error)
  }
  return []
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
      if (!(await validateUserData(payload))) {
        return {
          redirect: {
            destination: '/logout',
            permanent: false,
          },
        }
      }
      const identities = await getUserIdentities(payload.name)
      return {
        props: { identities },
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
  identities: Identity[]
}

const IdentitiesSettings = ({ identities }: Props) => {
  const [addMode, setAddMode] = useState(false)
  return (
    <>
      <Head>
        <title>Also: Modify Identities</title>
      </Head>
      <SettingsContainer active="Identities">
        <section>
          <div id={styles.identities}>
            {identities.map((i) => (
              <IdentityBox key={i.platform + i.name} {...i} editable />
            ))}
            {addMode ? (
              <AddIdentityBox close={() => setAddMode(false)} />
            ) : (
              <button onClick={() => setAddMode(true)}>new</button>
            )}
          </div>
        </section>
      </SettingsContainer>
    </>
  )
}

export default IdentitiesSettings
