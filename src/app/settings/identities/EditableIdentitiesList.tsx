'use client'

import { BsExclamationCircle } from 'react-icons/bs'
import { Dispatch, useState } from 'react'
import Link from 'next/link'

import { Identity } from 'lib/types'
import Explanation from 'components/Explanation'
import IdentityBox, { AddIdentityBox } from 'components/IdentityBox'

import styles from 'styles/EditableIdentitiesList.module.css'

const getLastElement = (
  addMode: boolean,
  setAddMode: Dispatch<boolean>,
  nIdentities: number
) => {
  if (addMode) {
    if (nIdentities >= 6) {
      return (
        <Explanation cause="error">
          <BsExclamationCircle />
          <span>
            Users are currently limited to 6 identities. If you&apos;ve hit this
            limit, reach out{' '}
            <Link className="underline" href="/about/contact">
              here
            </Link>{' '}
            and tell us about your needs!
          </span>
        </Explanation>
      )
    }
    return <AddIdentityBox close={() => setAddMode(false)} />
  }
  return <button onClick={() => setAddMode(true)}>new</button>
}

interface Props {
  identities: Identity[]
}

const EditableIdentitiesList = ({ identities }: Props) => {
  const [addMode, setAddMode] = useState(identities.length === 0)
  return (
    <section>
      <div id={styles.content}>
        {identities.map((i) => (
          <IdentityBox key={i.network + i.name} {...i} editable />
        ))}
        {identities.length === 0
          ? "We don't know about any of your identities yet! Start by adding your first one using the form below."
          : null}
        {getLastElement(addMode, setAddMode, identities.length)}
      </div>
    </section>
  )
}

export default EditableIdentitiesList
