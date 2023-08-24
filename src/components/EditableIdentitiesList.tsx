import { useState } from 'react'

import { Identity } from '../lib/types'
import IdentityBox, { AddIdentityBox } from '../components/IdentityBox'

import styles from '../styles/EditableIdentitiesList.module.css'

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
        {addMode ? (
          <AddIdentityBox close={() => setAddMode(false)} />
        ) : (
          <button onClick={() => setAddMode(true)}>new</button>
        )}
      </div>
    </section>
  )
}

export default EditableIdentitiesList
