import { BsEye, BsEyeSlash } from 'react-icons/bs'
import { InputHTMLAttributes, DetailedHTMLProps, useState } from 'react'

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from 'lib/safety'
import FallibleInput from './FallibleInput'

import styles from 'styles/PasswordInput.module.css'

interface Props
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  autoComplete: string
  badValue?: string
}

const PasswordInput = ({ badValue, ...props }: Props) => {
  const [readable, setReadable] = useState(false)
  const inputProps = {
    ...props,
    style: { paddingRight: '36px' },
    maxLength: PASSWORD_MAX_LENGTH,
    minLength: PASSWORD_MIN_LENGTH,
    required: true,
    type: readable ? 'text' : 'password',
  }
  const eyeProps = {
    size: 24,
    strokeWidth: 0.35,
    className: styles.toggleReadable,
    onClick: () => setReadable((s) => !s),
  }
  return (
    <>
      {badValue === undefined ? (
        <input {...inputProps} />
      ) : (
        <FallibleInput badValue={badValue} {...inputProps} />
      )}
      {readable ? <BsEye {...eyeProps} /> : <BsEyeSlash {...eyeProps} />}
    </>
  )
}

export default PasswordInput
