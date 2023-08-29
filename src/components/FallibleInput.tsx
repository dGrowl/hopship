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

const FallibleInput = ({ badValue, children, onChange, ...props }: Props) => {
  const [value, setValue] = useState('')
  const hasError = badValue && value === badValue
  return (
    <>
      <input
        {...props}
        className={hasError ? styles.badInput : ''}
        onChange={(e) => {
          onChange ? onChange(e) : null
          setValue(e.target.value)
        }}
      />
      {hasError ? (
        <div className={styles.explanation}>
          <BsExclamationCircle size={24} strokeWidth={0.75} />
          {children}
        </div>
      ) : null}
    </>
  )
}

export default FallibleInput
