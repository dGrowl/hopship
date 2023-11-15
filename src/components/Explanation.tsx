import { ReactNode } from 'react'

import styles from 'styles/Explanation.module.css'

interface Props {
  cause: string
  children: ReactNode
  squaredTop?: boolean
}

const Explanation = ({ cause, children, squaredTop }: Props) => {
  const classes = [
    styles.container,
    squaredTop ? styles.squaredTop : null,
    styles[cause],
  ]
  return <div className={classes.join(' ')}>{children}</div>
}

export default Explanation
