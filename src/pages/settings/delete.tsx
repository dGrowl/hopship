import { FormEvent, useState } from 'react'
import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import jwt from 'jsonwebtoken'

import { AuthPayload, CSRFFormFields } from '../../lib/types'
import { csrfHeaders } from '../../lib/util'
import { useCSRFCode } from '../../lib/safety'
import { validateUserData } from '../../server/helpers'
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

type Fields = EventTarget & CSRFFormFields

const submit = async (e: FormEvent) => {
  e.preventDefault()
  const { csrf } = e.target as Fields
  await fetch('/api/users', {
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
  const csrfCode = useCSRFCode()
  return (
    <>
      <Head>
        <title>Also: Delete Account</title>
      </Head>
      <SettingsContainer active="Delete">
        <section>
          <p>
            WARNING: Account deletion is forever. We don&apos;t keep backups of
            your data. <b>Everything will be gone.</b>
          </p>
          <p>
            If you want to delete your account, enter your username below, then
            hit delete.
          </p>
          <form onSubmit={submit}>
            <fieldset>
              <input name="csrf" type="hidden" value={csrfCode} readOnly />
              <input
                placeholder={name}
                onChange={(e) => setInvalid(e.target.value !== name)}
              />
              <button disabled={invalid}>delete</button>
            </fieldset>
          </form>
        </section>
      </SettingsContainer>
    </>
  )
}

export default DeletionSettings
