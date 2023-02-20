import styles from '../styles/IdentityBox.module.css'

interface Props {
  platform: string
  name: string
  desc: string
}

const IdentityBox = ({ platform, name, desc }: Props) => {
  return (
    <div className={`${styles.container} ${styles[platform + 'Border']}`}>
      <div className={`${styles.platform} ${styles[platform]}`}>{platform}</div>
      <div className={styles.details}>
        <h3>{name}</h3>
        {desc.length > 0 ? <div>{desc}</div> : null}
      </div>
    </div>
  )
}

export default IdentityBox
