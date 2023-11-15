import { BsExclamationCircle } from 'react-icons/bs'
import { InputHTMLAttributes, DetailedHTMLProps, useState } from 'react'

import Explanation from './Explanation'

import styles from 'styles/FallibleInput.module.css'

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
        <Explanation squaredTop={true} cause="error">
          <BsExclamationCircle />
          {children}
        </Explanation>
      ) : null}
    </div>
  )
}

export default FallibleInput
