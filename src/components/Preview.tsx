import { BsArrowReturnRight } from 'react-icons/bs'
import { ReactNode } from 'react'

import styles from '../styles/Preview.module.css'

interface Props {
  children: ReactNode
}

const Preview = ({ children }: Props) => (
  <div className={styles.preview}>
    <BsArrowReturnRight strokeWidth={1} />
    <span>{children}</span>
  </div>
)

export default Preview
