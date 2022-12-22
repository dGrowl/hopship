import PlatformSelector from './PlatformSelector'

import styles from '../styles/SearchForm.module.css'

interface SearchFormProps {
  platform: string | null
  id: string | null
}

export default function SearchForm(props: SearchFormProps) {
  const { platform, id } = props
  return (
    <form action="/results" className={styles.form}>
      <label>Platform</label>
      <PlatformSelector initial={platform} />
      <label>ID</label>
      <input name="id" defaultValue={id || ''} />
      <input type="submit" value="Search" />
    </form>
  )
}
