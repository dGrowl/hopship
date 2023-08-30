import { InputHTMLAttributes, DetailedHTMLProps, useState } from 'react'

interface Props
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {
  pattern: string
}

export const ValidatedTextArea = ({
  pattern,
  defaultValue,
  ...props
}: Props) => {
  const [value, setValue] = useState(defaultValue || '')
  return (
    <textarea
      {...props}
      onChange={(e) =>
        e.target.value.match(pattern) ? setValue(e.target.value) : null
      }
      value={value}
    />
  )
}

export default ValidatedTextArea
