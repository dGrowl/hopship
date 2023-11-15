import { memo, ReactNode } from 'react'

import styles from 'styles/Field.module.css'

interface Props {
  name: string
  label?: string
  children: ReactNode
}

const Field = memo(function Field({ name, label, children }: Props) {
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label || name}</label>
      <div className={styles.in}>{children}</div>
    </div>
  )
})

export default Field
