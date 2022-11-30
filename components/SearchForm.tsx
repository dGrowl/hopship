import styles from '../styles/SearchForm.module.css'

interface SearchFormProps {
  platform: string | null
  id: string | null
}

const platforms = ['Twitch', 'Twitter']

const buildPlatformSelector = (platform: string | null) => {
  const selected = platform ? platform.toLowerCase() : 'twitter'
  return (
    <select name="platform" defaultValue={selected}>
      {platforms.map((p) => {
        const value = p.toLowerCase()
        return (
          <option key={value} value={value}>
            {p}
          </option>
        )
      })}
    </select>
  )
}

export default function SearchForm(props: SearchFormProps) {
  const { platform, id } = props
  return (
    <form className={styles.form}>
      <label>Platform</label>
      {buildPlatformSelector(platform)}
      <label>ID</label>
      <input name="id" defaultValue={id || ''} />
      <input type="submit" value="Search" />
    </form>
  )
}
