import { BsExclamationCircle } from 'react-icons/bs'
import { InputHTMLAttributes, DetailedHTMLProps, useState } from 'react'

import styles from '../styles/FallibleInput.module.css'

interface Props
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  badValue: string
}

const FallibleInput = ({
  badValue,
  children,
  defaultValue,
  onChange,
  ...props
}: Props) => {
  const [value, setValue] = useState(defaultValue || '')
  const hasError = badValue && value === badValue
  return (
    <div className={styles.container}>
      <input
        {...props}
        className={hasError ? styles.badInput : ''}
        onChange={(e) => {
          onChange ? onChange(e) : null
          setValue(e.target.value)
        }}
        value={value}
      />
      {hasError ? (
        <div className={styles.explanation}>
          <BsExclamationCircle size={24} strokeWidth={0.75} />
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default FallibleInput
