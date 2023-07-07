import { Identity, VerificationDetails } from '../lib/types'
import RemoveIdentityForm from './RemoveIdentityForm'
import UpdateIdentityForm from './UpdateIdentityForm'
import VerifyIdentityForm from './VerifyIdentityForm'

import styles from '../styles/IdentitySettings.module.css'

interface Props {
  identity: Identity
  verification: VerificationDetails
}

const IdentitySettings = ({ identity, verification }: Props) => {
  return (
    <article id={styles.container}>
      {identity.status === 'VERIFIED' ? null : (
        <VerifyIdentityForm identity={identity} verification={verification} />
      )}
      <UpdateIdentityForm identity={identity} />
      <RemoveIdentityForm identity={identity} />
    </article>
  )
}

export default IdentitySettings
