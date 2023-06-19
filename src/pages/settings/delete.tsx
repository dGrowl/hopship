import { FormEvent, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { AuthPayload, CSRFFormFields } from '../../lib/types'
import { csrfHeaders } from '../../lib/util'
import { validateUserData } from '../../server/helpers'
import AntiCSRFForm from '../../components/AntiCSRFForm'
import SettingsContainer from '../../components/SettingsContainer'

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
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

type Fields = EventTarget &
  CSRFFormFields & {
    name: HTMLInputElement
  }

const submit = async (e: FormEvent) => {
  e.preventDefault()
  const { csrf, name } = e.target as Fields
  await fetch(`/api/users/${name.value}`, {
    method: 'DELETE',
    headers: csrfHeaders(csrf.value),
  })
  window.location.reload()
}

interface Props {
  name: string
}

const DeletionSettings = ({ name }: Props) => {
  const [invalid, setInvalid] = useState(true)
  return (
    <>
      <Head>
        <title>Also: Delete Account</title>
      </Head>
      <SettingsContainer active="Delete">
        <section>
          <p>
            WARNING: Account deletion is forever. We don&apos;t keep backups of
            your data. <em>Everything will be gone.</em>
          </p>
          <p>
            If you want to delete your account, enter your username below, then
            hit delete.
          </p>
          <AntiCSRFForm onSubmit={submit}>
            <input
              name="name"
              onChange={(e) => setInvalid(e.target.value !== name)}
              placeholder={name}
            />
            <button disabled={invalid}>delete</button>
          </AntiCSRFForm>
        </section>
      </SettingsContainer>
    </>
  )
}

export default DeletionSettings
