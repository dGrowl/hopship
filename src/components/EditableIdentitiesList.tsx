import { useState } from 'react'

import { Identity } from '../lib/types'
import IdentityBox, { AddIdentityBox } from '../components/IdentityBox'

import styles from '../styles/EditableIdentitiesList.module.css'

interface Props {
  identities: Identity[]
}

const EditableIdentitiesList = ({ identities }: Props) => {
  const [addMode, setAddMode] = useState(false)
  return (
    <section>
      <div id={styles.content}>
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
  )
}

export default EditableIdentitiesList
