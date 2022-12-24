import PlatformSelector from './PlatformSelector'

import styles from '../styles/SearchForm.module.css'

interface SearchFormProps {
  platform: string | null
  name: string | null
}

export default function SearchForm(props: SearchFormProps) {
  const { platform, name } = props
  return (
    <form action="/results" className={styles.form}>
      <label>Platform</label>
      <PlatformSelector initial={platform} />
      <label>ID</label>
      <input name="id" defaultValue={name || ''} />
      <input type="submit" value="Search" />
    </form>
  )
}
