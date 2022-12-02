import styles from '../styles/SearchForm.module.css'

interface SearchFormProps {
  platform: string | null
  id: string | null
}

const platforms = ['Twitch', 'Twitter']

export default function SearchForm(props: SearchFormProps) {
  const { platform, id } = props
  return (
    <form action="/results" className={styles.form}>
      <label>Platform</label>
      <select
        name="platform"
        key={platform ? 'default' : 'stored'}
        defaultValue={platform || platforms[0]}
      >
        {platforms.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <label>ID</label>
      <input name="id" defaultValue={id || ''} />
      <input type="submit" value="Search" />
    </form>
  )
}
