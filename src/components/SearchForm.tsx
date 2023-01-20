import Field from './Field'
import PlatformSelector from './PlatformSelector'

import styles from '../styles/SearchForm.module.css'

interface SearchFormProps {
  platform: string | null
  name: string | null
}

export default function SearchForm(props: SearchFormProps) {
  const { platform, name } = props
  return (
    <section>
      <form action="/results" className={styles.form}>
        <div className={styles.fields}>
          <Field name="platform">
            <PlatformSelector initial={platform} />
          </Field>
          <Field name="id">
            <input name="id" defaultValue={name || ''} />
          </Field>
        </div>
        <button>search</button>
      </form>
    </section>
  )
}
