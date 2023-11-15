import { BsMoonFill, BsRocketFill, BsStars } from 'react-icons/bs'

import styles from 'styles/App.module.css'

const backdrop = (
  <div id={styles.backdrop}>
    <BsMoonFill id={styles.moon} />
    <BsStars id={styles.stars} />
    <BsRocketFill id={styles.ship} />
  </div>
)

export default backdrop
