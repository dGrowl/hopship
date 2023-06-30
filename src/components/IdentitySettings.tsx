import RemoveIdentityForm from './RemoveIdentityForm'
import UpdateIdentityForm from './UpdateIdentityForm'
import VerifyIdentityForm from './VerifyIdentityForm'

import styles from '../styles/IdentitySettings.module.css'

interface Props {
  platform: string
  name: string
  desc: string
  verified: boolean
}

const IdentitySettings = ({ platform, name, desc, verified }: Props) => {
  return (
    <article id={styles.container}>
      {verified ? null : <VerifyIdentityForm platform={platform} name={name} />}
      <UpdateIdentityForm
        desc={desc}
        name={name}
        platform={platform}
        verified={verified}
      />
      <RemoveIdentityForm platform={platform} name={name} verified={verified} />
    </article>
  )
}

export default IdentitySettings
