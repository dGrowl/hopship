import RemoveIdentityForm from './RemoveIdentityForm'
import UpdateIdentityForm from './UpdateIdentityForm'
import VerifyIdentityForm from './VerifyIdentityForm'

import styles from '../styles/IdentitySettings.module.css'

interface Props {
  platform: string
  name: string
  desc: string
  status: string
}

const IdentitySettings = ({ platform, name, desc, status }: Props) => {
  return (
    <article id={styles.container}>
      {status === 'VERIFIED' ? null : (
        <VerifyIdentityForm platform={platform} name={name} status={status} />
      )}
      <UpdateIdentityForm desc={desc} name={name} platform={platform} />
      <RemoveIdentityForm name={name} platform={platform} />
    </article>
  )
}

export default IdentitySettings
