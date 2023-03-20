import styles from '../styles/IdentityBox.module.css'

interface Props {
  platform: string
  name: string
  desc: string
  verified?: boolean
  editable?: boolean
}

const IdentityBox = ({ platform, name, desc, verified, editable }: Props) => {
  return (
    <div className={`${styles.container} ${styles[platform + 'Border']}`}>
      <div className={`${styles.platform} ${styles[platform]}`}>{platform}</div>
      <div className={styles.details}>
        <div className={styles.nameRow}>
          <h3>{name}</h3>
          {verified === false ? (
            <div className={styles.unverified}>UNVERIFIED</div>
          ) : null}
        </div>
        {desc.length > 0 ? <div>{desc}</div> : null}
      </div>
      {editable ? (
        <div className={styles.buttonColumn}>
          <button>C</button>
        </div>
      ) : null}
    </div>
  )
}

export default IdentityBox
